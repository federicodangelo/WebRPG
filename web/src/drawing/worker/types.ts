import {
  Color,
  AlphaType,
} from "engine/types.ts";
import { DrawingDoneResult } from "../types.ts";

export type TileId = number;

export type DrawingSetSize = {
  type: "setSize";
  width: number;
  height: number;
};

export type DrawingAddTile = {
  type: "addTile";
  id: TileId;
  width: number;
  height: number;
  pixels: ArrayBuffer;
  alphaType: AlphaType;
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

export type DrawingOptimizedBatch = {
  type: "optimized-batch";
  commands: DrawingCommand[];
  optCommands: ArrayBuffer; //Int32Array
  optCommandsLen: number;
};

export type DrawingCommand =
  | DrawingAddTile
  | DrawingSetSize
  | DrawingTintTile
  | DrawingSetTile
  | DrawingFillRect
  | DrawingScrollRect
  | DrawingBatch
  | DrawingOptimizedBatch;

export type DrawingResult = {
  type: "result";
  result: DrawingDoneResult;
};

export type DrawingReady = {
  type: "ready";
};

export type DrawingResponse = DrawingResult | DrawingReady;

export const enum OptimizedDrawingCommandType {
  SetTile,
  TintTile,
  FillRect,
  ScrollRect,
}
