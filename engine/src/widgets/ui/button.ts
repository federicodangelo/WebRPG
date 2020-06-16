import { Color, DrawContext, Font, EngineMouseEvent } from "../../types.ts";
import { BaseWidgetContainer } from "../widget-container.ts";

export class ButtonWidget extends BaseWidgetContainer {
  public backColor: Color;
  public pressedColor: Color;
  public onTapped: (() => void) | null = null;

  constructor(
    backColor: Color,
    pressedColor: Color,
    onTapped: (() => void) | null = null,
  ) {
    super();
    this.backColor = backColor;
    this.pressedColor = pressedColor;
    this.onTapped = onTapped;
  }

  protected drawSelf(context: DrawContext) {
    const backColor = this.down ? this.pressedColor : this.backColor;
    context.fillRect(0, 0, this.width, this.height, backColor);
  }

  protected down: boolean = false;

  public mouse(e: EngineMouseEvent) {
    switch (e.type) {
      case "down":
        this.down = true;
        this.invalidate();
        break;
      case "up-out":
        this.down = false;
        this.invalidate();
        break;
      case "up":
        if (this.down) {
          this.down = false;
          this.invalidate();
          if (this.onTapped !== null) this.onTapped();
        }
        break;
    }
  }
}
