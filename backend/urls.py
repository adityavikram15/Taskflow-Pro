from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
# Sustituyo TokenObtainPairView por la versión personalizada que incluye el username en el JWT
from tasks.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
    # Uso la vista personalizada para que el token incluya el username del usuario
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    # El refresh no necesita personalización — solo renueva el token de acceso
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
]