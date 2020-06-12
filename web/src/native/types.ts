import {
  Size,
  Color,
  Rect,
  AlphaType,
} from "../../../engine/src/types.ts";

export type ApplyDirtyRectFn = (rect: Rect) => void;

export type DrawingTile = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  pixels32: Uint32Array;
  alphaType: AlphaType;
};

export type Drawing = {
  setPixels(pixels: ArrayBuffer, size: Size): void;

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
