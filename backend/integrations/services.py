import requests
from django.conf import settings


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
