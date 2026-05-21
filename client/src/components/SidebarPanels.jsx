import React, { useState } from 'react';
import LeaderboardModal from './LeaderboardModal';

function SidebarPanels({
  onlineUsers,
  claimedTiles,
  myTiles,
  board,
  topPlayers,
  fullLeaderboard,
  recentNotifications,
  handleClaimRandomTile,
  handleReleaseMyTiles
}) {
  const [showFull, setShowFull] = useState(false);
  return (
    <aside className="sidebar">
      <section className="card glass stats-card reveal fade-up delay-4">
        <div className="card-head">
          <p className="section-kicker">Board stats</p>
          <h3>Live metrics</h3>
        </div>
        <div className="stats-grid">
          <article>
            <strong>{onlineUsers}</strong>
            <span>Connected</span>
          </article>
          <article>
            <strong>{claimedTiles}</strong>
            <span>Claimed tiles</span>
          </article>
          <article>
            <strong>{myTiles}</strong>
            <span>Tiles you own</span>
          </article>
          <article>
            <strong>{board.totalTiles}</strong>
            <span>Total tiles</span>
          </article>
        </div>
      </section>

      <section className="card glass command-card reveal fade-up delay-4">
        <div className="card-head">
          <p className="section-kicker">Quick actions</p>
          <h3>Command deck</h3>
        </div>
        <div className="action-stack">
          <button type="button" className="primary-btn" onClick={handleClaimRandomTile}>Claim random tile</button>
          <button type="button" className="secondary-btn" onClick={handleReleaseMyTiles}>Release my tiles</button>
        </div>
      </section>

      <section className="card glass leaderboard-card reveal fade-up delay-5">
        <div className="card-head leaderboard-head">
          <div className="leaderboard-head-top">
            <div className="leaderboard-head-left">Leaderboard</div>
            <div className="leaderboard-head-right">
              <button type="button" className="view-all-btn" onClick={() => setShowFull(true)}>View all</button>
            </div>
          </div>
          <div className="leaderboard-head-bottom">Top 5 owners</div>
        </div>
        <div className="leaderboard-list">
          {topPlayers.length ? topPlayers.map((player, index) => (
            <div key={player.clientId} className="leader-item">
              <div className="leader-rank">{index + 1}</div>
              <div className="leader-meta">
                <strong>{player.name}</strong>
                <span>{player.tiles} tiles</span>
              </div>
              <span className="leader-swatch" style={{ backgroundColor: player.color }} />
            </div>
          )) : <p className="empty-copy">No tiles claimed yet. Be first.</p>}
        </div>
      </section>

      {showFull && (
        <LeaderboardModal fullLeaderboard={fullLeaderboard} onClose={() => setShowFull(false)} />
      )}

      <section className="card glass activity-card reveal fade-up delay-6">
        <div className="card-head">
          <p className="section-kicker">Recent activity</p>
          <h3>Live feed</h3>
        </div>
        {recentNotifications.length ? (
          <div className="recent-notification-stack">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="recent-notification">
                <strong>{notification.ownerName}</strong>
                <p>{notification.message}</p>
              </div>
            ))}
          </div>
        ) : null}
        {recentNotifications.length ? null : <p className="empty-copy">Claims will show up here instantly.</p>}
      </section>
    </aside>
  );
}

export default SidebarPanels;
