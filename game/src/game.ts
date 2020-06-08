import { CharacterWidget } from "engine/widgets/character.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import {
  FixedColor,
  Engine,
  Color,
  rgb,
  Intensity,
  Assets,
  Widget,
  Font,
  KeyEvent,
} from "engine/types.ts";
import { SplitPanelContainerWidget } from "engine/widgets/split-panel.ts";
import { AnimatedTileWidget } from "../../engine/src/widgets/animated-tile.ts";
import { ScrollableTilemapContainerWidget } from "../../engine/src/widgets/tilemap.ts";

const NPCS_COUNT = 2;
const MAP_SIZE = 512;
const OBSTACLES_COUNT = 512;

export var mainUI: SplitPanelContainerWidget;

const enum CameraMode {
  FollowContinuous,
  FollowDiscrete,
}

let cameraMode = CameraMode.FollowContinuous;

const npcs: CharacterWidget[] = [];
const characters: Widget[] = [];
let playingBox: ScrollableTilemapContainerWidget;

const keysDown = new Map<string, boolean>();

function isKeyDown(key: string) {
  return keysDown.get(key) || false;
}

let p1: AnimatedTileWidget;
let p2: AnimatedTileWidget;
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
    Intensity.I20
  );
  mainUI.panel1.borderForeColor = rgb(
    Intensity.I60,
    Intensity.I0,
    Intensity.I60
  );
  mainUI.panel1.borderBackColor = rgb(
    Intensity.I20,
    Intensity.I0,
    Intensity.I20
  );
  mainUI.panel1.backColor = FixedColor.Black;
  mainUI.panel1.fillChar = "";

  mainUI.panel2.title = " Stats ";
  mainUI.panel2.titleForeColor = FixedColor.BrightWhite;
  mainUI.panel2.titleBackColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40
  );
  mainUI.panel2.borderForeColor = rgb(
    Intensity.I0,
    Intensity.I0,
    Intensity.I60
  );
  mainUI.panel2.borderBackColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40
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
    mainUI.panel2.backColor
  ).parent = mainUI.panel2;

  function random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  p1 = new AnimatedTileWidget(assets.getAnimation("down"));
  p1.pivotX = -Math.floor(p1.width / 2);
  p1.pivotY = -Math.floor((p1.height * 7) / 8);
  p1.x = 10 * font.tileWidth;
  p1.y = 10 * font.tileHeight;

  p2 = new AnimatedTileWidget(assets.getAnimation("down"));
  p2.pivotX = -Math.floor(p1.width / 2);
  p2.pivotY = -Math.floor((p1.height * 7) / 8);
  p2.x = 13 * font.tileWidth;
  p2.y = 3 * font.tileHeight;

  const npcsColors: Color[] = [
    FixedColor.Green,
    FixedColor.Yellow,
    FixedColor.Cyan,
  ];

  for (let i = 0; i < NPCS_COUNT; i++) {
    npcs.push(
      new CharacterWidget(
        font,
        "@",
        npcsColors[i % npcsColors.length],
        FixedColor.Transparent
      )
    );
  }

  characters.push(...npcs, p1, p2);

  const obtacleChars: string[] = ["."];
  const obtacleColors: Color[] = [
    rgb(Intensity.I0, Intensity.I20, Intensity.I0),
    rgb(Intensity.I0, Intensity.I40, Intensity.I0),
    rgb(Intensity.I0, Intensity.I60, Intensity.I0),
    rgb(Intensity.I0, Intensity.I80, Intensity.I0),
  ];

  playingBox.floorTilemap = assets.getTilemap("floor");
  playingBox.floorTiles = [];

  for (let y = 0; y < 128; y++) {
    const row: number[] = [];
    for (let x = 0; x < 128; x++) {
      if (Math.random() > 0.5) row.push((7 + 6) * 21 + 1);
      else if (Math.random() > 0.5) row.push((7 + 3) * 21 + 1);
      else row.push((7 + 0) * 21 + 1);
    }
    playingBox.floorTiles.push(row);
  }

  for (let i = 0; i < OBSTACLES_COUNT; i++) {
    const obstacle = new CharacterWidget(
      font,
      random(obtacleChars),
      random(obtacleColors),
      FixedColor.Transparent
    );
    obstacle.x = Math.floor(Math.random() * MAP_SIZE) * font.tileWidth;
    obstacle.y = Math.floor(Math.random() * MAP_SIZE) * font.tileHeight;
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

  let p1oldPos = { x: p1.x, y: p1.y };
  let p2oldPos = { x: p2.x, y: p2.y };

  if (isKeyDown("a")) {
    p1.x -= WALK_SPEED;
    p1.setAnimation(assets.getAnimation("left-walking"));
  }
  if (isKeyDown("d")) {
    p1.x += WALK_SPEED;
    p1.setAnimation(assets.getAnimation("right-walking"));
  }
  if (isKeyDown("w")) {
    p1.y -= WALK_SPEED;
    p1.setAnimation(assets.getAnimation("up-walking"));
  }
  if (isKeyDown("s")) {
    p1.y += WALK_SPEED;
    p1.setAnimation(assets.getAnimation("down-walking"));
  }

  if (isKeyDown("j")) {
    p2.x -= WALK_SPEED;
    p2.setAnimation(assets.getAnimation("left-walking"));
  }
  if (isKeyDown("l")) {
    p2.x += WALK_SPEED;
    p2.setAnimation(assets.getAnimation("right-walking"));
  }
  if (isKeyDown("i")) {
    p2.y -= WALK_SPEED;
    p2.setAnimation(assets.getAnimation("up-walking"));
  }
  if (isKeyDown("k")) {
    p2.y += WALK_SPEED;
    p2.setAnimation(assets.getAnimation("down-walking"));
  }

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    char.x = Math.max(
      Math.min(char.x, MAP_SIZE * font.tileWidth - char.width * font.tileWidth),
      0
    );
    char.y = Math.max(
      Math.min(
        char.y,
        MAP_SIZE * font.tileHeight - char.height * font.tileHeight
      ),
      0
    );
  }

  if (p1oldPos.x === p1.x && p1oldPos.y === p1.y) {
    if (p1.animation.id.endsWith("-walking")) {
      p1.setAnimation(
        assets.getAnimation(p1.animation.id.replace("-walking", ""))
      );
    }
  }

  if (p2oldPos.x === p2.x && p2oldPos.y === p2.y) {
    if (p2.animation.id.endsWith("-walking")) {
      p2.setAnimation(
        assets.getAnimation(p1.animation.id.replace("-walking", ""))
      );
    }
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
        -(MAP_SIZE * font.tileWidth - playingBox.width)
      )
    ),
    Math.trunc(
      Math.max(
        Math.min(newOffsetY, 0),
        -(MAP_SIZE * font.tileHeight - playingBox.height)
      )
    )
  );

  return running;
}
