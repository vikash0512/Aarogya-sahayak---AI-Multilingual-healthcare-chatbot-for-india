from rest_framework import serializers
from .models import LLMConfig, VectorDBConfig, PlatformSettings, GuardrailConfig, SupabaseConfig


class LLMConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = LLMConfig
        fields = ['provider', 'api_key', 'model_name', 'temperature', 'max_tokens', 'system_prompt']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Mask API key for security
        if data.get('api_key'):
            data['api_key'] = data['api_key'][:8] + '...' + data['api_key'][-4:] if len(data['api_key']) > 12 else '****'
        return data


class LLMConfigWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LLMConfig
        fields = ['provider', 'api_key', 'model_name', 'temperature', 'max_tokens', 'system_prompt']


class VectorDBConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorDBConfig
        fields = ['provider', 'api_key', 'environment', 'index_name', 'dimensions',
                  'distance_metric', 'top_k', 'similarity_threshold']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('api_key'):
            data['api_key'] = data['api_key'][:8] + '...' + data['api_key'][-4:] if len(data['api_key']) > 12 else '****'
        return data


class VectorDBConfigWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VectorDBConfig
        fields = ['provider', 'api_key', 'environment', 'index_name', 'dimensions',
                  'distance_metric', 'top_k', 'similarity_threshold']


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = ['platform_name', 'support_email', 'maintenance_mode',
                  'rate_limit_per_minute', 'confidence_threshold', 'fallback_message', 'google_maps_api_key']


class GuardrailConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuardrailConfig
        fields = ['diagnosis_blocking', 'prescription_blocking', 'disclaimer_text',
                  'emergency_keywords', 'emergency_response', 'pii_redaction', 'toxicity_filter']


class SupabaseConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupabaseConfig
        fields = ['project_url', 'anon_key', 'service_key', 'database_url', 'jwt_secret', 'is_configured']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Mask sensitive keys
        for key in ['anon_key', 'service_key', 'jwt_secret']:
            if data.get(key):
                val = data[key]
                data[key] = val[:10] + '...' + val[-4:] if len(val) > 14 else '****'
        if data.get('database_url'):
            # Mask password in database URL
            import re
            data['database_url'] = re.sub(r'://([^:]+):([^@]+)@', r'://\1:****@', data['database_url'])
        return data


class SupabaseConfigWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupabaseConfig
        fields = ['project_url', 'anon_key', 'service_key', 'database_url', 'jwt_secret', 'is_configured']
