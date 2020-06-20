export function random<T>(arr: T[]): T {
  return arr[(Math.random() * arr.length) | 0];
}

export function randomIntervalInt(min: number, max: number): number {
  return (min | 0) + ((Math.random() * (max - min)) | 0);
}

export function randomDirection() {
  return Math.round(Math.random() * 2 - 1) | 0;
}
