from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import ChatSession, ChatMessage
from .rag_pipeline import get_ai_response
from audit.utils import log_action


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_view(request):
    """
    Send a message and receive RAG-powered AI response.
    Body: { message, language, session_id (optional) }
    """
    message = request.data.get('message', '').strip()
    language = request.data.get('language', 'EN')
    session_id = request.data.get('session_id')

    if not message:
        return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

    # Get or create session
    session = None
    if session_id:
        try:
            session = ChatSession.objects.get(id=session_id)
        except ChatSession.DoesNotExist:
            pass

    if not session:
        user = request.user if request.user.is_authenticated else None
        session = ChatSession.objects.create(user=user, language=language)

    # Save user message
    user_msg = ChatMessage.objects.create(
        session=session,
        sender='user',
        text=message,
    )

    # Build conversation history from this session
    history = []
    for msg in session.messages.order_by('timestamp'):
        history.append({
            'sender': msg.sender,
            'text': msg.text,
        })

    # Get AI response via RAG pipeline (with full history)
    user_id = request.user.id if request.user.is_authenticated else None
    result = get_ai_response(message, language, history, user_id=user_id)

    # Save AI message
    ai_msg = ChatMessage.objects.create(
        session=session,
        sender='ai',
        text=result['text'],
        is_verified=result['verified'],
        warning=result.get('warning', ''),
        sources=result.get('sources', []),
        confidence_score=result.get('confidence', 0),
    )

    log_action(
        user=request.user if request.user.is_authenticated else None,
        action='Chat Query',
        resource=f'Session {session.id}',
        ip=request.META.get('REMOTE_ADDR', ''),
        status_val='Success'
    )

    return Response({
        'session_id': session.id,
        'message': {
            'id': ai_msg.id,
            'sender': 'ai',
            'text': result['text'],
            'structured': result.get('structured'),
            'verified': result['verified'],
            'warning': result.get('warning', ''),
            'sources': result.get('sources', []),
            'confidence': result.get('confidence', 0),
            'time': ai_msg.timestamp.strftime('%H:%M'),
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def chat_sessions_view(request):
    """Get user's chat sessions."""
    if request.user.is_authenticated:
        sessions = ChatSession.objects.filter(user=request.user)
    else:
        sessions = ChatSession.objects.all()[:20]

    result = []
    for session in sessions:
        last_msg = session.messages.last()
        result.append({
            'id': session.id,
            'language': session.language,
            'created_at': session.created_at.isoformat(),
            'is_active': session.is_active,
            'last_message': last_msg.text[:80] if last_msg else '',
            'message_count': session.messages.count(),
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def session_messages_view(request, session_id):
    """Get all messages for a session."""
    try:
        session = ChatSession.objects.get(id=session_id)
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    messages = session.messages.all()
    result = []
    for msg in messages:
        result.append({
            'id': msg.id,
            'sender': msg.sender,
            'text': msg.text,
            'time': msg.timestamp.strftime('%H:%M'),
            'verified': msg.is_verified,
            'warning': msg.warning,
            'sources': msg.sources,
        })
    return Response({'session_id': session.id, 'messages': result})


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_session_view(request, session_id):
    """Delete a chat session."""
    try:
        session = ChatSession.objects.get(id=session_id)
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    session.delete()
    return Response({'message': 'Session deleted'})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def whatsapp_webhook(request):
    """WhatsApp webhook for incoming messages (Twilio or Meta)."""
    if request.method == 'GET':
        # Meta webhook verification
        verify_token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        
        # We would normally import WhatsAppConfig here and check
        # But this is a basic stub
        if verify_token == "arogya_secret_token":
            return Response(int(challenge) if challenge else "OK", status=status.HTTP_200_OK)
        return Response('Invalid token', status=status.HTTP_403_FORBIDDEN)
        
    elif request.method == 'POST':
        # Provide response back 
        # Integration logic to parse incoming twilio or meta payload 
        # and send chat query through get_chatbot_response
        return Response({'status': 'received'}, status=status.HTTP_200_OK)
