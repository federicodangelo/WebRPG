import {
  Engine,
  Assets,
  KeyCode,
  LayerId,
  FixedColor,
  Widget,
  rgb,
} from "engine/types.ts";
import {
  State,
  StateParams,
  InitResult,
  StateId,
} from "../../types.ts";
import {
  onKeyEvent,
} from "../../keyboard.ts";
import { NativeContext } from "engine/native-types.ts";
import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { TextButtonWidget } from "engine/widgets/ui/button-text.ts";

type StateContext = {
  keysDown: Map<string, boolean>;
  specialKeysDown: Map<KeyCode, boolean>;
  nextStateId: StateId | null;
  widgetsToRemove: Widget[];
};

function initState(engine: Engine, assets: Assets, native: NativeContext) {
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

  const buttonsContainer = new BoxContainerWidget(20);
  buttonsContainer.width = 40 * font.tileWidth;
  buttonsContainer.height = 8;
  buttonsContainer.layout = {
    verticalSpacingPercent: 50,
    horizontalSpacingPercent: 50,
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

  const context: StateContext = {
    keysDown: new Map<string, boolean>(),
    specialKeysDown: new Map<KeyCode, boolean>(),
    nextStateId: null,
    widgetsToRemove: [],
  };

  addButton("Start Game", () => {
    context.nextStateId = StateId.Game;
  });

  addButton("Start Benchmark", () => {
    context.nextStateId = StateId.Benchmark;
  });

  engine.addWidget(mainUI);
  engine.addWidget(emptyGame);
  context.widgetsToRemove.push(mainUI);
  context.widgetsToRemove.push(emptyGame);

  return context;
}

function updateState(context: StateContext) {
  return context.nextStateId;
}

function destroyState(engine: Engine, context: StateContext) {
  context.widgetsToRemove.forEach((w) => engine.removeWidget(w));
}

export function buildMainMenuState(): State {
  let context: StateContext | null = null;

  const init = (p: StateParams): InitResult => {
    context = initState(p.engine, p.assets, p.native);
    return {};
  };

  const update = () => {
    if (context) return updateState(context);
    return null;
  };

  const destroy = (p: StateParams) => {
    if (context) {
      destroyState(p.engine, context);
      context = null;
    }
  };

  return {
    id: StateId.MainMenu,
    init,
    update,
    destroy,
    onKeyEvent: (e) => {
      if (context) onKeyEvent(context, e);
    },
  };
}
