import { BaseWidget } from "../widget.ts";
import { DrawContext, Sprite } from "../../types.ts";

export class SpriteWidget extends BaseWidget {
  public sprite: Sprite;

  constructor(sprite: Sprite) {
    super();
    this.sprite = sprite;
    this.width = sprite.width;
    this.height = sprite.height;
    this.pivotX = -sprite.pivotX;
    this.pivotY = -sprite.pivotY;
  }

  protected drawSelf(context: DrawContext) {
    context.sprite(0, 0, this.sprite);
  }
}
