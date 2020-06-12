import {
  Engine,
  Assets,
  EngineKeyEvent,
  EngineMouseEvent,
  KeyCode,
} from "engine/types.ts";
import { Avatar } from "./avatar.ts";
import initMap1 from "./map.ts";
import { randomIntervalInt } from "./random.ts";
import { Npc } from "./npc.ts";
import { Updateable, Game } from "./types.ts";
import {
  setKeyDown,
  isKeyDown,
  followAvatar,
  setSpecialKeyDown,
  isSpecialKeyDown,
} from "./utils.ts";
import { initUI } from "./ui2.ts";

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

var movingWithMouse = false;
let mouseKeyCodes: KeyCode[] = [];

function mouseEventToKeyCodes(
  engine: Engine,
  game: Game,
  e: EngineMouseEvent,
): KeyCode[] {
  const keyCodes: KeyCode[] = [];

  let widgetAt = engine.getWidgetAt(e.x, e.y);

  while (widgetAt !== null && widgetAt != game.map) {
    widgetAt = widgetAt.parent;
  }

  if (widgetAt === null) return keyCodes;

  const map = game.map;
  const bounds = map.getBoundingBox();
  const mapX = e.x - bounds.x;
  const mapY = e.y - bounds.y;

  const dx = mapX < map.width / 3 ? -1 : mapX > (map.width * 2) / 3 ? 1 : 0;
  const dy = mapY < map.height / 3 ? -1 : mapY > (map.height * 2) / 3 ? 1 : 0;

  if (dx === -1) {
    keyCodes.push(KeyCode.ArrowLeft);
  } else if (dx === 1) {
    keyCodes.push(KeyCode.ArrowRight);
  }

  if (dy === -1) {
    keyCodes.push(KeyCode.ArrowUp);
  } else if (dy === 1) {
    keyCodes.push(KeyCode.ArrowDown);
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
        const newCodes = mouseEventToKeyCodes(engine, game, e);
        if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
          movingWithMouse = true;
          mouseKeyCodes.forEach((code) => setSpecialKeyDown(game, code, false));
          mouseKeyCodes = newCodes;
          mouseKeyCodes.forEach((code) => setSpecialKeyDown(game, code, true));
        }
      }
      break;

    case "move":
      {
        if (!movingWithMouse) break;
        const newCodes = mouseEventToKeyCodes(engine, game, e);
        if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
          mouseKeyCodes.forEach((code) => setSpecialKeyDown(game, code, false));
          mouseKeyCodes = newCodes;
          mouseKeyCodes.forEach((code) => setSpecialKeyDown(game, code, true));
        }
      }
      break;

    case "up":
      if (!movingWithMouse) break;
      movingWithMouse = false;
      mouseKeyCodes.forEach((code) => setSpecialKeyDown(game, code, false));
      mouseKeyCodes.length = 0;
      break;
  }
}

export function initGame(engine: Engine, assets: Assets): Game {
  const { mainUI, map, statsContainer, buttonsContainer } = initUI(
    engine,
    assets,
  );

  const scrollable = map;
  const p1 = new Avatar("female1", assets);
  const p2 = new Avatar("female2", assets);
  const npcs: Npc[] = [];
  const avatars: Avatar[] = [];
  const updateables: Updateable[] = [];

  for (let i = 0; i < NPCS_COUNT; i++) {
    npcs.push(new Npc(i % 2 == 0 ? "npc1" : "npc2", assets));
  }

  if (ENABLE_P2) {
    avatars.push(...npcs, p1, p2);
  } else {
    avatars.push(...npcs, p1);
  }

  updateables.push(...avatars);

  initMap1(map, assets);

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
    avatars,
    map,
    npcs,
    p1,
    p2,
    updateables,
    keysDown: new Map<string, boolean>(),
    specialKeysDown: new Map<KeyCode, boolean>(),
  };

  engine.addWidget(mainUI);
  engine.onKeyEvent((e) => onKeyEvent(game, e));
  engine.onMouseEvent((e) => onMouseEvent(engine, game, e));
  engine.setMainScrollable(map);

  return game;
}

export function updateGame(engine: Engine, game: Game): boolean {
  const { p1, p2, avatars, updateables, map } = game;

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

  updateables.forEach((u) => u.update());

  followAvatar(p1, map, engine);

  return true;
}
