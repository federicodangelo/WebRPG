import { BaseWidget } from "../widget.ts";
import { Color, DrawContext, Font } from "../../types.ts";

export class CharacterWidget extends BaseWidget {
  public char: string;
  public foreColor: Color;
  public font: Font;

  constructor(font: Font, char: string, foreColor: Color) {
    super();
    this.font = font;
    this.char = char;
    this.foreColor = foreColor;
    this.width = font.tileWidth;
    this.height = font.tileHeight;
  }

  protected drawSelf(context: DrawContext) {
    context.textColor(this.foreColor).text(
      this.font,
      this.char,
    );
  }
}
