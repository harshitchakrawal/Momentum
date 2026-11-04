from django.urls import path

from .views import LatestInsightView, RefreshInsightView

urlpatterns = [
    path('latest/', LatestInsightView.as_view(), name='insight_latest'),
    path('refresh/', RefreshInsightView.as_view(), name='insight_refresh'),
]
