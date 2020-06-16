import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { ScrollableTilesContainerWidget } from "engine/widgets/game/tiles-container.ts";
import { Avatar } from "./avatar.ts";
import { KeyCode } from "engine/types.ts";
import { TilemapWidget } from "../../engine/src/widgets/game/tilemap.ts";

export type Game = {
  statsContainer: BoxContainerWidget;
  buttonsContainer: BoxContainerWidget;
  scrollable: ScrollableTilesContainerWidget;

  addButton(text: string, cb: () => void): void;

  avatars: Avatar[];
  npcs: Avatar[];

  map: ScrollableTilesContainerWidget;
  floorLayer1: TilemapWidget;
  floorLayer2: TilemapWidget;
  p1: Avatar;
  p2: Avatar;

  keysDown: Map<string, boolean>;
  specialKeysDown: Map<KeyCode, boolean>;
};
