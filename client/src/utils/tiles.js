import { GRID_COLUMNS, GRID_ROWS } from '../constants/grid';

export function createTiles() {
  const initialTiles = [];

  for (let y = 0; y < GRID_ROWS; y += 1) {
    for (let x = 0; x < GRID_COLUMNS; x += 1) {
      initialTiles.push({
        id: `${x}:${y}`,
        x,
        y,
        ownerClientId: null,
        ownerName: null,
        ownerEmail: null,
        ownerColor: null,
        claimedAt: null
      });
    }
  }

  return initialTiles;
}
