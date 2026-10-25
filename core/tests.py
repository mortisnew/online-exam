from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import CustomUser
from core.models import School, Classroom, Exam, Question
from core.views import (
    SchoolViewSet,
    ClassroomViewSet,
    ExamViewSet,
    QuestionViewSet,
)


class PermissionTests(TestCase):

    def setUp(self):
        self.factory = APIRequestFactory()

        # Users
        self.admin = self.create_user("admin", "admin")
        self.other_admin = self.create_user("other_admin", "admin")

        self.teacher = self.create_user("teacher", "teacher")
        self.other_teacher = self.create_user("other_teacher", "teacher")
        self.outsider_teacher = self.create_user(
            "outsider_teacher", "teacher"
        )

        self.student = self.create_user("student", "student")
        self.other_student = self.create_user("other_student", "student")

        # Schools
        self.school = School.objects.create(
            name="School A",
            owner=self.admin,
        )
        self.other_school = School.objects.create(
            name="School B",
            owner=self.other_admin,
        )

        self.school.teachers.add(
            self.teacher,
            self.other_teacher,
        )
        self.other_school.teachers.add(self.outsider_teacher)

        # Classrooms
        self.classroom = Classroom.objects.create(
            name="Class A",
            school=self.school,
            teacher=self.teacher,
        )
        self.other_classroom = Classroom.objects.create(
            name="Class B",
            school=self.other_school,
            teacher=self.outsider_teacher,
        )

        self.classroom.students.add(self.student)
        self.other_classroom.students.add(self.other_student)

        # Exams
        self.exam = Exam.objects.create(
            name="Exam A",
            classroom=self.classroom,
        )
        self.other_exam = Exam.objects.create(
            name="Exam B",
            classroom=self.other_classroom,
        )

        # Questions
        self.question = Question.objects.create(
            exam=self.exam,
            question="Question A",
            score=Decimal("1.00"),
            correct_answer=1,
        )
        self.other_question = Question.objects.create(
            exam=self.other_exam,
            question="Question B",
            score=Decimal("2.00"),
            correct_answer=2,
        )

        # View actions
        self.school_list = SchoolViewSet.as_view({
            "get": "list",
            "post": "create",
        })
        self.school_detail = SchoolViewSet.as_view({
            "get": "retrieve",
            "patch": "partial_update",
            "delete": "destroy",
        })

        self.classroom_list = ClassroomViewSet.as_view({
            "get": "list",
            "post": "create",
        })
        self.classroom_detail = ClassroomViewSet.as_view({
            "get": "retrieve",
            "patch": "partial_update",
            "delete": "destroy",
        })

        self.exam_list = ExamViewSet.as_view({
            "get": "list",
            "post": "create",
        })
        self.exam_detail = ExamViewSet.as_view({
            "get": "retrieve",
            "patch": "partial_update",
            "delete": "destroy",
        })

        self.question_list = QuestionViewSet.as_view({
            "get": "list",
            "post": "create",
        })
        self.question_detail = QuestionViewSet.as_view({
            "get": "retrieve",
            "patch": "partial_update",
            "delete": "destroy",
        })

    def create_user(self, username, role):
        return CustomUser.objects.create_user(
            first_name=username,
            last_name="Test",
            email=f"{username}@example.com",
            password="Test-password-123",
            rules=role,
        )

    def call_view(self, view, method, user=None, data=None, **kwargs):
        method = method.lower()
        request_method = getattr(self.factory, method)

        if method in ("post", "put", "patch"):
            request = request_method(
                "/test/",
                data=data or {},
                format="json",
            )
        else:
            request = request_method("/test/")

        if user is not None:
            force_authenticate(request, user=user)

        return view(request, **kwargs)

    # --------------------------------------------------
    # School permissions
    # --------------------------------------------------

    def test_admin_can_create_school(self):
        response = self.call_view(
            self.school_list,
            "post",
            self.admin,
            {"name": "New School"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        school = School.objects.get(name="New School")
        self.assertEqual(school.owner, self.admin)

    def test_teacher_cannot_create_school(self):
        response = self.call_view(
            self.school_list,
            "post",
            self.teacher,
            {"name": "Unauthorized School"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_school_owner_can_update_school(self):
        response = self.call_view(
            self.school_detail,
            "patch",
            self.admin,
            {"name": "Updated School"},
            pk=self.school.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.school.refresh_from_db()
        self.assertEqual(self.school.name, "Updated School")

    def test_other_admin_cannot_update_school(self):
        response = self.call_view(
            self.school_detail,
            "patch",
            self.other_admin,
            {"name": "Unauthorized Update"},
            pk=self.school.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --------------------------------------------------
    # Classroom permissions
    # --------------------------------------------------

    def test_school_teacher_can_create_classroom(self):
        response = self.call_view(
            self.classroom_list,
            "post",
            self.teacher,
            {
                "name": "New Class",
                "school": self.school.pk,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        classroom = Classroom.objects.get(name="New Class")
        self.assertEqual(classroom.teacher, self.teacher)
        self.assertEqual(classroom.school, self.school)

    def test_teacher_not_in_school_cannot_create_classroom(self):
        response = self.call_view(
            self.classroom_list,
            "post",
            self.outsider_teacher,
            {
                "name": "Unauthorized Class",
                "school": self.school.pk,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_create_classroom(self):
        response = self.call_view(
            self.classroom_list,
            "post",
            self.student,
            {
                "name": "Student Class",
                "school": self.school.pk,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_responsible_teacher_can_update_classroom(self):
        response = self.call_view(
            self.classroom_detail,
            "patch",
            self.teacher,
            {"name": "Updated Class"},
            pk=self.classroom.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_non_responsible_teacher_cannot_update_classroom(self):
        response = self.call_view(
            self.classroom_detail,
            "patch",
            self.other_teacher,
            {"name": "Unauthorized Update"},
            pk=self.classroom.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_from_another_school_cannot_update_classroom(self):
        response = self.call_view(
            self.classroom_detail,
            "patch",
            self.other_admin,
            {"name": "Unauthorized Update"},
            pk=self.classroom.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --------------------------------------------------
    # Exam permissions
    # --------------------------------------------------

    def test_student_sees_only_own_class_exams(self):
        response = self.call_view(
            self.exam_list,
            "get",
            self.student,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {self.exam.pk})

    def test_student_cannot_retrieve_exam_from_another_class(self):
        response = self.call_view(
            self.exam_detail,
            "get",
            self.student,
            pk=self.other_exam.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_responsible_teacher_can_create_exam(self):
        response = self.call_view(
            self.exam_list,
            "post",
            self.teacher,
            {
                "name": "New Exam",
                "classroom": self.classroom.pk,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_non_responsible_teacher_cannot_create_exam(self):
        response = self.call_view(
            self.exam_list,
            "post",
            self.other_teacher,
            {
                "name": "Unauthorized Exam",
                "classroom": self.classroom.pk,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_create_exam(self):
        response = self.call_view(
            self.exam_list,
            "post",
            self.student,
            {
                "name": "Student Exam",
                "classroom": self.classroom.pk,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_responsible_teacher_can_update_exam(self):
        response = self.call_view(
            self.exam_detail,
            "patch",
            self.teacher,
            {"name": "Updated Exam"},
            pk=self.exam.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_non_responsible_teacher_cannot_update_exam(self):
        response = self.call_view(
            self.exam_detail,
            "patch",
            self.other_teacher,
            {"name": "Unauthorized Update"},
            pk=self.exam.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # --------------------------------------------------
    # Question permissions
    # --------------------------------------------------

    def test_student_sees_only_questions_from_own_class(self):
        response = self.call_view(
            self.question_list,
            "get",
            self.student,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {self.question.pk})

    def test_student_cannot_retrieve_question_from_another_class(self):
        response = self.call_view(
            self.question_detail,
            "get",
            self.student,
            pk=self.other_question.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_responsible_teacher_can_create_question(self):
        response = self.call_view(
            self.question_list,
            "post",
            self.teacher,
            {
                "exam": self.exam.pk,
                "question": "New Question",
                "score": "1.00",
                "correct_answer": 1,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_non_responsible_teacher_cannot_create_question(self):
        response = self.call_view(
            self.question_list,
            "post",
            self.other_teacher,
            {
                "exam": self.exam.pk,
                "question": "Unauthorized Question",
                "score": "1.00",
                "correct_answer": 1,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_create_question(self):
        response = self.call_view(
            self.question_list,
            "post",
            self.student,
            {
                "exam": self.exam.pk,
                "question": "Student Question",
                "score": "1.00",
                "correct_answer": 1,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_responsible_teacher_can_update_question(self):
        response = self.call_view(
            self.question_detail,
            "patch",
            self.teacher,
            {"question": "Updated Question"},
            pk=self.question.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_non_responsible_teacher_cannot_update_question(self):
        response = self.call_view(
            self.question_detail,
            "patch",
            self.other_teacher,
            {"question": "Unauthorized Update"},
            pk=self.question.pk,
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)