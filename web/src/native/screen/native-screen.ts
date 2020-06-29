import { NativeContextScreen, NativeDrawStats } from "engine/native-types.ts";
import { Size } from "engine/types.ts";
import { DrawingSoft } from "./drawing/drawing-soft.ts";
import { Drawing, DrawingDoneResult } from "./drawing/types.ts";
import { DrawingWorker } from "./drawing/drawing-worker.ts";
import { DrawingHard } from "./drawing/drawing-hard.ts";

const USE_WORKER = true;
const USE_HARD_DRAWING = true;

function getCanvasSize() {
  return new Size(window.innerWidth, window.innerHeight);
}

function createFullScreenCanvas(zIndex: number) {
  const canvas = document.createElement("canvas");
  const { width, height } = getCanvasSize();
  canvas.setAttribute(
    "style",
    `position: absolute; left: 0; top: 0; z-index:${zIndex};`,
  );
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  return canvas;
}

function initCanvases() {
  const gameCanvas = createFullScreenCanvas(0);
  const uiCanvas = createFullScreenCanvas(1);
  const canvases = [gameCanvas, uiCanvas];

  return canvases;
}

export function getWebNativeScreen(
  onStats: (stats: NativeDrawStats) => void,
): NativeContextScreen {
  const canvases = initCanvases();
  const screenSize = new Size(256, 256);

  const screenSizeChangedListeners: ((size: Size) => void)[] = [];
  const fullScreenListeners: ((fullscreen: boolean) => void)[] = [];

  const dispatchFullScreenEvent = (fullscreen: boolean) => {
    fullScreenListeners.forEach((l) => l(fullscreen));
  };

  const handleResize = () => {
    screenSize.copyFrom(getCanvasSize());
    drawing.setSize(screenSize.width, screenSize.height);
    screenSizeChangedListeners.forEach((l) => l(screenSize));
  };

  const handleFullScreenChange = () => {
    const fullscreen = !!document.fullscreenElement;
    dispatchFullScreenEvent(fullscreen);
  };

  document.addEventListener("fullscreenchange", handleFullScreenChange);

  window.addEventListener("resize", handleResize);

  const drawingDone = (result: DrawingDoneResult) => {
    onStats(result.stats);
  };

  screenSize.copyFrom(getCanvasSize());

  const drawing: Drawing = USE_WORKER
    ? new DrawingWorker(
      screenSize.width,
      screenSize.height,
      canvases,
      drawingDone,
    )
    : USE_HARD_DRAWING
    ? new DrawingHard(
      screenSize.width,
      screenSize.height,
      canvases,
      (w, h) => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        return canvas;
      },
      drawingDone,
    )
    : new DrawingSoft(
      screenSize.width,
      screenSize.height,
      canvases,
      drawingDone,
    );

  return {
    getScreenSize: () => screenSize,
    onScreenSizeChanged: (listener) => {
      screenSizeChangedListeners.push(listener);
    },
    onFullScreenChanged: (listener) => {
      fullScreenListeners.push(listener);
    },
    setFullscreen: (fullscreen) => {
      const elem = document.documentElement;
      if (fullscreen) {
        elem.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    toggleStats: () => {
      // deno-lint-ignore no-explicit-any
      if ((globalThis as any).statsPaused) {
        // deno-lint-ignore no-explicit-any
        (globalThis as any).resumeStats();
      } else {
        // deno-lint-ignore no-explicit-any
        (globalThis as any).pauseStats();
      }
    },
    preloadTilemap: drawing.preloadTilemap.bind(drawing),
    preloadSpritesheet: drawing.preloadSpritesheet.bind(drawing),
    readyForNextFrame: drawing.isReadyForNextFrame.bind(drawing),
    processPendingFrames: drawing.update.bind(drawing),
    setTargetLayer: drawing.setTargetLayer.bind(drawing),
    setTile: drawing.setTile.bind(drawing),
    setSprite: drawing.setSprite.bind(drawing),
    fillRect: drawing.fillRect.bind(drawing),
    scrollRect: drawing.scrollRect.bind(drawing),
    beginDraw: () => {},
    endDraw: () => drawing.commit(),
  };
}
