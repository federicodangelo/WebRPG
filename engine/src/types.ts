export const enum SpecialChar {
  //Block
  FullBlock,
  BottomHalfBlock,
  TopHalfBlock,
  LeftHalfBlock,
  RightHalfBlock,

  //Shade
  LightShade,
  MediumShade,
  DarkShade,

  //Single Line
  Vertical,
  Horizontal,
  CornerTopLeft,
  CornerTopRight,
  CornerBottomLeft,
  CornerBottomRight,
  ConnectorVerticalLeft,
  ConnectorVerticalRight,
  ConnectorHorizontalTop,
  ConnectorHorizontalBottom,
  ConnectorCross,

  //Double Line
  DoubleVertical,
  DoubleHorizontal,
  DoubleCornerTopLeft,
  DoubleCornerTopRight,
  DoubleCornerBottomLeft,
  DoubleCornerBottomRight,
  DoubleConnectorVerticalLeft,
  DoubleConnectorVerticalRight,
  DoubleConnectorHorizontalTop,
  DoubleConnectorHorizontalBottom,
  DoubleConnectorCross,
}

export class FixedColor {
  static Transparent = rgba(0, 0, 0, 0);
  static Black = rgb(12, 12, 12);
  static Red = rgb(197, 15, 31);
  static Green = rgb(19, 161, 14);
  static Yellow = rgb(193, 156, 0);
  static Blue = rgb(0, 55, 218);
  static Magenta = rgb(136, 23, 152);
  static Cyan = rgb(58, 150, 221);
  static White = rgb(204, 204, 204);

  static BrightBlack = rgb(118, 118, 118);
  static BrightRed = rgb(231, 72, 86);
  static BrightGreen = rgb(22, 198, 12);
  static BrightYellow = rgb(249, 241, 165);
  static BrightBlue = rgb(59, 120, 255);
  static BrightMagenta = rgb(180, 0, 158);
  static BrightCyan = rgb(97, 214, 214);
  static BrightWhite = rgb(242, 242, 242);
}

export const enum Intensity {
  I0 = 0,
  I20 = (255 * 1 / 5) & 0xFF,
  I40 = (255 * 2 / 5) & 0xFF,
  I60 = (255 * 3 / 5) & 0xFF,
  I80 = (255 * 4 / 5) & 0xFF,
  I100 = 255,
}

export type RGB = number;

export type Color = RGB;

export function rgb(r: number, g: number, b: number): RGB {
  return rgba(r, g, b, 255);
}

export function rgba(r: number, g: number, b: number, a: number): RGB {
  return (
    (a << 24) | // alpha
    (b << 16) | // blue
    (g << 8) | // green
    r
  );
}

export interface WidgetLayout {
  widthPercent?: number;
  heightPercent?: number;
  horizontalSpacingPercent?: number; //0 <- left, 50 <- center, 100 <- right
  verticalSpacingPercent?: number; //0 <- top, 50 <- center, 100 <- bottom
  customSizeFn?: (
    widget: Widget,
    parentWidth: number,
    parentHeight: number,
  ) => void;
  customPositionFn?: (
    widget: Widget,
    parentWidth: number,
    parentHeight: number,
  ) => void;
}

export interface ChildrenLayout {
  type: "absolute" | "vertical" | "horizontal" | "none";
  spacing?: number;
}

export interface WidgetContainer extends Widget {
  readonly children: Widget[];
  readonly innerX: number;
  readonly innerY: number;
  readonly innerWidth: number;
  readonly innerHeight: number;
  childrenLayout: ChildrenLayout | null;
  setChildrenLayout(layout: ChildrenLayout | null): Widget;
}

export interface Widget {
  engine: Engine | null;
  x: number;
  y: number;
  width: number;
  height: number;
  pivotX: number;
  pivotY: number;
  parent: WidgetContainer | null;
  updateLayout(parentWidth: number, parentHeight: number): void;
  draw(context: EngineContext): void;
  layout: WidgetLayout | null;
  setLayout(layout: WidgetLayout | null): Widget;
  getBoundingBox(): Rect;
  invalidate(): void;
}

export class Point {
  public x: number;
  public y: number;

  public constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  public copyFrom(p: Point) {
    this.x = p.x;
    this.y = p.y;
    return this;
  }

  public equals(p: Point) {
    return this.x === p.x &&
      this.y === p.y;
  }

  public clone() {
    return new Point(this.x, this.y);
  }
}

export class Size {
  public width: number;
  public height: number;

  public constructor(width: number = 0, height: number = 0) {
    this.width = width;
    this.height = height;
  }

  public set(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }

  public copyFrom(size: Size) {
    this.width = size.width;
    this.height = size.height;
    return this;
  }

  public equals(size: Size) {
    return this.width === size.width &&
      this.height === size.height;
  }

  public clone() {
    return new Size(this.width, this.height);
  }
}

export class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public get x1() {
    return this.x + this.width;
  }

  public get y1() {
    return this.y + this.height;
  }

  public constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public set(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  public copyFrom(rect: Rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
    return this;
  }

  public equals(rect: Rect) {
    return this.x === rect.x &&
      this.y === rect.y &&
      this.width === rect.width &&
      this.height === rect.height;
  }

  public intersects(rect: Rect) {
    return !(this.x1 < rect.x ||
      this.y1 < rect.y ||
      this.x > rect.x1 ||
      this.y > rect.y1);
  }

  public union(rect: Rect) {
    const x0 = Math.min(this.x, rect.x);
    const y0 = Math.min(this.y, rect.y);
    const x1 = Math.max(this.x1, rect.x1);
    const y1 = Math.max(this.y1, rect.y1);

    this.x = x0;
    this.y = y0;
    this.width = x1 - x0;
    this.height = y1 - y0;
  }

  public minDistanceTo(rect: Rect) {
    return Math.min();
  }

  public clone() {
    return new Rect(this.x, this.y, this.width, this.height);
  }
}

export type TileSetType = "color" | "blackandwhite";

export type Tilemap = {
  id: string;
  tiles: Tile[];
  tilesById: Map<string, Tile>;
  type: TileSetType;
  tileWidth: number;
  tileHeight: number;
};

export type Tile = {
  id: string;
  tilemap: Tilemap;
  index: number;
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  pixels32: Uint32Array;
};

export type Animation = {
  id: string;
  tiles: Tile[];
  sequence: number[];
  delay: number;
};

export type Font = Tilemap;

export type Fonts = Map<string, Font>;

export type Animations = Map<string, Animation>;

export type Tilemaps = Map<string, Tilemap>;

export type Assets = {
  fonts: Fonts;
  tilemaps: Tilemaps;
  animations: Animations;
  defaultFont: Font;
  getTilemap(id: string): Tilemap;
  getFont(id: string): Font;
  getAnimation(id: string): Animation;
};

export interface DrawContext {
  //Text API
  moveCursorTo(x: number, y: number): EngineContext;

  textColor(foreColor: Color, backColor: Color): EngineContext;
  resetTextColor(): EngineContext;

  text(font: Font, str: string): EngineContext;

  char(font: Font, code: number): EngineContext;
  charTimes(font: Font, code: number, times: number): EngineContext;

  specialChar(font: Font, code: SpecialChar): EngineContext;
  specialCharTimes(
    font: Font,
    code: SpecialChar,
    times: number,
  ): EngineContext;

  textBorder(
    font: Font,
    x: number,
    y: number,
    width: number,
    height: number,
  ): EngineContext;

  fillChar(
    font: Font,
    x: number,
    y: number,
    width: number,
    height: number,
    char: string,
  ): EngineContext;

  //Tile API
  tile(x: number, y: number, t: Tile): EngineContext;

  fillTile(
    x: number,
    y: number,
    width: number,
    height: number,
    t: Tile,
  ): EngineContext;
}

export interface EngineContext extends DrawContext {
  isVisible(x: number, y: number, width: number, height: number): boolean;

  pushTransform(x: number, y: number): void;
  popTransform(): void;

  pushClip(x: number, y: number, width: number, height: number): void;
  popClip(): void;
}

export interface Engine {
  draw(): void;
  update(): void;
  addWidget(widget: Widget): void;
  removeWidget(widget: Widget): void;
  invalidateRect(rect: Rect): void;
  onInput(listener: (input: string) => void): void;
}
