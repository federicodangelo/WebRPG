import { CharacterWidget } from "engine/widgets/character.ts";
import { LabelWidget } from "engine/widgets/label.ts";
import {
  FixedColor,
  Engine,
  Color,
  rgb,
  Intensity,
  FONT_SIZE,
} from "engine/types.ts";
import { SplitPanelContainerWidget } from "engine/widgets/split-panel.ts";
import { ScrollableContainerWidget } from "engine/widgets/scrollable.ts";
import { TileWidget } from "../../engine/src/widgets/tile.ts";

const NPCS_COUNT = 2;
const MAP_SIZE = 512;
const OBSTACLES_COUNT = 512;

export const mainUI = new SplitPanelContainerWidget();
mainUI.layout = {
  widthPercent: 100,
  heightPercent: 100,
};
mainUI.splitLayout = {
  direction: "horizontal",
  fixed: {
    panel: "panel2",
    amount: 19 * FONT_SIZE,
  },
};

mainUI.panel2.border = 2 * FONT_SIZE;
mainUI.panel2.backColor = FixedColor.BrightBlack;

const playingBox = new ScrollableContainerWidget();

playingBox.setLayout({ heightPercent: 100, widthPercent: 100 });
playingBox.setChildrenLayout({ type: "none" });
playingBox.parent = mainUI.panel1;

mainUI.panel1.title = " Map ";
mainUI.panel1.titleForeColor = FixedColor.BrightWhite;
mainUI.panel1.titleBackColor = rgb(Intensity.I20, Intensity.I0, Intensity.I20);
mainUI.panel1.borderForeColor = rgb(Intensity.I60, Intensity.I0, Intensity.I60);
mainUI.panel1.borderBackColor = rgb(Intensity.I20, Intensity.I0, Intensity.I20);
mainUI.panel1.backColor = FixedColor.Black;
mainUI.panel1.fillChar = "";

mainUI.panel2.title = " Stats ";
mainUI.panel2.titleForeColor = FixedColor.BrightWhite;
mainUI.panel2.titleBackColor = rgb(
  Intensity.I0,
  Intensity.I20,
  Intensity.I40,
);
mainUI.panel2.borderForeColor = rgb(Intensity.I0, Intensity.I0, Intensity.I60);
mainUI.panel2.borderBackColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
mainUI.panel2.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
mainUI.panel2.childrenLayout = { type: "vertical", spacing: 1 * FONT_SIZE };

new LabelWidget(
  "Move P1:\n  W/S/A/D\nMove P2:\n  I/J/K/L\nQuit: Z",
  FixedColor.White,
  mainUI.panel2.backColor,
).parent = mainUI.panel2;

const enum CameraMode {
  FollowContinuous,
  FollowDiscrete,
}

let cameraMode = CameraMode.FollowContinuous;

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const p1 = new CharacterWidget(
  "@",
  FixedColor.BrightRed,
  FixedColor.Transparent,
);
p1.x = 3 * FONT_SIZE;
p1.y = 3 * FONT_SIZE;

const p2 = new CharacterWidget(
  "@",
  FixedColor.BrightBlue,
  FixedColor.Transparent,
);
p2.x = 13 * FONT_SIZE;
p2.y = 3 * FONT_SIZE;

const npcs: CharacterWidget[] = [];
const npcsColors: Color[] = [
  FixedColor.Green,
  FixedColor.Yellow,
  FixedColor.Cyan,
];

for (let i = 0; i < NPCS_COUNT; i++) {
  npcs.push(
    new CharacterWidget(
      "@",
      npcsColors[i % npcsColors.length],
      FixedColor.Transparent,
    ),
  );
}

const characters = [
  ...npcs,
  p1,
  p2,
];

const obtacleChars: string[] = ["."];
const obtacleColors: Color[] = [
  rgb(Intensity.I0, Intensity.I20, Intensity.I0),
  rgb(Intensity.I0, Intensity.I40, Intensity.I0),
  rgb(Intensity.I0, Intensity.I60, Intensity.I0),
  rgb(Intensity.I0, Intensity.I80, Intensity.I0),
];

/*for (let i = 0; i < 255; i++) {
  const obstacle = new TileWidget(
    {
      tilemap: "floor",
      index: i,
    },
  );
  obstacle.x = i % 21;
  obstacle.y = Math.floor(i / 21);
  obstacle.parent = playingBox;
}*/

for (let x = 0; x < 128; x++) {
  for (let y = 0; y < 128; y++) {
    const obstacle = new TileWidget(
      {
        tilemap: "floor",
        index: (7 + 6) * 21 + 1,
        width: FONT_SIZE,
        height: FONT_SIZE,
      },
    );
    obstacle.x = x * FONT_SIZE;
    obstacle.y = y * FONT_SIZE;
    obstacle.parent = playingBox;
  }
}

for (let i = 0; i < OBSTACLES_COUNT; i++) {
  const obstacle = new CharacterWidget(
    random(obtacleChars),
    random(obtacleColors),
    FixedColor.Transparent,
  );
  obstacle.x = Math.floor(Math.random() * MAP_SIZE) * FONT_SIZE;
  obstacle.y = Math.floor(Math.random() * MAP_SIZE) * FONT_SIZE;
  obstacle.parent = playingBox;
}

characters.forEach((c) => c.parent = playingBox);

let pendingInput = "";

function onInput(input: string) {
  pendingInput += input;
}

export function initGame(engine: Engine) {
  engine.addWidget(mainUI);
  engine.onInput(onInput);
}

const WALK_SPEED = 4;

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

  if (pendingInput) {
    const uniqueChars = pendingInput.split("").map((c) => c.toLowerCase());
    uniqueChars.forEach((c) => {
      switch (c) {
        case "a":
          p1.x -= WALK_SPEED;
          break;
        case "d":
          p1.x += WALK_SPEED;
          break;
        case "w":
          p1.y -= WALK_SPEED;
          break;
        case "s":
          p1.y += WALK_SPEED;
          break;

        case "j":
          p2.x -= WALK_SPEED;
          break;
        case "l":
          p2.x += WALK_SPEED;
          break;
        case "i":
          p2.y -= WALK_SPEED;
          break;
        case "k":
          p2.y += WALK_SPEED;
          break;

        case String.fromCharCode(27): //Escape
          running = false;
          break;

        case "z":
          running = false;
          break;

        case "f":
          if (cameraMode === CameraMode.FollowContinuous) {
            cameraMode = CameraMode.FollowDiscrete;
          } else {
            cameraMode = CameraMode.FollowContinuous;
          }
          break;
      }
    });

    pendingInput = "";
  }

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    char.x = Math.max(
      Math.min(char.x, MAP_SIZE * FONT_SIZE - char.width * FONT_SIZE),
      0,
    );
    char.y = Math.max(
      Math.min(char.y, MAP_SIZE * FONT_SIZE - char.height * FONT_SIZE),
      0,
    );
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
    Math.trunc(Math.max(
      Math.min(newOffsetX, 0),
      -(MAP_SIZE * FONT_SIZE - playingBox.width),
    )),
    Math.trunc(Math.max(
      Math.min(newOffsetY, 0),
      -(MAP_SIZE * FONT_SIZE - playingBox.height),
    )),
  );

  return running;
}
