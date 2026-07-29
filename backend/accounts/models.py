from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    github_id = models.CharField(max_length=100, null=True, blank=True, unique=True)
    email = models.EmailField(unique=True)
