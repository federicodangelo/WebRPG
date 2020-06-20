//Using code from https://github.com/michaeldzjap/rand-seed

let _a: number;
let _b: number;
let _c: number;
let _d: number;

function buildSeedFunc(str: string) {
  let h = 2166136261 >>> 0;

  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }

  return (): number => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;

    return (h += h << 5) >>> 0;
  };
}

export function setRandomSeed(str: string) {
  const seed = buildSeedFunc(str);
  _a = seed();
  _b = seed();
  _c = seed();
  _d = seed();
}

export function randomNumber() {
  const t = _b << 9;
  let r = _a * 5;
  r = (r << 7 | r >>> 25) * 9;
  _c ^= _a;
  _d ^= _b;
  _b ^= _c;
  _a ^= _d;
  _c ^= t;
  _d = _d << 11 | _d >>> 21;

  return (r >>> 0) / 4294967296;
}

export function randomFromArray<T>(arr: T[]): T {
  return arr[(randomNumber() * arr.length) | 0];
}

export function randomIntervalInt(min: number, max: number): number {
  return (min | 0) + ((randomNumber() * (max - min)) | 0);
}

export function randomDirection() {
  return Math.round(randomNumber() * 2 - 1) | 0;
}

setRandomSeed("hello world");
