import {
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
  DrawCommandType,
} from "./worker/types.ts";

const MAX_PENDING_FRAMES = 2;

export class DrawingWorker implements Drawing {
  private ready = false;
  private worker: Worker;

  private pixelsWidth: number;
  private pixelsHeight: number;

  private queue: DrawingCommand[] = [];
  private drawQueue: ArrayBuffer;
  private drawQueue32: Int32Array;
  private drawQueueLen = 0;

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
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.drawingDone = drawingDone;
    this.drawQueue = new ArrayBuffer(1024 * 64);
    this.drawQueue32 = new Int32Array(this.drawQueue);
    this.drawQueueLen = 0;
  }

  private enqueueCommand(command: DrawingCommand) {
    this.queue.push(command);
  }

  private enqueueOptimizedCommand(
    cmd: DrawCommandType,
    ...args: number[]
  ) {
    while (
      this.drawQueueLen + 2 + args.length >=
        this.drawQueue32.length
    ) {
      const copy = new ArrayBuffer(this.drawQueue.byteLength * 2);
      const copy32 = new Int32Array(copy);
      copy32.set(this.drawQueue32);
      this.drawQueue = copy;
      this.drawQueue32 = copy32;
    }

    this.drawQueue32[this.drawQueueLen++] = cmd;
    this.drawQueue32[this.drawQueueLen++] = args.length;
    for (let i = 0; i < args.length; i++) {
      this.drawQueue32[this.drawQueueLen++] = args[i];
    }
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
    if (width === this.pixelsWidth && height === this.pixelsHeight) return;
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    this.drawQueueLen = 0; //reset queue when size changes
    this.queue.length = 0; //reset queue when size changes
    if (this.ready) {
      this.enqueueCommand({
        type: "setSize",
        width,
        height,
      });
    }
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
    this.enqueueOptimizedCommand(
      DrawCommandType.TintTile,
      this.getTileId(t),
      foreColor,
      backColor,
      x,
      y,
      cfx,
      cfy,
      ctx,
      cty,
    );
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
    this.enqueueOptimizedCommand(
      DrawCommandType.SetTile,
      this.getTileId(t),
      x,
      y,
      cfx,
      cfy,
      ctx,
      cty,
    );
  }

  public fillRect(
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.enqueueOptimizedCommand(
      DrawCommandType.FillRect,
      color,
      x,
      y,
      width,
      height,
    );
  }

  public scrollRect(
    x: number,
    y: number,
    width: number,
    height: number,
    dx: number,
    dy: number,
  ) {
    this.enqueueOptimizedCommand(
      DrawCommandType.ScrollRect,
      x,
      y,
      width,
      height,
      dx,
      dy,
    );
  }

  public dispatch() {
    if (!this.ready) return;
    if (this.queue.length === 0 && this.drawQueueLen === 0) return;

    const copy = new ArrayBuffer(this.drawQueueLen * 4);
    const copy32 = new Int32Array(copy);
    copy32.set(this.drawQueue32.slice(0, this.drawQueueLen));
    const batch: DrawingBatch = {
      type: "batch",
      drawCommands: copy,
      drawCommandsLen: this.drawQueueLen,
      commands: this.queue,
    };
    this.worker.postMessage(batch, [copy]);

    this.queue = [];
    this.drawQueueLen = 0;
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
          result.dirtyParams.pixelsWidth !== this.pixelsWidth ||
          result.dirtyParams.pixelsHeight !== this.pixelsHeight
        ) {
          //Ignore dirty from different size, must be an old frame
          result.dirty = false;
          result.dirtyParams = undefined;
        }
      }
      this.drawingDone(result);
    }
  }
}
