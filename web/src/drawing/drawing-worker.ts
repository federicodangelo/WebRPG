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
  DrawingOptimizedBatch,
  OptimizedDrawingCommandType,
} from "./worker/types.ts";

const MAX_PENDING_FRAMES = 2;
const USE_OPTMIZED_TYPES = true;

export class DrawingWorker implements Drawing {
  private ready = false;
  private worker: Worker;

  private pixels: ArrayBuffer;
  private pixelsWidth: number;
  private pixelsHeight: number;

  private queue: DrawingCommand[] = [];
  private optimizedQueue: ArrayBuffer;
  private optimizedQueue32: Int32Array;
  private optimizedQueueLen = 0;

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
    this.optimizedQueue = new ArrayBuffer(1024 * 64);
    this.optimizedQueue32 = new Int32Array(this.optimizedQueue);
    this.optimizedQueueLen = 0;
  }

  private enqueueCommand(command: DrawingCommand) {
    this.queue.push(command);
  }

  private enqueueOptimizedCommand(
    cmd: OptimizedDrawingCommandType,
    ...args: number[]
  ) {
    while (
      this.optimizedQueueLen + 2 + args.length >=
        this.optimizedQueue32.length
    ) {
      const copy = new ArrayBuffer(this.optimizedQueue.byteLength * 2);
      const copy32 = new Int32Array(copy);
      copy32.set(this.optimizedQueue32);
      this.optimizedQueue = copy;
      this.optimizedQueue32 = copy32;
    }

    this.optimizedQueue32[this.optimizedQueueLen++] = cmd;
    this.optimizedQueue32[this.optimizedQueueLen++] = args.length;
    for (let i = 0; i < args.length; i++) {
      this.optimizedQueue32[this.optimizedQueueLen++] = args[i];
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
    this.pixels = new ArrayBuffer(width * height * 4);
    this.pixelsWidth = width;
    this.pixelsHeight = height;
    //reset queue when size changes
    this.optimizedQueueLen = 0;
    this.queue.length = 0;
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
    if (USE_OPTMIZED_TYPES) {
      this.enqueueOptimizedCommand(
        OptimizedDrawingCommandType.TintTile,
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
    } else {
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
    if (USE_OPTMIZED_TYPES) {
      this.enqueueOptimizedCommand(
        OptimizedDrawingCommandType.SetTile,
        this.getTileId(t),
        x,
        y,
        cfx,
        cfy,
        ctx,
        cty,
      );
    } else {
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
  }

  public fillRect(
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    if (USE_OPTMIZED_TYPES) {
      this.enqueueOptimizedCommand(
        OptimizedDrawingCommandType.FillRect,
        color,
        x,
        y,
        width,
        height,
      );
    } else {
      this.enqueueCommand({
        type: "fillRect",
        color,
        x,
        y,
        width,
        height,
      });
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
    if (USE_OPTMIZED_TYPES) {
      this.enqueueOptimizedCommand(
        OptimizedDrawingCommandType.ScrollRect,
        x,
        y,
        width,
        height,
        dx,
        dy,
      );
    } else {
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
  }

  public dispatch() {
    if (!this.ready) return;
    if (this.queue.length === 0 && this.optimizedQueueLen === 0) return;

    if (this.optimizedQueueLen > 0) {
      const copy = new ArrayBuffer(this.optimizedQueueLen * 4);
      const copy32 = new Int32Array(copy);
      copy32.set(this.optimizedQueue32.slice(0, this.optimizedQueueLen));
      const batch: DrawingOptimizedBatch = {
        type: "optimized-batch",
        optCommands: copy,
        optCommandsLen: this.optimizedQueueLen,
        commands: this.queue,
      };
      this.worker.postMessage(batch, [copy]);
    } else {
      const batch: DrawingBatch = {
        type: "batch",
        commands: this.queue,
      };
      this.worker.postMessage(batch);
    }

    this.queue = [];
    this.optimizedQueueLen = 0;
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
