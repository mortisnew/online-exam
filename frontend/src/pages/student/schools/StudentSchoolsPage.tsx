
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./StudentSchoolsPage.css";

type School = {
  id: number;
  name: string;
  created_at?: string;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function StudentSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSchools() {
      try {
        const data = await authenticatedFetch<ListResponse<School>>(
          "/core/school/",
        );
        setSchools(getItems(data));
      } catch {
        setError("Could not load schools. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadSchools();
  }, []);

  return (
    <section className="student-schools-page">
      <div className="student-schools-heading">
        <div>
          <h2>Schools</h2>
          <p>Browse the schools available to you.</p>
        </div>

        <Link to="/student/dashboard" className="student-schools-back">
          Back to Dashboard
        </Link>
      </div>

      <section className="student-schools-panel">
        <div className="student-schools-list-heading">
          <h3>Available Schools</h3>
          <span>{schools.length} schools</span>
        </div>

        {loading ? (
          <p className="student-schools-empty">Loading schools...</p>
        ) : error ? (
          <p className="student-schools-message error">{error}</p>
        ) : schools.length === 0 ? (
          <p className="student-schools-empty">
            No schools are available to you yet.
          </p>
        ) : (
          <div className="student-schools-grid">
            {schools.map((school) => (
              <article className="student-school-card" key={school.id}>
                <div className="student-school-icon">S</div>

                <h3>{school.name}</h3>

                <Link to={`/student/schools/${school.id}`}>
                  View School →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
