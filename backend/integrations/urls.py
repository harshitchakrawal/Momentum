from django.urls import path
from .views import GithubRepoViews, GithubCommitViews

urlpatterns = [
    path('repos/', GithubRepoViews.as_view(), name = 'github_repos'),
    path('commits/', GithubCommitViews.as_view(), name = 'github_commits')
]