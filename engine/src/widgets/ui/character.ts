import { BaseWidget } from "../widget.ts";
import { Color, DrawContext, Font } from "../../types.ts";

export class CharacterWidget extends BaseWidget {
  public char: string;
  public foreColor: Color;
  public backColor: Color;
  public font: Font;

  constructor(font: Font, char: string, foreColor: Color, backColor: Color) {
    super();
    this.font = font;
    this.char = char;
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.width = font.tileWidth;
    this.height = font.tileHeight;
  }

  protected drawSelf(context: DrawContext) {
    context.textColor(this.foreColor, this.backColor).text(
      this.font,
      this.char,
    );
  }
}
