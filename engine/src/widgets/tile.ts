import { BaseWidget } from "./widget.ts";
import { DrawContext, Tile } from "../types.ts";

export class TileWidget extends BaseWidget {
  public tile: Tile;

  constructor(tile: Tile) {
    super();
    this.tile = tile;
    this.width = this.height = 1;
  }

  protected drawSelf(context: DrawContext) {
    context.tile(this.x, this.y, this.tile);
  }
}
