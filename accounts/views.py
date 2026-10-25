
from django.contrib.auth import authenticate
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (UserDetailSerializer,LoginSerializer,
                          UserListSerializer,CustomUserSerializer)
from rest_framework.decorators import action

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self,request):
        user = CustomUserSerializer(data=request.data)
        if user.is_valid():
            user.save()
            return Response(user.data,status=status.HTTP_201_CREATED)
        return Response(user.errors,status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data['email'],
                                password=serializer.validated_data['password'])
            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                })
            return Response({'detail': 'Invalid email or password'},
                            status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self,request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({'detail':'Refresh token is required'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            if str(token['user_id']) != str(request.user.id):
                return Response({'detail':'Invalid refresh token'},status=status.HTTP_400_BAD_REQUEST)
            token.blacklist()
            return Response({'detail':'logout successful'},status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'detail': 'Invalid refresh token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileViewSet(viewsets.GenericViewSet):
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response({"profile": serializer.data})

    @action(detail=False, methods=['patch'],url_path='edit')
    def edit(self,request,*args, **kwargs):
        profile = self.get_serializer(request.user,data=request.data,partial=True)
        profile.is_valid(raise_exception=True)
        profile.save()
        return Response({"profile": profile.data})