import os
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Document, DocumentChunk, DocumentIngestionJob
from .processor import enqueue_document_processing
from audit.utils import log_action


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    """Upload a document file."""
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    file_ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
    allowed = ['pdf', 'docx', 'doc', 'txt', 'json', 'csv']
    if file_ext not in allowed:
        return Response({'error': f'File type .{file_ext} not supported. Allowed: {", ".join(allowed)}'},
                        status=status.HTTP_400_BAD_REQUEST)

    chunk_size = int(request.data.get('chunk_size', 512))
    source_language = request.data.get('source_language', 'English')
    source_authority = request.data.get('source_authority', 'high')

    doc = Document.objects.create(
        name=file.name,
        file=file,
        file_type=file_ext.upper(),
        file_size=file.size,
        chunk_size=chunk_size,
        source_language=source_language,
        source_authority=source_authority,
        status='queued',
    )

    job = enqueue_document_processing(doc.id)

    log_action(
        user=request.user if request.user.is_authenticated else None,
        action='Uploaded Document',
        resource=file.name,
        ip=request.META.get('REMOTE_ADDR', ''),
        status_val='Success'
    )

    return Response({
        'id': doc.id,
        'job_id': job.id,
        'name': doc.name,
        'status': doc.status,
        'message': 'File uploaded successfully. Processing has been queued.'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def process_document_view(request, doc_id):
    """Trigger document processing (chunk + embed + store)."""
    try:
        doc = Document.objects.get(id=doc_id)
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

    job = enqueue_document_processing(doc.id)

    log_action(
        user=request.user if request.user.is_authenticated else None,
        action='Queued Document Processing',
        resource=doc.name,
        ip=request.META.get('REMOTE_ADDR', ''),
        status_val='Success'
    )

    return Response({
        'id': doc.id,
        'job_id': job.id,
        'status': doc.status,
        'message': 'Document processing has been queued.'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def list_documents(request):
    """List all documents with their status."""
    docs = Document.objects.all()
    result = []
    for doc in docs:
        result.append({
            'id': str(doc.id),
            'name': doc.name,
            'type': doc.file_type,
            'chunks': doc.chunk_count,
            'status_raw': doc.status,
            'status': 'Indexed' if doc.status == 'indexed' else 'Processing' if doc.status == 'processing' else 'Queued' if doc.status == 'queued' else 'Failed' if doc.status == 'failed' else 'Uploaded',
            'date': doc.created_at.strftime('%Y-%m-%d'),
            'created_at': doc.created_at.isoformat(),
            'error': doc.error_message,
        })
    return Response(result)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_document(request, doc_id):
    """Delete a document and its vectors."""
    try:
        doc = Document.objects.get(id=doc_id)
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

    # Remove from Vector DB
    try:
        from .vector_store import VectorStoreFactory
        store = VectorStoreFactory.get_store()
        store.delete_for_document(doc.id)
    except Exception:
        pass

    # Delete file
    if doc.file:
        try:
            os.remove(doc.file.path)
        except Exception:
            pass

    name = doc.name
    doc.delete()

    log_action(
        user=request.user if request.user.is_authenticated else None,
        action='Deleted Document',
        resource=name,
        ip=request.META.get('REMOTE_ADDR', ''),
        status_val='Success'
    )

    return Response({'message': f'Document "{name}" deleted successfully.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reindex_document(request, doc_id):
    """Re-process an existing document."""
    try:
        doc = Document.objects.get(id=doc_id)
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

    job = enqueue_document_processing(doc.id)

    log_action(
        user=request.user if request.user.is_authenticated else None,
        action='Queued Re-index Document',
        resource=doc.name,
        ip=request.META.get('REMOTE_ADDR', ''),
        status_val='Success'
    )

    return Response({'id': doc.id, 'job_id': job.id, 'status': doc.status, 'message': 'Re-indexing has been queued.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def document_status(request, doc_id):
    """Get current processing status of a document."""
    try:
        doc = Document.objects.get(id=doc_id)
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'id': doc.id,
        'name': doc.name,
        'status': doc.status,
        'chunks': doc.chunk_count,
        'error': doc.error_message,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def ingestion_job_status(request, job_id):
    try:
        job = DocumentIngestionJob.objects.select_related('document').get(id=job_id)
    except DocumentIngestionJob.DoesNotExist:
        return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'id': job.id,
        'document_id': job.document_id,
        'status': job.status,
        'attempts': job.attempts,
        'error': job.error_message,
        'started_at': job.started_at,
        'finished_at': job.finished_at,
    })
