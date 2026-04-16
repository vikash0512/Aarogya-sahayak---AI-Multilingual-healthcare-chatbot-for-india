from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import models
from .models import AuditLog
from django.contrib.auth.models import User
from chat.models import ChatMessage, ChatSession
from knowledge.models import Document
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncDate


@api_view(['GET'])
@permission_classes([AllowAny])
def audit_logs_view(request):
    """List audit logs with optional search."""
    search = request.query_params.get('search', '')
    logs = AuditLog.objects.select_related('user').all()[:100]

    if search:
        logs = logs.filter(
            models.Q(action__icontains=search) |
            models.Q(user__first_name__icontains=search) |
            models.Q(user__last_name__icontains=search) |
            models.Q(ip_address__icontains=search)
        )

    result = []
    for log in logs:
        user_name = 'System'
        if log.user:
            user_name = log.user.get_full_name() or log.user.username
        result.append({
            'id': str(log.id),
            'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'user': user_name,
            'action': log.action,
            'resource': log.resource,
            'ip': log.ip_address or '',
            'status': log.status,
        })
    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats_view(request):
    """Aggregated stats for admin dashboard."""
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    week_ago = now - timedelta(days=7)

    # Active users (users who logged in in the last 24 hours)
    active_users = User.objects.filter(last_login__gte=yesterday_start).count()

    # Queries today
    queries_today = ChatMessage.objects.filter(
        sender='user', timestamp__gte=today_start
    ).count()

    queries_yesterday = ChatMessage.objects.filter(
        sender='user', timestamp__gte=yesterday_start, timestamp__lt=today_start
    ).count()

    # Total messages
    total_messages = ChatMessage.objects.filter(sender='ai').count()

    # Documents
    total_docs = Document.objects.filter(status='indexed').count()

    # Query volume trend (last 7 days)
    day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    trend_data = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = ChatMessage.objects.filter(
            sender='user', timestamp__gte=day_start, timestamp__lt=day_end
        ).count()
        trend_data.append({
            'name': day_names[day.weekday()],
            'queries': count,
        })

    # Flagged / warning responses
    flagged = ChatMessage.objects.filter(sender='ai', warning__isnull=False).exclude(warning='').count()

    return Response({
        'activeUsers': max(active_users, 1),
        'queriesToday': queries_today,
        'queriesYesterday': queries_yesterday,
        'avgConfidence': 94.2,  # Will be calculated from real data once many chats occur
        'flaggedResponses': flagged,
        'totalDocuments': total_docs,
        'totalMessages': total_messages,
        'queryTrend': trend_data,
        'topTopics': [
            {'name': 'General Health', 'value': 40, 'color': '#137fec'},
            {'name': 'Symptoms', 'value': 30, 'color': '#38bdf8'},
            {'name': 'Medication', 'value': 20, 'color': '#818cf8'},
            {'name': 'Other', 'value': 10, 'color': '#cbd5e1'},
        ],
    })
