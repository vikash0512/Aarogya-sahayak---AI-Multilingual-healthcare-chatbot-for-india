from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    language_preference = models.CharField(max_length=10, default='EN')
    last_active = models.DateTimeField(auto_now=True)
    supabase_uid = models.CharField(max_length=255, blank=True, default='', db_index=True)
    extra_data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
