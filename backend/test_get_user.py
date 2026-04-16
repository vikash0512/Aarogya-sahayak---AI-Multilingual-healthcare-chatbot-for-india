import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogya.settings')
django.setup()

from django.conf import settings
from supabase import create_client
print("ANON:", settings.SUPABASE_ANON_KEY[:10])
print("JWT_SECRET:", bool(settings.SUPABASE_JWT_SECRET))
