import { Engine, Widget, Size, Rect, KeyEvent, Point } from "./types.ts";
import { EngineContextImpl } from "./context.ts";
import { NativeContext } from "./native-types.ts";
import { ScrollableContainerWidget } from "./widgets/scrollable.ts";

class EngineImpl implements Engine {
  private children: Widget[] = [];
  private nativeContext: NativeContext;
  private context: EngineContextImpl;
  private screenSize = new Size();
  private invalidRects: Rect[] = [];
  private mainScrollable: ScrollableContainerWidget | null = null;
  private mainScrollableOffset = new Point();

  constructor(nativeContext: NativeContext) {
    this.nativeContext = nativeContext;
    this.context = new EngineContextImpl(this.nativeContext.screen);
  }

  async init() {
    await this.nativeContext.init();
    let consoleSize = this.nativeContext.screen.getScreenSize();
    while (consoleSize === null) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1);
      });
      consoleSize = this.nativeContext.screen.getScreenSize();
    }
    this.screenSize.set(consoleSize.width, consoleSize.height);
    this.nativeContext.screen.onScreenSizeChanged(
      this.onScreenSizeChanged.bind(this),
    );
  }

  private onScreenSizeChanged(size: Size): void {
    if (!size.equals(this.screenSize)) {
      this.screenSize.set(size.width, size.height);
      this.invalidateRect(
        new Rect(0, 0, this.screenSize.width, this.screenSize.height),
      );
    }
  }

  private drawInvalidRects(): void {
    if (this.invalidRects.length == 0) return;

    var pendingLayout = true;

    const clip = new Rect();
    const consoleSize = this.screenSize;

    for (let i = 0; i < this.invalidRects.length; i++) {
      clip.copyFrom(this.invalidRects[i]);
      if (clip.x < 0) {
        clip.width += clip.x;
        clip.x = 0;
      }
      if (clip.y < 0) {
        clip.height += clip.y;
        clip.y = 0;
      }
      if (
        clip.width <= 0 ||
        clip.height <= 0 ||
        clip.x > consoleSize.width ||
        clip.y > consoleSize.height
      ) {
        continue;
      }
      if (clip.x + clip.width > consoleSize.width) {
        clip.width = consoleSize.width - clip.x;
      }
      if (clip.y + clip.height > consoleSize.height) {
        clip.height = consoleSize.height - clip.y;
      }

      if (pendingLayout) {
        pendingLayout = false;
        this.updateLayout();
      }

      this.context.beginClip(clip.x, clip.y, clip.width, clip.height);

      for (let i = 0; i < this.children.length; i++) {
        this.children[i].draw(this.context);
      }

      this.context.endClip();
    }

    this.invalidRects.length = 0;
  }

  public draw() {
    this.context.beginDraw();

    this.drawInvalidRects();

    if (this.mainScrollable !== null) {
      const dx = this.mainScrollableOffset.x - this.mainScrollable.offsetX;
      const dy = this.mainScrollableOffset.y - this.mainScrollable.offsetY;
      if (dx !== 0 || dy !== 0) {
        const bbox = this.mainScrollable.getBoundingBox();

        if (Math.abs(dx) < bbox.width && Math.abs(dy) < bbox.height) {
          this.mainScrollable.setOffset(
            this.mainScrollableOffset.x,
            this.mainScrollableOffset.y,
            false,
          );

          this.nativeContext.screen.scrollRect(
            bbox.x,
            bbox.y,
            bbox.width,
            bbox.height,
            dx,
            dy,
          );

          if (dy > 0) {
            this.invalidRects.push(
              new Rect(bbox.x, bbox.y, bbox.width, dy),
            );
          } else if (dy < 0) {
            this.invalidRects.push(
              new Rect(bbox.x, bbox.y + bbox.height + dy, bbox.width, -dy),
            );
          }

          if (dx > 0) {
            this.invalidRects.push(
              new Rect(bbox.x, bbox.y, dx, bbox.height),
            );
          } else if (dx < 0) {
            this.invalidRects.push(
              new Rect(bbox.x + bbox.width + dx, bbox.y, -dx, bbox.height),
            );
          }
        } else {
          this.mainScrollable.setOffset(
            this.mainScrollableOffset.x,
            this.mainScrollableOffset.y,
          );
        }

        this.drawInvalidRects();
      }
    }

    this.context.endDraw();
  }

  private updateLayout() {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateLayout(
        this.screenSize.width,
        this.screenSize.height,
      );
    }
  }

  public update(): void {}

  public addWidget(widget: Widget): void {
    this.children.push(widget);
    widget.engine = this;
    widget.updateLayout(this.screenSize.width, this.screenSize.height);
    this.invalidateRect(widget.getBoundingBox());
  }

  public removeWidget(widget: Widget): void {
    const ix = this.children.indexOf(widget);
    if (ix >= 0) this.children.splice(ix, 1);
    this.invalidateRect(widget.getBoundingBox());
  }

  public onKeyEvent(listener: (e: KeyEvent) => void): void {
    this.nativeContext.input.onKeyEvent(listener);
  }

  public invalidateRect(rect: Rect) {
    let lastRect = this.invalidRects.length > 0
      ? this.invalidRects[this.invalidRects.length - 1]
      : null;

    if (lastRect !== null && lastRect.intersects(rect)) {
      lastRect.union(rect);
      return;
    }

    this.invalidRects.push(rect.clone());
  }

  public destroy() {
    this.nativeContext.destroy();
  }

  public setMainScrollable(scrollable: ScrollableContainerWidget): void {
    this.mainScrollable = scrollable;
  }

  public setMainScroll(offsetX: number, offsetY: number): void {
    this.mainScrollableOffset.x = offsetX;
    this.mainScrollableOffset.y = offsetY;
  }
}

export async function buildEngine(nativeContext: NativeContext) {
  const engine = new EngineImpl(nativeContext);
  await engine.init();
  return engine;
}

export function destroyEngine(engine: Engine) {
  (engine as EngineImpl).destroy();
}
