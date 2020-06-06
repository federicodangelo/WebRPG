import {
  Color,
  SpecialChar,
  Rect,
  Point,
  EngineContext,
  FixedColor,
  Tile,
  FONT_NAME,
  FONT_SIZE,
} from "./types.ts";
import { NativeContextScreen } from "./native-types.ts";

const useCp437 = true;

const AnsiSpecialChar: number[] = [
  //Block
  useCp437 ? 219 : "█".charCodeAt(0),
  useCp437 ? 220 : "▄".charCodeAt(0),
  useCp437 ? 224 : "▀".charCodeAt(0),
  useCp437 ? 221 : "▌".charCodeAt(0),
  useCp437 ? 222 : "▌".charCodeAt(0),

  //Shade
  useCp437 ? 176 : "░".charCodeAt(0),
  useCp437 ? 177 : "▒".charCodeAt(0),
  useCp437 ? 178 : "▓".charCodeAt(0),

  ////Single Line
  useCp437 ? 179 : "│".charCodeAt(0),
  useCp437 ? 196 : "─".charCodeAt(0),
  useCp437 ? 218 : "┌".charCodeAt(0),
  useCp437 ? 191 : "┐".charCodeAt(0),
  useCp437 ? 192 : "└".charCodeAt(0),
  useCp437 ? 217 : "┘".charCodeAt(0),
  useCp437 ? 180 : "┤".charCodeAt(0),
  useCp437 ? 195 : "├".charCodeAt(0),
  useCp437 ? 193 : "┴".charCodeAt(0),
  useCp437 ? 194 : "┬".charCodeAt(0),
  useCp437 ? 197 : "┼".charCodeAt(0),

  //Double Line
  useCp437 ? 186 : "║".charCodeAt(0),
  useCp437 ? 205 : "═".charCodeAt(0),
  useCp437 ? 201 : "╔".charCodeAt(0),
  useCp437 ? 187 : "╗".charCodeAt(0),
  useCp437 ? 200 : "╚".charCodeAt(0),
  useCp437 ? 188 : "╝".charCodeAt(0),
  useCp437 ? 185 : "╣".charCodeAt(0),
  useCp437 ? 204 : "╠".charCodeAt(0),
  useCp437 ? 202 : "╩".charCodeAt(0),
  useCp437 ? 203 : "╦".charCodeAt(0),
  useCp437 ? 206 : "╬".charCodeAt(0),
];

export class EngineContextImpl implements EngineContext {
  private bounds = new Rect();
  private clip = new Rect();
  private tx: number = 0;
  private ty: number = 0;

  private fontTile: Tile = {
    tilemap: "",
    index: 0,
    width: FONT_SIZE,
    height: FONT_SIZE,
  };
  private x: number = 0;
  private y: number = 0;
  private foreColor = FixedColor.White;
  private backColor = FixedColor.Black;

  private transformsStack: Point[] = [];
  private clipStack: Rect[] = [];

  private nativeContext: NativeContextScreen;

  public constructor(nativeContext: NativeContextScreen) {
    this.nativeContext = nativeContext;
  }

  public beginDraw() {
    this.font(FONT_NAME);
    this.nativeContext.beginDraw();
  }

  public beginClip(x: number, y: number, width: number, height: number) {
    this.bounds.set(x, y, width, height);
    this.clip.set(x, y, width, height);
    this.transformsStack.length = 0;
    this.clipStack.length = 0;
    this.x = 0;
    this.y = 0;
    this.tx = 0;
    this.ty = 0;
  }

  public endClip() {}

  public endDraw() {
    this.nativeContext.endDraw();
  }

  pushTransform(x: number, y: number) {
    this.transformsStack.push(new Point(this.tx, this.ty));
    this.tx += x;
    this.ty += y;
  }

  popTransform(): void {
    const p = this.transformsStack.pop();
    if (p) {
      this.tx = p.x;
      this.ty = p.y;
    }
  }

  pushClip(x: number, y: number, width: number, height: number): void {
    this.clipStack.push(this.clip.clone());

    const minX = Math.max(this.tx + x, this.clip.x);
    const minY = Math.max(this.ty + y, this.clip.y);
    const maxX = Math.min(this.tx + x + width, this.clip.x + this.clip.width);
    const maxY = Math.min(this.ty + y + height, this.clip.y + this.clip.height);

    this.clip.set(minX, minY, maxX - minX, maxY - minY);
  }

  popClip(): void {
    const p = this.clipStack.pop();
    if (p) this.clip.copyFrom(p);
  }

  public isVisible(
    x: number,
    y: number,
    width: number,
    height: number,
  ): boolean {
    return !(
      this.tx + x + width < this.clip.x ||
      this.ty + y + height < this.clip.y ||
      this.tx + x > this.clip.x + this.clip.width ||
      this.ty + y > this.clip.y + this.clip.height
    );
  }

  public font(name: string) {
    this.fontTile.tilemap = name;
    return this;
  }

  public moveCursorTo(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  public textColor(foreColor: Color, backColor: Color) {
    this.foreColor = foreColor;
    this.backColor = backColor;
    return this;
  }

  public resetTextColor() {
    this.foreColor = FixedColor.White;
    this.backColor = FixedColor.Black;
    return this;
  }

  public text(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.char(str.charCodeAt(i));
    }
    return this;
  }

  public char(code: number) {
    const screenX = this.x + this.tx;
    const screenY = this.y + this.ty;
    if (
      screenX >= this.clip.x &&
      screenX < this.clip.x1 &&
      screenY >= this.clip.y &&
      screenY < this.clip.y1
    ) {
      this.fontTile.index = code;
      if (
        screenX + FONT_SIZE <= this.clip.x1 &&
        screenY + FONT_SIZE <= this.clip.y1
      ) {
        this.nativeContext.tintTile(
          this.fontTile,
          this.foreColor,
          this.backColor,
          screenX,
          screenY,
        );
      } else {
        this.nativeContext.tintTileClip(
          this.fontTile,
          this.foreColor,
          this.backColor,
          screenX,
          screenY,
          this.clip.x1 - (screenX + FONT_SIZE),
          this.clip.y1 - (screenY + FONT_SIZE),
        );
      }
    }
    this.x += FONT_SIZE;
    return this;
  }

  public charTimes(code: number, times: number) {
    for (let t = 0; t < times; t++) {
      this.char(code);
    }
    return this;
  }

  public specialChar(code: SpecialChar) {
    this.char(AnsiSpecialChar[code]);
    return this;
  }

  public specialCharTimes(code: number, times: number) {
    for (let t = 0; t < times; t++) {
      this.specialChar(code);
    }
    return this;
  }

  public textBorder(x: number, y: number, width: number, height: number) {
    const clip = this.clip;
    const tx = this.tx;
    const ty = this.ty;

    const x0 = Math.max(x, clip.x - tx);
    const y0 = Math.max(y, clip.y - ty);
    const x1 = Math.min(x + width, clip.x1 - tx);
    const y1 = Math.min(y + height, clip.y1 - ty);

    if (x1 <= x0 || y1 <= y0) {
      return this;
    }

    if (x0 !== x && x0 !== x + width && y0 !== y && y0 !== y + height) {
      return this;
    }

    this.moveCursorTo(x, y);
    this.specialChar(SpecialChar.CornerTopLeft);
    this.specialCharTimes(SpecialChar.Horizontal, width / FONT_SIZE - 2);
    this.moveCursorTo(x + width - FONT_SIZE, y);
    this.specialChar(SpecialChar.CornerTopRight);
    for (let i = 0; i < height - 2 * FONT_SIZE; i += FONT_SIZE) {
      this.moveCursorTo(x, y + FONT_SIZE + i);
      this.specialChar(SpecialChar.Vertical);
      this.moveCursorTo(x + width - FONT_SIZE, y + FONT_SIZE + i);
      this.specialChar(SpecialChar.Vertical);
    }
    this.moveCursorTo(x, y + height - FONT_SIZE);
    this.specialChar(SpecialChar.CornerBottomLeft);
    this.specialCharTimes(SpecialChar.Horizontal, width / FONT_SIZE - 2);
    this.moveCursorTo(x + width - FONT_SIZE, y + height - FONT_SIZE);
    this.specialChar(SpecialChar.CornerBottomRight);

    return this;
  }

  public fillChar(
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ) {
    if (char.length === 0) return this;

    const clip = this.clip;
    const tx = this.tx;
    const ty = this.ty;

    const x0 = Math.max(tx + x, clip.x);
    const y0 = Math.max(ty + y, clip.y);
    const x1 = Math.min(tx + x + width, clip.x1);
    const y1 = Math.min(ty + y + height, clip.y1);

    if (x1 <= x0 || y1 <= y0) {
      return this;
    }

    const code = char.charCodeAt(0);

    this.fontTile.index = code;

    for (let screenY = y0; screenY < y1; screenY += FONT_SIZE) {
      for (let screenX = x0; screenX < x1; screenX += FONT_SIZE) {
        if (screenX + FONT_SIZE <= x1 && screenY + FONT_SIZE <= y1) {
          this.nativeContext.tintTile(
            this.fontTile,
            this.foreColor,
            this.backColor,
            screenX,
            screenY,
          );
        } else {
          this.nativeContext.tintTileClip(
            this.fontTile,
            this.foreColor,
            this.backColor,
            screenX,
            screenY,
            x1 - (screenX + FONT_SIZE),
            y1 - (screenY + FONT_SIZE),
          );
        }
      }
    }
    return this;
  }

  public tile(x: number, y: number, t: Tile): EngineContext {
    const screenX = this.x + this.tx;
    const screenY = this.y + this.ty;
    if (
      screenX >= this.clip.x &&
      screenX < this.clip.x1 &&
      screenY >= this.clip.y &&
      screenY < this.clip.y1
    ) {
      if (
        screenX + t.width <= this.clip.x1 &&
        screenY + t.height <= this.clip.y1
      ) {
        this.nativeContext.setTile(
          t,
          screenX,
          screenY,
        );
      } else {
        this.nativeContext.setTileClip(
          t,
          screenX,
          screenY,
          this.clip.x1 - (screenX + t.width),
          this.clip.y1 - (screenY + t.height),
        );
      }
    }
    return this;
  }

  fillTile(
    x: number,
    y: number,
    width: number,
    height: number,
    t: Tile,
  ): EngineContext {
    const clip = this.clip;
    const tx = this.tx;
    const ty = this.ty;

    const x0 = Math.max(tx + x, clip.x);
    const y0 = Math.max(ty + y, clip.y);
    const x1 = Math.min(tx + x + width, clip.x1);
    const y1 = Math.min(ty + y + height, clip.y1);

    if (x1 <= x0 || y1 <= y0) {
      return this;
    }

    for (let screenY = y0; screenY < y1; screenY += t.width) {
      for (let screenX = x0; screenX < x1; screenX += t.height) {
        if (
          screenX + t.width <= x1 &&
          screenY + t.height <= y1
        ) {
          this.nativeContext.setTile(
            t,
            screenX,
            screenY,
          );
        } else {
          this.nativeContext.setTileClip(
            t,
            screenX,
            screenY,
            this.clip.x1 - (screenX + t.width),
            this.clip.y1 - (screenY + t.height),
          );
        }
      }
    }
    return this;
  }
}
