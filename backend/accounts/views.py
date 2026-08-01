from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
from .models import User
from django.shortcuts import redirect
from django.conf import settings

import requests

def set_auth_cookies(response, user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    response.set_cookie(key='access_token', value=access, httponly=True, samesite='Lax', secure=False)
    response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, samesite='Lax', secure=False)
    return response

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return set_auth_cookies(Response({"message": "Registered sucessfully"}, status=200), user)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid Credentials"}, status=401)

        user = authenticate(username=user_obj.username, password=password)

        if user is None:
            return Response({"error": "Invalid Credentials"}, status=401)

        return set_auth_cookies(Response({"message": "Login sucessfully"}, status=200), user)


    
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

class GithubLoginView(APIView):
       permission_classes = [permissions.AllowAny] 
       
       def get(self, request):
        github_authorize_url = (
            "https://github.com/login/oauth/authorize"
            f"?client_id={settings.GITHUB_CLIENT_ID}"
            "&redirect_uri=http://localhost:8000/api/auth/github/callback/"
            "&scope=read:user user:email"
        )
        return redirect(github_authorize_url)

class GithubCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # url se code letaa hai
        code = request.GET.get('code') 
        token_response = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
        )
        access_token = token_response.json().get("access_token")

        profile_response = requests.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {access_token}"},
            )
        profile = profile_response.json()

        github_id = str(profile.get("id"))
        username = profile.get("login")
        email = profile.get("email")

        if email is None:
            email_response = requests.get(
                "https://api.github.com/user/emails",
                headers = {"Authorization": f"Bearer {access_token}"}
            )
            emails = email_response.json()
            primary = next((e for e in emails if e.get("primary")), None)
            email = primary["email"] if primary else None

        try:
            user = User.objects.get(github_id=github_id)
            user.github_token = access_token
            user.save()

        except User.DoesNotExist:
            user = User.objects.create_user(username=username, email=email, github_id=github_id, github_token=access_token)

        response = redirect("http://localhost:3000/dashboard")
        return set_auth_cookies(response, user)