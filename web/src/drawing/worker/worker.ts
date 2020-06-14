import { DrawingReal } from "../drawing-real.ts";
import {
  DrawingCommand,
  DrawingResponse,
  TileId,
  DrawCommandType,
} from "./types.ts";
import { DrawingTile } from "../types.ts";

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
  return tilesMapping.get(tid) as DrawingTile;
}

function handleDrawCommands(optCommands: Int32Array, len: number) {
  let index = 0;
  while (index < len) {
    const cmd: DrawCommandType = optCommands[index++];
    const argsLen = optCommands[index++];
    switch (cmd) {
      case DrawCommandType.SetTile:
        drawing.setTile(
          getTile(optCommands[index + 0]),
          optCommands[index + 1],
          optCommands[index + 2],
          optCommands[index + 3],
          optCommands[index + 4],
          optCommands[index + 5],
          optCommands[index + 6],
        );
        break;
      case DrawCommandType.TintTile:
        drawing.tintTile(
          getTile(optCommands[index + 0]),
          optCommands[index + 1],
          optCommands[index + 2],
          optCommands[index + 3],
          optCommands[index + 4],
          optCommands[index + 5],
          optCommands[index + 6],
          optCommands[index + 7],
          optCommands[index + 8],
        );
        break;
      case DrawCommandType.FillRect:
        drawing.fillRect(
          optCommands[index + 0],
          optCommands[index + 1],
          optCommands[index + 2],
          optCommands[index + 3],
          optCommands[index + 4],
        );
        break;
      case DrawCommandType.ScrollRect:
        drawing.scrollRect(
          optCommands[index + 0],
          optCommands[index + 1],
          optCommands[index + 2],
          optCommands[index + 3],
          optCommands[index + 4],
          optCommands[index + 5],
        );
        break;
    }
    index += argsLen;
  }
}

function handleCommand(command: DrawingCommand) {
  switch (command.type) {
    case "setSize":
      drawing.setSize(command.width, command.height);
      break;
    case "addTile":
      tilesMapping.set(command.id, {
        alphaType: command.alphaType,
        width: command.width,
        height: command.height,
        pixels: new Uint8ClampedArray(command.pixels),
        pixels32: new Uint32Array(command.pixels),
      });
      break;
    case "batch":
      command.commands.forEach((c) => handleCommand(c));
      handleDrawCommands(
        new Int32Array(command.drawCommands),
        command.drawCommandsLen,
      );
      break;
  }
}

self.onmessage = (e: MessageEvent) => {
  const command: DrawingCommand = e.data;
  handleCommand(command);
  drawing.dispatch();
};

sendResponse({ type: "ready" });

console.log("Drawing Worker Started");
