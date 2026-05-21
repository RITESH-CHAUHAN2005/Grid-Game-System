function BoardPanel({ board, tiles, zoom, profile, handleClaim, pendingClaimTileId }) {
  return (
    <div className="board-panel glass reveal fade-up delay-3">
      <div className="board-header">
        <div>
          <p className="section-kicker">Map view</p>
          <h2>{board.columns} x {board.rows} tiles</h2>
        </div>
        <div className="board-metrics">
          <span>{tiles.filter((tile) => Boolean(tile.ownerClientId)).length} claimed</span>
          <span>1 online</span>
        </div>
      </div>

      <div className="board-frame">
        <div
          className="board-grid"
          style={{
            gridTemplateColumns: `repeat(${board.columns}, 26px)`,
            transform: `scale(${zoom / 100})`
          }}
        >
          {tiles.map((tile) => {
            const isMine = tile.ownerClientId === profile.clientId;
            const isClaimed = Boolean(tile.ownerClientId);
            const isPending = pendingClaimTileId === tile.id;

            return (
              <button
                key={tile.id}
                type="button"
                className={`tile ${isClaimed ? 'tile-claimed' : 'tile-empty'} ${isMine ? 'tile-mine' : ''}`}
                onClick={() => {
                  void handleClaim(tile.id);
                }}
                title={isClaimed ? `${tile.ownerName} owns ${tile.id}` : `Claim ${tile.id}`}
                aria-label={isClaimed ? `${tile.id} owned by ${tile.ownerName}` : `Claim ${tile.id}`}
                disabled={isPending}
                style={{
                  backgroundColor: isClaimed ? tile.ownerColor : undefined,
                  opacity: isPending ? 0.75 : 1
                }}
              >
                <span className="tile-glow" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BoardPanel;
