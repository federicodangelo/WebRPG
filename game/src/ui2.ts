import { LabelWidget } from "engine/widgets/label.ts";
import {
  FixedColor,
  Engine,
  rgb,
  Intensity,
  Assets,
} from "engine/types.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/tiles-container.ts";
import { ButtonWidget } from "../../engine/src/widgets/button.ts";
import { BoxContainerWidget } from "../../engine/src/widgets/box.ts";

export function initUI(engine: Engine, assets: Assets) {
  const font = assets.defaultFont;

  const mainUI = new BoxContainerWidget(font, 0);
  mainUI.layout = { widthPercent: 100, heightPercent: 100 };
  mainUI.fillChar = "";

  const statsContainer = new BoxContainerWidget(font, 1);
  statsContainer.width = 12 * font.tileWidth;
  statsContainer.height = 11 * font.tileHeight;
  statsContainer.layout = {
    verticalSpacingPercent: 0,
    horizontalSpacingPercent: 100,
  };

  const buttonsContainer = new BoxContainerWidget(font, 1);
  buttonsContainer.width = 12 * font.tileWidth;
  buttonsContainer.height = 9 * font.tileHeight;
  buttonsContainer.layout = {
    verticalSpacingPercent: 100,
    horizontalSpacingPercent: 100,
  };

  const map = new ScrollableTilesContainerWidget();
  map.layout = { heightPercent: 100, widthPercent: 100 };
  map.setChildrenLayout({ type: "none" });
  map.parent = mainUI;
  statsContainer.parent = mainUI;
  buttonsContainer.parent = mainUI;

  map.overlappingFixedWidgets.push(statsContainer, buttonsContainer);

  statsContainer.title = " Stats ";
  statsContainer.titleForeColor = FixedColor.BrightWhite;
  statsContainer.titleBackColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );
  statsContainer.borderForeColor = rgb(
    Intensity.I0,
    Intensity.I0,
    Intensity.I60,
  );
  statsContainer.borderBackColor = rgb(
    Intensity.I0,
    Intensity.I20,
    Intensity.I40,
  );

  statsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  buttonsContainer.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);

  statsContainer.childrenLayout = {
    type: "vertical",
    spacing: 1 * font.tileWidth,
  };

  buttonsContainer.childrenLayout = {
    type: "vertical",
    spacing: 1 * font.tileWidth,
  };

  new LabelWidget(
    font,
    "Move P1:\n  W/S/A/D\nMove P2:\n  I/J/K/L",
    FixedColor.White,
    statsContainer.backColor,
  ).parent = statsContainer;

  new ButtonWidget(
    font,
    "  Full  ",
    FixedColor.White,
    FixedColor.Green,
    () => engine.setFullscreen(true),
  ).parent = buttonsContainer;

  new ButtonWidget(
    font,
    "  Stat  ",
    FixedColor.White,
    FixedColor.Green,
    () => engine.toggleStats(),
  ).parent = buttonsContainer;

  return { mainUI, statsContainer, buttonsContainer, map };
}