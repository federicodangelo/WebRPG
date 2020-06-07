import { BaseWidget } from "./widget.ts";
import {
  DrawContext,
  Tile,
  Animation,
  Animations,
} from "../types.ts";

function buildDefaultSequence(len: number) {
  const seq: number[] = [];
  for (let i = 0; i < len; i++) seq.push(i);
  return seq;
}

export class AnimatedTileWidget extends BaseWidget {
  public animationId: string;

  private animations: Animations;
  private animation: Animation | null;
  private tile: Tile | null = null;
  private frame = 0;
  private lastTimeoutCB = -1;

  constructor(animations: Animations, defaultAnimationId: string) {
    super();
    this.animationId = defaultAnimationId;
    this.animations = animations;
    this.animation = animations.get(defaultAnimationId) || null;
    this.updateCurrentTile(true);
  }

  public setAnimation(id: string) {
    this.animationId = id;
    const newAnimation = this.animations.get(id) || null;

    if (newAnimation !== this.animation) {
      this.animation = newAnimation;
      this.frame = 0;
      this.updateCurrentTile();
    }
  }

  private updateCurrentTile(first = false) {
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
