import {
  Widget,
  WidgetContainer,
  WidgetLayout,
  Engine,
  Rect,
  DrawContext,
  EngineContext,
  EngineMouseEvent,
  LayerId,
  isUpdateable,
} from "../types.ts";

export abstract class BaseWidget implements Widget {
  private _x: number = 0;
  private _y: number = 0;
  private _width: number = 0;
  private _height: number = 0;
  private _pivotX: number = 0;
  private _pivotY: number = 0;
  private _sortingLayer: number = 0;
  private _layer: LayerId = 0;
  private _parent: WidgetContainer | null = null;
  private _engine: Engine | null = null;
  private _boundingBox: Rect = new Rect();
  private _solid: boolean = true;
  private _visible: boolean = true;

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
      if (this._engine !== null && isUpdateable(this)) {
        this._engine.unregisterUpdateable(this);
      }
      this._engine = val;
      if (this._engine !== null && isUpdateable(this)) {
        this._engine.registerUpdateable(this);
      }
    }
  }

  public get solid() {
    return this._solid;
  }

  public set solid(val: boolean) {
    if (val !== this._solid) {
      this._solid = val;
    }
  }

  public get visible() {
    return this._visible;
  }

  public set visible(val: boolean) {
    if (val !== this._visible) {
      this._visible = val;
      this.invalidate();
    }
  }

  public get x() {
    return this._x;
  }

  public set x(v: number) {
    if (v !== this._x) {
      this.invalidate();
      this._x = v | 0;
      this.invalidate();
      this._parent?.onChildrenTransformChanged(this);
    }
  }

  public get y() {
    return this._y;
  }

  public set y(v: number) {
    if (v !== this._y) {
      this.invalidate();
      this._y = v | 0;
      this.invalidate();
      this._parent?.onChildrenTransformChanged(this);
    }
  }

  public get width() {
    return this._width;
  }

  public set width(v: number) {
    if (v !== this._width) {
      this.invalidate();
      this._width = v | 0;
      this.invalidate();
      this._parent?.onChildrenTransformChanged(this);
    }
  }

  public get height() {
    return this._height;
  }

  public set height(v: number) {
    if (v !== this._height) {
      this.invalidate();
      this._height = v | 0;
      this.invalidate();
      this._parent?.onChildrenTransformChanged(this);
    }
  }

  public get pivotX() {
    return this._pivotX;
  }

  public set pivotX(v: number) {
    if (v !== this._pivotX) {
      this.invalidate();
      this._pivotX = v | 0;
      this.invalidate();
      this._parent?.onChildrenTransformChanged(this);
    }
  }

  public get pivotY() {
    return this._pivotY;
  }

  public set pivotY(v: number) {
    if (v !== this._pivotY) {
      this.invalidate();
      this._pivotY = v | 0;
      this.invalidate();
      this._parent?.onChildrenTransformChanged(this);
    }
  }

  public get visibleX() {
    return this._x + this._pivotX;
  }

  public get visibleY() {
    return this._y + this._pivotY;
  }

  public get sortingLayer() {
    return this._sortingLayer;
  }

  public set sortingLayer(v: number) {
    if (v !== this._sortingLayer) {
      this._sortingLayer = v;
      this.invalidate();
      this._parent?.onChildrenTransformChanged(this);
    }
  }

  public get layer() {
    return this._layer;
  }

  public set layer(v: LayerId) {
    if (v !== this._layer) {
      this.invalidate();
      this._layer = v;
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
        this.layer = this._parent.layer;
        this._parent.children.push(this);
        this.engine = this._parent.engine;
        this._parent.onChildrenAdded(this);
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
        this.height = Math.ceil((parentHeight * layout.heightPercent) / 100);
      }
      if (layout.widthPercent !== undefined) {
        this.width = Math.ceil((parentWidth * layout.widthPercent) / 100);
      }

      if (layout.customSizeFn !== undefined) {
        layout.customSizeFn(this, parentWidth, parentHeight);
      }

      if (layout.horizontalSpacingPercent !== undefined) {
        this.x = Math.floor(
          ((parentWidth - this.width) * layout.horizontalSpacingPercent) / 100,
        );
      }
      if (layout.verticalSpacingPercent !== undefined) {
        this.y = Math.floor(
          ((parentHeight - this.height) * layout.verticalSpacingPercent) / 100,
        );
      }

      if (layout.customPositionFn !== undefined) {
        layout.customPositionFn(this, parentWidth, parentHeight);
      }
    }
  }

  public draw(context: EngineContext): void {
    if (
      !this.visible ||
      !context.isVisible(this.visibleX, this.visibleY, this.width, this.height)
    ) {
      return;
    }
    context.pushTransform(this.visibleX, this.visibleY);
    context.pushClip(0, 0, this.width, this.height);
    context.moveCursorTo(0, 0);
    this.drawSelf(context);
    context.popClip();
    context.popTransform();
  }

  protected abstract drawSelf(context: DrawContext): void;

  public getBoundingBox() {
    this._boundingBox.set(
      this.visibleX,
      this.visibleY,
      this.width,
      this.height,
    );
    let p = this._parent;
    while (p !== null) {
      this._boundingBox.x += p.visibleX + p.innerX;
      this._boundingBox.y += p.visibleY + p.innerY;
      p = p.parent;
    }

    return this._boundingBox;
  }

  public invalidate() {
    const engine = this.engine;
    const bbox = this.getBoundingBox();
    engine?.invalidateRect(bbox, this.layer);
  }

  public mouse(e: EngineMouseEvent) {}

  public getAt(x: number, y: number): Widget | null {
    if (!this.solid || !this.visible) return null;
    if (x < 0 || y < 0 || x > this.width || y > this.height) return null;
    return this;
  }
}
