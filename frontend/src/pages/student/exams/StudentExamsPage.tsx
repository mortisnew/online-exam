import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./StudentExamsPage.css";

type Exam = {
  id: number;
  name: string;
  classroom: number;
  duration: number | null;
};

type ExamAttempt = {
  id: number;
  end_at: string;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function StudentExamsPage() {
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startError, setStartError] = useState("");
  const [startingExamId, setStartingExamId] = useState<number | null>(null);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await authenticatedFetch<ListResponse<Exam>>(
          "/core/exam/",
        );

        setExams(getItems(data));
      } catch {
        setError("Could not load exams. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadExams();
  }, []);

  async function startExam(examId: number) {
    setStartingExamId(examId);
    setStartError("");

    try {
      const attempt = await authenticatedFetch<ExamAttempt>(
        `/core/exam/${examId}/start_exam/`,
        { method: "POST" },
      );

      navigate(`/student/exams/${examId}`, {
        state: {
          attemptId: attempt.id,
          endAt: attempt.end_at,
        },
      });
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "detail" in err &&
        typeof err.detail === "string"
          ? err.detail
          : "Could not start this exam. Please try again.";

      setStartError(message);
    } finally {
      setStartingExamId(null);
    }
  }

  return (
    <section className="student-exams-page">
      <div className="student-exams-heading">
        <div>
          <h2>Available Exams</h2>
          <p>View your exams and start when you're ready.</p>
        </div>

        <Link to="/student/dashboard" className="student-exams-back">
          Back to Dashboard
        </Link>
      </div>

      <section className="student-exams-panel">
        <div className="student-exams-list-heading">
          <h3>Exams</h3>
          <span>
            {exams.length} {exams.length === 1 ? "exam" : "exams"}
          </span>
        </div>

        {loading ? (
          <p className="student-exams-empty">Loading exams...</p>
        ) : error ? (
          <p className="student-exams-message error">{error}</p>
        ) : exams.length === 0 ? (
          <p className="student-exams-empty">No exams are available yet.</p>
        ) : (
          <div className="student-exams-grid">
            {exams.map((exam) => (
              <article className="student-exam-card" key={exam.id}>
                <div className="student-exam-icon">E</div>

                <h3>{exam.name}</h3>

                <p>Class ID: {exam.classroom}</p>

                <p>
                  Duration:{" "}
                  {exam.duration != null
                    ? `${exam.duration} minutes`
                    : "Not specified"}
                </p>

                <button
                  type="button"
                  onClick={() => void startExam(exam.id)}
                  disabled={startingExamId !== null}
                >
                  {startingExamId === exam.id ? "Starting..." : "Start Exam"}
                </button>
              </article>
            ))}
          </div>
        )}

        {startError && (
          <p className="student-exams-message error">{startError}</p>
        )}
      </section>
    </section>
  );
}
