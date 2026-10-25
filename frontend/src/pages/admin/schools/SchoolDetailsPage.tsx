import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { authenticatedFetch } from "../../../services/api";
import "./SchoolDetailsPage.css";

type SchoolUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_code: string;
};

type School = {
  id: number;
  name: string;
  owner: SchoolUser;
  created_at: string;
  logo: string | null;
  teachers: SchoolUser[];
  students: SchoolUser[];
};

export default function SchoolDetailsPage() {
  const { schoolId } = useParams();

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentCode, setStudentCode] = useState("");
  const [teacherCode, setTeacherCode] = useState("");

  const [addingStudent, setAddingStudent] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);

  const [studentMessage, setStudentMessage] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");

  useEffect(() => {
    if (!schoolId) {
      setError("School ID is missing.");
      setLoading(false);
      return;
    }

    authenticatedFetch<School>(`/core/school/${schoolId}/`)
      .then(setSchool)
      .catch(() => {
        setError("Could not load school details. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [schoolId]);

  async function handleAddStudent(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!schoolId || !studentCode.trim() || addingStudent) return;

    setAddingStudent(true);
    setStudentMessage("");

    try {
      await authenticatedFetch(
        `/core/school/${schoolId}/add_student/`,
        {
          method: "POST",
          body: JSON.stringify({ user_code: studentCode.trim() }),
        },
      );

      setStudentMessage("Student added successfully.");
      setStudentCode("");

      const updatedSchool = await authenticatedFetch<School>(
        `/core/school/${schoolId}/`,
      );
      setSchool(updatedSchool);
    } catch {
      setStudentMessage(
        "Could not add student. Check the user code and student role.",
      );
    } finally {
      setAddingStudent(false);
    }
  }

  async function handleAddTeacher(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!schoolId || !teacherCode.trim() || addingTeacher) return;

    setAddingTeacher(true);
    setTeacherMessage("");

    try {
      await authenticatedFetch(
        `/core/school/${schoolId}/add_teacher/`,
        {
          method: "POST",
          body: JSON.stringify({ user_code: teacherCode.trim() }),
        },
      );

      setTeacherMessage("Teacher added successfully.");
      setTeacherCode("");

      const updatedSchool = await authenticatedFetch<School>(
        `/core/school/${schoolId}/`,
      );
      setSchool(updatedSchool);
    } catch {
      setTeacherMessage(
        "Could not add teacher. Check the user code and teacher role.",
      );
    } finally {
      setAddingTeacher(false);
    }
  }

  if (loading) return <p>Loading school details...</p>;

  if (error || !school) {
    return (
      <section>
        <p role="alert">{error || "School not found."}</p>
        <Link to="/admin/schools">Back to My Schools</Link>
      </section>
    );
  }

  function fullName(user: SchoolUser) {
    return `${user.first_name} ${user.last_name}`.trim() || "Not provided";
  }

  return (
    <section className="school-details">
      <div className="dashboard-heading">
        <div>
          <h2>{school.name}</h2>
          <p>School details</p>
        </div>
        <Link to="/admin/schools">Back to My Schools</Link>
      </div>

      <article>
        <h3>Overview</h3>
        <p>
          <strong>Owner:</strong> {fullName(school.owner)}
        </p>
        <p>
          <strong>Owner email:</strong> {school.owner.email}
        </p>
        <p>
          <strong>Created at:</strong>{" "}
          {new Date(school.created_at).toLocaleString("en-US")}
        </p>
        <p>
          <strong>Teachers:</strong> {school.teachers.length}
        </p>
        <p>
          <strong>Students:</strong> {school.students.length}
        </p>

        {school.logo && (
          <div>
            <h3>Logo</h3>
            <img
              src={school.logo}
              alt={`${school.name} logo`}
              style={{
                maxWidth: "160px",
                maxHeight: "160px",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </article>

      <article>
        <h3>Teachers</h3>
        {school.teachers.length === 0 ? (
          <p>No teachers added yet.</p>
        ) : (
          <ul>
            {school.teachers.map((teacher) => (
              <li key={teacher.id}>
                {fullName(teacher)} — {teacher.email}
              </li>
            ))}
          </ul>
        )}
      </article>

      <article>
        <h3>Add Teacher</h3>
        <form onSubmit={handleAddTeacher}>
          <label htmlFor="teacher-code">Teacher user code</label>
          <input
            id="teacher-code"
            value={teacherCode}
            onChange={(event) => setTeacherCode(event.target.value)}
            placeholder="Enter teacher UUID"
            required
            disabled={addingTeacher}
          />
          <button
            type="submit"
            disabled={addingTeacher || !teacherCode.trim()}
          >
            {addingTeacher ? "Adding..." : "Add Teacher"}
          </button>
        </form>
        {teacherMessage && <p role="status">{teacherMessage}</p>}
      </article>

      <article>
        <h3>Add Student</h3>
        <form onSubmit={handleAddStudent}>
          <label htmlFor="student-code">Student user code</label>
          <input
            id="student-code"
            value={studentCode}
            onChange={(event) => setStudentCode(event.target.value)}
            placeholder="Enter student UUID"
            required
            disabled={addingStudent}
          />
          <button
            type="submit"
            disabled={addingStudent || !studentCode.trim()}
          >
            {addingStudent ? "Adding..." : "Add Student"}
          </button>
        </form>
        {studentMessage && <p role="status">{studentMessage}</p>}
      </article>
    </section>
  );
}
