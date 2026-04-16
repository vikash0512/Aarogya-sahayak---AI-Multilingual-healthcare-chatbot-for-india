from django.contrib import admin
from .models import ChatSession, ChatMessage

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'language', 'created_at', 'is_active']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session', 'sender', 'timestamp', 'is_verified']
    list_filter = ['sender', 'is_verified']
