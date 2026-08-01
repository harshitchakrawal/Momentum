from django.urls import path
from .views import GithubRepoViews

urlpatterns = [
    path('repos/', GithubRepoViews.as_view(), name = 'github_repos')
]