import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogya.settings')
django.setup()

from knowledge.models import Document
docs = Document.objects.filter(status='processing')
print(f"Found {docs.count()} documents stuck in processing.")
for doc in docs:
    doc.status = 'failed'
    doc.error_message = 'Process forcefully terminated due to server restart.'
    doc.save()
print("Successfully reset documents.")
