import uuid

from django.contrib.auth.models import AbstractUser, PermissionsMixin
from django.db import models
from .manager import UserManager

class RuleChoice(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    TEACHER = 'teacher', 'Teacher'
    STUDENT = 'student', 'Student'

class CustomUser(AbstractUser, PermissionsMixin):
    avatar = models.URLField(max_length=500,null=True, blank=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    user_code = models.UUIDField(default=uuid.uuid4,
                                 editable=False,unique=True)
    email = models.EmailField(max_length=255, unique=True)
    rules = models.CharField(choices=RuleChoice.choices, max_length=10,
                             default=RuleChoice.STUDENT)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name','rules']

    def __str__(self):
        return f'{self.first_name}  {self.last_name} | {self.rules} | {self.email} | {self.user_code}'
