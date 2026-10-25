
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile, updateProfile } from "../../services/api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, setUser, loading } = useAuth();

  const [pageError, setPageError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      getProfile()
        .then((response) => setUser(response.profile))
        .catch(() => setPageError("Could not load your profile."));
    }
  }, [user, loading, setUser]);

  function openEditModal() {
    if (!user) return;

    setFirstName(user.first_name);
    setLastName(user.last_name);
    setAvatar(user.avatar ?? "");
    setSaveError("");
    setModalOpen(true);
  }

  function closeEditModal() {
    if (saving) return;

    setModalOpen(false);
    setSaveError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const response = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar: avatar.trim() || null,
      });

      setUser(response.profile);
      setModalOpen(false);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "detail" in error &&
        typeof error.detail === "string"
          ? error.detail
          : "Could not save your changes. Check the image URL and try again.";

      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyCode() {
    if (!user?.user_code) return;

    try {
      await navigator.clipboard.writeText(user.user_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-message">Loading your profile...</div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="profile-page">
        <div className="profile-message profile-error" role="alert">
          {pageError}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-message">
          Please log in to view your profile.
        </div>
      </main>
    );
  }

  const fullName =
    `${user.first_name} ${user.last_name}`.trim() || "Your Name";

  const initials =
    `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() ||
    "?";

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and account details.</p>
        </div>

        <button
          type="button"
          className="profile-edit-button"
          onClick={openEditModal}
        >
          <span aria-hidden="true">✎</span>
          Edit Profile
        </button>
      </header>

      <section className="profile-hero">
        <div className="profile-hero-decoration" aria-hidden="true" />

        <div className="profile-hero-content">
          <div className="profile-avatar-wrap">
            {user.avatar ? (
              <img
                className="profile-avatar"
                src={user.avatar}
                alt={`${fullName}'s avatar`}
              />
            ) : (
              <div className="profile-avatar profile-avatar-placeholder">
                {initials}
              </div>
            )}

            <span
              className="profile-status-dot"
              title="Account active"
              aria-label="Account active"
            />
          </div>

          <div className="profile-hero-info">
            <span className="profile-hero-label">YOUR ACCOUNT</span>
            <h2>{fullName}</h2>
            <p>{user.email}</p>

            <div className="profile-hero-badges">
              <span className="profile-role-badge">
                {user.rules}
              </span>
              <span className="profile-active-badge">
                <span /> Active account
              </span>
            </div>
          </div>

          <button
            type="button"
            className="profile-hero-edit"
            onClick={openEditModal}
          >
            Edit details
          </button>
        </div>
      </section>

      <section className="profile-code-card">
        <div className="profile-code-icon" aria-hidden="true">
          <span>⌘</span>
        </div>

        <div className="profile-code-info">
          <h3>Your User Code</h3>
          <p>
            Share this code with your teacher to be added to a classroom.
          </p>
          <code>{user.user_code}</code>
        </div>

        <button
          type="button"
          className="profile-copy-button"
          onClick={handleCopyCode}
          disabled={!user.user_code}
        >
          <span aria-hidden="true">{copied ? "✓" : "▢"}</span>
          {copied ? "Copied!" : "Copy code"}
        </button>
      </section>

      <div className="profile-section-heading">
        <div>
          <h2>Account Overview</h2>
          <p>Your personal and account information.</p>
        </div>
      </div>

      <div className="profile-content-grid">
        <section className="profile-info-card">
          <div className="profile-card-heading">
            <div className="profile-card-icon profile-person-icon">
              <span aria-hidden="true">♙</span>
            </div>
            <div>
              <h3>Personal Information</h3>
              <p>Your basic details</p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-info-label">First name</span>
              <span className="profile-info-value">
                {user.first_name || "Not provided"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-info-label">Last name</span>
              <span className="profile-info-value">
                {user.last_name || "Not provided"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-info-label">Profile photo</span>
              <span className="profile-info-value">
                {user.avatar ? "Photo added" : "No photo"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="profile-text-button"
            onClick={openEditModal}
          >
            Edit personal information →
          </button>
        </section>

        <section className="profile-info-card">
          <div className="profile-card-heading">
            <div className="profile-card-icon profile-account-icon">
              <span aria-hidden="true">◎</span>
            </div>
            <div>
              <h3>Account Information</h3>
              <p>Your account details</p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="profile-info-label">Email address</span>
              <span className="profile-info-value profile-email-value">
                {user.email}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-info-label">Account role</span>
              <span className="profile-info-value">
                <span className="profile-small-role">{user.rules}</span>
              </span>
            </div>

            <div className="profile-info-row">
              <span className="profile-info-label">User code</span>
              <span className="profile-info-value">
                {user.user_code ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          <p className="profile-account-note">
            Your email and account role cannot be changed here.
          </p>
        </section>
      </div>

      <section className="profile-tip">
        <div className="profile-tip-icon" aria-hidden="true">
          i
        </div>
        <div>
          <h3>Keep your profile up to date</h3>
          <p>
            Make sure your name and profile photo help your teachers
            recognize you. Keep your user code handy when joining a class.
          </p>
        </div>
      </section>

      {modalOpen && (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            <header className="profile-modal-header">
              <div>
                <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
                <h2 id="profile-modal-title">Edit Profile</h2>
                <p>Update your personal details below.</p>
              </div>

              <button
                type="button"
                className="profile-modal-close"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close edit profile"
              >
                ×
              </button>
            </header>

            <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="profile-edit-preview">
                {avatar.trim() ? (
                  <img
                    src={avatar.trim()}
                    alt="Profile preview"
                    className="profile-avatar profile-preview-avatar"
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-placeholder profile-preview-avatar">
                    {`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
                      "?"}
                  </div>
                )}

                <div>
                  <strong>{`${firstName} ${lastName}`.trim() || "Your Name"}</strong>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="profile-form-row">
                <label className="profile-form-field">
                  <span>First name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    maxLength={150}
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                    disabled={saving}
                  />
                </label>

                <label className="profile-form-field">
                  <span>Last name</span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    maxLength={150}
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                    disabled={saving}
                  />
                </label>
              </div>

              <label className="profile-form-field">
                <span>Profile photo URL</span>
                <input
                  type="url"
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  disabled={saving}
                />
                <small>
                  Paste a direct image URL. Leave empty to remove your photo.
                </small>
              </label>

              {saveError && (
                <div className="profile-form-error" role="alert">
                  {saveError}
                </div>
              )}

              <footer className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
