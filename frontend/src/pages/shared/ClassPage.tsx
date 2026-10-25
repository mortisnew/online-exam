import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authenticatedFetch, getSchools } from "../../services/api";
import "./ClassPage.css";

type School = {
  id: number;
  name: string;
};

type Classroom = {
  id: number;
  name: string;
  school: number | School;
  teacher: number;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function ClassPage() {
  const { user } = useAuth();
  const isTeacher = user?.rules === "teacher";

  const [classes, setClasses] = useState<Classroom[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [className, setClassName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    const classData = await authenticatedFetch<ListResponse<Classroom>>(
      "/core/classroom/",
    );
    setClasses(getItems(classData));

    if (isTeacher) {
      const schoolData = await getSchools<ListResponse<School>>();
      const availableSchools = getItems(schoolData);
      setSchools(availableSchools);

      setSchoolId((current) =>
        availableSchools.some((school) => String(school.id) === current)
          ? current
          : String(availableSchools[0]?.id ?? ""),
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        await loadData();
      } catch {
        if (!cancelled) {
          setError("Could not load classes. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [isTeacher]);

  function getSchoolName(school: number | School) {
    if (typeof school === "object") return school.name;
    return schools.find((item) => item.id === school)?.name ?? "School";
  }

  async function handleCreateClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = className.trim();
    if (!name || !schoolId || creating) return;

    setCreating(true);
    setError("");
    setMessage("");

    try {
      await authenticatedFetch("/core/classroom/", {
        method: "POST",
        body: JSON.stringify({
          name,
          school: Number(schoolId),
        }),
      });

      setClassName("");
      await loadData();
      setMessage("Class created successfully.");
    } catch {
      setError("Could not create the class. Check your school and try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleAddStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!studentCode.trim() || !selectedClassId || addingStudent) return;

    setAddingStudent(true);
    setError("");
    setMessage("");

    try {
      await authenticatedFetch(
        `/core/classroom/${selectedClassId}/add_student/`,
        {
          method: "POST",
          body: JSON.stringify({ user_code: studentCode.trim() }),
        },
      );

      setStudentCode("");
      setMessage("Student added to the class successfully.");
    } catch {
      setError("Could not add the student. Check the user code and try again.");
    } finally {
      setAddingStudent(false);
    }
  }

  return (
    <section className="shared-class-page">
      <header className="shared-class-heading">
        <div>
          <h2>Classes</h2>
          <p>View classes and their associated schools.</p>
        </div>
        <span className="shared-class-count">{classes.length} classes</span>
      </header>

      {error && <p className="shared-class-error" role="alert">{error}</p>}
      {message && <p className="shared-class-success" role="status">{message}</p>}

      {isTeacher && (
        <section className="shared-class-panel">
          <h3>Create a class</h3>
          {schools.length === 0 && !loading ? (
            <p>No schools are available for your account.</p>
          ) : (
            <form className="shared-class-form" onSubmit={handleCreateClass}>
              <label>
                Class name
                <input
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                  placeholder="e.g. Mathematics 101"
                  maxLength={150}
                  required
                  disabled={creating || loading}
                />
              </label>

              <label>
                School
                <select
                  value={schoolId}
                  onChange={(event) => setSchoolId(event.target.value)}
                  required
                  disabled={creating || loading}
                >
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" disabled={creating || loading || !schoolId}>
                {creating ? "Creating..." : "Create class"}
              </button>
            </form>
          )}
        </section>
      )}

      {isTeacher && (
        <section className="shared-class-panel">
          <h3>Add a student to a class</h3>
          <form className="shared-class-form" onSubmit={handleAddStudent}>
            <label>
              Class
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                required
                disabled={loading || classes.length === 0 || addingStudent}
              >
                <option value="">Choose a class</option>
                {classes.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Student user code
              <input
                value={studentCode}
                onChange={(event) => setStudentCode(event.target.value)}
                placeholder="Enter student code"
                required
                disabled={addingStudent}
              />
            </label>

            <button
              type="submit"
              disabled={addingStudent || !selectedClassId || !studentCode.trim()}
            >
              {addingStudent ? "Adding..." : "Add student"}
            </button>
          </form>
        </section>
      )}

      <section className="shared-class-panel">
        <h3>All available classes</h3>

        {loading ? (
          <p className="shared-class-empty">Loading classes...</p>
        ) : classes.length === 0 ? (
          <p className="shared-class-empty">No classes found.</p>
        ) : (
          <div className="shared-class-grid">
            {classes.map((classroom) => (
              <article className="shared-class-card" key={classroom.id}>
                <div className="shared-class-icon">C</div>
                <h4>{classroom.name}</h4>
                <p>{getSchoolName(classroom.school)}</p>
                <span>Class ID: {classroom.id}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
