from django.conf import settings
from django.shortcuts import redirect

from rest_framework.views import APIView
from rest_framework.response import Response
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
)

# 502 rather than 401: the caller's session is fine, the upstream provider is
# what failed. A 401 here would make the frontend log the user out entirely.
UPSTREAM_FAILED = 502


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
        wakatime_authorize_url = (
            "https://wakatime.com/oauth/authorize"
            f"?client_id={settings.WAKATIME_CLIENT_ID}"
            "&response_type=code"
            "&redirect_uri=http://localhost:8000/api/wakatime/callback/"
            "&scope=read_stats"
        )
        return redirect(wakatime_authorize_url)


class WakatimeCallbackView(APIView):
    def get(self, request):
        code = request.GET.get('code')

        try:
            token = wakatime_oauth_authenticate(code)
        except WakatimeOAuthError as e:
            return Response({"error": str(e)}, status=400)

        request.user.wakatime_token = token
        request.user.save()

        return redirect("http://localhost:3000/dashboard")
    
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
    