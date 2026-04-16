import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogya.settings')
django.setup()

from django.conf import settings
from supabase import create_client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
try:
    user_resp = supabase.auth.get_user("invalid_token_xyz")
    print(user_resp)
except Exception as e:
    import traceback
    traceback.print_exc()
