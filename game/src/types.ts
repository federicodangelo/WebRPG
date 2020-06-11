import { BoxContainerWidget } from "engine/widgets/box.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/tiles-container.ts";
import { Avatar } from "./avatar.ts";
import { KeyCode } from "../../engine/src/types.ts";

export interface Updateable {
  update(): void;
}

export type Game = {
  ui: BoxContainerWidget;
  scrollable: ScrollableTilesContainerWidget;

  avatars: Avatar[];
  npcs: Avatar[];
  updateables: Updateable[];

  map: ScrollableTilesContainerWidget;
  p1: Avatar;
  p2: Avatar;

  keysDown: Map<string, boolean>;
  specialKeysDown: Map<KeyCode, boolean>;
};
