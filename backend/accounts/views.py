from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer

def build_auth_response(user, message):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    response = Response({"message": message}, status=200)
    response.set_cookie(key='access_token', value=access, httponly=True, samesite='Lax', secure=False)
    response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, samesite='Lax', secure=False)
    return response

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception = True)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self,request):
        user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
        if user is None:
            return Response({"error":"Invalid Credentials"}, status=401)
        return build_auth_response(user, "Login sucessfully")
    
class MeView(APIView):
    def get(self,request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)        

class LogoutView(APIView):
    def post(self,request):
            response = Response({"message":"Logout Sucessfully"}, status=200)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response