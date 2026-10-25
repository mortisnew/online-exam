from rest_framework import routers
from django.urls import path,include
from . import views


router = routers.DefaultRouter()

router.register('school', views.SchoolViewSet, basename='school')
router.register('exam/answers', views.AnswerAttemptViewSet, basename='exam_answers')
router.register('exam/attempt', views.ExamAttemptViewSet, basename='exam_attempt')
router.register('exam', views.ExamViewSet, basename='exam')
router.register('question', views.QuestionViewSet, basename='question')
router.register('classroom', views.ClassroomViewSet, basename='classroom')

urlpatterns = [
    path('', include(router.urls)),
]