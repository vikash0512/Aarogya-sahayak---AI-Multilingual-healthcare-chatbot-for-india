from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'status', 'language_preference', 'last_active']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.CharField(write_only=True, required=False, default='patient')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'role', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class SignUpSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        name_parts = validated_data['name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        UserProfile.objects.create(user=user, role='patient')
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class UserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['admin', 'doctor', 'patient'], required=False)
    status = serializers.ChoiceField(choices=['active', 'suspended'], required=False)
