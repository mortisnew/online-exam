
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./StudentResultsPage.css";

type ExamAttempt = {
  id: number;
  exam: number;
  student: number;
  start_at: string | null;
  end_at: string | null;
  active: boolean;
  total_score: number | string;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function StudentResultsPage() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await authenticatedFetch<ListResponse<ExamAttempt>>(
          "/core/exam/attempt/",
        );
        setAttempts(getItems(data));
      } catch {
        setError("Could not load your results. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadResults();
  }, []);

  const completedAttempts = attempts.filter(
    (attempt) => !attempt.active && attempt.end_at,
  );

  return (
    <section className="student-results-page">
      <div className="student-results-heading">
        <div>
          <h2>My Results</h2>
          <p>Review your completed exam attempts and scores.</p>
        </div>

        <Link to="/student/dashboard" className="student-results-back">
          Back to Dashboard
        </Link>
      </div>

      <section className="student-results-panel">
        <div className="student-results-list-heading">
          <h3>Exam History</h3>
          <span>{completedAttempts.length} completed</span>
        </div>

        {loading ? (
          <p className="student-results-empty">Loading results...</p>
        ) : error ? (
          <p className="student-results-message error">{error}</p>
        ) : completedAttempts.length === 0 ? (
          <p className="student-results-empty">
            You haven't completed any exams yet.
          </p>
        ) : (
          <div className="student-results-table-wrapper">
            <table className="student-results-table">
              <thead>
                <tr>
                  <th>Exam ID</th>
                  <th>Completed At</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {completedAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>Exam #{attempt.exam}</td>
                    <td>
                      {attempt.end_at
                        ? new Date(attempt.end_at).toLocaleString()
                        : "—"}
                    </td>
                    <td>{attempt.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
