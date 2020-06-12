import {
  Size,
  Color,
  Rect,
} from "../../../../engine/src/types.ts";
import { DrawingTile } from "../types.ts";

export type TileId = number;

export type DrawingSetPixels = {
  type: "setPixels";
  pixels: ArrayBuffer;
  size: Size;
};

export type DrawingAddTile = {
  type: "addTile";
  id: TileId;
  tile: DrawingTile;
};

export type DrawingTintTile = {
  type: "tintTile";
  t: TileId;
  foreColor: Color;
  backColor: Color;
  x: number;
  y: number;
  cfx: number;
  cfy: number;
  ctx: number;
  cty: number;
};

export type DrawingSetTile = {
  type: "setTile";
  t: TileId;
  x: number;
  y: number;
  cfx: number;
  cfy: number;
  ctx: number;
  cty: number;
};

export type DrawingFillRect = {
  type: "fillRect";
  color: Color;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DrawingScrollRect = {
  type: "scrollRect";
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
};

export type DrawingBatch = {
  type: "batch";
  commands: DrawingCommand[];
};

export type DrawingCommand =
  | DrawingAddTile
  | DrawingSetPixels
  | DrawingTintTile
  | DrawingSetTile
  | DrawingFillRect
  | DrawingScrollRect
  | DrawingBatch;

export type DrawingResult = {
  type: "result";
  pixels: ArrayBuffer;
  size: Size;
  dirtyRect: Rect;
};

export type DrawingResultEmpty = {
  type: "result-empty";
};

export type DrawingReady = {
  type: "ready";
};

export type DrawingResponse = DrawingResult | DrawingReady | DrawingResultEmpty;
