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
} from "../types.ts";
import { AlphaType } from "../../../../engine/src/types.ts";

const offscreenCanvases: OffscreenCanvas[] = [];
const offscreenCanvasesCtx: OffscreenCanvasRenderingContext2D[] = [];

function sendResponse(response: DrawingResponse) {
  if (response.type === "result") {
    const transferables: Transferable[] = [];
    const dirtyParamsToRemove: DrawingDoneDirtyParams[] = [];

    for (let i = 0; i < response.result.dirtyParams.length; i++) {
      const params = response.result.dirtyParams[i];

      if (params.layer < offscreenCanvases.length) {
        //Apply locally
        offscreenCanvasesCtx[params.layer].putImageData(
          new ImageData(
            new Uint8ClampedArray(params.pixels),
            params.pixelsWidth,
            params.pixelsHeight,
          ),
          0,
          0,
          params.dirtyRect.x,
          params.dirtyRect.y,
          params.dirtyRect.width,
          params.dirtyRect.height,
        );
        dirtyParamsToRemove.push(params);
      } else {
        //Send copy main thread to apply
        const pixelsCopy = response.result.dirtyParams[i].pixels.slice(0);
        response.result.dirtyParams[i].pixels = pixelsCopy;
        transferables.push(pixelsCopy);
      }
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

const drawing = new DrawingReal(8, 8, (result: DrawingDoneResult) => {
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
      offscreenCanvases.length = 0;
      offscreenCanvasesCtx.length = 0;
      offscreenCanvases.push(...request.canvases);
      offscreenCanvasesCtx.push(
        ...request.canvases.map((c, index) =>
          c.getContext(
            "2d",
            index === 0 ? { alpha: false } : {},
          ) as OffscreenCanvasRenderingContext2D
        ),
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
