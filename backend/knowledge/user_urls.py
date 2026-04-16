# user_urls.py

from django.urls import path
from . import user_views

urlpatterns = [
    path('user-documents/', user_views.user_documents_view, name='user-documents'),
    path('user-documents/<int:doc_id>/', user_views.user_document_detail_view, name='user-document-detail'),
]
