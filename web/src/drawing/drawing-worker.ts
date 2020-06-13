import {
  Size,
  Color,
} from "engine/types.ts";
import {
  Drawing,
  DrawingTile,
  DrawingDoneFn,
  DrawingDoneResult,
} from "./types.ts";
import {
  DrawingResponse,
  DrawingCommand,
  TileId,
  DrawingBatch,
} from "./worker/types.ts";

const MAX_PENDING_FRAMES = 2;

export class DrawingWorker implements Drawing {
  private ready = false;
  private worker: Worker;

  private pixels: ArrayBuffer;
  private pixelsWidth: number;
  private pixelsHeight: number;

  private queue: DrawingCommand[] = [];
  private tileMappings = new Map<DrawingTile, TileId>();
  private nextTileId = 0;
  private pendingDoneResults: DrawingDoneResult[] = [];

  private drawingDone: DrawingDoneFn;
  private pendingFrames = 0;

  public constructor(
    width: number,
    height: number,
    drawingDone: DrawingDoneFn,
  ) {
    this.worker = new Worker("./worker.js", { type: "module" });
    this.worker.onmessage = (e) => this.onMessage(e.data);
    this.pixels = new ArrayBuffer(width * height * 4);
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.drawingDone = drawingDone;
  }

  private enqueueCommand(command: DrawingCommand) {
    this.queue.push(command);
  }

  private getTileId(tile: DrawingTile): TileId {
    const tileId = this.tileMappings.get(tile);
    if (tileId !== undefined) return tileId;

    const id = this.nextTileId++;
    this.tileMappings.set(tile, id);

    this.enqueueCommand({
      type: "addTile",
      id,
      width: tile.width,
      height: tile.height,
      alphaType: tile.alphaType,
      pixels: tile.pixels.buffer,
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
        //Send first in the queue
        this.queue.unshift({
          type: "setSize",
          width: this.pixelsWidth,
          height: this.pixelsHeight,
        });
        this.dispatch();
        break;

      case "result":
        this.pendingFrames--;
        this.pendingDoneResults.push(response.result);
        break;
    }
  }

  public setSize(width: number, height: number) {
    this.pixels = new ArrayBuffer(width * height * 4);
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.enqueueCommand({
      type: "setSize",
      width,
      height,
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
    this.enqueueCommand({
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
    this.enqueueCommand({
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
    this.enqueueCommand({
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
    this.enqueueCommand({
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
    return this.pendingFrames < MAX_PENDING_FRAMES &&
      this.pendingDoneResults.length < MAX_PENDING_FRAMES;
  }

  public processPendingFrames() {
    if (this.pendingDoneResults.length > 0) {
      const result = this.pendingDoneResults.shift() as DrawingDoneResult;
      if (
        result.dirty &&
        result.dirtyParams
      ) {
        if (
          result.dirtyParams.pixelsWidth === this.pixelsWidth &&
          result.dirtyParams.pixelsHeight === this.pixelsHeight
        ) {
          new Uint8Array(this.pixels).set(
            new Uint8Array(result.dirtyParams.pixels),
          );
          result.dirtyParams.pixels = this.pixels;
        } else {
          //Ignore dirty from different size, must be an old frame
          result.dirty = false;
          result.dirtyParams = undefined;
        }
      }
      this.drawingDone(result);
    }
  }
}
