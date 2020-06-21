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

export const enum MouseScrollType {
  None,
  Horizontal,
  Vertical,
}

export class ScrollableContainerWidget extends BaseWidgetContainer {
  public backColor: Color = FixedColor.Black;

  public mouseScrollType: MouseScrollType = MouseScrollType.None;
  private _mouseScrollLimits = { from: -9999999, to: 9999999 };
  public get mouseScrollLimits() {
    return this._mouseScrollLimits;
  }
  public set mouseScrollLimits(val: { from: number; to: number }) {
    this._mouseScrollLimits = val;

    switch (this.mouseScrollType) {
      case MouseScrollType.Horizontal:
        this.setOffset(
          Math.max(
            Math.min(this.offsetX, this.mouseScrollLimits.to),
            this.mouseScrollLimits.from,
          ),
          this.offsetY,
        );
        break;
      case MouseScrollType.Vertical:
        this.setOffset(
          this.offsetX,
          Math.max(
            Math.min(this.offsetY, this.mouseScrollLimits.to),
            this.mouseScrollLimits.from,
          ),
        );
        break;
    }
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

      if (Math.abs(dx) > bbox.width || Math.abs(dy) > bbox.height) {
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
  private scrollingWithMouse = false;

  public getAt(x: number, y: number): Widget | null {
    if (this.mouseScrollType === MouseScrollType.None) return super.getAt(x, y);

    if (!this.solid) return null;
    if (x < 0 || y < 0 || x > this.width || y > this.height) return null;
    return this.selfSolid ? this : null;
  }

  private lastChildUnderMouse: Widget | null = null;

  mouse(e: EngineMouseEvent) {
    if (this.mouseScrollType === MouseScrollType.None) {
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
        this.scrollingWithMouse = false;
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
          const deltaY = e.y - this.downPos.y;
          let newOffsetX = this._offsetX;
          let newOffsetY = this._offsetY;

          if (
            !this.scrollingWithMouse &&
            (this.mouseScrollType === MouseScrollType.Horizontal &&
                Math.abs(deltaX) > 16 ||
              this.mouseScrollType === MouseScrollType.Vertical &&
                Math.abs(deltaY) > 16)
          ) {
            if (this.lastChildUnderMouse !== null) {
              this.lastChildUnderMouse.mouse({
                type: "up-out",
                x: this.lastChildUnderMouse.width / 2,
                y: this.lastChildUnderMouse.height / 2,
              });
              this.lastChildUnderMouse = null;
            }
            this.scrollingWithMouse = true;
          }

          if (this.scrollingWithMouse) {
            switch (this.mouseScrollType) {
              case MouseScrollType.Horizontal:
                newOffsetX = Math.max(
                  Math.min(
                    this.downOffset.x + deltaX,
                    this.mouseScrollLimits.to,
                  ),
                  this.mouseScrollLimits.from,
                );
                break;
              case MouseScrollType.Vertical:
                newOffsetY = Math.max(
                  Math.min(
                    this.downOffset.y + deltaY,
                    this.mouseScrollLimits.to,
                  ),
                  this.mouseScrollLimits.from,
                );
                break;
            }
            this.setOffset(
              newOffsetX,
              newOffsetY,
            );
          }
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
            if (this.lastChildUnderMouse.parent === this) {
              this.onChildTapped(this.lastChildUnderMouse);
            }
            this.lastChildUnderMouse = null;
          }
          this.down = false;
        }
        break;
    }
  }

  protected onChildTapped(children: Widget) {
  }
}
