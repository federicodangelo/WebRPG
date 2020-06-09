import { GroupContainerWidget } from "../../engine/src/widgets/group.ts";
import { Assets, Animation } from "../../engine/src/types.ts";
import { TileWidget } from "../../engine/src/widgets/tile.ts";
import { AnimatedTileWidget } from "../../engine/src/widgets/animated-tile.ts";

export class Avatar extends GroupContainerWidget {
  private animations: AnimatedTileWidget;

  private lastX: number = 0;
  private lastY: number = 0;
  private assets: Assets;

  constructor(assets: Assets) {
    super();
    this.assets = assets;
    this.animations = new AnimatedTileWidget(assets.getAnimation("down"));
    const shadow = new TileWidget(assets.getTilemap("shadows").tiles[0]);

    shadow.parent = this;
    shadow.y = 4;
    this.animations.parent = this;

    this.pivotX = -Math.floor(this.animations.width / 2);
    this.pivotY = -Math.floor((this.animations.height * 7) / 8);

    this.width = this.animations.width;
    this.height = this.animations.height + 4;
  }

  public get animation() {
    return this.animations.animation;
  }

  public setAnimation(animation: Animation) {
    this.animations.setAnimation(animation);
  }

  public updateAnimations() {
    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    if (dx < 0) {
      this.setAnimation(this.assets.getAnimation("left-walking"));
    } else if (dx > 0) {
      this.setAnimation(this.assets.getAnimation("right-walking"));
    } else if (dy < 0) {
      this.setAnimation(this.assets.getAnimation("up-walking"));
    } else if (dy > 0) {
      this.setAnimation(this.assets.getAnimation("down-walking"));
    } else if (this.animation.id.endsWith("-walking")) {
      this.setAnimation(
        this.assets.getAnimation(this.animation.id.replace("-walking", "")),
      );
    }

    this.lastX = this.x;
    this.lastY = this.y;
  }
}
