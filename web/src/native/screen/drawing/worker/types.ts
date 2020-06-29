import { DrawingDoneResult } from "../types.ts";

export type TileId = number;
export type SpriteId = number;

export const enum DrawingCommandType {
  SetTile,
  SetSprite,

  FillRect,
  ScrollRect,
  SetSize,
  SetTargetLayer,

  AddTile,
  AddTilemap,

  AddSprite,
  AddSpritesheet,
}

export type DrawingRequestInit = {
  type: "init";
  canvases: OffscreenCanvas[];
  width: number;
  height: number;
};

export type DrawingRequestBatch = {
  type: "batch";
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
  commands: ArrayBuffer;
  commandsLen: number;
};

export type DrawingRequest =
  | DrawingRequestInit
  | DrawingRequestBatch;

export type DrawingResponseResult = {
  type: "result";
  result: DrawingDoneResult;
};

export type DrawingResponseReady = {
  type: "ready";
};

export type DrawingResponse = DrawingResponseResult | DrawingResponseReady;
