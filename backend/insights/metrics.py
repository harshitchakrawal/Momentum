from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import ExtractHour, TruncDate
from django.utils import timezone

from integrations.models import Commit, Repo
from integrations.services import WakatimeApiError, fetch_wakatime_stats
from notes.models import Note
from tasks.models import Task

WINDOW_DAYS = 7
INACTIVE_AFTER_DAYS = 10


def _commit_metrics(user, since, today):
    commits = Commit.objects.filter(repo__user=user, author_date__gte=since)

    per_day = {
        row["day"].isoformat(): row["count"]
        for row in commits.annotate(day=TruncDate("author_date"))
        .values("day")
        .annotate(count=Count("id"))
    }
    commits_per_day = {
        (today - timedelta(days=offset)).isoformat(): per_day.get(
            (today - timedelta(days=offset)).isoformat(), 0
        )
        for offset in range(WINDOW_DAYS - 1, -1, -1)
    }

    by_hour = {
        row["hour"]: row["count"]
        for row in commits.annotate(hour=ExtractHour("author_date"))
        .values("hour")
        .annotate(count=Count("id"))
    }

    top_repos = list(
        commits.values("repo__name")
        .annotate(count=Count("id"))
        .order_by("-count")[:3]
    )

    messages = list(commits.values_list("message", flat=True))
    avg_message_length = (
        round(sum(len(m.splitlines()[0]) for m in messages if m) / len(messages))
        if messages
        else 0
    )

    return {
        "total_commits": len(messages),
        "commits_per_day": commits_per_day,
        "active_days": sum(1 for count in commits_per_day.values() if count),
        "streak_days": _current_streak(user, today),
        "commits_by_hour_utc": dict(sorted(by_hour.items())),
        "top_repos": [{"name": r["repo__name"], "commits": r["count"]} for r in top_repos],
        "avg_commit_message_length": avg_message_length,
    }


def _current_streak(user, today):
    days = set(
        Commit.objects.filter(repo__user=user)
        .annotate(day=TruncDate("author_date"))
        .values_list("day", flat=True)
        .distinct()
    )
    cursor = today if today in days else today - timedelta(days=1)
    streak = 0
    while cursor in days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _repo_metrics(user, now):
    repos = Repo.objects.filter(user=user)
    languages = {
        row["language"]: row["count"]
        for row in repos.exclude(language__isnull=True)
        .values("language")
        .annotate(count=Count("id"))
        .order_by("-count")
    }
    inactive = list(
        repos.filter(updated_at__lt=now - timedelta(days=INACTIVE_AFTER_DAYS))
        .order_by("-updated_at")
        .values_list("name", flat=True)[:5]
    )
    return {
        "total_repos": repos.count(),
        "repo_languages": languages,
        "inactive_repos": inactive,
    }


def _task_metrics(user, since, today):
    tasks = Task.objects.filter(user=user)
    return {
        "tasks_created_this_week": tasks.filter(created_at__gte=since).count(),
        "tasks_open": tasks.filter(done=False).count(),
        "tasks_overdue": tasks.filter(done=False, due__lt=today).count(),
        "high_priority_open": tasks.filter(done=False, priority="high").count(),
    }


def _note_metrics(user, since):
    notes = Note.objects.filter(user=user, updated_at__gte=since)
    tags = {}
    for note_tags in notes.values_list("tags", flat=True):
        for tag in note_tags or []:
            tags[tag] = tags.get(tag, 0) + 1
    return {
        "notes_written_this_week": notes.count(),
        "note_tags": dict(sorted(tags.items(), key=lambda t: -t[1])[:5]),
    }


def _wakatime_metrics(user):
    if not user.wakatime_token:
        return None
    try:
        data = fetch_wakatime_stats(user.wakatime_token).get("data", {})
    except WakatimeApiError:
        return None
    return {
        "coding_hours_7d": round((data.get("total_seconds") or 0) / 3600, 1),
        "daily_average_hours": round((data.get("daily_average") or 0) / 3600, 1),
        "languages": {
            lang["name"]: round(lang.get("percent", 0))
            for lang in (data.get("languages") or [])[:5]
        },
    }


def build_metrics(user):
    now = timezone.now()
    today = timezone.localdate()
    since = now - timedelta(days=WINDOW_DAYS)

    return {
        "window_days": WINDOW_DAYS,
        "github_connected": bool(user.github_token),
        "commits": _commit_metrics(user, since, today),
        "repos": _repo_metrics(user, now),
        "tasks": _task_metrics(user, since, today),
        "notes": _note_metrics(user, since),
        "wakatime": _wakatime_metrics(user),
    }
