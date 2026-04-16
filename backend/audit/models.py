from django.db import models
from django.contrib.auth.models import User


class AuditLog(models.Model):
    STATUS_CHOICES = [
        ('Success', 'Success'),
        ('Warning', 'Warning'),
        ('Failed', 'Failed'),
    ]

    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=255)
    resource = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Success')
    details = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.action} by {self.user or 'System'}"
