import {
  EngineContext,
  WidgetContainer,
  ChildrenLayout,
  Engine,
  Widget,
} from "../types.ts";
import { BaseWidget } from "./widget.ts";

export abstract class BaseWidgetContainer extends BaseWidget
  implements WidgetContainer {
  protected _children: Widget[] = [];

  public childrenLayout: ChildrenLayout | null = null;

  public setChildrenLayout(layout: ChildrenLayout | null) {
    this.childrenLayout = layout;
    return this;
  }

  public get engine() {
    return super.engine;
  }

  public set engine(val: Engine | null) {
    if (val !== this.engine) {
      super.engine = val;
      for (let i = 0; i < this._children.length; i++) {
        this._children[i].engine = val;
      }
    }
  }

  public get innerX() {
    return 0;
  }

  public get innerY() {
    return 0;
  }

  public get innerWidth() {
    return this.width;
  }

  public get innerHeight() {
    return this.height;
  }

  public get children() {
    return this._children;
  }

  public updateLayout(parentWidth: number, parentHeight: number) {
    super.updateLayout(parentWidth, parentHeight);

    if (
      this.childrenLayout === null ||
      this.childrenLayout.type === "absolute"
    ) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateLayout(this.innerWidth, this.innerHeight);
      }
    } else if (this.childrenLayout.type === "vertical") {
      const spacing = this.childrenLayout.spacing || 0;
      let top = 0;
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateLayout(this.innerWidth, this.innerHeight);
        this.children[i].x = 0;
        this.children[i].y = top;
        top += this.children[i].height + spacing;
      }
    } else if (this.childrenLayout.type === "horizontal") {
      const spacing = this.childrenLayout.spacing || 0;
      let left = 0;
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateLayout(this.innerWidth, this.innerHeight);
        this.children[i].y = 0;
        this.children[i].x = left;
        left += this.children[i].width + spacing;
      }
    }
    //The last option is "none".. so we don't do anything
  }

  public draw(context: EngineContext): void {
    if (
      !context.isVisible(this.visibleX, this.visibleY, this.width, this.height)
    ) {
      return;
    }
    context.pushTransform(this.visibleX, this.visibleY);
    context.pushClip(0, 0, this.width, this.height);
    context.moveCursorTo(0, 0);
    this.drawSelf(context);
    this.preDrawChildren(context);
    for (let i = 0; i < this._children.length; i++) {
      this._children[i].draw(context);
    }
    this.postDrawChildren(context);
    context.popClip();
    context.popTransform();
  }

  protected preDrawChildren(context: EngineContext) {}

  protected postDrawChildren(context: EngineContext) {}

  public onChildrenTransformChanged(child: Widget) {}

  public onChildrenAdded(child: Widget) {}
}
