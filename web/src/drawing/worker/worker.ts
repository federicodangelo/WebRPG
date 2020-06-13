import { DrawingReal } from "../drawing-real.ts";
import {
  DrawingCommand,
  DrawingResponse,
  TileId,
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

function handleCommand(command: DrawingCommand) {
  switch (command.type) {
    case "setTile":
      drawing.setTile(
        getTile(command.t),
        command.x,
        command.y,
        command.cfx,
        command.cfy,
        command.ctx,
        command.cty,
      );
      break;
    case "tintTile":
      drawing.tintTile(
        getTile(command.t),
        command.foreColor,
        command.backColor,
        command.x,
        command.y,
        command.cfx,
        command.cfy,
        command.ctx,
        command.cty,
      );
      break;
    case "fillRect":
      drawing.fillRect(
        command.color,
        command.x,
        command.y,
        command.width,
        command.height,
      );
      break;
    case "scrollRect":
      drawing.scrollRect(
        command.x,
        command.y,
        command.width,
        command.height,
        command.dx,
        command.dy,
      );
      break;
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
