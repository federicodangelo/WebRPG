import { BaseWidget } from "./widget.ts";
import { DrawContext, Tile, FONT_SIZE } from "../types.ts";

export class TileWidget extends BaseWidget {
  public tile: Tile;

  constructor(tile: Tile) {
    super();
    this.tile = tile;
    this.width = tile.width;
    this.height = tile.height;
  }

  protected drawSelf(context: DrawContext) {
    context.tile(this.x, this.y, this.tile);
  }
}
