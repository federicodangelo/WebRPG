import { DrawingReal } from "../drawing-real.ts";
import { Size } from "engine/types.ts";
import {
  DrawingCommand,
  DrawingResponse,
  TileId,
} from "./types.ts";
import { DrawingTile } from "../types.ts";

function sendResponse(response: DrawingResponse) {
  if (response.type === "result" && response.pixels) {
    const pixelsCopy = response.pixels.slice(0);
    //@ts-ignore
    self.postMessage({ ...response, pixels: pixelsCopy }, [pixelsCopy]);
  } else {
    //@ts-ignore
    self.postMessage(response);
  }
}

let pixels = new Uint8ClampedArray(8 * 8 * 4).buffer;
let pixelsSize = new Size(8, 8);

const drawing = new DrawingReal(pixels, pixelsSize, (result) => {
  sendResponse({
    type: "result",
    pixels: result.dirty ? pixels : undefined,
    pixelsWidth: pixelsSize.width,
    pixelsHeight: pixelsSize.height,
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
    case "setPixels":
      pixels = command.pixels;
      pixelsSize.set(command.pixelsWidth, command.pixelsHeight);
      drawing.setPixels(command.pixels, pixelsSize);
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
