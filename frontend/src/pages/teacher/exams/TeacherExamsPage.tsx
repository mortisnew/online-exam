
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./TeacherExamsPage.css";

type Classroom = {
  id: number;
  name: string;
};

type Exam = {
  id: number;
  name: string;
  duration: number;
  classroom: number | Classroom;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [examName, setExamName] = useState("");
  const [duration, setDuration] = useState("30");
  const [classroomId, setClassroomId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [examData, classData] = await Promise.all([
          authenticatedFetch<ListResponse<Exam>>("/core/exam/"),
          authenticatedFetch<ListResponse<Classroom>>("/core/classroom/"),
        ]);

        setExams(getItems(examData));
        const availableClasses = getItems(classData);
        setClasses(availableClasses);

        if (availableClasses.length > 0) {
          setClassroomId(String(availableClasses[0].id));
        }
      } catch {
        setError("Could not load exams and classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function handleCreateExam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = examName.trim();

    if (!name || !classroomId || creating) return;

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const exam = await authenticatedFetch<Exam>("/core/exam/", {
        method: "POST",
        body: JSON.stringify({
          name,
          duration: Number(duration),
          classroom: Number(classroomId),
        }),
      });

      setExams((current) => [...current, exam]);
      setExamName("");
      setSuccess("Exam created successfully.");
    } catch {
      setError("Could not create the exam. Please check the selected class and try again.");
    } finally {
      setCreating(false);
    }
  }

  function getClassName(classroom: number | Classroom) {
    if (typeof classroom === "object") return classroom.name;

    return classes.find((item) => item.id === classroom)?.name ?? "Class";
  }

  return (
    <section className="teacher-exams-page">
      <div className="teacher-exams-heading">
        <div>
          <h2>My Exams</h2>
          <p>Create and manage exams for your classes.</p>
        </div>

        <Link to="/teacher/dashboard" className="teacher-exams-back">
          ← Dashboard
        </Link>
      </div>

      <section className="teacher-exams-panel">
        <div className="teacher-exams-section-heading">
          <div>
            <h3>Create an Exam</h3>
            <p>Choose a class, exam name, and duration.</p>
          </div>
        </div>

        {classes.length === 0 && !loading ? (
          <p className="teacher-exams-message">
            You need to create a class before creating an exam.
          </p>
        ) : (
          <form className="teacher-create-exam-form" onSubmit={handleCreateExam}>
            <div className="teacher-exam-field">
              <label htmlFor="teacher-exam-name">Exam name</label>
              <input
                id="teacher-exam-name"
                value={examName}
                onChange={(event) => setExamName(event.target.value)}
                placeholder="e.g. Mathematics Midterm"
                maxLength={150}
                required
                disabled={creating || loading}
              />
            </div>

            <div className="teacher-exam-field">
              <label htmlFor="teacher-exam-class">Class</label>
              <select
                id="teacher-exam-class"
                value={classroomId}
                onChange={(event) => setClassroomId(event.target.value)}
                required
                disabled={creating || loading}
              >
                {classes.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="teacher-exam-field">
              <label htmlFor="teacher-exam-duration">Duration</label>
              <select
                id="teacher-exam-duration"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                disabled={creating || loading}
              >
                {[15, 30, 45, 60, 90, 120, 150, 300].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={creating || loading || !examName.trim() || !classroomId}
            >
              {creating ? "Creating..." : "Create Exam"}
            </button>
          </form>
        )}

        {success && (
          <p className="teacher-exams-success" role="status">{success}</p>
        )}

        {error && (
          <p className="teacher-exams-error" role="alert">{error}</p>
        )}
      </section>

      <section className="teacher-exams-panel">
        <div className="teacher-exams-section-heading">
          <div>
            <h3>Your Exams</h3>
            <p>Exams associated with your classes.</p>
          </div>

          <span className="teacher-exams-count">
            {exams.length} {exams.length === 1 ? "exam" : "exams"}
          </span>
        </div>

        {loading ? (
          <p className="teacher-exams-message">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="teacher-exams-message">
            You haven't created any exams yet.
          </p>
        ) : (
          <div className="teacher-exams-grid">
            {exams.map((exam) => (
              <article className="teacher-exam-card" key={exam.id}>
                <div className="teacher-exam-icon" aria-hidden="true">E</div>
                <h3>{exam.name}</h3>
                <p>{getClassName(exam.classroom)}</p>
                <span className="teacher-exam-duration">
                  {exam.duration} minutes
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
