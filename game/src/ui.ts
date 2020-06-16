import {
  FixedColor,
  Engine,
  rgb,
  Intensity,
  Assets,
  LayerId,
} from "engine/types.ts";
import { ButtonWidget } from "../../engine/src/widgets/button.ts";
import { BoxContainerWidget } from "../../engine/src/widgets/box.ts";
import { NativeContext } from "../../engine/src/native-types.ts";

export function initUI(engine: Engine, assets: Assets, native: NativeContext) {
  const font = assets.defaultFont;

  const mainUI = new BoxContainerWidget(font, 0);
  mainUI.layer = LayerId.UI;
  mainUI.selfSolid = false;
  mainUI.layout = { widthPercent: 100, heightPercent: 100 };
  mainUI.fillChar = "";

  const statsContainer = new BoxContainerWidget(font, 1);
  statsContainer.solid = false;
  statsContainer.width = 16 * font.tileWidth;
  statsContainer.height = 7 * font.tileHeight;
  statsContainer.layout = {
    verticalSpacingPercent: 0,
    horizontalSpacingPercent: 100,
  };

  const buttonsContainer = new BoxContainerWidget(font, 1);
  buttonsContainer.width = 8 * font.tileWidth;
  buttonsContainer.height = 9 * font.tileHeight;
  buttonsContainer.layout = {
    verticalSpacingPercent: 100,
    horizontalSpacingPercent: 100,
  };

  statsContainer.parent = mainUI;
  buttonsContainer.parent = mainUI;

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
    spacing: 0,
  };

  buttonsContainer.childrenLayout = {
    type: "vertical",
    spacing: font.tileHeight,
  };

  let isFullcreen = false;

  const fullScreenButton = new ButtonWidget(
    font,
    "Full",
    FixedColor.White,
    FixedColor.Green,
    FixedColor.Yellow,
    () => {
      if (isFullcreen) {
        engine.setFullscreen(false);
      } else {
        engine.setFullscreen(true);
      }
    },
  );

  native.screen.onFullScreenChanged((fullscreen) => {
    if (isFullcreen !== fullscreen) {
      isFullcreen = fullscreen;
      fullScreenButton.text = isFullcreen ? "Exit" : "Full";
    }
  });

  fullScreenButton.parent = buttonsContainer;

  new ButtonWidget(
    font,
    "Stat",
    FixedColor.White,
    FixedColor.Green,
    FixedColor.Yellow,
    () => engine.toggleStats(),
  ).parent = buttonsContainer;

  return { mainUI, statsContainer, buttonsContainer };
}
