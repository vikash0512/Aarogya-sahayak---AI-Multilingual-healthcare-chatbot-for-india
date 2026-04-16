from django.contrib import admin
from .models import LLMConfig, VectorDBConfig, PlatformSettings, GuardrailConfig

@admin.register(LLMConfig)
class LLMConfigAdmin(admin.ModelAdmin):
    list_display = ['provider', 'model_name', 'temperature']

@admin.register(VectorDBConfig)
class VectorDBConfigAdmin(admin.ModelAdmin):
    list_display = ['provider', 'index_name', 'dimensions']

@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ['platform_name', 'maintenance_mode']

@admin.register(GuardrailConfig)
class GuardrailConfigAdmin(admin.ModelAdmin):
    list_display = ['diagnosis_blocking', 'prescription_blocking', 'pii_redaction']
