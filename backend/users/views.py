from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer

# ===================== REGISTER =====================
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ===================== LOGIN =====================
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login a user and return JWT tokens
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ===================== LOGOUT =====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout a user by blacklisting their refresh token
    """
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


# ===================== USER PROFILE =====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ===================== ROLES INFO =====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_roles_info(request):
    """
    Get information about available roles
    """
    return Response({
        'roles': [{'value': choice[0], 'label': choice[1]} for choice in User.ROLE_CHOICES],
        'current_user': {
            'username': request.user.username,
            'role': request.user.role,
            'is_admin': request.user.is_admin,
            'is_invoicing_user': request.user.is_invoicing_user,
            'is_contact': request.user.is_contact,
        }
    }, status=status.HTTP_200_OK)


# ===================== CHECK USERNAME =====================
@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    """
    Check if username is available
    """
    username = request.query_params.get('username', '')
    if not username:
        return Response({'available': False, 'error': 'No username provided'})
    
    exists = User.objects.filter(username=username).exists()
    return Response({'available': not exists})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_by_role(request, role):
    """
    Get users by role
    """
    users = User.objects.filter(role=role)
    serializer = UserSerializer(users, many=True)
    return Response({
        'role': role,
        'count': users.count(),
        'users': serializer.data
    }, status=200)
