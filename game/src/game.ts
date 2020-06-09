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
import { Avatar } from "./avatar.ts";
import { initMap, MAP_SIZE } from "./map.ts";

const NPCS_COUNT = 2;

export var mainUI: SplitPanelContainerWidget;

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

  initMap(playingBox, assets);

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

export function updateGame(engine: Engine): boolean {
  let running = true;

  for (let i = 0; i < npcs.length; i++) {
    const npc = npcs[i];
    npc.move(
      Math.round(Math.random() * 2 - 1),
      Math.round(Math.random() * 2 - 1),
    );
  }

  if (isKeyDown("a")) p1.move(-1, 0);
  if (isKeyDown("d")) p1.move(1, 0);
  if (isKeyDown("w")) p1.move(0, -1);
  if (isKeyDown("s")) p1.move(0, 1);

  if (isKeyDown("j")) p2.move(-1, 0);
  if (isKeyDown("l")) p2.move(1, 0);
  if (isKeyDown("i")) p2.move(0, -1);
  if (isKeyDown("k")) p2.move(0, 1);

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    char.x = Math.max(
      Math.min(char.x, playingBox.floorWidth),
      0,
    );
    char.y = Math.max(
      Math.min(char.y, playingBox.floorHeight),
      0,
    );

    characters[i].updateAnimations();
  }

  let newOffsetX = playingBox.offsetX;
  let newOffsetY = playingBox.offsetY;

  newOffsetX = -p1.x + Math.floor(playingBox.width * 0.5);
  newOffsetY = -p1.y + Math.floor(playingBox.height * 0.5);

  playingBox.setOffset(
    Math.trunc(
      Math.max(
        Math.min(newOffsetX, 0),
        -(playingBox.floorWidth - playingBox.width),
      ),
    ),
    Math.trunc(
      Math.max(
        Math.min(newOffsetY, 0),
        -(playingBox.floorHeight - playingBox.height),
      ),
    ),
  );

  return running;
}
