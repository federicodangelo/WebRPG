import { LabelWidget } from "engine/widgets/label.ts";
import {
  FixedColor,
  Engine,
  rgb,
  Intensity,
  Assets,
} from "engine/types.ts";
import { SplitPanelContainerWidget } from "engine/widgets/split-panel.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/tiles-container.ts";
import { ButtonWidget } from "../../engine/src/widgets/button.ts";

export function initUI(engine: Engine, assets: Assets) {
  const font = assets.defaultFont;

  const mainUI = new SplitPanelContainerWidget(font);
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

  const sidebar = new SplitPanelContainerWidget(font);
  sidebar.parent = mainUI.panel2;
  sidebar.layout = {
    widthPercent: 100,
    heightPercent: 100,
  };
  sidebar.splitLayout = {
    direction: "vertical",
    fixed: {
      panel: "panel2",
      amount: 10 * font.tileWidth,
    },
  };
  sidebar.panel1.border = 0;
  sidebar.panel2.border = 0;

  const map = new ScrollableTilesContainerWidget();

  map.setLayout({ heightPercent: 100, widthPercent: 100 });
  map.setChildrenLayout({ type: "none" });
  map.parent = mainUI.panel1;

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
  sidebar.panel1.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);
  sidebar.panel2.backColor = rgb(Intensity.I0, Intensity.I20, Intensity.I40);

  sidebar.panel1.childrenLayout = {
    type: "vertical",
    spacing: 1 * font.tileWidth,
  };

  new LabelWidget(
    font,
    "Move P1:\n  W/S/A/D\nMove P2:\n  I/J/K/L",
    FixedColor.White,
    mainUI.panel2.backColor,
  ).parent = sidebar.panel1;

  new ButtonWidget(
    font,
    "Fullscreen",
    FixedColor.White,
    FixedColor.Green,
    () => engine.setFullscreen(true),
  ).setLayout({ horizontalSpacingPercent: 50, verticalSpacingPercent: 50 })
    .parent = sidebar.panel2;

  return { mainUI, sidebar, map };
}
