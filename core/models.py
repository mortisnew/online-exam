from django.db import models
from accounts.models import CustomUser
from datetime import timedelta
from django.utils import timezone

class School(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='logos/',blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    teachers = models.ManyToManyField(CustomUser,related_name='teachers_school',
                                      blank=True)
    students = models.ManyToManyField(CustomUser,related_name='students_school',blank=True)


    def __str__(self):
        return f'{self.name} - {self.owner.first_name} {self.owner.last_name}'


class Classroom(models.Model):
    teacher = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    school = models.ForeignKey(School,on_delete=models.CASCADE,related_name='classrooms')
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100)
    students = models.ManyToManyField(CustomUser,
                                     related_name='students_classroom',
                                     blank=True)

    def __str__(self):
        return f'{self.name} - {self.teacher.first_name} {self.teacher.last_name}'


class DurationTime(models.IntegerChoices):
    MINUTE15 = 15
    MINUTE30 = 30
    MINUTE45 = 45
    MINUTE60 = 60
    MINUTE90 = 90
    MINUTE120 = 120
    MINUTE150 = 150
    MINUTE300 = 300
class Exam(models.Model):
    classroom = models.ForeignKey(Classroom,on_delete=models.CASCADE,related_name='exams')
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100)
    duration = models.PositiveSmallIntegerField(choices=DurationTime.choices,blank=True,null=True)

class Option(models.IntegerChoices):
    FIRST = 1, 'Option 1'
    SECOND = 2, 'Option 2'
    THIRD = 3, 'Option 3'
    FOURTH = 4, 'Option 4'

class Question(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    question = models.TextField()
    option_1 = models.CharField(max_length=255,blank=True, default='')
    option_2 = models.CharField(max_length=255,blank=True, default='')
    option_3 = models.CharField(max_length=255,blank=True, default='')
    option_4 = models.CharField(max_length=255,blank=True, default='')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    correct_answer = models.PositiveSmallIntegerField(choices=Option.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.exam} {self.question}'

class ExamAttempt(models.Model):
    student = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='attempts')
    exam = models.ForeignKey(Exam,on_delete=models.CASCADE,related_name='exam_attempts')
    start_at = models.DateTimeField(blank=True,null=True)
    end_at = models.DateTimeField(blank=True, null=True)
    active = models.BooleanField(default=True)
    total_score = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
    )


    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'exam'],
                name='unique_exam_attempt',
            )
        ]

    def save(self, *args, **kwargs):
        if self.start_at is None:
            self.start_at = timezone.now()
        if self.end_at is None:
            self.end_at = self.start_at + timedelta(minutes=self.exam.duration)
        super().save(*args, **kwargs)

class AnswerAttempt(models.Model):
    attempt = models.ForeignKey(ExamAttempt,on_delete=models.CASCADE,related_name='answers')
    question = models.ForeignKey(Question,on_delete=models.CASCADE,related_name='answers_attempts')
    answer = models.PositiveSmallIntegerField(choices=Option.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['question', 'attempt'],
                name='unique_answer_attempt',
            )
        ]