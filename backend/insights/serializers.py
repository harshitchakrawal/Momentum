from rest_framework import serializers

from .models import Insight


class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = ["id", "date", "headline", "items", "created_at"]
