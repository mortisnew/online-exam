
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./StudentClassesPage.css";

type Classroom = {
  id: number;
  name: string;
  school: number;
  teacher: number;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await authenticatedFetch<ListResponse<Classroom>>(
          "/core/classroom/",
        );
        setClasses(getItems(data));
      } catch {
        setError("Could not load your classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadClasses();
  }, []);

  return (
    <section className="student-classes-page">
      <div className="student-classes-heading">
        <div>
          <h2>My Classes</h2>
          <p>View the classes you are enrolled in.</p>
        </div>

        <Link to="/student/dashboard" className="student-classes-back">
          Back to Dashboard
        </Link>
      </div>

      <section className="student-classes-panel">
        <div className="student-classes-list-heading">
          <h3>My Classes</h3>
          <span>{classes.length} classes</span>
        </div>

        {loading ? (
          <p className="student-classes-empty">Loading classes...</p>
        ) : error ? (
          <p className="student-classes-message error">{error}</p>
        ) : classes.length === 0 ? (
          <p className="student-classes-empty">
            You haven't been added to any classes yet.
          </p>
        ) : (
          <div className="student-classes-grid">
            {classes.map((classroom) => (
              <article className="student-class-card" key={classroom.id}>
                <div className="student-class-icon">C</div>

                <h3>{classroom.name}</h3>

                <p>Class ID: {classroom.id}</p>

                <Link to={`/student/classes/${classroom.id}`}>
                  View Class →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
