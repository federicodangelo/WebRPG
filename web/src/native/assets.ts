import {
  Assets,
  Animation,
  Tilemap,
  Tile,
  Font,
  TileSetType,
  Tilemaps,
} from "../../../engine/src/types.ts";

type TilemapJson = {
  filename: string;
  size: string;
};

type AnimationJson = {
  tilemap: string;
  frames: number[];
  fps: number;
};

type AssetsJson = {
  defaultFont: string;
  fonts: Record<string, TilemapJson>;
  tilemaps: Record<string, TilemapJson>;
  animations: Record<string, AnimationJson>;
};

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = "res/" + src;
  });
}

async function loadTilemap(
  id: string,
  json: TilemapJson,
  type: TileSetType
): Promise<Tilemap> {
  const image = await loadImage(json.filename);

  const tileWidth = parseInt(json.size.split("x")[0]);
  const tileHeight = parseInt(json.size.split("x")[1]);

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.drawImage(image, 0, 0);

  const tiles: Tile[] = [];
  const tilesById = new Map<string, Tile>();

  const tilemap: Tilemap = {
    id,
    tileWidth,
    tileHeight,
    tiles,
    tilesById,
    type,
  };

  let index = 0;

  for (let y = 0; y < image.height / tileHeight; y++) {
    for (let x = 0; x < image.width / tileWidth; x++) {
      const pixels = ctx.getImageData(
        x * tileWidth,
        y * tileHeight,
        tileWidth,
        tileHeight
      ).data;

      const pixels32 = new Uint32Array(pixels.buffer);
      const hasAlpha = pixels32.some((x) => ((x >> 24) & 0xff) != 255);

      if (type === "blackandwhite") {
        for (let i = 0; i < pixels32.length; i++) {
          pixels32[i] = (pixels32[i] & 0xffffff) === 0 ? 0 : 1;
        }
      }

      const tile: Tile = {
        id: "",
        height: tileHeight,
        width: tileWidth,
        index,
        pixels,
        pixels32,
        tilemap,
        hasAlpha,
      };

      tiles.push(tile);
      index++;
    }
  }

  return tilemap;
}

function loadAnimation(
  id: string,
  json: AnimationJson,
  tilemaps: Tilemaps
): Animation {
  const delay = json.fps > 0 ? 1000 / json.fps : 0;

  const tiles = json.frames.map(
    (f) => (tilemaps.get(json.tilemap) as Tilemap).tiles[f]
  );
  const sequence: number[] = [];
  for (let i = 0; i < tiles.length; i++) sequence.push(i);

  return {
    id,
    delay,
    tiles,
    sequence,
  };
}

export async function initAssets(): Promise<Assets> {
  const fonts = new Map<string, Font>();
  const animations = new Map<string, Animation>();
  const tilemaps = new Map<string, Tilemap>();

  const assetsJsonTxt = await (await fetch("res/assets.json")).text();
  const assetsJson = JSON.parse(assetsJsonTxt) as AssetsJson;

  for (const tilemapId in assetsJson.tilemaps) {
    const tilemapJson = assetsJson.tilemaps[tilemapId];

    const tilemap = await loadTilemap(tilemapId, tilemapJson, "color");

    tilemaps.set(tilemapId, tilemap);
  }

  for (const fontId in assetsJson.fonts) {
    const tilemapJson = assetsJson.fonts[fontId];

    const font = await loadTilemap(fontId, tilemapJson, "blackandwhite");

    fonts.set(fontId, font);
  }

  for (const animationId in assetsJson.animations) {
    const animationJson = assetsJson.animations[animationId];

    const animation = loadAnimation(animationId, animationJson, tilemaps);

    animations.set(animationId, animation);
  }

  const assets: Assets = {
    fonts,
    animations,
    tilemaps,
    defaultFont: fonts.get(assetsJson.defaultFont) as Font,
    getAnimation: (id) => animations.get(id) as Animation,
    getFont: (id) => fonts.get(id) as Font,
    getTilemap: (id) => tilemaps.get(id) as Tilemap,
  };

  return assets;
}
