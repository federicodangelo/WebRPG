import {
  FixedColor,
  Color,
  DrawContext,
  EngineContext,
  FONT_SIZE,
} from "../types.ts";
import { BaseWidgetContainer } from "./widget-container.ts";

export class BoxContainerWidget extends BaseWidgetContainer {
  public backColor: Color;
  public foreColor: Color;
  public borderForeColor: Color;
  public borderBackColor: Color;
  public fillChar: string;
  public title: string = "";
  public titleForeColor = FixedColor.White;
  public titleBackColor = FixedColor.Black;
  public border: number = 0;

  constructor(
    border = FONT_SIZE,
    borderForeColor = FixedColor.White,
    borderBackColor = FixedColor.Black,
    foreColor = FixedColor.White,
    backColor = FixedColor.Black,
    fillChar = " ",
  ) {
    super();
    this.border = border;
    this.borderForeColor = borderForeColor;
    this.borderBackColor = borderBackColor;
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.fillChar = fillChar;
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
      context.textColor(this.foreColor, this.backColor).fillChar(
        FONT_SIZE,
        FONT_SIZE,
        this.width - 2 * FONT_SIZE,
        this.height - 2 * FONT_SIZE,
        this.fillChar,
      );

      context.textColor(this.borderForeColor, this.borderBackColor).textBorder(
        0,
        0,
        this.width,
        this.height,
      );
    } else {
      context.textColor(this.foreColor, this.backColor).fillChar(
        0,
        0,
        this.width,
        this.height,
        this.fillChar,
      );
    }

    if (this.title.length > 0) {
      context.moveCursorTo(
        Math.floor((this.width - this.title.length * FONT_SIZE) / 2),
        0,
      )
        .textColor(this.titleForeColor, this.titleBackColor)
        .text(this.title);
    }
  }
}
