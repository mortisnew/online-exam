import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createSchool, getSchools } from "../../../services/api";
import "./AdminDashboardPage.css";

type School = {
  id: number;
  name: string;
  created_at: string;
};

type SchoolListResponse = School[] | { results: School[] };

export default function AdminDashboardPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSchools() {
    try {
      const data = await getSchools<SchoolListResponse>();
      setSchools(Array.isArray(data) ? data : data.results);
    } catch {
      setError("Could not load your schools. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSchools();
  }, []);

  async function handleCreateSchool(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = schoolName.trim();
    if (!name || creating) return;

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const school = (await createSchool(name)) as School;

      setSchools((current) => [...current, school]);
      setSchoolName("");
      setSuccess("School created successfully.");
    } catch {
      setError("Could not create the school. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="admin-dashboard">
      <div className="dashboard-heading">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage your account and the schools you own.</p>
        </div>

        <Link to="/profile" className="manage-schools-link">
          View My Profile
        </Link>
      </div>

      <section className="account-overview">
        <div>
          <span className="account-label">Account</span>
          <h3>Administrator</h3>
          <p>Manage your schools from one place.</p>
        </div>
        <Link to="/profile">Account details →</Link>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h3>Create a School</h3>
            <p>Add a new school to your account.</p>
          </div>
        </div>

        <form className="create-school-form" onSubmit={handleCreateSchool}>
          <label htmlFor="dashboard-school-name">School name</label>

          <div className="create-school-controls">
            <input
              id="dashboard-school-name"
              name="schoolName"
              type="text"
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
              placeholder="Enter school name"
              maxLength={150}
              required
              disabled={creating}
            />

            <button
              type="submit"
              disabled={creating || !schoolName.trim()}
            >
              {creating ? "Creating..." : "Create School"}
            </button>
          </div>
        </form>

        {success && <p className="dashboard-success" role="status">{success}</p>}
        {error && <p className="dashboard-error" role="alert">{error}</p>}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h3>My Schools</h3>
            <p>Schools you own and manage.</p>
          </div>

          <span className="school-count">
            {schools.length} {schools.length === 1 ? "school" : "schools"}
          </span>
        </div>

        {loading && (
          <p className="page-message">Loading your schools...</p>
        )}

        {!loading && !error && schools.length === 0 && (
          <p className="page-message">
            You haven't created any schools yet.
          </p>
        )}

        {!loading && schools.length > 0 && (
          <div className="school-grid">
            {schools.map((school) => (
              <article className="school-card" key={school.id}>
                <div className="school-card-icon" aria-hidden="true">
                  {school.name.charAt(0).toUpperCase()}
                </div>

                <h3>{school.name}</h3>

                <p>
                  Created{" "}
                  {new Date(school.created_at).toLocaleDateString("en-US")}
                </p>

                <Link to={`/admin/schools/${school.id}`}>
                  Manage School →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
