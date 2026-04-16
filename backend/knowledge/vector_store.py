"""
Vector Store abstraction.
Supports ChromaDB (local disk) and pgvector (Supabase).
"""
import os
import logging
from django.conf import settings
from .models import DocumentChunk
import uuid

logger = logging.getLogger(__name__)


class VectorStoreFactory:
    @staticmethod
    def get_store():
        from config.models import VectorDBConfig
        config = VectorDBConfig.load()
        if config.provider == 'pgvector':
            return PgVectorStore()
        return ChromaStore()


class ChromaStore:
    def __init__(self):
        import chromadb
        persist_dir = settings.CHROMA_PERSIST_DIR
        os.makedirs(persist_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def delete_for_document(self, document_id: int):
        try:
            existing = self.collection.get(where={"document_id": str(document_id)})
            if existing and existing['ids']:
                self.collection.delete(ids=existing['ids'])
        except Exception as e:
            logger.warning(f"ChromaStore delete error: {e}")

    def add_chunks(self, document, chunks: list, embeddings: list):
        ids = []
        metadatas = []
        documents_text = []

        for i, (chunk_text, _) in enumerate(zip(chunks, embeddings)):
            vector_id = f"doc_{document.id}_chunk_{i}_{uuid.uuid4().hex[:8]}"
            ids.append(vector_id)
            metadatas.append({
                "document_id": str(document.id),
                "document_name": document.name,
                "chunk_index": i,
                "source_authority": document.source_authority,
            })
            documents_text.append(chunk_text)

            DocumentChunk.objects.create(
                document=document,
                content=chunk_text,
                chunk_index=i,
                token_count=len(chunk_text.split()),
                vector_id=vector_id,
                metadata={"source": document.name, "authority": document.source_authority}
            )

        chroma_batch = 100
        for start in range(0, len(ids), chroma_batch):
            end = start + chroma_batch
            self.collection.add(
                ids=ids[start:end],
                embeddings=embeddings[start:end],
                documents=documents_text[start:end],
                metadatas=metadatas[start:end],
            )

    def search(self, query_embedding: list, top_k: int, threshold: float):
        if self.collection.count() == 0:
            return []

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=min(top_k, self.collection.count()),
            include=["documents", "distances", "metadatas"]
        )

        contexts = []
        if results and results['documents'] and results['documents'][0]:
            for doc, distance, metadata in zip(
                results['documents'][0],
                results['distances'][0],
                results['metadatas'][0]
            ):
                similarity = 1 - distance
                if similarity >= threshold:
                    contexts.append({
                        'text': doc,
                        'similarity': round(similarity, 3),
                        'source': metadata.get('document_name', 'Unknown'),
                        'chunk_index': metadata.get('chunk_index', 0),
                    })
        return contexts


class PgVectorStore:
    """Uses Supabase PostgreSQL raw SQL to interact with pgvector."""
    
    def __init__(self):
        from django.db import connection
        self.connection = connection
        self._ensure_table()

    def _ensure_table(self):
        """Ensure pgvector extension and vector table exist."""
        # Note: We must be connected to PostgreSQL!
        if self.connection.vendor != 'postgresql':
            logger.warning("PgVectorStore requires PostgreSQL. Current DB is not PostgreSQL.")
            return

        with self.connection.cursor() as cursor:
            # Enable extension
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            # Create our dynamic vector table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS knowledge_vector_store (
                    id bigserial PRIMARY KEY,
                    document_id bigint NOT NULL,
                    document_name text,
                    chunk_index integer,
                    source_authority text,
                    content text,
                    embedding vector(384),
                    user_id bigint
                );
            """)
            # Try to add user_id column if it doesn't exist (for existing tables)
            try:
                cursor.execute("ALTER TABLE knowledge_vector_store ADD COLUMN IF NOT EXISTS user_id bigint;")
            except Exception:
                pass

    def delete_for_document(self, document_id: int):
        if self.connection.vendor != 'postgresql':
            return
        with self.connection.cursor() as cursor:
            cursor.execute("DELETE FROM knowledge_vector_store WHERE document_id = %s;", [document_id])

    def add_chunks(self, document, chunks: list, embeddings: list, user_id: int = None):
        if self.connection.vendor != 'postgresql':
            raise Exception("Cannot add chunks to pgvector: DB is not PostgreSQL.")
            
        with self.connection.cursor() as cursor:
            for i, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
                # Ensure embedding is a valid string representation of vector
                embedding_str = f"[{','.join(map(str, embedding))}]"
                
                cursor.execute("""
                    INSERT INTO knowledge_vector_store
                    (document_id, document_name, chunk_index, source_authority, content, embedding, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """, [document.id, document.name, i, document.source_authority, chunk_text, embedding_str, user_id])
                
                DocumentChunk.objects.create(
                    document=document,
                    content=chunk_text,
                    chunk_index=i,
                    token_count=len(chunk_text.split()),
                    vector_id=f"pg_{document.id}_{i}",
                    metadata={"source": document.name, "authority": document.source_authority, "user_id": user_id}
                )

    def search(self, query_embedding: list, top_k: int, threshold: float, user_id: int = None):
        if self.connection.vendor != 'postgresql':
            return []

        embedding_str = f"[{','.join(map(str, query_embedding))}]"
        
        with self.connection.cursor() as cursor:
            if user_id is not None:
                cursor.execute("""
                    SELECT document_name, chunk_index, content, 1 - (embedding <=> %s::vector) AS similarity
                    FROM knowledge_vector_store
                    WHERE 1 - (embedding <=> %s::vector) >= %s
                    AND (user_id = %s OR user_id IS NULL)
                    ORDER BY similarity DESC
                    LIMIT %s;
                """, [embedding_str, embedding_str, threshold, user_id, top_k])
            else:
                # Global knowledge constraint
                cursor.execute("""
                    SELECT document_name, chunk_index, content, 1 - (embedding <=> %s::vector) AS similarity
                    FROM knowledge_vector_store
                    WHERE 1 - (embedding <=> %s::vector) >= %s
                    AND user_id IS NULL
                    ORDER BY similarity DESC
                    LIMIT %s;
                """, [embedding_str, embedding_str, threshold, top_k])
            
            rows = cursor.fetchall()
            
            contexts = []
            for row in rows:
                doc_name, chunk_idx, content, similarity = row
                contexts.append({
                    'text': content,
                    'similarity': round(similarity, 3),
                    'source': doc_name,
                    'chunk_index': chunk_idx,
                })
            return contexts
