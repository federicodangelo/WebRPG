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
System.register("engine/src/context", ["engine/src/types"], function (exports_3, context_3) {
    "use strict";
    var types_ts_1, useCp437, AnsiSpecialChar, EngineContextImpl;
    var __moduleName = context_3 && context_3.id;
    function ceilToMultipleOf(n, m) {
        if (n % m === 0)
            return n;
        return Math.ceil(n / m) * m;
    }
    function floorToMultipleOf(n, m) {
        if (n % m === 0)
            return n;
        return Math.floor(n / m) * m;
    }
    return {
        setters: [
            function (types_ts_1_1) {
                types_ts_1 = types_ts_1_1;
            }
        ],
        execute: function () {
            useCp437 = true;
            AnsiSpecialChar = [
                //Block
                useCp437 ? 219 : "█".charCodeAt(0),
                useCp437 ? 220 : "▄".charCodeAt(0),
                useCp437 ? 224 : "▀".charCodeAt(0),
                useCp437 ? 221 : "▌".charCodeAt(0),
                useCp437 ? 222 : "▌".charCodeAt(0),
                //Shade
                useCp437 ? 176 : "░".charCodeAt(0),
                useCp437 ? 177 : "▒".charCodeAt(0),
                useCp437 ? 178 : "▓".charCodeAt(0),
                ////Single Line
                useCp437 ? 179 : "│".charCodeAt(0),
                useCp437 ? 196 : "─".charCodeAt(0),
                useCp437 ? 218 : "┌".charCodeAt(0),
                useCp437 ? 191 : "┐".charCodeAt(0),
                useCp437 ? 192 : "└".charCodeAt(0),
                useCp437 ? 217 : "┘".charCodeAt(0),
                useCp437 ? 180 : "┤".charCodeAt(0),
                useCp437 ? 195 : "├".charCodeAt(0),
                useCp437 ? 193 : "┴".charCodeAt(0),
                useCp437 ? 194 : "┬".charCodeAt(0),
                useCp437 ? 197 : "┼".charCodeAt(0),
                //Double Line
                useCp437 ? 186 : "║".charCodeAt(0),
                useCp437 ? 205 : "═".charCodeAt(0),
                useCp437 ? 201 : "╔".charCodeAt(0),
                useCp437 ? 187 : "╗".charCodeAt(0),
                useCp437 ? 200 : "╚".charCodeAt(0),
                useCp437 ? 188 : "╝".charCodeAt(0),
                useCp437 ? 185 : "╣".charCodeAt(0),
                useCp437 ? 204 : "╠".charCodeAt(0),
                useCp437 ? 202 : "╩".charCodeAt(0),
                useCp437 ? 203 : "╦".charCodeAt(0),
                useCp437 ? 206 : "╬".charCodeAt(0),
            ];
            EngineContextImpl = class EngineContextImpl {
                constructor(nativeContext) {
                    this.bounds = new types_ts_1.Rect();
                    this.clip = new types_ts_1.Rect();
                    this.tx = 0;
                    this.ty = 0;
                    this.x = 0;
                    this.y = 0;
                    this.foreColor = types_ts_1.FixedColor.White;
                    this.backColor = types_ts_1.FixedColor.Black;
                    this.transformsStack = [];
                    this.clipStack = [];
                    this.nativeContext = nativeContext;
                }
                beginDraw() {
                    this.nativeContext.beginDraw();
                }
                setTargetLayer(layer) {
                    this.nativeContext.setTargetLayer(layer);
                }
                beginClip(x, y, width, height) {
                    this.bounds.set(x, y, width, height);
                    this.clip.set(x, y, width, height);
                    this.transformsStack.length = 0;
                    this.clipStack.length = 0;
                    this.x = 0;
                    this.y = 0;
                    this.tx = 0;
                    this.ty = 0;
                }
                endClip() { }
                endDraw() {
                    this.nativeContext.endDraw();
                }
                pushTransform(x, y) {
                    this.transformsStack.push(new types_ts_1.Point(this.tx, this.ty));
                    this.tx += x;
                    this.ty += y;
                }
                popTransform() {
                    const p = this.transformsStack.pop();
                    if (p) {
                        this.tx = p.x;
                        this.ty = p.y;
                    }
                }
                pushClip(x, y, width, height) {
                    this.clipStack.push(this.clip.clone());
                    const minX = Math.max(this.tx + x, this.clip.x);
                    const minY = Math.max(this.ty + y, this.clip.y);
                    const maxX = Math.min(this.tx + x + width, this.clip.x + this.clip.width);
                    const maxY = Math.min(this.ty + y + height, this.clip.y + this.clip.height);
                    this.clip.set(minX, minY, maxX - minX, maxY - minY);
                }
                popClip() {
                    const p = this.clipStack.pop();
                    if (p)
                        this.clip.copyFrom(p);
                }
                isVisible(x, y, width, height) {
                    return !(this.tx + x + width < this.clip.x ||
                        this.ty + y + height < this.clip.y ||
                        this.tx + x > this.clip.x + this.clip.width ||
                        this.ty + y > this.clip.y + this.clip.height);
                }
                moveCursorTo(x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                }
                textColor(foreColor, backColor) {
                    this.foreColor = foreColor;
                    this.backColor = backColor;
                    return this;
                }
                resetTextColor() {
                    this.foreColor = types_ts_1.FixedColor.White;
                    this.backColor = types_ts_1.FixedColor.Black;
                    return this;
                }
                text(font, str) {
                    for (let i = 0; i < str.length; i++) {
                        this.char(font, str.charCodeAt(i));
                    }
                    return this;
                }
                char(font, code) {
                    const screenX = this.x + this.tx;
                    const screenY = this.y + this.ty;
                    const clip = this.clip;
                    const width = font.tileWidth;
                    const height = font.tileHeight;
                    if (screenX + width > clip.x &&
                        screenX < clip.x1 &&
                        screenY + height > clip.y &&
                        screenY < clip.y1) {
                        const fontTile = font.tiles[code];
                        const cfx = Math.max(clip.x - screenX, 0);
                        const cfy = Math.max(clip.y - screenY, 0);
                        const ctx = Math.min(clip.x1 - screenX, width);
                        const cty = Math.min(clip.y1 - screenY, height);
                        this.nativeContext.tintTile(fontTile, this.foreColor, this.backColor, screenX, screenY, cfx, cfy, ctx, cty);
                    }
                    this.x += width;
                    return this;
                }
                charTimes(font, code, times) {
                    for (let t = 0; t < times; t++) {
                        this.char(font, code);
                    }
                    return this;
                }
                specialChar(font, code) {
                    this.char(font, AnsiSpecialChar[code]);
                    return this;
                }
                specialCharTimes(font, code, times) {
                    for (let t = 0; t < times; t++) {
                        this.specialChar(font, code);
                    }
                    return this;
                }
                textBorder(font, x, y, width, height) {
                    const clip = this.clip;
                    const tx = this.tx;
                    const ty = this.ty;
                    const x0 = Math.max(x, clip.x - tx);
                    const y0 = Math.max(y, clip.y - ty);
                    const x1 = Math.min(x + width, clip.x1 - tx);
                    const y1 = Math.min(y + height, clip.y1 - ty);
                    if (x1 <= x0 || y1 <= y0) {
                        return this;
                    }
                    const fontWidth = font.tileWidth;
                    const fontHeight = font.tileHeight;
                    if (x0 > x + fontWidth &&
                        y0 > y + fontHeight &&
                        x1 < x + width - fontWidth &&
                        y1 < y + height - fontHeight) {
                        return this;
                    }
                    this.moveCursorTo(x, y);
                    this.specialChar(font, 10 /* CornerTopLeft */);
                    this.specialCharTimes(font, 9 /* Horizontal */, width / fontWidth - 2);
                    this.moveCursorTo(x + width - fontWidth, y);
                    this.specialChar(font, 11 /* CornerTopRight */);
                    for (let i = 0; i < height - 2 * fontHeight; i += fontHeight) {
                        this.moveCursorTo(x, y + fontHeight + i);
                        this.specialChar(font, 8 /* Vertical */);
                        this.moveCursorTo(x + width - fontWidth, y + fontHeight + i);
                        this.specialChar(font, 8 /* Vertical */);
                    }
                    this.moveCursorTo(x, y + height - fontHeight);
                    this.specialChar(font, 12 /* CornerBottomLeft */);
                    this.specialCharTimes(font, 9 /* Horizontal */, width / fontWidth - 2);
                    this.moveCursorTo(x + width - fontWidth, y + height - fontHeight);
                    this.specialChar(font, 13 /* CornerBottomRight */);
                    return this;
                }
                fillChar(font, x, y, width, height, char) {
                    if (char.length === 0)
                        return this;
                    const fontWidth = font.tileWidth;
                    const fontHeight = font.tileHeight;
                    const clip = this.clip;
                    const tx = this.tx;
                    const ty = this.ty;
                    const x0 = Math.max(tx + x, floorToMultipleOf(clip.x, fontWidth));
                    const y0 = Math.max(ty + y, floorToMultipleOf(clip.y, fontHeight));
                    const x1 = Math.min(tx + x + width, ceilToMultipleOf(clip.x1, fontWidth));
                    const y1 = Math.min(ty + y + height, ceilToMultipleOf(clip.y1, fontHeight));
                    if (x1 <= x0 || y1 <= y0) {
                        return this;
                    }
                    const code = char.charCodeAt(0);
                    const fontTile = font.tiles[code];
                    for (let screenY = y0; screenY < y1; screenY += fontHeight) {
                        for (let screenX = x0; screenX < x1; screenX += fontWidth) {
                            const cfx = Math.max(clip.x - screenX, 0);
                            const cfy = Math.max(clip.y - screenY, 0);
                            const ctx = Math.min(clip.x1 - screenX, fontWidth);
                            const cty = Math.min(clip.y1 - screenY, fontHeight);
                            this.nativeContext.tintTile(fontTile, this.foreColor, this.backColor, screenX, screenY, cfx, cfy, ctx, cty);
                        }
                    }
                    return this;
                }
                tilemap(x, y, tilemap, indexes) {
                    const tileWidth = tilemap.tileWidth;
                    const tileHeight = tilemap.tileHeight;
                    const clip = this.clip;
                    const tx = this.tx;
                    const ty = this.ty;
                    if (indexes.length == 0)
                        return this;
                    const height = indexes.length * tileHeight;
                    const width = indexes[0].length * tileWidth;
                    const rtx = tx + x;
                    const rty = ty + y;
                    const x0 = Math.max(tx + x, floorToMultipleOf(clip.x - rtx, tileWidth) + rtx);
                    const y0 = Math.max(ty + y, floorToMultipleOf(clip.y - rty, tileHeight) + rty);
                    const x1 = Math.min(tx + x + width, ceilToMultipleOf(clip.x1 - rtx, tileWidth) + rtx);
                    const y1 = Math.min(ty + y + height, ceilToMultipleOf(clip.y1 - rty, tileHeight) + rty);
                    if (x1 <= x0 || y1 <= y0) {
                        return this;
                    }
                    const tiles = tilemap.tiles;
                    let tileY = ((y0 - y - ty) / tileHeight) | 0;
                    for (let screenY = y0; screenY < y1; screenY += tileHeight, tileY++) {
                        const row = indexes[tileY];
                        let tileX = ((x0 - x - tx) / tileWidth) | 0;
                        for (let screenX = x0; screenX < x1; screenX += tileWidth, tileX++) {
                            const tileIndex = row[tileX];
                            if (tileIndex >= 0) {
                                const cfx = Math.max(clip.x - screenX, 0);
                                const cfy = Math.max(clip.y - screenY, 0);
                                const ctx = Math.min(clip.x1 - screenX, tileWidth);
                                const cty = Math.min(clip.y1 - screenY, tileHeight);
                                this.nativeContext.setTile(tiles[tileIndex], screenX, screenY, cfx, cfy, ctx, cty);
                            }
                        }
                    }
                    return this;
                }
                tile(x, y, t) {
                    const screenX = x + this.tx;
                    const screenY = y + this.ty;
                    const clip = this.clip;
                    const width = t.width;
                    const height = t.height;
                    if (screenX + width > clip.x &&
                        screenX < clip.x1 &&
                        screenY + height > clip.y &&
                        screenY < clip.y1) {
                        const cfx = Math.max(clip.x - screenX, 0);
                        const cfy = Math.max(clip.y - screenY, 0);
                        const ctx = Math.min(clip.x1 - screenX, width);
                        const cty = Math.min(clip.y1 - screenY, height);
                        this.nativeContext.setTile(t, screenX, screenY, cfx, cfy, ctx, cty);
                    }
                    return this;
                }
                fillRect(x, y, width, height, color) {
                    const clip = this.clip;
                    const tx = this.tx;
                    const ty = this.ty;
                    const x0 = Math.max(tx + x, clip.x);
                    const y0 = Math.max(ty + y, clip.y);
                    const x1 = Math.min(tx + x + width, clip.x1);
                    const y1 = Math.min(ty + y + height, clip.y1);
                    if (x1 <= x0 || y1 <= y0) {
                        return this;
                    }
                    this.nativeContext.fillRect(color, x0, y0, x1 - x0, y1 - y0);
                    return this;
                }
            };
            exports_3("EngineContextImpl", EngineContextImpl);
        }
    };
});
System.register("engine/src/engine", ["engine/src/types", "engine/src/context"], function (exports_4, context_4) {
    "use strict";
    var types_ts_2, context_ts_1, EngineLayer, EngineImpl;
    var __moduleName = context_4 && context_4.id;
    async function buildEngine(nativeContext) {
        const engine = new EngineImpl(nativeContext);
        await engine.init();
        return engine;
    }
    exports_4("buildEngine", buildEngine);
    function destroyEngine(engine) {
        engine.destroy();
    }
    exports_4("destroyEngine", destroyEngine);
    return {
        setters: [
            function (types_ts_2_1) {
                types_ts_2 = types_ts_2_1;
            },
            function (context_ts_1_1) {
                context_ts_1 = context_ts_1_1;
            }
        ],
        execute: function () {
            EngineLayer = class EngineLayer {
                constructor(id) {
                    this.invalidRects = [];
                    this.children = [];
                    this.onNextDrawNative = [];
                    this.id = id;
                }
            };
            EngineImpl = class EngineImpl {
                constructor(nativeContext) {
                    this.screenSize = new types_ts_2.Size();
                    this.layers = [];
                    this.updateables = new Set();
                    this.updatesCount = 0;
                    this.lastWidgetUnderMouse = null;
                    this.nativeContext = nativeContext;
                    this.context = new context_ts_1.EngineContextImpl(this.nativeContext.screen);
                    this.nativeContext.input.onMouseEvent((e) => this.onMouseEventInternal(e));
                    for (let i = 0; i < types_ts_2.LAYERS_COUNT; i++) {
                        this.layers.push(new EngineLayer(i));
                    }
                }
                async init() {
                    await this.nativeContext.init();
                    let consoleSize = this.nativeContext.screen.getScreenSize();
                    while (consoleSize === null) {
                        await new Promise((resolve) => {
                            setTimeout(resolve, 1);
                        });
                        consoleSize = this.nativeContext.screen.getScreenSize();
                    }
                    this.screenSize.set(consoleSize.width, consoleSize.height);
                    this.nativeContext.screen.onScreenSizeChanged(this.onScreenSizeChanged.bind(this));
                }
                onScreenSizeChanged(size) {
                    if (!size.equals(this.screenSize)) {
                        this.screenSize.set(size.width, size.height);
                        for (let i = 0; i < this.layers.length; i++) {
                            this.invalidateRect(new types_ts_2.Rect(0, 0, this.screenSize.width, this.screenSize.height), this.layers[i].id);
                        }
                    }
                }
                drawInvalidRects(layer) {
                    let drawnRects = 0;
                    let drawnArea = 0;
                    if (layer.invalidRects.length > 0) {
                        let pendingLayout = true;
                        const clip = new types_ts_2.Rect();
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
                            if (clip.width <= 0 ||
                                clip.height <= 0 ||
                                clip.x > screenSize.width ||
                                clip.y > screenSize.height) {
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
                drawOnNextDrawNative(layer) {
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
                draw() {
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
                updateLayout(layer) {
                    for (let i = 0; i < layer.children.length; i++) {
                        layer.children[i].updateLayout(this.screenSize.width, this.screenSize.height);
                    }
                }
                update() {
                    const params = {
                        updatesCount: this.updatesCount,
                    };
                    this.updateables.forEach((u) => u.onUpdate(params));
                    this.updatesCount++;
                }
                addWidget(widget, layer) {
                    widget.layer = layer;
                    this.layers[layer].children.push(widget);
                    widget.engine = this;
                    widget.updateLayout(this.screenSize.width, this.screenSize.height);
                    this.invalidateRect(widget.getBoundingBox(), widget.layer);
                }
                removeWidget(widget) {
                    const layer = this.layers[widget.layer];
                    const ix = layer.children.indexOf(widget);
                    if (ix >= 0)
                        layer.children.splice(ix, 1);
                    this.invalidateRect(widget.getBoundingBox(), layer.id);
                }
                onKeyEvent(listener) {
                    this.nativeContext.input.onKeyEvent(listener);
                }
                onMouseEvent(listener) {
                    this.nativeContext.input.onMouseEvent(listener);
                }
                invalidateRect(rect, layer) {
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
                destroy() {
                    this.nativeContext.destroy();
                }
                onNextDrawNative(layer, cb) {
                    this.layers[layer].onNextDrawNative.push(cb);
                }
                getWidgetAt(x, y) {
                    for (let l = this.layers.length - 1; l >= 0; l--) {
                        const children = this.layers[l].children;
                        for (let i = children.length - 1; i >= 0; i--) {
                            const child = children[i];
                            const w = child.getAt(x - child.visibleX, y - child.visibleY);
                            if (w !== null)
                                return w;
                        }
                    }
                    return null;
                }
                sendMouseEventToWidget(w, screenX, screenY, type) {
                    const bbox = w.getBoundingBox();
                    if (type === "up" && !bbox.contains(screenX, screenY)) {
                        type = "up-out";
                    }
                    w.mouse({ type, x: screenX - bbox.x, y: screenY - bbox.y });
                }
                onMouseEventInternal(e) {
                    const w = this.getWidgetAt(e.x, e.y);
                    switch (e.type) {
                        case "down":
                            if (this.lastWidgetUnderMouse !== null) {
                                //Send lost up event
                                this.sendMouseEventToWidget(this.lastWidgetUnderMouse, e.x, e.y, "up");
                            }
                            this.lastWidgetUnderMouse = w;
                            if (this.lastWidgetUnderMouse !== null) {
                                this.sendMouseEventToWidget(this.lastWidgetUnderMouse, e.x, e.y, "down");
                            }
                            break;
                        case "up":
                            if (this.lastWidgetUnderMouse !== null) {
                                this.sendMouseEventToWidget(this.lastWidgetUnderMouse, e.x, e.y, "up");
                                this.lastWidgetUnderMouse = null;
                            }
                            break;
                        case "move":
                            if (this.lastWidgetUnderMouse !== null) {
                                this.sendMouseEventToWidget(this.lastWidgetUnderMouse, e.x, e.y, "move");
                            }
                            break;
                    }
                }
                setFullscreen(fullscreen) {
                    this.nativeContext.screen.setFullscreen(fullscreen);
                }
                toggleStats() {
                    this.nativeContext.screen.toggleStats();
                }
                registerUpdateable(updateable) {
                    this.updateables.add(updateable);
                }
                unregisterUpdateable(updateable) {
                    this.updateables.delete(updateable);
                }
            };
        }
    };
});
System.register("engine/src/widgets/widget", ["engine/src/types"], function (exports_5, context_5) {
    "use strict";
    var types_ts_3, BaseWidget;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (types_ts_3_1) {
                types_ts_3 = types_ts_3_1;
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
                    this._sortingLayer = 0;
                    this._layer = 0;
                    this._parent = null;
                    this._engine = null;
                    this._boundingBox = new types_ts_3.Rect();
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
                        if (this._engine !== null && types_ts_3.isUpdateable(this)) {
                            this._engine.unregisterUpdateable(this);
                        }
                        this._engine = val;
                        if (this._engine !== null && types_ts_3.isUpdateable(this)) {
                            this._engine.registerUpdateable(this);
                        }
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
                        this._x = v | 0;
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
                        this._y = v | 0;
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
                        this._width = v | 0;
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
                        this._height = v | 0;
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
                        this._pivotX = v | 0;
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
                        this._pivotY = v | 0;
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
                get sortingLayer() {
                    return this._sortingLayer;
                }
                set sortingLayer(v) {
                    if (v !== this._sortingLayer) {
                        this._sortingLayer = v;
                        this.invalidate();
                        this._parent?.onChildrenTransformChanged(this);
                    }
                }
                get layer() {
                    return this._layer;
                }
                set layer(v) {
                    if (v !== this._layer) {
                        this.invalidate();
                        this._layer = v;
                        this.invalidate();
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
                            this.layer = this._parent.layer;
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
                    engine?.invalidateRect(bbox, this.layer);
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
            exports_5("BaseWidget", BaseWidget);
        }
    };
});
System.register("engine/src/widgets/ui/label", ["engine/src/widgets/widget"], function (exports_6, context_6) {
    "use strict";
    var widget_ts_1, LabelWidget;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (widget_ts_1_1) {
                widget_ts_1 = widget_ts_1_1;
            }
        ],
        execute: function () {
            LabelWidget = class LabelWidget extends widget_ts_1.BaseWidget {
                constructor(font, text, foreColor, backColor) {
                    super();
                    this._text = "";
                    this._lines = [];
                    this.font = font;
                    this.height = font.tileHeight;
                    this.text = text;
                    this.foreColor = foreColor;
                    this.backColor = backColor;
                    this.solid = false;
                }
                set text(val) {
                    if (val !== this._text) {
                        this._text = val;
                        this._lines = val.split("\n");
                        this.width = this._lines.map((s) => s.length).reduce((max, c) => Math.max(max, c), 0) * this.font.tileWidth;
                        this.height = this._lines.length * this.font.tileHeight;
                        this.invalidate();
                    }
                }
                get text() {
                    return this._text;
                }
                drawSelf(context) {
                    context.textColor(this.foreColor, this.backColor);
                    for (let i = 0; i < this._lines.length; i++) {
                        context.moveCursorTo(0, i * this.font.tileHeight).text(this.font, this._lines[i]);
                    }
                }
            };
            exports_6("LabelWidget", LabelWidget);
        }
    };
});
System.register("engine/src/widgets/widget-container", ["engine/src/widgets/widget"], function (exports_7, context_7) {
    "use strict";
    var widget_ts_2, BaseWidgetContainer;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (widget_ts_2_1) {
                widget_ts_2 = widget_ts_2_1;
            }
        ],
        execute: function () {
            BaseWidgetContainer = class BaseWidgetContainer extends widget_ts_2.BaseWidget {
                constructor() {
                    super(...arguments);
                    this._children = [];
                    this._selfSolid = true;
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
                get layer() {
                    return super.layer;
                }
                set layer(v) {
                    if (v !== this.layer) {
                        super.layer = v;
                        for (let i = 0; i < this._children.length; i++) {
                            this._children[i].layer = this.layer;
                        }
                    }
                }
                get selfSolid() {
                    return this._selfSolid;
                }
                set selfSolid(val) {
                    if (val !== this._selfSolid) {
                        this._selfSolid = val;
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
                    return this.selfSolid ? this : null;
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
            exports_7("BaseWidgetContainer", BaseWidgetContainer);
        }
    };
});
System.register("engine/src/widgets/group", ["engine/src/widgets/widget-container"], function (exports_8, context_8) {
    "use strict";
    var widget_container_ts_1, GroupContainerWidget;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (widget_container_ts_1_1) {
                widget_container_ts_1 = widget_container_ts_1_1;
            }
        ],
        execute: function () {
            GroupContainerWidget = class GroupContainerWidget extends widget_container_ts_1.BaseWidgetContainer {
                drawSelf() { }
            };
            exports_8("GroupContainerWidget", GroupContainerWidget);
        }
    };
});
System.register("engine/src/widgets/game/animated-tile", ["engine/src/widgets/widget"], function (exports_9, context_9) {
    "use strict";
    var widget_ts_3, AnimatedTileWidget;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (widget_ts_3_1) {
                widget_ts_3 = widget_ts_3_1;
            }
        ],
        execute: function () {
            AnimatedTileWidget = class AnimatedTileWidget extends widget_ts_3.BaseWidget {
                constructor(animation) {
                    super();
                    this.tile = null;
                    this.frame = 0;
                    this.animationFinishedCb = null;
                    this.nextFrameUpdateCount = 0;
                    this.animation = animation;
                    this.updateCurrentTile();
                }
                setAnimation(animation) {
                    if (animation !== this.animation) {
                        this.animation = animation;
                        this.frame = 0;
                        this.updateCurrentAnimation();
                    }
                }
                updateCurrentAnimation() {
                    this.nextFrameUpdateCount = 0;
                    const animation = this.animation;
                    if (animation === null)
                        return;
                    this.updateCurrentTile();
                    if (animation.delayInUpdates > 0 && animation.tiles.length > 1) {
                        this.nextFrameUpdateCount = animation.delayInUpdates;
                    }
                }
                updateCurrentTile() {
                    const animation = this.animation;
                    if (animation === null)
                        return;
                    const newTile = this.animation.loops
                        ? animation.tiles[this.frame % animation.tiles.length]
                        : animation.tiles[this.frame < animation.tiles.length
                            ? this.frame
                            : animation.tiles.length - 1];
                    if (newTile !== this.tile) {
                        this.tile = newTile;
                        this.width = newTile.width;
                        this.height = newTile.height;
                        this.invalidate();
                    }
                    this.frame++;
                    if (!this.animation.loops &&
                        this.frame === animation.tiles.length) {
                        this.nextFrameUpdateCount = 0;
                        if (this.animationFinishedCb !== null) {
                            this.animationFinishedCb();
                        }
                    }
                }
                drawSelf(context) {
                    if (this.tile !== null)
                        context.tile(0, 0, this.tile);
                }
                onUpdate() {
                    if (this.nextFrameUpdateCount > 0) {
                        this.nextFrameUpdateCount--;
                        if (this.nextFrameUpdateCount === 0) {
                            this.updateCurrentAnimation();
                        }
                    }
                }
            };
            exports_9("AnimatedTileWidget", AnimatedTileWidget);
        }
    };
});
System.register("game/src/avatar", ["engine/src/widgets/group", "engine/src/widgets/game/animated-tile"], function (exports_10, context_10) {
    "use strict";
    var group_ts_1, animated_tile_ts_1, WALK_SPEED, Avatar;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (group_ts_1_1) {
                group_ts_1 = group_ts_1_1;
            },
            function (animated_tile_ts_1_1) {
                animated_tile_ts_1 = animated_tile_ts_1_1;
            }
        ],
        execute: function () {
            WALK_SPEED = 4;
            Avatar = class Avatar extends group_ts_1.GroupContainerWidget {
                constructor(avatarId, assets) {
                    super();
                    this.lastX = 0;
                    this.lastY = 0;
                    this.direction = "down";
                    this.action = "";
                    this.blockingAction = false;
                    this.canMove_ = true;
                    this.nextAction = "";
                    this.avatarId = avatarId;
                    this.assets = assets;
                    this.avatarAnimations = new animated_tile_ts_1.AnimatedTileWidget(assets.getAnimation(avatarId + "-" + this.direction));
                    this.shadowAnimations = new animated_tile_ts_1.AnimatedTileWidget(assets.getAnimation("shadows-down"));
                    this.avatarAnimations.animationFinishedCb = () => this.onAnimationFinished();
                    this.shadowAnimations.parent = this;
                    this.shadowAnimations.y = 3;
                    this.avatarAnimations.parent = this;
                    this.pivotX = -Math.floor(this.avatarAnimations.width / 2);
                    this.pivotY = -Math.floor((this.avatarAnimations.height * 7) / 8);
                    this.width = this.avatarAnimations.width;
                    this.height = this.avatarAnimations.height + 3;
                }
                get canMove() {
                    return this.canMove_;
                }
                playAnimations() {
                    this.avatarAnimations.setAnimation(this.assets.getAnimation(this.avatarId + "-" + this.direction +
                        (this.action ? "-" + this.action : "")));
                    this.shadowAnimations.setAnimation(this.assets.getAnimation("shadows" + "-" + this.direction +
                        (this.action ? "-" + this.action : "")));
                }
                setDirection(direction) {
                    this.direction = direction;
                }
                setAction(action) {
                    this.action = action;
                }
                onAnimationFinished() {
                    if (this.blockingAction) {
                        this.setAction("");
                        this.nextAction = "";
                        this.canMove_ = true;
                        this.blockingAction = false;
                    }
                }
                updateAnimations() {
                    const dx = this.x - this.lastX;
                    const dy = this.y - this.lastY;
                    if (dx < 0) {
                        this.setDirection("left");
                    }
                    else if (dx > 0) {
                        this.setDirection("right");
                    }
                    else if (dy < 0) {
                        this.setDirection("up");
                    }
                    else if (dy > 0) {
                        this.setDirection("down");
                    }
                    if (dx !== 0 || dy !== 0) {
                        this.setAction("walking");
                    }
                    else if (this.blockingAction) {
                        this.setAction(this.nextAction);
                    }
                    else {
                        this.setAction("");
                    }
                    this.playAnimations();
                    this.lastX = this.x;
                    this.lastY = this.y;
                }
                move(dx, dy) {
                    if (this.canMove) {
                        this.x += dx * WALK_SPEED;
                        this.y += dy * WALK_SPEED;
                    }
                }
                shoot() {
                    if (this.canMove) {
                        this.blockingAction = true;
                        this.canMove_ = false;
                        this.nextAction = "shoot";
                    }
                }
                slash() {
                    if (this.canMove) {
                        this.blockingAction = true;
                        this.canMove_ = false;
                        this.nextAction = "slash";
                    }
                }
                onUpdate() {
                    this.updateAnimations();
                }
            };
            exports_10("Avatar", Avatar);
        }
    };
});
System.register("engine/src/widgets/game/tile", ["engine/src/widgets/widget"], function (exports_11, context_11) {
    "use strict";
    var widget_ts_4, TileWidget;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (widget_ts_4_1) {
                widget_ts_4 = widget_ts_4_1;
            }
        ],
        execute: function () {
            TileWidget = class TileWidget extends widget_ts_4.BaseWidget {
                constructor(tile) {
                    super();
                    this.tile = tile;
                    this.width = tile.width;
                    this.height = tile.height;
                }
                drawSelf(context) {
                    context.tile(0, 0, this.tile);
                }
            };
            exports_11("TileWidget", TileWidget);
        }
    };
});
System.register("engine/src/widgets/game/tilemap", ["engine/src/widgets/widget"], function (exports_12, context_12) {
    "use strict";
    var widget_ts_5, TilemapWidget;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (widget_ts_5_1) {
                widget_ts_5 = widget_ts_5_1;
            }
        ],
        execute: function () {
            TilemapWidget = class TilemapWidget extends widget_ts_5.BaseWidget {
                constructor(tilemap, tilesWidth, tilesHeight, defaultTileIndex = 0) {
                    super();
                    this.tilemap = tilemap;
                    this.tilesWidth = tilesWidth;
                    this.tilesHeight = tilesHeight;
                    this.tiles = [];
                    for (let y = 0; y < tilesHeight; y++) {
                        const row = [];
                        for (let x = 0; x < tilesWidth; x++) {
                            row.push(defaultTileIndex);
                        }
                        this.tiles.push(row);
                    }
                    this.width = tilemap.tileWidth * tilesWidth;
                    this.height = tilemap.tileHeight * tilesHeight;
                }
                setTileIndex(x, y, index) {
                    if (x < 0 || y < 0 || x >= this.tilesWidth || y >= this.tilesHeight)
                        return;
                    this.tiles[y][x] = index;
                }
                getTileIndex(x, y) {
                    return this.tiles[y][x];
                }
                getTile(x, y) {
                    return this.tilemap.tiles[this.getTileIndex(x, y)];
                }
                getTileId(x, y) {
                    return this.getTile(x, y).id;
                }
                drawSelf(context) {
                    const tilemap = this.tilemap;
                    const tiles = this.tiles;
                    context.tilemap(0, 0, tilemap, tiles);
                }
            };
            exports_12("TilemapWidget", TilemapWidget);
        }
    };
});
System.register("engine/src/widgets/scrollable", ["engine/src/types", "engine/src/widgets/widget-container"], function (exports_13, context_13) {
    "use strict";
    var types_ts_4, widget_container_ts_2, ScrollableContainerWidget;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (types_ts_4_1) {
                types_ts_4 = types_ts_4_1;
            },
            function (widget_container_ts_2_1) {
                widget_container_ts_2 = widget_container_ts_2_1;
            }
        ],
        execute: function () {
            ScrollableContainerWidget = class ScrollableContainerWidget extends widget_container_ts_2.BaseWidgetContainer {
                constructor() {
                    super(...arguments);
                    this.backColor = types_ts_4.FixedColor.Black;
                    this.mouseHorizontalScrollEnabled = false;
                    this._mouseHorizontalScrollLimits = { fromX: -9999999, toX: 9999999 };
                    this._offsetX = 0;
                    this._offsetY = 0;
                    this.down = false;
                    this.downPos = new types_ts_4.Point();
                    this.downOffset = new types_ts_4.Point();
                    this.lastChildUnderMouse = null;
                }
                get mouseHorizontalScrollLimits() {
                    return this._mouseHorizontalScrollLimits;
                }
                set mouseHorizontalScrollLimits(val) {
                    this._mouseHorizontalScrollLimits = val;
                    this.setOffset(Math.max(Math.min(this.offsetX, this.mouseHorizontalScrollLimits.toX), this.mouseHorizontalScrollLimits.fromX), this.offsetY);
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
                setOffset(offsetX, offsetY, onNextDraw = true) {
                    offsetX = offsetX | 0;
                    offsetY = offsetY | 0;
                    if (offsetX === this._offsetX && offsetY === this._offsetY)
                        return;
                    if (!onNextDraw) {
                        this._offsetX = offsetX;
                        this._offsetY = offsetY;
                        this.invalidate();
                        return;
                    }
                    this.engine?.onNextDrawNative(this.layer, ({ context, invalidateRect }) => {
                        const dx = offsetX - this.offsetX;
                        const dy = offsetY - this.offsetY;
                        if (dx === 0 && dy === 0)
                            return;
                        const bbox = this.getBoundingBox();
                        if (Math.abs(dx) > bbox.width || Math.abs(dy) < bbox.height) {
                            //Scroll delta too big, nothing to reuse from the screen.. just invalidate..
                            this._offsetX = offsetX;
                            this._offsetY = offsetY;
                            this.invalidate();
                            return;
                        }
                        this._offsetX = offsetX;
                        this._offsetY = offsetY;
                        context.scrollRect(bbox.x, bbox.y, bbox.width, bbox.height, dx, dy);
                        if (dy > 0) {
                            invalidateRect(new types_ts_4.Rect(bbox.x, bbox.y, bbox.width, dy));
                        }
                        else if (dy < 0) {
                            invalidateRect(new types_ts_4.Rect(bbox.x, bbox.y + bbox.height + dy, bbox.width, -dy));
                        }
                        if (dx > 0) {
                            invalidateRect(new types_ts_4.Rect(bbox.x, bbox.y, dx, bbox.height));
                        }
                        else if (dx < 0) {
                            invalidateRect(new types_ts_4.Rect(bbox.x + bbox.width + dx, bbox.y, -dx, bbox.height));
                        }
                    });
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
                getAt(x, y) {
                    if (!this.mouseHorizontalScrollEnabled)
                        return super.getAt(x, y);
                    if (!this.solid)
                        return null;
                    if (x < 0 || y < 0 || x > this.width || y > this.height)
                        return null;
                    return this.selfSolid ? this : null;
                }
                mouse(e) {
                    if (!this.mouseHorizontalScrollEnabled) {
                        super.mouse(e);
                        return;
                    }
                    let childUnderMouse = super.getAt(e.x, e.y);
                    if (childUnderMouse === this) {
                        childUnderMouse = null;
                    }
                    switch (e.type) {
                        case "down":
                            this.down = true;
                            this.downPos.set(e.x, e.y);
                            this.downOffset.set(this.offsetX, this.offsetY);
                            if (childUnderMouse !== null) {
                                this.lastChildUnderMouse = childUnderMouse;
                                this.lastChildUnderMouse.mouse({
                                    type: "down",
                                    x: this.lastChildUnderMouse.width / 2,
                                    y: this.lastChildUnderMouse.height / 2,
                                });
                            }
                            break;
                        case "move":
                            if (this.down) {
                                const deltaX = e.x - this.downPos.x;
                                if (Math.abs(deltaX) > 16 && this.lastChildUnderMouse !== null) {
                                    this.lastChildUnderMouse.mouse({
                                        type: "up-out",
                                        x: this.lastChildUnderMouse.width / 2,
                                        y: this.lastChildUnderMouse.height / 2,
                                    });
                                    this.lastChildUnderMouse = null;
                                }
                                const newOffsetX = this.downOffset.x + deltaX;
                                this.setOffset(Math.max(Math.min(newOffsetX, this.mouseHorizontalScrollLimits.toX), this.mouseHorizontalScrollLimits.fromX), this.downOffset.y);
                            }
                            break;
                        case "up":
                        case "up-out":
                            if (this.down) {
                                if (this.lastChildUnderMouse !== null) {
                                    this.lastChildUnderMouse.mouse({
                                        type: (this.lastChildUnderMouse === childUnderMouse &&
                                            e.type === "up")
                                            ? "up"
                                            : "up-out",
                                        x: this.lastChildUnderMouse.width / 2,
                                        y: this.lastChildUnderMouse.height / 2,
                                    });
                                    this.lastChildUnderMouse = null;
                                }
                                this.down = false;
                            }
                            break;
                    }
                }
            };
            exports_13("ScrollableContainerWidget", ScrollableContainerWidget);
        }
    };
});
System.register("engine/src/widgets/game/tiles-container", ["engine/src/types", "engine/src/widgets/scrollable"], function (exports_14, context_14) {
    "use strict";
    var types_ts_5, scrollable_ts_1, ScrollableTilesContainerWidget;
    var __moduleName = context_14 && context_14.id;
    function compareChildren(c1, c2) {
        if (c1.sortingLayer === c2.sortingLayer)
            return c1.visibleY - c2.visibleY;
        return c1.sortingLayer - c2.sortingLayer;
    }
    return {
        setters: [
            function (types_ts_5_1) {
                types_ts_5 = types_ts_5_1;
            },
            function (scrollable_ts_1_1) {
                scrollable_ts_1 = scrollable_ts_1_1;
            }
        ],
        execute: function () {
            ScrollableTilesContainerWidget = class ScrollableTilesContainerWidget extends scrollable_ts_1.ScrollableContainerWidget {
                constructor() {
                    super(...arguments);
                    this.tilemaps = [];
                    this.tilemapsBounds = new types_ts_5.Rect();
                }
                addTilemap(tilemap) {
                    tilemap.parent = this;
                    this.tilemaps.push(tilemap);
                    this.tilemapsBounds.union(new types_ts_5.Rect(0, 0, tilemap.width, tilemap.height));
                }
                onChildrenAdded(child) {
                    super.onChildrenAdded(child);
                    this.updateChildrenIndex(child);
                }
                onChildrenTransformChanged(child) {
                    super.onChildrenTransformChanged(child);
                    this.updateChildrenIndex(child);
                }
                updateChildrenIndex(child) {
                    const children = this._children;
                    let idx = children.indexOf(child);
                    if (idx >= 0) {
                        const prevOk = idx == 0 || compareChildren(children[idx - 1], child) <= 0;
                        const nextOk = idx == children.length - 1 ||
                            compareChildren(children[idx + 1], child) >= 0;
                        if (!prevOk) {
                            while (idx > 0 && compareChildren(children[idx - 1], child) > 0) {
                                const tmp = children[idx - 1];
                                children[idx - 1] = children[idx];
                                children[idx] = tmp;
                                idx--;
                            }
                        }
                        else if (!nextOk) {
                            while (idx < children.length - 1 &&
                                compareChildren(children[idx + 1], child) < 0) {
                                const tmp = children[idx + 1];
                                children[idx + 1] = children[idx];
                                children[idx] = tmp;
                                idx++;
                            }
                        }
                    }
                }
                drawSelf(context) {
                    //Clear background "outside" tilemap
                    if (this.tilemapsBounds.width > 0 && this.tilemapsBounds.height > 0) {
                        const tilemapHeight = this.tilemapsBounds.height;
                        const tilemapWidth = this.tilemapsBounds.width;
                        const FAR_FAR_AWAY = 9999999;
                        //Top
                        context.fillRect(this.innerX - FAR_FAR_AWAY, this.innerY - FAR_FAR_AWAY, FAR_FAR_AWAY + tilemapWidth + FAR_FAR_AWAY, FAR_FAR_AWAY, this.backColor);
                        //Bottom
                        context.fillRect(this.innerX - FAR_FAR_AWAY, this.innerY + tilemapHeight, FAR_FAR_AWAY + tilemapWidth + FAR_FAR_AWAY, FAR_FAR_AWAY, this.backColor);
                        //Left
                        context.fillRect(this.innerX - FAR_FAR_AWAY, this.innerY, FAR_FAR_AWAY, tilemapHeight, this.backColor);
                        //Right
                        context.fillRect(this.innerX + tilemapWidth, this.innerY, FAR_FAR_AWAY, tilemapHeight, this.backColor);
                    }
                    else {
                        super.drawSelf(context);
                    }
                }
            };
            exports_14("ScrollableTilesContainerWidget", ScrollableTilesContainerWidget);
        }
    };
});
System.register("game/src/random", [], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    function random(arr) {
        return arr[(Math.random() * arr.length) | 0];
    }
    exports_15("random", random);
    function randomIntervalInt(min, max) {
        return (min | 0) + ((Math.random() * (max - min)) | 0);
    }
    exports_15("randomIntervalInt", randomIntervalInt);
    function randomDirection() {
        return Math.round(Math.random() * 2 - 1) | 0;
    }
    exports_15("randomDirection", randomDirection);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("game/src/map", ["engine/src/types", "engine/src/widgets/game/tile", "engine/src/widgets/game/tilemap", "game/src/random"], function (exports_16, context_16) {
    "use strict";
    var types_ts_6, tile_ts_1, tilemap_ts_1, random_ts_1, MAP_SIZE, DECOS_COUNT, ALT_TERRAINS_COUNT, ALT_TERRAINS_MIN_SIZE, ALT_TERRAINS_MAX_SIZE, mainTerrain, altTerrains;
    var __moduleName = context_16 && context_16.id;
    function randomDecoTile(terrainId) {
        if (Math.random() > 0.5) {
            return terrainId + "-deco1";
        }
        return terrainId + "-deco2";
    }
    function randomCenterTile(terrainId) {
        if (Math.random() > 0.1) {
            return terrainId + "-center";
        }
        if (Math.random() > 0.5) {
            return terrainId + "-center2";
        }
        return terrainId + "-center3";
    }
    function initMap(tilesContainer, assets) {
        const floorTilemap = assets.getTilemap("terrain");
        const floor = new tilemap_ts_1.TilemapWidget(floorTilemap, MAP_SIZE, MAP_SIZE, 0);
        const floor2 = new tilemap_ts_1.TilemapWidget(floorTilemap, MAP_SIZE, MAP_SIZE, -1);
        floor.sortingLayer = -3;
        floor2.sortingLayer = -2;
        tilesContainer.addTilemap(floor);
        tilesContainer.addTilemap(floor2);
        const setFloor2Tile = (x, y, id) => {
            floor2.setTileIndex(x, y, floor2.tilemap.getTile(id).index);
        };
        const addTile = (x, y, id) => {
            const t = new tile_ts_1.TileWidget(assets.getTile(id));
            t.sortingLayer = -1;
            t.x = x * t.tile.width;
            t.y = y * t.tile.height;
            t.parent = tilesContainer;
        };
        const getTerrainId = (x, y) => {
            return floor.getTileId(x, y).split("-")[0];
        };
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                floor.setTileIndex(x, y, floor.tilemap.getTile(randomCenterTile(mainTerrain)).index);
            }
        }
        const addAltTerrain = (terrainId, fx, fy, w, h) => {
            const tx = fx + w;
            const ty = fy + h;
            for (let y = fy; y < ty; y++) {
                for (let x = fx; x < tx; x++) {
                    floor.setTileIndex(x, y, floor.tilemap.getTile(randomCenterTile(terrainId)).index);
                }
            }
            //Transition tiles
            for (let y = fy + 1; y < ty - 1; y++) {
                //Left
                setFloor2Tile(fx, y, getTerrainId(fx - 1, y) + "-right");
                //Right
                setFloor2Tile(tx - 1, y, getTerrainId(tx, y) + "-left");
            }
            for (let x = fx + 1; x < tx - 1; x++) {
                //Top
                setFloor2Tile(x, fy, getTerrainId(x, fy - 1) + "-bottom");
                //Bottom
                setFloor2Tile(x, ty - 1, getTerrainId(x, ty) + "-top");
            }
            setFloor2Tile(fx, fy, getTerrainId(fx - 1, fy - 1) + "-hole-br");
            setFloor2Tile(tx - 1, fy, getTerrainId(tx, fy - 1) + "-hole-bl");
            setFloor2Tile(fx, ty - 1, getTerrainId(fx - 1, ty) + "-hole-tr");
            setFloor2Tile(tx - 1, ty - 1, getTerrainId(tx, ty) + "-hole-tl");
        };
        const altTerrainsRects = [];
        const altTerrainsRectsOverflow = [];
        for (let i = 0; i < ALT_TERRAINS_COUNT; i++) {
            const w = random_ts_1.randomIntervalInt(ALT_TERRAINS_MIN_SIZE, ALT_TERRAINS_MAX_SIZE);
            const h = random_ts_1.randomIntervalInt(ALT_TERRAINS_MIN_SIZE, ALT_TERRAINS_MAX_SIZE);
            const terrainId = random_ts_1.random(altTerrains);
            const fx = random_ts_1.randomIntervalInt(1, MAP_SIZE - w - 1);
            const fy = random_ts_1.randomIntervalInt(1, MAP_SIZE - h - 1);
            const r = new types_ts_6.Rect(fx, fy, w, h);
            if (altTerrainsRectsOverflow.some((a) => a.intersects(r)))
                continue;
            addAltTerrain(terrainId, fx, fy, w, h);
            if (Math.random() > 0.5) {
                const nestedTerrainId = random_ts_1.random(altTerrains);
                if (nestedTerrainId !== terrainId) {
                    addAltTerrain(nestedTerrainId, fx + 2, fy + 2, w - 4, h - 4);
                }
            }
            altTerrainsRects.push(r);
            altTerrainsRectsOverflow.push(r.clone().expand(2));
        }
        for (let i = 0; i < DECOS_COUNT; i++) {
            const x = random_ts_1.randomIntervalInt(0, MAP_SIZE);
            const y = random_ts_1.randomIntervalInt(0, MAP_SIZE);
            if (altTerrainsRects.some((a) => x == a.x || x == a.x1 || y == a.y || y == a.y1)) {
                continue;
            }
            addTile(x, y, "terrain." + randomDecoTile(getTerrainId(x, y)));
        }
        return {
            floor,
            floor2,
        };
    }
    exports_16("default", initMap);
    return {
        setters: [
            function (types_ts_6_1) {
                types_ts_6 = types_ts_6_1;
            },
            function (tile_ts_1_1) {
                tile_ts_1 = tile_ts_1_1;
            },
            function (tilemap_ts_1_1) {
                tilemap_ts_1 = tilemap_ts_1_1;
            },
            function (random_ts_1_1) {
                random_ts_1 = random_ts_1_1;
            }
        ],
        execute: function () {
            MAP_SIZE = 512;
            DECOS_COUNT = 1024;
            ALT_TERRAINS_COUNT = 256;
            ALT_TERRAINS_MIN_SIZE = 8;
            ALT_TERRAINS_MAX_SIZE = 16;
            mainTerrain = "grass";
            altTerrains = [
                "water",
                "dirt",
                "dirt2",
                "dirt3",
                "rock",
                "grass2",
                "grass3",
                "sand",
                "snow",
            ];
        }
    };
});
System.register("game/src/npc", ["game/src/avatar", "game/src/random"], function (exports_17, context_17) {
    "use strict";
    var avatar_ts_1, random_ts_2, Npc;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (avatar_ts_1_1) {
                avatar_ts_1 = avatar_ts_1_1;
            },
            function (random_ts_2_1) {
                random_ts_2 = random_ts_2_1;
            }
        ],
        execute: function () {
            Npc = class Npc extends avatar_ts_1.Avatar {
                constructor() {
                    super(...arguments);
                    this.startingDelay = 5;
                    this.dx = 0;
                    this.dy = 0;
                    this.steps = 0;
                }
                onUpdate() {
                    if (this.startingDelay > 0) {
                        this.startingDelay--;
                        return;
                    }
                    if (this.steps <= 0) {
                        this.dx = random_ts_2.randomDirection();
                        this.dy = random_ts_2.randomDirection();
                        this.steps = random_ts_2.randomIntervalInt(60, 120);
                    }
                    this.move(this.dx, this.dy);
                    this.steps--;
                    super.onUpdate();
                }
            };
            exports_17("Npc", Npc);
        }
    };
});
System.register("engine/src/widgets/ui/box", ["engine/src/types", "engine/src/widgets/widget-container"], function (exports_18, context_18) {
    "use strict";
    var types_ts_7, widget_container_ts_3, BoxContainerWidget;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (types_ts_7_1) {
                types_ts_7 = types_ts_7_1;
            },
            function (widget_container_ts_3_1) {
                widget_container_ts_3 = widget_container_ts_3_1;
            }
        ],
        execute: function () {
            BoxContainerWidget = class BoxContainerWidget extends widget_container_ts_3.BaseWidgetContainer {
                constructor(border = 0) {
                    super();
                    this.backColor = types_ts_7.FixedColor.Black;
                    this.borderColor = types_ts_7.FixedColor.Black;
                    this.border = 0;
                    this.border = border;
                }
                get innerX() {
                    return this.border;
                }
                get innerY() {
                    return this.border;
                }
                get innerWidth() {
                    return this.width - this.border * 2;
                }
                get innerHeight() {
                    return this.height - this.border * 2;
                }
                preDrawChildren(context) {
                    if (this.innerX > 0 || this.innerY > 0) {
                        context.pushTransform(this.innerX, this.innerY);
                        context.pushClip(0, 0, this.innerWidth, this.innerHeight);
                    }
                }
                postDrawChildren(context) {
                    if (this.innerX > 0 || this.innerY > 0) {
                        context.popClip();
                        context.popTransform();
                    }
                }
                drawSelf(context) {
                    if (this.border > 0) {
                        if (this.borderColor !== types_ts_7.FixedColor.Transparent) {
                            //Top border
                            context.fillRect(0, 0, this.width, this.border, this.borderColor);
                            //Bottom border
                            context.fillRect(0, this.height - this.border, this.width, this.border, this.borderColor);
                            //Left border
                            context.fillRect(0, 0, this.border, this.height, this.borderColor);
                            //Right border
                            context.fillRect(this.width - this.border, 0, this.border, this.height, this.borderColor);
                        }
                    }
                    if (this.backColor !== types_ts_7.FixedColor.Transparent) {
                        context.fillRect(this.innerX, this.innerY, this.innerWidth, this.innerHeight, this.backColor);
                    }
                }
            };
            exports_18("BoxContainerWidget", BoxContainerWidget);
        }
    };
});
System.register("game/src/types", [], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("game/src/utils", [], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    function followAvatar(avatar, map) {
        let newOffsetX = -avatar.x + Math.floor(map.width * 0.5);
        let newOffsetY = -avatar.y + Math.floor(map.height * 0.5);
        map.setOffset(Math.max(Math.min(newOffsetX, 0), -(map.tilemapsBounds.width - map.width)), Math.max(Math.min(newOffsetY, 0), -(map.tilemapsBounds.height - map.height)));
    }
    exports_20("followAvatar", followAvatar);
    function isKeyDown(game, key) {
        return game.keysDown.get(key) || false;
    }
    exports_20("isKeyDown", isKeyDown);
    function setKeyDown(game, key, down) {
        game.keysDown.set(key, down);
    }
    exports_20("setKeyDown", setKeyDown);
    function isSpecialKeyDown(game, code) {
        return game.specialKeysDown.get(code) || false;
    }
    exports_20("isSpecialKeyDown", isSpecialKeyDown);
    function setSpecialKeyDown(game, code, down) {
        game.specialKeysDown.set(code, down);
    }
    exports_20("setSpecialKeyDown", setSpecialKeyDown);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("engine/src/widgets/ui/button", ["engine/src/widgets/widget-container"], function (exports_21, context_21) {
    "use strict";
    var widget_container_ts_4, ButtonWidget;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [
            function (widget_container_ts_4_1) {
                widget_container_ts_4 = widget_container_ts_4_1;
            }
        ],
        execute: function () {
            ButtonWidget = class ButtonWidget extends widget_container_ts_4.BaseWidgetContainer {
                constructor(backColor, pressedColor, onTapped = null) {
                    super();
                    this.onTapped = null;
                    this.down = false;
                    this.backColor = backColor;
                    this.pressedColor = pressedColor;
                    this.onTapped = onTapped;
                }
                drawSelf(context) {
                    const backColor = this.down ? this.pressedColor : this.backColor;
                    context.fillRect(0, 0, this.width, this.height, backColor);
                }
                mouse(e) {
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
                                if (this.onTapped !== null)
                                    this.onTapped();
                            }
                            break;
                    }
                }
            };
            exports_21("ButtonWidget", ButtonWidget);
        }
    };
});
System.register("engine/src/widgets/ui/button-text", ["engine/src/widgets/ui/button"], function (exports_22, context_22) {
    "use strict";
    var button_ts_1, TextButtonWidget;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (button_ts_1_1) {
                button_ts_1 = button_ts_1_1;
            }
        ],
        execute: function () {
            TextButtonWidget = class TextButtonWidget extends button_ts_1.ButtonWidget {
                constructor(font, text, foreColor, backColor, pressedColor, onTapped = null) {
                    super(backColor, pressedColor, onTapped);
                    this._text = "";
                    this._lines = [];
                    this.font = font;
                    this.height = font.tileHeight;
                    this.text = text;
                    this.foreColor = foreColor;
                }
                set text(val) {
                    if (val !== this._text) {
                        this._text = val;
                        this._lines = val.split("\n");
                        this.width = (this._lines.map((s) => s.length).reduce((max, c) => Math.max(max, c), 0) + 2) * this.font.tileWidth;
                        this.height = (this._lines.length + 2) * this.font.tileHeight;
                        this.invalidate();
                    }
                }
                get text() {
                    return this._text;
                }
                drawSelf(context) {
                    const backColor = this.down ? this.pressedColor : this.backColor;
                    context.textColor(this.foreColor, backColor);
                    context.textBorder(this.font, 0, 0, this.width, this.height);
                    context.fillRect(this.font.tileWidth, this.font.tileHeight, this.width - this.font.tileWidth * 2, this.height - this.font.tileHeight * 2, backColor);
                    for (let i = 0; i < this._lines.length; i++) {
                        const line = this._lines[i];
                        context.moveCursorTo(this.font.tileWidth +
                            (((this.width - this.font.tileWidth * 2) -
                                (line.length * this.font.tileWidth)) / 2) | 0, (i + 1) * this.font.tileHeight +
                            (((this.height - this.font.tileHeight * 2) -
                                (this._lines.length * this.font.tileHeight)) / 2) | 0)
                            .text(this.font, line);
                    }
                }
            };
            exports_22("TextButtonWidget", TextButtonWidget);
        }
    };
});
System.register("game/src/ui", ["engine/src/types", "engine/src/widgets/ui/button", "engine/src/widgets/ui/box", "engine/src/widgets/scrollable", "engine/src/widgets/game/tile", "engine/src/widgets/ui/button-text"], function (exports_23, context_23) {
    "use strict";
    var types_ts_8, button_ts_2, box_ts_1, scrollable_ts_2, tile_ts_2, button_text_ts_1, ITEM_IMAGE_WIDTH, ITEM_IMAGE_HEIGHT, ITEM_IMAGE_BORDER, ITEM_WIDTH, ITEM_HEIGHT;
    var __moduleName = context_23 && context_23.id;
    function initUI(engine, assets, native) {
        const font = assets.defaultFont;
        const mainUI = new box_ts_1.BoxContainerWidget(0);
        mainUI.layer = 1 /* UI */;
        mainUI.selfSolid = false;
        mainUI.layout = { widthPercent: 100, heightPercent: 100 };
        mainUI.backColor = types_ts_8.FixedColor.Transparent;
        const statsContainer = new box_ts_1.BoxContainerWidget(4);
        statsContainer.solid = false;
        statsContainer.width = 14 * font.tileWidth + statsContainer.border * 2;
        statsContainer.height = 5 * font.tileHeight + statsContainer.border * 2;
        statsContainer.layout = {
            verticalSpacingPercent: 0,
            horizontalSpacingPercent: 100,
        };
        const buttonsContainer = new box_ts_1.BoxContainerWidget(4);
        buttonsContainer.width = 8 * font.tileWidth;
        buttonsContainer.height = 8;
        buttonsContainer.layout = {
            verticalSpacingPercent: 100,
            horizontalSpacingPercent: 100,
        };
        const itemsContainerContainer = new box_ts_1.BoxContainerWidget(4);
        itemsContainerContainer.height = ITEM_HEIGHT +
            itemsContainerContainer.border * 2;
        itemsContainerContainer.layout = {
            widthPercent: 75,
            verticalSpacingPercent: 100,
            horizontalSpacingPercent: 50,
            customSizeFn: (w, parentWidth) => {
                w.width = Math.min(w.width, parentWidth - (buttonsContainer.width * 2 + 8));
            },
        };
        itemsContainerContainer.backColor = types_ts_8.FixedColor.Transparent;
        const decoTiles = assets.getTilemap("terrain").tiles.filter((x) => x.id.includes("deco"));
        const itemsCount = decoTiles.length;
        const itemsButtons = new Map();
        const itemsContainer = new scrollable_ts_2.ScrollableContainerWidget();
        const allItemsWidth = itemsCount * (ITEM_WIDTH + font.tileWidth);
        itemsContainer.layout = {
            widthPercent: 100,
            heightPercent: 100,
            customSizeFn: (w) => {
                itemsContainer.mouseHorizontalScrollLimits = {
                    fromX: Math.min(ITEM_WIDTH / 2, -allItemsWidth + w.width - ITEM_WIDTH / 2) | 0,
                    toX: (ITEM_WIDTH / 2) | 0,
                };
            },
        };
        itemsContainer.parent = itemsContainerContainer;
        itemsContainer.backColor = types_ts_8.rgb(0 /* I0 */, 51 /* I20 */, 102 /* I40 */);
        itemsContainer.childrenLayout = {
            type: "horizontal",
            spacing: font.tileWidth,
        };
        itemsContainer.mouseHorizontalScrollEnabled = true;
        for (let i = 0; i < itemsCount; i++) {
            const item = new button_ts_2.ButtonWidget(types_ts_8.FixedColor.Cyan, types_ts_8.FixedColor.Yellow);
            const tile = new tile_ts_2.TileWidget(decoTiles[i])
                .setLayout({ verticalSpacingPercent: 50, horizontalSpacingPercent: 50 });
            tile.parent = item;
            tile.solid = false;
            item.height = ITEM_HEIGHT;
            item.width = ITEM_WIDTH;
            item.parent = itemsContainer;
            itemsButtons.set(item, decoTiles[i]);
        }
        statsContainer.parent = mainUI;
        buttonsContainer.parent = mainUI;
        itemsContainerContainer.parent = mainUI;
        itemsContainerContainer.borderColor = buttonsContainer.borderColor =
            statsContainer.borderColor = types_ts_8.rgb(0 /* I0 */, 51 /* I20 */, 102 /* I40 */);
        statsContainer.backColor = types_ts_8.rgb(0 /* I0 */, 51 /* I20 */, 102 /* I40 */);
        buttonsContainer.backColor = types_ts_8.rgb(0 /* I0 */, 51 /* I20 */, 102 /* I40 */);
        itemsContainerContainer.backColor = types_ts_8.rgb(0 /* I0 */, 51 /* I20 */, 102 /* I40 */);
        statsContainer.childrenLayout = {
            type: "vertical",
            spacing: 0,
        };
        buttonsContainer.childrenLayout = {
            type: "vertical",
            spacing: font.tileHeight,
        };
        const addButton = (text, cb) => {
            const button = new button_text_ts_1.TextButtonWidget(font, text, types_ts_8.FixedColor.White, types_ts_8.FixedColor.Green, types_ts_8.FixedColor.Yellow, () => cb()).setLayout({ widthPercent: 100 });
            button.parent = buttonsContainer;
            buttonsContainer.height = buttonsContainer.border * 2 +
                buttonsContainer.children.map((x) => x.height).reduce((acc, v) => acc + v, 0) +
                Math.max(buttonsContainer.children.length - 1, 0) *
                    (buttonsContainer.childrenLayout?.spacing || 0);
            return button;
        };
        addButton("Stat", () => engine.toggleStats());
        let isFullcreen = false;
        const fullScreenButton = addButton("Full", () => {
            if (isFullcreen) {
                engine.setFullscreen(false);
            }
            else {
                engine.setFullscreen(true);
            }
        });
        native.screen.onFullScreenChanged((fullscreen) => {
            if (isFullcreen !== fullscreen) {
                isFullcreen = fullscreen;
                fullScreenButton.text = isFullcreen ? "Exit" : "Full";
            }
        });
        return {
            mainUI,
            statsContainer,
            buttonsContainer,
            addButton,
            itemsButtons,
        };
    }
    exports_23("initUI", initUI);
    return {
        setters: [
            function (types_ts_8_1) {
                types_ts_8 = types_ts_8_1;
            },
            function (button_ts_2_1) {
                button_ts_2 = button_ts_2_1;
            },
            function (box_ts_1_1) {
                box_ts_1 = box_ts_1_1;
            },
            function (scrollable_ts_2_1) {
                scrollable_ts_2 = scrollable_ts_2_1;
            },
            function (tile_ts_2_1) {
                tile_ts_2 = tile_ts_2_1;
            },
            function (button_text_ts_1_1) {
                button_text_ts_1 = button_text_ts_1_1;
            }
        ],
        execute: function () {
            ITEM_IMAGE_WIDTH = 32;
            ITEM_IMAGE_HEIGHT = 32;
            ITEM_IMAGE_BORDER = 8;
            ITEM_WIDTH = ITEM_IMAGE_WIDTH + ITEM_IMAGE_BORDER * 2;
            ITEM_HEIGHT = ITEM_IMAGE_HEIGHT + ITEM_IMAGE_BORDER * 2;
        }
    };
});
System.register("game/src/game", ["engine/src/types", "game/src/avatar", "game/src/map", "game/src/random", "game/src/npc", "game/src/utils", "game/src/ui", "engine/src/widgets/game/tiles-container"], function (exports_24, context_24) {
    "use strict";
    var types_ts_9, avatar_ts_2, map_ts_1, random_ts_3, npc_ts_1, utils_ts_1, ui_ts_1, tiles_container_ts_1, NPCS_COUNT, ENABLE_P2, mouseMode, mouseKeyCodes, mouseModeAddTile;
    var __moduleName = context_24 && context_24.id;
    function onKeyEvent(game, e) {
        if (e.char) {
            if (e.type === "down") {
                utils_ts_1.setKeyDown(game, e.char, true);
            }
            else if (e.type === "up") {
                utils_ts_1.setKeyDown(game, e.char, false);
            }
        }
        else if (e.code) {
            if (e.type === "down") {
                utils_ts_1.setSpecialKeyDown(game, e.code, true);
            }
            else if (e.type === "up") {
                utils_ts_1.setSpecialKeyDown(game, e.code, false);
            }
        }
    }
    function switchToAddTileMode(tile) {
        mouseMode = 2 /* AddTile */;
        mouseModeAddTile = tile;
    }
    function mouseEventToMapCoordinates(engine, game, e) {
        let widgetAt = engine.getWidgetAt(e.x, e.y);
        while (widgetAt !== null && widgetAt !== game.map) {
            widgetAt = widgetAt.parent;
        }
        if (widgetAt === null)
            return null;
        const map = game.map;
        const bounds = map.getBoundingBox();
        return new types_ts_9.Point(e.x - bounds.x - map.offsetX, e.y - bounds.y - map.offsetY);
    }
    function mouseEventToKeyCodes(engine, game, e) {
        const keyCodes = [];
        if (mouseEventToMapCoordinates(engine, game, e) === null)
            return keyCodes;
        const map = game.map;
        const bounds = map.getBoundingBox();
        let dx = e.x - bounds.x - bounds.width * 0.5;
        let dy = e.y - bounds.y - bounds.height * 0.5;
        let len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
            if (dx < -0.25) {
                keyCodes.push(1 /* ArrowLeft */);
            }
            else if (dx > 0.25) {
                keyCodes.push(2 /* ArrowRight */);
            }
            if (dy < -0.25) {
                keyCodes.push(3 /* ArrowUp */);
            }
            else if (dy > 0.25) {
                keyCodes.push(4 /* ArrowDown */);
            }
        }
        return keyCodes;
    }
    function keyCodesEqual(codes1, codes2) {
        if (codes1.length !== codes2.length)
            return false;
        for (let i = 0; i < codes1.length; i++) {
            if (codes1[i] !== codes2[i])
                return false;
        }
        return true;
    }
    function onMouseEvent(engine, game, e) {
        switch (e.type) {
            case "down":
                {
                    if (mouseMode === 2 /* AddTile */ && mouseModeAddTile !== null) {
                        const mapCoords = mouseEventToMapCoordinates(engine, game, e);
                        if (mapCoords !== null) {
                            const tx = (mapCoords.x / game.floorLayer2.tilemap.tileWidth) | 0;
                            const ty = (mapCoords.y / game.floorLayer2.tilemap.tileHeight) | 0;
                            game.floorLayer2.setTileIndex(tx, ty, mouseModeAddTile.index);
                            game.floorLayer2.invalidate();
                        }
                        mouseMode = 0 /* None */;
                    }
                    else {
                        const newCodes = mouseEventToKeyCodes(engine, game, e);
                        if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
                            mouseMode = 1 /* Move */;
                            mouseKeyCodes.forEach((code) => utils_ts_1.setSpecialKeyDown(game, code, false));
                            mouseKeyCodes = newCodes;
                            mouseKeyCodes.forEach((code) => utils_ts_1.setSpecialKeyDown(game, code, true));
                        }
                    }
                }
                break;
            case "move":
                {
                    switch (mouseMode) {
                        case 1 /* Move */:
                            {
                                const newCodes = mouseEventToKeyCodes(engine, game, e);
                                if (!keyCodesEqual(newCodes, mouseKeyCodes)) {
                                    mouseKeyCodes.forEach((code) => utils_ts_1.setSpecialKeyDown(game, code, false));
                                    mouseKeyCodes = newCodes;
                                    mouseKeyCodes.forEach((code) => utils_ts_1.setSpecialKeyDown(game, code, true));
                                }
                            }
                            break;
                    }
                }
                break;
            case "up":
                switch (mouseMode) {
                    case 1 /* Move */:
                        mouseMode = 0 /* None */;
                        mouseKeyCodes.forEach((code) => utils_ts_1.setSpecialKeyDown(game, code, false));
                        mouseKeyCodes.length = 0;
                        break;
                }
        }
    }
    function initGame(engine, assets, native) {
        const { mainUI, statsContainer, buttonsContainer, addButton, itemsButtons } = ui_ts_1.initUI(engine, assets, native);
        const map = new tiles_container_ts_1.ScrollableTilesContainerWidget();
        map.layer = 0 /* Game */;
        map.layout = { heightPercent: 100, widthPercent: 100 };
        map.setChildrenLayout({ type: "none" });
        const scrollable = map;
        const p1 = new avatar_ts_2.Avatar("female1", assets);
        const p2 = new avatar_ts_2.Avatar("female2", assets);
        const npcs = [];
        const avatars = [];
        for (let i = 0; i < NPCS_COUNT; i++) {
            npcs.push(new npc_ts_1.Npc(i % 2 == 0 ? "npc1" : "npc2", assets));
        }
        if (ENABLE_P2) {
            avatars.push(...npcs, p1, p2);
        }
        else {
            avatars.push(...npcs, p1);
        }
        const mapLayers = map_ts_1.default(map, assets);
        avatars.forEach((c) => {
            c.parent = map;
            c.x = random_ts_3.randomIntervalInt(map.tilemapsBounds.width / 2 - 100, map.tilemapsBounds.width / 2 + 100);
            c.y = random_ts_3.randomIntervalInt(map.tilemapsBounds.height / 2 - 100, map.tilemapsBounds.height / 2 + 100);
        });
        const game = {
            statsContainer,
            buttonsContainer,
            scrollable,
            addButton,
            avatars,
            map,
            floorLayer1: mapLayers.floor,
            floorLayer2: mapLayers.floor2,
            npcs,
            p1,
            p2,
            keysDown: new Map(),
            specialKeysDown: new Map(),
        };
        engine.addWidget(map, 0 /* Game */);
        engine.addWidget(mainUI, 1 /* UI */);
        engine.onKeyEvent((e) => onKeyEvent(game, e));
        engine.onMouseEvent((e) => onMouseEvent(engine, game, e));
        itemsButtons.forEach((tile, button) => {
            button.onTapped = () => {
                switchToAddTileMode(tile);
            };
        });
        return game;
    }
    exports_24("initGame", initGame);
    function updateGame(game) {
        const { p1, p2, avatars, map } = game;
        if (utils_ts_1.isKeyDown(game, "a") || utils_ts_1.isSpecialKeyDown(game, 1 /* ArrowLeft */)) {
            p1.move(-1, 0);
        }
        if (utils_ts_1.isKeyDown(game, "d") || utils_ts_1.isSpecialKeyDown(game, 2 /* ArrowRight */)) {
            p1.move(1, 0);
        }
        if (utils_ts_1.isKeyDown(game, "w") || utils_ts_1.isSpecialKeyDown(game, 3 /* ArrowUp */)) {
            p1.move(0, -1);
        }
        if (utils_ts_1.isKeyDown(game, "s") || utils_ts_1.isSpecialKeyDown(game, 4 /* ArrowDown */)) {
            p1.move(0, 1);
        }
        if (utils_ts_1.isKeyDown(game, "f") || utils_ts_1.isKeyDown(game, "z"))
            p1.shoot();
        if (utils_ts_1.isKeyDown(game, "r") || utils_ts_1.isKeyDown(game, "x"))
            p1.slash();
        if (utils_ts_1.isKeyDown(game, "j"))
            p2.move(-1, 0);
        if (utils_ts_1.isKeyDown(game, "l"))
            p2.move(1, 0);
        if (utils_ts_1.isKeyDown(game, "i"))
            p2.move(0, -1);
        if (utils_ts_1.isKeyDown(game, "k"))
            p2.move(0, 1);
        if (utils_ts_1.isKeyDown(game, ";"))
            p2.shoot();
        if (utils_ts_1.isKeyDown(game, "p"))
            p2.slash();
        avatars.forEach((avatar) => {
            avatar.x = Math.max(Math.min(avatar.x, map.tilemapsBounds.width), 0);
            avatar.y = Math.max(Math.min(avatar.y, map.tilemapsBounds.height), 0);
        });
        utils_ts_1.followAvatar(p1, map);
        return true;
    }
    exports_24("updateGame", updateGame);
    return {
        setters: [
            function (types_ts_9_1) {
                types_ts_9 = types_ts_9_1;
            },
            function (avatar_ts_2_1) {
                avatar_ts_2 = avatar_ts_2_1;
            },
            function (map_ts_1_1) {
                map_ts_1 = map_ts_1_1;
            },
            function (random_ts_3_1) {
                random_ts_3 = random_ts_3_1;
            },
            function (npc_ts_1_1) {
                npc_ts_1 = npc_ts_1_1;
            },
            function (utils_ts_1_1) {
                utils_ts_1 = utils_ts_1_1;
            },
            function (ui_ts_1_1) {
                ui_ts_1 = ui_ts_1_1;
            },
            function (tiles_container_ts_1_1) {
                tiles_container_ts_1 = tiles_container_ts_1_1;
            }
        ],
        execute: function () {
            NPCS_COUNT = 10;
            ENABLE_P2 = true;
            mouseMode = 0 /* None */;
            mouseKeyCodes = [];
            mouseModeAddTile = null;
        }
    };
});
System.register("web/src/drawing/types", [], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("web/src/drawing/drawing-real", ["engine/src/types"], function (exports_26, context_26) {
    "use strict";
    var types_ts_10, DrawingRealLayer, DrawingReal;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (types_ts_10_1) {
                types_ts_10 = types_ts_10_1;
            }
        ],
        execute: function () {
            DrawingRealLayer = class DrawingRealLayer {
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
                    return new types_ts_10.Rect(dirtyLeft, dirtyTop, dirtyRight - dirtyLeft, dirtyBottom - dirtyTop);
                }
            };
            DrawingReal = class DrawingReal {
                constructor(width, height, canvasesCtx, drawingDone) {
                    this.layers = [];
                    this.colorsRGB = new Uint32Array(2);
                    this.dirty = false;
                    this.dirtyTime = 0;
                    this.drawingDone = drawingDone;
                    for (let i = 0; i < types_ts_10.LAYERS_COUNT; i++) {
                        this.layers.push(new DrawingRealLayer(width, height));
                    }
                    this.targetLayer = this.layers[0];
                    this.canvasesCtx = canvasesCtx;
                }
                setSize(width, height) {
                    for (let i = 0; i < this.layers.length; i++) {
                        this.layers[i].setSize(width, height);
                    }
                }
                setLayer(layer) {
                    this.targetLayer = this.layers[layer];
                }
                setDirty(x, y, width, height) {
                    if (!this.dirty) {
                        this.dirty = true;
                        this.dirtyTime = performance.now();
                    }
                    this.targetLayer.setDirty(x, y, width, height);
                }
                tintTile(t, foreColor, backColor, x, y, cfx, cfy, ctx, cty) {
                    this.setDirty(x, y, t.width, t.height);
                    const colorsRGB = this.colorsRGB;
                    const imageDataPixels32 = this.targetLayer.imageDataPixels32;
                    const screenWidth = this.targetLayer.pixelsWidth;
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
                dispatch() {
                    const dirtyParams = [];
                    let drawnPixels = 0;
                    for (let i = 0; i < this.layers.length; i++) {
                        const layer = this.layers[i];
                        const canvas = i < this.canvasesCtx.length ? this.canvasesCtx[i] : null;
                        if (layer.dirty) {
                            const dirtyRect = layer.getDirtyRect();
                            if (canvas) {
                                canvas.putImageData(new ImageData(new Uint8ClampedArray(layer.pixels), layer.pixelsWidth, layer.pixelsHeight), 0, 0, dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
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
                readyForNextFrame() {
                    return true;
                }
                processPendingFrames() { }
                preloadTiles(tiles) { }
            };
            exports_26("DrawingReal", DrawingReal);
        }
    };
});
System.register("web/src/drawing/worker/types", [], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("web/src/drawing/drawing-worker", [], function (exports_28, context_28) {
    "use strict";
    var DrawingWorker;
    var __moduleName = context_28 && context_28.id;
    return {
        setters: [],
        execute: function () {
            DrawingWorker = class DrawingWorker {
                constructor(width, height, drawingDone, offscreenCanvases, canvasesCtx) {
                    this.ready = false;
                    this.drawQueueLen = 0;
                    this.tileMappings = new Map();
                    this.nextTileId = 0;
                    this.pendingDoneResults = [];
                    this.pendingFrames = 0;
                    this.worker = new Worker("./worker.js", { type: "module" });
                    this.worker.onmessage = (e) => this.onMessage(e.data);
                    this.drawingDone = drawingDone;
                    this.pixelsWidth = width;
                    this.pixelsHeight = height;
                    this.drawQueue = new ArrayBuffer(1024 * 1024);
                    this.drawQueue32 = new Int32Array(this.drawQueue);
                    this.drawQueueLen = 0;
                    this.offscreenCanvases = offscreenCanvases;
                    this.canvasesCtx = canvasesCtx;
                }
                enqueueOptimizedCommand(cmd, ...args) {
                    while (this.drawQueueLen + 2 + args.length >=
                        this.drawQueue32.length) {
                        const copy = new ArrayBuffer(this.drawQueue.byteLength * 2);
                        const copy32 = new Int32Array(copy);
                        copy32.set(this.drawQueue32);
                        this.drawQueue = copy;
                        this.drawQueue32 = copy32;
                    }
                    this.drawQueue32[this.drawQueueLen++] = cmd;
                    this.drawQueue32[this.drawQueueLen++] = args.length;
                    for (let i = 0; i < args.length; i++) {
                        this.drawQueue32[this.drawQueueLen++] = args[i];
                    }
                }
                getTileId(tile) {
                    const tileId = this.tileMappings.get(tile);
                    if (tileId !== undefined)
                        return tileId;
                    const id = this.nextTileId++;
                    this.tileMappings.set(tile, id);
                    this.enqueueOptimizedCommand(6 /* AddTile */, id, tile.width, tile.height, tile.alphaType, tile.pixels32.length, ...tile.pixels32);
                    return id;
                }
                isReady() {
                    return this.ready;
                }
                onMessage(response) {
                    switch (response.type) {
                        case "ready":
                            this.ready = true;
                            this.dispatchInit();
                            this.dispatch();
                            break;
                        case "result":
                            this.pendingFrames--;
                            this.pendingDoneResults.push(response.result);
                            break;
                    }
                }
                setSize(width, height) {
                    if (width === this.pixelsWidth && height === this.pixelsHeight)
                        return;
                    this.pixelsWidth = width;
                    this.pixelsHeight = height;
                    if (this.ready)
                        this.resetQueues();
                    this.enqueueOptimizedCommand(4 /* SetSize */, width, height);
                }
                setLayer(layer) {
                    this.enqueueOptimizedCommand(5 /* SetLayer */, layer);
                }
                tintTile(t, foreColor, backColor, x, y, cfx, cfy, ctx, cty) {
                    this.enqueueOptimizedCommand(1 /* TintTile */, this.getTileId(t), foreColor, backColor, x, y, cfx, cfy, ctx, cty);
                }
                setTile(t, x, y, cfx, cfy, ctx, cty) {
                    this.enqueueOptimizedCommand(0 /* SetTile */, this.getTileId(t), x, y, cfx, cfy, ctx, cty);
                }
                fillRect(color, x, y, width, height) {
                    this.enqueueOptimizedCommand(2 /* FillRect */, color, x, y, width, height);
                }
                scrollRect(x, y, width, height, dx, dy) {
                    this.enqueueOptimizedCommand(3 /* ScrollRect */, x, y, width, height, dx, dy);
                }
                dispatch() {
                    if (!this.ready)
                        return;
                    if (this.drawQueueLen === 0)
                        return;
                    const copy = new ArrayBuffer(this.drawQueueLen * 4);
                    const copy32 = new Int32Array(copy);
                    copy32.set(this.drawQueue32.slice(0, this.drawQueueLen));
                    const batch = {
                        type: "batch",
                        commands: copy,
                        commandsLen: this.drawQueueLen,
                    };
                    this.worker.postMessage(batch, [copy]);
                    this.resetQueues();
                    this.pendingFrames++;
                }
                resetQueues() {
                    this.drawQueueLen = 0;
                }
                readyForNextFrame(maxPendingFrames) {
                    return this.ready && this.pendingFrames <= maxPendingFrames &&
                        this.pendingDoneResults.length <= maxPendingFrames;
                }
                processPendingFrames() {
                    if (this.pendingDoneResults.length > 0) {
                        const result = this.pendingDoneResults.shift();
                        for (let i = result.dirtyParams.length - 1; i >= 0; i--) {
                            const params = result.dirtyParams[i];
                            if (params.pixelsWidth === this.pixelsWidth ||
                                params.pixelsHeight === this.pixelsHeight) {
                                if (params.layer < this.canvasesCtx.length) {
                                    this.canvasesCtx[params.layer].putImageData(new ImageData(new Uint8ClampedArray(params.pixels), params.pixelsWidth, params.pixelsHeight), 0, 0, params.dirtyRect.x, params.dirtyRect.y, params.dirtyRect.width, params.dirtyRect.height);
                                }
                            }
                            else {
                                result.dirtyParams.splice(i, 1);
                            }
                        }
                        this.drawingDone(result);
                    }
                }
                dispatchInit() {
                    const init = {
                        type: "init",
                        width: this.pixelsWidth,
                        height: this.pixelsHeight,
                        canvases: this.offscreenCanvases,
                    };
                    this.worker.postMessage(init, this.offscreenCanvases);
                }
                preloadTiles(tiles) {
                    for (let i = 0; i < tiles.length; i++) {
                        this.getTileId(tiles[i]);
                    }
                    this.dispatch();
                }
            };
            exports_28("DrawingWorker", DrawingWorker);
        }
    };
});
System.register("web/src/native", ["engine/src/types", "web/src/drawing/drawing-real", "web/src/drawing/drawing-worker"], function (exports_29, context_29) {
    "use strict";
    var types_ts_11, drawing_real_ts_1, drawing_worker_ts_1, USE_DEVICE_PIXEL_RATIO, USE_WORKER, USE_OFFLINE_CANVASES;
    var __moduleName = context_29 && context_29.id;
    function getCanvasSize() {
        return new types_ts_11.Size(window.innerWidth, window.innerHeight);
    }
    function updateCanvasSize(canvas, width, height, zIndex, isOffscreen) {
        const devicePixelRatio = USE_DEVICE_PIXEL_RATIO
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1;
        if (!isOffscreen) {
            canvas.width = width * devicePixelRatio;
            canvas.height = height * devicePixelRatio;
        }
        if (USE_DEVICE_PIXEL_RATIO) {
            canvas.setAttribute("style", `width: ${width}px;height: ${height}px;image-rendering: pixelated;position: absolute; left: 0; top: 0; z-index:${zIndex};`);
        }
        else {
            canvas.setAttribute("style", `position: absolute; left: 0; top: 0; z-index:${zIndex};`);
        }
        return devicePixelRatio;
    }
    function createFullScreenCanvas(zIndex) {
        const canvas = document.createElement("canvas");
        const { width, height } = getCanvasSize();
        const multiplier = updateCanvasSize(canvas, width, height, zIndex, false);
        document.body.appendChild(canvas);
        return { canvas, multiplier };
    }
    function initLayers() {
        const tmpGameCanvas = createFullScreenCanvas(0);
        const tmpUICanvas = createFullScreenCanvas(1);
        const gameCanvas = tmpGameCanvas.canvas;
        const uiCanvas = tmpUICanvas.canvas;
        const layers = [gameCanvas, uiCanvas];
        const useOffscreenCanvas = USE_WORKER && USE_OFFLINE_CANVASES &&
            !!gameCanvas.transferControlToOffscreen;
        return {
            layers,
            multiplier: tmpGameCanvas.multiplier,
            useOffscreenCanvas,
        };
    }
    function getWebNativeContext(onStats) {
        const initCanvasResult = initLayers();
        const useOffscreenCanvas = initCanvasResult.useOffscreenCanvas;
        const layers = initCanvasResult.layers;
        let screenMultiplier = initCanvasResult.multiplier;
        const screenSize = new types_ts_11.Size(256, 256);
        const screenSizeChangedListeners = [];
        const keyListeners = [];
        const mouseListeners = [];
        const focusListeners = [];
        const fullScreenListeners = [];
        const disptachKeyEvent = (e) => {
            keyListeners.forEach((l) => l(e));
        };
        const dispatchMouseEvent = (e) => {
            mouseListeners.forEach((l) => l(e));
        };
        const dispatchFocusEvent = (focus) => {
            focusListeners.forEach((l) => l(focus));
        };
        const dispatchFullScreenEvent = (fullscreen) => {
            fullScreenListeners.forEach((l) => l(fullscreen));
        };
        const handleKey = (e, type) => {
            const key = e.key;
            switch (key) {
                case "ArrowLeft":
                    disptachKeyEvent({ type, code: 1 /* ArrowLeft */ });
                    break;
                case "ArrowRight":
                    disptachKeyEvent({ type, code: 2 /* ArrowRight */ });
                    break;
                case "ArrowUp":
                    disptachKeyEvent({ type, code: 3 /* ArrowUp */ });
                    break;
                case "ArrowDown":
                    disptachKeyEvent({ type, code: 4 /* ArrowDown */ });
                    break;
                default:
                    if (key.length === 1) {
                        disptachKeyEvent({ type, char: key });
                    }
                    break;
            }
        };
        var mouseDown = false;
        const handleMouseDown = (e) => {
            mouseDown = true;
            dispatchMouseEvent({
                type: "down",
                x: Math.trunc(e.clientX * screenMultiplier),
                y: Math.trunc(e.clientY * screenMultiplier),
            });
        };
        const handleMouseMove = (e) => {
            if (!mouseDown)
                return;
            dispatchMouseEvent({
                type: "move",
                x: Math.trunc(e.clientX * screenMultiplier),
                y: Math.trunc(e.clientY * screenMultiplier),
            });
        };
        const handleMouseUp = (e) => {
            if (!mouseDown)
                return;
            dispatchMouseEvent({
                type: "up",
                x: Math.trunc(e.clientX * screenMultiplier),
                y: Math.trunc(e.clientY * screenMultiplier),
            });
            mouseDown = false;
        };
        const handleResize = () => {
            screenSize.copyFrom(getCanvasSize());
            for (let i = 0; i < layers.length; i++) {
                updateCanvasSize(layers[i], screenSize.width, screenSize.height, i, useOffscreenCanvas);
            }
            drawing.setSize(screenSize.width, screenSize.height);
            screenSizeChangedListeners.forEach((l) => l(screenSize));
        };
        const handleVisibilityChange = () => {
            const focus = document.visibilityState === "visible";
            dispatchFocusEvent(focus);
        };
        const handleFullScreenChange = () => {
            const fullscreen = !!document.fullscreenElement;
            dispatchFullScreenEvent(fullscreen);
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        window.addEventListener("keydown", (e) => handleKey(e, "down"));
        window.addEventListener("keyup", (e) => handleKey(e, "up"));
        window.addEventListener("keypress", (e) => handleKey(e, "press"));
        if (window.PointerEvent) {
            window.addEventListener("pointerdown", handleMouseDown);
            window.addEventListener("pointerup", handleMouseUp);
            window.addEventListener("pointermove", handleMouseMove);
        }
        else {
            window.addEventListener("mousedown", handleMouseDown);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("mousemove", handleMouseMove);
        }
        window.addEventListener("resize", handleResize);
        const drawingDone = (result) => {
            onStats(result.stats);
        };
        screenSize.copyFrom(getCanvasSize());
        console.log("Using offscreen canvases: " + useOffscreenCanvas);
        const drawing = USE_WORKER
            ? new drawing_worker_ts_1.DrawingWorker(screenSize.width, screenSize.height, drawingDone, useOffscreenCanvas
                ? layers.map((c) => c.transferControlToOffscreen())
                : [], useOffscreenCanvas ? [] : layers.map((c, index) => c.getContext("2d", index === 0 ? { alpha: false } : {})))
            : new drawing_real_ts_1.DrawingReal(screenSize.width, screenSize.height, layers.map((c, index) => c.getContext("2d", index === 0 ? { alpha: false } : {})), drawingDone);
        return {
            screen: {
                getScreenSize: () => screenSize,
                onScreenSizeChanged: (listener) => {
                    screenSizeChangedListeners.push(listener);
                },
                onFullScreenChanged: (listener) => {
                    fullScreenListeners.push(listener);
                },
                setFullscreen: (fullscreen) => {
                    const elem = document.documentElement;
                    if (fullscreen) {
                        elem.requestFullscreen();
                    }
                    else {
                        document.exitFullscreen();
                    }
                },
                toggleStats: () => {
                    // deno-lint-ignore no-explicit-any
                    if (globalThis.statsPaused) {
                        // deno-lint-ignore no-explicit-any
                        globalThis.resumeStats();
                    }
                    else {
                        // deno-lint-ignore no-explicit-any
                        globalThis.pauseStats();
                    }
                },
                preloadTiles: drawing.preloadTiles.bind(drawing),
                readyForNextFrame: drawing.readyForNextFrame.bind(drawing),
                processPendingFrames: drawing.processPendingFrames.bind(drawing),
                setTargetLayer: drawing.setLayer.bind(drawing),
                tintTile: drawing.tintTile.bind(drawing),
                setTile: drawing.setTile.bind(drawing),
                fillRect: drawing.fillRect.bind(drawing),
                scrollRect: drawing.scrollRect.bind(drawing),
                beginDraw: () => { },
                endDraw: () => {
                    drawing.dispatch();
                },
            },
            input: {
                onKeyEvent: (listener) => {
                    keyListeners.push(listener);
                },
                onMouseEvent: (listener) => {
                    mouseListeners.push(listener);
                },
            },
            focus: {
                onFocusChanged: (listener) => {
                    focusListeners.push(listener);
                },
            },
            init: async () => { },
            destroy: () => { },
        };
    }
    exports_29("getWebNativeContext", getWebNativeContext);
    return {
        setters: [
            function (types_ts_11_1) {
                types_ts_11 = types_ts_11_1;
            },
            function (drawing_real_ts_1_1) {
                drawing_real_ts_1 = drawing_real_ts_1_1;
            },
            function (drawing_worker_ts_1_1) {
                drawing_worker_ts_1 = drawing_worker_ts_1_1;
            }
        ],
        execute: function () {
            USE_DEVICE_PIXEL_RATIO = false;
            USE_WORKER = true;
            USE_OFFLINE_CANVASES = true;
        }
    };
});
System.register("web/src/assets", ["engine/src/types"], function (exports_30, context_30) {
    "use strict";
    var types_ts_12;
    var __moduleName = context_30 && context_30.id;
    async function loadImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = "res/" + src;
        });
    }
    async function loadTilemap(id, json, type) {
        const image = await loadImage(json.filename);
        const tileWidth = parseInt(json.size.split("x")[0]);
        const tileHeight = parseInt(json.size.split("x")[1]);
        const imageWidthInTiles = image.width / tileWidth;
        const imageHeightInTiles = image.height / tileHeight;
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const tiles = [];
        const tilesById = new Map();
        const tilemap = {
            id,
            tileWidth,
            tileHeight,
            tiles,
            tilesById,
            type,
            widthInTiles: imageWidthInTiles,
            heightInTiles: imageHeightInTiles,
            getTile: (id) => tilesById.get(id),
            getTileByXY: (x, y) => tiles[y * imageWidthInTiles + x],
            getTileIndexByXY: (x, y) => y * imageWidthInTiles + x,
            getTileXYByIndex: (index) => new types_ts_12.Point(index % imageWidthInTiles, Math.trunc(index / imageWidthInTiles)),
        };
        const setTileId = (index, id) => {
            tiles[index].id = id;
            tilesById.set(id, tiles[index]);
        };
        let index = 0;
        for (let y = 0; y < imageHeightInTiles; y++) {
            for (let x = 0; x < imageWidthInTiles; x++) {
                const pixels = ctx.getImageData(x * tileWidth, y * tileHeight, tileWidth, tileHeight).data;
                const pixels32 = new Uint32Array(pixels.buffer);
                const hasAlpha = pixels32.some((x) => ((x >> 24) & 0xff) != 255);
                const hasAlphaSolid = pixels32.every((x) => ((x >> 24) & 0xff) == 255 || ((x >> 24) & 0xff) == 0);
                if (type === "blackandwhite") {
                    for (let i = 0; i < pixels32.length; i++) {
                        pixels32[i] = (pixels32[i] & 0xffffff) === 0 ? 0 : 1;
                    }
                }
                const tile = {
                    id: "",
                    height: tileHeight,
                    width: tileWidth,
                    index,
                    pixels,
                    pixels32,
                    tilemap,
                    alphaType: hasAlpha
                        ? hasAlphaSolid ? 1 /* Solid */ : 2 /* Alpha */
                        : 0 /* None */,
                };
                tiles.push(tile);
                index++;
            }
        }
        if (json.tiles) {
            for (const tileId in json.tiles) {
                const tileJson = json.tiles[tileId];
                const index = tileJson.index !== undefined
                    ? tileJson.index
                    : tilemap.getTileIndexByXY(tileJson.x || 0, tileJson.y || 0);
                setTileId(index, tileId);
            }
        }
        return tilemap;
    }
    function loadTerrain(terrainId, terrainJson, tilemap) {
        const tiles = tilemap.tiles;
        const tilesById = tilemap.tilesById;
        const setTileId = (index, id) => {
            tiles[index].id = id;
            tilesById.set(id, tiles[index]);
        };
        const imageWidthInTiles = tilemap.widthInTiles;
        // Each terrain has this shape:
        //
        // +-----------+-----------+-----------+
        // |           |           |           |
        // |   deco1   |  hole-br  |  hole-bl  |
        // |           |          /|\          |
        // +-----------+-----------+-----------+
        // |           |          \|/          |
        // |   deco2   |  hole-tr  |  hole-tl  |
        // |           |           |           |
        // +-----------+-----------+-----------+
        // |           |           |           |
        // |  top-left |    top    | top-right |
        // |         /-|-----------|-\         |
        // +-----------+-----------+-----------+
        // |         | |           | |         |
        // |   left  | |  center   | |  right  |
        // |         | |           | |         |
        // +-----------+-----------+-----------+
        // |         \-|-----------|-/         |
        // |  bottom-  |   bottom  |  bottom-  |
        // |   left    |           |   right   |
        // +-----------+-----------+-----------+
        // |           |           |           |
        // |  center2  |  center3  |  center4  |
        // |           |           |           |
        // +-----------+-----------+-----------+
        const index = terrainJson.index !== undefined
            ? terrainJson.index
            : tilemap.getTileIndexByXY(terrainJson.x || 0, terrainJson.y || 0);
        const { x, y } = tilemap.getTileXYByIndex(index);
        const getTileIndex = (dx, dy) => {
            return tilemap.getTileIndexByXY(x + dx, y + dy);
        };
        const deco1 = getTileIndex(0, 0);
        const deco2 = getTileIndex(0, 1);
        setTileId(deco1, terrainId + "-deco1");
        setTileId(deco2, terrainId + "-deco2");
        const hole_br = getTileIndex(1, 0);
        const hole_bl = getTileIndex(2, 0);
        const hole_tr = getTileIndex(1, 1);
        const hole_tl = getTileIndex(2, 1);
        setTileId(hole_br, terrainId + "-hole-br");
        setTileId(hole_bl, terrainId + "-hole-bl");
        setTileId(hole_tr, terrainId + "-hole-tr");
        setTileId(hole_tl, terrainId + "-hole-tl");
        const topLeft = getTileIndex(0, 2);
        const top = getTileIndex(1, 2);
        const topRight = getTileIndex(2, 2);
        const left = getTileIndex(0, 3);
        const center = getTileIndex(1, 3);
        const right = getTileIndex(2, 3);
        const bottomLeft = getTileIndex(0, 4);
        const bottom = getTileIndex(1, 4);
        const bottomRight = getTileIndex(2, 4);
        setTileId(topLeft, terrainId + "-top-left");
        setTileId(top, terrainId + "-top");
        setTileId(topRight, terrainId + "-top-right");
        setTileId(left, terrainId + "-left");
        setTileId(center, terrainId + "-center");
        setTileId(right, terrainId + "-right");
        setTileId(bottomLeft, terrainId + "-bottom-left");
        setTileId(bottom, terrainId + "-bottom");
        setTileId(bottomRight, terrainId + "-bottom-left");
        const center2 = getTileIndex(0, 5);
        const center3 = getTileIndex(1, 5);
        const center4 = getTileIndex(2, 5);
        setTileId(center2, terrainId + "-center2");
        setTileId(center3, terrainId + "-center3");
        setTileId(center4, terrainId + "-center4");
    }
    function loadAvatar(avatarId, avatarJson, tilemap, animations) {
        const addAnimation = (id, y, fromX, toX, loops = true, delayInUpdates = 3) => {
            const tiles = [];
            for (let x = fromX; x <= toX; x++) {
                tiles.push(tilemap.getTileByXY(x, y));
            }
            const animation = {
                id,
                tiles,
                delayInUpdates: delayInUpdates | 0,
                loops,
            };
            animations.set(id, animation);
        };
        addAnimation(avatarId + "-up", 8, 0, 0);
        addAnimation(avatarId + "-left", 9, 0, 0);
        addAnimation(avatarId + "-down", 10, 0, 0);
        addAnimation(avatarId + "-right", 11, 0, 0);
        addAnimation(avatarId + "-up-walking", 8, 1, 8);
        addAnimation(avatarId + "-left-walking", 9, 1, 8);
        addAnimation(avatarId + "-down-walking", 10, 1, 8);
        addAnimation(avatarId + "-right-walking", 11, 1, 8);
        addAnimation(avatarId + "-up-cast", 0, 0, 6, false);
        addAnimation(avatarId + "-left-cast", 1, 0, 6, false);
        addAnimation(avatarId + "-down-cast", 2, 0, 6, false);
        addAnimation(avatarId + "-right-cast", 3, 0, 6, false);
        addAnimation(avatarId + "-up-thrust", 4, 0, 7, false);
        addAnimation(avatarId + "-left-thrust", 5, 0, 7, false);
        addAnimation(avatarId + "-down-thrust", 6, 0, 7, false);
        addAnimation(avatarId + "-right-thrust", 7, 0, 7, false);
        addAnimation(avatarId + "-up-slash", 12, 0, 5, false);
        addAnimation(avatarId + "-left-slash", 13, 0, 5, false);
        addAnimation(avatarId + "-down-slash", 14, 0, 5, false);
        addAnimation(avatarId + "-right-slash", 15, 0, 5, false);
        addAnimation(avatarId + "-up-shoot", 16, 0, 12, false, 75);
        addAnimation(avatarId + "-left-shoot", 17, 0, 12, false, 75);
        addAnimation(avatarId + "-down-shoot", 18, 0, 12, false, 75);
        addAnimation(avatarId + "-right-shoot", 19, 0, 12, false, 75);
        addAnimation(avatarId + "-up-hurt", 20, 0, 5, false);
        addAnimation(avatarId + "-left-hurt", 20, 0, 5, false);
        addAnimation(avatarId + "-down-hurt", 20, 0, 5, false);
        addAnimation(avatarId + "-right-hurt", 20, 0, 5, false);
    }
    function loadAnimation(id, json, tilemaps) {
        const delayInUpdates = json.fps > 0 ? Math.ceil(types_ts_12.UPDATE_FPS / json.fps) : 0;
        const tiles = [];
        if (json.frames) {
            tiles.push(...json.frames.map((f) => tilemaps.get(json.tilemap).tiles[f]));
        }
        if (json.framesRange) {
            const from = json.framesRange[0];
            const to = json.framesRange[1];
            for (let i = from; i <= to; i++) {
                tiles.push(tilemaps.get(json.tilemap).tiles[i]);
            }
        }
        return {
            id,
            delayInUpdates,
            tiles,
            loops: !!json.loops,
        };
    }
    async function initAssets() {
        const fonts = new Map();
        const animations = new Map();
        const tilemaps = new Map();
        const assetsJsonTxt = await (await fetch("res/assets.json")).text();
        const assetsJson = JSON.parse(assetsJsonTxt);
        for (const tilemapId in assetsJson.tilemaps) {
            const tilemapJson = assetsJson.tilemaps[tilemapId];
            const tilemap = await loadTilemap(tilemapId, tilemapJson, "color");
            tilemaps.set(tilemapId, tilemap);
        }
        for (const fontId in assetsJson.fonts) {
            const tilemapJson = assetsJson.fonts[fontId];
            const font = await loadTilemap(fontId, tilemapJson, "blackandwhite");
            fonts.set(fontId, font);
        }
        for (const animationId in assetsJson.animations) {
            const animationJson = assetsJson.animations[animationId];
            const animation = loadAnimation(animationId, animationJson, tilemaps);
            animations.set(animationId, animation);
        }
        const terrainTilemap = await loadTilemap("terrain", assetsJson.terrains, "color");
        tilemaps.set("terrain", terrainTilemap);
        for (const terrainId in assetsJson.terrains.terrains) {
            const terrainJson = assetsJson.terrains.terrains[terrainId];
            loadTerrain(terrainId, terrainJson, terrainTilemap);
        }
        for (const avatarId in assetsJson.avatars) {
            const avatarJson = assetsJson.avatars[avatarId];
            const tilemap = await loadTilemap(avatarId, avatarJson, "color");
            tilemaps.set(avatarId, tilemap);
            loadAvatar(avatarId, avatarJson, tilemap, animations);
        }
        const assets = {
            fonts,
            animations,
            tilemaps,
            defaultFont: fonts.get(assetsJson.defaultFont),
            getAnimation: (id) => animations.get(id),
            getFont: (id) => fonts.get(id),
            getTilemap: (id) => tilemaps.get(id),
            getTile: (tilemapDotTile) => tilemaps.get(tilemapDotTile.split(".")[0]).getTile(tilemapDotTile.split(".")[1]),
        };
        return assets;
    }
    exports_30("initAssets", initAssets);
    return {
        setters: [
            function (types_ts_12_1) {
                types_ts_12 = types_ts_12_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("web/src/stats", [], function (exports_31, context_31) {
    "use strict";
    var Stat, EngineStats;
    var __moduleName = context_31 && context_31.id;
    return {
        setters: [],
        execute: function () {
            Stat = class Stat {
                constructor(name) {
                    this.name = "";
                    this.samples = 0;
                    this.time = 0;
                    this.allSamples = 0;
                    this.name = name;
                }
                addSample(t) {
                    this.time += t;
                    this.samples++;
                    this.allSamples++;
                }
                reset() {
                    this.time = 0;
                    this.samples = 0;
                }
                get averageTime() {
                    return this.samples > 0 ? this.time / this.samples : 0;
                }
                toString() {
                    return this.name + "[" + this.samples + "]: " + this.averageTime.toFixed(1);
                }
            };
            EngineStats = class EngineStats {
                constructor() {
                    this.render = new Stat("Ren");
                    this.renderNative = new Stat("RenN");
                    this.update = new Stat("Upd");
                }
                reset() {
                    this.render.reset();
                    this.renderNative.reset();
                    this.update.reset();
                }
            };
            exports_31("EngineStats", EngineStats);
        }
    };
});
System.register("web/src/main", ["engine/src/types", "engine/src/engine", "engine/src/widgets/ui/label", "game/src/game", "web/src/native", "web/src/assets", "web/src/stats"], function (exports_32, context_32) {
    "use strict";
    var types_ts_13, engine_ts_1, label_ts_1, game_ts_1, native_ts_1, assets_ts_1, stats_ts_1, MAX_PENDING_FRAMES, engine, nativeContext, statsLabel, game, focused, updateStatsFrames, updateStatsTime, engineStats, ignoreUpdate, lastUpdateTime;
    var __moduleName = context_32 && context_32.id;
    function updateStats() {
        const now = performance.now();
        updateStatsFrames++;
        if (now - updateStatsTime > 1000) {
            const deltaTime = now - updateStatsTime;
            const fps = updateStatsFrames / (deltaTime / 1000);
            let stats = `FPS: ${fps.toFixed(1)}`;
            stats += "\n" + engineStats.update.toString();
            stats += "\n" + engineStats.render.toString();
            stats += "\n" + engineStats.renderNative.toString();
            const busyTime = engineStats.render.time + engineStats.update.time;
            const idleTime = deltaTime - busyTime;
            const idlePercent = idleTime * 100 / deltaTime;
            stats += `\nIdle: ${idlePercent.toFixed(1)}%`;
            statsLabel.text = stats;
            updateStatsTime = now;
            engineStats.reset();
            updateStatsFrames = 0;
        }
    }
    async function waitNoPendingFrames() {
        while (!nativeContext.screen.readyForNextFrame(0)) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            nativeContext.screen.processPendingFrames();
        }
    }
    async function init() {
        console.log("Initializing Engine");
        const assets = await assets_ts_1.initAssets();
        nativeContext = native_ts_1.getWebNativeContext((stats) => {
            if (stats.drawnPixels > 0) {
                engineStats.renderNative.addSample(stats.time);
            }
        });
        nativeContext.focus.onFocusChanged((focus) => {
            if (focus)
                ignoreUpdate = true;
            focused = focus;
        });
        engine = await engine_ts_1.buildEngine(nativeContext);
        console.log("Engine Initialized");
        game = game_ts_1.initGame(engine, assets, nativeContext);
        console.log("Game Initialized");
        statsLabel = new label_ts_1.LabelWidget(assets.defaultFont, "", types_ts_13.FixedColor.White, game.statsContainer.backColor);
        statsLabel.parent = game.statsContainer;
        //Wait engine ready
        await waitNoPendingFrames();
        //Preload tiles
        for (const tilemap of assets.tilemaps.values()) {
            nativeContext.screen.preloadTiles(tilemap.tiles);
            await waitNoPendingFrames();
        }
        return engine;
    }
    function updateReal() {
        const preUpdateTime = performance.now();
        game_ts_1.updateGame(game);
        engine.update();
        const postUpdateTime = performance.now();
        engineStats.update.addSample(postUpdateTime - preUpdateTime);
    }
    function drawReal() {
        const drawStats = engine.draw();
        if (drawStats.rects > 0) {
            engineStats.render.addSample(drawStats.time);
        }
    }
    function update() {
        if (!focused)
            return;
        nativeContext.screen.processPendingFrames();
        updateStats();
        const now = performance.now();
        if (ignoreUpdate) {
            ignoreUpdate = false;
            lastUpdateTime = now;
            return;
        }
        const delta = now - lastUpdateTime;
        const targetDeltaUpdate = 1000 / types_ts_13.UPDATE_FPS;
        if (delta > targetDeltaUpdate - 0.1) {
            lastUpdateTime = Math.max(lastUpdateTime + targetDeltaUpdate, now - 1000);
            updateReal();
        }
        if (nativeContext.screen.readyForNextFrame(MAX_PENDING_FRAMES)) {
            drawReal();
        }
    }
    function hideLoader() {
        const loader = document.getElementById("loader");
        if (loader)
            document.body.removeChild(loader);
    }
    async function run() {
        const engine = await init();
        updateReal();
        drawReal();
        while (!nativeContext.screen.readyForNextFrame(0)) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            nativeContext.screen.processPendingFrames();
        }
        lastUpdateTime = performance.now();
        hideLoader();
        function onRequestAnimationFrame() {
            update();
            requestAnimationFrame(onRequestAnimationFrame);
        }
        onRequestAnimationFrame();
        return engine;
    }
    return {
        setters: [
            function (types_ts_13_1) {
                types_ts_13 = types_ts_13_1;
            },
            function (engine_ts_1_1) {
                engine_ts_1 = engine_ts_1_1;
            },
            function (label_ts_1_1) {
                label_ts_1 = label_ts_1_1;
            },
            function (game_ts_1_1) {
                game_ts_1 = game_ts_1_1;
            },
            function (native_ts_1_1) {
                native_ts_1 = native_ts_1_1;
            },
            function (assets_ts_1_1) {
                assets_ts_1 = assets_ts_1_1;
            },
            function (stats_ts_1_1) {
                stats_ts_1 = stats_ts_1_1;
            }
        ],
        execute: function () {
            MAX_PENDING_FRAMES = 1;
            focused = true;
            updateStatsFrames = 0;
            updateStatsTime = performance.now();
            engineStats = new stats_ts_1.EngineStats();
            ignoreUpdate = true;
            lastUpdateTime = 0;
            run();
        }
    };
});

__instantiate("web/src/main");
