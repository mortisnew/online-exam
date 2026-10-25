from django.urls import path,include
from . import views
from rest_framework import routers
router = routers.DefaultRouter()

router.register('profile',views.ProfileViewSet,basename='profile')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('',include(router.urls)),
]