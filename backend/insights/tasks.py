import logging

from celery import shared_task

from accounts.models import User
from .services import InsightGenerationError, create_insight_for_user

logger = logging.getLogger(__name__)

STAGGER_SECONDS = 5


@shared_task
def generate_insight_for_user(user_id):
    user = User.objects.filter(id=user_id).first()
    if user is None:
        return

    try:
        create_insight_for_user(user)
    except InsightGenerationError as e:
        logger.warning("Insight generation failed for user %s: %s", user_id, e)


@shared_task
def generate_all_insights():
    user_ids = User.objects.filter(is_active=True).values_list("id", flat=True)

    for index, user_id in enumerate(user_ids):
        generate_insight_for_user.apply_async(
            args=[user_id], countdown=index * STAGGER_SECONDS
        )
