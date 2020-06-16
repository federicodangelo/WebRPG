import {
  Assets,
  Animation,
  Tilemap,
  Tile,
  Font,
  TileSetType,
  Tilemaps,
  AlphaType,
  Animations,
  Point,
  UPDATE_FPS,
} from "engine/types.ts";

type TileJson = {
  index?: number;
  x?: number;
  y?: number;
};

type TilemapJson = {
  filename: string;
  size: string;
  tiles?: Record<string, TileJson>;
};

type TerrainJson = TileJson & {
  specialTransitions?: Record<string, TerrainJson>;
};

type TerrainsJson = TilemapJson & {
  terrains: Record<string, TerrainJson>;
};

type AvatarJson = TilemapJson;

type AnimationJson = {
  tilemap: string;
  frames?: number[];
  framesRange?: number[];
  fps: number;
  loops?: boolean;
};

type AssetsJson = {
  defaultFont: string;
  fonts: Record<string, TilemapJson>;
  tilemaps: Record<string, TilemapJson>;
  animations: Record<string, AnimationJson>;
  terrains: TerrainsJson;
  avatars: Record<string, AvatarJson>;
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
    widthInTiles: imageWidthInTiles,
    heightInTiles: imageHeightInTiles,
    getTile: (id) => tilesById.get(id) as Tile,
    getTileByXY: (x, y) => tiles[y * imageWidthInTiles + x],
    getTileIndexByXY: (x, y) => y * imageWidthInTiles + x,
    getTileXYByIndex: (index) =>
      new Point(
        index % imageWidthInTiles,
        Math.trunc(index / imageWidthInTiles),
      ),
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
      const hasAlphaSolid = pixels32.every((x) =>
        ((x >> 24) & 0xff) == 255 || ((x >> 24) & 0xff) == 0
      );

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
        alphaType: hasAlpha
          ? hasAlphaSolid ? AlphaType.Solid : AlphaType.Alpha
          : AlphaType.None,
      };

      tiles.push(tile);
      index++;
    }
  }

  if (json.tiles) {
    for (const tileId in json.tiles) {
      const tileJson = json.tiles[tileId];
      const index = tileJson.index !== undefined
        ? tileJson.index
        : tilemap.getTileIndexByXY(tileJson.x || 0, tileJson.y || 0);
      setTileId(index, tileId);
    }
  }

  return tilemap;
}

function loadTerrain(
  terrainId: string,
  terrainJson: TerrainJson,
  tilemap: Tilemap,
) {
  const tiles = tilemap.tiles;
  const tilesById = tilemap.tilesById;

  const setTileId = (index: number, id: string) => {
    tiles[index].id = id;
    tilesById.set(id, tiles[index]);
  };

  const imageWidthInTiles = tilemap.widthInTiles;

  // Each terrain has this shape:
  //
  // +-----------+-----------+-----------+
  // |           |           |           |
  // |   deco1   |  hole-br  |  hole-bl  |
  // |           |          /|\          |
  // +-----------+-----------+-----------+
  // |           |          \|/          |
  // |   deco2   |  hole-tr  |  hole-tl  |
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

  const index = terrainJson.index !== undefined
    ? terrainJson.index
    : tilemap.getTileIndexByXY(terrainJson.x || 0, terrainJson.y || 0);

  const { x, y } = tilemap.getTileXYByIndex(index);

  const getTileIndex = (dx: number, dy: number) => {
    return tilemap.getTileIndexByXY(x + dx, y + dy);
  };

  const deco1 = getTileIndex(0, 0);
  const deco2 = getTileIndex(0, 1);

  setTileId(deco1, terrainId + "-deco1");
  setTileId(deco2, terrainId + "-deco2");

  const hole_br = getTileIndex(1, 0);
  const hole_bl = getTileIndex(2, 0);
  const hole_tr = getTileIndex(1, 1);
  const hole_tl = getTileIndex(2, 1);

  setTileId(hole_br, terrainId + "-hole-br");
  setTileId(hole_bl, terrainId + "-hole-bl");
  setTileId(hole_tr, terrainId + "-hole-tr");
  setTileId(hole_tl, terrainId + "-hole-tl");

  const topLeft = getTileIndex(0, 2);
  const top = getTileIndex(1, 2);
  const topRight = getTileIndex(2, 2);
  const left = getTileIndex(0, 3);
  const center = getTileIndex(1, 3);
  const right = getTileIndex(2, 3);
  const bottomLeft = getTileIndex(0, 4);
  const bottom = getTileIndex(1, 4);
  const bottomRight = getTileIndex(2, 4);

  setTileId(topLeft, terrainId + "-top-left");
  setTileId(top, terrainId + "-top");
  setTileId(topRight, terrainId + "-top-right");
  setTileId(left, terrainId + "-left");
  setTileId(center, terrainId + "-center");
  setTileId(right, terrainId + "-right");
  setTileId(bottomLeft, terrainId + "-bottom-left");
  setTileId(bottom, terrainId + "-bottom");
  setTileId(bottomRight, terrainId + "-bottom-left");

  const center2 = getTileIndex(0, 5);
  const center3 = getTileIndex(1, 5);
  const center4 = getTileIndex(2, 5);

  setTileId(center2, terrainId + "-center2");
  setTileId(center3, terrainId + "-center3");
  setTileId(center4, terrainId + "-center4");
}

function loadAvatar(
  avatarId: string,
  avatarJson: AvatarJson,
  tilemap: Tilemap,
  animations: Animations,
) {
  const addAnimation = (
    id: string,
    y: number,
    fromX: number,
    toX: number,
    loops = true,
    delayInUpdates = 3,
  ) => {
    const tiles: Tile[] = [];
    for (let x = fromX; x <= toX; x++) {
      tiles.push(tilemap.getTileByXY(x, y));
    }

    const animation: Animation = {
      id,
      tiles,
      delayInUpdates: delayInUpdates | 0,
      loops,
    };

    animations.set(id, animation);
  };

  addAnimation(avatarId + "-up", 8, 0, 0);
  addAnimation(avatarId + "-left", 9, 0, 0);
  addAnimation(avatarId + "-down", 10, 0, 0);
  addAnimation(avatarId + "-right", 11, 0, 0);

  addAnimation(avatarId + "-up-walking", 8, 1, 8);
  addAnimation(avatarId + "-left-walking", 9, 1, 8);
  addAnimation(avatarId + "-down-walking", 10, 1, 8);
  addAnimation(avatarId + "-right-walking", 11, 1, 8);

  addAnimation(avatarId + "-up-cast", 0, 0, 6, false);
  addAnimation(avatarId + "-left-cast", 1, 0, 6, false);
  addAnimation(avatarId + "-down-cast", 2, 0, 6, false);
  addAnimation(avatarId + "-right-cast", 3, 0, 6, false);

  addAnimation(avatarId + "-up-thrust", 4, 0, 7, false);
  addAnimation(avatarId + "-left-thrust", 5, 0, 7, false);
  addAnimation(avatarId + "-down-thrust", 6, 0, 7, false);
  addAnimation(avatarId + "-right-thrust", 7, 0, 7, false);

  addAnimation(avatarId + "-up-slash", 12, 0, 5, false);
  addAnimation(avatarId + "-left-slash", 13, 0, 5, false);
  addAnimation(avatarId + "-down-slash", 14, 0, 5, false);
  addAnimation(avatarId + "-right-slash", 15, 0, 5, false);

  addAnimation(avatarId + "-up-shoot", 16, 0, 12, false, 75);
  addAnimation(avatarId + "-left-shoot", 17, 0, 12, false, 75);
  addAnimation(avatarId + "-down-shoot", 18, 0, 12, false, 75);
  addAnimation(avatarId + "-right-shoot", 19, 0, 12, false, 75);

  addAnimation(avatarId + "-up-hurt", 20, 0, 5, false);
  addAnimation(avatarId + "-left-hurt", 20, 0, 5, false);
  addAnimation(avatarId + "-down-hurt", 20, 0, 5, false);
  addAnimation(avatarId + "-right-hurt", 20, 0, 5, false);
}

function loadAnimation(
  id: string,
  json: AnimationJson,
  tilemaps: Tilemaps,
): Animation {
  const delayInUpdates = json.fps > 0 ? Math.ceil(UPDATE_FPS / json.fps) : 0;

  const tiles: Tile[] = [];

  if (json.frames) {
    tiles.push(...json.frames.map(
      (f) => (tilemaps.get(json.tilemap) as Tilemap).tiles[f],
    ));
  }

  if (json.framesRange) {
    const from = json.framesRange[0];
    const to = json.framesRange[1];
    for (let i = from; i <= to; i++) {
      tiles.push((tilemaps.get(json.tilemap) as Tilemap).tiles[i]);
    }
  }

  return {
    id,
    delayInUpdates,
    tiles,
    loops: !!json.loops,
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

  const terrainTilemap = await loadTilemap(
    "terrain",
    assetsJson.terrains,
    "color",
  );
  tilemaps.set("terrain", terrainTilemap);
  for (const terrainId in assetsJson.terrains.terrains) {
    const terrainJson = assetsJson.terrains.terrains[terrainId];
    loadTerrain(
      terrainId,
      terrainJson,
      terrainTilemap,
    );
  }

  for (const avatarId in assetsJson.avatars) {
    const avatarJson = assetsJson.avatars[avatarId];

    const tilemap = await loadTilemap(avatarId, avatarJson, "color");

    tilemaps.set(avatarId, tilemap);

    loadAvatar(avatarId, avatarJson, tilemap, animations);
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
