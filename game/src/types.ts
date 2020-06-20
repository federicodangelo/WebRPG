import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { Engine, Assets } from "engine/types.ts";
import { NativeContext } from "engine/native-types.ts";

export enum StateId {
  MainMenu = "MainMenu",
  Game = "Game",
}

export type InitResult = {
  statsContainer?: BoxContainerWidget;
};

export type InitParams = {
  engine: Engine;
  assets: Assets;
  native: NativeContext;
  stateFactory: StateFactory;
};

export type State = {
  id: StateId;
  init(params: InitParams): InitResult;
  update(): StateId | null;
  destroy(): void;
};

export type StateFactory = {
  buildState(id: StateId): State;
};
