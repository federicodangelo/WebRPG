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
import { TileWidget } from "engine/widgets/game/tile.ts";
import { ItemsContainerWidget } from "engine/widgets/items-container.ts";
import { ButtonsContainerWidget } from "../utils/buttons-container.ts";
import { getSettings, setSettings } from "../../game-settings.ts";

const ITEM_IMAGE_WIDTH = 32;
const ITEM_IMAGE_HEIGHT = 32;
const ITEM_IMAGE_BORDER = 8;
const ITEM_WIDTH = ITEM_IMAGE_WIDTH + ITEM_IMAGE_BORDER * 2;
const ITEM_HEIGHT = ITEM_IMAGE_HEIGHT + ITEM_IMAGE_BORDER * 2;

type ActionWalk = {
  type: "walk";
  tile: Tile;
};

type ActionDrawTile = {
  type: "draw-tile";
  tile: Tile;
};

type Action = ActionWalk | ActionDrawTile;

export function initUI(engine: Engine, assets: Assets) {
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

  const menuButtonsContainer = new ButtonsContainerWidget(font, 4);
  menuButtonsContainer.layout = {
    verticalSpacingPercent: 100,
    horizontalSpacingPercent: 100,
  };

  const showMenuButtonsContainer = new ButtonsContainerWidget(font, 4);
  showMenuButtonsContainer.layout = {
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
        parentWidth - (menuButtonsContainer.width * 2 + 8),
      );
    },
  };
  itemsContainerContainer.backColor = FixedColor.None;

  const decoTiles = assets.getTilemap("terrain").tiles.filter((x) =>
    x.id.includes("deco")
  );

  const itemsContainer = new ItemsContainerWidget<Tile, ButtonWidget>(
    8,
    true,
    ITEM_WIDTH,
    ITEM_HEIGHT,
    (t) => {
      const item = new ButtonWidget(FixedColor.Cyan, FixedColor.Yellow);
      const tile = new TileWidget(t)
        .setLayout(
          { verticalSpacingPercent: 50, horizontalSpacingPercent: 50 },
        );
      tile.parent = item;
      tile.solid = false;
      return item;
    },
  );

  itemsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);

  itemsContainer.items = decoTiles;

  const actionsContainerContainer = new BoxContainerWidget(4);
  actionsContainerContainer.width = ITEM_WIDTH +
    actionsContainerContainer.border * 2;
  actionsContainerContainer.layout = {
    heightPercent: 75,
    verticalSpacingPercent: 50,
    horizontalSpacingPercent: 0,
  };
  actionsContainerContainer.backColor = FixedColor.None;

  const actionTiles: Action[] = [
    {
      type: "walk",
      tile: assets.getTile("terrain.dirt-deco1"),
    },
    {
      type: "draw-tile",
      tile: assets.getTile("terrain.dirt-deco1"),
    },
  ];

  const actionsContainer = new ItemsContainerWidget<Action, ButtonWidget>(
    8,
    false,
    ITEM_WIDTH,
    ITEM_HEIGHT,
    (t) => {
      const item = new ButtonWidget(FixedColor.Cyan, FixedColor.Yellow);
      const tile = new TileWidget(t.tile)
        .setLayout(
          { verticalSpacingPercent: 50, horizontalSpacingPercent: 50 },
        );
      tile.parent = item;
      tile.solid = false;
      return item;
    },
  );

  actionsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);

  actionsContainer.items = actionTiles;

  itemsContainer.parent = itemsContainerContainer;
  actionsContainer.parent = actionsContainerContainer;
  statsContainer.parent = mainUI;
  menuButtonsContainer.parent = mainUI;
  showMenuButtonsContainer.parent = mainUI;
  itemsContainerContainer.parent = mainUI;
  actionsContainerContainer.parent = mainUI;

  itemsContainerContainer.borderColor = menuButtonsContainer.borderColor =
    showMenuButtonsContainer.borderColor = statsContainer.borderColor = rgb(
      Intensity.I0,
      Intensity.I20,
      Intensity.I40,
    );

  statsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  menuButtonsContainer.backColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );
  showMenuButtonsContainer.backColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );
  itemsContainerContainer.backColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );

  statsContainer.childrenLayout = {
    type: "vertical",
    spacing: 0,
  };

  menuButtonsContainer.addButton("Menu", () => {
    showMenuButtonsContainer.visible = true;
    menuButtonsContainer.visible = false;
  });

  showMenuButtonsContainer.addButton("Menu", () => {
    showMenuButtonsContainer.visible = false;
    menuButtonsContainer.visible = true;
  });

  menuButtonsContainer.visible = false;

  menuButtonsContainer.addButton("Stat", () => engine.toggleStats());

  menuButtonsContainer.addButton(
    "FPS",
    () => setSettings({ ...getSettings(), showFps: !getSettings().showFps }),
  );

  let isFullcreen = false;

  const fullScreenButton = menuButtonsContainer.addButton("Full", () => {
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

  return {
    mainUI,
    statsContainer,
    buttonsContainer: menuButtonsContainer,
    itemsContainer,
    actionsContainer,
    onFullScreenChanged,
  };
}
