from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from permission import (SchoolPermission, ClassroomPermission, QuestionPermission, ExamPermission, \
                        teacher_belongs_to_school, is_student, teacher_owns_classroom, ExamAttemptPermission,
                        AnswerAttemptPermission, is_teacher, is_admin)
from services import calculate_score
from .models import Classroom,School,Question,Exam,AnswerAttempt,ExamAttempt
from .serializers import (SchoolSerializer, ClassroomSerializer,ExamAttemptSerializer,AnswerAttemptSerializer,
                          QuestionSerializer, AddStudentSerializer, ExamSerializer, AddTeacherSerializer)
from rest_framework.decorators import action
from rest_framework import status
from django.utils import timezone

class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [SchoolPermission]



    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return School.objects.none()

        if user.rules == "admin":
            return School.objects.filter(owner=user)

        if user.rules == "teacher":
            return School.objects.filter(teachers=user)

        if user.rules == "student":
            return School.objects.filter(students=user)

        return School.objects.none()

    @action(detail=True, methods=['post'])
    def add_teacher(self, request,pk=None, *args, **kwargs):
        school = self.get_object()
        if school.owner != self.request.user:
            raise PermissionDenied("You are not a owner")
        serializer = AddTeacherSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user_code']

        school.teachers.add(user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_student(self, request,pk=None, *args, **kwargs):
        school = self.get_object()
        if school.owner != request.user:
            raise PermissionDenied("You are not the owner of this school")
        serializer = AddStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user_code']
        school.students.add(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [ClassroomPermission]

    def perform_create(self, serializer):
        school = serializer.validated_data['school']
        user = self.request.user

        if not teacher_belongs_to_school(user, school):
            raise PermissionDenied(
                "You are not a teacher in this school"
            )

        serializer.save(teacher=user)

    @action(detail=True, methods=['post'])
    def add_student(self, request,pk=None, *args, **kwargs):
        classroom = self.get_object()
        if classroom.teacher != request.user:
            raise PermissionDenied("You are not a teacher")
        serializer = AddStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user_code']
        classroom.students.add(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [QuestionPermission]

    def get_queryset(self):
        user = self.request.user

        if is_student(user):
            return Question.objects.filter(
                exam__classroom__students=user
            )

        return Question.objects.all()

    def perform_create(self, serializer):
        exam = serializer.validated_data["exam"]

        if not teacher_owns_classroom(
                self.request.user, exam.classroom
        ):
            raise PermissionDenied(
                "You are not responsible for this classroom."
            )

        serializer.save()

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [ExamPermission]

    def get_queryset(self):
        user = self.request.user

        if is_student(user):
            return Exam.objects.filter(
                classroom__students=user
            )

        return Exam.objects.all()

    def perform_create(self, serializer):
        classroom = serializer.validated_data["classroom"]
        exam = self.get_object()

        if not teacher_owns_classroom(self.request.user, classroom):
            raise PermissionDenied(
                "You are not responsible for this classroom."
            )

        serializer.save()


    @action(detail=True, methods=['post'])
    def start_exam(self, request, pk=None, *args, **kwargs):
        user = request.user
        exam = self.get_object()

        if user.rules != "student":
            raise PermissionDenied("You are not a student")

        classroom = exam.classroom

        if not classroom.students.filter(pk=user.pk).exists():
            return Response(
                {"detail": "You are not a member of this class."},
                status=status.HTTP_403_FORBIDDEN,
            )

        attempt = ExamAttempt.objects.filter(
            student=user,
            exam=exam,
        ).first()

        if attempt:
            if not attempt.active:
                return Response(
                    {"detail": "You have already finished this exam."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if timezone.now() >= attempt.end_at:
                calculate_score(attempt)
                return Response(
                    {
                        "detail": "Exam time has expired.",
                        "total_score": str(attempt.total_score),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                ExamAttemptSerializer(attempt).data,
                status=status.HTTP_200_OK,
            )

        attempt = ExamAttempt.objects.create(
            student=user,
            exam=exam,
        )

        return Response(
            ExamAttemptSerializer(attempt).data,
            status=status.HTTP_201_CREATED,
        )



class AnswerAttemptViewSet(viewsets.ModelViewSet):
    queryset = AnswerAttempt.objects.all()
    serializer_class = AnswerAttemptSerializer
    permission_classes = [AnswerAttemptPermission]

    def get_queryset(self):
        user = self.request.user

        if is_student(user):
            return AnswerAttempt.objects.filter(
                attempt__student=user
            )

        if is_teacher(user):
            return AnswerAttempt.objects.filter(
                attempt__exam__classroom__teacher=user
            )

        if is_admin(user):
            return AnswerAttempt.objects.filter(
                attempt__exam__classroom__school__owner=user
            )

        return AnswerAttempt.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        attempt = serializer.validated_data["attempt"]
        question = serializer.validated_data["question"]

        if attempt.student_id != request.user.pk:
            return Response(
                {"detail": "You cannot submit answers for another student."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not attempt.active:
            return Response(
                {"detail": "This exam attempt is no longer active."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if attempt.exam_id != question.exam_id:
            return Response(
                {"detail": "This question does not belong to this exam."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ExamAttemptViewSet(viewsets.ModelViewSet):
    queryset = ExamAttempt.objects.all()
    serializer_class = ExamAttemptSerializer
    permission_classes = [ExamAttemptPermission]

    def get_queryset(self):
        user = self.request.user

        if is_student(user):
            return ExamAttempt.objects.filter(student=user)

        if user.rules == "teacher":
            return ExamAttempt.objects.filter(
                exam__classroom__teacher=user
            )

        if user.rules == "admin":
            return ExamAttempt.objects.filter(
                exam__classroom__school__owner=user
            )

        return ExamAttempt.objects.none()

    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use the start_exam endpoint."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["post"])
    def finish_exam(self, request, pk=None, *args, **kwargs):
        attempt = self.get_object()

        if not attempt.active:
            return Response(
                {"detail": "Exam already finished."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        calculate_score(attempt)

        return Response({
            "detail": "Exam finished successfully.",
            "total_score": str(attempt.total_score),
        })