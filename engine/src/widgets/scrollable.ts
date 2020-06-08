import {
  FixedColor,
  Color,
  DrawContext,
  EngineContext,
  Font,
  Widget,
} from "../types.ts";
import { BaseWidgetContainer } from "./widget-container.ts";

export class ScrollableContainerWidget extends BaseWidgetContainer {
  public font: Font;
  public backColor: Color;
  public foreColor: Color;
  public fillChar: string;

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

  public setOffset(offsetX: number, offsetY: number) {
    if (offsetX !== this._offsetX || offsetY !== this._offsetY) {
      this._offsetX = offsetX;
      this._offsetY = offsetY;
      this.invalidate();
    }
  }

  constructor(
    font: Font,
    foreColor = FixedColor.White,
    backColor = FixedColor.Black,
    fillChar = " "
  ) {
    super();
    this.font = font;
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.fillChar = fillChar;
  }

  preDrawChildren(context: EngineContext) {
    context.pushTransform(this.innerX, this.innerY);
  }

  postDrawChildren(context: EngineContext) {
    context.popTransform();
  }

  drawSelf(context: DrawContext) {
    context
      .textColor(this.foreColor, this.backColor)
      .fillChar(this.font, 0, 0, this.width, this.height, this.fillChar);
  }
}
