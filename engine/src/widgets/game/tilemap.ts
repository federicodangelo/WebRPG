import { Tilemap, DrawContext } from "../../types.ts";
import { BaseWidget } from "../widget.ts";

export class TilemapWidget extends BaseWidget {
  public readonly tilemap: Tilemap;
  public readonly tiles: number[][];
  public readonly tilesWidth: number;
  public readonly tilesHeight: number;

  constructor(
    tilemap: Tilemap,
    tilesWidth: number,
    tilesHeight: number,
    defaultTileIndex: number = 0,
  ) {
    super();
    this.tilemap = tilemap;
    this.tilesWidth = tilesWidth;
    this.tilesHeight = tilesHeight;
    this.tiles = [];
    for (let y = 0; y < tilesHeight; y++) {
      const row = [];
      for (let x = 0; x < tilesWidth; x++) {
        row.push(defaultTileIndex);
      }
      this.tiles.push(row);
    }
    this.width = tilemap.tileWidth * tilesWidth;
    this.height = tilemap.tileHeight * tilesHeight;
  }

  public setTileIndex(x: number, y: number, index: number) {
    if (x < 0 || y < 0 || x >= this.tilesWidth || y >= this.tilesHeight) return;
    this.tiles[y][x] = index;
  }

  public getTileIndex(x: number, y: number) {
    return this.tiles[y][x];
  }

  public getTile(x: number, y: number) {
    return this.tilemap.tiles[this.getTileIndex(x, y)];
  }

  public getTileId(x: number, y: number) {
    return this.getTile(x, y).id;
  }

  drawSelf(context: DrawContext) {
    const tilemap = this.tilemap;
    const tiles = this.tiles;
    context.tilemap(0, 0, tilemap, tiles);
  }
}
