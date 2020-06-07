import {
  Widget,
  WidgetContainer,
  WidgetLayout,
  Engine,
  Rect,
  DrawContext,
  EngineContext,
} from "../types.ts";

export abstract class BaseWidget implements Widget {
  private _x: number = 0;
  private _y: number = 0;
  private _width: number = 0;
  private _height: number = 0;
  private _pivotX: number = 0;
  private _pivotY: number = 0;
  private _parent: WidgetContainer | null = null;
  private _engine: Engine | null = null;
  private _boundingBox: Rect = new Rect();

  public layout: WidgetLayout | null = null;

  public setLayout(layout: WidgetLayout | null) {
    this.layout = layout;
    return this;
  }

  public get engine() {
    return this._engine;
  }

  public set engine(val: Engine | null) {
    if (val !== this._engine) {
      this._engine = val;
    }
  }

  public get x() {
    return this._x;
  }

  public set x(v: number) {
    if (v !== this._x) {
      this.invalidate();
      this._x = v;
      this.invalidate();
    }
  }

  public get y() {
    return this._y;
  }

  public set y(v: number) {
    if (v !== this._y) {
      this.invalidate();
      this._y = v;
      this.invalidate();
    }
  }

  public get width() {
    return this._width;
  }

  public set width(v: number) {
    if (v !== this._width) {
      this.invalidate();
      this._width = v;
      this.invalidate();
    }
  }

  public get height() {
    return this._height;
  }

  public set height(v: number) {
    if (v !== this._height) {
      this.invalidate();
      this._height = v;
      this.invalidate();
    }
  }

  public get pivotX() {
    return this._pivotX;
  }

  public set pivotX(v: number) {
    if (v !== this._pivotX) {
      this.invalidate();
      this._pivotX = v;
      this.invalidate();
    }
  }

  public get pivotY() {
    return this._pivotY;
  }

  public set pivotY(v: number) {
    if (v !== this._pivotY) {
      this.invalidate();
      this._pivotY = v;
      this.invalidate();
    }
  }

  public get parent() {
    return this._parent;
  }

  public set parent(v: WidgetContainer | null) {
    if (v !== this._parent) {
      this.invalidate();
      if (this._parent !== null) {
        const index = this._parent.children.indexOf(this);
        if (index >= 0) this._parent.children.splice(index, 1);
      }
      this._parent = v;
      if (this._parent !== null) {
        this._parent.children.push(this);
        this.engine = this._parent.engine;
      } else {
        this.engine = null;
      }
      this.invalidate();
    }
  }

  public updateLayout(parentWidth: number, parentHeight: number): void {
    const layout = this.layout;
    if (layout !== null) {
      if (layout.heightPercent !== undefined) {
        this.height = Math.ceil(
          parentHeight * layout.heightPercent / 100,
        );
      }
      if (layout.widthPercent !== undefined) {
        this.width = Math.ceil(
          parentWidth * layout.widthPercent / 100,
        );
      }

      if (layout.customSizeFn !== undefined) {
        layout.customSizeFn(this, parentWidth, parentHeight);
      }

      if (layout.horizontalSpacingPercent !== undefined) {
        this.x = Math.floor(
          (parentWidth - this.width) * layout.horizontalSpacingPercent / 100,
        );
      }
      if (layout.verticalSpacingPercent !== undefined) {
        this.y = Math.floor(
          (parentHeight - this.height) * layout.verticalSpacingPercent / 100,
        );
      }

      if (layout.customPositionFn !== undefined) {
        layout.customPositionFn(this, parentWidth, parentHeight);
      }
    }
  }

  public draw(context: EngineContext): void {
    if (
      !context.isVisible(
        this._x + this._pivotX,
        this._y + this._pivotY,
        this._width,
        this._height,
      )
    ) {
      return;
    }
    context.pushTransform(this._x + this._pivotX, this._y + this._pivotY);
    context.pushClip(0, 0, this._width, this._height);
    context.moveCursorTo(0, 0);
    this.drawSelf(context);
    context.popClip();
    context.popTransform();
  }

  protected abstract drawSelf(context: DrawContext): void;

  public getBoundingBox() {
    this._boundingBox.set(
      this._x + this._pivotX,
      this._y + this._pivotY,
      this._width,
      this._height,
    );
    let p = this._parent;
    while (p !== null) {
      this._boundingBox.x += p.x + p.innerX;
      this._boundingBox.y += p.y + p.innerY;
      p = p.parent;
    }

    return this._boundingBox;
  }

  public invalidate() {
    const engine = this.engine;
    const bbox = this.getBoundingBox();
    engine?.invalidateRect(bbox);
  }
}
