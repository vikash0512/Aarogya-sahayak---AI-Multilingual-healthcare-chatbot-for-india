from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.users_list_view, name='users-list'),
    path('users/<int:user_id>/', views.user_update_view, name='user-update'),
]
