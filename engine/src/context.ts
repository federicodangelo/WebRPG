import {
  Color,
  SpecialChar,
  Rect,
  Point,
  EngineContext,
  FixedColor,
  Tile,
  Tilemap,
  Font,
  LayerId,
  Sprite,
} from "./types.ts";
import { NativeContextScreen, NativeDrawStats } from "./native-types.ts";

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

function ceilToMultipleOf(n: number, m: number) {
  if (n % m === 0) return n;
  return Math.ceil(n / m) * m;
}

function floorToMultipleOf(n: number, m: number) {
  if (n % m === 0) return n;
  return Math.floor(n / m) * m;
}

export class EngineContextImpl implements EngineContext {
  private bounds = new Rect();
  private clip = new Rect();
  private tx: number = 0;
  private ty: number = 0;

  private x: number = 0;
  private y: number = 0;
  private foreColor = FixedColor.White;

  private transformsStack: Point[] = [];
  private clipStack: Rect[] = [];

  private nativeContext: NativeContextScreen;

  public constructor(nativeContext: NativeContextScreen) {
    this.nativeContext = nativeContext;
  }

  public beginDraw() {
    this.nativeContext.beginDraw();
  }

  public setTargetLayer(layer: LayerId) {
    this.nativeContext.setTargetLayer(layer);
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

  public endDraw(): void {
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

  public moveCursorTo(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  public textColor(foreColor: Color) {
    this.foreColor = foreColor;
    return this;
  }

  public resetTextColor() {
    this.foreColor = FixedColor.White;
    return this;
  }

  public text(font: Font, str: string) {
    for (let i = 0; i < str.length; i++) {
      this.char(font, str.charCodeAt(i));
    }
    return this;
  }

  public char(font: Font, code: number) {
    const screenX = this.x + this.tx;
    const screenY = this.y + this.ty;
    const clip = this.clip;

    const width = font.tileWidth;
    const height = font.tileHeight;

    if (
      screenX + width > clip.x &&
      screenX < clip.x1 &&
      screenY + height > clip.y &&
      screenY < clip.y1
    ) {
      const fontTile = font.tiles[code];

      const cfx = Math.max(clip.x - screenX, 0);
      const cfy = Math.max(clip.y - screenY, 0);
      const ctx = Math.min(clip.x1 - screenX, width);
      const cty = Math.min(clip.y1 - screenY, height);

      this.nativeContext.setTile(
        fontTile,
        //this.foreColor,
        screenX,
        screenY,
        cfx,
        cfy,
        ctx,
        cty,
      );
    }
    this.x += width;
    return this;
  }

  public charTimes(font: Font, code: number, times: number) {
    for (let t = 0; t < times; t++) {
      this.char(font, code);
    }
    return this;
  }

  public specialChar(font: Font, code: SpecialChar) {
    this.char(font, AnsiSpecialChar[code]);
    return this;
  }

  public specialCharTimes(font: Font, code: number, times: number) {
    for (let t = 0; t < times; t++) {
      this.specialChar(font, code);
    }
    return this;
  }

  public textBorder(
    font: Font,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
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

    const fontWidth = font.tileWidth;
    const fontHeight = font.tileHeight;

    if (
      x0 > x + fontWidth &&
      y0 > y + fontHeight &&
      x1 < x + width - fontWidth &&
      y1 < y + height - fontHeight
    ) {
      return this;
    }

    const lineSize = 1;
    const ox = (fontWidth / 2) | 0;
    const oy = (fontHeight / 2) | 0;

    this.fillRect(
      x + ox,
      y + oy,
      width - ox * 2,
      lineSize,
      this.foreColor,
    );

    this.fillRect(
      x + ox,
      y + height - fontHeight + oy,
      width - ox * 2,
      lineSize,
      this.foreColor,
    );

    this.fillRect(
      x + ox,
      y + oy,
      lineSize,
      height - oy * 2,
      this.foreColor,
    );

    this.fillRect(
      x + width - fontWidth + ox,
      y + oy,
      lineSize,
      height - oy * 2,
      this.foreColor,
    );

    return this;
  }

  public fillChar(
    font: Font,
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ) {
    if (char.length === 0) return this;

    const fontWidth = font.tileWidth;
    const fontHeight = font.tileHeight;

    const clip = this.clip;
    const tx = this.tx;
    const ty = this.ty;

    const x0 = Math.max(tx + x, floorToMultipleOf(clip.x, fontWidth));
    const y0 = Math.max(ty + y, floorToMultipleOf(clip.y, fontHeight));
    const x1 = Math.min(tx + x + width, ceilToMultipleOf(clip.x1, fontWidth));
    const y1 = Math.min(ty + y + height, ceilToMultipleOf(clip.y1, fontHeight));

    if (x1 <= x0 || y1 <= y0) {
      return this;
    }

    const code = char.charCodeAt(0);

    const fontTile = font.tiles[code];

    for (let screenY = y0; screenY < y1; screenY += fontHeight) {
      for (let screenX = x0; screenX < x1; screenX += fontWidth) {
        const cfx = Math.max(clip.x - screenX, 0);
        const cfy = Math.max(clip.y - screenY, 0);
        const ctx = Math.min(clip.x1 - screenX, fontWidth);
        const cty = Math.min(clip.y1 - screenY, fontHeight);

        this.nativeContext.setTile(
          fontTile,
          //this.foreColor,
          screenX,
          screenY,
          cfx,
          cfy,
          ctx,
          cty,
        );
      }
    }
    return this;
  }

  public tilemap(
    x: number,
    y: number,
    tilemap: Tilemap,
    indexes: number[][],
  ): EngineContext {
    const tileWidth = tilemap.tileWidth;
    const tileHeight = tilemap.tileHeight;
    const clip = this.clip;
    const tx = this.tx;
    const ty = this.ty;

    if (indexes.length == 0) return this;

    const height = indexes.length * tileHeight;
    const width = indexes[0].length * tileWidth;

    const rtx = tx + x;
    const rty = ty + y;

    const x0 = Math.max(
      tx + x,
      floorToMultipleOf(clip.x - rtx, tileWidth) + rtx,
    );
    const y0 = Math.max(
      ty + y,
      floorToMultipleOf(clip.y - rty, tileHeight) + rty,
    );
    const x1 = Math.min(
      tx + x + width,
      ceilToMultipleOf(clip.x1 - rtx, tileWidth) + rtx,
    );
    const y1 = Math.min(
      ty + y + height,
      ceilToMultipleOf(clip.y1 - rty, tileHeight) + rty,
    );

    if (x1 <= x0 || y1 <= y0) {
      return this;
    }

    const tiles = tilemap.tiles;
    let tileY = ((y0 - y - ty) / tileHeight) | 0;
    for (let screenY = y0; screenY < y1; screenY += tileHeight, tileY++) {
      const row = indexes[tileY];
      let tileX = ((x0 - x - tx) / tileWidth) | 0;

      for (let screenX = x0; screenX < x1; screenX += tileWidth, tileX++) {
        const tileIndex = row[tileX];

        if (tileIndex >= 0) {
          const cfx = Math.max(clip.x - screenX, 0);
          const cfy = Math.max(clip.y - screenY, 0);
          const ctx = Math.min(clip.x1 - screenX, tileWidth);
          const cty = Math.min(clip.y1 - screenY, tileHeight);

          this.nativeContext.setTile(
            tiles[tileIndex],
            screenX,
            screenY,
            cfx,
            cfy,
            ctx,
            cty,
          );
        }
      }
    }
    return this;
  }

  public tile(x: number, y: number, t: Tile): EngineContext {
    const screenX = x + this.tx;
    const screenY = y + this.ty;
    const clip = this.clip;
    const width = t.width;
    const height = t.height;

    if (
      screenX + width > clip.x &&
      screenX < clip.x1 &&
      screenY + height > clip.y &&
      screenY < clip.y1
    ) {
      const cfx = Math.max(clip.x - screenX, 0);
      const cfy = Math.max(clip.y - screenY, 0);
      const ctx = Math.min(clip.x1 - screenX, width);
      const cty = Math.min(clip.y1 - screenY, height);

      this.nativeContext.setTile(
        t,
        screenX,
        screenY,
        cfx,
        cfy,
        ctx,
        cty,
      );
    }
    return this;
  }

  public sprite(x: number, y: number, s: Sprite): EngineContext {
    const screenX = x + this.tx;
    const screenY = y + this.ty;
    const clip = this.clip;
    const width = s.width;
    const height = s.height;

    if (
      screenX + width > clip.x &&
      screenX < clip.x1 &&
      screenY + height > clip.y &&
      screenY < clip.y1
    ) {
      const cfx = Math.max(clip.x - screenX, 0);
      const cfy = Math.max(clip.y - screenY, 0);
      const ctx = Math.min(clip.x1 - screenX, width);
      const cty = Math.min(clip.y1 - screenY, height);

      this.nativeContext.setSprite(
        s,
        screenX,
        screenY,
        cfx,
        cfy,
        ctx,
        cty,
      );
    }
    return this;
  }
  public fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
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

    this.nativeContext.fillRect(color, x0, y0, x1 - x0, y1 - y0);

    return this;
  }
}
