import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authenticatedFetch, createSchool, getSchools } from "../../services/api";
import "./SchoolPage.css";

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
  owner: number | SchoolUser;
  logo: string | null;
  created_at: string;
  teachers: SchoolUser[];
  students: SchoolUser[];
};

type ListResponse<T> = T[] | { results: T[] };

function getItems<T>(data: ListResponse<T>): T[] {
  return Array.isArray(data) ? data : data.results;
}

export default function SchoolPage() {
  const { user } = useAuth();
  const isAdmin = user?.rules === "admin";

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [userCode, setUserCode] = useState("");
  const [memberRole, setMemberRole] = useState<"teacher" | "student">("student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSchools() {
    setLoading(true);
    setError("");

    try {
      const data = await getSchools<ListResponse<School>>();
      setSchools(getItems(data));
    } catch {
      setError("Failed to load schools.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSchools();
  }, []);

  async function handleCreateSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await createSchool(schoolName.trim());
      setSchoolName("");
      setMessage("School created successfully.");
      await loadSchools();
    } catch {
      setError("Failed to create school.");
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSchool) return;

    setError("");
    setMessage("");

    const action =
      memberRole === "teacher" ? "add_teacher" : "add_student";

    try {
      await authenticatedFetch(
        `/core/school/${selectedSchool.id}/${action}/`,
        {
          method: "POST",
          body: JSON.stringify({ user_code: userCode.trim() }),
        },
      );

      setUserCode("");
      setMessage(
        `${memberRole === "teacher" ? "Teacher" : "Student"} added successfully.`,
      );

      const updatedSchool = await authenticatedFetch<School>(
        `/core/school/${selectedSchool.id}/`,
      );

      setSelectedSchool(updatedSchool);
      await loadSchools();
    } catch {
      setError("Failed to add member. Check the user code and permissions.");
    }
  }

  async function openSchool(schoolId: number) {
    setError("");
    setMessage("");

    try {
      const school = await authenticatedFetch<School>(
        `/core/school/${schoolId}/`,
      );
      setSelectedSchool(school);
    } catch {
      setError("Failed to load school details.");
    }
  }

  if (loading) {
    return <main className="school-page">Loading schools...</main>;
  }

  return (
    <main className="school-page">
      <h1>Schools</h1>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {isAdmin && (
        <form onSubmit={handleCreateSchool}>
          <h2>Create school</h2>
          <input
            value={schoolName}
            onChange={(event) => setSchoolName(event.target.value)}
            placeholder="School name"
            required
          />
          <button type="submit">Create school</button>
        </form>
      )}

      <section>
        <h2>All schools</h2>

        {schools.length === 0 ? (
          <p>No schools found.</p>
        ) : (
          <ul>
            {schools.map((school) => (
              <li key={school.id}>
                <button
                  type="button"
                  onClick={() => void openSchool(school.id)}
                >
                  {school.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedSchool && (
        <section>
          <h2>{selectedSchool.name}</h2>
          <p>Created: {selectedSchool.created_at}</p>

          <h3>Teachers</h3>
          {selectedSchool.teachers?.length ? (
            <ul>
              {selectedSchool.teachers.map((teacher) => (
                <li key={teacher.id}>
                  {teacher.first_name} {teacher.last_name} — {teacher.email}
                </li>
              ))}
            </ul>
          ) : (
            <p>No teachers.</p>
          )}

          <h3>Students</h3>
          {selectedSchool.students?.length ? (
            <ul>
              {selectedSchool.students.map((student) => (
                <li key={student.id}>
                  {student.first_name} {student.last_name} — {student.email}
                </li>
              ))}
            </ul>
          ) : (
            <p>No students.</p>
          )}

          {isAdmin && (
            <form onSubmit={handleAddMember}>
              <h3>Add member</h3>

              <select
                value={memberRole}
                onChange={(event) =>
                  setMemberRole(event.target.value as "teacher" | "student")
                }
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>

              <input
                value={userCode}
                onChange={(event) => setUserCode(event.target.value)}
                placeholder="User code"
                required
              />

              <button type="submit">Add member</button>
            </form>
          )}

          <button type="button" onClick={() => setSelectedSchool(null)}>
            Close details
          </button>
        </section>
      )}
    </main>
  );
}