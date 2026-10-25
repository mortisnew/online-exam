
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <header className="app-header">
      <div className="header-title">Dashboard</div>

      <div className="header-user">
        {user.avatar ? (
          <img
            className="header-avatar"
            src={user.avatar}
            alt={fullName || "User"}
          />
        ) : (
          <div className="header-avatar header-avatar-placeholder">
            {(user.first_name?.[0] || user.email[0] || "U").toUpperCase()}
          </div>
        )}

        <div className="header-user-info">
          <span className="header-user-name">{fullName || user.email}</span>
          <span className="header-user-role">{user.rules}</span>
        </div>

        <button className="header-logout" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
