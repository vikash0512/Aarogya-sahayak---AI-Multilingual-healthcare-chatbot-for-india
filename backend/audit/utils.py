from .models import AuditLog


def log_action(action, resource, ip='', status_val='Success', user=None, details=None):
    """Utility to create audit log entries from anywhere in the app."""
    try:
        AuditLog.objects.create(
            user=user if user and hasattr(user, 'pk') and user.pk else None,
            action=action,
            resource=resource,
            ip_address=ip or None,
            status=status_val,
            details=details,
        )
    except Exception:
        pass  # Don't let logging failures break the app
