import {
  Assets,
  Animation,
  Tilemap,
  Tile,
  Font,
  TileSetType,
  Tilemaps,
} from "../../../engine/src/types.ts";

type TerrainJson = {
  index: number;
  specialTransitions?: Record<string, TerrainJson>;
};

type TileJson = {
  index: number;
};

type TilemapJson = {
  filename: string;
  size: string;
  tiles?: Record<string, TileJson>;
  terrains?: Record<string, TerrainJson>;
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
  type: TileSetType,
): Promise<Tilemap> {
  const image = await loadImage(json.filename);

  const tileWidth = parseInt(json.size.split("x")[0]);
  const tileHeight = parseInt(json.size.split("x")[1]);
  const imageWidthInTiles = image.width / tileWidth;
  const imageHeightInTiles = image.height / tileHeight;

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
    getTile: (id) => tilesById.get(id) as Tile,
  };

  const setTileId = (index: number, id: string) => {
    tiles[index].id = id;
    tilesById.set(id, tiles[index]);
  };

  let index = 0;

  for (let y = 0; y < imageHeightInTiles; y++) {
    for (let x = 0; x < imageWidthInTiles; x++) {
      const pixels = ctx.getImageData(
        x * tileWidth,
        y * tileHeight,
        tileWidth,
        tileHeight,
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

  if (json.tiles) {
    for (const tileId in json.tiles) {
      const tileJson = json.tiles[tileId];
      setTileId(tileJson.index, tileId);
    }
  }

  if (json.terrains) {
    // Each terrain has this shape:
    //
    // +-----------+-----------+-----------+
    // |           |           |           |
    // |   deco1   |  hole-br  |  hole-bl  |
    // |           |          /|\          |
    // +-----------+-----------+-----------+
    // |           |          \|/          |
    // |   deco2   |  hole-tr  |  hole-tp  |
    // |           |           |           |
    // +-----------+-----------+-----------+
    // |           |           |           |
    // |  top-left |    top    | top-right |
    // |         /-|-----------|-\         |
    // +-----------+-----------+-----------+
    // |         | |           | |         |
    // |   left  | |  center   | |  right  |
    // |         | |           | |         |
    // +-----------+-----------+-----------+
    // |         \-|-----------|-/         |
    // |  bottom-  |   bottom  |  bottom-  |
    // |   left    |           |   right   |
    // +-----------+-----------+-----------+
    // |           |           |           |
    // |  center2  |  center3  |  center4  |
    // |           |           |           |
    // +-----------+-----------+-----------+

    for (const terrainId in json.terrains) {
      const terrainJson = json.terrains[terrainId];
      const index = terrainJson.index;

      const deco1 = index;
      const deco2 = deco1 + imageWidthInTiles;

      setTileId(deco1, terrainId + "-deco1");
      setTileId(deco2, terrainId + "-deco2");

      const hole_br = index + 1;
      const hole_bl = index + 2;
      const hole_tr = hole_br + imageWidthInTiles;
      const hole_tp = hole_bl + imageWidthInTiles;

      setTileId(hole_br, terrainId + "-hole-br");
      setTileId(hole_bl, terrainId + "-hole-bl");
      setTileId(hole_tr, terrainId + "-hole-tr");
      setTileId(hole_tp, terrainId + "-hole-tp");

      const topLeft = index + imageWidthInTiles * 2;
      const top = topLeft + 1;
      const topRight = topLeft + 2;
      const left = index + imageWidthInTiles * 3;
      const center = left + 1;
      const right = center + 1;
      const bottomLeft = index + imageWidthInTiles * 4;
      const bottom = bottomLeft + 1;
      const bottomRight = bottom + 1;

      setTileId(topLeft, terrainId + "-top-left");
      setTileId(top, terrainId + "-top");
      setTileId(topRight, terrainId + "-top-right");
      setTileId(left, terrainId + "-left");
      setTileId(center, terrainId + "-center");
      setTileId(right, terrainId + "-right");
      setTileId(bottomLeft, terrainId + "-bottom-left");
      setTileId(bottom, terrainId + "-bottom");
      setTileId(bottomRight, terrainId + "-bottom-left");

      const center2 = index + imageWidthInTiles * 5;
      const center3 = center2 + 1;
      const center4 = center3 + 1;

      setTileId(center2, terrainId + "-center2");
      setTileId(center3, terrainId + "-center3");
      setTileId(center4, terrainId + "-center4");
    }
  }

  return tilemap;
}

function loadAnimation(
  id: string,
  json: AnimationJson,
  tilemaps: Tilemaps,
): Animation {
  const delay = json.fps > 0 ? 1000 / json.fps : 0;

  const tiles = json.frames.map(
    (f) => (tilemaps.get(json.tilemap) as Tilemap).tiles[f],
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
    getTile: (tilemapDotTile) =>
      (tilemaps.get(tilemapDotTile.split(".")[0]) as Tilemap).getTile(
        tilemapDotTile.split(".")[1],
      ),
  };

  return assets;
}
