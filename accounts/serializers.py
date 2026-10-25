
from rest_framework import serializers
from accounts.models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'})
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'avatar',
            'email',
            'first_name',
            'last_name',
            'rules',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
            'user_code',
            'password',
            'password2',
        ]
        read_only_fields = [
            'id',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
            'user_code',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                'password2': 'Passwords do not match'
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        return CustomUser.objects.create_user(password=password,**validated_data)

    def validate_email(self, value):
        queryset = CustomUser.objects.filter(email__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('Email already exists')

        return value


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email']

class UserDetailSerializer(serializers.ModelSerializer):
    avatar = serializers.URLField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'avatar',
            'first_name',
            'last_name',
            'user_code',
            'email',
            'rules',
        ]
        read_only_fields = [
            'id',
            'user_code',
            'email',
            'rules',
        ]

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})
