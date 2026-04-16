from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat_view, name='chat'),
    path('chat/sessions/', views.chat_sessions_view, name='chat-sessions'),
    path('chat/sessions/<int:session_id>/messages/', views.session_messages_view, name='session-messages'),
    path('chat/sessions/<int:session_id>/delete/', views.delete_session_view, name='session-delete'),
    path('whatsapp/webhook/', views.whatsapp_webhook, name='whatsapp-webhook'),
]
