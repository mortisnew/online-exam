
import { Link } from "react-router-dom";
import "./StudentDashboardPage.css";

export default function StudentDashboardPage() {
  return (
    <section className="student-dashboard">
      <div className="student-dashboard-heading">
        <div>
          <h2>Student Dashboard</h2>
          <p>Track your classes, exams, and results.</p>
        </div>

        <Link to="/profile" className="student-profile-link">
          View My Profile
        </Link>
      </div>

      <section className="student-overview">
        <div>
          <span className="student-overview-label">Your Workspace</span>
          <h3>Welcome to Your Student Panel</h3>
          <p>
            Find your classes, take available exams, and review your results.
          </p>
        </div>

        <Link to="/student/exams">View Available Exams →</Link>
      </section>

      <section className="student-dashboard-section">
        <div className="student-section-heading">
          <div>
            <h3>Quick Actions</h3>
            <p>Choose where you want to go next.</p>
          </div>
        </div>

        <div className="student-action-grid">
          <Link to="/student/schools" className="student-action-card">
            <span className="student-action-icon">S</span>
            <h3>Schools</h3>
            <p>Browse schools available to you.</p>
            <span className="student-action-link">Browse Schools →</span>
          </Link>

          <Link to="/student/classes" className="student-action-card">
            <span className="student-action-icon">C</span>
            <h3>My Classes</h3>
            <p>View your classes and learning activities.</p>
            <span className="student-action-link">View Classes →</span>
          </Link>

          <Link to="/student/exams" className="student-action-card">
            <span className="student-action-icon">E</span>
            <h3>Available Exams</h3>
            <p>Find exams assigned to your classes.</p>
            <span className="student-action-link">View Exams →</span>
          </Link>

          <Link to="/student/results" className="student-action-card">
            <span className="student-action-icon">R</span>
            <h3>My Results</h3>
            <p>Review your exam results and scores.</p>
            <span className="student-action-link">View Results →</span>
          </Link>
        </div>
      </section>
    </section>
  );
}
