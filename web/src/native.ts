import { NativeContext, NativeDrawStats } from "engine/native-types.ts";
import {
  Size,
  EngineKeyEvent,
  KeyCode,
  EngineKeyEventType,
  EngineMouseEvent,
} from "engine/types.ts";
import { DrawingReal } from "./drawing/drawing-real.ts";
import { Drawing, DrawingDoneResult } from "./drawing/types.ts";
import { DrawingWorker } from "./drawing/drawing-worker.ts";

const USE_DEVICE_PIXEL_RATIO = false;
const USE_WORKER = true;

function updateCanvasSize(
  canvas: HTMLCanvasElement,
  zIndex: number,
) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const devicePixelRatio = USE_DEVICE_PIXEL_RATIO
    ? Math.min(window.devicePixelRatio || 1, 2)
    : 1;

  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  if (USE_DEVICE_PIXEL_RATIO) {
    canvas.setAttribute(
      "style",
      `width: ${width}px;height: ${height}px;image-rendering: pixelated;position: absolute; left: 0; top: 0; z-index:${zIndex};`,
    );
  } else {
    canvas.setAttribute(
      "style",
      `position: absolute; left: 0; top: 0; z-index:${zIndex};`,
    );
  }

  return devicePixelRatio;
}

function createFullScreenCanvas(zIndex: number) {
  const canvas = document.createElement("canvas");
  const multiplier = updateCanvasSize(canvas, zIndex);
  document.body.appendChild(canvas);
  return { canvas, multiplier };
}

function initLayers() {
  const tmpGameCanvas = createFullScreenCanvas(0);
  const tmpUICanvas = createFullScreenCanvas(1);

  const gameCanvas = tmpGameCanvas.canvas;
  const gameCtx = gameCanvas.getContext(
    "2d",
    { alpha: false },
  ) as CanvasRenderingContext2D;

  const uiCanvas = tmpUICanvas.canvas;
  const uiCtx = uiCanvas.getContext("2d") as CanvasRenderingContext2D;

  const layers = [gameCanvas, uiCanvas];
  const layersCtx = [gameCtx, uiCtx];

  gameCtx.imageSmoothingEnabled = false;
  uiCtx.imageSmoothingEnabled = false;

  return { layers, layersCtx, multiplier: tmpGameCanvas.multiplier };
}

function resizeLayers(layers: HTMLCanvasElement[]) {
  let multiplier = 1;

  for (let i = 0; i < layers.length; i++) {
    multiplier = Math.max(multiplier, updateCanvasSize(layers[i], i));
  }

  return multiplier;
}

export function getWebNativeContext(
  onStats: (stats: NativeDrawStats) => void,
): NativeContext {
  const initCanvasResult = initLayers();
  const layers = initCanvasResult.layers;
  const layersCtx = initCanvasResult.layersCtx;
  let screenMultiplier = initCanvasResult.multiplier;

  const screenSize = new Size(256, 256);

  const screenSizeChangedListeners: ((size: Size) => void)[] = [];
  const keyListeners: ((e: EngineKeyEvent) => void)[] = [];
  const mouseListeners: ((e: EngineMouseEvent) => void)[] = [];
  const focusListeners: ((focus: boolean) => void)[] = [];
  const fullScreenListeners: ((fullscreen: boolean) => void)[] = [];

  const disptachKeyEvent = (e: EngineKeyEvent) => {
    keyListeners.forEach((l) => l(e));
  };

  const dispatchMouseEvent = (e: EngineMouseEvent) => {
    mouseListeners.forEach((l) => l(e));
  };

  const dispatchFocusEvent = (focus: boolean) => {
    focusListeners.forEach((l) => l(focus));
  };

  const dispatchFullScreenEvent = (fullscreen: boolean) => {
    fullScreenListeners.forEach((l) => l(fullscreen));
  };

  const updateScreenSize = () => {
    screenSize.set(layers[0].width, layers[0].height);
  };

  const handleKey = (e: KeyboardEvent, type: EngineKeyEventType) => {
    const key = e.key;

    switch (key) {
      case "ArrowLeft":
        disptachKeyEvent({ type, code: KeyCode.ArrowLeft });
        break;
      case "ArrowRight":
        disptachKeyEvent({ type, code: KeyCode.ArrowRight });
        break;
      case "ArrowUp":
        disptachKeyEvent({ type, code: KeyCode.ArrowUp });
        break;
      case "ArrowDown":
        disptachKeyEvent({ type, code: KeyCode.ArrowDown });
        break;
      default:
        if (key.length === 1) {
          disptachKeyEvent({ type, char: key });
        }
        break;
    }
  };

  var mouseDown = false;

  const handleMouseDown = (e: MouseEvent) => {
    mouseDown = true;
    dispatchMouseEvent(
      {
        type: "down",
        x: Math.trunc(e.clientX * screenMultiplier),
        y: Math.trunc(e.clientY * screenMultiplier),
      },
    );
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!mouseDown) return;
    dispatchMouseEvent(
      {
        type: "move",
        x: Math.trunc(e.clientX * screenMultiplier),
        y: Math.trunc(e.clientY * screenMultiplier),
      },
    );
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!mouseDown) return;
    dispatchMouseEvent(
      {
        type: "up",
        x: Math.trunc(e.clientX * screenMultiplier),
        y: Math.trunc(e.clientY * screenMultiplier),
      },
    );
    mouseDown = false;
  };

  const handleResize = () => {
    screenMultiplier = resizeLayers(layers);
    updateScreenSize();
    drawing.setSize(screenSize.width, screenSize.height);
    screenSizeChangedListeners.forEach((l) => l(screenSize));
  };

  const handleVisibilityChange = () => {
    const focus = document.visibilityState === "visible";
    dispatchFocusEvent(focus);
  };

  const handleFullScreenChange = () => {
    const fullscreen = !!document.fullscreenElement;
    dispatchFullScreenEvent(fullscreen);
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("fullscreenchange", handleFullScreenChange);

  window.addEventListener("keydown", (e) => handleKey(e, "down"));
  window.addEventListener("keyup", (e) => handleKey(e, "up"));
  window.addEventListener("keypress", (e) => handleKey(e, "press"));

  if (window.PointerEvent) {
    window.addEventListener("pointerdown", handleMouseDown);
    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointermove", handleMouseMove);
  } else {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
  }

  window.addEventListener("resize", handleResize);

  const drawingDone = (result: DrawingDoneResult) => {
    for (let i = 0; i < result.dirtyParams.length; i++) {
      const params = result.dirtyParams[i];
      layersCtx[params.layer].putImageData(
        new ImageData(
          new Uint8ClampedArray(params.pixels),
          params.pixelsWidth,
          params.pixelsHeight,
        ),
        0,
        0,
        params.dirtyRect.x,
        params.dirtyRect.y,
        params.dirtyRect.width,
        params.dirtyRect.height,
      );
    }

    onStats(result.stats);
  };

  updateScreenSize();

  const drawing: Drawing = USE_WORKER
    ? new DrawingWorker(
      screenSize.width,
      screenSize.height,
      drawingDone,
    )
    : new DrawingReal(
      screenSize.width,
      screenSize.height,
      drawingDone,
    );

  return {
    screen: {
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
      preloadTiles: drawing.preloadTiles.bind(drawing),
      readyForNextFrame: drawing.readyForNextFrame.bind(drawing),
      processPendingFrames: drawing.processPendingFrames.bind(drawing),
      setTargetLayer: drawing.setLayer.bind(drawing),
      tintTile: drawing.tintTile.bind(drawing),
      setTile: drawing.setTile.bind(drawing),
      fillRect: drawing.fillRect.bind(drawing),
      scrollRect: drawing.scrollRect.bind(drawing),
      beginDraw: () => {},
      endDraw: () => {
        drawing.dispatch();
      },
    },
    input: {
      onKeyEvent: (listener) => {
        keyListeners.push(listener);
      },
      onMouseEvent: (listener) => {
        mouseListeners.push(listener);
      },
    },
    focus: {
      onFocusChanged: (listener) => {
        focusListeners.push(listener);
      },
    },
    init: async () => {
      updateScreenSize();
    },
    destroy: () => {},
  };
}
