function SplashScreen({ splashText }) {
  return (
    <div className="splash-screen">
      <div className="splash-copy">
        <p className="splash-kicker">Shared Grid</p>
        <h1 className="splash-title">{splashText}</h1>
        <p className="splash-subhead">
          A live grid experience where every move matters.
        </p>
        <p className="splash-note">Loading your space…</p>
      </div>
    </div>
  );
}

export default SplashScreen;
