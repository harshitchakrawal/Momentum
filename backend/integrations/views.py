from django.conf import settings
from django.shortcuts import redirect

from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.models import User
from accounts.services import create_oauth_state, consume_oauth_state

from .serializers import RepoSerializer, CommitSerializer
from .models import Repo, Commit

from .services import (
    fetch_github_commits,
    wakatime_oauth_authenticate,
    WakatimeOAuthError,
    WakatimeApiError,
    GithubApiError,
    sync_github_repos,
    sync_github_commits,
    fetch_wakatime_stats,
    fetch_wakatime_todaygraph,
    unlink_wakatime_account,
)

# 502 rather than 401: the caller's session is fine, the upstream provider is
# what failed. A 401 here would make the frontend log the user out entirely.
UPSTREAM_FAILED = 502

FRONTEND_DASHBOARD = "http://localhost:3000/dashboard"


class GithubRepoViews(APIView):
    def get(self, request):
        try:
            sync_github_repos(request.user.github_token, request.user)
        except GithubApiError as e:
            return Response({"error": str(e)}, status=UPSTREAM_FAILED)

        repos = Repo.objects.filter(user=request.user)
        serializer = RepoSerializer(repos, many=True)
        return Response(serializer.data)


class GithubCommitViews(APIView):
    def get(self, request):
        try:
            sync_github_commits(request.user.github_token, request.user)
        except GithubApiError as e:
            return Response({"error": str(e)}, status=UPSTREAM_FAILED)

        commit = Commit.objects.filter(repo__user=request.user)
        serializer = CommitSerializer(commit, many=True)
        return Response(serializer.data)

class WakatimeConnectView(APIView):
    def get(self, request):
        state = create_oauth_state(request.user.id, "wakatime")
        wakatime_authorize_url = (
            "https://wakatime.com/oauth/authorize"
            f"?client_id={settings.WAKATIME_CLIENT_ID}"
            "&response_type=code"
            "&redirect_uri=http://localhost:8000/api/wakatime/callback/"
            "&scope=read_stats"
            f"&state={state}"
        )
        return redirect(wakatime_authorize_url)


class WakatimeCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user_id = consume_oauth_state(request.GET.get('state'), "wakatime")
        if user_id is None:
            return redirect(f"{FRONTEND_DASHBOARD}?error=invalid_state")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return redirect(f"{FRONTEND_DASHBOARD}?error=invalid_state")

        try:
            token = wakatime_oauth_authenticate(request.GET.get('code'))
        except WakatimeOAuthError:
            return redirect(f"{FRONTEND_DASHBOARD}?error=wakatime_failed")

        user.wakatime_token = token
        user.save(update_fields=["wakatime_token"])

        return redirect(FRONTEND_DASHBOARD)


class WakatimeDisconnectView(APIView):
    def post(self, request):
        unlink_wakatime_account(request.user)
        return Response({"message": "WakaTime disconnected"}, status=200)


class WakatimeStatsView(APIView):
    def get(self, request):
        try:
            stats = fetch_wakatime_stats(request.user.wakatime_token)
        except WakatimeApiError as e:
            return Response({"error": str(e)}, status=UPSTREAM_FAILED)

        return Response(stats)
    
class WakatimeTodayStatsView(APIView):
    def get(self, request):
        try:
            stats = fetch_wakatime_todaygraph(request.user.wakatime_token)
        except WakatimeApiError as e:
            return Response({"error": str(e)}, status=UPSTREAM_FAILED)

        return Response(stats)
    