from django.urls import path
from .views import RegisterView, LoginView, MeView, LogoutView, GithubLoginView, GithubCallbackView, GithubConnectView, GithubConnectCallbackView, RefreshView, SendOTPView, VerifyOTPView, CreateUsernameView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('github/', GithubLoginView.as_view(), name='github-login'),
    path('github/callback/', GithubCallbackView.as_view(), name='github-callback'),
    path('github/connect/', GithubConnectView.as_view(), name='github-connect'),
    path('github/connect/callback/', GithubConnectCallbackView.as_view(), name='github-connect-callback'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('create-username/', CreateUsernameView.as_view(), name='create-username')
]
