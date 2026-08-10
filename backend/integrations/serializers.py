from rest_framework import serializers
from .models import Repo, Commit

class RepoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repo
        fields = ["id","user","name","full_name", "html_url","language","updated_at", "private"]

class CommitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commit
        fields = ["sha", "message", "author_name", "author_date", "html_url"]
