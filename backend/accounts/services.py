import logging

import requests
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import authenticate
from django.db import IntegrityError

from .models import User
import secrets
import redis
redis_client = redis.from_url(settings.REDIS_URL)

logger = logging.getLogger(__name__)

EXTERNAL_TIMEOUT = 10


class AuthenticationError(Exception):
    pass

class GithubOAuthError(Exception):
    pass
class TooManyAttemptsError(Exception):
    pass

class GithubAlreadyLinkedError(Exception):
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
    try:
        token_response = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
            timeout=EXTERNAL_TIMEOUT,
        )
        token_response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logger.warning("GitHub token exchange failed: %s", e)
        raise GithubOAuthError("Could not reach GitHub. Try again.")

    access_token = token_response.json().get("access_token")
    if not access_token:
        raise GithubOAuthError("Could not obtain GitHub access token")
    return access_token


def _fetch_github_profile(access_token):
    try:
        profile_response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=EXTERNAL_TIMEOUT,
        )
        profile_response.raise_for_status()
        return profile_response.json()
    except requests.exceptions.RequestException as e:
        logger.warning("GitHub profile fetch failed: %s", e)
        raise GithubOAuthError("Could not read your GitHub profile.")


def _fetch_github_primary_email(access_token):
    try:
        email_response = requests.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=EXTERNAL_TIMEOUT,
        )
        email_response.raise_for_status()
        emails = email_response.json()
    except requests.exceptions.RequestException as e:
        logger.warning("GitHub email fetch failed: %s", e)
        raise GithubOAuthError("Could not read your GitHub email.")

    primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
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
        try:
            user = User.objects.get(email=email)
            user.github_id = github_id
            user.github_token = access_token
            user.save()
        except User.DoesNotExist:  
            user = User.objects.create_user(
                username=username, email=email, github_id=github_id, github_token=access_token
            )

    return user

def link_github_account(user, code):
    access_token = _fetch_github_access_token(code)
    profile = _fetch_github_profile(access_token)
    github_id = str(profile['id'])
    if User.objects.filter(github_id=github_id).exclude(pk=user.pk).exists():
        raise GithubAlreadyLinkedError("This GitHub account is already linked to another Momentum account.")

    user.github_id = github_id
    user.github_token = access_token
    try:
        user.save(update_fields=["github_id","github_token"])
        return user
    except IntegrityError:
        raise GithubAlreadyLinkedError("This GitHub account is already linked to another Momentum account.")

def revoke_github_token(access_token):
    url = f"https://api.github.com/applications/{settings.GITHUB_CLIENT_ID}/grant"

    try:
        response = requests.delete(
            url,
            auth = (settings.GITHUB_CLIENT_ID, settings.GITHUB_CLIENT_SECRET),
            json = {"access_token" : access_token},
            timeout=EXTERNAL_TIMEOUT
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logger.warning("Failed to revoke GitHub authorization: %s", e)    
    
def unlink_github_account(user):
    github_token = user.github_token
    if github_token:
        revoke_github_token()
        user.github_id = None
        user.github_token = None
        user.save(updated_fields=["github_id", "github_token"])
    
def create_oauth_state(user_id, provider):
    state = secrets.token_urlsafe(32)
    redis_client.setex(f"oauth_state:{provider}:{state}", 600, str(user_id))
    return state


def consume_oauth_state(state, provider):
    if not state:
        return None
    value = redis_client.getdel(f"oauth_state:{provider}:{state}")
    return value.decode() if value else None

def generate_otp():
    return secrets.randbelow(900000) + 100000


def store_otp(email):
    otp = generate_otp()
    key = f"email_otp:{email}"    

    redis_client.setex(key, settings.OTP_TTL_SECONDS, otp)
    return otp

from django.core.mail import send_mail

def send_otp_email(email, otp):
    minutes = settings.OTP_TTL_SECONDS // 60
    send_mail(
        subject="Momentum Verification Code",
        message=f"Your Momentum verification code is {otp}. This code expires in {minutes} minutes.",
        from_email="noreply@momentum.com",
        recipient_list=[email],
    )

def send_otp(email):
    key = f"otp_send:{email}"

    pipeline = redis_client.pipeline()
    pipeline.incr(key)
    pipeline.expire(key, settings.OTP_SEND_WINDOW_SECONDS, nx=True)
    count = pipeline.execute()[0]

    if count > settings.OTP_SEND_LIMIT:
        raise TooManyAttemptsError

    otp = store_otp(email)
    send_otp_email(email, otp)

   
def verify_otp(email,otp):
    otp_key = f"otp_attempt:{email}"
    key = f"email_otp:{email}"
    stored_otp = redis_client.get(key)

    if stored_otp is None:
        return False
    stored_otp = stored_otp.decode()

    if not stored_otp:
        return False
    else:
        if otp == stored_otp:
            redis_client.delete(key, otp_key)
            return True
        else:
            pipeline = redis_client.pipeline()
            pipeline.incr(otp_key)
            pipeline.expire(otp_key, settings.OTP_TTL_SECONDS, nx=True)
            count = pipeline.execute()[0]

            if count >= settings.OTP_VERIFY_LIMIT:
                redis_client.delete(key)
            return False

def createusername(email, username):
    verified_key = f"email_verified:{email}"
    res = redis_client.get(verified_key)
    if not res:
        return False
    res = res.decode()
    if res == "true":
        Username = username
        username_exists = User.objects.filter(username=Username).first()
        if username_exists is None:
            user = User.objects.create_user(email=email,username=username)
            user.set_unusable_password()
            user.save()
            redis_client.delete(verified_key)
            return user
        else:
            return False   
    else:
        return False