from django.db import models


class SingletonModel(models.Model):
    """Abstract base for singleton config models."""
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class LLMConfig(SingletonModel):
    PROVIDER_CHOICES = [
        ('gemini', 'Google Gemini'),
        ('openai', 'OpenAI'),
        ('local', 'Local / Custom'),
    ]

    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='gemini')
    api_key = models.CharField(max_length=500, blank=True, default='')
    model_name = models.CharField(max_length=100, default='gemini-2.5-flash')
    temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=2048)
    system_prompt = models.TextField(
        default="You are Arogya Sahayak, a helpful and knowledgeable medical AI assistant. "
                "You provide accurate, evidence-based health information based on the provided context. "
                "Always advise users to consult a real doctor for serious conditions. "
                "Do not hallucinate or make up medical facts. "
                "If the provided context does not contain relevant information, say so honestly."
    )

    class Meta:
        verbose_name = 'LLM Configuration'

    def __str__(self):
        return f"LLM Config: {self.provider} / {self.model_name}"


class VectorDBConfig(SingletonModel):
    PROVIDER_CHOICES = [
        ('chromadb', 'ChromaDB (Local)'),
        ('pgvector', 'pgvector (Supabase)'),
        ('pinecone', 'Pinecone'),
        ('qdrant', 'Qdrant'),
    ]
    METRIC_CHOICES = [
        ('cosine', 'Cosine Similarity'),
        ('l2', 'Euclidean Distance (L2)'),
        ('ip', 'Dot Product'),
    ]

    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES, default='chromadb')
    api_key = models.CharField(max_length=500, blank=True, default='')
    environment = models.CharField(max_length=100, blank=True, default='')
    index_name = models.CharField(max_length=100, default='arogya-medical-index')
    dimensions = models.IntegerField(default=384)
    distance_metric = models.CharField(max_length=20, choices=METRIC_CHOICES, default='cosine')
    top_k = models.IntegerField(default=5)
    similarity_threshold = models.FloatField(default=0.75)

    class Meta:
        verbose_name = 'Vector DB Configuration'

    def __str__(self):
        return f"Vector DB: {self.provider} / {self.index_name}"


class PlatformSettings(SingletonModel):
    platform_name = models.CharField(max_length=100, default='Arogya Sahayak')
    support_email = models.EmailField(default='support@arogyasahayak.in')
    maintenance_mode = models.BooleanField(default=False)
    rate_limit_per_minute = models.IntegerField(default=20)
    confidence_threshold = models.IntegerField(default=85)
    fallback_message = models.TextField(
        default="I'm sorry, I don't have enough verified information to answer that safely. "
                "Please consult a registered medical practitioner."
    )
    google_maps_api_key = models.CharField(max_length=500, blank=True, default='')

    class Meta:
        verbose_name = 'Platform Settings'

    def __str__(self):
        return f"Platform: {self.platform_name}"


class GuardrailConfig(SingletonModel):
    diagnosis_blocking = models.BooleanField(default=True)
    prescription_blocking = models.BooleanField(default=True)
    disclaimer_text = models.TextField(
        default="Disclaimer: This information is for educational purposes only and does not substitute "
                "professional medical advice. Always consult a doctor."
    )
    emergency_keywords = models.TextField(
        default="suicide, heart attack, stroke, chest pain, bleeding heavily, unconscious, poison"
    )
    emergency_response = models.TextField(
        default="This sounds like a medical emergency. Please call 112 or visit the nearest hospital immediately."
    )
    pii_redaction = models.BooleanField(default=True)
    toxicity_filter = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Guardrail Configuration'

    def __str__(self):
        return "Guardrail Config"


class SupabaseConfig(SingletonModel):
    """Supabase connection configuration — stored in DB for admin panel editing."""
    project_url = models.URLField(max_length=500, blank=True, default='')
    anon_key = models.CharField(max_length=500, blank=True, default='')
    service_key = models.CharField(max_length=500, blank=True, default='')
    database_url = models.CharField(max_length=1000, blank=True, default='')
    jwt_secret = models.CharField(max_length=500, blank=True, default='')
    is_configured = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Supabase Configuration'

    def __str__(self):
        status = "Configured" if self.is_configured else "Not Configured"
        return f"Supabase: {status}"


class WhatsAppConfig(SingletonModel):
    """Configuration for WhatsApp communication (Twilio Sandbox / Meta API)."""
    provider = models.CharField(max_length=20, choices=[('twilio', 'Twilio Sandbox'), ('meta', 'Meta Graph API')], default='twilio')
    phone_number_id = models.CharField(max_length=100, blank=True, default='')
    access_token = models.CharField(max_length=500, blank=True, default='')
    verify_token = models.CharField(max_length=100, blank=True, default='arogya_secret_token')
    is_active = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'WhatsApp Configuration'

    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"WhatsApp: {self.provider} ({status})"
