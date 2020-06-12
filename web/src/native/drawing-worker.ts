import {
  Size,
  Color,
  Rect,
} from "../../../engine/src/types.ts";
import { Drawing, ApplyDirtyRectFn, DrawingTile } from "./types.ts";
import {
  DrawingResponse,
  DrawingCommand,
  TileId,
  DrawingBatch,
  DrawingSetPixels,
} from "./worker/types.ts";

export class DrawingWorker implements Drawing {
  private ready = false;
  private worker: Worker;

  private pixels: ArrayBuffer;
  private size: Size;

  private queue: DrawingCommand[] = [];
  private tileMappings = new Map<DrawingTile, TileId>();
  private nextTileId = 0;

  private applyDirtyRect: ApplyDirtyRectFn;
  private pendingFrames = 0;

  public constructor(
    pixels: ArrayBuffer,
    size: Size,
    applyDirtyRect: ApplyDirtyRectFn,
  ) {
    this.worker = new Worker("./worker.js", { type: "module" });
    this.worker.onmessage = (e) => this.onMessage(e.data);
    this.pixels = pixels;
    this.size = size.clone();
    this.applyDirtyRect = applyDirtyRect;
  }

  private dispatchCommand(command: DrawingCommand) {
    this.queue.push(command);
  }

  private getTileId(tile: DrawingTile): TileId {
    const tileId = this.tileMappings.get(tile);
    if (tileId !== undefined) return tileId;

    const id = this.nextTileId++;
    this.tileMappings.set(tile, id);

    this.dispatchCommand({
      type: "addTile",
      id,
      tile: {
        width: tile.width,
        height: tile.height,
        alphaType: tile.alphaType,
        pixels: tile.pixels,
        pixels32: tile.pixels32,
      },
    });

    return id;
  }

  public isReady() {
    return this.ready;
  }

  private onMessage(response: DrawingResponse) {
    switch (response.type) {
      case "ready":
        this.ready = true;
        const setPixelsCmd: DrawingSetPixels = {
          type: "setPixels",
          pixels: this.pixels,
          size: this.size,
        };
        //Send first in the queue
        this.queue.unshift(setPixelsCmd);
        this.dispatch();
        break;

      case "result":
        this.pendingFrames--;
        if (this.size.equals(response.size)) {
          new Uint8ClampedArray(this.pixels).set(
            new Uint8ClampedArray(response.pixels),
          );
          this.applyDirtyRect(new Rect().copyFrom(response.dirtyRect));
        }
        break;

      case "result-empty":
        this.pendingFrames--;
        break;
    }
  }

  public setPixels(pixels: ArrayBuffer, size: Size) {
    this.pixels = pixels;
    this.size.copyFrom(size);

    this.dispatchCommand({
      type: "setPixels",
      pixels,
      size,
    });
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
    this.dispatchCommand({
      type: "tintTile",
      t: this.getTileId(t),
      foreColor,
      backColor,
      x,
      y,
      cfx,
      cfy,
      ctx,
      cty,
    });
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
    this.dispatchCommand({
      type: "setTile",
      t: this.getTileId(t),
      x,
      y,
      cfx,
      cfy,
      ctx,
      cty,
    });
  }

  public fillRect(
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.dispatchCommand({
      type: "fillRect",
      color,
      x,
      y,
      width,
      height,
    });
  }

  public scrollRect(
    x: number,
    y: number,
    width: number,
    height: number,
    dx: number,
    dy: number,
  ) {
    this.dispatchCommand({
      type: "scrollRect",
      x,
      y,
      width,
      height,
      dx,
      dy,
    });
  }

  public dispatch() {
    if (!this.ready) return;
    if (this.queue.length === 0) return;

    const batch: DrawingBatch = {
      type: "batch",
      commands: this.queue,
    };
    this.queue = [];
    this.worker.postMessage(batch);
    this.pendingFrames++;
  }

  public readyForNextFrame() {
    return this.pendingFrames < 2;
  }
}
