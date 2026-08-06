import requests
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate

from .models import User


class AuthenticationError(Exception):
    pass


class GithubOAuthError(Exception):
    pass


def issue_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    return access, str(refresh)

def authenticate_user(email, password):
    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        raise AuthenticationError("Invalid Credentials")

    user = authenticate(username=user_obj.username, password=password)
    if user is None:
        raise AuthenticationError("Invalid Credentials")

    return user


def refresh_access_token(refresh_token):
    if refresh_token is None:
        raise AuthenticationError("No refresh token")

    try:
        refresh = RefreshToken(refresh_token)
        return str(refresh.access_token)
    except (InvalidToken, TokenError):
        raise AuthenticationError("Refresh token expired, please login again")


def _fetch_github_access_token(code):
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
    if not access_token:
        raise GithubOAuthError("Could not obtain GitHub access token")
    return access_token


def _fetch_github_profile(access_token):
    profile_response = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return profile_response.json()


def _fetch_github_primary_email(access_token):
    email_response = requests.get(
        "https://api.github.com/user/emails",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    emails = email_response.json()
    primary = next((e for e in emails if e.get("primary")), None)
    return primary["email"] if primary else None


def github_oauth_authenticate(code):
    access_token = _fetch_github_access_token(code)
    profile = _fetch_github_profile(access_token)

    github_id = str(profile.get("id"))
    username = profile.get("login")
    email = profile.get("email") or _fetch_github_primary_email(access_token)

    try:
        user = User.objects.get(github_id=github_id)
        user.github_token = access_token
        user.save()
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username, email=email, github_id=github_id, github_token=access_token
        )

    return user