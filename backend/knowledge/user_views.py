import os
import threading
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Document
from .processor import process_document
from audit.utils import log_action


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def user_documents_view(request):
    """List or upload user-specific health records."""
    if request.method == 'GET':
        docs = Document.objects.filter(user=request.user).order_by('-created_at')
        data = []
        for d in docs:
            data.append({
                'id': d.id,
                'name': d.name,
                'type': d.file_type,
                'size': f"{(d.file_size / (1024 * 1024)):.1f} MB",
                'status': d.status,
                'created_at': d.created_at.strftime("%b %d, %Y"),
                'error': d.error_message,
            })
        return Response(data)

    elif request.method == 'POST':
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        file_ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
        allowed = ['pdf', 'docx', 'doc', 'txt', 'jpg', 'jpeg', 'png']
        if file_ext not in allowed:
            return Response({'error': f'File type .{file_ext} not supported. Allowed: {", ".join(allowed)}'},
                            status=status.HTTP_400_BAD_REQUEST)

        doc = Document.objects.create(
            name=file.name,
            file=file,
            user=request.user,
            file_type=file_ext.upper(),
            file_size=file.size,
            chunk_size=512,
            source_language='English',
            source_authority='patient',
            status='uploaded',
        )

        log_action(
            user=request.user,
            action='Uploaded Health Record',
            resource=file.name,
            ip=request.META.get('REMOTE_ADDR', ''),
            status_val='Success'
        )

        # Trigger background processing immediately for user convenience
        def run_processing():
            process_document(doc.id)

        thread = threading.Thread(target=run_processing)
        thread.start()

        doc.status = 'processing'
        doc.save()

        return Response({
            'id': doc.id,
            'name': doc.name,
            'status': doc.status,
            'message': 'File uploaded and is processing.'
        }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def user_document_detail_view(request, doc_id):
    """Delete a specific user document."""
    try:
        doc = Document.objects.get(id=doc_id, user=request.user)
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

    # Delete from vector store
    try:
        from .vector_store import VectorStoreFactory
        store = VectorStoreFactory.get_store()
        store.delete_for_document(doc.id)
    except Exception as e:
        pass # Log normally

    log_action(
        user=request.user,
        action='Deleted Health Record',
        resource=doc.name,
        ip=request.META.get('REMOTE_ADDR', ''),
        status_val='Success'
    )
    
    doc.delete()
    return Response({'message': 'Document deleted successfully'})
