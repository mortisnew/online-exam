
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const roleLinks = {
  admin: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Schools", to: "/schools" },
    { label: "Classes", to: "/classes" },
  ],
  teacher: [
    { label: "Dashboard", to: "/teacher/dashboard" },
    { label: "Schools", to: "/schools" },
    { label: "Classes", to: "/classes" },
    { label: "My Exams", to: "/teacher/exams" },
    { label: "Questions", to: "/teacher/questions" },
  ],
  student: [
    { label: "Dashboard", to: "/student/dashboard" },
    { label: "Schools", to: "/schools" },
    { label: "Classes", to: "/classes" },
    { label: "Available Exams", to: "/student/exams" },
    { label: "Results", to: "/student/results" },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const links = roleLinks[user.rules];

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        examin<span>.</span>
      </NavLink>

      <p className="sidebar-role">{user.rules}</p>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
