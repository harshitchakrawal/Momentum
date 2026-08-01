from django.urls import path
from .views import RegisterView, LoginView, MeView, LogoutView, GithubLoginView, GithubCallbackView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('github/', GithubLoginView.as_view(), name='github-login'),
    path('github/callback/', GithubCallbackView.as_view(), name='github-callback'),
]
