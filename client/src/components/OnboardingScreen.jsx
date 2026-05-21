function OnboardingScreen({
  draftName,
  draftEmail,
  draftColor,
  setDraftName,
  setDraftEmail,
  setDraftColor,
  onSubmit,
  onboardingError,
  authMode,
  setAuthMode,
  isAuthSubmitting,
  onBack = () => {},
}) {
  const isLoginMode = authMode === "login";

  return (
    <div className="app-shell onboarding-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="onboarding-card glass">
        <p className="eyebrow">Before we begin</p>
        <h1 className="heading-typewriter heading-typewriter-onboarding">
          {isLoginMode ? "Login to your profile." : "Create your profile."}
        </h1>
        <p className="subhead">
          {isLoginMode
            ? "Enter your email address and password. The name field is being used as the password."
            : "To register, enter your email address, password (the name field), and choose an ID color."}
        </p>

        <form className="onboarding-form" onSubmit={onSubmit}>
          <label className="field">
            <span>
              Your name {isLoginMode ? "(Password)" : "(Use as password)"}
            </span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder={
                isLoginMode ? "Enter password" : "Enter your name/password"
              }
              maxLength={20}
              autoFocus
              disabled={isAuthSubmitting}
            />
          </label>
          <label className="field">
            <span>Your email id</span>
            <input
              type="email"
              value={draftEmail}
              onChange={(event) => setDraftEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={isAuthSubmitting}
            />
          </label>
          {!isLoginMode ? (
            <label className="field color-field">
              <span>Your ID color</span>
              <input
                type="color"
                value={draftColor}
                onChange={(event) => setDraftColor(event.target.value)}
                disabled={isAuthSubmitting}
              />
            </label>
          ) : null}
          <div className="profile-preview">
            <span className="avatar" style={{ backgroundColor: draftColor }} />
            <div>
              <strong>{draftName || "Your Name"}</strong>
              <p>{draftEmail || "you@example.com"}</p>
            </div>
          </div>
          <button
            className="primary-btn"
            type="submit"
            disabled={isAuthSubmitting}
          >
            {isAuthSubmitting
              ? "Please wait..."
              : isLoginMode
                ? "Login to Shared Grid"
                : "Register & Enter Shared Grid"}
          </button>

          <p className="switch-copy">If you already have an account</p>
          <button
            className="link-btn"
            type="button"
            onClick={() => setAuthMode(isLoginMode ? "register" : "login")}
            disabled={isAuthSubmitting}
          >
            {isLoginMode ? "Create new account" : "Login"}
          </button>

          {onboardingError ? (
            <p className="error-copy">{onboardingError}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

export default OnboardingScreen;
