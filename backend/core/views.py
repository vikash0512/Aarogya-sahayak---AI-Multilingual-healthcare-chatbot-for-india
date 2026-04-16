import os
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from .serializers import SignUpSerializer, LoginSerializer, UserSerializer, UserUpdateSerializer
from .models import UserProfile
from audit.utils import log_action

logger = logging.getLogger(__name__)


def _get_supabase_client():
    """Get Supabase admin client using service key."""
    try:
        from supabase import create_client
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_KEY
        if url and key:
            return create_client(url, key)
    except ImportError:
        logger.warning("supabase package not installed")
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
    return None


def _is_supabase_configured():
    """Check if Supabase credentials are configured."""
    return bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY)


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """Register a new user. Uses Supabase if configured, else falls back to Django."""
    serializer = SignUpSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data.get('email', '')
    password = request.data.get('password', '')
    name = request.data.get('name', '')

    if _is_supabase_configured():
        # ─── Supabase Sign Up ───
        supabase = _get_supabase_client()
        if not supabase:
            return Response({'error': 'Supabase not available'}, status=500)

        try:
            result = supabase.auth.admin.create_user({
                'email': email,
                'password': password,
                'email_confirm': True,
                'user_metadata': {'full_name': name},
            })
            supabase_user = result.user

            # Sign in to get tokens
            from supabase import create_client
            anon_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            auth_result = anon_client.auth.sign_in_with_password({
                'email': email,
                'password': password,
            })

            # Create Django user + profile
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            first_name = name.split(' ')[0] if name else ''
            last_name = ' '.join(name.split(' ')[1:]) if name else ''

            user = User.objects.create(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            user.set_unusable_password()
            user.save()

            UserProfile.objects.create(
                user=user, role='patient',
                supabase_uid=supabase_user.id,
            )

            log_action(user=user, action='User Registered (Supabase)', resource='Authentication',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')

            return Response({
                'access': auth_result.session.access_token,
                'refresh': auth_result.session.refresh_token,
                'user': {
                    'id': user.id,
                    'name': user.get_full_name(),
                    'email': user.email,
                    'role': 'patient',
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Supabase signup failed: {e}")
            error_msg = str(e)
            if 'already registered' in error_msg.lower() or 'duplicate' in error_msg.lower():
                return Response({'error': 'An account with this email already exists.'}, status=400)
            return Response({'error': f'Registration failed: {error_msg}'}, status=400)

    else:
        # ─── Legacy Django Sign Up ───
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        log_action(user=user, action='User Registered', resource='Authentication',
                   ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'name': user.get_full_name(),
                'email': user.email,
                'role': user.profile.role,
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login with email and password. Uses Supabase if configured, else Django."""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    if _is_supabase_configured():
        # ─── Supabase Login ───
        try:
            from supabase import create_client
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            result = client.auth.sign_in_with_password({
                'email': email,
                'password': password,
            })

            # Sync user to Django
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user_meta = result.user.user_metadata or {}
                full_name = user_meta.get('full_name', '') or user_meta.get('name', '')
                username = email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User.objects.create(
                    username=username, email=email,
                    first_name=full_name.split(' ')[0] if full_name else '',
                    last_name=' '.join(full_name.split(' ')[1:]) if full_name else '',
                )
                user.set_unusable_password()
                user.save()

            profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': 'patient', 'supabase_uid': result.user.id}
            )
            if not profile.supabase_uid:
                profile.supabase_uid = result.user.id
                profile.save()

            log_action(user=user, action='User Login (Supabase)', resource='Authentication',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')

            return Response({
                'access': result.session.access_token,
                'refresh': result.session.refresh_token,
                'user': {
                    'id': user.id,
                    'name': user.get_full_name(),
                    'email': user.email,
                    'role': profile.role,
                }
            })

        except Exception as e:
            logger.error(f"Supabase login failed: {e}")
            log_action(action='Failed Login Attempt', resource='Authentication',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Failed',
                       details={'email': email, 'method': 'supabase'})
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    else:
        # ─── Legacy Django Login ───
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            log_action(action='Failed Login Attempt', resource='Authentication',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Failed',
                       details={'email': email})
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(username=user_obj.username, password=password)
        if user is None:
            log_action(action='Failed Login Attempt', resource='Authentication',
                       ip=request.META.get('REMOTE_ADDR', ''), status_val='Failed',
                       details={'email': email})
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'patient'})

        refresh = RefreshToken.for_user(user)
        log_action(user=user, action='User Login', resource='Authentication',
                   ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'name': user.get_full_name(),
                'email': user.email,
                'role': profile.role,
            }
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(request):
    """Refresh access token. Works with both Supabase and Django JWT."""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token required'}, status=400)

    if _is_supabase_configured():
        try:
            from supabase import create_client
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
            result = client.auth.refresh_session(refresh_token)
            return Response({
                'access': result.session.access_token,
                'refresh': result.session.refresh_token,
            })
        except Exception as e:
            logger.error(f"Supabase refresh failed: {e}")
            return Response({'error': 'Refresh failed'}, status=401)
    else:
        # Legacy Django refresh
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        except Exception:
            return Response({'error': 'Invalid refresh token'}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Get current user's profile. Used by frontend to check auth state and role."""
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'patient'})
    return Response({
        'id': user.id,
        'name': user.get_full_name() or user.username,
        'email': user.email,
        'role': profile.role,
        'status': profile.status,
        'language_preference': profile.language_preference,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list_view(request):
    """List all users (admin only)."""
    # Check admin role
    profile = getattr(request.user, 'profile', None)
    if not profile or profile.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.select_related('profile').all().order_by('-last_login')
    result = []
    for user in users:
        profile = getattr(user, 'profile', None)
        result.append({
            'id': user.id,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'role': profile.role if profile else 'patient',
            'status': profile.status if profile else 'active',
            'lastLogin': user.last_login.isoformat() if user.last_login else 'Never',
        })
    return Response(result)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def user_update_view(request, user_id):
    """Update a user's role or status (admin only)."""
    # Check admin role
    req_profile = getattr(request.user, 'profile', None)
    if not req_profile or req_profile.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserUpdateSerializer(data=request.data)
    if serializer.is_valid():
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'patient'})
        if 'role' in serializer.validated_data:
            profile.role = serializer.validated_data['role']
        if 'status' in serializer.validated_data:
            profile.status = serializer.validated_data['status']
        profile.save()
        log_action(user=request.user, action=f'Updated User {user.email}', resource='User Management',
                   ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
        return Response({'message': 'User updated successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Get or update current user's detailed profile and extra_data."""
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'patient'})
    
    if request.method == 'GET':
        return Response({
            'id': user.id,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'role': profile.role,
            'status': profile.status,
            'language_preference': profile.language_preference,
            'extra_data': profile.extra_data,
        })
    elif request.method == 'PATCH':
        data = request.data
        if 'name' in data:
            parts = data['name'].split(' ', 1)
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = parts[1]
            else:
                user.last_name = ''
            user.save()
            
        if 'language_preference' in data:
            profile.language_preference = data['language_preference']
            
        if 'extra_data' in data:
            # Merge extra_data
            current_extra = profile.extra_data or {}
            current_extra.update(data['extra_data'])
            profile.extra_data = current_extra
            
        profile.save()
        log_action(user=user, action='Updated Profile', resource='User Profile',
                   ip=request.META.get('REMOTE_ADDR', ''), status_val='Success')
        
        return Response({
            'message': 'Profile updated successfully',
            'extra_data': profile.extra_data
        })
