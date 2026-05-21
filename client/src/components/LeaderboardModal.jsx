export default function LeaderboardModal({ fullLeaderboard, onClose }) {
  return (
    <div className="leaderboard-modal" role="dialog" aria-modal="true">
      <div className="leaderboard-modal-inner glass">
        <div className="leaderboard-modal-head">
          <h3>Full Leaderboard</h3>
          <button className="secondary-btn" onClick={onClose}>Close</button>
        </div>

        <div className="leaderboard-modal-scroll">
          <table className="leaderboard-modal-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th className="right">Tiles</th>
              </tr>
            </thead>
            <tbody>
              {fullLeaderboard?.length ? fullLeaderboard.map((player, index) => (
                <tr key={player.clientId}>
                  <td>{index + 1}</td>
                  <td>{player.name || player.clientId}</td>
                  <td className="right">{player.tiles}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="empty">No users yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
