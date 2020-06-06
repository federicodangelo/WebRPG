import { NativeContext } from "engine/native-types.ts";
import { Size, SpecialChar, Color, Tile } from "engine/types.ts";
import { initFonts, FontInfo, DEFAULT_FONT } from "./fonts.ts";
import { initTilesets, TilesetInfo } from "./tileset.ts";

const SCALE = 2;

export const createFullScreenCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(window.innerWidth / SCALE);
  canvas.height = Math.floor(window.innerHeight / SCALE);
  canvas.setAttribute(
    "style",
    "width: " + canvas.width * SCALE + "px;" +
      "height: " + canvas.height * SCALE + "px;" +
      "image-rendering: pixelated;",
  );
  document.body.appendChild(canvas);
  return canvas;
};

const useCp437 = true;

const AnsiSpecialChar: number[] = [
  //Block
  useCp437 ? 219 : "█".charCodeAt(0),
  useCp437 ? 220 : "▄".charCodeAt(0),
  useCp437 ? 224 : "▀".charCodeAt(0),
  useCp437 ? 221 : "▌".charCodeAt(0),
  useCp437 ? 222 : "▌".charCodeAt(0),

  //Shade
  useCp437 ? 176 : "░".charCodeAt(0),
  useCp437 ? 177 : "▒".charCodeAt(0),
  useCp437 ? 178 : "▓".charCodeAt(0),

  ////Single Line
  useCp437 ? 179 : "│".charCodeAt(0),
  useCp437 ? 196 : "─".charCodeAt(0),
  useCp437 ? 218 : "┌".charCodeAt(0),
  useCp437 ? 191 : "┐".charCodeAt(0),
  useCp437 ? 192 : "└".charCodeAt(0),
  useCp437 ? 217 : "┘".charCodeAt(0),
  useCp437 ? 180 : "┤".charCodeAt(0),
  useCp437 ? 195 : "├".charCodeAt(0),
  useCp437 ? 193 : "┴".charCodeAt(0),
  useCp437 ? 194 : "┬".charCodeAt(0),
  useCp437 ? 197 : "┼".charCodeAt(0),

  //Double Line
  useCp437 ? 186 : "║".charCodeAt(0),
  useCp437 ? 205 : "═".charCodeAt(0),
  useCp437 ? 201 : "╔".charCodeAt(0),
  useCp437 ? 187 : "╗".charCodeAt(0),
  useCp437 ? 200 : "╚".charCodeAt(0),
  useCp437 ? 188 : "╝".charCodeAt(0),
  useCp437 ? 185 : "╣".charCodeAt(0),
  useCp437 ? 204 : "╠".charCodeAt(0),
  useCp437 ? 202 : "╩".charCodeAt(0),
  useCp437 ? 203 : "╦".charCodeAt(0),
  useCp437 ? 206 : "╬".charCodeAt(0),
];

export function getWebNativeContext(): NativeContext {
  const canvas = createFullScreenCanvas();
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const consoleSize = new Size(8, 8);

  let charWidth: number = 8;
  let charHeight: number = 8;
  let fonts: Map<string, FontInfo>;
  let tilesets: Map<string, TilesetInfo>;
  let activeFont: FontInfo;
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let imageDataPixels = imageData.data;
  let imageDataPixels32: Uint32Array = new Uint32Array(imageDataPixels.buffer);

  const colorsRGB = new Uint32Array(2);
  let dirty = true;

  ctx.imageSmoothingEnabled = false;

  let screenSizeChangedListeners: ((size: Size) => void)[] = [];
  let inputListeners: ((intut: string) => void)[] = [];

  const updateConsoleSize = () => {
    consoleSize.set(
      Math.trunc(canvas.width / charWidth),
      Math.trunc(canvas.height / charHeight),
    );
  };

  const setChar = (
    char: number,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
  ) => {
    dirty = true;

    colorsRGB[0] = backColor;
    colorsRGB[1] = foreColor;

    if (char < 0 || char > 255) return;

    const charPixels = activeFont.pixels[char];

    const fx = x * charWidth;
    const fy = y * charHeight;

    let p = 0;
    let f = 0;

    for (let py = 0; py < charHeight; py++) {
      p = (fy + py) * imageData.width + fx;
      f = py * charWidth;
      for (let px = 0; px < charWidth; px++) {
        imageDataPixels32[p++] = colorsRGB[charPixels[f++]];
      }
    }
  };

  const handleKeyboard = (e: KeyboardEvent) => {
    const key = e.key;

    if (key.length === 1) {
      inputListeners.forEach((l) => l(key));
    }
  };

  const handleResize = () => {
    canvas.width = Math.floor(window.innerWidth / SCALE);
    canvas.height = Math.floor(window.innerHeight / SCALE);
    canvas.setAttribute(
      "style",
      "width: " + canvas.width * SCALE + "px;" +
        "height: " + canvas.height * SCALE + "px;" +
        "image-rendering: pixelated;",
    );
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageDataPixels = imageData.data;
    imageDataPixels32 = new Uint32Array(imageDataPixels.buffer);
    updateConsoleSize();
    screenSizeChangedListeners.forEach((l) => l(consoleSize));
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

    const fx = x * charWidth;
    const fy = y * charHeight;

    let p = 0;
    let f = 0;

    for (let py = 0; py < charHeight; py++) {
      p = (fy + py) * imageData.width + fx;
      f = py * charWidth;
      for (let px = 0; px < charWidth; px++) {
        imageDataPixels32[p++] = tilePixels[f++];
      }
    }
  };

  window.addEventListener("keydown", handleKeyboard);
  window.addEventListener("resize", handleResize);
  updateConsoleSize();

  return {
    screen: {
      getScreenSize: () => consoleSize,
      onScreenSizeChanged: (listener) => {
        screenSizeChangedListeners.push(listener);
      },
      setChar: (
        char: number,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number,
      ) => {
        setChar(char, foreColor, backColor, x, y);
      },
      setSpecialChar: (
        char: SpecialChar,
        foreColor: Color,
        backColor: Color,
        x: number,
        y: number,
      ) => {
        setChar(AnsiSpecialChar[char], foreColor, backColor, x, y);
      },
      setTile: (
        t: Tile,
        x: number,
        y: number,
      ) => {
        setTile(t, x, y);
      },
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
      fonts = await initFonts();
      tilesets = await initTilesets();
      activeFont = fonts.get(DEFAULT_FONT) as FontInfo;
      charWidth = activeFont.dimensions.width;
      charHeight = activeFont.dimensions.height;
      updateConsoleSize();
    },
    destroy: () => {},
  };
}
