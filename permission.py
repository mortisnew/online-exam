
from rest_framework.permissions import BasePermission, SAFE_METHODS

from core.models import School, Classroom, Exam, Question


def is_admin(user):
    if not user.is_authenticated:
        return False
    return getattr(user, "rules", None) == "admin"


def is_teacher(user):
    if not user.is_authenticated:
        return False
    return getattr(user, "rules", None) == "teacher"


def is_student(user):
    if not user.is_authenticated:
        return False
    return getattr(user, "rules", None) == "student"


def teacher_belongs_to_school(user, school):
    return (
        is_teacher(user)
        and school.teachers.filter(pk=user.pk).exists()
    )


def teacher_owns_classroom(user, classroom):
    return (
        teacher_belongs_to_school(user, classroom.school)
        and classroom.teacher_id == user.pk
    )

def student_belongs_to_school(user, school):
    return (
        is_student(user)
        and school.students.filter(pk=user.pk).exists()
    )

def student_belongs_to_classroom(user, classroom):
    return (
        is_student(user) and student_belongs_to_school(user, classroom.school)
        and classroom.students.filter(pk=user.pk).exists()
    )



class SchoolPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return is_admin(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return is_admin(request.user) and obj.owner_id == request.user.pk


class ClassroomPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return is_admin(request.user) or is_teacher(request.user)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if is_admin(request.user) :
            return obj.school.owner_id == request.user.pk

        return teacher_owns_classroom(request.user, obj)


class ExamPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if view.action == "start_exam":
            return is_student(request.user)
        return is_admin(request.user) or is_teacher(request.user)

    def has_object_permission(self, request, view, obj):
        classroom = obj.classroom
        if view.action == "start_exam" and is_student(request.user):
            return student_belongs_to_classroom(
                request.user, obj.classroom
            )
        if request.method in SAFE_METHODS:
            return (
                is_admin(request.user)
                or teacher_owns_classroom(request.user, classroom)
                or student_belongs_to_classroom(
                    request.user, classroom
                )
            )

        if is_admin(request.user):
            return classroom.school.owner_id == request.user.pk

        return teacher_owns_classroom(request.user, classroom)


class QuestionPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return is_admin(request.user) or is_teacher(request.user)

    def has_object_permission(self, request, view, obj):
        classroom = obj.exam.classroom

        if request.method in SAFE_METHODS:
            return (
                is_admin(request.user)
                or teacher_owns_classroom(request.user, classroom)
                or student_belongs_to_classroom(
                    request.user, classroom
                )
            )

        if is_admin(request.user):
            return classroom.school.owner_id == request.user.pk

        return teacher_owns_classroom(request.user, classroom)


class ExamAttemptPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return (
                is_admin(request.user)
                or is_teacher(request.user)
                or is_student(request.user)
            )

        if view.action == "finish_exam":
            return is_student(request.user)

        return False

    def has_object_permission(self, request, view, obj):
        if is_student(request.user):
            return obj.student_id == request.user.pk

        if is_teacher(request.user):
            return teacher_owns_classroom(
                request.user,
                obj.exam.classroom,
            )

        if is_admin(request.user):
            return obj.exam.classroom.school.owner_id == request.user.pk

        return False



class AnswerAttemptPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return (
                is_admin(request.user)
                or is_teacher(request.user)
                or is_student(request.user)
            )

        return is_student(request.user)

    def has_object_permission(self, request, view, obj):
        attempt = obj.attempt
        classroom = attempt.exam.classroom

        if is_student(request.user):
            return attempt.student_id == request.user.pk

        if is_teacher(request.user):
            return teacher_owns_classroom(request.user, classroom)

        if is_admin(request.user):
            return classroom.school.owner_id == request.user.pk

        return False
