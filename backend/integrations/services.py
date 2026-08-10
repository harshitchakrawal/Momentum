import requests
from django.conf import settings
from .models import Repo, Commit


class WakatimeOAuthError(Exception):
    pass


def fetch_github_repos(github_token):
    response = requests.get(
        'https://api.github.com/user/repos',
        headers={"Authorization": f"Bearer {github_token}"},
    )
    return response.json()


def fetch_github_commits(github_token, repo_limit=5, commit_limit=15):
    repos = fetch_github_repos(github_token)
    top_repos = repos[:repo_limit]
    all_commits = []

    for repo in top_repos:
        commit_response = requests.get(
            f'https://api.github.com/repos/{repo["full_name"]}/commits',
            headers={"Authorization": f"Bearer {github_token}"},
        )
        all_commits.extend(commit_response.json())

    sorted_commits = sorted(
        all_commits,
        key=lambda c: c['commit']['author']['date'],
        reverse=True,
    )

    return sorted_commits[:commit_limit]


def _fetch_wakatime_access_token(code):
    token_response = requests.post(
        "https://wakatime.com/oauth/token",
        headers={"Accept": "application/json"},
        data={
            "client_id": settings.WAKATIME_CLIENT_ID,
            "client_secret": settings.WAKATIME_CLIENT_SECRET,
            "redirect_uri": "http://localhost:8000/api/wakatime/callback/",
            "grant_type": "authorization_code",
            "code": code,
        },
    )
    access_token = token_response.json().get("access_token")
    if not access_token:
        raise WakatimeOAuthError("Could not obtain wakatime token")
    return access_token


def wakatime_oauth_authenticate(code):
    return _fetch_wakatime_access_token(code)

def sync_github_repos(github_token, user):
    repos = fetch_github_repos(github_token)

    for repo_data in repos:
        Repo.objects.update_or_create(
            github_repo_id=repo_data["id"],
            defaults={
                "user": user,
                "name": repo_data["name"],
                "full_name": repo_data["full_name"],
                "html_url": repo_data["html_url"],
                "language": repo_data["language"],
                "updated_at": repo_data["updated_at"],
                "private": repo_data["private"],
            }
        )

def sync_github_commits(github_token, user):
    repo_data = Repo.objects.filter(user=user)

    for repo in repo_data:
            commits = requests.get(
                        f'https://api.github.com/repos/{repo.full_name}/commits',
                        headers={"Authorization": f"Bearer {github_token}"},
                    ).json()
            for commit_data in commits:
                Commit.objects.update_or_create(
                    sha = commit_data["sha"],
                    defaults={
                        "repo" : repo,
                        "message": commit_data["commit"]["message"],
                        "author_name": commit_data["commit"]["author"]["name"],
                        "author_date": commit_data["commit"]["author"]["date"],
                        "html_url": commit_data["html_url"],
                    }
                )