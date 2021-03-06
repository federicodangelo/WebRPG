// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
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
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("engine/src/native-types", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("engine/src/types", [], function (exports_2, context_2) {
    "use strict";
    var FixedColor, LAYERS_COUNT, Point, Size, Rect, UPDATE_FPS;
    var __moduleName = context_2 && context_2.id;
    function rgb(r, g, b) {
        return rgba(r, g, b, 255);
    }
    exports_2("rgb", rgb);
    function rgba(r, g, b, a) {
        return ((a << 24) | // alpha
            (b << 16) | // blue
            (g << 8) | // green
            r);
    }
    exports_2("rgba", rgba);
    function isUpdateable(object) {
        return "onUpdate" in object;
    }
    exports_2("isUpdateable", isUpdateable);
    return {
        setters: [],
        execute: function () {
            FixedColor = /** @class */ (() => {
                class FixedColor {
                }
                FixedColor.None = -1;
                FixedColor.Transparent = rgba(0, 0, 0, 0);
                FixedColor.Black = rgb(12, 12, 12);
                FixedColor.Red = rgb(197, 15, 31);
                FixedColor.Green = rgb(19, 161, 14);
                FixedColor.Yellow = rgb(193, 156, 0);
                FixedColor.Blue = rgb(0, 55, 218);
                FixedColor.Magenta = rgb(136, 23, 152);
                FixedColor.Cyan = rgb(58, 150, 221);
                FixedColor.White = rgb(255, 255, 255);
                return FixedColor;
            })();
            exports_2("FixedColor", FixedColor);
            exports_2("LAYERS_COUNT", LAYERS_COUNT = 2);
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
                    return Math.sqrt(dx * dx + dy * dy) | 0;
                }
            };
            exports_2("Point", Point);
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
            exports_2("Size", Size);
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
            exports_2("Rect", Rect);
            exports_2("UPDATE_FPS", UPDATE_FPS = 30);
        }
    };
});
System.register("web/src/native/screen/drawing/types", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("web/src/native/screen/drawing/drawing-soft", ["engine/src/types"], function (exports_4, context_4) {
    "use strict";
    var types_ts_1, DrawingSoftLayer, DrawingSoft;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (types_ts_1_1) {
                types_ts_1 = types_ts_1_1;
            }
        ],
        execute: function () {
            DrawingSoftLayer = class DrawingSoftLayer {
                constructor(width, height) {
                    this.dirty = false;
                    this.dirtyPixels = 0;
                    this.dirtyLeft = 0;
                    this.dirtyRight = 0;
                    this.dirtyTop = 0;
                    this.dirtyBottom = 0;
                    this.pixels = new ArrayBuffer(width * height * 4);
                    this.pixelsWidth = width;
                    this.pixelsHeight = height;
                    this.imageDataPixels8 = new Uint8ClampedArray(this.pixels);
                    this.imageDataPixels32 = new Uint32Array(this.pixels);
                }
                setSize(width, height) {
                    this.pixels = new ArrayBuffer(width * height * 4);
                    this.pixelsWidth = width;
                    this.pixelsHeight = height;
                    this.imageDataPixels8 = new Uint8ClampedArray(this.pixels);
                    this.imageDataPixels32 = new Uint32Array(this.pixels);
                }
                setDirty(x, y, width, height) {
                    if (!this.dirty) {
                        this.dirty = true;
                        this.dirtyPixels = 0;
                        this.dirtyLeft = x;
                        this.dirtyTop = y;
                        this.dirtyRight = x + width;
                        this.dirtyBottom = y + height;
                    }
                    else {
                        this.dirtyLeft = Math.min(this.dirtyLeft, x);
                        this.dirtyTop = Math.min(this.dirtyTop, y);
                        this.dirtyRight = Math.max(this.dirtyRight, x + width);
                        this.dirtyBottom = Math.max(this.dirtyBottom, y + height);
                    }
                    this.dirtyPixels += width * height;
                }
                getDirtyRect() {
                    const dirtyLeft = Math.max(Math.min(this.dirtyLeft, this.pixelsWidth), 0);
                    const dirtyRight = Math.max(Math.min(this.dirtyRight, this.pixelsWidth), 0);
                    const dirtyTop = Math.max(Math.min(this.dirtyTop, this.pixelsHeight), 0);
                    const dirtyBottom = Math.max(Math.min(this.dirtyBottom, this.pixelsHeight), 0);
                    return new types_ts_1.Rect(dirtyLeft, dirtyTop, dirtyRight - dirtyLeft, dirtyBottom - dirtyTop);
                }
            };
            DrawingSoft = class DrawingSoft {
                constructor(width, height, canvases, drawingDone) {
                    this.layers = [];
                    this.dirty = false;
                    this.dirtyTime = 0;
                    this.useCanvases = false;
                    this.drawingDone = drawingDone;
                    for (let i = 0; i < types_ts_1.LAYERS_COUNT; i++) {
                        this.layers.push(new DrawingSoftLayer(width, height));
                    }
                    this.targetLayer = this.layers[0];
                    this.canvases = canvases;
                    this.canvasesCtx = canvases.map((c, index) => {
                        const ctx = c.getContext("2d", index === 0 ? { alpha: false } : {});
                        if (!ctx)
                            throw new Error("Context creation error");
                        return ctx;
                    });
                    this.useCanvases = canvases.length > 0;
                }
                setSize(width, height) {
                    for (let i = 0; i < this.layers.length; i++) {
                        this.layers[i].setSize(width, height);
                    }
                    for (let i = 0; i < this.canvases.length; i++) {
                        this.canvases[i].width = width;
                        this.canvases[i].height = height;
                    }
                }
                setTargetLayer(layer) {
                    this.targetLayer = this.layers[layer];
                }
                setDirty(x, y, width, height) {
                    if (!this.dirty) {
                        this.dirty = true;
                        this.dirtyTime = performance.now();
                    }
                    this.targetLayer.setDirty(x, y, width, height);
                }
                setTile(t, x, y, cfx, cfy, ctx, cty) {
                    this.setDirty(x, y, t.width, t.height);
                    const imageDataPixels8 = this.targetLayer.imageDataPixels8;
                    const imageDataPixels32 = this.targetLayer.imageDataPixels32;
                    const screenWidth = this.targetLayer.pixelsWidth;
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
                                cty = Math.min(cty, tileHeight);
                                ctx = Math.min(ctx, tileWidth);
                                for (let py = cfy; py < cty; py++) {
                                    p = (y + py) * screenWidth + x + cfx;
                                    f = py * tileWidth + cfx;
                                    for (let px = cfx; px < ctx; px++) {
                                        imageDataPixels32[p++] = tilePixels32[f++];
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
                                cty = Math.min(cty, tileHeight);
                                ctx = Math.min(ctx, tileWidth);
                                for (let py = cfy; py < cty; py++) {
                                    p = (y + py) * screenWidth + x + cfx;
                                    f = py * tileWidth + cfx;
                                    for (let px = cfx; px < ctx; px++) {
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
                            break;
                        case 2 /* Alpha */:
                            if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
                                for (let py = 0; py < tileHeight; py++) {
                                    p = ((y + py) * screenWidth + x) << 2;
                                    f = (py * tileWidth) << 2;
                                    for (let px = 0; px < tileWidth; px++) {
                                        const r = tilePixels8[f + 0];
                                        const g = tilePixels8[f + 1];
                                        const b = tilePixels8[f + 2];
                                        const a = tilePixels8[f + 3] / 255;
                                        const invA = 1 - a;
                                        imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA + r * a;
                                        imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA + g * a;
                                        imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA + b * a;
                                        imageDataPixels8[p + 3] = 255; //a
                                        f += 4;
                                        p += 4;
                                    }
                                }
                            }
                            else {
                                cty = Math.min(cty, tileHeight);
                                ctx = Math.min(ctx, tileWidth);
                                for (let py = cfy; py < cty; py++) {
                                    p = ((y + py) * screenWidth + x + cfx) << 2;
                                    f = (py * tileWidth + cfx) << 2;
                                    for (let px = cfx; px < ctx; px++) {
                                        const r = tilePixels8[f + 0];
                                        const g = tilePixels8[f + 1];
                                        const b = tilePixels8[f + 2];
                                        const a = tilePixels8[f + 3] / 255;
                                        const invA = 1 - a;
                                        imageDataPixels8[p + 0] = imageDataPixels8[p + 0] * invA +
                                            r * a;
                                        imageDataPixels8[p + 1] = imageDataPixels8[p + 1] * invA +
                                            g * a;
                                        imageDataPixels8[p + 2] = imageDataPixels8[p + 2] * invA +
                                            b * a;
                                        imageDataPixels8[p + 3] = 255; //a
                                        f += 4;
                                        p += 4;
                                    }
                                }
                            }
                            break;
                    }
                }
                setSprite(t, x, y, cfx, cfy, ctx, cty) {
                    this.setTile(t, x, y, cfx, cfy, ctx, cty);
                }
                fillRect(color, x, y, width, height) {
                    this.setDirty(x, y, width, height);
                    const imageDataPixels32 = this.targetLayer.imageDataPixels32;
                    const screenWidth = this.targetLayer.pixelsWidth;
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
                    const imageDataPixels32 = this.targetLayer.imageDataPixels32;
                    const screenWidth = this.targetLayer.pixelsWidth;
                    const screenHeight = this.targetLayer.pixelsHeight;
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
                commit() {
                    const dirtyParams = [];
                    let drawnPixels = 0;
                    for (let i = 0; i < this.layers.length; i++) {
                        const layer = this.layers[i];
                        if (layer.dirty) {
                            const dirtyRect = layer.getDirtyRect();
                            if (this.useCanvases) {
                                this.canvasesCtx[i].putImageData(new ImageData(new Uint8ClampedArray(layer.pixels), layer.pixelsWidth, layer.pixelsHeight), 0, 0, dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
                            }
                            else {
                                dirtyParams.push({
                                    layer: i,
                                    dirtyRect,
                                    pixels: layer.pixels,
                                    pixelsWidth: layer.pixelsWidth,
                                    pixelsHeight: layer.pixelsHeight,
                                });
                            }
                            drawnPixels += layer.dirtyPixels;
                        }
                    }
                    this.drawingDone({
                        dirtyParams,
                        stats: {
                            drawnPixels,
                            time: this.dirty ? performance.now() - this.dirtyTime : 0,
                        },
                    });
                    this.dirty = false;
                    for (let i = 0; i < this.layers.length; i++)
                        this.layers[i].dirty = false;
                }
                willDispatch() {
                    return this.dirty;
                }
                isReadyForNextFrame() {
                    return true;
                }
                update() { }
                preloadTilemap(tilemap) { }
                preloadSpritesheet(spritesheet) { }
            };
            exports_4("DrawingSoft", DrawingSoft);
        }
    };
});
System.register("web/src/native/screen/drawing/drawing-hard", ["engine/src/types"], function (exports_5, context_5) {
    "use strict";
    var types_ts_2, DrawingHardLayer, DrawingHard;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (types_ts_2_1) {
                types_ts_2 = types_ts_2_1;
            }
        ],
        execute: function () {
            DrawingHardLayer = class DrawingHardLayer {
                constructor(width, height, canvas, ctx) {
                    this.dirty = false;
                    this.dirtyPixels = 0;
                    this.dirtyLeft = 0;
                    this.dirtyRight = 0;
                    this.dirtyTop = 0;
                    this.dirtyBottom = 0;
                    this.pixelsWidth = width;
                    this.pixelsHeight = height;
                    this.canvas = canvas;
                    this.ctx = ctx;
                }
                setSize(width, height) {
                    this.pixelsWidth = width;
                    this.pixelsHeight = height;
                    this.canvas.width = width;
                    this.canvas.height = height;
                }
                setDirty(x, y, width, height) {
                    if (!this.dirty) {
                        this.dirty = true;
                        this.dirtyPixels = 0;
                        this.dirtyLeft = x;
                        this.dirtyTop = y;
                        this.dirtyRight = x + width;
                        this.dirtyBottom = y + height;
                    }
                    else {
                        this.dirtyLeft = Math.min(this.dirtyLeft, x);
                        this.dirtyTop = Math.min(this.dirtyTop, y);
                        this.dirtyRight = Math.max(this.dirtyRight, x + width);
                        this.dirtyBottom = Math.max(this.dirtyBottom, y + height);
                    }
                    this.dirtyPixels += width * height;
                }
                getDirtyRect() {
                    const dirtyLeft = Math.max(Math.min(this.dirtyLeft, this.pixelsWidth), 0);
                    const dirtyRight = Math.max(Math.min(this.dirtyRight, this.pixelsWidth), 0);
                    const dirtyTop = Math.max(Math.min(this.dirtyTop, this.pixelsHeight), 0);
                    const dirtyBottom = Math.max(Math.min(this.dirtyBottom, this.pixelsHeight), 0);
                    return new types_ts_2.Rect(dirtyLeft, dirtyTop, dirtyRight - dirtyLeft, dirtyBottom - dirtyTop);
                }
            };
            DrawingHard = class DrawingHard {
                constructor(width, height, canvases, buildCanvasFn, drawingDone) {
                    this.layers = [];
                    this.dirty = false;
                    this.dirtyTime = 0;
                    this.tilesToTexture = new Map();
                    this.spritesToTexture = new Map();
                    this.buildCanvasFn = buildCanvasFn;
                    this.drawingDone = drawingDone;
                    for (let i = 0; i < types_ts_2.LAYERS_COUNT; i++) {
                        const ctx = canvases[i].getContext("2d", i === 0 ? { alpha: false } : {});
                        this.layers.push(new DrawingHardLayer(width, height, canvases[i], ctx));
                    }
                    this.targetLayer = this.layers[0];
                }
                setSize(width, height) {
                    for (let i = 0; i < this.layers.length; i++) {
                        this.layers[i].setSize(width, height);
                    }
                }
                setTargetLayer(layer) {
                    this.targetLayer = this.layers[layer];
                }
                setDirty(x, y, width, height) {
                    if (!this.dirty) {
                        this.dirty = true;
                        this.dirtyTime = performance.now();
                    }
                    this.targetLayer.setDirty(x, y, width, height);
                }
                setTile(t, x, y, cfx, cfy, ctx, cty) {
                    this.setDirty(x, y, t.width, t.height);
                    const tileWidth = t.width;
                    const tileHeight = t.height;
                    const context = this.targetLayer.ctx;
                    const tt = this.tilesToTexture.get(t);
                    if (!tt)
                        return;
                    const texture = tt.canvas;
                    const tileBounds = tt.tilesBounds.get(t);
                    if (!tileBounds)
                        return;
                    if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
                        context.drawImage(texture, tileBounds.x, tileBounds.y, tileBounds.width, tileBounds.height, x, y, tileWidth, tileHeight);
                    }
                    else {
                        cfx = Math.max(cfx, 0);
                        cfy = Math.max(cfy, 0);
                        cty = Math.min(cty, tileHeight);
                        ctx = Math.min(ctx, tileWidth);
                        context.drawImage(texture, tileBounds.x + cfx, tileBounds.y + cfy, ctx - cfx, cty - cfy, x + cfx, y + cfy, ctx - cfx, cty - cfy);
                    }
                }
                setSprite(s, x, y, cfx, cfy, ctx, cty) {
                    this.setDirty(x, y, s.width, s.height);
                    const spriteWidth = s.width;
                    const spriteHeight = s.height;
                    const context = this.targetLayer.ctx;
                    const st = this.spritesToTexture.get(s);
                    if (!st)
                        return;
                    const texture = st.canvas;
                    const spriteBounds = st.spritesBounds.get(s);
                    if (!spriteBounds)
                        return;
                    if (cfx <= 0 && cfy <= 0 && ctx >= s.width && cty >= s.height) {
                        context.drawImage(texture, spriteBounds.x, spriteBounds.y, spriteBounds.width, spriteBounds.height, x, y, spriteWidth, spriteHeight);
                    }
                    else {
                        cfx = Math.max(cfx, 0);
                        cfy = Math.max(cfy, 0);
                        cty = Math.min(cty, spriteHeight);
                        ctx = Math.min(ctx, spriteWidth);
                        context.drawImage(texture, spriteBounds.x + cfx, spriteBounds.y + cfy, ctx - cfx, cty - cfy, x + cfx, y + cfy, ctx - cfx, cty - cfy);
                    }
                }
                fillRect(color, x, y, width, height) {
                    this.setDirty(x, y, width, height);
                    const context = this.targetLayer.ctx;
                    if (color !== types_ts_2.FixedColor.Transparent) {
                        const r = color & 0xFF;
                        const g = (color >> 8) & 0xFF;
                        const b = (color >> 16) & 0xFF;
                        const a = (color >> 24) & 0xFF;
                        context.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
                        context.fillRect(x, y, width, height);
                    }
                    else {
                        context.clearRect(x, y, width, height);
                    }
                }
                scrollRect(x, y, width, height, dx, dy) {
                    this.setDirty(x, y, width, height);
                    const context = this.targetLayer.ctx;
                    context.drawImage(context.canvas, x - dx, y - dy, width, height, x, y, width, height);
                }
                commit() {
                    const dirtyParams = [];
                    let drawnPixels = 0;
                    for (let i = 0; i < this.layers.length; i++) {
                        const layer = this.layers[i];
                        if (layer.dirty) {
                            drawnPixels += layer.dirtyPixels;
                        }
                    }
                    this.drawingDone({
                        dirtyParams,
                        stats: {
                            drawnPixels,
                            time: this.dirty ? performance.now() - this.dirtyTime : 0,
                        },
                    });
                    this.dirty = false;
                    for (let i = 0; i < this.layers.length; i++)
                        this.layers[i].dirty = false;
                }
                willDispatch() {
                    return this.dirty;
                }
                isReadyForNextFrame() {
                    return true;
                }
                update() { }
                preloadTilemap(tilemap) {
                    if (tilemap.tiles.length === 0)
                        return;
                    const tiles = tilemap.tiles;
                    const tileWidth = tiles[0].width;
                    const tileHeight = tiles[0].height;
                    const sizeInTiles = Math.ceil(Math.sqrt(tiles.length));
                    const width = sizeInTiles * tileWidth;
                    const height = sizeInTiles * tileHeight;
                    const canvas = this.buildCanvasFn(width, height);
                    const ctx = canvas.getContext("2d");
                    const texturePixels = new ArrayBuffer(width * height * 4);
                    const texturePixels32 = new Uint32Array(texturePixels);
                    const tilesBounds = new Map();
                    let tileIndex = 0;
                    for (let y = 0; y < height && tileIndex < tiles.length; y += tileHeight) {
                        for (let x = 0; x < width && tileIndex < tiles.length; x += tileWidth) {
                            const tile = tiles[tileIndex];
                            const tileBounds = new types_ts_2.Rect(x, y, tileWidth, tileHeight);
                            const tp32 = tile.pixels32;
                            for (let dy = 0; dy < tileHeight; dy++) {
                                let t = (y + dy) * width + x;
                                let p = dy * tileWidth;
                                for (let dx = 0; dx < tileWidth; dx++) {
                                    texturePixels32[t++] = tp32[p++];
                                }
                            }
                            tilesBounds.set(tile, tileBounds);
                            tileIndex++;
                        }
                    }
                    ctx.putImageData(new ImageData(new Uint8ClampedArray(texturePixels), width, height), 0, 0);
                    const texture = {
                        canvas,
                        tilesBounds,
                    };
                    tiles.forEach((t) => this.tilesToTexture.set(t, texture));
                }
                preloadSpritesheet(spritesheet) {
                    if (spritesheet.sprites.length === 0)
                        return;
                    const sprites = spritesheet.sprites;
                    const totalWidth = sprites.map((s) => s.width).reduce((acc, v) => acc + v);
                    const maxHeight = sprites.map((s) => s.height).reduce((acc, v) => Math.max(acc, v));
                    const canvas = this.buildCanvasFn(totalWidth, maxHeight);
                    const ctx = canvas.getContext("2d");
                    const texturePixels = new ArrayBuffer(totalWidth * maxHeight * 4);
                    const texturePixels32 = new Uint32Array(texturePixels);
                    const spritesBounds = new Map();
                    let x = 0;
                    const y = 0;
                    for (let i = 0; i < sprites.length; i++) {
                        const sprite = sprites[i];
                        const tp32 = sprite.pixels32;
                        const spriteWidth = sprite.width;
                        const spriteHeight = sprite.height;
                        for (let dy = 0; dy < spriteHeight; dy++) {
                            let t = (y + dy) * totalWidth + x;
                            let p = dy * spriteWidth;
                            for (let dx = 0; dx < spriteWidth; dx++) {
                                texturePixels32[t++] = tp32[p++];
                            }
                        }
                        const spriteBounds = new types_ts_2.Rect(x, y, spriteWidth, spriteHeight);
                        spritesBounds.set(sprite, spriteBounds);
                        x += sprite.width;
                    }
                    ctx.putImageData(new ImageData(new Uint8ClampedArray(texturePixels), totalWidth, maxHeight), 0, 0);
                    const texture = {
                        canvas,
                        spritesBounds,
                    };
                    sprites.forEach((t) => this.spritesToTexture.set(t, texture));
                }
            };
            exports_5("DrawingHard", DrawingHard);
        }
    };
});
System.register("web/src/native/screen/drawing/worker/types", [], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("web/src/native/screen/drawing/worker/worker", ["web/src/native/screen/drawing/drawing-soft", "web/src/native/screen/drawing/drawing-hard"], function (exports_7, context_7) {
    "use strict";
    var drawing_soft_ts_1, drawing_hard_ts_1, USE_HARD_DRAWING, drawing, tilesMapping, spritesMapping;
    var __moduleName = context_7 && context_7.id;
    function sendResponse(response) {
        if (response.type === "result") {
            const transferables = [];
            const dirtyParamsToRemove = [];
            for (let i = 0; i < response.result.dirtyParams.length; i++) {
                const params = response.result.dirtyParams[i];
                const pixelsCopy = params.pixels.slice(0);
                params.pixels = pixelsCopy;
                transferables.push(pixelsCopy);
            }
            response.result.dirtyParams = response.result.dirtyParams.filter((params) => !dirtyParamsToRemove.includes(params));
            //@ts-ignore
            self.postMessage(response, transferables);
        }
        else {
            //@ts-ignore
            self.postMessage(response);
        }
    }
    function getTile(tid) {
        const tile = tilesMapping.get(tid);
        if (tile === undefined)
            throw new Error("Unknown tile id received " + tid);
        return tile;
    }
    function addTile(tid, tile) {
        tilesMapping.set(tid, tile);
    }
    function getSprite(sid) {
        const sprite = spritesMapping.get(sid);
        if (sprite === undefined) {
            throw new Error("Unknown sprite id received " + sid);
        }
        return sprite;
    }
    function addSprite(sid, sprite) {
        spritesMapping.set(sid, sprite);
    }
    function handleCommands(commands, commandsLen) {
        let index = 0;
        if (drawing === null)
            return;
        let tilesToAddToTilemap = 0;
        let tilemap = null;
        let spritesToAddToSpritesheet = 0;
        let spritesheet = null;
        while (index < commandsLen) {
            const cmd = commands[index++];
            const argsLen = commands[index++];
            switch (cmd) {
                case 0 /* SetTile */:
                    drawing.setTile(getTile(commands[index + 0]), commands[index + 1], commands[index + 2], commands[index + 3], commands[index + 4], commands[index + 5], commands[index + 6]);
                    break;
                case 1 /* SetSprite */:
                    drawing.setSprite(getSprite(commands[index + 0]), commands[index + 1], commands[index + 2], commands[index + 3], commands[index + 4], commands[index + 5], commands[index + 6]);
                    break;
                case 2 /* FillRect */:
                    drawing.fillRect(commands[index + 0], commands[index + 1], commands[index + 2], commands[index + 3], commands[index + 4]);
                    break;
                case 3 /* ScrollRect */:
                    drawing.scrollRect(commands[index + 0], commands[index + 1], commands[index + 2], commands[index + 3], commands[index + 4], commands[index + 5]);
                    break;
                case 4 /* SetSize */:
                    drawing.setSize(commands[index + 0], commands[index + 1]);
                    break;
                case 5 /* SetTargetLayer */:
                    drawing.setTargetLayer(commands[index + 0]);
                    break;
                case 6 /* AddTile */: {
                    const id = commands[index + 0];
                    const width = commands[index + 1];
                    const height = commands[index + 2];
                    const alphaType = commands[index + 3];
                    const pixels32Len = commands[index + 4];
                    const pixels32 = new Uint32Array(pixels32Len);
                    const pixels = new Uint8ClampedArray(pixels32.buffer);
                    pixels32.set(commands.slice(index + 5, index + 5 + pixels32Len));
                    const tile = {
                        alphaType,
                        width,
                        height,
                        pixels,
                        pixels32,
                    };
                    addTile(id, tile);
                    if (tilesToAddToTilemap > 0 && tilemap !== null) {
                        tilemap.tiles.push(tile);
                        tilesToAddToTilemap--;
                        if (tilesToAddToTilemap === 0) {
                            drawing?.preloadTilemap(tilemap);
                            tilemap = null;
                        }
                    }
                    break;
                }
                case 7 /* AddTilemap */: {
                    tilesToAddToTilemap = commands[index + 0];
                    tilemap = { tiles: [] };
                }
                case 8 /* AddSprite */: {
                    const id = commands[index + 0];
                    const width = commands[index + 1];
                    const height = commands[index + 2];
                    const alphaType = commands[index + 3];
                    const pixels32Len = commands[index + 4];
                    const pixels32 = new Uint32Array(pixels32Len);
                    const pixels = new Uint8ClampedArray(pixels32.buffer);
                    pixels32.set(commands.slice(index + 5, index + 5 + pixels32Len));
                    const sprite = {
                        alphaType,
                        width,
                        height,
                        pixels,
                        pixels32,
                    };
                    addSprite(id, sprite);
                    if (spritesToAddToSpritesheet > 0 && spritesheet !== null) {
                        spritesheet.sprites.push(sprite);
                        spritesToAddToSpritesheet--;
                        if (spritesToAddToSpritesheet === 0) {
                            drawing?.preloadSpritesheet(spritesheet);
                            spritesheet = null;
                        }
                    }
                    break;
                }
                case 9 /* AddSpritesheet */: {
                    spritesToAddToSpritesheet = commands[index + 0];
                    spritesheet = { sprites: [] };
                }
            }
            index += argsLen;
        }
    }
    function handleRequest(request) {
        switch (request.type) {
            case "batch":
                handleCommands(new Int32Array(request.commands), request.commandsLen);
                break;
            case "init":
                {
                    drawing = USE_HARD_DRAWING && request.canvases.length > 0
                        ? new drawing_hard_ts_1.DrawingHard(request.width, request.height, request.canvases, (w, h) => new OffscreenCanvas(w, h), (result) => {
                            sendResponse({
                                type: "result",
                                result,
                            });
                        })
                        : new drawing_soft_ts_1.DrawingSoft(request.width, request.height, request.canvases, (result) => {
                            sendResponse({
                                type: "result",
                                result,
                            });
                        });
                }
                break;
        }
    }
    return {
        setters: [
            function (drawing_soft_ts_1_1) {
                drawing_soft_ts_1 = drawing_soft_ts_1_1;
            },
            function (drawing_hard_ts_1_1) {
                drawing_hard_ts_1 = drawing_hard_ts_1_1;
            }
        ],
        execute: function () {
            USE_HARD_DRAWING = true;
            drawing = null;
            tilesMapping = new Map();
            spritesMapping = new Map();
            self.onmessage = (e) => {
                const command = e.data;
                handleRequest(command);
                drawing?.commit();
            };
            sendResponse({ type: "ready" });
            console.log("Drawing Worker Started");
        }
    };
});

__instantiate("web/src/native/screen/drawing/worker/worker", false);
