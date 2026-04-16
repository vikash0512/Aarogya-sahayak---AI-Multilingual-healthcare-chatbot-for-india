from django.db import models
from django.conf import settings


class Document(models.Model):
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('indexed', 'Indexed'),
        ('failed', 'Failed'),
    ]
    AUTHORITY_CHOICES = [
        ('high', 'Verified (High Trust)'),
        ('medium', 'External Partner (Medium)'),
        ('low', 'Public Domain (Low)'),
    ]

    name = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    file = models.FileField(upload_to='documents/')
    file_type = models.CharField(max_length=10, blank=True)
    file_size = models.BigIntegerField(default=0)
    source_language = models.CharField(max_length=50, default='English')
    source_authority = models.CharField(max_length=20, choices=AUTHORITY_CHOICES, default='high')
    chunk_size = models.IntegerField(default=512)
    chunk_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    error_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.status})"


class DocumentChunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    chunk_index = models.IntegerField()
    token_count = models.IntegerField(default=0)
    vector_id = models.CharField(max_length=255, blank=True, default='')
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['chunk_index']

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.name}"
