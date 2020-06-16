import {
  FixedColor,
  Engine,
  rgb,
  Intensity,
  Assets,
  LayerId,
} from "engine/types.ts";
import { ButtonWidget } from "engine/widgets/ui/button.ts";
import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { NativeContext } from "engine/native-types.ts";
import { ScrollableContainerWidget } from "../../engine/src/widgets/scrollable.ts";
import { LabelWidget } from "../../engine/src/widgets/ui/label.ts";

export function initUI(engine: Engine, assets: Assets, native: NativeContext) {
  const font = assets.defaultFont;

  const mainUI = new BoxContainerWidget(0);
  mainUI.layer = LayerId.UI;
  mainUI.selfSolid = false;
  mainUI.layout = { widthPercent: 100, heightPercent: 100 };
  mainUI.backColor = FixedColor.Transparent;

  const statsContainer = new BoxContainerWidget(4);
  statsContainer.solid = false;
  statsContainer.width = 14 * font.tileWidth + statsContainer.border * 2;
  statsContainer.height = 5 * font.tileHeight + statsContainer.border * 2;
  statsContainer.layout = {
    verticalSpacingPercent: 0,
    horizontalSpacingPercent: 100,
  };

  const buttonsContainer = new BoxContainerWidget(4);
  buttonsContainer.width = 8 * font.tileWidth;
  buttonsContainer.height = 8;
  buttonsContainer.layout = {
    verticalSpacingPercent: 100,
    horizontalSpacingPercent: 100,
  };

  const ITEM_WIDTH = 64;
  const ITEM_HEIGHT = 64;

  const itemsContainerContainer = new BoxContainerWidget(4);
  itemsContainerContainer.height = ITEM_HEIGHT +
    itemsContainerContainer.border * 2;
  itemsContainerContainer.layout = {
    widthPercent: 75,
    verticalSpacingPercent: 100,
    horizontalSpacingPercent: 50,
    customSizeFn: (w, parentWidth) => {
      w.width = Math.min(
        w.width,
        parentWidth - (buttonsContainer.width * 2 + 8),
      );
    },
  };
  itemsContainerContainer.backColor = FixedColor.Transparent;

  const itemsContainer = new ScrollableContainerWidget();
  itemsContainer.layout = {
    widthPercent: 100,
    heightPercent: 100,
  };
  itemsContainer.parent = itemsContainerContainer;
  itemsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  itemsContainer.childrenLayout = {
    type: "horizontal",
    spacing: font.tileWidth,
  };
  itemsContainer.mouseHorizontalScrollEnabled = true;

  const ITEM_COUNT = 20;

  for (let i = 0; i < ITEM_COUNT; i++) {
    const item = new BoxContainerWidget(4);
    item.solid = false;
    new LabelWidget(font, " Item\n  " + i, FixedColor.White, FixedColor.Black)
      .setLayout({ verticalSpacingPercent: 50, horizontalSpacingPercent: 50 })
      .parent = item;
    item.height = ITEM_HEIGHT;
    item.width = ITEM_WIDTH;
    item.parent = itemsContainer;
  }

  itemsContainer.mouseHorizontalScrollLimits = {
    fromX: -ITEM_COUNT *
            (ITEM_WIDTH + (itemsContainer.childrenLayout.spacing || 0)) +
        (ITEM_WIDTH / 2) | 0,
    toX: (ITEM_WIDTH / 2) | 0,
  };

  statsContainer.parent = mainUI;
  buttonsContainer.parent = mainUI;
  itemsContainerContainer.parent = mainUI;

  itemsContainerContainer.borderColor = buttonsContainer.borderColor =
    statsContainer.borderColor = rgb(
      Intensity.I0,
      Intensity.I20,
      Intensity.I40,
    );

  statsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  buttonsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  itemsContainerContainer.backColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );

  statsContainer.childrenLayout = {
    type: "vertical",
    spacing: 0,
  };

  buttonsContainer.childrenLayout = {
    type: "vertical",
    spacing: font.tileHeight,
  };

  const addButton = (text: string, cb: () => void) => {
    const button = new ButtonWidget(
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

  addButton("Stat", () => engine.toggleStats());

  let isFullcreen = false;

  const fullScreenButton = addButton("Full", () => {
    if (isFullcreen) {
      engine.setFullscreen(false);
    } else {
      engine.setFullscreen(true);
    }
  });

  native.screen.onFullScreenChanged((fullscreen) => {
    if (isFullcreen !== fullscreen) {
      isFullcreen = fullscreen;
      fullScreenButton.text = isFullcreen ? "Exit" : "Full";
    }
  });

  return {
    mainUI,
    statsContainer,
    buttonsContainer,
    addButton,
  };
}
