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
      "width: " +
        width +
        "px;" +
        "height: " +
        height +
        "px;" +
        "image-rendering: pixelated;",
    );
  }

  return devicePixelRatio;
}

function createFullScreenCanvas() {
  const canvas = document.createElement("canvas");
  const multiplier = updateCanvasSize(canvas);
  document.body.appendChild(canvas);
  return { canvas, multiplier };
}

export function getWebNativeContext(
  onStats: (stats: NativeDrawStats) => void,
): NativeContext {
  const tmp = createFullScreenCanvas();

  const canvas = tmp.canvas;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  let screenMultiplier = tmp.multiplier;

  const screenSize = new Size(256, 256);

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = false;

  let screenSizeChangedListeners: ((size: Size) => void)[] = [];
  let keyListeners: ((e: EngineKeyEvent) => void)[] = [];
  let mouseListeners: ((e: EngineMouseEvent) => void)[] = [];

  const disptachKeyEvent = (e: EngineKeyEvent) => {
    keyListeners.forEach((l) => l(e));
  };

  const dispatchMouseEvent = (e: EngineMouseEvent) => {
    mouseListeners.forEach((l) => l(e));
  };

  const updateScreenSize = () => {
    screenSize.set(canvas.width, canvas.height);
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
    screenMultiplier = updateCanvasSize(canvas);
    updateScreenSize();
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawing.setPixels(imageData.data.buffer, screenSize);
    screenSizeChangedListeners.forEach((l) => l(screenSize));
  };

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
    if (result.dirty && result.dirtyRect) {
      ctx.putImageData(
        imageData,
        0,
        0,
        result.dirtyRect.x,
        result.dirtyRect.y,
        result.dirtyRect.width,
        result.dirtyRect.height,
      );
    }

    onStats(result.stats);
  };

  updateScreenSize();
  const drawing: Drawing = USE_WORKER
    ? new DrawingWorker(
      imageData.data.buffer,
      screenSize,
      drawingDone,
    )
    : new DrawingReal(
      imageData.data.buffer,
      screenSize,
      drawingDone,
    );

  return {
    screen: {
      getScreenSize: () => screenSize,
      onScreenSizeChanged: (listener) => {
        screenSizeChangedListeners.push(listener);
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
      readyForNextFrame: drawing.readyForNextFrame.bind(drawing),
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
    init: async () => {
      updateScreenSize();
    },
    destroy: () => {},
  };
}
