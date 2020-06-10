import { BaseWidget } from "./widget.ts";
import { DrawContext, Tile, Animation } from "../types.ts";

export class AnimatedTileWidget extends BaseWidget {
  public animation: Animation;
  private tile: Tile | null = null;
  private frame = 0;
  private lastTimeoutCB = -1;
  public animationFinishedCb: (() => void) | null = null;

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

    const newTile = this.animation.loops
      ? animation.tiles[this.frame % animation.tiles.length]
      : animation.tiles[
        this.frame < animation.tiles.length
          ? this.frame
          : animation.tiles.length - 1
      ];

    if (
      !this.animation.loops &&
      this.frame === animation.tiles.length &&
      this.animationFinishedCb !== null
    ) {
      this.animationFinishedCb();
    }

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
      this.lastTimeoutCB = setTimeout(() => {
        this.lastTimeoutCB = -1;
        this.updateCurrentTile();
      }, animation.delay);
    }
  }

  protected drawSelf(context: DrawContext) {
    if (this.tile !== null) context.tile(0, 0, this.tile);
  }
}
