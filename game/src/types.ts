import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/game/tiles-container.ts";
import { Avatar } from "./avatar.ts";
import { KeyCode } from "engine/types.ts";

export interface Updateable {
  update(): void;
}

export type Game = {
  statsContainer: BoxContainerWidget;
  buttonsContainer: BoxContainerWidget;
  scrollable: ScrollableTilesContainerWidget;

  addButton(text: string, cb: () => void): void;

  avatars: Avatar[];
  npcs: Avatar[];
  updateables: Updateable[];

  map: ScrollableTilesContainerWidget;
  p1: Avatar;
  p2: Avatar;

  keysDown: Map<string, boolean>;
  specialKeysDown: Map<KeyCode, boolean>;
};
