from django.shortcuts import render, redirect
from django.conf import settings

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import User
import redis

from .serializers import RegisterSerializer, UserSerializer, SendOTPSerializer, VerifyOTPSerializer, CreateUserSerializers
from .services import (
    authenticate_user,
    github_oauth_authenticate,
    issue_tokens_for_user,
    refresh_access_token,
    AuthenticationError,
    GithubOAuthError,
    send_otp,
    verify_otp,
    createusername
)
redis_client = redis.from_url(settings.REDIS_URL)

def set_auth_cookies(response, access, refresh=None):
    response.set_cookie(key='access_token', value=access, httponly=True, samesite='Lax', secure=False)
    if refresh is not None:
        response.set_cookie(key='refresh_token', value=refresh, httponly=True, samesite='Lax', secure=False)
    return response

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        access, refresh = issue_tokens_for_user(user)
        return set_auth_cookies(Response({"message": "Registered sucessfully"}, status=200), access, refresh)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            user = authenticate_user(request.data.get('email'), request.data.get('password'))
        except AuthenticationError as e:
            return Response({"error": str(e)}, status=401)

        access, refresh = issue_tokens_for_user(user)
        return set_auth_cookies(Response({"message": "Login sucessfully"}, status=200), access, refresh)

class MeView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logout Sucessfully"}, status=200)
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
        code = request.GET.get('code')

        try:
            user = github_oauth_authenticate(code)
        except GithubOAuthError as e:
            return Response({"error": str(e)}, status=400)

        access, refresh = issue_tokens_for_user(user)
        response = redirect("http://localhost:3000/dashboard")
        return set_auth_cookies(response, access, refresh)


class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            access = refresh_access_token(request.COOKIES.get('refresh_token'))
        except AuthenticationError as e:
            return Response({"error": str(e)}, status=401)

        response = Response({"message": "Token Refreshed"}, status=200)
        return set_auth_cookies(response, access)


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self,request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            send_otp(email)
            return Response({"message":"OTP is send Sucessfully"}, status=200)
        else:
            return Response({"message":"Wrong Email Format"}, status=400)    

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]
            response = verify_otp(email, otp)

            if response is True:
                user = User.objects.filter(email=email).first()
                if user is None:
                    verified_key = f"email_verified:{email}"
                    redis_client.setex(verified_key, 600, "true")
                    return Response({"message":"OTP Verified", "user_exists":False}, status=200)
                else:
                    access, refresh = issue_tokens_for_user(user)
                    return Response({ "message":"OTP Verified","user_exists":True, "access":access, "refresh":refresh }, status=200)
            else:    
                return Response({"message":"Wrong OTP"}, status=400)
        else:
            return Response({"message":"Invalid Email or OTP"}, status=400)

class CreateUsernameView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        
        serializers = CreateUserSerializers(data=request.data)
        if serializers.is_valid():
            username = serializers.validated_data["username"]
            email = serializers.validated_data["email"]
            user = createusername(email, username)
            if user is False:
                return Response({"message":"Verification Expired or Username is taken."}, status=401)
            else:
                access, refresh = issue_tokens_for_user(user)
                return Response({"access":access, "refresh":refresh}, status=200)
        else:
            return Response(serializers.errors, status=400)
