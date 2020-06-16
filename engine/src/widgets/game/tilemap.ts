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

  drawSelf(context: DrawContext) {
    const tilemap = this.tilemap;
    const tiles = this.tiles;
    //Draw tilemap
    context.tilemap(0, 0, tilemap, tiles);
  }
}
