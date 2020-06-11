import {
  Engine,
  Assets,
  KeyEvent,
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
import { initUI } from "./ui.ts";

const NPCS_COUNT = 10;

function onKeyEvent(game: Game, e: KeyEvent) {
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

export function initGame(engine: Engine, assets: Assets): Game {
  const { mainUI, map } = initUI(engine, assets);

  const ui = mainUI.panel2;
  const scrollable = map;
  const p1 = new Avatar("female1", assets);
  const p2 = new Avatar("female2", assets);
  const npcs: Npc[] = [];
  const avatars: Avatar[] = [];
  const updateables: Updateable[] = [];

  for (let i = 0; i < NPCS_COUNT; i++) {
    npcs.push(new Npc(i % 2 == 0 ? "npc1" : "npc2", assets));
  }

  avatars.push(...npcs, p1, p2);

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
    ui,
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
