import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogya.settings')
django.setup()

from django.conf import settings
from supabase import create_client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
# We don't have a valid jwt, but we can verify if the import and creation works
print("Supabase client created:", supabase)
