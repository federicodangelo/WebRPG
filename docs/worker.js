// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

System.register("engine/src/widgets/widget", ["engine/src/types"], function (exports_1, context_1) {
    "use strict";
    var types_ts_1, BaseWidget;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (types_ts_1_1) {
                types_ts_1 = types_ts_1_1;
            }
        ],
        execute: function () {
            BaseWidget = class BaseWidget {
                constructor() {
                    this._x = 0;
                    this._y = 0;
                    this._width = 0;
                    this._height = 0;
                    this._pivotX = 0;
                    this._pivotY = 0;
                    this._layer = 0;
                    this._parent = null;
                    this._engine = null;
                    this._boundingBox = new types_ts_1.Rect();
                    this._solid = true;
                    this.layout = null;
                }
                setLayout(layout) {
                    this.layout = layout;
                    return this;
                }
                get engine() {
                    return this._engine;
                }
                set engine(val) {
                    if (val !== this._engine) {
                        this._engine = val;
                    }
                }
                get solid() {
                    return this._solid;
                }
                set solid(val) {
                    if (val !== this._solid) {
                        this._solid = val;
                    }
                }
                get x() {
                    return this._x;
                }
                set x(v) {
                    if (v !== this._x) {
                        this.invalidate();
                        this._x = Math.trunc(v);
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get y() {
                    return this._y;
                }
                set y(v) {
                    if (v !== this._y) {
                        this.invalidate();
                        this._y = Math.trunc(v);
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get width() {
                    return this._width;
                }
                set width(v) {
                    if (v !== this._width) {
                        this.invalidate();
                        this._width = Math.trunc(v);
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get height() {
                    return this._height;
                }
                set height(v) {
                    if (v !== this._height) {
                        this.invalidate();
                        this._height = Math.trunc(v);
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get pivotX() {
                    return this._pivotX;
                }
                set pivotX(v) {
                    if (v !== this._pivotX) {
                        this.invalidate();
                        this._pivotX = Math.trunc(v);
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get pivotY() {
                    return this._pivotY;
                }
                set pivotY(v) {
                    if (v !== this._pivotY) {
                        this.invalidate();
                        this._pivotY = Math.trunc(v);
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get visibleX() {
                    return this._x + this._pivotX;
                }
                get visibleY() {
                    return this._y + this._pivotY;
                }
                get layer() {
                    return this._layer;
                }
                set layer(v) {
                    if (v !== this._layer) {
                        this._layer = v;
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get parent() {
                    return this._parent;
                }
                set parent(v) {
                    if (v !== this._parent) {
                        this.invalidate();
                        if (this._parent !== null) {
                            const index = this._parent.children.indexOf(this);
                            if (index >= 0)
                                this._parent.children.splice(index, 1);
                        }
                        this._parent = v;
                        if (this._parent !== null) {
                            this._parent.children.push(this);
                            this.engine = this._parent.engine;
                            this._parent.onChildrenAdded(this);
                        }
                        else {
                            this.engine = null;
                        }
                        this.invalidate();
                    }
                }
                updateLayout(parentWidth, parentHeight) {
                    const layout = this.layout;
                    if (layout !== null) {
                        if (layout.heightPercent !== undefined) {
                            this.height = Math.ceil((parentHeight * layout.heightPercent) / 100);
                        }
                        if (layout.widthPercent !== undefined) {
                            this.width = Math.ceil((parentWidth * layout.widthPercent) / 100);
                        }
                        if (layout.customSizeFn !== undefined) {
                            layout.customSizeFn(this, parentWidth, parentHeight);
                        }
                        if (layout.horizontalSpacingPercent !== undefined) {
                            this.x = Math.floor(((parentWidth - this.width) * layout.horizontalSpacingPercent) / 100);
                        }
                        if (layout.verticalSpacingPercent !== undefined) {
                            this.y = Math.floor(((parentHeight - this.height) * layout.verticalSpacingPercent) / 100);
                        }
                        if (layout.customPositionFn !== undefined) {
                            layout.customPositionFn(this, parentWidth, parentHeight);
                        }
                    }
                }
                draw(context) {
                    if (!context.isVisible(this.visibleX, this.visibleY, this.width, this.height)) {
                        return;
                    }
                    context.pushTransform(this.visibleX, this.visibleY);
                    context.pushClip(0, 0, this.width, this.height);
                    context.moveCursorTo(0, 0);
                    this.drawSelf(context);
                    context.popClip();
                    context.popTransform();
                }
                getBoundingBox() {
                    this._boundingBox.set(this.visibleX, this.visibleY, this.width, this.height);
                    let p = this._parent;
                    while (p !== null) {
                        this._boundingBox.x += p.visibleX + p.innerX;
                        this._boundingBox.y += p.visibleY + p.innerY;
                        p = p.parent;
                    }
                    return this._boundingBox;
                }
                invalidate() {
                    const engine = this.engine;
                    const bbox = this.getBoundingBox();
                    engine?.invalidateRect(bbox);
                }
                mouse(e) { }
                getAt(x, y) {
                    if (!this.solid)
                        return null;
                    if (x < 0 || y < 0 || x > this.width || y > this.height)
                        return null;
                    return this;
                }
            };
            exports_1("BaseWidget", BaseWidget);
        }
    };
});
System.register("engine/src/widgets/widget-container", ["engine/src/widgets/widget"], function (exports_2, context_2) {
    "use strict";
    var widget_ts_1, BaseWidgetContainer;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (widget_ts_1_1) {
                widget_ts_1 = widget_ts_1_1;
            }
        ],
        execute: function () {
            BaseWidgetContainer = class BaseWidgetContainer extends widget_ts_1.BaseWidget {
                constructor() {
                    super(...arguments);
                    this._children = [];
                    this.childrenLayout = null;
                }
                setChildrenLayout(layout) {
                    this.childrenLayout = layout;
                    return this;
                }
                get engine() {
                    return super.engine;
                }
                set engine(val) {
                    if (val !== this.engine) {
                        super.engine = val;
                        for (let i = 0; i < this._children.length; i++) {
                            this._children[i].engine = val;
                        }
                    }
                }
                get innerX() {
                    return 0;
                }
                get innerY() {
                    return 0;
                }
                get innerWidth() {
                    return this.width;
                }
                get innerHeight() {
                    return this.height;
                }
                get children() {
                    return this._children;
                }
                updateLayout(parentWidth, parentHeight) {
                    super.updateLayout(parentWidth, parentHeight);
                    if (this.childrenLayout === null ||
                        this.childrenLayout.type === "absolute") {
                        for (let i = 0; i < this.children.length; i++) {
                            this.children[i].updateLayout(this.innerWidth, this.innerHeight);
                        }
                    }
                    else if (this.childrenLayout.type === "vertical") {
                        const spacing = this.childrenLayout.spacing || 0;
                        let top = 0;
                        for (let i = 0; i < this.children.length; i++) {
                            this.children[i].updateLayout(this.innerWidth, this.innerHeight);
                            this.children[i].x = 0;
                            this.children[i].y = top;
                            top += this.children[i].height + spacing;
                        }
                    }
                    else if (this.childrenLayout.type === "horizontal") {
                        const spacing = this.childrenLayout.spacing || 0;
                        let left = 0;
                        for (let i = 0; i < this.children.length; i++) {
                            this.children[i].updateLayout(this.innerWidth, this.innerHeight);
                            this.children[i].y = 0;
                            this.children[i].x = left;
                            left += this.children[i].width + spacing;
                        }
                    }
                    //The last option is "none".. so we don't do anything
                }
                getAt(x, y) {
                    if (!this.solid)
                        return null;
                    if (x < 0 || y < 0 || x > this.width || y > this.height)
                        return null;
                    for (let i = this._children.length - 1; i >= 0; i--) {
                        const child = this._children[i];
                        const w = child.getAt(x - this.innerX - child.visibleX, y - this.innerY - child.visibleY);
                        if (w !== null)
                            return w;
                    }
                    return this;
                }
                draw(context) {
                    if (!context.isVisible(this.visibleX, this.visibleY, this.width, this.height)) {
                        return;
                    }
                    context.pushTransform(this.visibleX, this.visibleY);
                    context.pushClip(0, 0, this.width, this.height);
                    context.moveCursorTo(0, 0);
                    this.drawSelf(context);
                    this.preDrawChildren(context);
                    for (let i = 0; i < this._children.length; i++) {
                        this._children[i].draw(context);
                    }
                    this.postDrawChildren(context);
                    context.popClip();
                    context.popTransform();
                }
                preDrawChildren(context) { }
                postDrawChildren(context) { }
                onChildrenTransformChanged(child) { }
                onChildrenAdded(child) { }
            };
            exports_2("BaseWidgetContainer", BaseWidgetContainer);
        }
    };
});
System.register("engine/src/widgets/scrollable", ["engine/src/types", "engine/src/widgets/widget-container"], function (exports_3, context_3) {
    "use strict";
    var types_ts_2, widget_container_ts_1, ScrollableContainerWidget;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (types_ts_2_1) {
                types_ts_2 = types_ts_2_1;
            },
            function (widget_container_ts_1_1) {
                widget_container_ts_1 = widget_container_ts_1_1;
            }
        ],
        execute: function () {
            ScrollableContainerWidget = class ScrollableContainerWidget extends widget_container_ts_1.BaseWidgetContainer {
                constructor() {
                    super(...arguments);
                    this.backColor = types_ts_2.FixedColor.Black;
                    this.overlappingFixedWidgets = [];
                    this._offsetX = 0;
                    this._offsetY = 0;
                }
                get offsetX() {
                    return this._offsetX;
                }
                get offsetY() {
                    return this._offsetY;
                }
                get innerX() {
                    return this._offsetX;
                }
                get innerY() {
                    return this._offsetY;
                }
                setOffset(offsetX, offsetY, invalidate = true) {
                    if (offsetX !== this._offsetX || offsetY !== this._offsetY) {
                        this._offsetX = Math.trunc(offsetX);
                        this._offsetY = Math.trunc(offsetY);
                        if (invalidate)
                            this.invalidate();
                    }
                }
                preDrawChildren(context) {
                    context.pushTransform(this.innerX, this.innerY);
                }
                postDrawChildren(context) {
                    context.popTransform();
                }
                drawSelf(context) {
                    context.fillRect(0, 0, this.width, this.height, this.backColor);
                }
            };
            exports_3("ScrollableContainerWidget", ScrollableContainerWidget);
        }
    };
});
System.register("engine/src/types", [], function (exports_4, context_4) {
    "use strict";
    var FixedColor, Point, Size, Rect;
    var __moduleName = context_4 && context_4.id;
    function rgb(r, g, b) {
        return rgba(r, g, b, 255);
    }
    exports_4("rgb", rgb);
    function rgba(r, g, b, a) {
        return ((a << 24) | // alpha
            (b << 16) | // blue
            (g << 8) | // green
            r);
    }
    exports_4("rgba", rgba);
    return {
        setters: [],
        execute: function () {
            FixedColor = /** @class */ (() => {
                class FixedColor {
                }
                FixedColor.Transparent = rgba(0, 0, 0, 0);
                FixedColor.Black = rgb(12, 12, 12);
                FixedColor.Red = rgb(197, 15, 31);
                FixedColor.Green = rgb(19, 161, 14);
                FixedColor.Yellow = rgb(193, 156, 0);
                FixedColor.Blue = rgb(0, 55, 218);
                FixedColor.Magenta = rgb(136, 23, 152);
                FixedColor.Cyan = rgb(58, 150, 221);
                FixedColor.White = rgb(204, 204, 204);
                FixedColor.BrightBlack = rgb(118, 118, 118);
                FixedColor.BrightRed = rgb(231, 72, 86);
                FixedColor.BrightGreen = rgb(22, 198, 12);
                FixedColor.BrightYellow = rgb(249, 241, 165);
                FixedColor.BrightBlue = rgb(59, 120, 255);
                FixedColor.BrightMagenta = rgb(180, 0, 158);
                FixedColor.BrightCyan = rgb(97, 214, 214);
                FixedColor.BrightWhite = rgb(242, 242, 242);
                return FixedColor;
            })();
            exports_4("FixedColor", FixedColor);
            Point = class Point {
                constructor(x = 0, y = 0) {
                    this.x = x;
                    this.y = y;
                }
                set(x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                }
                copyFrom(p) {
                    this.x = p.x;
                    this.y = p.y;
                    return this;
                }
                equals(p) {
                    return this.x === p.x && this.y === p.y;
                }
                clone() {
                    return new Point(this.x, this.y);
                }
                distanceTo(point) {
                    const dx = point.x - this.x;
                    const dy = point.y - this.y;
                    return Math.trunc(Math.sqrt(dx * dx + dy * dy));
                }
            };
            exports_4("Point", Point);
            Size = class Size {
                constructor(width = 0, height = 0) {
                    this.width = width;
                    this.height = height;
                }
                set(width, height) {
                    this.width = width;
                    this.height = height;
                    return this;
                }
                copyFrom(size) {
                    this.width = size.width;
                    this.height = size.height;
                    return this;
                }
                equals(size) {
                    return this.width === size.width && this.height === size.height;
                }
                clone() {
                    return new Size(this.width, this.height);
                }
            };
            exports_4("Size", Size);
            Rect = class Rect {
                constructor(x = 0, y = 0, width = 0, height = 0) {
                    this.x = x;
                    this.y = y;
                    this.width = width;
                    this.height = height;
                }
                get x1() {
                    return this.x + this.width;
                }
                get y1() {
                    return this.y + this.height;
                }
                set(x, y, width, height) {
                    this.x = x;
                    this.y = y;
                    this.width = width;
                    this.height = height;
                    return this;
                }
                copyFrom(rect) {
                    this.x = rect.x;
                    this.y = rect.y;
                    this.width = rect.width;
                    this.height = rect.height;
                    return this;
                }
                equals(rect) {
                    return (this.x === rect.x &&
                        this.y === rect.y &&
                        this.width === rect.width &&
                        this.height === rect.height);
                }
                intersects(rect) {
                    return !(this.x1 < rect.x ||
                        this.y1 < rect.y ||
                        this.x > rect.x1 ||
                        this.y > rect.y1);
                }
                union(rect) {
                    const x0 = Math.min(this.x, rect.x);
                    const y0 = Math.min(this.y, rect.y);
                    const x1 = Math.max(this.x1, rect.x1);
                    const y1 = Math.max(this.y1, rect.y1);
                    this.x = x0;
                    this.y = y0;
                    this.width = x1 - x0;
                    this.height = y1 - y0;
                }
                expand(amount) {
                    this.x -= amount;
                    this.y -= amount;
                    this.width += amount * 2;
                    this.height += amount * 2;
                    return this;
                }
                contains(x, y) {
                    return x >= this.x && y >= this.y && x <= this.x1 && y <= this.y1;
                }
                clone() {
                    return new Rect(this.x, this.y, this.width, this.height);
                }
            };
            exports_4("Rect", Rect);
        }
    };
});
System.register("engine/src/native-types", [], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("web/src/drawing/types", [], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("web/src/drawing/drawing-real", ["engine/src/types"], function (exports_7, context_7) {
    "use strict";
    var types_ts_3, DrawingReal;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (types_ts_3_1) {
                types_ts_3 = types_ts_3_1;
            }
        ],
        execute: function () {
            DrawingReal = class DrawingReal {
                constructor(pixels, size, drawingDone) {
                    this.pixelsSize = new types_ts_3.Size();
                    this.colorsRGB = new Uint32Array(2);
                    this.dirty = false;
                    this.dirtyPixels = 0;
                    this.dirtyLeft = 0;
                    this.dirtyRight = 0;
                    this.dirtyTop = 0;
                    this.dirtyBottom = 0;
                    this.dirtyTime = 0;
                    this.drawingDone = drawingDone;
                    this.pixelsSize.copyFrom(size);
                    this.pixels = pixels;
                    this.imageDataPixels8 = new Uint8ClampedArray(pixels);
                    this.imageDataPixels32 = new Uint32Array(pixels);
                }
                setPixels(pixels, size) {
                    this.pixelsSize.copyFrom(size);
                    this.pixels = pixels;
                    this.imageDataPixels8 = new Uint8ClampedArray(pixels);
                    this.imageDataPixels32 = new Uint32Array(pixels);
                }
                setDirty(x, y, width, height) {
                    if (!this.dirty) {
                        this.dirty = true;
                        this.dirtyPixels = 0;
                        this.dirtyLeft = x;
                        this.dirtyTop = y;
                        this.dirtyRight = x + width;
                        this.dirtyBottom = y + height;
                        this.dirtyTime = performance.now();
                    }
                    else {
                        this.dirtyLeft = Math.min(this.dirtyLeft, x);
                        this.dirtyTop = Math.min(this.dirtyTop, y);
                        this.dirtyRight = Math.max(this.dirtyRight, x + width);
                        this.dirtyBottom = Math.max(this.dirtyBottom, y + height);
                    }
                    this.dirtyPixels += width * height;
                }
                tintTile(t, foreColor, backColor, x, y, cfx, cfy, ctx, cty) {
                    this.setDirty(x, y, t.width, t.height);
                    const colorsRGB = this.colorsRGB;
                    const imageDataPixels32 = this.imageDataPixels32;
                    const screenWidth = this.pixelsSize.width;
                    colorsRGB[1] = foreColor;
                    colorsRGB[0] = backColor;
                    const tilePixels = t.pixels32;
                    const tileWidth = t.width;
                    const tileHeight = t.height;
                    const backTransparent = backColor >> 24 == 0;
                    let p = 0;
                    let f = 0;
                    if (cfx <= 0 && cfy <= 0 && ctx >= tileWidth && cty >= tileHeight) {
                        if (backTransparent) {
                            for (let py = 0; py < tileHeight; py++) {
                                p = (y + py) * screenWidth + x;
                                f = py * tileWidth;
                                for (let px = 0; px < tileWidth; px++) {
                                    const cp = tilePixels[f++];
                                    if (cp == 1) {
                                        imageDataPixels32[p++] = colorsRGB[cp];
                                    }
                                    else {
                                        p++;
                                    }
                                }
                            }
                        }
                        else {
                            for (let py = 0; py < tileHeight; py++) {
                                p = (y + py) * screenWidth + x;
                                f = py * tileWidth;
                                for (let px = 0; px < tileWidth; px++) {
                                    imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
                                }
                            }
                        }
                    }
                    else {
                        if (backTransparent) {
                            for (let py = 0; py < tileHeight; py++) {
                                p = (y + py) * screenWidth + x;
                                f = py * tileWidth;
                                for (let px = 0; px < tileWidth; px++) {
                                    if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                                        const cp = tilePixels[f++];
                                        if (cp == 1) {
                                            imageDataPixels32[p++] = colorsRGB[cp];
                                        }
                                        else {
                                            p++;
                                        }
                                    }
                                    else {
                                        p++;
                                        f++;
                                    }
                                }
                            }
                        }
                        else {
                            for (let py = 0; py < tileHeight; py++) {
                                p = (y + py) * screenWidth + x;
                                f = py * tileWidth;
                                for (let px = 0; px < tileWidth; px++) {
                                    if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                                        imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
                                    }
                                    else {
                                        p++;
                                        f++;
                                    }
                                }
                            }
                        }
                    }
                }
                setTile(t, x, y, cfx, cfy, ctx, cty) {
                    this.setDirty(x, y, t.width, t.height);
                    const imageDataPixels8 = this.imageDataPixels8;
                    const imageDataPixels32 = this.imageDataPixels32;
                    const screenWidth = this.pixelsSize.width;
                    const tileWidth = t.width;
                    const tileHeight = t.height;
                    let p = 0;
                    let f = 0;
                    const tilePixels32 = t.pixels32;
                    const tilePixels8 = t.pixels;
                    switch (t.alphaType) {
                        case 0 /* None */:
                            if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
                                for (let py = 0; py < tileHeight; py++) {
                                    p = (y + py) * screenWidth + x;
                                    f = py * tileWidth;
                                    for (let px = 0; px < tileWidth; px++) {
                                        imageDataPixels32[p++] = tilePixels32[f++];
                                    }
                                }
                            }
                            else {
                                for (let py = 0; py < tileHeight; py++) {
                                    p = (y + py) * screenWidth + x;
                                    f = py * tileWidth;
                                    for (let px = 0; px < tileWidth; px++) {
                                        if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                                            imageDataPixels32[p++] = tilePixels32[f++];
                                        }
                                        else {
                                            p++;
                                            f++;
                                        }
                                    }
                                }
                            }
                            break;
                        case 1 /* Solid */:
                            if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
                                for (let py = 0; py < tileHeight; py++) {
                                    p = (y + py) * screenWidth + x;
                                    f = py * tileWidth;
                                    for (let px = 0; px < tileWidth; px++) {
                                        const pixel = tilePixels32[f++];
                                        if (pixel >> 24 !== 0) {
                                            imageDataPixels32[p++] = pixel;
                                        }
                                        else {
                                            p++;
                                        }
                                    }
                                }
                            }
                            else {
                                for (let py = 0; py < tileHeight; py++) {
                                    p = (y + py) * screenWidth + x;
                                    f = py * tileWidth;
                                    for (let px = 0; px < tileWidth; px++) {
                                        if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                                            const pixel = tilePixels32[f++];
                                            if (pixel >> 24 !== 0) {
                                                imageDataPixels32[p++] = pixel;
                                            }
                                            else {
                                                p++;
                                            }
                                        }
                                        else {
                                            p++;
                                            f++;
                                        }
                                    }
                                }
                            }
                            break;
                        case 2 /* Alpha */:
                            if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
                                for (let py = 0; py < tileHeight; py++) {
                                    p = ((y + py) * screenWidth + x) << 2;
                                    f = (py * tileWidth) << 2;
                                    for (let px = 0; px < tileWidth; px++) {
                                        const r = tilePixels8[f++];
                                        const g = tilePixels8[f++];
                                        const b = tilePixels8[f++];
                                        const a = tilePixels8[f++] / 255;
                                        const invA = 1 - a;
                                        imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA + r * a;
                                        imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA + g * a;
                                        imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA + b * a;
                                        imageDataPixels8[p + 3] = 255; //a
                                        p += 4;
                                    }
                                }
                            }
                            else {
                                for (let py = 0; py < tileHeight; py++) {
                                    p = ((y + py) * screenWidth + x) << 2;
                                    f = (py * tileWidth) << 2;
                                    for (let px = 0; px < tileWidth; px++) {
                                        if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                                            const r = tilePixels8[f++];
                                            const g = tilePixels8[f++];
                                            const b = tilePixels8[f++];
                                            const a = tilePixels8[f++] / 255;
                                            const invA = 1 - a;
                                            imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA +
                                                r * a;
                                            imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA +
                                                g * a;
                                            imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA +
                                                b * a;
                                            imageDataPixels8[p + 3] = 255; //a
                                            p += 4;
                                        }
                                        else {
                                            p += 4;
                                            f += 4;
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
                fillRect(color, x, y, width, height) {
                    this.setDirty(x, y, width, height);
                    const imageDataPixels32 = this.imageDataPixels32;
                    const screenWidth = this.pixelsSize.width;
                    let p = 0;
                    for (let py = 0; py < height; py++) {
                        p = (y + py) * screenWidth + x;
                        for (let px = 0; px < width; px++) {
                            imageDataPixels32[p++] = color;
                        }
                    }
                }
                scrollRect(x, y, width, height, dx, dy) {
                    this.setDirty(x, y, width, height);
                    const imageDataPixels32 = this.imageDataPixels32;
                    const screenWidth = this.pixelsSize.width;
                    const screenHeight = this.pixelsSize.height;
                    if (dy !== 0 && x == 0 &&
                        width === screenWidth &&
                        height === screenHeight) {
                        //Optimized "vertical scrolling" path for fullscreen scrolling
                        if (dy > 0) {
                            imageDataPixels32.copyWithin(dy * screenWidth, 0);
                        }
                        else { //dy < 0
                            imageDataPixels32.copyWithin(0, -dy * screenWidth);
                        }
                        dy = 0;
                        if (dx === 0)
                            return;
                    }
                    let to;
                    let copyOffset;
                    if (dy > 0) {
                        to = (y + height - 1) * screenWidth + x;
                        copyOffset = -screenWidth;
                    }
                    else { //dy <= 0
                        to = y * screenWidth + x;
                        copyOffset = screenWidth;
                    }
                    let fromStartOffset = -dy * screenWidth;
                    let fromEndOffset = -dy * screenWidth + width;
                    if (dx >= 0) {
                        to += dx;
                        fromStartOffset -= dx;
                        fromEndOffset -= dx + dx;
                    }
                    else { //dx < 0
                        fromStartOffset -= dx;
                    }
                    for (let i = height - Math.abs(dy); i >= 0; i--) {
                        imageDataPixels32.copyWithin(to, to + fromStartOffset, to + fromEndOffset);
                        to += copyOffset;
                    }
                }
                getDirtyRect() {
                    const dirtyLeft = Math.max(Math.min(this.dirtyLeft, this.pixelsSize.width), 0);
                    const dirtyRight = Math.max(Math.min(this.dirtyRight, this.pixelsSize.width), 0);
                    const dirtyTop = Math.max(Math.min(this.dirtyTop, this.pixelsSize.height), 0);
                    const dirtyBottom = Math.max(Math.min(this.dirtyBottom, this.pixelsSize.height), 0);
                    return new types_ts_3.Rect(dirtyLeft, dirtyTop, dirtyRight - dirtyLeft, dirtyBottom - dirtyTop);
                }
                dispatch() {
                    this.drawingDone({
                        dirty: this.dirty,
                        dirtyRect: this.getDirtyRect(),
                        stats: {
                            drawnPixels: this.dirtyPixels,
                            time: this.dirty ? performance.now() - this.dirtyTime : 0,
                        },
                    });
                    this.dirty = false;
                }
                willDispatch() {
                    return this.dirty;
                }
                readyForNextFrame() {
                    return true;
                }
            };
            exports_7("DrawingReal", DrawingReal);
        }
    };
});
System.register("web/src/drawing/worker/types", [], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("web/src/drawing/worker/worker", ["web/src/drawing/drawing-real", "engine/src/types"], function (exports_9, context_9) {
    "use strict";
    var drawing_real_ts_1, types_ts_4, pixels, pixelsSize, drawing, tilesMapping;
    var __moduleName = context_9 && context_9.id;
    function sendResponse(response) {
        if (response.type === "result" && response.pixels) {
            const pixelsCopy = response.pixels.slice(0);
            //@ts-ignore
            self.postMessage({ ...response, pixels: pixelsCopy }, [pixelsCopy]);
        }
        else {
            //@ts-ignore
            self.postMessage(response);
        }
    }
    function getTile(tid) {
        return tilesMapping.get(tid);
    }
    function handleCommand(command) {
        switch (command.type) {
            case "setTile":
                drawing.setTile(getTile(command.t), command.x, command.y, command.cfx, command.cfy, command.ctx, command.cty);
                break;
            case "tintTile":
                drawing.tintTile(getTile(command.t), command.foreColor, command.backColor, command.x, command.y, command.cfx, command.cfy, command.ctx, command.cty);
                break;
            case "fillRect":
                drawing.fillRect(command.color, command.x, command.y, command.width, command.height);
                break;
            case "scrollRect":
                drawing.scrollRect(command.x, command.y, command.width, command.height, command.dx, command.dy);
                break;
            case "setPixels":
                pixels = command.pixels;
                pixelsSize.set(command.pixelsWidth, command.pixelsHeight);
                drawing.setPixels(command.pixels, pixelsSize);
                break;
            case "addTile":
                tilesMapping.set(command.id, {
                    alphaType: command.alphaType,
                    width: command.width,
                    height: command.height,
                    pixels: new Uint8ClampedArray(command.pixels),
                    pixels32: new Uint32Array(command.pixels),
                });
                break;
            case "batch":
                command.commands.forEach((c) => handleCommand(c));
                break;
        }
    }
    return {
        setters: [
            function (drawing_real_ts_1_1) {
                drawing_real_ts_1 = drawing_real_ts_1_1;
            },
            function (types_ts_4_1) {
                types_ts_4 = types_ts_4_1;
            }
        ],
        execute: function () {
            pixels = new Uint8ClampedArray(8 * 8 * 4).buffer;
            pixelsSize = new types_ts_4.Size(8, 8);
            drawing = new drawing_real_ts_1.DrawingReal(pixels, pixelsSize, (result) => {
                sendResponse({
                    type: "result",
                    pixels: result.dirty ? pixels : undefined,
                    pixelsWidth: pixelsSize.width,
                    pixelsHeight: pixelsSize.height,
                    result,
                });
            });
            tilesMapping = new Map();
            self.onmessage = (e) => {
                const command = e.data;
                handleCommand(command);
                drawing.dispatch();
            };
            sendResponse({ type: "ready" });
            console.log("Drawing Worker Started");
        }
    };
});

__instantiate("web/src/drawing/worker/worker");
