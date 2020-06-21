import { ScrollableContainerWidget, MouseScrollType } from "./scrollable.ts";
import { Widget, Intensity } from "../types.ts";

export class ItemsContainerWidget<T, W extends Widget>
  extends ScrollableContainerWidget {
  private _items: T[] = [];
  private _itemsWidgets = new Map<T, W>();
  private itemWidgetBuilder: (tile: T) => W;
  private itemWidth: number;
  private itemHeight: number;

  public set items(val: T[]) {
    this._items = [...val];
    this.updateItems();
  }

  public get items() {
    return this._items;
  }

  public get itemsWidgets() {
    return this._itemsWidgets;
  }

  constructor(
    spacing: number,
    horizontal: boolean,
    itemWidth: number,
    itemHeight: number,
    itemWidgetBuilder: (tile: T) => W,
  ) {
    super();
    this.itemWidgetBuilder = itemWidgetBuilder;
    this.itemWidth = itemWidth;
    this.itemHeight = itemHeight;
    this.childrenLayout = {
      type: horizontal ? "horizontal" : "vertical",
      spacing,
    };
    this.mouseScrollType = horizontal
      ? MouseScrollType.Horizontal
      : MouseScrollType.Vertical;

    const itemMainSize = horizontal ? itemWidth : itemHeight;

    this.layout = {
      widthPercent: 100,
      heightPercent: 100,
      customSizeFn: (w) => {
        const allItemsSize = this._items.length * (itemMainSize + spacing);
        this.mouseScrollLimits = {
          from: Math.min(
            itemMainSize / 2,
            -allItemsSize + (horizontal ? w.width : w.height) -
              itemMainSize / 2,
          ) | 0,
          to: (itemMainSize / 2) | 0,
        };
      },
    };
  }

  private updateItems() {
    this._itemsWidgets.forEach((w) => w.parent = null);
    this._itemsWidgets.clear();

    for (let i = 0; i < this._items.length; i++) {
      const w = this.itemWidgetBuilder(this._items[i]);
      w.height = this.itemHeight;
      w.width = this.itemWidth;
      w.parent = this;
      this._itemsWidgets.set(this._items[i], w);
    }

    this.invalidate();
  }
}
