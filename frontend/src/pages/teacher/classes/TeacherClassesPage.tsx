
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authenticatedFetch, getSchools } from "../../../services/api";
import "./TeacherClassesPage.css";

type School = {
  id: number;
  name: string;
};

type Classroom = {
  id: number;
  name: string;
  school: number | School;
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [className, setClassName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [classData, schoolData] = await Promise.all([
          authenticatedFetch<ListResponse<Classroom>>("/core/classroom/"),
          getSchools<ListResponse<School>>(),
        ]);

        setClasses(getItems(classData));
        const availableSchools = getItems(schoolData);
        setSchools(availableSchools);

        if (availableSchools.length > 0) {
          setSchoolId(String(availableSchools[0].id));
        }
      } catch {
        setError("Could not load classes and schools. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  async function handleCreateClass(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = className.trim();

    if (!name || !schoolId || creating) return;

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const classroom = await authenticatedFetch<Classroom>(
        "/core/classroom/",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            school: Number(schoolId),
          }),
        },
      );

      setClasses((current) => [...current, classroom]);
      setClassName("");
      setSuccess("Class created successfully.");
    } catch {
      setError("Could not create the class. Please check your input and try again.");
    } finally {
      setCreating(false);
    }
  }
  async function handleAddStudent(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const code = studentCode.trim();

  if (!code || !selectedClassId || addingStudent) return;

  setAddingStudent(true);
  setError("");
  setSuccess("");

  try {
    await authenticatedFetch(
      `/core/classroom/${selectedClassId}/add_student/`,
      {
        method: "POST",
        body: JSON.stringify({ user_code: code }),
      },
    );

    setStudentCode("");
    setSuccess("Student added to the class successfully.");
  } catch {
    setError("Could not add the student. Check the student code and try again.");
  } finally {
    setAddingStudent(false);
  }
  }
  function getSchoolName(school: number | School) {
    if (typeof school === "object") return school.name;

    return schools.find((item) => item.id === school)?.name ?? "School";
  }

  return (
    <section className="teacher-classes-page">
      <div className="teacher-classes-heading">
        <div>
          <h2>My Classes</h2>
          <p>Create classrooms and manage your teaching groups.</p>
        </div>

        <Link to="/teacher/dashboard" className="teacher-classes-back">
          ← Dashboard
        </Link>
      </div>

      <section className="teacher-classes-panel">
        <div className="teacher-classes-section-heading">
          <div>
            <h3>Create a Class</h3>
            <p>Choose a school and enter the class name.</p>
          </div>
        </div>

        {schools.length === 0 && !loading ? (
          <p className="teacher-classes-message">
            No schools are available for your account. Contact the school
            administrator to be added to a school first.
          </p>
        ) : (
          <form
            className="teacher-create-class-form"
            onSubmit={handleCreateClass}
          >
            <div className="teacher-class-field">
              <label htmlFor="teacher-class-name">Class name</label>
              <input
                id="teacher-class-name"
                name="name"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="e.g. Mathematics 101"
                maxLength={150}
                required
                disabled={creating || loading}
              />
            </div>

            <div className="teacher-class-field">
              <label htmlFor="teacher-class-school">School</label>
              <select
                id="teacher-class-school"
                name="school"
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
            </div>

            <button
              type="submit"
              disabled={creating || loading || !className.trim() || !schoolId}
            >
              {creating ? "Creating..." : "Create Class"}
            </button>
          </form>
        )}

        {success && (
          <p className="teacher-classes-success" role="status">
            {success}
          </p>
        )}

        {error && (
          <p className="teacher-classes-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="teacher-classes-panel">
          <section className="teacher-classes-panel">
  <div className="teacher-classes-section-heading">
    <div>
      <h3>Add Student to Class</h3>
      <p>Enter a student's code and choose a class.</p>
    </div>
  </div>

  <form
    className="teacher-create-class-form"
    onSubmit={handleAddStudent}
  >
    <div className="teacher-class-field">
      <label htmlFor="student-user-code">Student Code</label>
      <input
        id="student-user-code"
        value={studentCode}
        onChange={(event) => setStudentCode(event.target.value)}
        placeholder="Enter student code"
        required
        disabled={addingStudent || loading}
      />
    </div>

    <div className="teacher-class-field">
      <label htmlFor="student-class-select">Select Class</label>
      <select
        id="student-class-select"
        value={selectedClassId}
        onChange={(event) => setSelectedClassId(event.target.value)}
        required
        disabled={addingStudent || loading || classes.length === 0}
      >
        <option value="">Choose a class</option>
        {classes.map((classroom) => (
          <option key={classroom.id} value={classroom.id}>
            {classroom.name}
          </option>
        ))}
      </select>
    </div>

    <button
      type="submit"
      disabled={
        addingStudent ||
        loading ||
        !studentCode.trim() ||
        !selectedClassId
      }
    >
      {addingStudent ? "Adding..." : "Add Student"}
    </button>
  </form>
</section>
        <div className="teacher-classes-section-heading">
          <div>
            <h3>Your Classes</h3>
            <p>Classes associated with your account.</p>
          </div>

          <span className="teacher-classes-count">
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </span>
        </div>

        {loading ? (
          <p className="teacher-classes-message">Loading classes...</p>
        ) : classes.length === 0 ? (
          <p className="teacher-classes-message">
            You haven't created any classes yet.
          </p>
        ) : (
          <div className="teacher-classes-grid">
            {classes.map((classroom) => (
              <article
                className="teacher-class-card"
                key={classroom.id}
              >
                <div className="teacher-class-icon" aria-hidden="true">
                  {classroom.name.charAt(0).toUpperCase()}
                </div>

                <h3>{classroom.name}</h3>
                <p>{getSchoolName(classroom.school)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
