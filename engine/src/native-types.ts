import {
  Color,
  Size,
  Tile,
  EngineKeyEvent,
  EngineMouseEvent,
} from "./types.ts";

export type NativeDrawStats = {
  drawnPixels: number;
};

export interface NativeContextScreen {
  getScreenSize(): Size | null;
  onScreenSizeChanged(listener: (size: Size) => void): void;
  setFullscreen(fullscreen: boolean): void;
  toggleStats(): void;

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

  scrollRect(
    x: number,
    y: number,
    width: number,
    height: number,
    dx: number,
    dy: number,
  ): void;

  endDraw(): NativeDrawStats;
}

export interface NativeContextInput {
  onKeyEvent(listener: (e: EngineKeyEvent) => void): void;
  onMouseEvent(listener: (e: EngineMouseEvent) => void): void;
}

export interface NativeContext {
  init(): Promise<void>;
  screen: NativeContextScreen;
  input: NativeContextInput;
  destroy(): void;
}
