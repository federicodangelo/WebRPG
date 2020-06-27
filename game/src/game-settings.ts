export type GameSettings = {
  showFps: boolean;
};

let gameSettings: GameSettings = {
  showFps: false,
};

export function getSettings() {
  return { ...gameSettings };
}

export function setSettings(settings: GameSettings) {
  gameSettings = {
    ...settings,
  };
}
