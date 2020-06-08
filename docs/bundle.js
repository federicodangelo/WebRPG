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

System.register("engine/src/types", [], function (exports_1, context_1) {
  "use strict";
  var FixedColor, Point, Size, Rect;
  var __moduleName = context_1 && context_1.id;
  function rgb(r, g, b) {
    return rgba(r, g, b, 255);
  }
  exports_1("rgb", rgb);
  function rgba(r, g, b, a) {
    return ((a << 24) | // alpha
      (b << 16) | // blue
      (g << 8) | // green
      r);
  }
  exports_1("rgba", rgba);
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
      exports_1("FixedColor", FixedColor);
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
      };
      exports_1("Point", Point);
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
      exports_1("Size", Size);
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
        minDistanceTo(rect) {
          return Math.min();
        }
        clone() {
          return new Rect(this.x, this.y, this.width, this.height);
        }
      };
      exports_1("Rect", Rect);
    },
  };
});
System.register("engine/src/native-types", [], function (exports_2, context_2) {
  "use strict";
  var __moduleName = context_2 && context_2.id;
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register(
  "engine/src/context",
  ["engine/src/types"],
  function (exports_3, context_3) {
    "use strict";
    var types_ts_1, useCp437, AnsiSpecialChar, EngineContextImpl;
    var __moduleName = context_3 && context_3.id;
    function ceilToMultipleOf(n, m) {
      if (n % m === 0) {
        return n;
      }
      return Math.ceil(n / m) * m;
    }
    function floorToMultipleOf(n, m) {
      if (n % m === 0) {
        return n;
      }
      return Math.floor(n / m) * m;
    }
    return {
      setters: [
        function (types_ts_1_1) {
          types_ts_1 = types_ts_1_1;
        },
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
          endClip() {}
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
            const maxX = Math.min(
              this.tx + x + width,
              this.clip.x + this.clip.width,
            );
            const maxY = Math.min(
              this.ty + y + height,
              this.clip.y + this.clip.height,
            );
            this.clip.set(minX, minY, maxX - minX, maxY - minY);
          }
          popClip() {
            const p = this.clipStack.pop();
            if (p) {
              this.clip.copyFrom(p);
            }
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
            if (
              screenX + width > clip.x &&
              screenX < clip.x1 &&
              screenY + height > clip.y &&
              screenY < clip.y1
            ) {
              const fontTile = font.tiles[code];
              const cfx = Math.max(clip.x - screenX, 0);
              const cfy = Math.max(clip.y - screenY, 0);
              const ctx = Math.min(clip.x1 - screenX, width);
              const cty = Math.min(clip.y1 - screenY, height);
              this.nativeContext.tintTile(
                fontTile,
                this.foreColor,
                this.backColor,
                screenX,
                screenY,
                cfx,
                cfy,
                ctx,
                cty,
              );
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
            if (x0 !== x && x0 !== x + width && y0 !== y && y0 !== y + height) {
              return this;
            }
            const fontWidth = font.tileWidth;
            const fontHeight = font.tileHeight;
            this.moveCursorTo(x, y);
            this.specialChar(font, 10 /* CornerTopLeft */);
            this.specialCharTimes(
              font,
              9, /* Horizontal */
              width / fontWidth - 2,
            );
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
            this.specialCharTimes(
              font,
              9, /* Horizontal */
              width / fontWidth - 2,
            );
            this.moveCursorTo(x + width - fontWidth, y + height - fontHeight);
            this.specialChar(font, 13 /* CornerBottomRight */);
            return this;
          }
          fillChar(font, x, y, width, height, char) {
            if (char.length === 0) {
              return this;
            }
            const fontWidth = font.tileWidth;
            const fontHeight = font.tileHeight;
            const clip = this.clip;
            const tx = this.tx;
            const ty = this.ty;
            const x0 = Math.max(tx + x, floorToMultipleOf(clip.x, fontWidth));
            const y0 = Math.max(ty + y, floorToMultipleOf(clip.y, fontHeight));
            const x1 = Math.min(
              tx + x + width,
              ceilToMultipleOf(clip.x1, fontWidth),
            );
            const y1 = Math.min(
              ty + y + height,
              ceilToMultipleOf(clip.y1, fontHeight),
            );
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
                this.nativeContext.tintTile(
                  fontTile,
                  this.foreColor,
                  this.backColor,
                  screenX,
                  screenY,
                  cfx,
                  cfy,
                  ctx,
                  cty,
                );
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
            if (
              screenX + width > clip.x &&
              screenX < clip.x1 &&
              screenY + height > clip.y &&
              screenY < clip.y1
            ) {
              const cfx = Math.max(clip.x - screenX, 0);
              const cfy = Math.max(clip.y - screenY, 0);
              const ctx = Math.min(clip.x1 - screenX, width);
              const cty = Math.min(clip.y1 - screenY, height);
              this.nativeContext.setTile(
                t,
                screenX,
                screenY,
                cfx,
                cfy,
                ctx,
                cty,
              );
            }
            return this;
          }
          fillTile(x, y, width, height, t) {
            const clip = this.clip;
            const tx = this.tx;
            const ty = this.ty;
            const x0 = Math.max(tx + x, floorToMultipleOf(clip.x, t.width));
            const y0 = Math.max(ty + y, floorToMultipleOf(clip.y, t.height));
            const x1 = Math.min(
              tx + x + width,
              ceilToMultipleOf(clip.x1, t.width),
            );
            const y1 = Math.min(
              ty + y + height,
              ceilToMultipleOf(clip.y1, t.height),
            );
            if (x1 <= x0 || y1 <= y0) {
              return this;
            }
            for (let screenY = y0; screenY < y1; screenY += t.width) {
              for (let screenX = x0; screenX < x1; screenX += t.height) {
                const cfx = Math.max(clip.x - screenX, 0);
                const cfy = Math.max(clip.y - screenY, 0);
                const ctx = Math.min(clip.x1 - screenX, t.width);
                const cty = Math.min(clip.y1 - screenY, t.height);
                this.nativeContext.setTile(
                  t,
                  screenX,
                  screenY,
                  cfx,
                  cfy,
                  ctx,
                  cty,
                );
              }
            }
            return this;
          }
        };
        exports_3("EngineContextImpl", EngineContextImpl);
      },
    };
  },
);
System.register(
  "engine/src/engine",
  ["engine/src/types", "engine/src/context"],
  function (exports_4, context_4) {
    "use strict";
    var types_ts_2, context_ts_1, EngineImpl;
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
        },
      ],
      execute: function () {
        EngineImpl = class EngineImpl {
          constructor(nativeContext) {
            this.children = [];
            this.screenSize = new types_ts_2.Size();
            this.invalidRects = [];
            this.nativeContext = nativeContext;
            this.context = new context_ts_1.EngineContextImpl(
              this.nativeContext.screen,
            );
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
            this.nativeContext.screen.onScreenSizeChanged(
              this.onScreenSizeChanged.bind(this),
            );
          }
          onScreenSizeChanged(size) {
            if (!size.equals(this.screenSize)) {
              this.screenSize.set(size.width, size.height);
              this.invalidateRect(
                new types_ts_2.Rect(
                  0,
                  0,
                  this.screenSize.width,
                  this.screenSize.height,
                ),
              );
            }
          }
          draw() {
            if (this.invalidRects.length == 0) {
              return;
            }
            var pendingLayout = true;
            const clip = new types_ts_2.Rect();
            const consoleSize = this.screenSize;
            this.context.beginDraw();
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
            this.context.endDraw();
            this.invalidRects.length = 0;
          }
          updateLayout() {
            for (let i = 0; i < this.children.length; i++) {
              this.children[i].updateLayout(
                this.screenSize.width,
                this.screenSize.height,
              );
            }
          }
          update() {}
          addWidget(widget) {
            this.children.push(widget);
            widget.engine = this;
            widget.updateLayout(this.screenSize.width, this.screenSize.height);
            this.invalidateRect(widget.getBoundingBox());
          }
          removeWidget(widget) {
            const ix = this.children.indexOf(widget);
            if (ix >= 0) {
              this.children.splice(ix, 1);
            }
            this.invalidateRect(widget.getBoundingBox());
          }
          onKeyEvent(listener) {
            this.nativeContext.input.onKeyEvent(listener);
          }
          invalidateRect(rect) {
            let lastRect = this.invalidRects.length > 0
              ? this.invalidRects[this.invalidRects.length - 1] : null;
            if (lastRect !== null && lastRect.intersects(rect)) {
              lastRect.union(rect);
              return;
            }
            this.invalidRects.push(rect.clone());
          }
          destroy() {
            this.nativeContext.destroy();
          }
        };
      },
    };
  },
);
System.register(
  "engine/src/widgets/widget",
  ["engine/src/types"],
  function (exports_5, context_5) {
    "use strict";
    var types_ts_3, BaseWidget;
    var __moduleName = context_5 && context_5.id;
    return {
      setters: [
        function (types_ts_3_1) {
          types_ts_3 = types_ts_3_1;
        },
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
            this._parent = null;
            this._engine = null;
            this._boundingBox = new types_ts_3.Rect();
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
          get x() {
            return this._x;
          }
          set x(v) {
            if (v !== this._x) {
              this.invalidate();
              this._x = v;
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
              this._y = v;
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
              this._width = v;
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
              this._height = v;
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
              this._pivotX = v;
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
              this._pivotY = v;
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
          get parent() {
            return this._parent;
          }
          set parent(v) {
            if (v !== this._parent) {
              this.invalidate();
              if (this._parent !== null) {
                const index = this._parent.children.indexOf(this);
                if (index >= 0) {
                  this._parent.children.splice(index, 1);
                }
              }
              this._parent = v;
              if (this._parent !== null) {
                this._parent.children.push(this);
                this.engine = this._parent.engine;
                this._parent.onChildrenAdded(this);
              } else {
                this.engine = null;
              }
              this.invalidate();
            }
          }
          updateLayout(parentWidth, parentHeight) {
            const layout = this.layout;
            if (layout !== null) {
              if (layout.heightPercent !== undefined) {
                this.height = Math.ceil(
                  (parentHeight * layout.heightPercent) / 100,
                );
              }
              if (layout.widthPercent !== undefined) {
                this.width = Math.ceil(
                  (parentWidth * layout.widthPercent) / 100,
                );
              }
              if (layout.customSizeFn !== undefined) {
                layout.customSizeFn(this, parentWidth, parentHeight);
              }
              if (layout.horizontalSpacingPercent !== undefined) {
                this.x = Math.floor(
                  ((parentWidth - this.width) *
                    layout.horizontalSpacingPercent) / 100,
                );
              }
              if (layout.verticalSpacingPercent !== undefined) {
                this.y = Math.floor(
                  ((parentHeight - this.height) *
                    layout.verticalSpacingPercent) / 100,
                );
              }
              if (layout.customPositionFn !== undefined) {
                layout.customPositionFn(this, parentWidth, parentHeight);
              }
            }
          }
          draw(context) {
            if (
              !context.isVisible(
                this.visibleX,
                this.visibleY,
                this.width,
                this.height,
              )
            ) {
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
            this._boundingBox.set(
              this.visibleX,
              this.visibleY,
              this.width,
              this.height,
            );
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
        };
        exports_5("BaseWidget", BaseWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/label",
  ["engine/src/widgets/widget"],
  function (exports_6, context_6) {
    "use strict";
    var widget_ts_1, LabelWidget;
    var __moduleName = context_6 && context_6.id;
    return {
      setters: [
        function (widget_ts_1_1) {
          widget_ts_1 = widget_ts_1_1;
        },
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
          }
          set text(val) {
            if (val !== this._text) {
              this._text = val;
              this._lines = val.split("\n");
              this.width =
                this._lines.map((s) => s.length).reduce(
                  (max, c) => Math.max(max, c),
                  0,
                ) * this.font.tileWidth;
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
              context.moveCursorTo(0, i * this.font.tileHeight).text(
                this.font,
                this._lines[i],
              );
            }
          }
        };
        exports_6("LabelWidget", LabelWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/character",
  ["engine/src/widgets/widget"],
  function (exports_7, context_7) {
    "use strict";
    var widget_ts_2, CharacterWidget;
    var __moduleName = context_7 && context_7.id;
    return {
      setters: [
        function (widget_ts_2_1) {
          widget_ts_2 = widget_ts_2_1;
        },
      ],
      execute: function () {
        CharacterWidget = class CharacterWidget extends widget_ts_2.BaseWidget {
          constructor(font, char, foreColor, backColor) {
            super();
            this.font = font;
            this.char = char;
            this.foreColor = foreColor;
            this.backColor = backColor;
            this.width = font.tileWidth;
            this.height = font.tileHeight;
          }
          drawSelf(context) {
            context.textColor(this.foreColor, this.backColor).text(
              this.font,
              this.char,
            );
          }
        };
        exports_7("CharacterWidget", CharacterWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/widget-container",
  ["engine/src/widgets/widget"],
  function (exports_8, context_8) {
    "use strict";
    var widget_ts_3, BaseWidgetContainer;
    var __moduleName = context_8 && context_8.id;
    return {
      setters: [
        function (widget_ts_3_1) {
          widget_ts_3 = widget_ts_3_1;
        },
      ],
      execute: function () {
        BaseWidgetContainer = class BaseWidgetContainer
          extends widget_ts_3.BaseWidget {
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
            if (
              this.childrenLayout === null ||
              this.childrenLayout.type === "absolute"
            ) {
              for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateLayout(
                  this.innerWidth,
                  this.innerHeight,
                );
              }
            } else if (this.childrenLayout.type === "vertical") {
              const spacing = this.childrenLayout.spacing || 0;
              let top = 0;
              for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateLayout(
                  this.innerWidth,
                  this.innerHeight,
                );
                this.children[i].x = 0;
                this.children[i].y = top;
                top += this.children[i].height + spacing;
              }
            } else if (this.childrenLayout.type === "horizontal") {
              const spacing = this.childrenLayout.spacing || 0;
              let left = 0;
              for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateLayout(
                  this.innerWidth,
                  this.innerHeight,
                );
                this.children[i].y = 0;
                this.children[i].x = left;
                left += this.children[i].width + spacing;
              }
            }
            //The last option is "none".. so we don't do anything
          }
          draw(context) {
            if (
              !context.isVisible(
                this.visibleX,
                this.visibleY,
                this.width,
                this.height,
              )
            ) {
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
          preDrawChildren(context) {}
          postDrawChildren(context) {}
          onChildrenTransformChanged(child) {}
          onChildrenAdded(child) {}
        };
        exports_8("BaseWidgetContainer", BaseWidgetContainer);
      },
    };
  },
);
System.register(
  "engine/src/widgets/box",
  ["engine/src/types", "engine/src/widgets/widget-container"],
  function (exports_9, context_9) {
    "use strict";
    var types_ts_4, widget_container_ts_1, BoxContainerWidget;
    var __moduleName = context_9 && context_9.id;
    return {
      setters: [
        function (types_ts_4_1) {
          types_ts_4 = types_ts_4_1;
        },
        function (widget_container_ts_1_1) {
          widget_container_ts_1 = widget_container_ts_1_1;
        },
      ],
      execute: function () {
        BoxContainerWidget = class BoxContainerWidget
          extends widget_container_ts_1.BaseWidgetContainer {
          constructor(
            font,
            border = font.tileWidth,
            borderForeColor = types_ts_4.FixedColor.White,
            borderBackColor = types_ts_4.FixedColor.Black,
            foreColor = types_ts_4.FixedColor.White,
            backColor = types_ts_4.FixedColor.Black,
            fillChar = " ",
          ) {
            super();
            this.title = "";
            this.titleForeColor = types_ts_4.FixedColor.White;
            this.titleBackColor = types_ts_4.FixedColor.Black;
            this.border = 0;
            this.font = font;
            this.border = border;
            this.borderForeColor = borderForeColor;
            this.borderBackColor = borderBackColor;
            this.foreColor = foreColor;
            this.backColor = backColor;
            this.fillChar = fillChar;
          }
          get innerX() {
            return this.border * this.font.tileWidth;
          }
          get innerY() {
            return this.border * this.font.tileHeight;
          }
          get innerWidth() {
            return this.width - this.border * 2 * this.font.tileWidth;
          }
          get innerHeight() {
            return this.height - this.border * 2 * this.font.tileHeight;
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
              context.textColor(this.foreColor, this.backColor).fillChar(
                this.font,
                this.font.tileWidth,
                this.font.tileHeight,
                this.width - 2 * this.font.tileWidth,
                this.height - 2 * this.font.tileHeight,
                this.fillChar,
              );
              context.textColor(this.borderForeColor, this.borderBackColor)
                .textBorder(this.font, 0, 0, this.width, this.height);
            } else {
              context.textColor(this.foreColor, this.backColor).fillChar(
                this.font,
                0,
                0,
                this.width,
                this.height,
                this.fillChar,
              );
            }
            if (this.title.length > 0) {
              context.moveCursorTo(
                Math.floor(
                  (this.width - this.title.length * this.font.tileWidth) / 2,
                ),
                0,
              )
                .textColor(this.titleForeColor, this.titleBackColor)
                .text(this.font, this.title);
            }
          }
        };
        exports_9("BoxContainerWidget", BoxContainerWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/split-panel",
  ["engine/src/widgets/widget-container", "engine/src/widgets/box"],
  function (exports_10, context_10) {
    "use strict";
    var widget_container_ts_2, box_ts_1, SplitPanelContainerWidget;
    var __moduleName = context_10 && context_10.id;
    return {
      setters: [
        function (widget_container_ts_2_1) {
          widget_container_ts_2 = widget_container_ts_2_1;
        },
        function (box_ts_1_1) {
          box_ts_1 = box_ts_1_1;
        },
      ],
      execute: function () {
        SplitPanelContainerWidget = class SplitPanelContainerWidget
          extends widget_container_ts_2.BaseWidgetContainer {
          constructor(font, sl = null) {
            super();
            this.splitLayout = null;
            this.font = font;
            this.panel1 = new box_ts_1.BoxContainerWidget(this.font, 1);
            this.panel2 = new box_ts_1.BoxContainerWidget(this.font, 1);
            this.panel1.parent = this;
            this.panel2.parent = this;
            this.splitLayout = sl;
            this.panel1.layout = {
              customSizeFn: (widget, parentWidth, parentHeight) => {
                const splitPercent = this.splitLayout?.splitPercent || 50;
                const direction = this.splitLayout?.direction || "horizontal";
                const fixedPanel = this.splitLayout?.fixed?.panel;
                const fixedAmount = this.splitLayout?.fixed?.amount || 0;
                if (direction === "horizontal") {
                  widget.height = parentHeight;
                  widget.width = fixedPanel === undefined
                    ? Math.floor(parentWidth * splitPercent / 100)
                    : fixedPanel === "panel1"
                    ? fixedAmount
                    : parentWidth - fixedAmount;
                } else {
                  widget.width = parentWidth;
                  widget.height = fixedPanel === undefined
                    ? Math.floor(parentHeight * splitPercent / 100)
                    : fixedPanel === "panel1"
                    ? fixedAmount
                    : parentHeight - fixedAmount;
                }
              },
            };
            this.panel2.layout = {
              heightPercent: 100,
              customSizeFn: (widget, parentWidth, parentHeight) => {
                const splitPercent = this.splitLayout?.splitPercent || 50;
                const direction = this.splitLayout?.direction || "horizontal";
                const fixedPanel = this.splitLayout?.fixed?.panel;
                const fixedAmount = this.splitLayout?.fixed?.amount || 0;
                if (direction === "horizontal") {
                  widget.height = parentHeight;
                  widget.width = fixedPanel === undefined
                    ? Math.ceil(parentWidth * (100 - splitPercent) / 100)
                    : fixedPanel === "panel2"
                    ? fixedAmount
                    : parentWidth - fixedAmount;
                } else {
                  widget.width = parentWidth;
                  widget.height = fixedPanel === undefined
                    ? Math.ceil(parentHeight * (100 - splitPercent) / 100)
                    : fixedPanel === "panel2"
                    ? fixedAmount
                    : parentHeight - fixedAmount;
                }
              },
              customPositionFn: (widget) => {
                const direction = this.splitLayout?.direction || "horizontal";
                if (direction === "horizontal") {
                  widget.x = this.width - widget.width;
                } else {
                  widget.y = this.height - widget.height;
                }
              },
            };
          }
          drawSelf() {
          }
        };
        exports_10("SplitPanelContainerWidget", SplitPanelContainerWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/animated-tile",
  ["engine/src/widgets/widget"],
  function (exports_11, context_11) {
    "use strict";
    var widget_ts_4, AnimatedTileWidget;
    var __moduleName = context_11 && context_11.id;
    function buildDefaultSequence(len) {
      const seq = [];
      for (let i = 0; i < len; i++) {
        seq.push(i);
      }
      return seq;
    }
    return {
      setters: [
        function (widget_ts_4_1) {
          widget_ts_4 = widget_ts_4_1;
        },
      ],
      execute: function () {
        AnimatedTileWidget = class AnimatedTileWidget
          extends widget_ts_4.BaseWidget {
          constructor(animation) {
            super();
            this.tile = null;
            this.frame = 0;
            this.lastTimeoutCB = -1;
            this.animation = animation;
            this.updateCurrentTile();
          }
          setAnimation(animation) {
            if (animation !== this.animation) {
              this.animation = animation;
              this.frame = 0;
              this.updateCurrentTile();
            }
          }
          updateCurrentTile() {
            const animation = this.animation;
            if (animation === null) {
              return;
            }
            const newTile =
              animation
                .tiles[
                animation.sequence[this.frame % animation.sequence.length]
              ];
            if (newTile !== this.tile) {
              this.tile = newTile;
              this.width = newTile.width;
              this.height = newTile.height;
              this.invalidate();
            }
            this.frame++;
            if (this.lastTimeoutCB >= 0) {
              clearTimeout(this.lastTimeoutCB);
              this.lastTimeoutCB = -1;
            }
            if (animation.delay > 0) {
              this.lastTimeoutCB = setTimeout(() => {
                this.lastTimeoutCB = -1;
                this.updateCurrentTile();
              }, animation.delay);
            }
          }
          drawSelf(context) {
            if (this.tile !== null) {
              context.tile(0, 0, this.tile);
            }
          }
        };
        exports_11("AnimatedTileWidget", AnimatedTileWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/scrollable",
  ["engine/src/types", "engine/src/widgets/widget-container"],
  function (exports_12, context_12) {
    "use strict";
    var types_ts_5, widget_container_ts_3, ScrollableContainerWidget;
    var __moduleName = context_12 && context_12.id;
    return {
      setters: [
        function (types_ts_5_1) {
          types_ts_5 = types_ts_5_1;
        },
        function (widget_container_ts_3_1) {
          widget_container_ts_3 = widget_container_ts_3_1;
        },
      ],
      execute: function () {
        ScrollableContainerWidget = class ScrollableContainerWidget
          extends widget_container_ts_3.BaseWidgetContainer {
          constructor(
            font,
            foreColor = types_ts_5.FixedColor.White,
            backColor = types_ts_5.FixedColor.Black,
            fillChar = " ",
          ) {
            super();
            this._offsetX = 0;
            this._offsetY = 0;
            this.font = font;
            this.foreColor = foreColor;
            this.backColor = backColor;
            this.fillChar = fillChar;
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
          setOffset(offsetX, offsetY) {
            if (offsetX !== this._offsetX || offsetY !== this._offsetY) {
              this._offsetX = offsetX;
              this._offsetY = offsetY;
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
            context
              .textColor(this.foreColor, this.backColor)
              .fillChar(
                this.font,
                0,
                0,
                this.width,
                this.height,
                this.fillChar,
              );
          }
        };
        exports_12("ScrollableContainerWidget", ScrollableContainerWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/tilemap",
  ["engine/src/widgets/scrollable"],
  function (exports_13, context_13) {
    "use strict";
    var scrollable_ts_1, ScrollableTilemapContainerWidget;
    var __moduleName = context_13 && context_13.id;
    return {
      setters: [
        function (scrollable_ts_1_1) {
          scrollable_ts_1 = scrollable_ts_1_1;
        },
      ],
      execute: function () {
        ScrollableTilemapContainerWidget =
          class ScrollableTilemapContainerWidget
            extends scrollable_ts_1.ScrollableContainerWidget {
            constructor() {
              super(...arguments);
              this.floorTilemap = null;
              this.floorTiles = null;
            }
            onChildrenAdded(child) {
              super.onChildrenAdded(child);
              this.updateChildrenIndex(child);
            }
            onChildrenTransformChanged(child) {
              super.onChildrenTransformChanged(child);
              this.updateChildrenIndex(child);
            }
            drawSelf(context) {
              super.drawSelf(context);
              const tilemap = this.floorTilemap;
              const tiles = this.floorTiles;
              if (tilemap !== null && tiles !== null) {
                for (let y = 0; y < tiles.length; y++) {
                  const row = tiles[y];
                  if (
                    !context.isVisible(
                      this.innerX + 0,
                      this.innerY + y * tilemap.tileHeight,
                      row.length * tilemap.tileWidth,
                      tilemap.tileHeight,
                    )
                  ) {
                    continue;
                  }
                  for (let x = 0; x < row.length; x++) {
                    context.tile(
                      this.innerX + x * tilemap.tileWidth,
                      this.innerY + y * tilemap.tileHeight,
                      tilemap.tiles[row[x]],
                    );
                  }
                }
              }
            }
            updateChildrenIndex(child) {
              const children = this._children;
              let idx = children.indexOf(child);
              if (idx >= 0) {
                const prevOk = idx == 0 ||
                  children[idx - 1].visibleY <= child.visibleY;
                const nextOk = idx == children.length - 1 ||
                  children[idx + 1].visibleY >= child.visibleY;
                if (!prevOk) {
                  while (
                    idx > 0 && children[idx - 1].visibleY > child.visibleY
                  ) {
                    const tmp = children[idx - 1];
                    children[idx - 1] = children[idx];
                    children[idx] = tmp;
                    idx--;
                  }
                } else if (!nextOk) {
                  while (
                    idx < children.length - 1 &&
                    children[idx + 1].visibleY < child.visibleY
                  ) {
                    const tmp = children[idx + 1];
                    children[idx + 1] = children[idx];
                    children[idx] = tmp;
                    idx++;
                  }
                }
              }
            }
          };
        exports_13(
          "ScrollableTilemapContainerWidget",
          ScrollableTilemapContainerWidget,
        );
      },
    };
  },
);
System.register(
  "game/src/game",
  [
    "engine/src/widgets/character",
    "engine/src/widgets/label",
    "engine/src/types",
    "engine/src/widgets/split-panel",
    "engine/src/widgets/animated-tile",
    "engine/src/widgets/tilemap",
  ],
  function (exports_14, context_14) {
    "use strict";
    var character_ts_1,
      label_ts_1,
      types_ts_6,
      split_panel_ts_1,
      animated_tile_ts_1,
      tilemap_ts_1,
      NPCS_COUNT,
      MAP_SIZE,
      OBSTACLES_COUNT,
      mainUI,
      cameraMode,
      npcs,
      characters,
      playingBox,
      keysDown,
      p1,
      p2,
      assets,
      font,
      WALK_SPEED,
      p1idleFrames;
    var __moduleName = context_14 && context_14.id;
    function isKeyDown(key) {
      return keysDown.get(key) || false;
    }
    function initGame(engine, assets_) {
      assets = assets_;
      font = assets.defaultFont;
      exports_14(
        "mainUI",
        mainUI = new split_panel_ts_1.SplitPanelContainerWidget(font),
      );
      mainUI.layout = {
        widthPercent: 100,
        heightPercent: 100,
      };
      mainUI.splitLayout = {
        direction: "horizontal",
        fixed: {
          panel: "panel2",
          amount: 19 * font.tileWidth,
        },
      };
      mainUI.panel2.border = 2;
      mainUI.panel2.backColor = types_ts_6.FixedColor.BrightBlack;
      playingBox = new tilemap_ts_1.ScrollableTilemapContainerWidget(font);
      playingBox.setLayout({ heightPercent: 100, widthPercent: 100 });
      playingBox.setChildrenLayout({ type: "none" });
      playingBox.parent = mainUI.panel1;
      mainUI.panel1.title = " Map ";
      mainUI.panel1.titleForeColor = types_ts_6.FixedColor.BrightWhite;
      mainUI.panel1.titleBackColor = types_ts_6.rgb(
        51, /* I20 */
        0, /* I0 */
        51, /* I20 */
      );
      mainUI.panel1.borderForeColor = types_ts_6.rgb(
        153, /* I60 */
        0, /* I0 */
        153, /* I60 */
      );
      mainUI.panel1.borderBackColor = types_ts_6.rgb(
        51, /* I20 */
        0, /* I0 */
        51, /* I20 */
      );
      mainUI.panel1.backColor = types_ts_6.FixedColor.Black;
      mainUI.panel1.fillChar = "";
      mainUI.panel2.title = " Stats ";
      mainUI.panel2.titleForeColor = types_ts_6.FixedColor.BrightWhite;
      mainUI.panel2.titleBackColor = types_ts_6.rgb(
        0, /* I0 */
        51, /* I20 */
        102, /* I40 */
      );
      mainUI.panel2.borderForeColor = types_ts_6.rgb(
        0, /* I0 */
        0, /* I0 */
        153, /* I60 */
      );
      mainUI.panel2.borderBackColor = types_ts_6.rgb(
        0, /* I0 */
        51, /* I20 */
        102, /* I40 */
      );
      mainUI.panel2.backColor = types_ts_6.rgb(
        0, /* I0 */
        51, /* I20 */
        102, /* I40 */
      );
      mainUI.panel2.childrenLayout = {
        type: "vertical",
        spacing: 1 * font.tileWidth,
      };
      new label_ts_1.LabelWidget(
        font,
        "Move P1:\n  W/S/A/D\nMove P2:\n  I/J/K/L\nQuit: Z",
        types_ts_6.FixedColor.White,
        mainUI.panel2.backColor,
      ).parent = mainUI.panel2;
      function random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
      }
      p1 = new animated_tile_ts_1.AnimatedTileWidget(
        assets.getAnimation("down"),
      );
      p1.pivotX = -Math.floor(p1.width / 2);
      p1.pivotY = -Math.floor((p1.height * 7) / 8);
      p1.x = 10 * font.tileWidth;
      p1.y = 10 * font.tileHeight;
      p2 = new animated_tile_ts_1.AnimatedTileWidget(
        assets.getAnimation("down"),
      );
      p2.pivotX = -Math.floor(p1.width / 2);
      p2.pivotY = -Math.floor((p1.height * 7) / 8);
      p2.x = 13 * font.tileWidth;
      p2.y = 3 * font.tileHeight;
      const npcsColors = [
        types_ts_6.FixedColor.Green,
        types_ts_6.FixedColor.Yellow,
        types_ts_6.FixedColor.Cyan,
      ];
      for (let i = 0; i < NPCS_COUNT; i++) {
        npcs.push(
          new character_ts_1.CharacterWidget(
            font,
            "@",
            npcsColors[i % npcsColors.length],
            types_ts_6.FixedColor.Transparent,
          ),
        );
      }
      characters.push(...npcs, p1, p2);
      const obtacleChars = ["."];
      const obtacleColors = [
        types_ts_6.rgb(0, /* I0 */ 51, /* I20 */ 0 /* I0 */),
        types_ts_6.rgb(0, /* I0 */ 102, /* I40 */ 0 /* I0 */),
        types_ts_6.rgb(0, /* I0 */ 153, /* I60 */ 0 /* I0 */),
        types_ts_6.rgb(0, /* I0 */ 204, /* I80 */ 0 /* I0 */),
      ];
      playingBox.floorTilemap = assets.getTilemap("floor");
      playingBox.floorTiles = [];
      for (let y = 0; y < 128; y++) {
        const row = [];
        for (let x = 0; x < 128; x++) {
          if (Math.random() > 0.5) {
            row.push((7 + 6) * 21 + 1);
          } else if (Math.random() > 0.5) {
            row.push((7 + 3) * 21 + 1);
          } else {
            row.push((7 + 0) * 21 + 1);
          }
        }
        playingBox.floorTiles.push(row);
      }
      for (let i = 0; i < OBSTACLES_COUNT; i++) {
        const obstacle = new character_ts_1.CharacterWidget(
          font,
          random(obtacleChars),
          random(obtacleColors),
          types_ts_6.FixedColor.Transparent,
        );
        obstacle.x = Math.floor(Math.random() * MAP_SIZE) * font.tileWidth;
        obstacle.y = Math.floor(Math.random() * MAP_SIZE) * font.tileHeight;
        obstacle.parent = playingBox;
      }
      characters.forEach((c) => (c.parent = playingBox));
      function onKeyEvent(e) {
        if (e.char) {
          if (e.type === "down") {
            keysDown.set(e.char, true);
          } else if (e.type === "up") {
            keysDown.set(e.char, false);
          }
        }
      }
      engine.addWidget(mainUI);
      engine.onKeyEvent(onKeyEvent);
    }
    exports_14("initGame", initGame);
    function updateGame(engine) {
      let running = true;
      for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        switch (Math.floor(Math.random() * 4)) {
          case 0:
            npc.x -= WALK_SPEED;
            break;
          case 1:
            npc.x += WALK_SPEED;
            break;
          case 2:
            npc.y -= WALK_SPEED;
            break;
          case 3:
            npc.y += WALK_SPEED;
            break;
        }
      }
      let p1oldPos = { x: p1.x, y: p1.y };
      let p2oldPos = { x: p2.x, y: p2.y };
      if (isKeyDown("a")) {
        p1.x -= WALK_SPEED;
        p1.setAnimation(assets.getAnimation("left-walking"));
      }
      if (isKeyDown("d")) {
        p1.x += WALK_SPEED;
        p1.setAnimation(assets.getAnimation("right-walking"));
      }
      if (isKeyDown("w")) {
        p1.y -= WALK_SPEED;
        p1.setAnimation(assets.getAnimation("up-walking"));
      }
      if (isKeyDown("s")) {
        p1.y += WALK_SPEED;
        p1.setAnimation(assets.getAnimation("down-walking"));
      }
      if (isKeyDown("j")) {
        p2.x -= WALK_SPEED;
        p2.setAnimation(assets.getAnimation("left-walking"));
      }
      if (isKeyDown("l")) {
        p2.x += WALK_SPEED;
        p2.setAnimation(assets.getAnimation("right-walking"));
      }
      if (isKeyDown("i")) {
        p2.y -= WALK_SPEED;
        p2.setAnimation(assets.getAnimation("up-walking"));
      }
      if (isKeyDown("k")) {
        p2.y += WALK_SPEED;
        p2.setAnimation(assets.getAnimation("down-walking"));
      }
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        char.x = Math.max(
          Math.min(
            char.x,
            MAP_SIZE * font.tileWidth - char.width * font.tileWidth,
          ),
          0,
        );
        char.y = Math.max(
          Math.min(
            char.y,
            MAP_SIZE * font.tileHeight - char.height * font.tileHeight,
          ),
          0,
        );
      }
      if (p1oldPos.x === p1.x && p1oldPos.y === p1.y) {
        if (p1.animation.id.endsWith("-walking")) {
          p1.setAnimation(
            assets.getAnimation(p1.animation.id.replace("-walking", "")),
          );
        }
      }
      if (p2oldPos.x === p2.x && p2oldPos.y === p2.y) {
        if (p2.animation.id.endsWith("-walking")) {
          p2.setAnimation(
            assets.getAnimation(p1.animation.id.replace("-walking", "")),
          );
        }
      }
      let newOffsetX = playingBox.offsetX;
      let newOffsetY = playingBox.offsetY;
      if (cameraMode === 0 /* FollowContinuous */) {
        newOffsetX = -p1.x + Math.floor(playingBox.width * 0.5);
        newOffsetY = -p1.y + Math.floor(playingBox.height * 0.5);
      } else {
        if (p1.x > -playingBox.offsetX + playingBox.width * 0.85) {
          newOffsetX = playingBox.offsetX - Math.ceil(playingBox.width * 0.35);
        } else if (p1.x < -playingBox.offsetX + playingBox.width * 0.15) {
          newOffsetX = playingBox.offsetX + Math.ceil(playingBox.width * 0.35);
        }
        if (p1.y > -playingBox.offsetY + playingBox.height * 0.85) {
          newOffsetY = playingBox.offsetY - Math.ceil(playingBox.height * 0.35);
        } else if (p1.y < -playingBox.offsetY + playingBox.height * 0.15) {
          newOffsetY = playingBox.offsetY + Math.ceil(playingBox.height * 0.35);
        }
      }
      playingBox.setOffset(
        Math.trunc(
          Math.max(
            Math.min(newOffsetX, 0),
            -(MAP_SIZE * font.tileWidth - playingBox.width),
          ),
        ),
        Math.trunc(
          Math.max(
            Math.min(newOffsetY, 0),
            -(MAP_SIZE * font.tileHeight - playingBox.height),
          ),
        ),
      );
      return running;
    }
    exports_14("updateGame", updateGame);
    return {
      setters: [
        function (character_ts_1_1) {
          character_ts_1 = character_ts_1_1;
        },
        function (label_ts_1_1) {
          label_ts_1 = label_ts_1_1;
        },
        function (types_ts_6_1) {
          types_ts_6 = types_ts_6_1;
        },
        function (split_panel_ts_1_1) {
          split_panel_ts_1 = split_panel_ts_1_1;
        },
        function (animated_tile_ts_1_1) {
          animated_tile_ts_1 = animated_tile_ts_1_1;
        },
        function (tilemap_ts_1_1) {
          tilemap_ts_1 = tilemap_ts_1_1;
        },
      ],
      execute: function () {
        NPCS_COUNT = 2;
        MAP_SIZE = 512;
        OBSTACLES_COUNT = 512;
        cameraMode = 0 /* FollowContinuous */;
        npcs = [];
        characters = [];
        keysDown = new Map();
        WALK_SPEED = 4;
        p1idleFrames = 0;
      },
    };
  },
);
System.register(
  "web/src/native/web",
  ["engine/src/types"],
  function (exports_15, context_15) {
    "use strict";
    var types_ts_7, SCALE;
    var __moduleName = context_15 && context_15.id;
    function updateCanvasSize(canvas, width, height) {
      canvas.width = Math.floor(width / SCALE);
      canvas.height = Math.floor(height / SCALE);
      if (SCALE !== 1) {
        canvas.setAttribute(
          "style",
          "width: " +
            canvas.width * SCALE +
            "px;" +
            "height: " +
            canvas.height * SCALE +
            "px;" +
            "image-rendering: pixelated;",
        );
      }
    }
    function createFullScreenCanvas() {
      const canvas = document.createElement("canvas");
      updateCanvasSize(canvas, window.innerWidth, window.innerHeight);
      document.body.appendChild(canvas);
      return canvas;
    }
    function getWebNativeContext() {
      const canvas = createFullScreenCanvas();
      const ctx = canvas.getContext("2d");
      const screenSize = new types_ts_7.Size(256, 256);
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let imageDataPixels = imageData.data;
      let imageDataPixels32 = new Uint32Array(imageDataPixels.buffer);
      const colorsRGB = new Uint32Array(2);
      let dirty = false;
      let dirtyLeft = 0;
      let dirtyRight = 0;
      let dirtyTop = 0;
      let dirtyBottom = 0;
      const setDirty = (x, y, width, height) => {
        if (!dirty) {
          dirty = true;
          dirtyLeft = x;
          dirtyTop = y;
          dirtyRight = x + width;
          dirtyBottom = y + height;
        } else {
          dirtyLeft = Math.min(dirtyLeft, x);
          dirtyTop = Math.min(dirtyTop, y);
          dirtyRight = Math.max(dirtyRight, x + width);
          dirtyBottom = Math.max(dirtyBottom, y + height);
        }
      };
      ctx.imageSmoothingEnabled = false;
      let screenSizeChangedListeners = [];
      let inputListeners = [];
      const disptachKeyEvent = (e) => {
        inputListeners.forEach((l) => l(e));
      };
      const updateScreenSize = () => {
        screenSize.set(canvas.width, canvas.height);
      };
      const handleKeyDown = (e) => {
        const key = e.key;
        if (key.length === 1) {
          disptachKeyEvent({ type: "down", char: key });
        }
      };
      const handleKeyUp = (e) => {
        const key = e.key;
        if (key.length === 1) {
          disptachKeyEvent({ type: "up", char: key });
        }
      };
      const handleKeyPress = (e) => {
        const key = e.key;
        if (key.length === 1) {
          disptachKeyEvent({ type: "press", char: key });
        }
      };
      const handleMouseDown = (e) => {
        const dx = e.clientX < window.innerWidth / 3 ? -1
        : e.clientX > (window.innerWidth * 2) / 3
        ? 1
        : 0;
        const dy = e.clientY < window.innerHeight / 3
          ? -1
          : e.clientY > (window.innerHeight * 2) / 3
          ? 1
          : 0;
        const key = dx === -1
          ? "a"
          : dx === 1
          ? "d"
          : dy === -1
          ? "w"
          : dy === 1
          ? "s"
          : "";
        if (key.length === 1) {
          disptachKeyEvent({ type: "press", char: key });
        }
      };
      const handleResize = () => {
        updateCanvasSize(canvas, window.innerWidth, window.innerHeight);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageDataPixels = imageData.data;
        imageDataPixels32 = new Uint32Array(imageDataPixels.buffer);
        updateScreenSize();
        screenSizeChangedListeners.forEach((l) => l(screenSize));
      };
      const tintTile = (t, foreColor, backColor, x, y, cfx, cfy, ctx, cty) => {
        setDirty(x, y, t.width, t.height);
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
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                const cp = tilePixels[f++];
                if (cp == 1) {
                  imageDataPixels32[p++] = colorsRGB[cp];
                } else {
                  p++;
                }
              }
            }
          } else {
            for (let py = 0; py < tileHeight; py++) {
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
              }
            }
          }
        } else {
          if (backTransparent) {
            for (let py = 0; py < tileHeight; py++) {
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                  const cp = tilePixels[f++];
                  if (cp == 1) {
                    imageDataPixels32[p++] = colorsRGB[cp];
                  } else {
                    p++;
                  }
                } else {
                  p++;
                  f++;
                }
              }
            }
          } else {
            for (let py = 0; py < tileHeight; py++) {
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                  imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
                } else {
                  p++;
                  f++;
                }
              }
            }
          }
        }
      };
      const setTile = (t, x, y, cfx, cfy, ctx, cty) => {
        setDirty(x, y, t.width, t.height);
        const tileWidth = t.width;
        const tileHeight = t.height;
        let p = 0;
        let f = 0;
        const tilePixels32 = t.pixels32;
        if (t.hasAlpha) {
          if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
            for (let py = 0; py < tileHeight; py++) {
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                const pixel = tilePixels32[f++];
                if (pixel >> 24 !== 0) {
                  imageDataPixels32[p++] = pixel;
                } else {
                  p++;
                }
              }
            }
          } else {
            for (let py = 0; py < tileHeight; py++) {
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                  const pixel = tilePixels32[f++];
                  if (pixel >> 24 !== 0) {
                    imageDataPixels32[p++] = pixel;
                  } else {
                    p++;
                  }
                } else {
                  p++;
                  f++;
                }
              }
            }
          }
        } else {
          if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
            for (let py = 0; py < tileHeight; py++) {
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                imageDataPixels32[p++] = tilePixels32[f++];
              }
            }
          } else {
            for (let py = 0; py < tileHeight; py++) {
              p = (y + py) * imageData.width + x;
              f = py * tileWidth;
              for (let px = 0; px < tileWidth; px++) {
                if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                  imageDataPixels32[p++] = tilePixels32[f++];
                } else {
                  p++;
                  f++;
                }
              }
            }
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      window.addEventListener("keypress", handleKeyPress);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("resize", handleResize);
      updateScreenSize();
      return {
        screen: {
          getScreenSize: () => screenSize,
          onScreenSizeChanged: (listener) => {
            screenSizeChangedListeners.push(listener);
          },
          tintTile,
          setTile,
          beginDraw: () => {
            dirty = false;
          },
          endDraw: () => {
            if (dirty) {
              dirtyLeft = Math.max(Math.min(dirtyLeft, screenSize.width), 0);
              dirtyRight = Math.max(Math.min(dirtyRight, screenSize.width), 0);
              dirtyTop = Math.max(Math.min(dirtyTop, screenSize.height), 0);
              dirtyBottom = Math.max(
                Math.min(dirtyBottom, screenSize.height),
                0,
              );
              ctx.putImageData(
                imageData,
                0,
                0,
                dirtyLeft,
                dirtyTop,
                dirtyRight - dirtyLeft,
                dirtyBottom - dirtyTop,
              );
              dirty = false;
            }
          },
        },
        input: {
          onKeyEvent: (listener) => {
            inputListeners.push(listener);
          },
        },
        init: async () => {
          updateScreenSize();
        },
        destroy: () => {},
      };
    }
    exports_15("getWebNativeContext", getWebNativeContext);
    return {
      setters: [
        function (types_ts_7_1) {
          types_ts_7 = types_ts_7_1;
        },
      ],
      execute: function () {
        SCALE = 1;
      },
    };
  },
);
System.register("web/src/native/assets", [], function (exports_16, context_16) {
  "use strict";
  var __moduleName = context_16 && context_16.id;
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
    };
    let index = 0;
    for (let y = 0; y < image.height / tileHeight; y++) {
      for (let x = 0; x < image.width / tileWidth; x++) {
        const pixels =
          ctx.getImageData(x * tileWidth, y * tileHeight, tileWidth, tileHeight)
            .data;
        const pixels32 = new Uint32Array(pixels.buffer);
        const hasAlpha = pixels32.some((x) => ((x >> 24) & 0xff) != 255);
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
          hasAlpha,
        };
        tiles.push(tile);
        index++;
      }
    }
    return tilemap;
  }
  function loadAnimation(id, json, tilemaps) {
    const delay = json.fps > 0 ? 1000 / json.fps : 0;
    const tiles = json.frames.map((f) => tilemaps.get(json.tilemap).tiles[f]);
    const sequence = [];
    for (let i = 0; i < tiles.length; i++) {
      sequence.push(i);
    }
    return {
      id,
      delay,
      tiles,
      sequence,
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
    const assets = {
      fonts,
      animations,
      tilemaps,
      defaultFont: fonts.get(assetsJson.defaultFont),
      getAnimation: (id) => animations.get(id),
      getFont: (id) => fonts.get(id),
      getTilemap: (id) => tilemaps.get(id),
    };
    return assets;
  }
  exports_16("initAssets", initAssets);
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register(
  "web/src/main",
  [
    "engine/src/types",
    "engine/src/engine",
    "engine/src/widgets/label",
    "game/src/game",
    "web/src/native/web",
    "web/src/native/assets",
  ],
  function (exports_17, context_17) {
    "use strict";
    var types_ts_8,
      engine_ts_1,
      label_ts_2,
      game_ts_1,
      web_ts_1,
      assets_ts_1,
      TARGET_FPS,
      engine,
      fpsLabel,
      totalRenderTime,
      frames,
      framesTime,
      lastUpdateTime,
      timeToNextUpdate;
    var __moduleName = context_17 && context_17.id;
    function updateFps() {
      const now = performance.now();
      frames++;
      if (now - framesTime > 1000) {
        const fps = frames / ((now - framesTime) / 1000);
        const stats = "FPS: " +
          fps.toFixed(2) +
          "\nRender: " +
          (totalRenderTime / frames).toFixed(2) +
          "ms";
        fpsLabel.text = stats;
        framesTime = now;
        frames = 0;
        totalRenderTime = 0;
      }
    }
    async function init() {
      console.log("Initializing Engine");
      const assets = await assets_ts_1.initAssets();
      engine = await engine_ts_1.buildEngine(web_ts_1.getWebNativeContext());
      console.log("Engine Initialized");
      game_ts_1.initGame(engine, assets);
      console.log("Game Initialized");
      fpsLabel = new label_ts_2.LabelWidget(
        assets.defaultFont,
        "FPS: 0.00\nRender: 0.00ms",
        types_ts_8.FixedColor.White,
        game_ts_1.mainUI.panel2.backColor,
      );
      fpsLabel.parent = game_ts_1.mainUI.panel2;
      return engine;
    }
    function update() {
      const updateTime = performance.now();
      const delta = updateTime - lastUpdateTime;
      lastUpdateTime = updateTime;
      timeToNextUpdate -= delta;
      if (timeToNextUpdate < -1000) {
        timeToNextUpdate = -1000;
      }
      if (timeToNextUpdate > 0.1) {
        return;
      }
      timeToNextUpdate += 1000 / TARGET_FPS;
      updateFps();
      engine.update();
      game_ts_1.updateGame(engine);
      engine.draw();
      const end = performance.now();
      const renderTime = end - updateTime;
      totalRenderTime += renderTime;
    }
    async function run() {
      const engine = await init();
      function onRequestAnimationFrame() {
        update();
        requestAnimationFrame(onRequestAnimationFrame);
      }
      onRequestAnimationFrame();
      return engine;
    }
    return {
      setters: [
        function (types_ts_8_1) {
          types_ts_8 = types_ts_8_1;
        },
        function (engine_ts_1_1) {
          engine_ts_1 = engine_ts_1_1;
        },
        function (label_ts_2_1) {
          label_ts_2 = label_ts_2_1;
        },
        function (game_ts_1_1) {
          game_ts_1 = game_ts_1_1;
        },
        function (web_ts_1_1) {
          web_ts_1 = web_ts_1_1;
        },
        function (assets_ts_1_1) {
          assets_ts_1 = assets_ts_1_1;
        },
      ],
      execute: function () {
        TARGET_FPS = 30;
        totalRenderTime = 0;
        frames = 0;
        framesTime = performance.now();
        lastUpdateTime = performance.now();
        timeToNextUpdate = 0;
        run();
      },
    };
  },
);

__instantiate("web/src/main");
