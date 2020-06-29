import {
  Color,
  AlphaType,
  LayerId,
} from "engine/types.ts";
import { NativeDrawStats } from "engine/native-types.ts";

export type AnyCanvasType = HTMLCanvasElement | OffscreenCanvas;
export type AnyCanvasContextType =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export type DrawingDoneDirtyParams = {
  layer: LayerId;
  dirtyRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pixels: ArrayBuffer;
  pixelsWidth: number;
  pixelsHeight: number;
};

export type DrawingDoneResult = {
  dirtyParams: DrawingDoneDirtyParams[];
  stats: NativeDrawStats;
};

export type DrawingDoneFn = (result: DrawingDoneResult) => void;

export type DrawingTile = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  pixels32: Uint32Array;
  alphaType: AlphaType;
};

export type DrawingTilemap = {
  tiles: DrawingTile[];
};

export type DrawingSprite = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  pixels32: Uint32Array;
  alphaType: AlphaType;
};

export type DrawingSpritesheet = {
  sprites: DrawingSprite[];
};

export type Drawing = {
  update(): void;

  isReadyForNextFrame(maxPendingFrames: number): boolean;

  preloadTilemap(tilemap: DrawingTilemap): void;
  preloadSpritesheet(spritesheet: DrawingSpritesheet): void;

  setSize(width: number, height: number): void;

  setTargetLayer(layer: LayerId): void;

  setTile(
    t: DrawingTile,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ): void;

  setSprite(
    s: DrawingSprite,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ): void;

  fillRect(
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void;

  scrollRect(
    x: number,
    y: number,
    width: number,
    height: number,
    dx: number,
    dy: number,
  ): void;

  commit(): void;
};
