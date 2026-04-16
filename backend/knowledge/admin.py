from django.contrib import admin
from .models import Document, DocumentChunk

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'file_type', 'chunk_count', 'status', 'created_at']
    list_filter = ['status', 'file_type']

@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ['document', 'chunk_index', 'token_count']
    list_filter = ['document']
