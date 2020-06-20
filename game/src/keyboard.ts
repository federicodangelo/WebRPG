import { KeyCode, EngineKeyEvent } from "engine/types.ts";

export type KeyDownSource = {
  keysDown: Map<string, boolean>;
  specialKeysDown: Map<KeyCode, boolean>;
};

export function isKeyDown(source: KeyDownSource, key: string) {
  return source.keysDown.get(key) || false;
}

export function setKeyDown(source: KeyDownSource, key: string, down: boolean) {
  source.keysDown.set(key, down);
}

export function isSpecialKeyDown(source: KeyDownSource, code: KeyCode) {
  return source.specialKeysDown.get(code) || false;
}

export function setSpecialKeyDown(
  source: KeyDownSource,
  code: KeyCode,
  down: boolean,
) {
  source.specialKeysDown.set(code, down);
}

export function onKeyEvent(source: KeyDownSource, e: EngineKeyEvent) {
  if (e.char) {
    if (e.type === "down") {
      setKeyDown(source, e.char, true);
    } else if (e.type === "up") {
      setKeyDown(source, e.char, false);
    }
  } else if (e.code) {
    if (e.type === "down") {
      setSpecialKeyDown(source, e.code, true);
    } else if (e.type === "up") {
      setSpecialKeyDown(source, e.code, false);
    }
  }
}
