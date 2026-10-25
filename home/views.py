
from accounts.serializers import CustomUserSerializer
from core.serializers import ClassroomSerializer
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from core.models import School, Classroom
from home.serializers import SchoolListSerializer, SchoolDetailSerializer


class HomeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolListSerializer

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SchoolDetailSerializer
        return SchoolListSerializer


class DashBoardViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user

        profile = CustomUserSerializer(user).data

        schools = School.objects.none()
        classrooms = Classroom.objects.none()

        if user.rules == "admin":
            schools = School.objects.filter(owner=user)

        elif user.rules == "teacher":
            schools = School.objects.filter(teachers=user)
            classrooms = Classroom.objects.filter(teacher=user)

        elif user.rules == "student":
            schools = School.objects.filter(students=user)
            classrooms = Classroom.objects.filter(students=user)

        return Response({
            "profile": profile,
            "schools": SchoolListSerializer(
                schools, many=True, context={"request": request}
            ).data,
            "classrooms": ClassroomSerializer(
                classrooms, many=True, context={"request": request}
            ).data,
        })

