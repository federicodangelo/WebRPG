import { BoxContainerWidget } from "engine/widgets/ui/box.ts";
import { Font, FixedColor, Color } from "engine/types.ts";
import { TextButtonWidget } from "engine/widgets/ui/button-text.ts";

export class ButtonsContainerWidget extends BoxContainerWidget {
  private font: Font;
  private buttonForeColor: Color;
  private buttonBackColor: Color;
  private buttonPressedColor: Color;

  public constructor(
    font: Font,
    buttonsTextWidthInCharacters: number,
    borderWidth = 4,
    spaceBetweenButtons = font.tileHeight,
    buttonForeColor: Color = FixedColor.White,
    buttonBackColor = FixedColor.Green,
    buttonPressedColor = FixedColor.Yellow,
  ) {
    super(borderWidth);
    this.font = font;
    this.width = (buttonsTextWidthInCharacters + 4) * font.tileWidth;
    this.height = borderWidth * 2;
    this.childrenLayout = {
      type: "vertical",
      spacing: spaceBetweenButtons,
    };

    this.buttonForeColor = buttonForeColor;
    this.buttonBackColor = buttonBackColor;
    this.buttonPressedColor = buttonPressedColor;
  }

  public addButton(text: string, cb: () => void) {
    const button = new TextButtonWidget(
      this.font,
      text,
      this.buttonForeColor,
      this.buttonBackColor,
      this.buttonPressedColor,
      () => cb(),
    ).setLayout({ widthPercent: 100 });

    button.parent = this;
    this.height = this.border * 2 +
      this.children.map((x) => x.height).reduce(
        (acc, v) => acc + v,
        0,
      ) +
      Math.max(this.children.length - 1, 0) *
        (this.childrenLayout?.spacing || 0);

    return button;
  }
}
