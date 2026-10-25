import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import RegisterPage from "./pages/auth/register/RegisterPage";
import ProfilePage from "./pages/profile/ProfilePage";
import PlaceholderPage from "./routes/PlaceholderPage";
import MainLayout from "./components/layout/MainLayout";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboardPage";
import AdminSchoolsPage from "./pages/admin/schools/AdminSchoolsPage";
import SchoolDetailsPage from "./pages/admin/schools/SchoolDetailsPage";
import TeacherDashboardPage from "./pages/teacher/dashboard/TeacherDashboardPage";
import TeacherClassesPage from "./pages/teacher/classes/TeacherClassesPage";
import TeacherExamsPage from "./pages/teacher/exams/TeacherExamsPage";
import TeacherQuestionsPage from "./pages/teacher/questions/TeacherQuestionsPage";
import StudentDashboardPage from "./pages/student/dashboard/StudentDashboardPage";
import StudentSchoolsPage from "./pages/student/schools/StudentSchoolsPage";
import StudentClassesPage from "./pages/student/classes/StudentClassesPage";
import StudentExamsPage from "./pages/student/exams/StudentExamsPage.tsx";
import StudentResultsPage from "./pages/student/results/StudentResultsPage";
import StudentTakeExamPage from "./pages/student/exams/StudentTakeExamPage";
import SchoolPage from "./pages/shared/SchoolPage";
import ClassPage from "./pages/shared/ClassPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <MainLayout title="Admin Dashboard">
                <AdminDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/admin/schools"
            element={
              <MainLayout title="My Schools">
                <AdminSchoolsPage />
              </MainLayout>
            }
          />
          <Route
            path="/admin/schools/:schoolId"
            element={
              <MainLayout title="School Details">
                <SchoolDetailsPage />
              </MainLayout>
            }
          />


          {/* Teacher */}
          <Route
            path="/teacher/dashboard"
            element={
              <MainLayout title="Teacher Dashboard">
                <TeacherDashboardPage />
              </MainLayout>
            }
          />
          <Route
              path="/teacher/classes"
              element={
                <MainLayout title="My Classes">
                  <TeacherClassesPage />
                </MainLayout>
              }
            />
          <Route
            path="/teacher/exams"
            element={
              <MainLayout title="My Exams">
                <TeacherExamsPage />
              </MainLayout>
            }
          />
          <Route
            path="/teacher/questions"
            element={
              <MainLayout title="Questions">
                <TeacherQuestionsPage />
              </MainLayout>
            }
          />

          {/* Student */}
          <Route
            path="/student/dashboard"
            element={
              <MainLayout title="Student Dashboard" >
              <StudentDashboardPage />
            </MainLayout>
            }
          />
          <Route
              path="/student/schools"
              element={
                <MainLayout title="Schools">
                  <StudentSchoolsPage />
                </MainLayout>
              }
          />
          <Route
              path="/student/classes"
              element={
                <MainLayout title="My Classes">
                  <StudentClassesPage />
                </MainLayout>
              }
            />
          <Route
              path="/student/exams"
              element={
                <MainLayout title="Available Exams">
                  <StudentExamsPage />
                </MainLayout>
              }
            />
          <Route
              path="/student/exams/:examId"
              element={<StudentTakeExamPage />}
            />
          <Route
              path="/student/results"
              element={
                <MainLayout title="My Results">
                  <StudentResultsPage />
                </MainLayout>
              }
            />
          <Route
              path="/schools/:schoolId?"
              element={
                <MainLayout title="Schools">
                  <SchoolPage />
                </MainLayout>
              }
            />
          <Route
              path="/classes"
              element={
                <MainLayout title="Classes">
                  <ClassPage />
                </MainLayout>
              }
            />

          {/* Fallback */}
          <Route
            path="*"
            element={<PlaceholderPage title="Page Not Found" />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;