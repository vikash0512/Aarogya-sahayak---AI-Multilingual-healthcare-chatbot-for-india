from django.urls import path
from . import views

urlpatterns = [
    path('documents/', views.list_documents, name='documents-list'),
    path('documents/upload/', views.upload_document, name='document-upload'),
    path('documents/<int:doc_id>/process/', views.process_document_view, name='document-process'),
    path('documents/<int:doc_id>/delete/', views.delete_document, name='document-delete'),
    path('documents/<int:doc_id>/reindex/', views.reindex_document, name='document-reindex'),
    path('documents/<int:doc_id>/status/', views.document_status, name='document-status'),
]
