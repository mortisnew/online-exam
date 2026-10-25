import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSchools } from "../../../services/api";
import "./AdminSchoolsPage.css";

type School = {
  id: number;
  name: string;
  created_at: string;
};

type SchoolListResponse = School[] | { results: School[] };

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSchools<SchoolListResponse>()
      .then((data) => {
        setSchools(Array.isArray(data) ? data : data.results);
      })
      .catch(() => {
        setError("Could not load schools. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="admin-schools">
      <div className="dashboard-heading">
        <div>
          <h2>My Schools</h2>
          <p>View and manage the schools you own.</p>
        </div>
        <Link to="/admin/dashboard">Back to Dashboard</Link>
      </div>

      {loading && (
        <p className="page-message">Loading schools...</p>
      )}

      {error && (
        <p className="page-message" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && schools.length === 0 && (
        <p className="page-message">
          You haven't created any schools yet.
        </p>
      )}

      {!loading && !error && schools.length > 0 && (
        <div className="school-list">
          {schools.map((school) => (
            <article className="school-card" key={school.id}>
              <h3>{school.name}</h3>
              <p>
                Created:{" "}
                {new Date(school.created_at).toLocaleDateString("en-US")}
              </p>
              <Link to={`/admin/schools/${school.id}`}>
                View school
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
