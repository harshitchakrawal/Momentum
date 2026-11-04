from django.contrib import admin

from .models import Insight


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ["user", "date", "headline", "created_at"]
    list_filter = ["date"]
