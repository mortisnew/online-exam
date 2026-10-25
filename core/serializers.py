from rest_framework import serializers
from accounts.models import CustomUser
from .models import Classroom,Exam,Question,School,ExamAttempt,AnswerAttempt

class SchoolUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "user_code",
        )

class SchoolSerializer(serializers.ModelSerializer):
    owner = SchoolUserSerializer(read_only=True)
    teachers = SchoolUserSerializer(many=True, read_only=True)
    students = SchoolUserSerializer(many=True, read_only=True)

    class Meta:
        model = School
        fields = (
            "id",
            "name",
            "owner",
            "logo",
            "created_at",
            "teachers",
            "students",
        )
        read_only_fields = (
            "id",
            "owner",
            "created_at",
            "teachers",
            "students",
        )


class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ('id',
                  'name',
                  'teacher',
                  'school',
                  'created_at',
                  'students')
        read_only_fields = ('id','teacher','created_at')

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ('id',
                  'classroom',
                  'duration',
                  'created_at',
                  'name')

        def validate_duration(self, value):
            if value is None:
                raise serializers.ValidationError("Exam duration cannot be null")
            return value


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id',
            'exam',
            'question',
            'option_1',
            'option_2',
            'option_3',
            'option_4',
            'score',
            'correct_answer',
            'created_at',
        )
        read_only_fields = ('id', 'created_at','correct_answer')

        def to_representation(self, instance):
            data = super().to_representation(instance)

            request = self.context.get("request")

            if request and request.user.rules == "student":
                data.pop("correct_answer", None)

            return data


class AddStudentSerializer(serializers.Serializer):
    user_code = serializers.UUIDField()
    def validate_user_code(self, value):
        try:
            student = CustomUser.objects.get(user_code=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Student does not exist")
        if student.rules != "student":
            raise serializers.ValidationError("this user is not a student")
        return student

class AddTeacherSerializer(serializers.Serializer):
    user_code = serializers.UUIDField()
    def validate_user_code(self, value):
        try:
            teacher = CustomUser.objects.get(user_code=value)
            if teacher.rules != "teacher":
                raise serializers.ValidationError("this user is not a teacher")
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("teacher does not exist")
        return teacher

class AnswerAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerAttempt
        fields = ('id','attempt','question','answer')

class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAttempt
        fields = ('id','student','exam','start_at','end_at','active','total_score')

