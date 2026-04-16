from django.urls import path
from . import views

urlpatterns = [
    path('llm-config/', views.llm_config_view, name='llm-config'),
    path('vector-config/', views.vector_config_view, name='vector-config'),
    path('settings/', views.settings_view, name='platform-settings'),
    path('guardrails/', views.guardrails_view, name='guardrails'),
    path('supabase-config/', views.supabase_config_view, name='supabase-config'),
    path('supabase-config/test/', views.test_supabase_connection, name='supabase-test'),
    path('public/', views.public_config_view, name='public-config'),
]
