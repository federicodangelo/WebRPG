import {
  FixedColor,
  Color,
  DrawContext,
  EngineContext,
  Font,
} from "../types.ts";
import { BaseWidgetContainer } from "./widget-container.ts";

export class BoxContainerWidget extends BaseWidgetContainer {
  public font: Font;
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
    font: Font,
    border: number = font.tileWidth,
    borderForeColor = FixedColor.White,
    borderBackColor = FixedColor.Black,
    foreColor = FixedColor.White,
    backColor = FixedColor.Black,
    fillChar = " ",
  ) {
    super();
    this.font = font;
    this.border = border;
    this.borderForeColor = borderForeColor;
    this.borderBackColor = borderBackColor;
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.fillChar = fillChar;
  }

  public get innerX() {
    return this.border * this.font.tileWidth;
  }

  public get innerY() {
    return this.border * this.font.tileHeight;
  }

  public get innerWidth() {
    return this.width - this.border * 2 * this.font.tileWidth;
  }

  public get innerHeight() {
    return this.height - this.border * 2 * this.font.tileHeight;
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
        this.font,
        this.font.tileWidth,
        this.font.tileHeight,
        this.width - 2 * this.font.tileWidth,
        this.height - 2 * this.font.tileHeight,
        this.fillChar,
      );

      context.textColor(this.borderForeColor, this.borderBackColor).textBorder(
        this.font,
        0,
        0,
        this.width,
        this.height,
      );
    } else {
      context.textColor(this.foreColor, this.backColor).fillChar(
        this.font,
        0,
        0,
        this.width,
        this.height,
        this.fillChar,
      );
    }

    if (this.title.length > 0) {
      context.moveCursorTo(
        Math.floor((this.width - this.title.length * this.font.tileWidth) / 2),
        0,
      )
        .textColor(this.titleForeColor, this.titleBackColor)
        .text(this.font, this.title);
    }
  }
}
