from django.db import models

from accounts.models import User


class Insight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    headline = models.CharField(max_length=200)
    items = models.JSONField(default=list)
    metrics = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="one_insight_per_day",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.date}"
