import { BaseWidget } from "./widget.ts";
import { Color, DrawContext, Font, EngineMouseEvent } from "../types.ts";

export class ButtonWidget extends BaseWidget {
  public font: Font;
  public foreColor: Color;
  public backColor: Color;
  public pressedColor: Color;
  public onTapped: (() => void) | null = null;

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
    super();
    this.font = font;
    this.height = font.tileHeight;
    this.text = text;
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.pressedColor = pressedColor;
    this.onTapped = onTapped;
  }

  protected drawSelf(context: DrawContext) {
    const backColor = this.down ? this.pressedColor : this.backColor;

    context.textColor(this.foreColor, backColor);
    context.textBorder(this.font, 0, 0, this.width, this.height);

    for (let i = 0; i < this._lines.length; i++) {
      context.moveCursorTo(this.font.tileWidth, (i + 1) * this.font.tileHeight)
        .text(
          this.font,
          this._lines[i],
        );
    }
  }

  private down: boolean = false;

  public mouse(e: EngineMouseEvent) {
    switch (e.type) {
      case "down":
        this.down = true;
        this.invalidate();
        break;
      case "out":
        this.down = false;
        this.invalidate();
        break;
      case "up":
        if (this.down) {
          this.down = false;
          this.invalidate();
          if (this.onTapped !== null) this.onTapped();
        }
        break;
    }
  }
}
