from django.db import models
from accounts.models import User


class Repo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    github_repo_id = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=250)
    html_url = models.URLField()
    language = models.CharField(max_length=50, null=True, blank=True)
    updated_at = models.DateTimeField()
    private = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "github_repo_id"],
                name="unique_repo_per_user",
            )
        ]

class Commit(models.Model):
    repo = models.ForeignKey(Repo, on_delete=models.CASCADE)
    sha = models.CharField(max_length=40)
    message = models.TextField()
    author_name = models.CharField(max_length=150)
    author_date = models.DateTimeField()
    html_url = models.URLField()

    class Meta:
        constraints = [
            # A fork shares every SHA with its parent, so a SHA is only unique
            # within one repo.
            models.UniqueConstraint(
                fields=["repo", "sha"],
                name="unique_commit_per_repo",
            )
        ]
