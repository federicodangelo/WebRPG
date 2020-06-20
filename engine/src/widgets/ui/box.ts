import {
  FixedColor,
  Color,
  DrawContext,
  EngineContext,
} from "../../types.ts";
import { BaseWidgetContainer } from "../widget-container.ts";

export class BoxContainerWidget extends BaseWidgetContainer {
  public backColor: Color = FixedColor.Black;
  public borderColor: Color = FixedColor.Black;
  public border: number = 0;

  constructor(
    border = 0,
  ) {
    super();
    this.border = border;
  }

  public get innerX() {
    return this.border;
  }

  public get innerY() {
    return this.border;
  }

  public get innerWidth() {
    return this.width - this.border * 2;
  }

  public get innerHeight() {
    return this.height - this.border * 2;
  }

  preDrawChildren(context: EngineContext) {
    if (this.innerX > 0 || this.innerY > 0) {
      context.pushTransform(this.innerX, this.innerY);
      context.pushClip(0, 0, this.innerWidth, this.innerHeight);
    }
  }

  postDrawChildren(context: EngineContext) {
    if (this.innerX > 0 || this.innerY > 0) {
      context.popClip();
      context.popTransform();
    }
  }

  drawSelf(context: DrawContext) {
    if (this.border > 0) {
      if (this.borderColor !== FixedColor.Transparent) {
        //Top border
        context.fillRect(
          0,
          0,
          this.width,
          this.border,
          this.borderColor,
        );
        //Bottom border
        context.fillRect(
          0,
          this.height - this.border,
          this.width,
          this.border,
          this.borderColor,
        );
        //Left border
        context.fillRect(
          0,
          0,
          this.border,
          this.height,
          this.borderColor,
        );
        //Right border
        context.fillRect(
          this.width - this.border,
          0,
          this.border,
          this.height,
          this.borderColor,
        );
      }
    }

    if (this.backColor !== FixedColor.None) {
      context.fillRect(
        this.innerX,
        this.innerY,
        this.innerWidth,
        this.innerHeight,
        this.backColor,
      );
    }
  }
}
