import {
  Engine,
  Widget,
  Size,
  Rect,
  EngineKeyEvent,
  Point,
  EngineMouseEvent,
  DrawStats,
  LayerId,
  LAYERS_COUNT,
  EngineMouseEventType,
  DrawNativeParams,
} from "./types.ts";
import { EngineContextImpl } from "./context.ts";
import { NativeContext } from "./native-types.ts";
import { ScrollableContainerWidget } from "./widgets/scrollable.ts";

class EngineLayer {
  public id: LayerId;
  public invalidRects: Rect[] = [];
  public children: Widget[] = [];
  public onNextDrawNative: ((params: DrawNativeParams) => void)[] = [];
  constructor(id: LayerId) {
    this.id = id;
  }
}

class EngineImpl implements Engine {
  private nativeContext: NativeContext;
  private context: EngineContextImpl;
  private screenSize = new Size();
  private layers: EngineLayer[] = [];
  private scrollables = new Map<ScrollableContainerWidget, Point>();

  constructor(nativeContext: NativeContext) {
    this.nativeContext = nativeContext;
    this.context = new EngineContextImpl(this.nativeContext.screen);
    this.nativeContext.input.onMouseEvent((e) => this.onMouseEventInternal(e));

    for (let i = 0; i < LAYERS_COUNT; i++) {
      this.layers.push(new EngineLayer(i));
    }
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
      for (let i = 0; i < this.layers.length; i++) {
        this.invalidateRect(
          new Rect(0, 0, this.screenSize.width, this.screenSize.height),
          this.layers[i].id,
        );
      }
    }
  }

  private drawInvalidRects(layer: EngineLayer) {
    let drawnRects = 0;
    let drawnArea = 0;

    if (layer.invalidRects.length > 0) {
      let pendingLayout = true;

      const clip = new Rect();
      const screenSize = this.screenSize;
      const children = layer.children;

      for (let i = 0; i < layer.invalidRects.length; i++) {
        clip.copyFrom(layer.invalidRects[i]);
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
          clip.x > screenSize.width ||
          clip.y > screenSize.height
        ) {
          continue;
        }

        if (clip.x + clip.width > screenSize.width) {
          clip.width = screenSize.width - clip.x;
        }
        if (clip.y + clip.height > screenSize.height) {
          clip.height = screenSize.height - clip.y;
        }

        if (pendingLayout) {
          pendingLayout = false;
          this.updateLayout(layer);
        }

        drawnRects++;
        drawnArea += clip.width * clip.height;

        this.context.beginClip(clip.x, clip.y, clip.width, clip.height);

        for (let i = 0; i < children.length; i++) {
          children[i].draw(this.context);
        }

        this.context.endClip();
      }

      layer.invalidRects.length = 0;
    }

    return { drawnRects, drawnArea };
  }

  private drawOnNextDrawNative(layer: EngineLayer) {
    let drawnRects = 0;
    let drawnArea = 0;

    for (let i = 0; i < layer.onNextDrawNative.length; i++) {
      layer.onNextDrawNative[i]({
        context: this.nativeContext.screen,
        invalidateRect: (rect) => layer.invalidRects.push(rect),
      });

      const stats = this.drawInvalidRects(layer);

      drawnRects += stats.drawnRects;
      drawnArea += stats.drawnArea;
    }

    layer.onNextDrawNative.length = 0;

    return {
      drawnRects,
      drawnArea,
    };
  }

  public draw(): DrawStats {
    const startTime = performance.now();

    this.context.beginDraw();

    let drawnRects = 0;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      this.context.setTargetLayer(layer.id);

      let { drawnRects: drawnRects1 } = this.drawInvalidRects(layer);
      drawnRects += drawnRects1;
      let { drawnRects: drawnRects2 } = this.drawOnNextDrawNative(layer);
      drawnRects += drawnRects2;
    }

    this.context.endDraw();

    const endTime = performance.now();

    return {
      time: endTime - startTime,
      rects: drawnRects,
    };
  }

  private updateLayout(layer: EngineLayer) {
    for (let i = 0; i < layer.children.length; i++) {
      layer.children[i].updateLayout(
        this.screenSize.width,
        this.screenSize.height,
      );
    }
  }

  public update(): void {}

  public addWidget(widget: Widget, layer: LayerId): void {
    widget.layer = layer;
    this.layers[layer].children.push(widget);
    widget.engine = this;
    widget.updateLayout(this.screenSize.width, this.screenSize.height);
    this.invalidateRect(widget.getBoundingBox(), widget.layer);
  }

  public removeWidget(widget: Widget): void {
    const layer = this.layers[widget.layer];

    const ix = layer.children.indexOf(widget);
    if (ix >= 0) layer.children.splice(ix, 1);
    this.invalidateRect(widget.getBoundingBox(), layer.id);
  }

  public onKeyEvent(listener: (e: EngineKeyEvent) => void): void {
    this.nativeContext.input.onKeyEvent(listener);
  }

  public onMouseEvent(listener: (e: EngineMouseEvent) => void): void {
    this.nativeContext.input.onMouseEvent(listener);
  }

  public invalidateRect(rect: Rect, layer: LayerId) {
    const invalidRects = this.layers[layer].invalidRects;

    let lastRect = invalidRects.length > 0
      ? invalidRects[invalidRects.length - 1]
      : null;

    if (lastRect !== null && lastRect.intersects(rect)) {
      lastRect.union(rect);
      return;
    }

    invalidRects.push(rect.clone());
  }

  public destroy() {
    this.nativeContext.destroy();
  }

  public onNextDrawNative(
    layer: LayerId,
    cb: (params: DrawNativeParams) => void,
  ): void {
    this.layers[layer].onNextDrawNative.push(cb);
  }

  public getWidgetAt(x: number, y: number): Widget | null {
    for (let l = this.layers.length - 1; l >= 0; l--) {
      const children = this.layers[l].children;
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        const w = child.getAt(x - child.visibleX, y - child.visibleY);
        if (w !== null) return w;
      }
    }

    return null;
  }

  private lastWidgetUnderMouse: Widget | null = null;
  private lastWidgetUnderMouseEventType: EngineMouseEventType = "move";

  private onMouseEventInternal(e: EngineMouseEvent): void {
    const w = this.getWidgetAt(e.x, e.y);

    if (
      w !== this.lastWidgetUnderMouse &&
      this.lastWidgetUnderMouse !== null &&
      this.lastWidgetUnderMouseEventType !== "up"
    ) {
      const bbox = this.lastWidgetUnderMouse.getBoundingBox();
      this.lastWidgetUnderMouse.mouse(
        { type: "out", x: e.x - bbox.x, y: e.y - bbox.y },
      );
      this.lastWidgetUnderMouse = null;
    }

    if (w !== null) {
      const bbox = w.getBoundingBox();
      w.mouse({ type: e.type, x: e.x - bbox.x, y: e.y - bbox.y });
      this.lastWidgetUnderMouse = w;
      this.lastWidgetUnderMouseEventType = e.type;
    }
  }

  public setFullscreen(fullscreen: boolean): void {
    this.nativeContext.screen.setFullscreen(fullscreen);
  }

  public toggleStats(): void {
    this.nativeContext.screen.toggleStats();
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
