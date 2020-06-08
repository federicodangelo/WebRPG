import { Widget, Tilemap, DrawContext } from "../types.ts";
import { ScrollableContainerWidget } from "./scrollable.ts";

export class ScrollableTilemapContainerWidget
  extends ScrollableContainerWidget {
  public floorTilemap: Tilemap | null = null;
  public floorTiles: number[][] | null = null;

  public onChildrenAdded(child: Widget) {
    super.onChildrenAdded(child);
    this.updateChildrenIndex(child);
  }

  public onChildrenTransformChanged(child: Widget) {
    super.onChildrenTransformChanged(child);
    this.updateChildrenIndex(child);
  }

  drawSelf(context: DrawContext) {
    const tilemap = this.floorTilemap;
    const tiles = this.floorTiles;
    if (tilemap !== null && tiles !== null) {
      //Draw tilemap
      context.tilemap(this.innerX, this.innerY, tilemap, tiles);

      //Draw "outside" tilemap
      const tilemapHeight = tiles.length * tilemap.tileHeight;
      const tilemapWidth = tiles.length > 0
        ? tiles[0].length * tilemap.tileWidth
        : 0;

      context.textColor(this.foreColor, this.backColor);

      //Left
      context.fillChar(
        this.font,
        this.innerX + tilemapWidth,
        this.innerY + 0,
        9999999,
        tilemapHeight,
        this.fillChar,
      );

      //Bottom
      context.fillChar(
        this.font,
        this.innerX + 0,
        this.innerY + tilemapHeight,
        tilemapWidth,
        9999999,
        this.fillChar,
      );

      //Bottom right
      context.fillChar(
        this.font,
        this.innerX + tilemapWidth,
        this.innerY + tilemapHeight,
        9999999,
        9999999,
        this.fillChar,
      );
    } else {
      super.drawSelf(context);
    }
  }

  private updateChildrenIndex(child: Widget) {
    const children = this._children;
    let idx = children.indexOf(child);

    if (idx >= 0) {
      const prevOk = idx == 0 || children[idx - 1].visibleY <= child.visibleY;
      const nextOk = idx == children.length - 1 ||
        children[idx + 1].visibleY >= child.visibleY;

      if (!prevOk) {
        while (idx > 0 && children[idx - 1].visibleY > child.visibleY) {
          const tmp = children[idx - 1];
          children[idx - 1] = children[idx];
          children[idx] = tmp;
          idx--;
        }
      } else if (!nextOk) {
        while (
          idx < children.length - 1 &&
          children[idx + 1].visibleY < child.visibleY
        ) {
          const tmp = children[idx + 1];
          children[idx + 1] = children[idx];
          children[idx] = tmp;
          idx++;
        }
      }
    }
  }
}
