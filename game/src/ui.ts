import {
  FixedColor,
  Engine,
  rgb,
  Intensity,
  Assets,
  LayerId,
  Tile,
} from "engine/types.ts";
import { ButtonWidget } from "engine/widgets/ui/button.ts";
import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { NativeContext } from "engine/native-types.ts";
import { ScrollableContainerWidget } from "../../engine/src/widgets/scrollable.ts";
import { TileWidget } from "../../engine/src/widgets/game/tile.ts";
import { TextButtonWidget } from "../../engine/src/widgets/ui/button-text.ts";

const ITEM_IMAGE_WIDTH = 32;
const ITEM_IMAGE_HEIGHT = 32;
const ITEM_IMAGE_BORDER = 8;
const ITEM_WIDTH = ITEM_IMAGE_WIDTH + ITEM_IMAGE_BORDER * 2;
const ITEM_HEIGHT = ITEM_IMAGE_HEIGHT + ITEM_IMAGE_BORDER * 2;

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

  const decoTiles = assets.getTilemap("terrain").tiles.filter((x) =>
    x.id.includes("deco")
  );

  const itemsCount = decoTiles.length;
  const itemsButtons = new Map<ButtonWidget, Tile>();

  const itemsContainer = new ScrollableContainerWidget();
  const allItemsWidth = itemsCount * (ITEM_WIDTH + font.tileWidth);
  itemsContainer.layout = {
    widthPercent: 100,
    heightPercent: 100,
    customSizeFn: (w) => {
      itemsContainer.mouseHorizontalScrollLimits = {
        fromX: Math.min(
          ITEM_WIDTH / 2,
          -allItemsWidth + w.width - ITEM_WIDTH / 2,
        ) | 0,
        toX: (ITEM_WIDTH / 2) | 0,
      };
    },
  };
  itemsContainer.parent = itemsContainerContainer;
  itemsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  itemsContainer.childrenLayout = {
    type: "horizontal",
    spacing: font.tileWidth,
  };
  itemsContainer.mouseHorizontalScrollEnabled = true;

  for (let i = 0; i < itemsCount; i++) {
    const item = new ButtonWidget(FixedColor.Cyan, FixedColor.Yellow);
    const tile = new TileWidget(decoTiles[i])
      .setLayout({ verticalSpacingPercent: 50, horizontalSpacingPercent: 50 });
    tile.parent = item;
    tile.solid = false;
    item.height = ITEM_HEIGHT;
    item.width = ITEM_WIDTH;
    item.parent = itemsContainer;
    itemsButtons.set(item, decoTiles[i]);
  }

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
    itemsButtons,
  };
}
