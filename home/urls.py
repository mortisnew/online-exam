from django.urls import path,include
from rest_framework import routers

from home import views

router = routers.DefaultRouter()
router.register('dashboard',views.DashBoardViewSet,basename='dashboard')
router.register('',views.HomeViewSet,basename='home')
urlpatterns = [
    path('',include(router.urls)),
]