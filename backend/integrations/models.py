from django.db import models
from accounts.models import User

# Create your models here.
class Repo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    github_repo_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=250)
    html_url = models.URLField()
    language = models.CharField(max_length=50, null=True, blank=True)
    updated_at = models.DateTimeField()
    private = models.BooleanField(default=False)


class Commit(models.Model):
    repo = models.ForeignKey(Repo, on_delete=models.CASCADE)
    sha = models.CharField(max_length=40, unique=True)
    message = models.TextField()
    author_name = models.CharField(max_length=150)
    author_date = models.DateTimeField()
    html_url = models.URLField()