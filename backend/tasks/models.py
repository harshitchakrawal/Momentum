from django.db import models
from accounts.models import User

class Task(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    title = models.CharField()
    description = models.TextField(blank=True)
    due = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=4, choices=[("high", "High"),("mid", "Mid"),("low", "Low"),],default="low",)
    labels = models.JSONField(default=list)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title