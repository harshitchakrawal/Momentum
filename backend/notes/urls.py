from rest_framework.routers import SimpleRouter

from .views import NoteViewSet

router = SimpleRouter()
router.register('', NoteViewSet, basename='note')

urlpatterns = router.urls