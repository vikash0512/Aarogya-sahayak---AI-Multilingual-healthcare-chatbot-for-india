from django.urls import path
from . import views

urlpatterns = [
    path('audit-logs/', views.audit_logs_view, name='audit-logs'),
    path('dashboard/stats/', views.dashboard_stats_view, name='dashboard-stats'),
]
