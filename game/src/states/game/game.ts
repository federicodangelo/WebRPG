import {
  Engine,
  Assets,
  EngineMouseEvent,
  KeyCode,
  LayerId,
  Tile,
  Point,
  Widget,
} from "engine/types.ts";
import { Avatar } from "./avatar.ts";
import initMap1 from "./map.ts";
import { randomIntervalInt } from "./random.ts";
import { Npc } from "./npc.ts";
import { State, StateParams, InitResult, StateId } from "../../types.ts";
import {
  isKeyDown,
  setSpecialKeyDown,
  isSpecialKeyDown,
  onKeyEvent,
} from "../../keyboard.ts";
import { initUI } from "./ui.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/game/tiles-container.ts";
import { getSettings } from "../../game-settings.ts";

const NPCS_COUNT = 10;
const ENABLE_P2 = true;

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
  context: StateContext,
  e: EngineMouseEvent,
) {
  let widgetAt = engine.getWidgetAt(e.x, e.y);

  while (widgetAt !== null && widgetAt !== context.map) {
    widgetAt = widgetAt.parent;
  }

  if (widgetAt === null) return null;

  const map = context.map;
  const bounds = map.getBoundingBox();

  return new Point(e.x - bounds.x - map.offsetX, e.y - bounds.y - map.offsetY);
}

function mouseEventToKeyCodes(
  engine: Engine,
  context: StateContext,
  e: EngineMouseEvent,
): KeyCode[] {
  const keyCodes: KeyCode[] = [];

  if (mouseEventToMapCoordinates(engine, context, e) === null) return keyCodes;

  const map = context.map;
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

function onMouseEvent(
  engine: Engine,
  context: StateContext,
  e: EngineMouseEvent,
) {
  switch (e.type) {
    case "down":
      {
        if (mouseMode === MouseMode.AddTile && mouseModeAddTile !== null) {
          const mapCoords = mouseEventToMapCoordinates(engine, context, e);
          if (mapCoords !== null) {
            const tx = (mapCoords.x / context.floorLayer2.tilemap.tileWidth) |
              0;
            const ty = (mapCoords.y / context.floorLayer2.tilemap.tileHeight) |
              0;
            context.floorLayer2.setTileIndex(tx, ty, mouseModeAddTile.index);
            context.floorLayer2.invalidate();
          }
          mouseMode = MouseMode.None;
        } else {
          const newCodes = mouseEventToKeyCodes(engine, context, e);
          if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
            mouseMode = MouseMode.Move;
            mouseKeyCodes.forEach((code) =>
              setSpecialKeyDown(context, code, false)
            );
            mouseKeyCodes = newCodes;
            mouseKeyCodes.forEach((code) =>
              setSpecialKeyDown(context, code, true)
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
              const newCodes = mouseEventToKeyCodes(engine, context, e);
              if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
                mouseKeyCodes.forEach((code) =>
                  setSpecialKeyDown(context, code, false)
                );
                mouseKeyCodes = newCodes;
                mouseKeyCodes.forEach((code) =>
                  setSpecialKeyDown(context, code, true)
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
          mouseKeyCodes.forEach((code) =>
            setSpecialKeyDown(context, code, false)
          );
          mouseKeyCodes.length = 0;
          break;
      }
  }
}

function followAvatar(
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

function initContext(
  engine: Engine,
  assets: Assets,
) {
  const {
    mainUI,
    statsContainer,
    buttonsContainer,
    itemsContainer,
    onFullScreenChanged,
  } = initUI(
    engine,
    assets,
  );

  const map = new ScrollableTilesContainerWidget();
  map.layer = LayerId.Game;
  map.layout = { heightPercent: 100, widthPercent: 100 };
  map.setChildrenLayout({ type: "none" });

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

  statsContainer.visible = getSettings().showFps;

  const context = {
    statsContainer,
    buttonsContainer,
    avatars,
    map,
    floorLayer1: mapLayers.floor,
    floorLayer2: mapLayers.floor2,
    npcs,
    p1,
    p2,
    keysDown: new Map<string, boolean>(),
    specialKeysDown: new Map<KeyCode, boolean>(),
    nextStateId: <StateId | null> null,
    widgetsToRemove: <Widget[]> [],
    onFullScreenChanged,
  };

  buttonsContainer.addButton("Quit", () => {
    context.nextStateId = StateId.MainMenu;
  });

  engine.addWidget(map);
  engine.addWidget(mainUI);

  context.widgetsToRemove.push(map);
  context.widgetsToRemove.push(mainUI);

  itemsContainer.onItemTapped = (t) => {
    switchToAddTileMode(t);
  };

  return context;
}

type StateContext = ReturnType<typeof initContext>;

function updateContext(context: StateContext): boolean {
  context.statsContainer.visible = getSettings().showFps;

  const { p1, p2, avatars, map } = context;

  if (isKeyDown(context, "a") || isSpecialKeyDown(context, KeyCode.ArrowLeft)) {
    p1.move(-1, 0);
  }
  if (
    isKeyDown(context, "d") || isSpecialKeyDown(context, KeyCode.ArrowRight)
  ) {
    p1.move(1, 0);
  }
  if (isKeyDown(context, "w") || isSpecialKeyDown(context, KeyCode.ArrowUp)) {
    p1.move(0, -1);
  }
  if (isKeyDown(context, "s") || isSpecialKeyDown(context, KeyCode.ArrowDown)) {
    p1.move(0, 1);
  }
  if (isKeyDown(context, "f") || isKeyDown(context, "z")) p1.shoot();
  if (isKeyDown(context, "r") || isKeyDown(context, "x")) p1.slash();

  if (isKeyDown(context, "j")) p2.move(-1, 0);
  if (isKeyDown(context, "l")) p2.move(1, 0);
  if (isKeyDown(context, "i")) p2.move(0, -1);
  if (isKeyDown(context, "k")) p2.move(0, 1);
  if (isKeyDown(context, ";")) p2.shoot();
  if (isKeyDown(context, "p")) p2.slash();

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

function destroyState(engine: Engine, context: StateContext) {
  context.widgetsToRemove.forEach((w) => engine.removeWidget(w));
}

export function buildGameState(): State {
  let context: StateContext | null = null;

  const init = (p: StateParams): InitResult => {
    context = initContext(p.engine, p.assets);
    return {
      statsContainer: context.statsContainer,
    };
  };

  const update = () => {
    if (context !== null) {
      updateContext(context);
      return context.nextStateId;
    }
    return null;
  };

  const destroy = (p: StateParams) => {
    if (context) {
      destroyState(p.engine, context);
      context = null;
    }
  };

  return {
    id: StateId.Game,
    init,
    update,
    destroy,
    onKeyEvent: (e) => {
      if (context) onKeyEvent(context, e);
    },
    onMouseEvent: (e, p) => {
      if (context) onMouseEvent(p.engine, context, e);
    },
    onFullScreenChanged: (fs) => {
      if (context) context.onFullScreenChanged(fs);
    },
  };
}
