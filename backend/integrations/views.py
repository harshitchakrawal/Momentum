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
    sync_github_repos,
    sync_github_commits
)


class GithubRepoViews(APIView):
    def get(self, request):
        sync_github_repos(request.user.github_token, request.user)

        repos = Repo.objects.filter(user=request.user)   
        serializer = RepoSerializer(repos, many=True)
        return Response(serializer.data)
        

class GithubCommitViews(APIView):
    def get(self, request):
        sync_github_commits(request.user.github_token, request.user)
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
