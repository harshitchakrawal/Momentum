from django.urls import path
from .views import GithubRepoViews, GithubCommitViews, GithubSyncView

urlpatterns = [
    path('repos/', GithubRepoViews.as_view(), name = 'github_repos'),
    path('commits/', GithubCommitViews.as_view(), name = 'github_commits'),
    path('sync/', GithubSyncView.as_view(), name = 'github_sync'),
]
