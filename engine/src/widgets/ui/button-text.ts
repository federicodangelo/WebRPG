import { BaseWidget } from "../widget.ts";
import { Color, DrawContext, Font, EngineMouseEvent } from "../../types.ts";
import { ButtonWidget } from "./button.ts";

export class TextButtonWidget extends ButtonWidget {
  public font: Font;
  public foreColor: Color;
  private _text: string = "";
  private _lines: string[] = [];

  public set text(val: string) {
    if (val !== this._text) {
      this._text = val;
      this._lines = val.split("\n");
      this.width = (this._lines.map((s) => s.length).reduce(
        (max, c) => Math.max(max, c),
        0,
      ) + 2) * this.font.tileWidth;
      this.height = (this._lines.length + 2) * this.font.tileHeight;
      this.invalidate();
    }
  }

  public get text() {
    return this._text;
  }

  constructor(
    font: Font,
    text: string,
    foreColor: Color,
    backColor: Color,
    pressedColor: Color,
    onTapped: (() => void) | null = null,
  ) {
    super(backColor, pressedColor, onTapped);
    this.font = font;
    this.height = font.tileHeight;
    this.text = text;
    this.foreColor = foreColor;
  }

  protected drawSelf(context: DrawContext) {
    const backColor = this.down ? this.pressedColor : this.backColor;

    context.textColor(this.foreColor, backColor);
    context.textBorder(this.font, 0, 0, this.width, this.height);
    context.fillRect(
      this.font.tileWidth,
      this.font.tileHeight,
      this.width - this.font.tileWidth * 2,
      this.height - this.font.tileHeight * 2,
      backColor,
    );

    for (let i = 0; i < this._lines.length; i++) {
      const line = this._lines[i];
      context.moveCursorTo(
        this.font.tileWidth +
            (((this.width - this.font.tileWidth * 2) -
              (line.length * this.font.tileWidth)) / 2) | 0,
        (i + 1) * this.font.tileHeight +
            (((this.height - this.font.tileHeight * 2) -
              (this._lines.length * this.font.tileHeight)) / 2) | 0,
      )
        .text(
          this.font,
          line,
        );
    }
  }
}
