import { NativeContext } from "engine/native-types.ts";
import {
  Size,
  Color,
  Tile,
  EngineKeyEvent,
  AlphaType,
  KeyCode,
  EngineKeyEventType,
  EngineMouseEvent,
} from "engine/types.ts";
import { NativeDrawStats } from "../../../engine/src/native-types.ts";

const USE_DEVICE_PIXEL_RATION = false;

function updateCanvasSize(
  canvas: HTMLCanvasElement,
) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const devicePixelRatio = USE_DEVICE_PIXEL_RATION
    ? Math.min(window.devicePixelRatio || 1, 2)
    : 1;

  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  if (USE_DEVICE_PIXEL_RATION) {
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

export function getWebNativeContext(): NativeContext {
  const tmp = createFullScreenCanvas();

  const canvas = tmp.canvas;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  let screenMultiplier = tmp.multiplier;

  const screenSize = new Size(256, 256);

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let imageDataPixels = imageData.data;
  let imageDataPixels32: Uint32Array = new Uint32Array(imageDataPixels.buffer);

  const colorsRGB = new Uint32Array(2);
  let dirty = false;
  let dirtyLeft = 0;
  let dirtyRight = 0;
  let dirtyTop = 0;
  let dirtyBottom = 0;

  const setDirty = (x: number, y: number, width: number, height: number) => {
    if (!dirty) {
      dirty = true;
      dirtyLeft = x;
      dirtyTop = y;
      dirtyRight = x + width;
      dirtyBottom = y + height;
    } else {
      dirtyLeft = Math.min(dirtyLeft, x);
      dirtyTop = Math.min(dirtyTop, y);
      dirtyRight = Math.max(dirtyRight, x + width);
      dirtyBottom = Math.max(dirtyBottom, y + height);
    }
  };

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
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageDataPixels = imageData.data;
    imageDataPixels32 = new Uint32Array(imageDataPixels.buffer);
    updateScreenSize();
    screenSizeChangedListeners.forEach((l) => l(screenSize));
  };

  const tintTile = (
    t: Tile,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ) => {
    setDirty(x, y, t.width, t.height);

    colorsRGB[1] = foreColor;
    colorsRGB[0] = backColor;

    const tilePixels = t.pixels32;
    const tileWidth = t.width;
    const tileHeight = t.height;

    const backTransparent = backColor >> 24 == 0;

    let p = 0;
    let f = 0;

    if (cfx <= 0 && cfy <= 0 && ctx >= tileWidth && cty >= tileHeight) {
      if (backTransparent) {
        for (let py = 0; py < tileHeight; py++) {
          p = (y + py) * imageData.width + x;
          f = py * tileWidth;
          for (let px = 0; px < tileWidth; px++) {
            const cp = tilePixels[f++];
            if (cp == 1) {
              imageDataPixels32[p++] = colorsRGB[cp];
            } else {
              p++;
            }
          }
        }
      } else {
        for (let py = 0; py < tileHeight; py++) {
          p = (y + py) * imageData.width + x;
          f = py * tileWidth;
          for (let px = 0; px < tileWidth; px++) {
            imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
          }
        }
      }
    } else {
      if (backTransparent) {
        for (let py = 0; py < tileHeight; py++) {
          p = (y + py) * imageData.width + x;
          f = py * tileWidth;
          for (let px = 0; px < tileWidth; px++) {
            if (px >= cfx && px < ctx && py >= cfy && py < cty) {
              const cp = tilePixels[f++];
              if (cp == 1) {
                imageDataPixels32[p++] = colorsRGB[cp];
              } else {
                p++;
              }
            } else {
              p++;
              f++;
            }
          }
        }
      } else {
        for (let py = 0; py < tileHeight; py++) {
          p = (y + py) * imageData.width + x;
          f = py * tileWidth;
          for (let px = 0; px < tileWidth; px++) {
            if (px >= cfx && px < ctx && py >= cfy && py < cty) {
              imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
            } else {
              p++;
              f++;
            }
          }
        }
      }
    }
  };

  const setTile = (
    t: Tile,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ) => {
    setDirty(x, y, t.width, t.height);

    const tileWidth = t.width;
    const tileHeight = t.height;

    let p = 0;
    let f = 0;
    const tilePixels32 = t.pixels32;
    const tilePixels8 = t.pixels;

    switch (t.alphaType) {
      case AlphaType.None:
        if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
          for (let py = 0; py < tileHeight; py++) {
            p = (y + py) * imageData.width + x;
            f = py * tileWidth;
            for (let px = 0; px < tileWidth; px++) {
              imageDataPixels32[p++] = tilePixels32[f++];
            }
          }
        } else {
          for (let py = 0; py < tileHeight; py++) {
            p = (y + py) * imageData.width + x;
            f = py * tileWidth;
            for (let px = 0; px < tileWidth; px++) {
              if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                imageDataPixels32[p++] = tilePixels32[f++];
              } else {
                p++;
                f++;
              }
            }
          }
        }
        break;

      case AlphaType.Solid:
        if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
          for (let py = 0; py < tileHeight; py++) {
            p = (y + py) * imageData.width + x;
            f = py * tileWidth;
            for (let px = 0; px < tileWidth; px++) {
              const pixel = tilePixels32[f++];
              if (pixel >> 24 !== 0) {
                imageDataPixels32[p++] = pixel;
              } else {
                p++;
              }
            }
          }
        } else {
          for (let py = 0; py < tileHeight; py++) {
            p = (y + py) * imageData.width + x;
            f = py * tileWidth;
            for (let px = 0; px < tileWidth; px++) {
              if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                const pixel = tilePixels32[f++];
                if (pixel >> 24 !== 0) {
                  imageDataPixels32[p++] = pixel;
                } else {
                  p++;
                }
              } else {
                p++;
                f++;
              }
            }
          }
        }
        break;

      case AlphaType.Alpha:
        if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
          for (let py = 0; py < tileHeight; py++) {
            p = ((y + py) * imageData.width + x) << 2;
            f = (py * tileWidth) << 2;
            for (let px = 0; px < tileWidth; px++) {
              const r = tilePixels8[f++];
              const g = tilePixels8[f++];
              const b = tilePixels8[f++];
              const a = tilePixels8[f++] / 255;
              const invA = 1 - a;
              imageDataPixels[p + 0] = imageDataPixels[p + 0] * invA + r * a;
              imageDataPixels[p + 1] = imageDataPixels[p + 1] * invA + g * a;
              imageDataPixels[p + 2] = imageDataPixels[p + 2] * invA + b * a;
              imageDataPixels[p + 3] = 255; //a
              p += 4;
            }
          }
        } else {
          for (let py = 0; py < tileHeight; py++) {
            p = ((y + py) * imageData.width + x) << 2;
            f = (py * tileWidth) << 2;
            for (let px = 0; px < tileWidth; px++) {
              if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                const r = tilePixels8[f++];
                const g = tilePixels8[f++];
                const b = tilePixels8[f++];
                const a = tilePixels8[f++] / 255;
                const invA = 1 - a;
                imageDataPixels[p + 0] = imageDataPixels[p + 0] * invA + r * a;
                imageDataPixels[p + 1] = imageDataPixels[p + 1] * invA + g * a;
                imageDataPixels[p + 2] = imageDataPixels[p + 2] * invA + b * a;
                imageDataPixels[p + 3] = 255; //a
                p += 4;
              } else {
                p += 4;
                f += 4;
              }
            }
          }
        }
        break;
    }
  };

  const fillRect = (
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    setDirty(x, y, width, height);

    let p = 0;

    for (let py = 0; py < height; py++) {
      p = (y + py) * imageData.width + x;
      for (let px = 0; px < width; px++) {
        imageDataPixels32[p++] = color;
      }
    }
  };

  const scrollRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    dx: number,
    dy: number,
  ) => {
    setDirty(x, y, width, height);

    const screenWidth = screenSize.width;
    const screenHeight = screenSize.height;

    if (
      dy !== 0 && x == 0 &&
      width === screenWidth &&
      height === screenHeight
    ) {
      //Optimized "vertical scrolling" path for fullscreen scrolling
      if (dy > 0) {
        imageDataPixels32.copyWithin(dy * screenWidth, 0);
      } else { //dy < 0
        imageDataPixels32.copyWithin(0, -dy * screenWidth);
      }
      dy = 0;
      if (dx === 0) return;
    }

    let to: number;
    let copyOffset: number;

    if (dy > 0) {
      to = (y + height - 1) * screenWidth + x;
      copyOffset = -screenWidth;
    } else { //dy <= 0
      to = y * screenWidth + x;
      copyOffset = screenWidth;
    }

    let fromStartOffset = -dy * screenWidth;
    let fromEndOffset = -dy * screenWidth + width;

    if (dx >= 0) {
      to += dx;
      fromStartOffset -= dx;
      fromEndOffset -= dx + dx;
    } else { //dx < 0
      fromStartOffset -= dx;
    }

    for (let i = height - Math.abs(dy); i >= 0; i--) {
      imageDataPixels32.copyWithin(
        to,
        to + fromStartOffset,
        to + fromEndOffset,
      );
      to += copyOffset;
    }
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
  updateScreenSize();

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
        if ((globalThis as any).statsPaused) {
          (globalThis as any).resumeStats();
        } else {
          (globalThis as any).pauseStats();
        }
      },
      tintTile,
      setTile,
      fillRect,
      scrollRect,
      beginDraw: () => {
        dirty = false;
      },
      endDraw: () => {
        let drawnPixels = 0;
        if (dirty) {
          dirtyLeft = Math.max(Math.min(dirtyLeft, screenSize.width), 0);
          dirtyRight = Math.max(Math.min(dirtyRight, screenSize.width), 0);
          dirtyTop = Math.max(Math.min(dirtyTop, screenSize.height), 0);
          dirtyBottom = Math.max(Math.min(dirtyBottom, screenSize.height), 0);
          drawnPixels += (dirtyRight - dirtyLeft) * (dirtyBottom - dirtyTop);
          ctx.putImageData(
            imageData,
            0,
            0,
            dirtyLeft,
            dirtyTop,
            dirtyRight - dirtyLeft,
            dirtyBottom - dirtyTop,
          );
          dirty = false;
        }
        return {
          drawnPixels,
        };
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
