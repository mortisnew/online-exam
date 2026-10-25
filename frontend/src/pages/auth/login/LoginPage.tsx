import { useState, type FormEventHandler } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../../../services/api";
import "../Auth.css";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

function LoginPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setLoading(true);
    try {
      const result = await loginUser({ email, password });

      localStorage.setItem("access", result.access);
      localStorage.setItem("refresh", result.refresh);
      const profile = await getProfile();
      login(profile);
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          examin<span>.</span>
        </Link>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to continue to your account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}

        <p className="auth-switch">
          Don’t have an account? <Link to="/register">Create one</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to home
        </Link>
      </section>
    </main>
  );
}

export default LoginPage;