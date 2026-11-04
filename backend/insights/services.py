import json
import logging

from django.conf import settings
from django.utils import timezone
from google import genai
from pydantic import BaseModel

from .metrics import build_metrics
from .models import Insight

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the coaching engine inside Momentum, a coding productivity app for student developers.
You receive one developer's activity metrics for the last 7 days as JSON: commits, repositories, tasks, notes and (if connected) WakaTime coding time.
Tell them where they are doing well, where they are lagging, and give 2-3 concrete, doable steps to improve this week.
Ground every statement ONLY in the numbers given; never invent repos, languages or figures. Hours in commits_by_hour_utc are UTC.
If a section is null or nearly empty, say what is missing instead of guessing.
Keep the tone warm and direct, like a senior developer mentoring a student. Keep each item body under 40 words."""


class InsightItem(BaseModel):
    title: str
    body: str
    kind: str


class InsightResult(BaseModel):
    headline: str
    items: list[InsightItem]


class InsightGenerationError(Exception):
    pass


_client = None


def _get_client():
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise InsightGenerationError("GEMINI_API_KEY is not configured.")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def generate_insight(metrics):
    try:
        response = _get_client().models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=json.dumps(metrics, sort_keys=True),
            config={
                "system_instruction": SYSTEM_PROMPT,
                "response_mime_type": "application/json",
                "response_schema": InsightResult,
            },
        )
    except InsightGenerationError:
        raise
    except Exception as e:
        logger.warning("Gemini insight call failed: %s", e)
        raise InsightGenerationError("Could not generate insights right now.")

    if response.parsed is None:
        raise InsightGenerationError("No insight returned.")
    return response.parsed


def create_insight_for_user(user):
    metrics = build_metrics(user)
    result = generate_insight(metrics)
    insight, _ = Insight.objects.update_or_create(
        user=user,
        date=timezone.localdate(),
        defaults={
            "headline": result.headline,
            "items": [item.model_dump() for item in result.items],
            "metrics": metrics,
        },
    )
    return insight
