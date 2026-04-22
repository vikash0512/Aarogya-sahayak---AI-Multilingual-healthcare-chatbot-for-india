import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import LLMConfig, VectorDBConfig, PlatformSettings, GuardrailConfig, SupabaseConfig
from .serializers import (
    LLMConfigSerializer, LLMConfigWriteSerializer,
    VectorDBConfigSerializer, VectorDBConfigWriteSerializer,
    PlatformSettingsSerializer, GuardrailConfigSerializer,
    SupabaseConfigSerializer, SupabaseConfigWriteSerializer,
)
from audit.utils import log_action

logger = logging.getLogger(__name__)
ADMIN_EMAILS = {'admin@arogyasahayak.in'}


def _is_admin(request):
    """Check if the request user has admin role."""
    if not request.user or not request.user.is_authenticated:
        return False
    if request.user.is_staff or request.user.is_superuser:
        return True
    if (request.user.email or '').lower() in ADMIN_EMAILS:
        return True
    profile = getattr(request.user, 'profile', None)
    return profile and profile.role == 'admin'


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def llm_config_view(request):
    if not _is_admin(request):
        return Response({'error': 'Admin access required'}, status=403)

    config = LLMConfig.load()
    if request.method == 'GET':
        return Response(LLMConfigSerializer(config).data)
    elif request.method == 'PUT':
        serializer = LLMConfigWriteSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user, action='Updated LLM Config', resource='System Settings',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
            return Response(LLMConfigSerializer(LLMConfig.load()).data)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def vector_config_view(request):
    if not _is_admin(request):
        return Response({'error': 'Admin access required'}, status=403)

    config = VectorDBConfig.load()
    if request.method == 'GET':
        return Response(VectorDBConfigSerializer(config).data)
    elif request.method == 'PUT':
        serializer = VectorDBConfigWriteSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user, action='Updated Vector DB Config', resource='System Settings',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
            return Response(VectorDBConfigSerializer(VectorDBConfig.load()).data)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_config_view(request):
    """Public accessible configurations for the frontend."""
    config = PlatformSettings.load()
    return Response({
        'google_maps_api_key': config.google_maps_api_key
    })


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def settings_view(request):
    if not _is_admin(request):
        return Response({'error': 'Admin access required'}, status=403)

    config = PlatformSettings.load()
    if request.method == 'GET':
        return Response(PlatformSettingsSerializer(config).data)
    elif request.method == 'PUT':
        serializer = PlatformSettingsSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user, action='Updated Platform Settings', resource='System Settings',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def guardrails_view(request):
    if not _is_admin(request):
        return Response({'error': 'Admin access required'}, status=403)

    config = GuardrailConfig.load()
    if request.method == 'GET':
        return Response(GuardrailConfigSerializer(config).data)
    elif request.method == 'PUT':
        serializer = GuardrailConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user, action='Updated Guardrails', resource='System Settings',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def supabase_config_view(request):
    """Get or update Supabase configuration."""
    if not _is_admin(request):
        return Response({'error': 'Admin access required'}, status=403)

    config = SupabaseConfig.load()
    if request.method == 'GET':
        return Response(SupabaseConfigSerializer(config).data)
    elif request.method == 'PUT':
        serializer = SupabaseConfigWriteSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(user=request.user, action='Updated Supabase Config', resource='System Settings',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
            return Response(SupabaseConfigSerializer(SupabaseConfig.load()).data)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_supabase_connection(request):
    """Test connectivity to Supabase."""
    if not _is_admin(request):
        return Response({'error': 'Admin access required'}, status=403)

    config = SupabaseConfig.load()
    results = {'database': False, 'auth': False, 'storage': False}

    # Test database
    try:
        from django.db import connections
        conn = connections['default']
        conn.ensure_connection()
        results['database'] = True
    except Exception as e:
        results['database_error'] = str(e)

    # Test Supabase API
    if config.project_url and config.service_key:
        try:
            from supabase import create_client
            client = create_client(config.project_url, config.service_key)
            # Simple health check
            client.auth.admin.list_users(page=1, per_page=1)
            results['auth'] = True
        except Exception as e:
            results['auth_error'] = str(e)

    all_ok = results['database'] and results['auth']
    if all_ok and not config.is_configured:
        config.is_configured = True
        config.save()

    return Response({
        'success': all_ok,
        'results': results,
    })
