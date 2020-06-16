import {
  FixedColor,
  Color,
  DrawContext,
  EngineContext,
  Widget,
  Rect,
  EngineMouseEvent,
  Point,
} from "../types.ts";
import { BaseWidgetContainer } from "./widget-container.ts";

export class ScrollableContainerWidget extends BaseWidgetContainer {
  public backColor: Color = FixedColor.Black;

  public mouseHorizontalScrollEnabled = false;
  public mouseHorizontalScrollLimits = { fromX: -9999999, toX: 9999999 };

  private _offsetX: number = 0;
  private _offsetY: number = 0;

  public get offsetX() {
    return this._offsetX;
  }

  public get offsetY() {
    return this._offsetY;
  }

  public get innerX() {
    return this._offsetX;
  }

  public get innerY() {
    return this._offsetY;
  }

  public setOffset(offsetX: number, offsetY: number, onNextDraw = true) {
    offsetX = offsetX | 0;
    offsetY = offsetY | 0;

    if (offsetX === this._offsetX && offsetY === this._offsetY) return;

    if (!onNextDraw) {
      this._offsetX = offsetX;
      this._offsetY = offsetY;
      this.invalidate();
      return;
    }

    this.engine?.onNextDrawNative(this.layer, ({ context, invalidateRect }) => {
      const dx = offsetX - this.offsetX;
      const dy = offsetY - this.offsetY;
      if (dx === 0 && dy === 0) return;

      const bbox = this.getBoundingBox();

      if (Math.abs(dx) > bbox.width || Math.abs(dy) < bbox.height) {
        //Scroll delta too big, nothing to reuse from the screen.. just invalidate..
        this._offsetX = offsetX;
        this._offsetY = offsetY;
        this.invalidate();
        return;
      }

      this._offsetX = offsetX;
      this._offsetY = offsetY;

      context.scrollRect(
        bbox.x,
        bbox.y,
        bbox.width,
        bbox.height,
        dx,
        dy,
      );

      if (dy > 0) {
        invalidateRect(
          new Rect(bbox.x, bbox.y, bbox.width, dy),
        );
      } else if (dy < 0) {
        invalidateRect(
          new Rect(bbox.x, bbox.y + bbox.height + dy, bbox.width, -dy),
        );
      }

      if (dx > 0) {
        invalidateRect(
          new Rect(bbox.x, bbox.y, dx, bbox.height),
        );
      } else if (dx < 0) {
        invalidateRect(
          new Rect(bbox.x + bbox.width + dx, bbox.y, -dx, bbox.height),
        );
      }
    });
  }

  preDrawChildren(context: EngineContext) {
    context.pushTransform(this.innerX, this.innerY);
  }

  postDrawChildren(context: EngineContext) {
    context.popTransform();
  }

  drawSelf(context: DrawContext) {
    context.fillRect(0, 0, this.width, this.height, this.backColor);
  }

  private down = false;
  private downPos = new Point();
  private downOffset = new Point();

  mouse(e: EngineMouseEvent) {
    if (!this.mouseHorizontalScrollEnabled) {
      super.mouse(e);
      return;
    }

    switch (e.type) {
      case "down":
        this.down = true;
        this.downPos.set(e.x, e.y);
        this.downOffset.set(this.offsetX, this.offsetY);
        break;
      case "move":
        if (this.down) {
          const newOffsetX = this.downOffset.x + e.x - this.downPos.x;
          this.setOffset(
            Math.max(
              Math.min(newOffsetX, this.mouseHorizontalScrollLimits.toX),
              this.mouseHorizontalScrollLimits.fromX,
            ),
            this.downOffset.y,
          );
        }
        break;
      case "up":
      case "up-out":
        this.down = false;
        break;
    }
  }
}
