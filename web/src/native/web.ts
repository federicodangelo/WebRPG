import { NativeContext } from "engine/native-types.ts";
import { Size, Color, Tile } from "engine/types.ts";
import { initTilesets, TilesetInfo } from "./tileset.ts";

const SCALE = 1;

function updateCanvasSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) {
  canvas.width = Math.floor(width / SCALE);
  canvas.height = Math.floor(height / SCALE);
  if (SCALE !== 1) {
    canvas.setAttribute(
      "style",
      "width: " + canvas.width * SCALE + "px;" +
        "height: " + canvas.height * SCALE + "px;" +
        "image-rendering: pixelated;",
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

  let tilesets: Map<string, TilesetInfo>;

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let imageDataPixels = imageData.data;
  let imageDataPixels32: Uint32Array = new Uint32Array(imageDataPixels.buffer);

  const colorsRGB = new Uint32Array(2);
  let dirty = true;

  ctx.imageSmoothingEnabled = false;

  let screenSizeChangedListeners: ((size: Size) => void)[] = [];
  let inputListeners: ((intut: string) => void)[] = [];

  const updateScreenSize = () => {
    screenSize.set(canvas.width, canvas.height);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    if (key.length === 1) {
      inputListeners.forEach((l) => l(key));
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const dx = (e.clientX < window.innerWidth / 3)
      ? -1
      : (e.clientX > window.innerWidth * 2 / 3)
      ? 1
      : 0;
    const dy = (e.clientY < window.innerHeight / 3)
      ? -1
      : (e.clientY > window.innerHeight * 2 / 3)
      ? 1
      : 0;

    const key = dx === -1
      ? "a"
      : dx === 1
      ? "d"
      : dy === -1
      ? "w"
      : dy === 1
      ? "s"
      : "";

    if (key.length === 1) {
      inputListeners.forEach((l) => l(key));
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
  ) => {
    dirty = true;

    if (t.index < 0 || t.index > 255) return;

    colorsRGB[1] = foreColor;
    colorsRGB[0] = backColor;

    const tileset = tilesets.get(t.tilemap);

    if (tileset === undefined) return;

    const tilePixels = tileset.pixels[t.index];
    const tileWidth = tileset.dimensions.width;
    const tileHeight = tileset.dimensions.height;

    const fx = x;
    const fy = y;
    const backTransparent = (backColor >> 24) == 0;

    let p = 0;
    let f = 0;

    if (backTransparent) {
      for (let py = 0; py < tileHeight; py++) {
        p = (fy + py) * imageData.width + fx;
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
        p = (fy + py) * imageData.width + fx;
        f = py * tileWidth;
        for (let px = 0; px < tileWidth; px++) {
          imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
        }
      }
    }
  };

  const tintTileClip = (
    t: Tile,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    dirty = true;

    if (t.index < 0 || t.index > 255) return;

    colorsRGB[1] = foreColor;
    colorsRGB[0] = backColor;

    const tileset = tilesets.get(t.tilemap);

    if (tileset === undefined) return;

    const tilePixels = tileset.pixels[t.index];
    const tileWidth = tileset.dimensions.width;
    const tileHeight = tileset.dimensions.height;

    if (w <= 0) w += tileWidth;
    if (h <= 0) h += tileHeight;

    const fx = x;
    const fy = y;
    const backTransparent = (backColor >> 24) == 0;

    let p = 0;
    let f = 0;

    if (backTransparent) {
      for (let py = 0; py < tileHeight; py++) {
        p = (fy + py) * imageData.width + fx;
        f = py * tileWidth;
        for (let px = 0; px < tileWidth; px++) {
          if (px < w && py < h) {
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
        p = (fy + py) * imageData.width + fx;
        f = py * tileWidth;
        for (let px = 0; px < tileWidth; px++) {
          if (px < w && py < h) {
            imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
          } else {
            p++;
            f++;
          }
        }
      }
    }
  };

  const setTile = (
    t: Tile,
    x: number,
    y: number,
  ) => {
    dirty = true;

    const tileset = tilesets.get(t.tilemap);

    if (tileset === undefined) return;

    const tilePixels = tileset.pixels[t.index];
    const tileWidth = tileset.dimensions.width;
    const tileHeight = tileset.dimensions.height;

    const fx = x;
    const fy = y;

    let p = 0;
    let f = 0;

    for (let py = 0; py < tileHeight; py++) {
      p = (fy + py) * imageData.width + fx;
      f = py * tileWidth;
      for (let px = 0; px < tileWidth; px++) {
        imageDataPixels32[p++] = tilePixels[f++];
      }
    }
  };

  const setTileClip = (
    t: Tile,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    dirty = true;

    const tileset = tilesets.get(t.tilemap);

    if (tileset === undefined) return;

    const tilePixels = tileset.pixels[t.index];
    const tileWidth = tileset.dimensions.width;
    const tileHeight = tileset.dimensions.height;

    if (w <= 0) w += tileWidth;
    if (h <= 0) h += tileHeight;

    const fx = x;
    const fy = y;

    let p = 0;
    let f = 0;

    for (let py = 0; py < tileHeight; py++) {
      p = (fy + py) * imageData.width + fx;
      f = py * tileWidth;
      for (let px = 0; px < tileWidth; px++) {
        if (px < w && py < h) {
          imageDataPixels32[p++] = tilePixels[f++];
        } else {
          p++;
          f++;
        }
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
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
      tintTileClip,
      setTile,
      setTileClip,
      beginDraw: () => {},
      endDraw: () => {
        if (dirty) {
          ctx.putImageData(imageData, 0, 0);
          dirty = false;
        }
      },
    },
    input: {
      onInput: (listener) => {
        inputListeners.push(listener);
      },
    },
    init: async () => {
      tilesets = await initTilesets();
      updateScreenSize();
    },
    destroy: () => {},
  };
}
