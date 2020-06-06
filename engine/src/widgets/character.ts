import { BaseWidget } from "./widget.ts";
import { Color, DrawContext, FONT_SIZE } from "../types.ts";

export class CharacterWidget extends BaseWidget {
  public char: string;
  public foreColor: Color;
  public backColor: Color;

  constructor(char: string, foreColor: Color, backColor: Color) {
    super();
    this.width = this.height = FONT_SIZE;
    this.char = char;
    this.foreColor = foreColor;
    this.backColor = backColor;
  }

  protected drawSelf(context: DrawContext) {
    context.textColor(this.foreColor, this.backColor).text(this.char);
  }
}
