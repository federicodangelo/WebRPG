export function random<T>(arr: T[]): T {
  return arr[Math.trunc(Math.random() * arr.length)];
}

export function randomIntervalInt(min: number, max: number): number {
  return Math.trunc(min) + Math.trunc(Math.random() * (max - min));
}

export function randomDirection() {
  return Math.round(Math.random() * 2 - 1);
}
