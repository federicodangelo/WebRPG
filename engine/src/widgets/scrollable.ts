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
  private _mouseHorizontalScrollLimits = { fromX: -9999999, toX: 9999999 };
  public get mouseHorizontalScrollLimits() {
    return this._mouseHorizontalScrollLimits;
  }
  public set mouseHorizontalScrollLimits(val: { fromX: number; toX: number }) {
    this._mouseHorizontalScrollLimits = val;
    this.setOffset(
      Math.max(
        Math.min(this.offsetX, this.mouseHorizontalScrollLimits.toX),
        this.mouseHorizontalScrollLimits.fromX,
      ),
      this.offsetY,
    );
  }

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

  public getAt(x: number, y: number): Widget | null {
    if (!this.mouseHorizontalScrollEnabled) return super.getAt(x, y);

    if (!this.solid) return null;
    if (x < 0 || y < 0 || x > this.width || y > this.height) return null;
    return this.selfSolid ? this : null;
  }

  private lastChildUnderMouse: Widget | null = null;

  mouse(e: EngineMouseEvent) {
    if (!this.mouseHorizontalScrollEnabled) {
      super.mouse(e);
      return;
    }

    let childUnderMouse = super.getAt(e.x, e.y);
    if (childUnderMouse === this) {
      childUnderMouse = null;
    }

    switch (e.type) {
      case "down":
        this.down = true;
        this.downPos.set(e.x, e.y);
        this.downOffset.set(this.offsetX, this.offsetY);
        if (childUnderMouse !== null) {
          this.lastChildUnderMouse = childUnderMouse;
          this.lastChildUnderMouse.mouse({
            type: "down",
            x: this.lastChildUnderMouse.width / 2,
            y: this.lastChildUnderMouse.height / 2,
          });
        }
        break;
      case "move":
        if (this.down) {
          const deltaX = e.x - this.downPos.x;
          if (Math.abs(deltaX) > 16 && this.lastChildUnderMouse !== null) {
            this.lastChildUnderMouse.mouse({
              type: "up-out",
              x: this.lastChildUnderMouse.width / 2,
              y: this.lastChildUnderMouse.height / 2,
            });
            this.lastChildUnderMouse = null;
          }
          const newOffsetX = this.downOffset.x + deltaX;
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
        if (this.down) {
          if (this.lastChildUnderMouse !== null) {
            this.lastChildUnderMouse.mouse({
              type: (this.lastChildUnderMouse === childUnderMouse &&
                e.type === "up")
                ? "up"
                : "up-out",
              x: this.lastChildUnderMouse.width / 2,
              y: this.lastChildUnderMouse.height / 2,
            });
            this.lastChildUnderMouse = null;
          }
          this.down = false;
        }
        break;
    }
  }
}
