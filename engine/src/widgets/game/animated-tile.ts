import { BaseWidget } from "../widget.ts";
import { DrawContext, Tile, Animation, Updateable } from "../../types.ts";

export class AnimatedTileWidget extends BaseWidget implements Updateable {
  public animation: Animation;
  private tile: Tile | null = null;
  private frame = 0;
  public animationFinishedCb: (() => void) | null = null;

  private nextFrameUpdateCount = 0;

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
    this.nextFrameUpdateCount = 0;

    const animation = this.animation;
    if (animation === null) return;

    this.updateCurrentTile();

    if (animation.delayInUpdates > 0 && animation.tiles.length > 1) {
      this.nextFrameUpdateCount = animation.delayInUpdates;
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
      this.nextFrameUpdateCount = 0;
      if (this.animationFinishedCb !== null) {
        this.animationFinishedCb();
      }
    }
  }

  protected drawSelf(context: DrawContext) {
    if (this.tile !== null) context.tile(0, 0, this.tile);
  }

  public onUpdate() {
    if (this.nextFrameUpdateCount > 0) {
      this.nextFrameUpdateCount--;
      if (this.nextFrameUpdateCount === 0) {
        this.updateCurrentAnimation();
      }
    }
  }
}
