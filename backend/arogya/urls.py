from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls')),
    path('api/admin/', include('config.urls')),
    path('api/admin/', include('knowledge.urls')),
    path('api/admin/', include('audit.urls')),
    path('api/', include('chat.urls')),
    path('api/', include('core.user_urls')),
    path('api/knowledge/', include('knowledge.user_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
