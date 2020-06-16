import {
  Engine,
  Assets,
  EngineKeyEvent,
  EngineMouseEvent,
  KeyCode,
  LayerId,
  Tile,
  Point,
} from "engine/types.ts";
import { Avatar } from "./avatar.ts";
import initMap1 from "./map.ts";
import { randomIntervalInt } from "./random.ts";
import { Npc } from "./npc.ts";
import { Game } from "./types.ts";
import {
  setKeyDown,
  isKeyDown,
  followAvatar,
  setSpecialKeyDown,
  isSpecialKeyDown,
} from "./utils.ts";
import { initUI } from "./ui.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/game/tiles-container.ts";
import { NativeContext } from "engine/native-types.ts";

const NPCS_COUNT = 10;
const ENABLE_P2 = true;

function onKeyEvent(game: Game, e: EngineKeyEvent) {
  if (e.char) {
    if (e.type === "down") {
      setKeyDown(game, e.char, true);
    } else if (e.type === "up") {
      setKeyDown(game, e.char, false);
    }
  } else if (e.code) {
    if (e.type === "down") {
      setSpecialKeyDown(game, e.code, true);
    } else if (e.type === "up") {
      setSpecialKeyDown(game, e.code, false);
    }
  }
}

const enum MouseMode {
  None,
  Move,
  AddTile,
}
var mouseMode = MouseMode.None;
let mouseKeyCodes: KeyCode[] = [];
let mouseModeAddTile: Tile | null = null;

function switchToAddTileMode(tile: Tile) {
  mouseMode = MouseMode.AddTile;
  mouseModeAddTile = tile;
}

function mouseEventToMapCoordinates(
  engine: Engine,
  game: Game,
  e: EngineMouseEvent,
) {
  let widgetAt = engine.getWidgetAt(e.x, e.y);

  while (widgetAt !== null && widgetAt !== game.map) {
    widgetAt = widgetAt.parent;
  }

  if (widgetAt === null) return null;

  const map = game.map;
  const bounds = map.getBoundingBox();

  return new Point(e.x - bounds.x - map.offsetX, e.y - bounds.y - map.offsetY);
}

function mouseEventToKeyCodes(
  engine: Engine,
  game: Game,
  e: EngineMouseEvent,
): KeyCode[] {
  const keyCodes: KeyCode[] = [];

  if (mouseEventToMapCoordinates(engine, game, e) === null) return keyCodes;

  const map = game.map;
  const bounds = map.getBoundingBox();
  let dx = e.x - bounds.x - bounds.width * 0.5;
  let dy = e.y - bounds.y - bounds.height * 0.5;
  let len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    dx /= len;
    dy /= len;

    if (dx < -0.25) {
      keyCodes.push(KeyCode.ArrowLeft);
    } else if (dx > 0.25) {
      keyCodes.push(KeyCode.ArrowRight);
    }

    if (dy < -0.25) {
      keyCodes.push(KeyCode.ArrowUp);
    } else if (dy > 0.25) {
      keyCodes.push(KeyCode.ArrowDown);
    }
  }

  return keyCodes;
}

function keyCodesEqual(codes1: KeyCode[], codes2: KeyCode[]) {
  if (codes1.length !== codes2.length) return false;
  for (let i = 0; i < codes1.length; i++) {
    if (codes1[i] !== codes2[i]) return false;
  }
  return true;
}

function onMouseEvent(engine: Engine, game: Game, e: EngineMouseEvent) {
  switch (e.type) {
    case "down":
      {
        if (mouseMode === MouseMode.AddTile && mouseModeAddTile !== null) {
          const mapCoords = mouseEventToMapCoordinates(engine, game, e);
          if (mapCoords !== null) {
            const tx = (mapCoords.x / game.floorLayer2.tilemap.tileWidth) | 0;
            const ty = (mapCoords.y / game.floorLayer2.tilemap.tileHeight) | 0;
            game.floorLayer2.setTileIndex(tx, ty, mouseModeAddTile.index);
            game.floorLayer2.invalidate();
          }
          mouseMode = MouseMode.None;
        } else {
          const newCodes = mouseEventToKeyCodes(engine, game, e);
          if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
            mouseMode = MouseMode.Move;
            mouseKeyCodes.forEach((code) =>
              setSpecialKeyDown(game, code, false)
            );
            mouseKeyCodes = newCodes;
            mouseKeyCodes.forEach((code) =>
              setSpecialKeyDown(game, code, true)
            );
          }
        }
      }
      break;

    case "move":
      {
        switch (mouseMode) {
          case MouseMode.Move:
            {
              const newCodes = mouseEventToKeyCodes(engine, game, e);
              if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
                mouseKeyCodes.forEach((code) =>
                  setSpecialKeyDown(game, code, false)
                );
                mouseKeyCodes = newCodes;
                mouseKeyCodes.forEach((code) =>
                  setSpecialKeyDown(game, code, true)
                );
              }
            }
            break;
        }
      }
      break;

    case "up":
      switch (mouseMode) {
        case MouseMode.Move:
          mouseMode = MouseMode.None;
          mouseKeyCodes.forEach((code) => setSpecialKeyDown(game, code, false));
          mouseKeyCodes.length = 0;
          break;
      }
  }
}

export function initGame(
  engine: Engine,
  assets: Assets,
  native: NativeContext,
): Game {
  const { mainUI, statsContainer, buttonsContainer, addButton, itemsButtons } =
    initUI(
      engine,
      assets,
      native,
    );

  const map = new ScrollableTilesContainerWidget();
  map.layer = LayerId.Game;
  map.layout = { heightPercent: 100, widthPercent: 100 };
  map.setChildrenLayout({ type: "none" });

  const scrollable = map;
  const p1 = new Avatar("female1", assets);
  const p2 = new Avatar("female2", assets);
  const npcs: Npc[] = [];
  const avatars: Avatar[] = [];

  for (let i = 0; i < NPCS_COUNT; i++) {
    npcs.push(new Npc(i % 2 == 0 ? "npc1" : "npc2", assets));
  }

  if (ENABLE_P2) {
    avatars.push(...npcs, p1, p2);
  } else {
    avatars.push(...npcs, p1);
  }

  const mapLayers = initMap1(map, assets);

  avatars.forEach((c) => {
    c.parent = map;
    c.x = randomIntervalInt(
      map.tilemapsBounds.width / 2 - 100,
      map.tilemapsBounds.width / 2 + 100,
    );
    c.y = randomIntervalInt(
      map.tilemapsBounds.height / 2 - 100,
      map.tilemapsBounds.height / 2 + 100,
    );
  });

  const game: Game = {
    statsContainer,
    buttonsContainer,
    scrollable,
    addButton,
    avatars,
    map,
    floorLayer1: mapLayers.floor,
    floorLayer2: mapLayers.floor2,
    npcs,
    p1,
    p2,
    keysDown: new Map<string, boolean>(),
    specialKeysDown: new Map<KeyCode, boolean>(),
  };

  engine.addWidget(map, LayerId.Game);
  engine.addWidget(mainUI, LayerId.UI);
  engine.onKeyEvent((e) => onKeyEvent(game, e));
  engine.onMouseEvent((e) => onMouseEvent(engine, game, e));

  itemsButtons.forEach((tile, button) => {
    button.onTapped = () => {
      switchToAddTileMode(tile);
    };
  });

  return game;
}

export function updateGame(game: Game): boolean {
  const { p1, p2, avatars, map } = game;

  if (isKeyDown(game, "a") || isSpecialKeyDown(game, KeyCode.ArrowLeft)) {
    p1.move(-1, 0);
  }
  if (isKeyDown(game, "d") || isSpecialKeyDown(game, KeyCode.ArrowRight)) {
    p1.move(1, 0);
  }
  if (isKeyDown(game, "w") || isSpecialKeyDown(game, KeyCode.ArrowUp)) {
    p1.move(0, -1);
  }
  if (isKeyDown(game, "s") || isSpecialKeyDown(game, KeyCode.ArrowDown)) {
    p1.move(0, 1);
  }
  if (isKeyDown(game, "f") || isKeyDown(game, "z")) p1.shoot();
  if (isKeyDown(game, "r") || isKeyDown(game, "x")) p1.slash();

  if (isKeyDown(game, "j")) p2.move(-1, 0);
  if (isKeyDown(game, "l")) p2.move(1, 0);
  if (isKeyDown(game, "i")) p2.move(0, -1);
  if (isKeyDown(game, "k")) p2.move(0, 1);
  if (isKeyDown(game, ";")) p2.shoot();
  if (isKeyDown(game, "p")) p2.slash();

  avatars.forEach((avatar) => {
    avatar.x = Math.max(
      Math.min(avatar.x, map.tilemapsBounds.width),
      0,
    );
    avatar.y = Math.max(
      Math.min(avatar.y, map.tilemapsBounds.height),
      0,
    );
  });

  followAvatar(p1, map);

  return true;
}
