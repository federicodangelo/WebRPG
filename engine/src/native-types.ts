import {
  Color,
  Size,
  Tile,
  EngineKeyEvent,
  EngineMouseEvent,
  TilemapData,
} from "./types.ts";
import { LayerId } from "./types.ts";

export type NativeDrawStats = {
  drawnPixels: number;
  time: number;
};

export interface NativeContextScreen {
  getScreenSize(): Size | null;
  onScreenSizeChanged(listener: (size: Size) => void): void;
  onFullScreenChanged(listener: (fullscreen: boolean) => void): void;
  setFullscreen(fullscreen: boolean): void;
  toggleStats(): void;
  readyForNextFrame(maxPendingFrames: number): boolean;
  processPendingFrames(): void;
  preloadTilemap(tile: TilemapData): void;

  beginDraw(): void;

  setTargetLayer(layer: LayerId): void;

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

  endDraw(): void;
}

export interface NativeContextInput {
  onKeyEvent(listener: (e: EngineKeyEvent) => void): void;
  onMouseEvent(listener: (e: EngineMouseEvent) => void): void;
}

export interface NativeContextFocus {
  onFocusChanged(listener: (focus: boolean) => void): void;
}

export interface NativeContext {
  init(): Promise<void>;
  focus: NativeContextFocus;
  screen: NativeContextScreen;
  input: NativeContextInput;
  destroy(): void;
}
