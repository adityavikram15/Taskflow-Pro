from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority',
            'status', 'due_date', 'category', 'created_at'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # Uso create_user para que Django hashee la contraseña correctamente
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        # Llamo al método padre para obtener el token base con user_id y expiración
        token = super().get_token(user)
        # Añado el username al payload del JWT para poder mostrarlo en el frontend
        # sin necesidad de hacer una llamada extra al backend
        token['username'] = user.username
        return token