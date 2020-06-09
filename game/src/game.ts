import { LabelWidget } from "engine/widgets/label.ts";
import {
  FixedColor,
  Engine,
  rgb,
  Intensity,
  Assets,
  Font,
  KeyEvent,
} from "engine/types.ts";
import { SplitPanelContainerWidget } from "engine/widgets/split-panel.ts";
import { ScrollableTilemapContainerWidget } from "../../engine/src/widgets/tilemap.ts";
import { TileWidget } from "../../engine/src/widgets/tile.ts";
import { Avatar } from "./avatar.ts";

const NPCS_COUNT = 2;
const MAP_SIZE = 512;
const DECOS_COUNT = 1024;

export var mainUI: SplitPanelContainerWidget;

const enum CameraMode {
  FollowContinuous,
  FollowDiscrete,
}

let cameraMode = CameraMode.FollowContinuous;

const npcs: Avatar[] = [];
const characters: Avatar[] = [];
let playingBox: ScrollableTilemapContainerWidget;

const keysDown = new Map<string, boolean>();

function isKeyDown(key: string) {
  return keysDown.get(key) || false;
}

let p1: Avatar;
let p2: Avatar;
let assets: Assets;
let font: Font;

export function initGame(engine: Engine, assets_: Assets) {
  assets = assets_;

  font = assets.defaultFont;

  mainUI = new SplitPanelContainerWidget(font);
  mainUI.layout = {
    widthPercent: 100,
    heightPercent: 100,
  };
  mainUI.splitLayout = {
    direction: "horizontal",
    fixed: {
      panel: "panel2",
      amount: 19 * font.tileWidth,
    },
  };

  mainUI.panel2.border = 2;
  mainUI.panel2.backColor = FixedColor.BrightBlack;

  playingBox = new ScrollableTilemapContainerWidget(font);

  playingBox.setLayout({ heightPercent: 100, widthPercent: 100 });
  playingBox.setChildrenLayout({ type: "none" });
  playingBox.parent = mainUI.panel1;

  mainUI.panel1.title = " Map ";
  mainUI.panel1.titleForeColor = FixedColor.BrightWhite;
  mainUI.panel1.titleBackColor = rgb(
    Intensity.I20,
    Intensity.I0,
    Intensity.I20,
  );
  mainUI.panel1.borderForeColor = rgb(
    Intensity.I60,
    Intensity.I0,
    Intensity.I60,
  );
  mainUI.panel1.borderBackColor = rgb(
    Intensity.I20,
    Intensity.I0,
    Intensity.I20,
  );
  mainUI.panel1.backColor = FixedColor.Black;
  mainUI.panel1.fillChar = "";

  mainUI.panel2.title = " Stats ";
  mainUI.panel2.titleForeColor = FixedColor.BrightWhite;
  mainUI.panel2.titleBackColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );
  mainUI.panel2.borderForeColor = rgb(
    Intensity.I0,
    Intensity.I0,
    Intensity.I60,
  );
  mainUI.panel2.borderBackColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );
  mainUI.panel2.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  mainUI.panel2.childrenLayout = {
    type: "vertical",
    spacing: 1 * font.tileWidth,
  };

  new LabelWidget(
    font,
    "Move P1:\n  W/S/A/D\nMove P2:\n  I/J/K/L\nQuit: Z",
    FixedColor.White,
    mainUI.panel2.backColor,
  ).parent = mainUI.panel2;

  function random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  p1 = new Avatar(assets);
  p1.x = 10 * font.tileWidth;
  p1.y = 10 * font.tileHeight;

  p2 = new Avatar(assets);
  p2.x = 13 * font.tileWidth;
  p2.y = 3 * font.tileHeight;

  for (let i = 0; i < NPCS_COUNT; i++) {
    npcs.push(new Avatar(assets));
  }

  characters.push(...npcs, p1, p2);

  playingBox.floorTilemap = assets.getTilemap("terrain");
  playingBox.floorTiles = [];

  for (let y = 0; y < MAP_SIZE; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      if (Math.random() > 0.1) {
        row.push(playingBox.floorTilemap.getTile("grass-center").index);
      } else if (Math.random() > 0.5) {
        row.push(playingBox.floorTilemap.getTile("grass-center2").index);
      } else {
        row.push(playingBox.floorTilemap.getTile("grass-center3").index);
      }
    }
    playingBox.floorTiles.push(row);
  }

  const decos: string[] = [
    "terrain.grass-deco1",
    "terrain.grass-deco2",
    "terrain.dirt-deco1",
    "terrain.dirt-deco2",
  ];

  for (let i = 0; i < DECOS_COUNT; i++) {
    const obstacle = new TileWidget(
      assets.getTile(random(decos)),
    );
    obstacle.layer = -1;
    obstacle.x = Math.floor(Math.random() * MAP_SIZE) * obstacle.tile.width;
    obstacle.y = Math.floor(Math.random() * MAP_SIZE) * obstacle.tile.height;
    obstacle.parent = playingBox;
  }

  characters.forEach((c) => (c.parent = playingBox));

  function onKeyEvent(e: KeyEvent) {
    if (e.char) {
      if (e.type === "down") {
        keysDown.set(e.char, true);
      } else if (e.type === "up") {
        keysDown.set(e.char, false);
      }
    }
  }

  engine.addWidget(mainUI);
  engine.onKeyEvent(onKeyEvent);
}

const WALK_SPEED = 4;

let p1idleFrames = 0;

export function updateGame(engine: Engine): boolean {
  let running = true;

  for (let i = 0; i < npcs.length; i++) {
    const npc = npcs[i];
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        npc.x -= WALK_SPEED;
        break;
      case 1:
        npc.x += WALK_SPEED;
        break;
      case 2:
        npc.y -= WALK_SPEED;
        break;
      case 3:
        npc.y += WALK_SPEED;
        break;
    }
  }

  if (isKeyDown("a")) {
    p1.x -= WALK_SPEED;
  }
  if (isKeyDown("d")) {
    p1.x += WALK_SPEED;
  }
  if (isKeyDown("w")) {
    p1.y -= WALK_SPEED;
  }
  if (isKeyDown("s")) {
    p1.y += WALK_SPEED;
  }

  if (isKeyDown("j")) {
    p2.x -= WALK_SPEED;
  }
  if (isKeyDown("l")) {
    p2.x += WALK_SPEED;
  }
  if (isKeyDown("i")) {
    p2.y -= WALK_SPEED;
  }
  if (isKeyDown("k")) {
    p2.y += WALK_SPEED;
  }

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    char.x = Math.max(
      Math.min(char.x, MAP_SIZE * font.tileWidth - char.width * font.tileWidth),
      0,
    );
    char.y = Math.max(
      Math.min(
        char.y,
        MAP_SIZE * font.tileHeight - char.height * font.tileHeight,
      ),
      0,
    );

    characters[i].updateAnimations();
  }

  let newOffsetX = playingBox.offsetX;
  let newOffsetY = playingBox.offsetY;

  if (cameraMode === CameraMode.FollowContinuous) {
    newOffsetX = -p1.x + Math.floor(playingBox.width * 0.5);
    newOffsetY = -p1.y + Math.floor(playingBox.height * 0.5);
  } else {
    if (p1.x > -playingBox.offsetX + playingBox.width * 0.85) {
      newOffsetX = playingBox.offsetX - Math.ceil(playingBox.width * 0.35);
    } else if (p1.x < -playingBox.offsetX + playingBox.width * 0.15) {
      newOffsetX = playingBox.offsetX + Math.ceil(playingBox.width * 0.35);
    }

    if (p1.y > -playingBox.offsetY + playingBox.height * 0.85) {
      newOffsetY = playingBox.offsetY - Math.ceil(playingBox.height * 0.35);
    } else if (p1.y < -playingBox.offsetY + playingBox.height * 0.15) {
      newOffsetY = playingBox.offsetY + Math.ceil(playingBox.height * 0.35);
    }
  }

  playingBox.setOffset(
    Math.trunc(
      Math.max(
        Math.min(newOffsetX, 0),
        -(MAP_SIZE * font.tileWidth - playingBox.width),
      ),
    ),
    Math.trunc(
      Math.max(
        Math.min(newOffsetY, 0),
        -(MAP_SIZE * font.tileHeight - playingBox.height),
      ),
    ),
  );

  return running;
}
