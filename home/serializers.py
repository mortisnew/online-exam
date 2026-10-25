from rest_framework import serializers
from core.models import School,Classroom
from core.serializers import ClassroomSerializer


class SchoolListSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ('id','logo','name','created_at')


class SchoolDetailSerializer(serializers.ModelSerializer):
    teachers = serializers.StringRelatedField(many=True, read_only=True)
    classrooms = ClassroomSerializer(many=True, read_only=True)

    class Meta:
        model = School
        fields = ['id', 'name', 'logo', 'teachers', 'classrooms']