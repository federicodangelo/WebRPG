import { DrawingReal } from "../drawing-real.ts";
import {
  DrawingRequest,
  DrawingResponse,
  TileId,
  DrawingCommandType,
} from "./types.ts";
import {
  DrawingTile,
  DrawingDoneResult,
  DrawingDoneDirtyParams,
  Drawing,
} from "../types.ts";
import { AlphaType } from "../../../../engine/src/types.ts";

const offscreenCanvases: OffscreenCanvas[] = [];

function sendResponse(response: DrawingResponse) {
  if (response.type === "result") {
    const transferables: Transferable[] = [];
    const dirtyParamsToRemove: DrawingDoneDirtyParams[] = [];

    for (let i = 0; i < response.result.dirtyParams.length; i++) {
      const params = response.result.dirtyParams[i];
      const pixelsCopy = params.pixels.slice(0);
      params.pixels = pixelsCopy;
      transferables.push(pixelsCopy);
    }

    response.result.dirtyParams = response.result.dirtyParams.filter((params) =>
      !dirtyParamsToRemove.includes(params)
    );

    //@ts-ignore
    self.postMessage(response, transferables);
  } else {
    //@ts-ignore
    self.postMessage(response);
  }
}

let drawing: Drawing | null = null;

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
  if (drawing === null) return;
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
        for (let i = 0; i < offscreenCanvases.length; i++) {
          offscreenCanvases[i].width = commands[index + 0];
          offscreenCanvases[i].height = commands[index + 1];
        }
        break;
      case DrawingCommandType.SetLayer:
        drawing.setLayer(
          commands[index + 0],
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
      handleCommands(
        new Int32Array(request.commands),
        request.commandsLen,
      );
      break;
    case "init":
      {
        offscreenCanvases.length = 0;
        offscreenCanvases.push(...request.canvases);
        const canvasesCtx = request.canvases.map((c, index) =>
          c.getContext(
            "2d",
            index === 0 ? { alpha: false } : {},
          ) as OffscreenCanvasRenderingContext2D
        );
        drawing = new DrawingReal(
          request.width,
          request.height,
          canvasesCtx,
          (result: DrawingDoneResult) => {
            sendResponse({
              type: "result",
              result,
            });
          },
        );
      }
      break;
  }
}

self.onmessage = (e: MessageEvent) => {
  const command: DrawingRequest = e.data;
  handleRequest(command);
  drawing?.dispatch();
};

sendResponse({ type: "ready" });

console.log("Drawing Worker Started");
