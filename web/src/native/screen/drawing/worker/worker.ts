import { DrawingSoft } from "../drawing-soft.ts";
import { DrawingHard } from "../drawing-hard.ts";
import {
  DrawingRequest,
  DrawingResponse,
  TileId,
  DrawingCommandType,
  SpriteId,
} from "./types.ts";
import {
  DrawingTile,
  DrawingDoneResult,
  DrawingDoneDirtyParams,
  Drawing,
  DrawingTilemap,
  DrawingSpritesheet,
  DrawingSprite,
} from "../types.ts";
import { AlphaType } from "engine/types.ts";

const USE_HARD_DRAWING = true;

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

const spritesMapping = new Map<number, DrawingSprite>();

function getSprite(sid: SpriteId): DrawingSprite {
  const sprite = spritesMapping.get(sid);
  if (sprite === undefined) {
    throw new Error("Unknown sprite id received " + sid);
  }
  return sprite;
}

function addSprite(sid: SpriteId, sprite: DrawingSprite) {
  spritesMapping.set(sid, sprite);
}

function handleCommands(commands: Int32Array, commandsLen: number) {
  let index = 0;
  if (drawing === null) return;
  let tilesToAddToTilemap = 0;
  let tilemap: DrawingTilemap | null = null;
  let spritesToAddToSpritesheet = 0;
  let spritesheet: DrawingSpritesheet | null = null;
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
      case DrawingCommandType.SetSprite:
        drawing.setSprite(
          getSprite(commands[index + 0]),
          commands[index + 1],
          commands[index + 2],
          commands[index + 3],
          commands[index + 4],
          commands[index + 5],
          commands[index + 6],
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
      case DrawingCommandType.SetTargetLayer:
        drawing.setTargetLayer(
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
        const tile = {
          alphaType,
          width,
          height,
          pixels,
          pixels32,
        };
        addTile(id, tile);
        if (tilesToAddToTilemap > 0 && tilemap !== null) {
          tilemap.tiles.push(tile);
          tilesToAddToTilemap--;
          if (tilesToAddToTilemap === 0) {
            drawing?.preloadTilemap(tilemap);
            tilemap = null;
          }
        }
        break;
      }
      case DrawingCommandType.AddTilemap: {
        tilesToAddToTilemap = commands[index + 0];
        tilemap = { tiles: [] };
      }
      case DrawingCommandType.AddSprite: {
        const id = commands[index + 0];
        const width = commands[index + 1];
        const height = commands[index + 2];
        const alphaType: AlphaType = commands[index + 3];
        const pixels32Len = commands[index + 4];
        const pixels32 = new Uint32Array(pixels32Len);
        const pixels = new Uint8ClampedArray(pixels32.buffer);
        pixels32.set(commands.slice(index + 5, index + 5 + pixels32Len));
        const sprite = {
          alphaType,
          width,
          height,
          pixels,
          pixels32,
        };
        addSprite(id, sprite);
        if (spritesToAddToSpritesheet > 0 && spritesheet !== null) {
          spritesheet.sprites.push(sprite);
          spritesToAddToSpritesheet--;
          if (spritesToAddToSpritesheet === 0) {
            drawing?.preloadSpritesheet(spritesheet);
            spritesheet = null;
          }
        }
        break;
      }
      case DrawingCommandType.AddSpritesheet: {
        spritesToAddToSpritesheet = commands[index + 0];
        spritesheet = { sprites: [] };
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
        drawing = USE_HARD_DRAWING && request.canvases.length > 0
          ? new DrawingHard(
            request.width,
            request.height,
            request.canvases,
            (w, h) => new OffscreenCanvas(w, h),
            (result: DrawingDoneResult) => {
              sendResponse({
                type: "result",
                result,
              });
            },
          )
          : new DrawingSoft(
            request.width,
            request.height,
            request.canvases,
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
  drawing?.commit();
};

sendResponse({ type: "ready" });

console.log("Drawing Worker Started");
