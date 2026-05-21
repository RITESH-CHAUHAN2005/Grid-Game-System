import { RANDOM_COLORS, STORAGE_KEY } from '../constants/grid';

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function createProfile() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    clientId: `u_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36).slice(-4)}`,
    name: '',
    email: '',
    color: randomItem(RANDOM_COLORS)
  };
}
