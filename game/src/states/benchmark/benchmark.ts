import {
  Engine,
  Assets,
  KeyCode,
  LayerId,
  FixedColor,
  rgb,
  Intensity,
} from "engine/types.ts";
import {
  State,
  StateId,
} from "../../types.ts";
import {
  onKeyEvent,
} from "../../keyboard.ts";
import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { TextButtonWidget } from "engine/widgets/ui/button-text.ts";
import initMap1 from "../game/map.ts";
import { ScrollableTilesContainerWidget } from "../../../../engine/src/widgets/game/tiles-container.ts";
import { Avatar } from "../game/avatar.ts";
import { randomIntervalInt, setRandomSeed } from "../game/random.ts";

function initState(engine: Engine, assets: Assets) {
  const font = assets.defaultFont;

  const mainUI = new BoxContainerWidget(0);
  mainUI.layer = LayerId.UI;
  mainUI.selfSolid = false;
  mainUI.layout = { widthPercent: 100, heightPercent: 100 };
  mainUI.backColor = FixedColor.Transparent;

  const emptyGame = new BoxContainerWidget(0);
  emptyGame.layer = LayerId.Game;
  emptyGame.selfSolid = false;
  emptyGame.layout = { widthPercent: 100, heightPercent: 100 };
  emptyGame.backColor = rgb(0, 100, 0);

  const buttonsContainer = new BoxContainerWidget(4);
  buttonsContainer.width = 8 * font.tileWidth;
  buttonsContainer.height = 8;
  buttonsContainer.layout = {
    verticalSpacingPercent: 100,
    horizontalSpacingPercent: 100,
  };
  buttonsContainer.childrenLayout = {
    type: "vertical",
    spacing: 20,
  };
  buttonsContainer.borderColor = rgb(0, 0, 100);
  buttonsContainer.backColor = rgb(0, 0, 100);

  buttonsContainer.parent = mainUI;

  const addButton = (text: string, cb: () => void) => {
    const button = new TextButtonWidget(
      font,
      text,
      FixedColor.White,
      FixedColor.Green,
      FixedColor.Yellow,
      () => cb(),
    ).setLayout({ widthPercent: 100 });

    button.parent = buttonsContainer;
    buttonsContainer.height = buttonsContainer.border * 2 +
      buttonsContainer.children.map((x) => x.height).reduce(
        (acc, v) => acc + v,
        0,
      ) +
      Math.max(buttonsContainer.children.length - 1, 0) *
        (buttonsContainer.childrenLayout?.spacing || 0);

    return button;
  };

  let isFullcreen = false;

  const fullScreenButton = addButton("Full", () => {
    if (isFullcreen) {
      engine.setFullscreen(false);
    } else {
      engine.setFullscreen(true);
    }
  });

  const onFullScreenChanged = (fullscreen: boolean) => {
    if (isFullcreen !== fullscreen) {
      isFullcreen = fullscreen;
      fullScreenButton.text = isFullcreen ? "Wind" : "Full";
    }
  };

  const statsContainer = new BoxContainerWidget(4);
  statsContainer.solid = false;
  statsContainer.width = 14 * font.tileWidth + statsContainer.border * 2;
  statsContainer.height = 5 * font.tileHeight + statsContainer.border * 2;
  statsContainer.layout = {
    verticalSpacingPercent: 0,
    horizontalSpacingPercent: 100,
  };
  statsContainer.borderColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );
  statsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);

  statsContainer.parent = mainUI;

  const map = new ScrollableTilesContainerWidget();
  map.layer = LayerId.Game;
  map.layout = { heightPercent: 100, widthPercent: 100 };
  map.setChildrenLayout({ type: "none" });

  const mapLayers = initMap1(map, assets);

  const avatars: Avatar[] = [];

  setRandomSeed("Avatarssss");

  for (let i = 0; i < 10; i++) {
    const avatar = new Avatar(i % 2 ? "female1" : "female2", assets);
    avatar.parent = map;
    avatar.x = randomIntervalInt(
      mapLayers.floor.width / 2 - 200,
      mapLayers.floor.width / 2 + 200,
    );
    avatar.y = randomIntervalInt(
      mapLayers.floor.height / 2 - 200,
      mapLayers.floor.height / 2 + 200,
    );
    avatars.push(avatar);
  }

  map.setOffset(
    -avatars[0].x + map.width / 2,
    -avatars[0].y + map.height / 2,
    false,
  );

  const context = {
    keysDown: new Map<string, boolean>(),
    specialKeysDown: new Map<KeyCode, boolean>(),
    nextStateId: <StateId | null> null,
    widgetsToRemove: [mainUI, map],
    onFullScreenChanged,
    statsContainer,
    mapLayers,
    map,
    scrollX: 0,
    scrollY: 0,
    direction: 4,
    scrollSteps: 50,
    avatars,
  };

  addButton("Quit", () => {
    context.nextStateId = StateId.MainMenu;
  });

  engine.addWidget(mainUI);
  engine.addWidget(map);

  return context;
}

type ContextType = ReturnType<typeof initState>;

function updateState(context: ContextType) {
  const { map, nextStateId, avatars } = context;

  context.scrollX += context.direction;
  context.scrollY += context.direction;

  const avatar = avatars[0];

  for (let i = 1; i < avatars.length; i++) {
    avatars[i].move(context.direction * 0.25, context.direction * 0.25);
  }

  map.setOffset(
    -avatar.x + map.width / 2 + context.scrollX,
    -avatar.y + map.height / 2 + context.scrollY,
  );

  context.scrollSteps--;

  if (context.scrollSteps === 0) {
    context.scrollSteps = 100;
    context.direction *= -1;
  }

  return nextStateId;
}

function destroyState(engine: Engine, context: ContextType) {
  context.widgetsToRemove.forEach((w) => engine.removeWidget(w));
}

export function buildBenchmarkState(): State {
  let context: ContextType | null = null;
  return {
    id: StateId.Benchmark,
    init: (p) => {
      context = initState(p.engine, p.assets);
      return { statsContainer: context.statsContainer };
    },
    update: (p) => context ? updateState(context) : null,
    destroy: (p) => {
      if (context) {
        destroyState(p.engine, context);
        context = null;
      }
    },
    onKeyEvent: (e) => {
      if (context) onKeyEvent(context, e);
    },
    onFullScreenChanged: (fs) => {
      if (context) context?.onFullScreenChanged(fs);
    },
  };
}
