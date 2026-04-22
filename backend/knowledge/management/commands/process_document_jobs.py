import time

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from knowledge.models import DocumentIngestionJob
from knowledge.processor import process_document


class Command(BaseCommand):
    help = 'Continuously process queued document ingestion jobs.'

    def add_arguments(self, parser):
        parser.add_argument('--once', action='store_true', help='Process at most one queued job and exit.')
        parser.add_argument('--sleep', type=float, default=5.0, help='Seconds to wait between queue polls.')

    def handle(self, *args, **options):
        once = options['once']
        sleep_seconds = options['sleep']

        self.stdout.write(self.style.SUCCESS('Document ingestion worker started'))

        while True:
            job = self._claim_next_job()
            if not job:
                if once:
                    break
                time.sleep(sleep_seconds)
                continue

            self.stdout.write(f"Processing job {job.id} for document {job.document_id}")
            job.attempts += 1
            job.status = 'processing'
            job.started_at = timezone.now()
            job.error_message = ''
            job.save(update_fields=['attempts', 'status', 'started_at', 'error_message', 'updated_at'])

            try:
                success = process_document(job.document_id)
                if success:
                    job.status = 'completed'
                    job.finished_at = timezone.now()
                    job.error_message = ''
                    job.save(update_fields=['status', 'finished_at', 'error_message', 'updated_at'])
                else:
                    job.status = 'failed'
                    job.finished_at = timezone.now()
                    job.error_message = job.document.error_message or 'Document processing failed'
                    job.save(update_fields=['status', 'finished_at', 'error_message', 'updated_at'])
            except Exception as exc:
                job.status = 'failed'
                job.finished_at = timezone.now()
                job.error_message = str(exc)[:500]
                job.save(update_fields=['status', 'finished_at', 'error_message', 'updated_at'])

            if once:
                break

    def _claim_next_job(self):
        with transaction.atomic():
            job = (
                DocumentIngestionJob.objects
                .select_for_update(skip_locked=True)
                .filter(status='queued')
                .order_by('created_at')
                .first()
            )
            if not job:
                return None

            job.status = 'processing'
            job.started_at = timezone.now()
            job.error_message = ''
            job.save(update_fields=['status', 'started_at', 'error_message', 'updated_at'])
            return job