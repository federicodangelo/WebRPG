import { DrawingReal } from "../drawing-real.ts";
import {
  DrawingRequest,
  DrawingResponse,
  TileId,
  DrawingCommandType,
} from "./types.ts";
import { DrawingTile } from "../types.ts";
import { AlphaType } from "../../../../engine/src/types.ts";

function sendResponse(response: DrawingResponse) {
  if (
    response.type === "result" &&
    response.result.dirty &&
    response.result.dirtyParams
  ) {
    const pixelsCopy = response.result.dirtyParams.pixels.slice(0);
    response.result.dirtyParams.pixels = pixelsCopy;
    //@ts-ignore
    self.postMessage(response, [pixelsCopy]);
  } else {
    //@ts-ignore
    self.postMessage(response);
  }
}

const drawing = new DrawingReal(8, 8, (result) => {
  sendResponse({
    type: "result",
    result,
  });
});

const tilesMapping = new Map<number, DrawingTile>();

function getTile(tid: TileId): DrawingTile {
  const tile = tilesMapping.get(tid);
  if (tile === undefined) throw new Error("Unknown tile id received " + tid);
  return tile;
}

function addTile(tid: TileId, tile: DrawingTile) {
  tilesMapping.set(tid, tile);
}

function handleCommands(commands: Int32Array, commandsLen: number) {
  let index = 0;
  while (index < commandsLen) {
    const cmd: DrawingCommandType = commands[index++];
    const argsLen = commands[index++];
    switch (cmd) {
      case DrawingCommandType.SetTile:
        drawing.setTile(
          getTile(commands[index + 0]),
          commands[index + 1],
          commands[index + 2],
          commands[index + 3],
          commands[index + 4],
          commands[index + 5],
          commands[index + 6],
        );
        break;
      case DrawingCommandType.TintTile:
        drawing.tintTile(
          getTile(commands[index + 0]),
          commands[index + 1],
          commands[index + 2],
          commands[index + 3],
          commands[index + 4],
          commands[index + 5],
          commands[index + 6],
          commands[index + 7],
          commands[index + 8],
        );
        break;
      case DrawingCommandType.FillRect:
        drawing.fillRect(
          commands[index + 0],
          commands[index + 1],
          commands[index + 2],
          commands[index + 3],
          commands[index + 4],
        );
        break;
      case DrawingCommandType.ScrollRect:
        drawing.scrollRect(
          commands[index + 0],
          commands[index + 1],
          commands[index + 2],
          commands[index + 3],
          commands[index + 4],
          commands[index + 5],
        );
        break;
      case DrawingCommandType.SetSize:
        drawing.setSize(
          commands[index + 0],
          commands[index + 1],
        );
        break;
      case DrawingCommandType.AddTile: {
        const id = commands[index + 0];
        const width = commands[index + 1];
        const height = commands[index + 2];
        const alphaType: AlphaType = commands[index + 3];
        const pixels32Len = commands[index + 4];
        const pixels32 = new Uint32Array(pixels32Len);
        const pixels = new Uint8ClampedArray(pixels32.buffer);
        pixels32.set(commands.slice(index + 5, index + 5 + pixels32Len));
        addTile(id, {
          alphaType,
          width,
          height,
          pixels,
          pixels32,
        });
        break;
      }
    }
    index += argsLen;
  }
}

function handleRequest(request: DrawingRequest) {
  switch (request.type) {
    case "batch":
      request.requests.forEach((c) => handleRequest(c));
      handleCommands(
        new Int32Array(request.commands),
        request.commandsLen,
      );
      break;
  }
}

self.onmessage = (e: MessageEvent) => {
  const command: DrawingRequest = e.data;
  handleRequest(command);
  drawing.dispatch();
};

sendResponse({ type: "ready" });

console.log("Drawing Worker Started");
