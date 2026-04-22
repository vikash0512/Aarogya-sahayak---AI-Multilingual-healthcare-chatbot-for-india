"""
Document processing pipeline: Parse → Chunk → Embed → Store in Vector DB.
"""
import os
import uuid
import json
import logging
import traceback
from pathlib import Path

from django.conf import settings
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

# Cache the embedding model globally to avoid re-downloading
_embedding_model = None


def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text content from various file formats."""
    file_type = file_type.lower()

    if file_type == 'txt':
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    elif file_type == 'json':
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
            # Handle various JSON structures
            if isinstance(data, list):
                texts = []
                for item in data:
                    if isinstance(item, dict):
                        texts.append(' '.join(str(v) for v in item.values()))
                    else:
                        texts.append(str(item))
                return '\n\n'.join(texts)
            elif isinstance(data, dict):
                return ' '.join(str(v) for v in data.values())
            return str(data)

    elif file_type == 'pdf':
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text = ''
            for page in reader.pages:
                text += page.extract_text() or ''
                text += '\n\n'
            return text
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise

    elif file_type in ('docx', 'doc'):
        try:
            from docx import Document as DocxDocument
            doc = DocxDocument(file_path)
            return '\n\n'.join([para.text for para in doc.paragraphs if para.text.strip()])
        except Exception as e:
            logger.error(f"DOCX extraction failed: {e}")
            raise

    elif file_type == 'csv':
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    else:
        # Fallback: try reading as text
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()


def chunk_text(text: str, chunk_size: int = 512, chunk_overlap: int = 50) -> list:
    """Split text into chunks using recursive character splitter."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(text)
    return chunks


def get_embedding_model():
    """Load the sentence-transformer model for generating embeddings. Cached globally."""
    global _embedding_model
    if _embedding_model is None:
        logger.info("Loading embedding model all-MiniLM-L6-v2 (first time, may take ~30s)...")
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("Embedding model loaded successfully.")
    return _embedding_model


def process_document(document_id: int):
    """Full pipeline: extract text → chunk → embed → store in ChromaDB."""
    from .models import Document, DocumentChunk

    doc = Document.objects.get(id=document_id)
    doc.status = 'processing'
    doc.error_message = ''
    doc.save()

    try:
        # Step 1: Extract text
        logger.info(f"[{doc.name}] Step 1/4: Extracting text...")
        file_path = doc.file.path
        file_type = doc.file_type.lower() if doc.file_type else (doc.name.rsplit('.', 1)[-1].lower() if '.' in doc.name else 'txt')
        text = extract_text_from_file(file_path, file_type)

        if not text.strip():
            raise ValueError("No text content could be extracted from the file.")

        logger.info(f"[{doc.name}] Extracted {len(text)} characters of text.")

        # Step 2: Chunk
        logger.info(f"[{doc.name}] Step 2/4: Splitting into chunks (size={doc.chunk_size})...")
        chunks = chunk_text(text, chunk_size=doc.chunk_size)

        if not chunks:
            raise ValueError("Text splitting produced no chunks.")

        logger.info(f"[{doc.name}] Created {len(chunks)} chunks.")

        # Step 3: Generate embeddings in batches to keep large datasets memory-friendly.
        logger.info(f"[{doc.name}] Step 3/4: Generating embeddings for {len(chunks)} chunks...")
        model = get_embedding_model()

        batch_size = 32
        from .vector_store import VectorStoreFactory
        store = VectorStoreFactory.get_store()

        # Clear old chunks once before we stream new batches in.
        store.delete_for_document(doc.id)
        DocumentChunk.objects.filter(document=doc).delete()

        processed_chunks = 0
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            batch_embeddings = model.encode(batch).tolist()
            logger.info(f"[{doc.name}] Embedded batch {i // batch_size + 1}/{(len(chunks) - 1) // batch_size + 1}")
            if hasattr(store, 'connection'):
                store.add_chunks_batch(doc, batch, batch_embeddings, user_id=doc.user_id, start_index=i)
            else:
                store.add_chunks_batch(doc, batch, batch_embeddings, start_index=i)
            processed_chunks += len(batch)

        logger.info(f"[{doc.name}] All embeddings generated and stored.")

        # Step 4: Finalize document status.
        logger.info(f"[{doc.name}] Step 4/4: Finalizing document status...")

        # Update document status
        doc.chunk_count = processed_chunks
        doc.status = 'indexed'
        doc.error_message = ''
        doc.save()

        logger.info(f"✅ Document '{doc.name}' processed: {len(chunks)} chunks created and stored.")
        return True

    except Exception as e:
        doc.status = 'failed'
        doc.error_message = str(e)[:500]
        doc.save()
        logger.error(f"❌ Document processing failed for '{doc.name}': {e}")
        logger.error(traceback.format_exc())
        return False


def enqueue_document_processing(document_id: int):
    """Create or reuse a durable processing job for the document."""
    from .models import Document, DocumentIngestionJob

    doc = Document.objects.get(id=document_id)
    job, _ = DocumentIngestionJob.objects.get_or_create(document=doc)
    if job.status in {'queued', 'processing'}:
        doc.status = 'queued'
        doc.error_message = ''
        doc.save(update_fields=['status', 'error_message'])
        return job

    previous_status = job.status
    job.status = 'queued'
    job.error_message = ''
    job.started_at = None
    job.finished_at = None
    if previous_status == 'failed':
        job.attempts = 0
    job.save()

    doc.status = 'queued'
    doc.error_message = ''
    doc.save(update_fields=['status', 'error_message'])
    return job
