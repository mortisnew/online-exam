
import { useState, type FormEventHandler } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../../services/api";
import "../Auth.css";

type RegisterErrors = Record<string, string[]>;

function RegisterPage() {
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrors({});
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);


    const password = String(formData.get("password") ?? "");
    const password2 = String(formData.get("password2") ?? "");

    if (password !== password2) {
      setErrors({ password2: ["Passwords do not match"] });
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        first_name: String(formData.get("first_name") ?? ""),
        last_name: String(formData.get("last_name") ?? ""),
        email: String(formData.get("email") ?? ""),
        rules: formData.get("rules") as "admin" | "teacher" | "student",
        password,
        password2,
      });

      setMessage("Account created successfully. You can now sign in.");
      form.reset();
    } catch (error: unknown) {
      console.error("Registration error:", error);
      if (typeof error === "object" && error !== null) {
        const apiErrors = error as Record<string, unknown>;
        const formattedErrors: RegisterErrors = {};

        for (const [field, value] of Object.entries(apiErrors)) {
          formattedErrors[field] = Array.isArray(value)
            ? value.map(String)
            : [String(value)];
        }

        setErrors(formattedErrors);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          examin<span>.</span>
        </Link>

        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Join examin to manage and take exams online.
        </p>

        {message && <p role="status">{message}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            placeholder="Your first name"
            autoComplete="given-name"
            required
          />
          {errors.first_name?.map((error, index) => (
            <p key={index} role="alert">{error}</p>
          ))}

          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            placeholder="Your last name"
            autoComplete="family-name"
            required
          />
          {errors.last_name?.map((error, index) => (
            <p key={index} role="alert">{error}</p>
          ))}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          {errors.email?.map((error, index) => (
            <p key={index} role="alert">{error}</p>
          ))}

          <label htmlFor="rules">Account type</label>
          <select id="rules" name="rules" defaultValue="student" required>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Administrator | School manager</option>
          </select>
          {errors.rules?.map((error, index) => (
            <p key={index} role="alert">{error}</p>
          ))}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
          {errors.password?.map((error, index) => (
            <p key={index} role="alert">{error}</p>
          ))}

          <label htmlFor="password2">Confirm password</label>
          <input
            id="password2"
            name="password2"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
          />
          {errors.password2?.map((error, index) => (
            <p key={index} role="alert">{error}</p>
          ))}

          {errors.detail?.map((error, index) => (
            <p key={index} role="alert">{error}</p>
          ))}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <Link to="/" className="auth-back">
          ← Back to home
        </Link>
      </section>
    </main>
  );
}

export default RegisterPage;
