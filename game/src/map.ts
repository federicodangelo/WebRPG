import { ScrollableTilemapContainerWidget } from "../../engine/src/widgets/tilemap.ts";
import { Assets, Rect } from "../../engine/src/types.ts";
import { TileWidget } from "../../engine/src/widgets/tile.ts";

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIntervalInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min));
}

const MAP_SIZE = 512;

const DECOS_COUNT = 1024;
const ALT_TERRAINS_COUNT = 256;
const ALT_TERRAINS_MIN_SIZE = 8;
const ALT_TERRAINS_MAX_SIZE = 16;

const mainTerrain = "grass";

const altTerrains: string[] = [
  "water",
  "dirt",
  "dirt2",
  "dirt3",
  "rock",
  "grass2",
  "grass3",
  "sand",
  "snow",
];

function randomDecoTile(terrainId: string) {
  if (Math.random() > 0.5) {
    return terrainId + "-deco1";
  }

  return terrainId + "-deco2";
}

function randomCenterTile(terrainId: string) {
  if (Math.random() > 0.1) {
    return terrainId + "-center";
  }

  if (Math.random() > 0.5) {
    return terrainId + "-center2";
  }

  return terrainId + "-center3";
}

export default function initMap(
  mapContainer: ScrollableTilemapContainerWidget,
  assets: Assets,
) {
  const addTile = (x: number, y: number, id: string) => {
    const t = new TileWidget(
      assets.getTile(id),
    );
    t.layer = -1;
    t.x = x * t.tile.width;
    t.y = y * t.tile.height;
    t.parent = mapContainer;
  };

  const floorTilemap = assets.getTilemap("terrain");
  const floorTiles: number[][] = [];

  mapContainer.floorTilemap = floorTilemap;
  mapContainer.floorTiles = floorTiles;

  const getTerrainId = (x: number, y: number) => {
    return floorTilemap.tiles[floorTiles[y][x]].id.split("-")[0];
  };

  for (let y = 0; y < MAP_SIZE; y++) {
    const row: number[] = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      row.push(
        mapContainer.floorTilemap.getTile(randomCenterTile(mainTerrain)).index,
      );
    }
    mapContainer.floorTiles.push(row);
  }

  const addAltTerrain = (
    terrainId: string,
    fx: number,
    fy: number,
    w: number,
    h: number,
  ) => {
    const tx = fx + w;
    const ty = fy + h;

    for (let y = fy; y < ty; y++) {
      for (let x = fx; x < tx; x++) {
        floorTiles[y][x] =
          floorTilemap.getTile(randomCenterTile(terrainId)).index;
      }
    }

    //Transition tiles
    for (let y = fy + 1; y < ty - 1; y++) {
      //Left
      addTile(fx, y, "terrain." + getTerrainId(fx - 1, y) + "-right");
      //Right
      addTile(tx - 1, y, "terrain." + getTerrainId(tx, y) + "-left");
    }

    for (let x = fx + 1; x < tx - 1; x++) {
      //Top
      addTile(x, fy, "terrain." + getTerrainId(x, fy - 1) + "-bottom");
      //Bottom
      addTile(x, ty - 1, "terrain." + getTerrainId(x, ty) + "-top");
    }

    addTile(fx, fy, "terrain." + getTerrainId(fx - 1, fy - 1) + "-hole-br");
    addTile(tx - 1, fy, "terrain." + getTerrainId(tx, fy - 1) + "-hole-bl");

    addTile(fx, ty - 1, "terrain." + getTerrainId(fx - 1, ty) + "-hole-tr");
    addTile(tx - 1, ty - 1, "terrain." + getTerrainId(tx, ty) + "-hole-tl");
  };

  const altTerrainsRects: Rect[] = [];
  const altTerrainsRectsOverflow: Rect[] = [];

  for (let i = 0; i < ALT_TERRAINS_COUNT; i++) {
    const w = randomIntervalInt(ALT_TERRAINS_MIN_SIZE, ALT_TERRAINS_MAX_SIZE);
    const h = randomIntervalInt(ALT_TERRAINS_MIN_SIZE, ALT_TERRAINS_MAX_SIZE);
    const terrainId = random(altTerrains);
    const fx = randomIntervalInt(1, MAP_SIZE - w - 1);
    const fy = randomIntervalInt(1, MAP_SIZE - h - 1);
    const r = new Rect(fx, fy, w, h);

    if (altTerrainsRectsOverflow.some((a) => a.intersects(r))) continue;

    addAltTerrain(terrainId, fx, fy, w, h);

    if (Math.random() > 0.5) {
      const nestedTerrainId = random(altTerrains);
      if (nestedTerrainId !== terrainId) {
        addAltTerrain(nestedTerrainId, fx + 2, fy + 2, w - 4, h - 4);
      }
    }

    altTerrainsRects.push(r);
    altTerrainsRectsOverflow.push(r.clone().expand(2));
  }

  for (let i = 0; i < DECOS_COUNT; i++) {
    const x = randomIntervalInt(0, MAP_SIZE);
    const y = randomIntervalInt(0, MAP_SIZE);

    if (
      altTerrainsRects.some((a) =>
        x == a.x || x == a.x1 || y == a.y || y == a.y1
      )
    ) {
      continue;
    }

    addTile(x, y, "terrain." + randomDecoTile(getTerrainId(x, y)));
  }
}
