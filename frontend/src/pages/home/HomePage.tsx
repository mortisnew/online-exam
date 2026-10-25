
import "./HomePage.css";
import { useAuth } from "../../contexts/AuthContext";

const features = [
  {
    number: "01",
    title: "Take exams online",
    description:
      "Take your exams in a simple, focused environment and track your results in one place.",
    icon: "✎",
  },
  {
    number: "02",
    title: "Manage your classes",
    description:
      "Teachers can organize classrooms, manage students, and create exams with ease.",
    icon: "▤",
  },
  {
    number: "03",
    title: "Track your progress",
    description:
      "Review your scores and understand your performance after every completed exam.",
    icon: "↗",
  },
];

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="home-page">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Examin home">
          <span className="brand-mark">e.</span>
          <span>examin</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="login-link">
                {user.first_name} {user.last_name}
              </span>
              <button
                className="button button-dark button-small"
                onClick={logout}
                type="button"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a className="login-link" href="/login">
                Log in
              </a>
              <a
                className="button button-dark button-small"
                href="/register"
              >
                Get started <span aria-hidden="true">↗</span>
              </a>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              A smarter way to learn
            </div>

            <h1>
              Your next
              <br />
              <span>big result</span> starts here.
            </h1>

            <p className="hero-description">
              One place for online exams, classrooms, and progress.
              Everything students and teachers need, without the
              unnecessary complexity.
            </p>

            <div className="hero-actions">
              <a className="button button-dark" href="/register">
                Get started <span aria-hidden="true">↗</span>
              </a>
              <a className="button button-light" href="#features">
                Explore platform <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="hero-note">
              <span className="note-icon">✓</span>
              Simple for students. Powerful for teachers.
            </div>
          </div>

          <div className="hero-visual" aria-label="Exam dashboard preview">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />

            <div className="exam-card">
              <div className="exam-card-top">
                <div>
                  <span className="card-overline">STUDENT WORKSPACE</span>
                  <h2>Exam overview</h2>
                </div>
                <div className="avatar">
                  {user?.first_name?.charAt(0).toUpperCase() || "S"}
                </div>
              </div>

              <div className="welcome-panel">
                <div>
                  <span className="welcome-label">YOUR NEXT CHALLENGE</span>
                  <h3>
                    {user
                      ? `Welcome, ${user.first_name}!`
                      : "Ready when you are."}
                  </h3>
                  <p>Stay focused. Do your best.</p>
                </div>
                <div className="welcome-symbol">✳</div>
              </div>

              <div className="exam-card-heading">
                <span>Upcoming exams</span>
                <span className="muted-label">YOUR WORKSPACE</span>
              </div>

              <div className="mini-exam">
                <div className="subject-icon subject-purple">M</div>
                <div className="mini-exam-info">
                  <strong>Mathematics</strong>
                  <span>Multiple choice · 30 min</span>
                </div>
                <span className="mini-arrow">↗</span>
              </div>

              <div className="mini-exam">
                <div className="subject-icon subject-green">S</div>
                <div className="mini-exam-info">
                  <strong>Science</strong>
                  <span>Multiple choice · 45 min</span>
                </div>
                <span className="mini-arrow">↗</span>
              </div>

              <div className="card-bottom">
                <span className="bottom-check">✓</span>
                Your progress, all in one place.
              </div>
            </div>

            <div className="floating-note floating-note-top">
              <span className="floating-note-icon">✦</span>
              <div>
                <strong>Stay on track</strong>
                <span>One step at a time</span>
              </div>
            </div>

            <div className="floating-note floating-note-bottom">
              <div className="score-circle">92</div>
              <div>
                <strong>Your progress</strong>
                <span>Keep moving forward</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <div>
              <span className="section-kicker">BUILT FOR LEARNING</span>
              <h2>
                Less complexity.
                <br />
                <span>More progress.</span>
              </h2>
            </div>
            <p>
              The tools you need to make learning and teaching
              more organized, all in one platform.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-card-top">
                  <span className="feature-icon">{feature.icon}</span>
                  <span className="feature-number">{feature.number}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="/register" className="feature-link">
                  Get started <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="about">
          <div className="cta-decoration" aria-hidden="true">
            ✳
          </div>
          <span className="section-kicker">YOUR LEARNING JOURNEY</span>
          <h2>
            Make every
            <br />
            exam count.
          </h2>
          <p>
            Bring your classes, exams, and results together.
            Start with a clearer way to learn.
          </p>
          <a className="button button-white" href="/register">
            Get started <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">e.</span>
          <span>examin</span>
        </a>
        <p>Making online exams simpler.</p>
        <span className="copyright">
          © {new Date().getFullYear()} Examin
        </span>
      </footer>
    </div>
  );
}

export default HomePage;
