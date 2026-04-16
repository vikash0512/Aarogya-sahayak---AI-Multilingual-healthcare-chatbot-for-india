"""
Custom DRF authentication backend for Supabase JWT tokens.
Validates Supabase access tokens and syncs users to Django's User model.
"""
import jwt
import logging
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions
from core.models import UserProfile

logger = logging.getLogger(__name__)


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticates requests using Supabase JWT access tokens.
    
    The frontend sends: Authorization: Bearer <supabase_access_token>
    This backend:
    1. Decodes the JWT using Supabase JWT secret
    2. Extracts the user's email and Supabase UID
    3. Finds or creates a matching Django User
    4. Returns (user, token_payload)
    """

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header[7:]  # Remove "Bearer " prefix
        
        if not token:
            return None

        # If Supabase is not configured structurally, skip this backend
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            return None
            
        payload = None

        if settings.SUPABASE_JWT_SECRET:
            try:
                # Decode Supabase JWT locally (zero latency)
                payload = jwt.decode(
                    token,
                    settings.SUPABASE_JWT_SECRET,
                    algorithms=['HS256'],
                    audience='authenticated',
                    options={
                        'verify_exp': True,
                        'verify_aud': True,
                    }
                )
            except jwt.ExpiredSignatureError:
                raise exceptions.AuthenticationFailed('Token has expired')
            except jwt.InvalidTokenError as e:
                logger.debug(f"SupabaseAuthentication: Invalid token, deferring: {e}")
                return None
        else:
            # Fallback: Make a network request to verify the token via Supabase API
            try:
                from supabase import create_client
                supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                user_resp = supabase.auth.get_user(token)
                if not user_resp or not user_resp.user:
                    return None
                    
                sb_user = user_resp.user
                payload = {
                    'sub': sb_user.id,
                    'email': sb_user.email,
                    'user_metadata': sb_user.user_metadata or {}
                }
            except Exception as e:
                logger.error(f"Failed to verify token via Supabase API: {e}")
                return None

        # Extract user info from JWT payload
        supabase_uid = payload.get('sub')
        email = payload.get('email', '')
        
        if not supabase_uid or not email:
            raise exceptions.AuthenticationFailed('Invalid token payload')

        # Find or create Django user
        user = self._get_or_create_user(supabase_uid, email, payload)
        
        return (user, payload)

    def _get_or_create_user(self, supabase_uid, email, payload):
        """
        Sync Supabase user to Django User model.
        Uses email as the primary lookup key.
        """
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new Django user for this Supabase user
            username = email.split('@')[0]
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user_metadata = payload.get('user_metadata', {})
            full_name = user_metadata.get('full_name', '') or user_metadata.get('name', '')
            first_name = full_name.split(' ')[0] if full_name else ''
            last_name = ' '.join(full_name.split(' ')[1:]) if full_name else ''
            
            user = User.objects.create(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                # No password — auth is handled by Supabase
            )
            user.set_unusable_password()
            user.save()
            
            logger.info(f"Created Django user for Supabase UID {supabase_uid}: {email}")

        # Check if this email should automatically be granted admin rights
        is_admin = email.lower() in ['admin@arogyasahayak.in']

        # Ensure UserProfile exists
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'role': 'admin' if is_admin else 'patient', 'supabase_uid': supabase_uid}
        )
        
        if not created and not profile.supabase_uid:
            profile.supabase_uid = supabase_uid
            # Automatically upgrade existing users if they match the admin email
            if is_admin and profile.role != 'admin':
                profile.role = 'admin'
            profile.save()

        return user

    def authenticate_header(self, request):
        return 'Bearer realm="supabase"'
