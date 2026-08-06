from django.conf import settings
from django.shortcuts import redirect

from rest_framework.views import APIView
from rest_framework.response import Response

from .services import (
    fetch_github_repos,
    fetch_github_commits,
    wakatime_oauth_authenticate,
    WakatimeOAuthError,
)


class GithubRepoViews(APIView):
    def get(self, request):
        repos = fetch_github_repos(request.user.github_token)
        return Response(repos)


class GithubCommitViews(APIView):
    def get(self, request):
        commits = fetch_github_commits(request.user.github_token)
        return Response(commits)


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
