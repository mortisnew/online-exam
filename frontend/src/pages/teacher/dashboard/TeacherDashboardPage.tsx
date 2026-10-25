import { Link } from "react-router-dom";
import "./TeacherDashboardPage.css";

export default function TeacherDashboardPage() {
  return (
    <section className="teacher-dashboard">
      <div className="teacher-dashboard-heading">
        <div>
          <h2>Teacher Dashboard</h2>
          <p>Manage your classes, exams, and questions.</p>
        </div>

        <Link to="/profile" className="teacher-profile-link">
          View My Profile
        </Link>
      </div>

      <section className="teacher-overview">
        <div>
          <span className="teacher-overview-label">Workspace</span>
          <h3>Teacher Panel</h3>
          <p>Manage your teaching activities from one place.</p>
        </div>

        <Link to="/teacher/classes">View My Classes →</Link>
      </section>

      <section className="teacher-dashboard-section">
        <div className="teacher-section-heading">
          <div>
            <h3>Quick Actions</h3>
            <p>Choose what you want to manage.</p>
          </div>
        </div>

        <div className="teacher-action-grid">
          <Link to="/teacher/classes" className="teacher-action-card">
            <span className="teacher-action-icon">C</span>
            <h3>My Classes</h3>
            <p>View and manage your classrooms and students.</p>
            <span className="teacher-action-link">Manage Classes →</span>
          </Link>

          <Link to="/teacher/exams" className="teacher-action-card">
            <span className="teacher-action-icon">E</span>
            <h3>My Exams</h3>
            <p>Create exams and manage existing ones.</p>
            <span className="teacher-action-link">Manage Exams →</span>
          </Link>

          <Link to="/teacher/questions" className="teacher-action-card">
            <span className="teacher-action-icon">Q</span>
            <h3>Questions</h3>
            <p>Create and manage questions for your exams.</p>
            <span className="teacher-action-link">Manage Questions →</span>
          </Link>
        </div>
      </section>
    </section>
  );
}