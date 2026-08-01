from django.shortcuts import render

from rest_framework.views import APIView
import requests
from rest_framework.response import Response

# Create your views here.
class GithubRepoViews(APIView):
    def get(self,request):
        access_token = request.user.github_token

        if access_token is None:
            return Response({"message": "Github Not Connected"}, status=401)
        response = requests.get(
            'https://api.github.com/user/repos',
            headers = {"Authorization" : f"Bearer {access_token}"}
        )
        return Response(response.json())
