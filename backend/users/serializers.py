from rest_framework import serializers
from .models import User

# ---------------- USER SERIALIZER ----------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'phone', 'address']

# ---------------- REGISTRATION SERIALIZER ----------------
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'role', 'phone', 'address']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            role=validated_data.get('role', 'contact'),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
