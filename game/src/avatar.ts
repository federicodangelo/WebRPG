import { GroupContainerWidget } from "../../engine/src/widgets/group.ts";
import { Assets, Animation } from "../../engine/src/types.ts";
import { AnimatedTileWidget } from "../../engine/src/widgets/animated-tile.ts";

const WALK_SPEED = 4;

export class Avatar extends GroupContainerWidget {
  private avatarAnimations: AnimatedTileWidget;
  private shadowAnimations: AnimatedTileWidget;

  private lastX: number = 0;
  private lastY: number = 0;
  private assets: Assets;
  private avatarId: string;
  private direction: string = "down";
  private action: string = "";

  private blockingAction: boolean = false;
  private canMove_: boolean = true;
  private nextAction: string = "";

  public get canMove(): boolean {
    return this.canMove_;
  }

  constructor(avatarId: string, assets: Assets) {
    super();
    this.avatarId = avatarId;
    this.assets = assets;
    this.avatarAnimations = new AnimatedTileWidget(
      assets.getAnimation(avatarId + "-" + this.direction),
    );
    this.shadowAnimations = new AnimatedTileWidget(
      assets.getAnimation("shadows-down"),
    );

    this.avatarAnimations.animationFinishedCb = () =>
      this.onAnimationFinished();

    this.shadowAnimations.parent = this;
    this.shadowAnimations.y = 3;
    this.avatarAnimations.parent = this;

    this.pivotX = -Math.floor(this.avatarAnimations.width / 2);
    this.pivotY = -Math.floor((this.avatarAnimations.height * 7) / 8);

    this.width = this.avatarAnimations.width;
    this.height = this.avatarAnimations.height + 3;
  }

  private playAnimations() {
    this.avatarAnimations.setAnimation(
      this.assets.getAnimation(
        this.avatarId + "-" + this.direction +
          (this.action ? "-" + this.action : ""),
      ),
    );
    this.shadowAnimations.setAnimation(
      this.assets.getAnimation(
        "shadows" + "-" + this.direction +
          (this.action ? "-" + this.action : ""),
      ),
    );
  }

  private setDirection(direction: string) {
    this.direction = direction;
  }

  private setAction(action: string) {
    this.action = action;
  }

  private onAnimationFinished() {
    if (this.blockingAction) {
      this.setAction("");
      this.nextAction = "";
      this.canMove_ = true;
      this.blockingAction = false;
    }
  }

  public updateAnimations() {
    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;

    if (dx < 0) {
      this.setDirection("left");
    } else if (dx > 0) {
      this.setDirection("right");
    } else if (dy < 0) {
      this.setDirection("up");
    } else if (dy > 0) {
      this.setDirection("down");
    }

    if (dx !== 0 || dy !== 0) {
      this.setAction("walking");
    } else if (this.blockingAction) {
      this.setAction(this.nextAction);
    } else {
      this.setAction("");
    }

    this.playAnimations();

    this.lastX = this.x;
    this.lastY = this.y;
  }

  public move(dx: number, dy: number) {
    if (this.canMove) {
      this.x += dx * WALK_SPEED;
      this.y += dy * WALK_SPEED;
    }
  }

  public shoot() {
    if (this.canMove) {
      this.blockingAction = true;
      this.canMove_ = false;
      this.nextAction = "shoot";
    }
  }

  public slash() {
    if (this.canMove) {
      this.blockingAction = true;
      this.canMove_ = false;
      this.nextAction = "slash";
    }
  }
}
