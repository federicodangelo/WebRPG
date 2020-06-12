import { BaseWidget } from "./widget.ts";
import { DrawContext, Tile, Animation } from "../types.ts";

export class AnimatedTileWidget extends BaseWidget {
  public animation: Animation;
  private tile: Tile | null = null;
  private frame = 0;
  private lastSetIntervalHandle: number | null = null;
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
      this.updateCurrentAnimation();
    }
  }

  private updateCurrentAnimation() {
    if (this.lastSetIntervalHandle !== null) {
      clearInterval(this.lastSetIntervalHandle);
      this.lastSetIntervalHandle = null;
    }

    const animation = this.animation;
    if (animation === null) return;

    this.updateCurrentTile();

    if (animation.delay > 0 && animation.tiles.length > 1) {
      this.lastSetIntervalHandle = setInterval(
        this.updateCurrentTile.bind(this),
        animation.delay,
      );
    }
  }

  private updateCurrentTile() {
    const animation = this.animation;
    if (animation === null) return;

    const newTile = this.animation.loops
      ? animation.tiles[this.frame % animation.tiles.length]
      : animation.tiles[
        this.frame < animation.tiles.length
          ? this.frame
          : animation.tiles.length - 1
      ];

    if (newTile !== this.tile) {
      this.tile = newTile;
      this.width = newTile.width;
      this.height = newTile.height;
      this.invalidate();
    }
    this.frame++;

    if (
      !this.animation.loops &&
      this.frame === animation.tiles.length
    ) {
      if (this.lastSetIntervalHandle !== null) {
        clearInterval(this.lastSetIntervalHandle);
        this.lastSetIntervalHandle = null;
      }
      if (this.animationFinishedCb !== null) {
        this.animationFinishedCb();
      }
    }
  }

  protected drawSelf(context: DrawContext) {
    if (this.tile !== null) context.tile(0, 0, this.tile);
  }
}
