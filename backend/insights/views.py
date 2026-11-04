from datetime import timedelta

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Insight
from .serializers import InsightSerializer
from .services import InsightGenerationError, create_insight_for_user

UPSTREAM_FAILED = 502
REFRESH_COOLDOWN = timedelta(minutes=10)


class LatestInsightView(APIView):
    def get(self, request):
        insight = Insight.objects.filter(user=request.user).first()
        if insight is None:
            return Response(status=204)
        return Response(InsightSerializer(insight).data)


class RefreshInsightView(APIView):
    def post(self, request):
        latest = Insight.objects.filter(user=request.user).first()
        if latest and timezone.now() - latest.created_at < REFRESH_COOLDOWN:
            return Response(InsightSerializer(latest).data)

        try:
            insight = create_insight_for_user(request.user)
        except InsightGenerationError as e:
            return Response({"error": str(e)}, status=UPSTREAM_FAILED)

        return Response(InsightSerializer(insight).data)
