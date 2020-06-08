import { BaseWidget } from "./widget.ts";
import {
  DrawContext,
  Tile,
  Animation,
} from "../types.ts";

function buildDefaultSequence(len: number) {
  const seq: number[] = [];
  for (let i = 0; i < len; i++) seq.push(i);
  return seq;
}

export class AnimatedTileWidget extends BaseWidget {
  public animation: Animation;
  private tile: Tile | null = null;
  private frame = 0;
  private lastTimeoutCB = -1;

  constructor(animation: Animation) {
    super();
    this.animation = animation;
    this.updateCurrentTile();
  }

  public setAnimation(animation: Animation) {
    if (animation !== this.animation) {
      this.animation = animation;
      this.frame = 0;
      this.updateCurrentTile();
    }
  }

  private updateCurrentTile() {
    const animation = this.animation;
    if (animation === null) {
      return;
    }

    const newTile = animation
      .tiles[animation.sequence[this.frame % animation.sequence.length]];

    if (newTile !== this.tile) {
      this.tile = newTile;
      this.width = newTile.width;
      this.height = newTile.height;
      this.invalidate();
    }
    this.frame++;

    if (this.lastTimeoutCB >= 0) {
      clearTimeout(this.lastTimeoutCB);
      this.lastTimeoutCB = -1;
    }

    if (animation.delay > 0) {
      this.lastTimeoutCB = setTimeout(
        () => {
          this.lastTimeoutCB = -1;
          this.updateCurrentTile();
        },
        animation.delay,
      );
    }
  }

  protected drawSelf(context: DrawContext) {
    if (this.tile !== null) context.tile(this.x, this.y, this.tile);
  }
}
