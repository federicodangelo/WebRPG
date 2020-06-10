import { Color, Size, Tile, KeyEvent } from "./types.ts";

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
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ): void;

  setTile(
    t: Tile,
    x: number,
    y: number,
    cfx: number,
    cfy: number,
    ctx: number,
    cty: number,
  ): void;

  fillRect(
    color: Color,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void;

  endDraw(): void;
}

export interface NativeContextInput {
  onKeyEvent(listener: (e: KeyEvent) => void): void;
}

export interface NativeContext {
  init(): Promise<void>;
  screen: NativeContextScreen;
  input: NativeContextInput;
  destroy(): void;
}
