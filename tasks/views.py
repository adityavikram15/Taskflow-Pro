from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Task
from .serializers import TaskSerializer, RegisterSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Cada usuario solo ve sus propias tareas, nunca las de otros usuarios
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Asocio automáticamente la tarea al usuario autenticado al crearla
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # El registro es público — no requiere token para acceder
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    # Uso el serializer personalizado que añade el username al payload del JWT
    serializer_class = CustomTokenObtainPairSerializer