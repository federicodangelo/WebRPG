import {
  Color,
  LayerId,
} from "engine/types.ts";
import {
  Drawing,
  DrawingTile,
  DrawingDoneFn,
  DrawingDoneResult,
} from "./types.ts";
import {
  DrawingResponse,
  TileId,
  DrawingRequestBatch,
  DrawingCommandType,
  DrawingRequestInit,
} from "./worker/types.ts";

export class DrawingWorker implements Drawing {
  private ready = false;
  private worker: Worker;

  private pixelsWidth: number;
  private pixelsHeight: number;

  private drawQueue: ArrayBuffer;
  private drawQueue32: Int32Array;
  private drawQueueLen = 0;

  private tileMappings = new Map<DrawingTile, TileId>();
  private nextTileId = 0;
  private pendingDoneResults: DrawingDoneResult[] = [];
  private offscreenCanvases: OffscreenCanvas[];

  private drawingDone: DrawingDoneFn;
  private pendingFrames = 0;

  public constructor(
    width: number,
    height: number,
    drawingDone: DrawingDoneFn,
    offscreenCanvases: OffscreenCanvas[],
  ) {
    this.worker = new Worker("./worker.js", { type: "module" });
    this.worker.onmessage = (e) => this.onMessage(e.data);
    this.drawingDone = drawingDone;
    this.pixelsWidth = -1;
    this.pixelsHeight = -1;
    this.drawQueue = new ArrayBuffer(1024 * 1024);
    this.drawQueue32 = new Int32Array(this.drawQueue);
    this.drawQueueLen = 0;
    this.offscreenCanvases = offscreenCanvases;

    this.setSize(width, height);
  }

  private enqueueOptimizedCommand(
    cmd: DrawingCommandType,
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

    this.enqueueOptimizedCommand(
      DrawingCommandType.AddTile,
      id,
      tile.width,
      tile.height,
      tile.alphaType,
      tile.pixels32.length,
      ...tile.pixels32,
    );

    return id;
  }

  public isReady() {
    return this.ready;
  }

  private onMessage(response: DrawingResponse) {
    switch (response.type) {
      case "ready":
        this.ready = true;
        this.dispatchInit();
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
    if (this.ready) this.resetQueues();
    this.enqueueOptimizedCommand(DrawingCommandType.SetSize, width, height);
  }

  public setLayer(layer: LayerId) {
    this.enqueueOptimizedCommand(DrawingCommandType.SetLayer, layer);
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
      DrawingCommandType.TintTile,
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
      DrawingCommandType.SetTile,
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
      DrawingCommandType.FillRect,
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
      DrawingCommandType.ScrollRect,
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
    if (this.drawQueueLen === 0) return;

    const copy = new ArrayBuffer(this.drawQueueLen * 4);
    const copy32 = new Int32Array(copy);
    copy32.set(this.drawQueue32.slice(0, this.drawQueueLen));
    const batch: DrawingRequestBatch = {
      type: "batch",
      commands: copy,
      commandsLen: this.drawQueueLen,
    };
    this.worker.postMessage(batch, [copy]);
    this.resetQueues();
    this.pendingFrames++;
  }

  private resetQueues() {
    this.drawQueueLen = 0;
  }

  public readyForNextFrame(maxPendingFrames: number) {
    return this.ready && this.pendingFrames <= maxPendingFrames &&
      this.pendingDoneResults.length <= maxPendingFrames;
  }

  public processPendingFrames() {
    if (this.pendingDoneResults.length > 0) {
      const result = this.pendingDoneResults.shift() as DrawingDoneResult;
      for (let i = result.dirtyParams.length - 1; i >= 0; i--) {
        if (
          result.dirtyParams[i].pixelsWidth !== this.pixelsWidth ||
          result.dirtyParams[i].pixelsHeight !== this.pixelsHeight
        ) {
          //Ignore dirty from different size, must be an old frame
          result.dirtyParams.splice(i, 1);
        }
      }
      this.drawingDone(result);
    }
  }

  private dispatchInit() {
    const init: DrawingRequestInit = {
      type: "init",
      canvases: this.offscreenCanvases,
    };
    this.worker.postMessage(init, this.offscreenCanvases);
  }

  public preloadTiles(tiles: DrawingTile[]) {
    for (let i = 0; i < tiles.length; i++) {
      this.getTileId(tiles[i]);
    }
    this.dispatch();
  }
}
