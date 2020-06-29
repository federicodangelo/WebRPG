import {
  Widget,
  DrawContext,
  Rect,
} from "../../types.ts";
import { TilemapWidget } from "./tilemap.ts";
import { ScrollableContainerWidget } from "../scrollable.ts";

function compareChildren(c1: Widget, c2: Widget) {
  if (c1.sortingLayer === c2.sortingLayer) return c1.y - c2.y;
  return c1.sortingLayer - c2.sortingLayer;
}

export class ScrollableTilesContainerWidget extends ScrollableContainerWidget {
  private tilemaps: TilemapWidget[] = [];
  public readonly tilemapsBounds = new Rect();

  public addTilemap(tilemap: TilemapWidget) {
    tilemap.parent = this;
    this.tilemaps.push(tilemap);
    this.tilemapsBounds.union(new Rect(0, 0, tilemap.width, tilemap.height));
  }

  public onChildrenAdded(child: Widget) {
    super.onChildrenAdded(child);
    this.updateChildrenIndex(child);
  }

  public onChildrenTransformChanged(child: Widget) {
    super.onChildrenTransformChanged(child);
    this.updateChildrenIndex(child);
  }

  private updateChildrenIndex(child: Widget) {
    const children = this._children;
    let idx = children.indexOf(child);

    if (idx >= 0) {
      const prevOk = idx == 0 || compareChildren(children[idx - 1], child) <= 0;
      const nextOk = idx == children.length - 1 ||
        compareChildren(children[idx + 1], child) >= 0;

      if (!prevOk) {
        while (idx > 0 && compareChildren(children[idx - 1], child) > 0) {
          const tmp = children[idx - 1];
          children[idx - 1] = children[idx];
          children[idx] = tmp;
          idx--;
        }
      } else if (!nextOk) {
        while (
          idx < children.length - 1 &&
          compareChildren(children[idx + 1], child) < 0
        ) {
          const tmp = children[idx + 1];
          children[idx + 1] = children[idx];
          children[idx] = tmp;
          idx++;
        }
      }
    }
  }

  drawSelf(context: DrawContext) {
    //Clear background "outside" tilemap
    if (this.tilemapsBounds.width > 0 && this.tilemapsBounds.height > 0) {
      const tilemapHeight = this.tilemapsBounds.height;
      const tilemapWidth = this.tilemapsBounds.width;
      const FAR_FAR_AWAY = 9999999;

      //Top
      context.fillRect(
        this.innerX - FAR_FAR_AWAY,
        this.innerY - FAR_FAR_AWAY,
        FAR_FAR_AWAY + tilemapWidth + FAR_FAR_AWAY,
        FAR_FAR_AWAY,
        this.backColor,
      );

      //Bottom
      context.fillRect(
        this.innerX - FAR_FAR_AWAY,
        this.innerY + tilemapHeight,
        FAR_FAR_AWAY + tilemapWidth + FAR_FAR_AWAY,
        FAR_FAR_AWAY,
        this.backColor,
      );

      //Left
      context.fillRect(
        this.innerX - FAR_FAR_AWAY,
        this.innerY,
        FAR_FAR_AWAY,
        tilemapHeight,
        this.backColor,
      );

      //Right
      context.fillRect(
        this.innerX + tilemapWidth,
        this.innerY,
        FAR_FAR_AWAY,
        tilemapHeight,
        this.backColor,
      );
    } else {
      super.drawSelf(context);
    }
  }
}
