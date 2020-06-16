import { Avatar } from "./avatar.ts";
import { Game } from "./types.ts";
import { KeyCode, Engine } from "engine/types.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/game/tiles-container.ts";

export function followAvatar(
  avatar: Avatar,
  map: ScrollableTilesContainerWidget,
) {
  let newOffsetX = -avatar.x + Math.floor(map.width * 0.5);
  let newOffsetY = -avatar.y + Math.floor(map.height * 0.5);

  map.setOffset(
    Math.max(
      Math.min(newOffsetX, 0),
      -(map.tilemapsBounds.width - map.width),
    ),
    Math.max(
      Math.min(newOffsetY, 0),
      -(map.tilemapsBounds.height - map.height),
    ),
  );
}

export function isKeyDown(game: Game, key: string) {
  return game.keysDown.get(key) || false;
}

export function setKeyDown(game: Game, key: string, down: boolean) {
  game.keysDown.set(key, down);
}

export function isSpecialKeyDown(game: Game, code: KeyCode) {
  return game.specialKeysDown.get(code) || false;
}

export function setSpecialKeyDown(game: Game, code: KeyCode, down: boolean) {
  game.specialKeysDown.set(code, down);
}
