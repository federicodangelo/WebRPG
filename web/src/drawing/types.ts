import {
  Color,
  AlphaType,
} from "engine/types.ts";
import { NativeDrawStats } from "engine/native-types.ts";

export type DrawingDoneResult = {
  dirty: boolean;
  dirtyParams?: {
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

export type Drawing = {
  processPendingFrames(): void;

  readyForNextFrame(): boolean;

  setSize(width: number, height: number): void;

  tintTile(
    t: DrawingTile,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ): void;

  setTile(
    t: DrawingTile,
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

  dispatch(): void;
};
