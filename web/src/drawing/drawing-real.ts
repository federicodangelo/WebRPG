import {
  Size,
  Color,
  AlphaType,
  Rect,
} from "engine/types.ts";
import { Drawing, DrawingDoneFn, DrawingTile } from "./types.ts";

export class DrawingReal implements Drawing {
  private pixels: ArrayBuffer;
  private pixelsWidth: number;
  private pixelsHeight: number;

  private imageDataPixels8: Uint8ClampedArray;
  private imageDataPixels32: Uint32Array;
  private colorsRGB = new Uint32Array(2);

  private dirty = false;
  private dirtyPixels = 0;
  private dirtyLeft = 0;
  private dirtyRight = 0;
  private dirtyTop = 0;
  private dirtyBottom = 0;
  private dirtyTime = 0;
  private drawingDone: DrawingDoneFn;

  public constructor(
    width: number,
    height: number,
    drawingDone: DrawingDoneFn,
  ) {
    this.drawingDone = drawingDone;
    this.pixels = new ArrayBuffer(width * height * 4);
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.imageDataPixels8 = new Uint8ClampedArray(this.pixels);
    this.imageDataPixels32 = new Uint32Array(this.pixels);
  }

  public setSize(width: number, height: number) {
    this.pixels = new ArrayBuffer(width * height * 4);
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.imageDataPixels8 = new Uint8ClampedArray(this.pixels);
    this.imageDataPixels32 = new Uint32Array(this.pixels);
  }

  private setDirty(x: number, y: number, width: number, height: number) {
    if (!this.dirty) {
      this.dirty = true;
      this.dirtyPixels = 0;
      this.dirtyLeft = x;
      this.dirtyTop = y;
      this.dirtyRight = x + width;
      this.dirtyBottom = y + height;
      this.dirtyTime = performance.now();
    } else {
      this.dirtyLeft = Math.min(this.dirtyLeft, x);
      this.dirtyTop = Math.min(this.dirtyTop, y);
      this.dirtyRight = Math.max(this.dirtyRight, x + width);
      this.dirtyBottom = Math.max(this.dirtyBottom, y + height);
    }
    this.dirtyPixels += width * height;
  }

  public tintTile(
    t: DrawingTile,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ) {
    this.setDirty(x, y, t.width, t.height);

    const colorsRGB = this.colorsRGB;
    const imageDataPixels32 = this.imageDataPixels32;
    const screenWidth = this.pixelsWidth;

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
          p = (y + py) * screenWidth + x;
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
          p = (y + py) * screenWidth + x;
          f = py * tileWidth;
          for (let px = 0; px < tileWidth; px++) {
            imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
          }
        }
      }
    } else {
      if (backTransparent) {
        for (let py = 0; py < tileHeight; py++) {
          p = (y + py) * screenWidth + x;
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
          p = (y + py) * screenWidth + x;
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
  }

  public setTile(
    t: DrawingTile,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ) {
    this.setDirty(x, y, t.width, t.height);

    const imageDataPixels8 = this.imageDataPixels8;
    const imageDataPixels32 = this.imageDataPixels32;
    const screenWidth = this.pixelsWidth;

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
            p = (y + py) * screenWidth + x;
            f = py * tileWidth;
            for (let px = 0; px < tileWidth; px++) {
              imageDataPixels32[p++] = tilePixels32[f++];
            }
          }
        } else {
          for (let py = 0; py < tileHeight; py++) {
            p = (y + py) * screenWidth + x;
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
            p = (y + py) * screenWidth + x;
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
            p = (y + py) * screenWidth + x;
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
            p = ((y + py) * screenWidth + x) << 2;
            f = (py * tileWidth) << 2;
            for (let px = 0; px < tileWidth; px++) {
              const r = tilePixels8[f++];
              const g = tilePixels8[f++];
              const b = tilePixels8[f++];
              const a = tilePixels8[f++] / 255;
              const invA = 1 - a;
              imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA + r * a;
              imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA + g * a;
              imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA + b * a;
              imageDataPixels8[p + 3] = 255; //a
              p += 4;
            }
          }
        } else {
          for (let py = 0; py < tileHeight; py++) {
            p = ((y + py) * screenWidth + x) << 2;
            f = (py * tileWidth) << 2;
            for (let px = 0; px < tileWidth; px++) {
              if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                const r = tilePixels8[f++];
                const g = tilePixels8[f++];
                const b = tilePixels8[f++];
                const a = tilePixels8[f++] / 255;
                const invA = 1 - a;
                imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA +
                  r * a;
                imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA +
                  g * a;
                imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA +
                  b * a;
                imageDataPixels8[p + 3] = 255; //a
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
  }

  public fillRect(
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.setDirty(x, y, width, height);

    const imageDataPixels32 = this.imageDataPixels32;
    const screenWidth = this.pixelsWidth;

    let p = 0;

    for (let py = 0; py < height; py++) {
      p = (y + py) * screenWidth + x;
      for (let px = 0; px < width; px++) {
        imageDataPixels32[p++] = color;
      }
    }
  }

  public scrollRect(
    x: number,
    y: number,
    width: number,
    height: number,
    dx: number,
    dy: number,
  ) {
    this.setDirty(x, y, width, height);

    const imageDataPixels32 = this.imageDataPixels32;
    const screenWidth = this.pixelsWidth;
    const screenHeight = this.pixelsHeight;

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
  }

  private getDirtyRect(): Rect {
    const dirtyLeft = Math.max(
      Math.min(this.dirtyLeft, this.pixelsWidth),
      0,
    );
    const dirtyRight = Math.max(
      Math.min(this.dirtyRight, this.pixelsWidth),
      0,
    );
    const dirtyTop = Math.max(
      Math.min(this.dirtyTop, this.pixelsHeight),
      0,
    );
    const dirtyBottom = Math.max(
      Math.min(this.dirtyBottom, this.pixelsHeight),
      0,
    );

    return new Rect(
      dirtyLeft,
      dirtyTop,
      dirtyRight - dirtyLeft,
      dirtyBottom - dirtyTop,
    );
  }

  public dispatch() {
    this.drawingDone({
      dirty: this.dirty,
      dirtyParams: this.dirty
        ? {
          dirtyRect: this.getDirtyRect(),
          pixels: this.pixels,
          pixelsWidth: this.pixelsWidth,
          pixelsHeight: this.pixelsHeight,
        }
        : undefined,
      stats: {
        drawnPixels: this.dirtyPixels,
        time: this.dirty ? performance.now() - this.dirtyTime : 0,
      },
    });

    this.dirty = false;
  }

  public willDispatch() {
    return this.dirty;
  }

  public readyForNextFrame() {
    return true;
  }

  processPendingFrames() {}
}
