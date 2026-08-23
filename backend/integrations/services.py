import logging

import requests
from django.conf import settings
from .models import Repo, Commit

logger = logging.getLogger(__name__)

EXTERNAL_TIMEOUT = 10


class WakatimeOAuthError(Exception):
    pass
class GithubApiError(Exception):
    pass
class WakatimeApiError(Exception):
    pass


def fetch_github_repos(github_token):
    try:
        response = requests.get(
            'https://api.github.com/user/repos',
            headers={"Authorization": f"Bearer {github_token}"},
            timeout=EXTERNAL_TIMEOUT,
        )
        response.raise_for_status()
        return response.json()
    # Parent class, so this also covers Timeout and ConnectionError.
    except requests.exceptions.RequestException as e:
        logger.warning("GitHub repo fetch failed: %s", e)
        raise GithubApiError("Could not reach GitHub. Try reconnecting your account.")


def fetch_github_commits(github_token, repo_limit=5, commit_limit=15):
    repos = fetch_github_repos(github_token)
    top_repos = repos[:repo_limit]
    all_commits = []

    for repo in top_repos:
        try:
            commit_response = requests.get(
                f'https://api.github.com/repos/{repo["full_name"]}/commits',
                headers={"Authorization": f"Bearer {github_token}"},
                timeout=EXTERNAL_TIMEOUT,
            )
            commit_response.raise_for_status()
            all_commits.extend(commit_response.json())
        except requests.exceptions.RequestException as e:
            logger.warning("Skipped commits for %s: %s", repo["full_name"], e)
            continue

    sorted_commits = sorted(
        all_commits,
        key=lambda c: c['commit']['author']['date'],
        reverse=True,
    )

    return sorted_commits[:commit_limit]


def _fetch_wakatime_access_token(code):
    try:
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
            timeout=EXTERNAL_TIMEOUT,
        )
        token_response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logger.warning("WakaTime token exchange failed: %s", e)
        raise WakatimeOAuthError("Could not reach WakaTime. Try again.")

    access_token = token_response.json().get("access_token")
    if not access_token:
        raise WakatimeOAuthError("Could not obtain wakatime token")
    return access_token


def wakatime_oauth_authenticate(code):
    return _fetch_wakatime_access_token(code)

def sync_github_repos(github_token, user):
    repos = fetch_github_repos(github_token)

    for repo_data in repos:
        # Both fields go in the lookup: "this user's copy of this repo",
        # not "whoever owns this repo id".
        Repo.objects.update_or_create(
            user=user,
            github_repo_id=repo_data["id"],
            defaults={
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
            try:
                commit_response = requests.get(
                        f'https://api.github.com/repos/{repo.full_name}/commits',
                        headers={"Authorization": f"Bearer {github_token}"},
                        timeout=EXTERNAL_TIMEOUT,
                    )
                commit_response.raise_for_status()
                commits = commit_response.json()
            except requests.exceptions.RequestException as e:
                logger.warning("Skipped commit sync for %s: %s", repo.full_name, e)
                continue

            for commit_data in commits:
                Commit.objects.update_or_create(
                    repo=repo,
                    sha=commit_data["sha"],
                    defaults={
                        "message": commit_data["commit"]["message"],
                        "author_name": commit_data["commit"]["author"]["name"],
                        "author_date": commit_data["commit"]["author"]["date"],
                        "html_url": commit_data["html_url"],
                    }
                )
def fetch_wakatime_stats(wakatime_token):
    try:
        response = requests.get("https://wakatime.com/api/v1/users/current/stats/last_7_days",
                                headers={
                                    "Authorization": f"Bearer {wakatime_token}"
                                },
                                timeout=EXTERNAL_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.warning("WakaTime stats fetch failed: %s", e)
        raise WakatimeApiError("Could not reach WakaTime. Try reconnecting your account.")
    
def fetch_wakatime_todaygraph(wakatime_token):
    try:
        response = requests.get("https://wakatime.com/api/v1/users/current/status_bar/today",
                                headers={
                                    "Authorization": f"Bearer {wakatime_token}"
                                },
                                timeout=EXTERNAL_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.warning("WakaTime stats fetch failed: %s", e)
        raise WakatimeApiError("Could not reach WakaTime. Try reconnecting your account.")