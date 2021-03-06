import {
  Color,
  AlphaType,
  Rect,
  LAYERS_COUNT,
  LayerId,
} from "engine/types.ts";
import {
  Drawing,
  DrawingDoneFn,
  DrawingTile,
  DrawingDoneDirtyParams,
  AnyCanvasContextType,
  AnyCanvasType,
  DrawingTilemap,
  DrawingSprite,
  DrawingSpritesheet,
} from "./types.ts";

class DrawingSoftLayer {
  public pixels: ArrayBuffer;
  public pixelsWidth: number;
  public pixelsHeight: number;

  public imageDataPixels8: Uint8ClampedArray;
  public imageDataPixels32: Uint32Array;

  public dirty = false;
  public dirtyPixels = 0;
  public dirtyLeft = 0;
  public dirtyRight = 0;
  public dirtyTop = 0;
  public dirtyBottom = 0;

  constructor(width: number, height: number) {
    this.pixels = new ArrayBuffer(width * height * 4);
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.imageDataPixels8 = new Uint8ClampedArray(this.pixels);
    this.imageDataPixels32 = new Uint32Array(this.pixels);
  }

  public setSize(
    width: number,
    height: number,
  ) {
    this.pixels = new ArrayBuffer(width * height * 4);
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.imageDataPixels8 = new Uint8ClampedArray(this.pixels);
    this.imageDataPixels32 = new Uint32Array(this.pixels);
  }

  public setDirty(x: number, y: number, width: number, height: number) {
    if (!this.dirty) {
      this.dirty = true;
      this.dirtyPixels = 0;
      this.dirtyLeft = x;
      this.dirtyTop = y;
      this.dirtyRight = x + width;
      this.dirtyBottom = y + height;
    } else {
      this.dirtyLeft = Math.min(this.dirtyLeft, x);
      this.dirtyTop = Math.min(this.dirtyTop, y);
      this.dirtyRight = Math.max(this.dirtyRight, x + width);
      this.dirtyBottom = Math.max(this.dirtyBottom, y + height);
    }
    this.dirtyPixels += width * height;
  }

  public getDirtyRect(): Rect {
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
}

export class DrawingSoft implements Drawing {
  private layers: DrawingSoftLayer[] = [];
  private drawingDone: DrawingDoneFn;
  private dirty = false;
  private dirtyTime = 0;
  private targetLayer: DrawingSoftLayer;
  private canvases: AnyCanvasType[];
  private canvasesCtx: AnyCanvasContextType[];
  private useCanvases = false;

  public constructor(
    width: number,
    height: number,
    canvases: AnyCanvasType[],
    drawingDone: DrawingDoneFn,
  ) {
    this.drawingDone = drawingDone;

    for (let i = 0; i < LAYERS_COUNT; i++) {
      this.layers.push(new DrawingSoftLayer(width, height));
    }

    this.targetLayer = this.layers[0];

    this.canvases = canvases;
    this.canvasesCtx = canvases.map((c, index) => {
      const ctx = c.getContext(
        "2d",
        index === 0 ? { alpha: false } : {},
      );
      if (!ctx) throw new Error("Context creation error");
      return ctx;
    });
    this.useCanvases = canvases.length > 0;
  }

  public setSize(width: number, height: number) {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].setSize(width, height);
    }
    for (let i = 0; i < this.canvases.length; i++) {
      this.canvases[i].width = width;
      this.canvases[i].height = height;
    }
  }

  public setTargetLayer(layer: LayerId) {
    this.targetLayer = this.layers[layer];
  }

  private setDirty(
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    if (!this.dirty) {
      this.dirty = true;
      this.dirtyTime = performance.now();
    }
    this.targetLayer.setDirty(x, y, width, height);
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

    const imageDataPixels8 = this.targetLayer.imageDataPixels8;
    const imageDataPixels32 = this.targetLayer.imageDataPixels32;
    const screenWidth = this.targetLayer.pixelsWidth;

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
          cty = Math.min(cty, tileHeight);
          ctx = Math.min(ctx, tileWidth);
          for (let py = cfy; py < cty; py++) {
            p = (y + py) * screenWidth + x + cfx;
            f = py * tileWidth + cfx;
            for (let px = cfx; px < ctx; px++) {
              imageDataPixels32[p++] = tilePixels32[f++];
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
          cty = Math.min(cty, tileHeight);
          ctx = Math.min(ctx, tileWidth);
          for (let py = cfy; py < cty; py++) {
            p = (y + py) * screenWidth + x + cfx;
            f = py * tileWidth + cfx;
            for (let px = cfx; px < ctx; px++) {
              const pixel = tilePixels32[f++];
              if (pixel >> 24 !== 0) {
                imageDataPixels32[p++] = pixel;
              } else {
                p++;
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
              const r = tilePixels8[f + 0];
              const g = tilePixels8[f + 1];
              const b = tilePixels8[f + 2];
              const a = tilePixels8[f + 3] / 255;
              const invA = 1 - a;
              imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA + r * a;
              imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA + g * a;
              imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA + b * a;
              imageDataPixels8[p + 3] = 255; //a
              f += 4;
              p += 4;
            }
          }
        } else {
          cty = Math.min(cty, tileHeight);
          ctx = Math.min(ctx, tileWidth);
          for (let py = cfy; py < cty; py++) {
            p = ((y + py) * screenWidth + x + cfx) << 2;
            f = (py * tileWidth + cfx) << 2;
            for (let px = cfx; px < ctx; px++) {
              const r = tilePixels8[f + 0];
              const g = tilePixels8[f + 1];
              const b = tilePixels8[f + 2];
              const a = tilePixels8[f + 3] / 255;
              const invA = 1 - a;
              imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA +
                r * a;
              imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA +
                g * a;
              imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA +
                b * a;
              imageDataPixels8[p + 3] = 255; //a
              f += 4;
              p += 4;
            }
          }
        }
        break;
    }
  }

  public setSprite(
    t: DrawingSprite,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ) {
    this.setTile(t, x, y, cfx, cfy, ctx, cty);
  }

  public fillRect(
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.setDirty(x, y, width, height);

    const imageDataPixels32 = this.targetLayer.imageDataPixels32;
    const screenWidth = this.targetLayer.pixelsWidth;

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

    const imageDataPixels32 = this.targetLayer.imageDataPixels32;
    const screenWidth = this.targetLayer.pixelsWidth;
    const screenHeight = this.targetLayer.pixelsHeight;

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

  public commit() {
    const dirtyParams: DrawingDoneDirtyParams[] = [];
    let drawnPixels = 0;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      if (layer.dirty) {
        const dirtyRect = layer.getDirtyRect();

        if (this.useCanvases) {
          this.canvasesCtx[i].putImageData(
            new ImageData(
              new Uint8ClampedArray(layer.pixels),
              layer.pixelsWidth,
              layer.pixelsHeight,
            ),
            0,
            0,
            dirtyRect.x,
            dirtyRect.y,
            dirtyRect.width,
            dirtyRect.height,
          );
        } else {
          dirtyParams.push(
            {
              layer: i,
              dirtyRect,
              pixels: layer.pixels,
              pixelsWidth: layer.pixelsWidth,
              pixelsHeight: layer.pixelsHeight,
            },
          );
        }
        drawnPixels += layer.dirtyPixels;
      }
    }

    this.drawingDone({
      dirtyParams,
      stats: {
        drawnPixels,
        time: this.dirty ? performance.now() - this.dirtyTime : 0,
      },
    });

    this.dirty = false;
    for (let i = 0; i < this.layers.length; i++) this.layers[i].dirty = false;
  }

  public willDispatch() {
    return this.dirty;
  }

  public isReadyForNextFrame() {
    return true;
  }

  public update() {}

  public preloadTilemap(tilemap: DrawingTilemap) {}

  public preloadSpritesheet(spritesheet: DrawingSpritesheet) {}
}
