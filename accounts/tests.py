
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            first_name="Test",
            last_name="Student",
            email="student@example.com",
            password="StrongPassword123!",
            rules="student",
        )

        self.login_url = reverse("login")
        self.logout_url = reverse("logout")
        self.register_url = reverse("register")

    def authenticate_user(self, user=None):
        user = user or self.user
        refresh = RefreshToken.for_user(user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

        return refresh

    # LOGIN

    def test_login_with_valid_credentials(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": "StrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_wrong_password(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_login_with_unknown_email(self):
        response = self.client.post(
            self.login_url,
            {
                "email": "unknown@example.com",
                "password": "StrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_inactive_user_cannot_login(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        response = self.client.post(
            self.login_url,
            {
                "email": self.user.email,
                "password": "StrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # LOGOUT

    def test_logout_with_valid_refresh_token(self):
        refresh = self.authenticate_user()

        response = self.client.post(
            self.logout_url,
            {"refresh": str(refresh)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # The refresh token should no longer be usable.
        with self.assertRaises(Exception):
            RefreshToken(str(refresh))

    def test_logout_without_authentication(self):
        response = self.client.post(
            self.logout_url,
            {"refresh": "some-refresh-token"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_logout_without_refresh_token(self):
        self.authenticate_user()

        response = self.client.post(
            self.logout_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_logout_with_invalid_refresh_token(self):
        self.authenticate_user()

        response = self.client.post(
            self.logout_url,
            {"refresh": "invalid-token"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_user_cannot_logout_another_users_token(self):
        another_user = User.objects.create_user(
            first_name="Another",
            last_name="Student",
            email="another@example.com",
            password="AnotherPassword123!",
            rules="student",
        )

        self.authenticate_user()

        another_refresh = RefreshToken.for_user(another_user)

        response = self.client.post(
            self.logout_url,
            {"refresh": str(another_refresh)},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # REGISTRATION

    def test_register_with_existing_email(self):
        response = self.client.post(
            self.register_url,
            {
                "email": self.user.email,
                "first_name": "Duplicate",
                "last_name": "User",
                "rules": "student",
                "password": "AnotherPassword123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_register_saves_hashed_password(self):
        email = "newstudent@example.com"
        password = "NewStrongPassword123!"

        response = self.client.post(
            self.register_url,
            {
                "email": email,
                "first_name": "New",
                "last_name": "Student",
                "rules": "student",
                "password": password,
                "password2": password,
            },
            format="json",
        )
        print(response.data)
        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        user = User.objects.get(email=email)

        self.assertTrue(user.check_password(password))
