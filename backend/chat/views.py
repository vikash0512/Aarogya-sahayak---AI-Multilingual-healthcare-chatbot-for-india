from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, OuterRef, Subquery
from .models import ChatSession, ChatMessage
from .rag_pipeline import get_ai_response
from audit.utils import log_action
import os


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
    # Safety rule:
    # - authenticated users can continue their own session
    # - anonymous users always start a fresh session to avoid session hijacking by id
    session = None
    if session_id and request.user.is_authenticated:
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            pass

    if not session:
        user = request.user if request.user.is_authenticated else None
        session = ChatSession.objects.create(user=user, language=language)

    # Save user message
    ChatMessage.objects.create(
        session=session,
        sender='user',
        text=message,
    )

    # Build conversation history from this session
    max_history = int(os.getenv('MAX_CHAT_HISTORY_MESSAGES', '20'))
    recent_messages = list(
        session.messages.only('sender', 'text').order_by('-timestamp')[:max_history]
    )

    history = []
    for msg in reversed(recent_messages):
        history.append({
            'sender': msg.sender,
            'text': msg.text,
        })

    # Get AI response via RAG pipeline (with full history)
    user_id = request.user.id if request.user.is_authenticated else None
    try:
        result = get_ai_response(message, language, history, user_id=user_id)
    except Exception as exc:
        logger_message = str(exc)[:500]
        log_action(
            user=request.user if request.user.is_authenticated else None,
            action='Chat Query Failed',
            resource=f'Session {session.id}',
            ip=request.META.get('REMOTE_ADDR', ''),
            status_val='Failed',
            details={'error': logger_message},
        )
        result = {
            'text': 'I could not process that request right now. Please try again in a moment.',
            'structured': {
                'message_type': 'general_info',
                'greeting': 'I am having trouble reaching the medical engine right now.',
                'content': [
                    {'type': 'warning', 'value': 'Please try again in a moment. If the issue continues, check the AI and database settings in Admin.'}
                ],
                'follow_up': None,
                'sources_note': '',
            },
            'verified': False,
            'warning': logger_message,
            'sources': [],
            'confidence': 0,
        }

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
@permission_classes([IsAuthenticated])
def chat_sessions_view(request):
    """Get user's chat sessions."""
    last_message_subquery = ChatMessage.objects.filter(
        session=OuterRef('pk')
    ).order_by('-timestamp').values('text')[:1]

    sessions = ChatSession.objects.filter(user=request.user)

    sessions = sessions.annotate(
        message_count=Count('messages'),
        last_message_text=Subquery(last_message_subquery),
    ).only('id', 'language', 'created_at', 'is_active').order_by('-created_at')[:20]

    result = []
    for session in sessions:
        result.append({
            'id': session.id,
            'language': session.language,
            'created_at': session.created_at.isoformat(),
            'is_active': session.is_active,
            'last_message': (session.last_message_text or '')[:80],
            'message_count': session.message_count,
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def session_messages_view(request, session_id):
    """Get all messages for a session."""
    try:
        session = ChatSession.objects.get(id=session_id, user=request.user)
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    messages = session.messages.only('id', 'sender', 'text', 'timestamp', 'is_verified', 'warning', 'sources').all()
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
@permission_classes([IsAuthenticated])
def delete_session_view(request, session_id):
    """Delete a chat session."""
    try:
        session = ChatSession.objects.get(id=session_id, user=request.user)
    except ChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    session.delete()
    return Response({'message': 'Session deleted'})

def _structured_to_whatsapp_text(structured: dict) -> str:
    """Convert structured JSON response from RAG pipeline into WhatsApp-friendly plain text."""
    parts = []

    greeting = structured.get('greeting', '')
    if greeting:
        parts.append(greeting)
        parts.append('')  # blank line

    for block in structured.get('content', []):
        btype = block.get('type', '')
        if btype == 'text':
            parts.append(block.get('value', ''))
        elif btype == 'heading':
            parts.append(f"*{block.get('value', '')}*")  # WhatsApp bold
        elif btype == 'point':
            icon = block.get('icon', '•')
            title = block.get('title', '')
            detail = block.get('detail', '')
            parts.append(f"{icon} *{title}*: {detail}")
        elif btype == 'warning':
            parts.append(f"⚠️ {block.get('value', '')}")
        elif btype == 'disclaimer':
            parts.append(f"\n_{block.get('value', '')}_")  # WhatsApp italic

    follow_up = structured.get('follow_up')
    if follow_up and isinstance(follow_up, dict):
        question = follow_up.get('question', '')
        options = follow_up.get('options', [])
        if question:
            parts.append('')
            parts.append(f"❓ {question}")
        if options:
            for i, opt in enumerate(options, 1):
                parts.append(f"  {i}. {opt}")

    sources = structured.get('sources_note', '')
    if sources:
        parts.append(f"\n📚 _{sources}_")

    return '\n'.join(parts)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def whatsapp_webhook(request):
    """WhatsApp webhook for incoming messages (Twilio Sandbox)."""

    if request.method == 'GET':
        # Meta webhook verification (kept for future use)
        from config.models import WhatsAppConfig
        wa_config = WhatsAppConfig.load()
        verify_token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        if verify_token == wa_config.verify_token:
            return Response(int(challenge) if challenge else "OK", status=status.HTTP_200_OK)
        return Response('Invalid token', status=status.HTTP_403_FORBIDDEN)

    # --- POST: Twilio sends incoming WhatsApp messages here ---
    from config.models import WhatsAppConfig
    import logging
    logger = logging.getLogger(__name__)

    wa_config = WhatsAppConfig.load()

    # 1. Parse Twilio payload (form-encoded by default)
    body = request.data.get('Body', '') or request.POST.get('Body', '')
    from_number = request.data.get('From', '') or request.POST.get('From', '')  # e.g. whatsapp:+91xxxxxxxxxx
    to_number = request.data.get('To', '') or request.POST.get('To', '')

    body = body.strip()
    if not body:
        logger.warning("WhatsApp webhook received empty body")
        return Response({'status': 'empty'}, status=status.HTTP_200_OK)

    logger.info(f"[WhatsApp] Message from {from_number}: {body[:80]}")

    # 2. Get or create a session for this phone number
    session = ChatSession.objects.filter(
        language='EN',
        is_active=True,
    ).filter(
        messages__text__startswith=f"[WA:{from_number}]"
    ).first()

    if not session:
        session = ChatSession.objects.create(user=None, language='EN')
        # Tag the session so we can find it later by phone number
        ChatMessage.objects.create(
            session=session, sender='system',
            text=f"[WA:{from_number}] WhatsApp session started"
        )

    # 3. Save user message
    ChatMessage.objects.create(session=session, sender='user', text=body)

    # 4. Build conversation history
    history = []
    for msg in session.messages.order_by('timestamp'):
        if msg.sender == 'system':
            continue
        history.append({'sender': msg.sender, 'text': msg.text})

    # 5. Run through RAG pipeline
    try:
        result = get_ai_response(body, 'EN', history)
    except Exception as e:
        logger.error(f"[WhatsApp] RAG pipeline error: {e}")
        result = {
            'text': 'Sorry, I encountered an error. Please try again.',
            'structured': None,
            'verified': False,
            'warning': str(e),
            'sources': [],
            'confidence': 0,
        }

    # 6. Convert to WhatsApp-friendly text
    structured = result.get('structured')
    if structured and isinstance(structured, dict):
        reply_text = _structured_to_whatsapp_text(structured)
    else:
        reply_text = result.get('text', 'Sorry, I could not process your request.')

    # Twilio has a 1600 char limit per message
    if len(reply_text) > 1500:
        reply_text = reply_text[:1497] + '...'

    # 7. Save AI response
    ChatMessage.objects.create(
        session=session, sender='ai', text=reply_text,
        is_verified=result.get('verified', False),
        warning=result.get('warning', ''),
        sources=result.get('sources', []),
        confidence_score=result.get('confidence', 0),
    )

    # 8. Send reply via Twilio
    try:
        from twilio.rest import Client as TwilioClient

        # Get credentials: from env vars (fallback) or WhatsAppConfig (admin panel)
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID', '')
        auth_token = wa_config.access_token or os.environ.get('TWILIO_AUTH_TOKEN', '')
        phone_number = wa_config.phone_number_id or os.environ.get('TWILIO_WHATSAPP_NUMBER', '')

        if not account_sid or not auth_token:
            logger.error("[WhatsApp] Missing Twilio credentials (TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN env var)")
            # Fall back to TwiML response
            from django.http import HttpResponse
            twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{reply_text}</Message></Response>'
            return HttpResponse(twiml, content_type='text/xml')

        client = TwilioClient(account_sid, auth_token)
        twilio_from = f"whatsapp:{phone_number}" if not phone_number.startswith('whatsapp:') else phone_number

        client.messages.create(
            body=reply_text,
            from_=twilio_from,
            to=from_number,
        )
        logger.info(f"[WhatsApp] Reply sent to {from_number}")

    except ImportError:
        logger.warning("[WhatsApp] twilio package not installed — returning TwiML response instead")
        from django.http import HttpResponse
        twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{reply_text}</Message></Response>'
        return HttpResponse(twiml, content_type='text/xml')

    except Exception as e:
        logger.error(f"[WhatsApp] Failed to send reply via Twilio API: {e}")
        # Fallback: return TwiML so Twilio still shows a reply
        from django.http import HttpResponse
        twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{reply_text}</Message></Response>'
        return HttpResponse(twiml, content_type='text/xml')

    log_action(
        user=None,
        action='WhatsApp Chat',
        resource=f'Session {session.id} | {from_number}',
        ip=request.META.get('REMOTE_ADDR', ''),
        status_val='Success'
    )

    return Response({'status': 'sent'}, status=status.HTTP_200_OK)
