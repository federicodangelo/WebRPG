import { Color, SpecialChar, Size, Tile } from "./types.ts";

export interface NativeContextScreen {
  getScreenSize(): Size | null;
  onScreenSizeChanged(listener: (size: Size) => void): void;

  beginDraw(): void;

  tintTile(
    t: Tile,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
  ): void;

  tintTileClip(
    t: Tile,
    foreColor: Color,
    backColor: Color,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ): void;

  setTile(
    t: Tile,
    x: number,
    y: number,
  ): void;

  setTileClip(
    t: Tile,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ): void;

  endDraw(): void;
}

export interface NativeContextInput {
  onInput(listener: (input: string) => void): void;
}

export interface NativeContext {
  init(): Promise<void>;
  screen: NativeContextScreen;
  input: NativeContextInput;
  destroy(): void;
}
