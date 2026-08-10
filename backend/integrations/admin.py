from django.contrib import admin
from .models import Repo, Commit

admin.site.register(Repo)
admin.site.register(Commit)
