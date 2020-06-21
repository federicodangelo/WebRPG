import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import {
  Engine,
  Assets,
  EngineKeyEvent,
  EngineMouseEvent,
} from "engine/types.ts";
import { NativeContext } from "engine/native-types.ts";

export enum StateId {
  MainMenu = "MainMenu",
  Game = "Game",
  Benchmark = "Benchmark",
  Settings = "Settings",
}

export type InitResult = {
  statsContainer?: BoxContainerWidget;
};

export type StateParams = {
  engine: Engine;
  assets: Assets;
  native: NativeContext;
};

export type State = {
  id: StateId;
  init(params: StateParams): InitResult;
  update(params: StateParams): StateId | null;
  destroy(params: StateParams): void;
  onKeyEvent?(e: EngineKeyEvent, params: StateParams): void;
  onMouseEvent?(e: EngineMouseEvent, params: StateParams): void;
  onFullScreenChanged?(fullscreen: boolean, params: StateParams): void;
};

export type StateFactory = {
  buildState(id: StateId): State;
};
