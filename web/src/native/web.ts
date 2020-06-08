import { NativeContext } from "engine/native-types.ts";
import { Size, Color, Tile, KeyEvent, Rect } from "engine/types.ts";

const SCALE = 1;

function updateCanvasSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  canvas.width = Math.floor(width / SCALE);
  canvas.height = Math.floor(height / SCALE);
  if (SCALE !== 1) {
    canvas.setAttribute(
      "style",
      "width: " +
        canvas.width * SCALE +
        "px;" +
        "height: " +
        canvas.height * SCALE +
        "px;" +
        "image-rendering: pixelated;"
    );
  }
}

function createFullScreenCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  updateCanvasSize(canvas, window.innerWidth, window.innerHeight);
  document.body.appendChild(canvas);
  return canvas;
}

export function getWebNativeContext(): NativeContext {
  const canvas = createFullScreenCanvas();
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
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
  let inputListeners: ((e: KeyEvent) => void)[] = [];

  const disptachKeyEvent = (e: KeyEvent) => {
    inputListeners.forEach((l) => l(e));
  };

  const updateScreenSize = () => {
    screenSize.set(canvas.width, canvas.height);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key.length === 1) {
      disptachKeyEvent({ type: "down", char: key });
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key;

    if (key.length === 1) {
      disptachKeyEvent({ type: "up", char: key });
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    const key = e.key;

    if (key.length === 1) {
      disptachKeyEvent({ type: "press", char: key });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const dx =
      e.clientX < window.innerWidth / 3
        ? -1
        : e.clientX > (window.innerWidth * 2) / 3
        ? 1
        : 0;
    const dy =
      e.clientY < window.innerHeight / 3
        ? -1
        : e.clientY > (window.innerHeight * 2) / 3
        ? 1
        : 0;

    const key =
      dx === -1 ? "a" : dx === 1 ? "d" : dy === -1 ? "w" : dy === 1 ? "s" : "";

    if (key.length === 1) {
      disptachKeyEvent({ type: "press", char: key });
    }
  };

  const handleResize = () => {
    updateCanvasSize(canvas, window.innerWidth, window.innerHeight);
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
    cty: number
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
    cty: number
  ) => {
    setDirty(x, y, t.width, t.height);

    const tileWidth = t.width;
    const tileHeight = t.height;

    let p = 0;
    let f = 0;
    const tilePixels32 = t.pixels32;

    if (t.hasAlpha) {
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
    } else {
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
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("keypress", handleKeyPress);
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("resize", handleResize);
  updateScreenSize();

  return {
    screen: {
      getScreenSize: () => screenSize,
      onScreenSizeChanged: (listener) => {
        screenSizeChangedListeners.push(listener);
      },
      tintTile,
      setTile,
      beginDraw: () => {
        dirty = false;
      },
      endDraw: () => {
        if (dirty) {
          dirtyLeft = Math.max(Math.min(dirtyLeft, screenSize.width), 0);
          dirtyRight = Math.max(Math.min(dirtyRight, screenSize.width), 0);
          dirtyTop = Math.max(Math.min(dirtyTop, screenSize.height), 0);
          dirtyBottom = Math.max(Math.min(dirtyBottom, screenSize.height), 0);
          ctx.putImageData(
            imageData,
            0,
            0,
            dirtyLeft,
            dirtyTop,
            dirtyRight - dirtyLeft,
            dirtyBottom - dirtyTop
          );
          dirty = false;
        }
      },
    },
    input: {
      onKeyEvent: (listener) => {
        inputListeners.push(listener);
      },
    },
    init: async () => {
      updateScreenSize();
    },
    destroy: () => {},
  };
}
