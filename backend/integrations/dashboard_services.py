from accounts.models import User
from .services import fetch_wakatime_stats, fetch_github_commits, fetch_github_repos

def get_dashboard_data(user):
    wakatime_token = user.objects.get(wakatime_token)
    if wakatime_token == True:
        fetch_wakatime_stats(wakatime_token)
    github_token = user.objects.get(github_token)
    fetch_github_repos(github_token)
    fetch_github_commits(github_token)