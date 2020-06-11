import { BaseWidget } from "./widget.ts";
import { Color, DrawContext, Font, EngineMouseEvent } from "../types.ts";

export class ButtonWidget extends BaseWidget {
  public font: Font;
  public foreColor: Color;
  public backColor: Color;
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
    onTapped: (() => void) | null = null,
  ) {
    super();
    this.font = font;
    this.height = font.tileHeight;
    this.text = text;
    this.foreColor = foreColor;
    this.backColor = backColor;
    this.onTapped = onTapped;
  }

  protected drawSelf(context: DrawContext) {
    context.textColor(this.foreColor, this.backColor);
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
    if (e.type === "down") {
      this.down = true;
    } else if (e.type === "up") {
      if (this.down) {
        this.down = false;
        if (this.onTapped !== null) this.onTapped();
      }
    }
  }
}
