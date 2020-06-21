import {
  Color,
  Rect,
  LAYERS_COUNT,
  LayerId,
  FixedColor,
} from "engine/types.ts";
import {
  Drawing,
  DrawingDoneFn,
  DrawingTile,
  DrawingDoneDirtyParams,
  AnyCanvasContextType,
  AnyCanvasType,
  DrawingTilemap,
} from "./types.ts";

class DrawingHardLayer {
  public pixelsWidth: number;
  public pixelsHeight: number;
  public canvas: AnyCanvasType;
  public ctx: AnyCanvasContextType;

  public dirty = false;
  public dirtyPixels = 0;
  public dirtyLeft = 0;
  public dirtyRight = 0;
  public dirtyTop = 0;
  public dirtyBottom = 0;

  constructor(
    width: number,
    height: number,
    canvas: AnyCanvasType,
    ctx: AnyCanvasContextType,
  ) {
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public setSize(
    width: number,
    height: number,
  ) {
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.canvas.width = width;
    this.canvas.height = height;
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

type TilemapTexture = {
  canvas: AnyCanvasType;
  tilesBounds: Map<DrawingTile, Rect>;
};

export class DrawingHard implements Drawing {
  private layers: DrawingHardLayer[] = [];
  private colorsRGB = new Uint32Array(2);
  private drawingDone: DrawingDoneFn;
  private dirty = false;
  private dirtyTime = 0;
  private targetLayer: DrawingHardLayer;
  private tilesToTexture = new Map<DrawingTile, TilemapTexture>();
  private buildCanvasFn: (w: number, h: number) => AnyCanvasType;

  public constructor(
    width: number,
    height: number,
    canvases: AnyCanvasType[],
    buildCanvasFn: (w: number, h: number) => AnyCanvasType,
    drawingDone: DrawingDoneFn,
  ) {
    this.buildCanvasFn = buildCanvasFn;
    this.drawingDone = drawingDone;

    for (let i = 0; i < LAYERS_COUNT; i++) {
      const ctx = canvases[i].getContext(
        "2d",
        i === 0 ? { alpha: false } : {},
      ) as AnyCanvasContextType;

      this.layers.push(new DrawingHardLayer(width, height, canvases[i], ctx));
    }

    this.targetLayer = this.layers[0];
  }

  public setSize(width: number, height: number) {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].setSize(width, height);
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

    const tileWidth = t.width;
    const tileHeight = t.height;

    const context = this.targetLayer.ctx;
    const tt = this.tilesToTexture.get(t);

    if (!tt) return;

    const texture = tt.canvas;
    const tileBounds = tt.tilesBounds.get(t);

    if (!tileBounds) return;

    if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
      context.drawImage(
        texture,
        tileBounds.x,
        tileBounds.y,
        tileBounds.width,
        tileBounds.height,
        x,
        y,
        tileWidth,
        tileHeight,
      );
    } else {
      cfx = Math.max(cfx, 0);
      cfy = Math.max(cfy, 0);
      cty = Math.min(cty, tileHeight);
      ctx = Math.min(ctx, tileWidth);

      context.drawImage(
        texture,
        tileBounds.x + cfx,
        tileBounds.y + cfy,
        ctx - cfx,
        cty - cfy,
        x + cfx,
        y + cfy,
        ctx - cfx,
        cty - cfy,
      );
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

    const context = this.targetLayer.ctx;

    if (color !== FixedColor.Transparent) {
      const r = color & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = (color >> 16) & 0xFF;
      const a = (color >> 24) & 0xFF;
      context.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
      context.fillRect(x, y, width, height);
    } else {
      context.clearRect(x, y, width, height);
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

    const context = this.targetLayer.ctx;

    context.drawImage(
      context.canvas,
      x - dx,
      y - dy,
      width,
      height,
      x,
      y,
      width,
      height,
    );
  }

  public commit() {
    const dirtyParams: DrawingDoneDirtyParams[] = [];
    let drawnPixels = 0;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      if (layer.dirty) {
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

  public preloadTilemap(tilemap: DrawingTilemap) {
    if (tilemap.tiles.length === 0) return;

    const tiles = tilemap.tiles;

    const tileWidth = tiles[0].width;
    const tileHeight = tiles[0].height;

    const sizeInTiles = Math.ceil(Math.sqrt(tiles.length));
    const width = sizeInTiles * tileWidth;
    const height = sizeInTiles * tileHeight;

    const canvas = this.buildCanvasFn(width, height);
    const ctx = canvas.getContext("2d") as AnyCanvasContextType;

    const texturePixels = new ArrayBuffer(width * height * 4);
    const texturePixels32 = new Uint32Array(texturePixels);

    const tilesBounds = new Map<DrawingTile, Rect>();

    let tileIndex = 0;

    for (let y = 0; y < height && tileIndex < tiles.length; y += tileHeight) {
      for (let x = 0; x < width && tileIndex < tiles.length; x += tileWidth) {
        const tile = tiles[tileIndex];
        const tileBounds = new Rect(
          x,
          y,
          tileWidth,
          tileHeight,
        );
        const tp32 = tile.pixels32;

        for (let dy = 0; dy < tileHeight; dy++) {
          let t = (y + dy) * width + x;
          let p = dy * tileWidth;
          for (let dx = 0; dx < tileWidth; dx++) {
            texturePixels32[t++] = tp32[p++];
          }
        }

        tilesBounds.set(tile, tileBounds);

        tileIndex++;
      }
    }

    ctx.putImageData(
      new ImageData(new Uint8ClampedArray(texturePixels), width, height),
      0,
      0,
    );

    const texture: TilemapTexture = {
      canvas,
      tilesBounds,
    };

    tiles.forEach((t) => this.tilesToTexture.set(t, texture));
  }
}
