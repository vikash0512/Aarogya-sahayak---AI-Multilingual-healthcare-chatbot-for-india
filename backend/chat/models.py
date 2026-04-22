from django.db import models
from django.contrib.auth.models import User


class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions', null=True, blank=True)
    language = models.CharField(max_length=10, default='EN')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['is_active', '-created_at']),
        ]

    def __str__(self):
        return f"Session {self.id} ({self.language})"


class ChatMessage(models.Model):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
        ('system', 'System'),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    is_verified = models.BooleanField(default=False)
    warning = models.TextField(blank=True, default='')
    sources = models.JSONField(blank=True, null=True)
    confidence_score = models.FloatField(blank=True, null=True)

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session', '-timestamp']),
            models.Index(fields=['sender', '-timestamp']),
        ]

    def __str__(self):
        return f"[{self.sender}] {self.text[:50]}..."
