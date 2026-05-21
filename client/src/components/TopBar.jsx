function TopBar({ profile, zoom, setZoom, onLogout }) {
  return (
    <section className="topbar glass reveal fade-up delay-1">
      <div>
        <p className="eyebrow">Realtime grid board</p>
        <h1 className="heading-typewriter">Capture the grid.</h1>
        <p className="subhead">Mark your territory on the real-time grid.</p>
      </div>

      <div className="topbar-controls">
        <div className="status-pill status-live">
          <span className="status-dot" />
          Realtime Sync
        </div>
        <div className="logged-in-card">
          <span className="avatar" style={{ backgroundColor: profile.color }} />
          <div className="logged-in-meta">
            <p>Logged in as</p>
            <strong>{profile.name}</strong>
            <span>{profile.email}</span>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            ↑
          </button>
        </div>
        <label className="zoom-control">
          <span>Zoom</span>
          <input
            type="range"
            min="70"
            max="140"
            step="1"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <strong>{zoom}%</strong>
        </label>
      </div>
    </section>
  );
}

export default TopBar;
