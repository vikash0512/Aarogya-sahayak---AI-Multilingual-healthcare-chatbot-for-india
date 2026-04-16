from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'user', 'action', 'resource', 'status']
    list_filter = ['status', 'action']
    search_fields = ['action', 'resource']
    readonly_fields = ['timestamp', 'user', 'action', 'resource', 'ip_address', 'status', 'details']
