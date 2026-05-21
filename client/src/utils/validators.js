export function isEmailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
