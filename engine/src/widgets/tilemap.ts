import { Widget, Tilemap, DrawContext } from "../types.ts";
import { ScrollableContainerWidget } from "./scrollable.ts";

export class ScrollableTilemapContainerWidget extends ScrollableContainerWidget {
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
    super.drawSelf(context);
    const tilemap = this.floorTilemap;
    const tiles = this.floorTiles;
    if (tilemap !== null && tiles !== null) {
      for (let y = 0; y < tiles.length; y++) {
        const row = tiles[y];
        if (
          !context.isVisible(
            this.innerX + 0,
            this.innerY + y * tilemap.tileHeight,
            row.length * tilemap.tileWidth,
            tilemap.tileHeight
          )
        ) {
          continue;
        }

        for (let x = 0; x < row.length; x++) {
          context.tile(
            this.innerX + x * tilemap.tileWidth,
            this.innerY + y * tilemap.tileHeight,
            tilemap.tiles[row[x]]
          );
        }
      }
    }
  }

  private updateChildrenIndex(child: Widget) {
    const children = this._children;
    let idx = children.indexOf(child);

    if (idx >= 0) {
      const prevOk = idx == 0 || children[idx - 1].visibleY <= child.visibleY;
      const nextOk =
        idx == children.length - 1 ||
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
