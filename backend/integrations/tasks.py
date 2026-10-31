import logging

from celery import shared_task

from accounts.models import User
from .services import GithubApiError, sync_github_commits, sync_github_repos

logger = logging.getLogger(__name__)


@shared_task
def sync_github_for_user(user_id):
    user = User.objects.filter(id=user_id).first()
    if user is None or not user.github_token:
        return

    try:
        sync_github_repos(user.github_token, user)
        sync_github_commits(user.github_token, user)
    except GithubApiError as e:
        logger.warning("GitHub sync failed for user %s: %s", user_id, e)


@shared_task
def sync_all_github():
    user_ids = (
        User.objects.filter(github_token__isnull=False)
        .exclude(github_token="")
        .values_list("id", flat=True)
    )

    for user_id in user_ids:
        sync_github_for_user.delay(user_id)
