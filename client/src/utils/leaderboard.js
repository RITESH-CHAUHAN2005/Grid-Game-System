export function buildLeaderboard(tiles, limit = 5) {
  const ranking = new Map();

  for (const tile of tiles) {
    if (!tile.ownerClientId) {
      continue;
    }

    const current = ranking.get(tile.ownerClientId) ?? {
      clientId: tile.ownerClientId,
      name: tile.ownerName,
      color: tile.ownerColor,
      tiles: 0
    };

    current.tiles += 1;
    ranking.set(tile.ownerClientId, current);
  }

  const sorted = Array.from(ranking.values()).sort((left, right) => {
    if (right.tiles !== left.tiles) {
      return right.tiles - left.tiles;
    }

    return left.name.localeCompare(right.name);
  });

  if (limit == null) {
    return sorted;
  }

  return sorted.slice(0, limit);
}
