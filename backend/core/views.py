import os
import time
import logging
import mimetypes
import urllib.error
import urllib.parse
import urllib.request
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
ADMIN_EMAILS = {'admin@arogyasahayak.in'}


def _get_supabase_admin_client():
    try:
        from supabase import create_client
    except ImportError:
        return None

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None

    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    except Exception as exc:
        logger.error(f"Failed to create Supabase admin client: {exc}")
        return None


def _resolve_user_role(user):
    """Resolve effective role with staff/superuser fallback and sync profile role."""
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'patient'})
    effective_role = profile.role

    if user.is_staff or user.is_superuser or (user.email or '').lower() in ADMIN_EMAILS:
        effective_role = 'admin'
        if profile.role != 'admin':
            profile.role = 'admin'
            profile.save(update_fields=['role'])

    return profile, effective_role


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
    profile, role = _resolve_user_role(user)
    return Response({
        'id': user.id,
        'name': user.get_full_name() or user.username,
        'email': user.email,
        'role': role,
        'status': profile.status,
        'language_preference': profile.language_preference,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list_view(request):
    """List all users (admin only)."""
    _, req_role = _resolve_user_role(request.user)
    if req_role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    result_by_email = {}

    def _store_user(user, profile=None):
        profile = profile or getattr(user, 'profile', None)
        email = (user.email or '').strip().lower()
        if not email:
            return
        result_by_email[email] = {
            'id': user.id,
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'role': profile.role if profile else 'patient',
            'status': profile.status if profile else 'active',
            'lastLogin': user.last_login.isoformat() if user.last_login else 'Never',
        }

    supabase_client = _get_supabase_admin_client()

    if supabase_client:
        try:
            auth_users = []
            page = 1
            while True:
                users_page = supabase_client.auth.admin.list_users(page=page, per_page=100)
                if not users_page:
                    break
                auth_users.extend(users_page)
                if len(users_page) < 100:
                    break
                page += 1

            seen_emails = set()
            for auth_user in auth_users:
                email = (getattr(auth_user, 'email', '') or '').strip().lower()
                if not email or email in seen_emails:
                    continue
                seen_emails.add(email)

                user = User.objects.filter(email__iexact=email).select_related('profile').first()
                if not user:
                    metadata = getattr(auth_user, 'user_metadata', None) or {}
                    full_name = metadata.get('full_name', '') or metadata.get('name', '') or ''
                    username = email.split('@')[0]
                    base_username = username
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1

                    user = User.objects.create(
                        username=username,
                        email=email,
                        first_name=full_name.split(' ')[0] if full_name else '',
                        last_name=' '.join(full_name.split(' ')[1:]) if full_name else '',
                    )
                    user.set_unusable_password()
                    user.save()

                profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': 'patient'})
                if not profile.supabase_uid:
                    profile.supabase_uid = getattr(auth_user, 'id', '') or profile.supabase_uid
                    profile.save(update_fields=['supabase_uid'])

                _store_user(user, profile)

            # Supabase is the source of truth for admin user listing.
            return Response(sorted(result_by_email.values(), key=lambda item: item['lastLogin'], reverse=True))

        except Exception as exc:
            logger.error(f"Supabase user sync failed: {exc}")

    # Fallback: if Supabase is unavailable, use local users so panel remains usable.
    for user in User.objects.select_related('profile').all().order_by('-last_login'):
        _store_user(user, getattr(user, 'profile', None))

    return Response(sorted(result_by_email.values(), key=lambda item: item['lastLogin'], reverse=True))


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def user_update_view(request, user_id):
    """Update a user's role or status (admin only)."""
    _, req_role = _resolve_user_role(request.user)
    if req_role != 'admin':
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_photo_view(request):
    """Upload profile photo via backend using Supabase service key (avoids frontend RLS failures)."""
    uploaded = request.FILES.get('file')
    if not uploaded:
        return Response({'error': 'file is required'}, status=status.HTTP_400_BAD_REQUEST)

    content_type = (uploaded.content_type or '').lower()
    if not content_type.startswith('image/'):
        return Response({'error': 'Only image uploads are allowed'}, status=status.HTTP_400_BAD_REQUEST)

    max_size = 5 * 1024 * 1024
    if uploaded.size > max_size:
        return Response({'error': 'Image must be <= 5MB'}, status=status.HTTP_400_BAD_REQUEST)

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return Response({'error': 'Supabase storage is not configured on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    configured_bucket = (getattr(settings, 'SUPABASE_PROFILE_BUCKET', '') or '').strip()
    bucket_candidates = [
        configured_bucket,
        'profile-photo',
        'profile-photos',
        'profile_photo',
        'profile_photos',
        'profile photo',
        'profile photos',
        'profile',
        'avatar',
        'avatars',
    ]
    # Keep order stable while removing blanks/duplicates.
    seen = set()
    bucket_candidates = [b for b in bucket_candidates if b and not (b in seen or seen.add(b))]
    extension = os.path.splitext(uploaded.name)[1].lower()
    if not extension:
        extension = mimetypes.guess_extension(content_type) or '.jpg'

    object_path = f"{request.user.id}/{request.user.id}_{int(time.time())}{extension}"
    encoded_object_path = urllib.parse.quote(object_path, safe='/')
    payload = uploaded.read()
    last_error = None

    for bucket in bucket_candidates:
        encoded_bucket = urllib.parse.quote(bucket, safe='')
        upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/{encoded_bucket}/{encoded_object_path}"
        req = urllib.request.Request(
            upload_url,
            data=payload,
            method='POST',
            headers={
                'apikey': settings.SUPABASE_SERVICE_KEY,
                'Authorization': f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                'Content-Type': content_type or 'application/octet-stream',
                'x-upsert': 'true',
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30):
                public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{encoded_bucket}/{encoded_object_path}"
                return Response({'public_url': public_url, 'bucket': bucket, 'path': object_path})
        except urllib.error.HTTPError as exc:
            body = exc.read().decode('utf-8', errors='ignore') if hasattr(exc, 'read') else ''
            last_error = body or str(exc.reason)
            msg = (body or str(exc.reason) or '').lower()
            if 'bucket' in msg and ('not found' in msg or 'not exist' in msg):
                continue
            logger.error(f"Profile photo upload failed with status {exc.code}: {body}")
            return Response({'error': f'Upload failed: {body or exc.reason}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.error(f"Profile photo upload failed: {exc}")
            return Response({'error': 'Profile photo upload failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(
        {
            'error': (
                f"Profile photo bucket not found. Tried: {', '.join(bucket_candidates)}. "
                f"Set SUPABASE_PROFILE_BUCKET in backend .env to the exact bucket ID."
                + (f" Last error: {last_error}" if last_error else '')
            )
        },
        status=status.HTTP_400_BAD_REQUEST,
    )
