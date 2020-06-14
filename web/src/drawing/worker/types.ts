import {
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

export type DrawingBatch = {
  type: "batch";
  commands: DrawingCommand[];
  // Drawing commands, Int32Array, format:
  // [ DrawCommandType ]
  // [ Number Of Args ]
  // [ Arg 0 ]
  // [ Arg 1 ]
  // [ Arg ... ]
  // [ Last Arg ]
  // [ Next DrawCommandType ]
  // [ Next Number Of Args ]
  // [ Etc.. etc.. ]
  drawCommands: ArrayBuffer;
  drawCommandsLen: number;
};

export type DrawingCommand =
  | DrawingAddTile
  | DrawingSetSize
  | DrawingBatch;

export type DrawingResult = {
  type: "result";
  result: DrawingDoneResult;
};

export type DrawingReady = {
  type: "ready";
};

export type DrawingResponse = DrawingResult | DrawingReady;

export const enum DrawCommandType {
  SetTile,
  TintTile,
  FillRect,
  ScrollRect,
}
