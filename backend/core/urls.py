from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('refresh/', views.refresh_view, name='token_refresh'),
    path('me/', views.me_view, name='auth-me'),
    path('profile/', views.user_profile_view, name='user-profile'),
]
