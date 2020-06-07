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
  var FixedColor, FONT_SIZE, FONT_NAME, Point, Size, Rect;
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
      exports_1("FONT_SIZE", FONT_SIZE = 16);
      exports_1("FONT_NAME", FONT_NAME = "font16x16");
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
          return this.x === p.x &&
            this.y === p.y;
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
          return this.width === size.width &&
            this.height === size.height;
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
          return this.x === rect.x &&
            this.y === rect.y &&
            this.width === rect.width &&
            this.height === rect.height;
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
            this.fontTile = {
              tilemap: "",
              index: 0,
              width: types_ts_1.FONT_SIZE,
              height: types_ts_1.FONT_SIZE,
            };
            this.x = 0;
            this.y = 0;
            this.foreColor = types_ts_1.FixedColor.White;
            this.backColor = types_ts_1.FixedColor.Black;
            this.transformsStack = [];
            this.clipStack = [];
            this.nativeContext = nativeContext;
          }
          beginDraw() {
            this.font(types_ts_1.FONT_NAME);
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
          font(name) {
            this.fontTile.tilemap = name;
            return this;
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
          text(str) {
            for (let i = 0; i < str.length; i++) {
              this.char(str.charCodeAt(i));
            }
            return this;
          }
          char(code) {
            const screenX = this.x + this.tx;
            const screenY = this.y + this.ty;
            const width = types_ts_1.FONT_SIZE;
            const height = types_ts_1.FONT_SIZE;
            const clip = this.clip;
            if (
              screenX + width > clip.x &&
              screenX < clip.x1 &&
              screenY + height > clip.y &&
              screenY < clip.y1
            ) {
              this.fontTile.index = code;
              const cfx = Math.max(clip.x - screenX, 0);
              const cfy = Math.max(clip.y - screenY, 0);
              const ctx = Math.min(clip.x1 - screenX, width);
              const cty = Math.min(clip.y1 - screenY, height);
              if (cfx > 0 || cfy > 0 || ctx < width || cty < height) {
                this.nativeContext.tintTileClip(
                  this.fontTile,
                  this.foreColor,
                  this.backColor,
                  screenX,
                  screenY,
                  cfx,
                  cfy,
                  ctx,
                  cty,
                );
              } else {
                this.nativeContext.tintTile(
                  this.fontTile,
                  this.foreColor,
                  this.backColor,
                  screenX,
                  screenY,
                );
              }
            }
            this.x += width;
            return this;
          }
          charTimes(code, times) {
            for (let t = 0; t < times; t++) {
              this.char(code);
            }
            return this;
          }
          specialChar(code) {
            this.char(AnsiSpecialChar[code]);
            return this;
          }
          specialCharTimes(code, times) {
            for (let t = 0; t < times; t++) {
              this.specialChar(code);
            }
            return this;
          }
          textBorder(x, y, width, height) {
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
            this.moveCursorTo(x, y);
            this.specialChar(10 /* CornerTopLeft */);
            this.specialCharTimes(
              9, /* Horizontal */
              width / types_ts_1.FONT_SIZE - 2,
            );
            this.moveCursorTo(x + width - types_ts_1.FONT_SIZE, y);
            this.specialChar(11 /* CornerTopRight */);
            for (
              let i = 0;
              i < height - 2 * types_ts_1.FONT_SIZE;
              i += types_ts_1.FONT_SIZE
            ) {
              this.moveCursorTo(x, y + types_ts_1.FONT_SIZE + i);
              this.specialChar(8 /* Vertical */);
              this.moveCursorTo(
                x + width - types_ts_1.FONT_SIZE,
                y + types_ts_1.FONT_SIZE + i,
              );
              this.specialChar(8 /* Vertical */);
            }
            this.moveCursorTo(x, y + height - types_ts_1.FONT_SIZE);
            this.specialChar(12 /* CornerBottomLeft */);
            this.specialCharTimes(
              9, /* Horizontal */
              width / types_ts_1.FONT_SIZE - 2,
            );
            this.moveCursorTo(
              x + width - types_ts_1.FONT_SIZE,
              y + height - types_ts_1.FONT_SIZE,
            );
            this.specialChar(13 /* CornerBottomRight */);
            return this;
          }
          fillChar(x, y, width, height, char) {
            if (char.length === 0) {
              return this;
            }
            const fontWidth = types_ts_1.FONT_SIZE;
            const fontHeight = types_ts_1.FONT_SIZE;
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
            this.fontTile.index = code;
            for (let screenY = y0; screenY < y1; screenY += fontHeight) {
              for (let screenX = x0; screenX < x1; screenX += fontWidth) {
                const cfx = Math.max(clip.x - screenX, 0);
                const cfy = Math.max(clip.y - screenY, 0);
                const ctx = Math.min(clip.x1 - screenX, fontWidth);
                const cty = Math.min(clip.y1 - screenY, fontHeight);
                if (cfx > 0 || cfy > 0 || ctx < fontWidth || cty < fontHeight) {
                  this.nativeContext.tintTileClip(
                    this.fontTile,
                    this.foreColor,
                    this.backColor,
                    screenX,
                    screenY,
                    cfx,
                    cfy,
                    ctx,
                    cty,
                  );
                } else {
                  this.nativeContext.tintTile(
                    this.fontTile,
                    this.foreColor,
                    this.backColor,
                    screenX,
                    screenY,
                  );
                }
              }
            }
            return this;
          }
          tile(x, y, t) {
            const screenX = this.x + this.tx;
            const screenY = this.y + this.ty;
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
              if (cfx > 0 || cfy > 0 || ctx < width || cty < height) {
                this.nativeContext.setTileClip(
                  t,
                  screenX,
                  screenY,
                  cfx,
                  cfy,
                  ctx,
                  cty,
                );
              } else {
                this.nativeContext.setTile(t, screenX, screenY);
              }
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
                if (cfx > 0 || cfy > 0 || ctx < t.width || cty < t.height) {
                  this.nativeContext.setTileClip(
                    t,
                    screenX,
                    screenY,
                    cfx,
                    cfy,
                    ctx,
                    cty,
                  );
                } else {
                  this.nativeContext.setTile(t, screenX, screenY);
                }
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
          onInput(listener) {
            this.nativeContext.input.onInput(listener);
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
                if (index >= 0) {
                  this._parent.children.splice(index, 1);
                }
              }
              this._parent = v;
              if (this._parent !== null) {
                this._parent.children.push(this);
                this.engine = this._parent.engine;
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
                  parentHeight * layout.heightPercent / 100,
                );
              }
              if (layout.widthPercent !== undefined) {
                this.width = Math.ceil(parentWidth * layout.widthPercent / 100);
              }
              if (layout.customSizeFn !== undefined) {
                layout.customSizeFn(this, parentWidth, parentHeight);
              }
              if (layout.horizontalSpacingPercent !== undefined) {
                this.x = Math.floor(
                  (parentWidth - this.width) * layout.horizontalSpacingPercent /
                    100,
                );
              }
              if (layout.verticalSpacingPercent !== undefined) {
                this.y = Math.floor(
                  (parentHeight - this.height) * layout.verticalSpacingPercent /
                    100,
                );
              }
              if (layout.customPositionFn !== undefined) {
                layout.customPositionFn(this, parentWidth, parentHeight);
              }
            }
          }
          draw(context) {
            if (!context.isVisible(this.x, this.y, this.width, this.height)) {
              return;
            }
            context.pushTransform(this.x, this.y);
            context.pushClip(0, 0, this.width, this.height);
            context.moveCursorTo(0, 0);
            this.drawSelf(context);
            context.popClip();
            context.popTransform();
          }
          getBoundingBox() {
            this._boundingBox.set(this._x, this._y, this._width, this._height);
            let p = this._parent;
            while (p !== null) {
              this._boundingBox.x += p.x + p.innerX;
              this._boundingBox.y += p.y + p.innerY;
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
  ["engine/src/widgets/widget", "engine/src/types"],
  function (exports_6, context_6) {
    "use strict";
    var widget_ts_1, types_ts_4, LabelWidget;
    var __moduleName = context_6 && context_6.id;
    return {
      setters: [
        function (widget_ts_1_1) {
          widget_ts_1 = widget_ts_1_1;
        },
        function (types_ts_4_1) {
          types_ts_4 = types_ts_4_1;
        },
      ],
      execute: function () {
        LabelWidget = class LabelWidget extends widget_ts_1.BaseWidget {
          constructor(text, foreColor, backColor) {
            super();
            this._text = "";
            this._lines = [];
            this.height = types_ts_4.FONT_SIZE;
            this.text = text;
            this.foreColor = foreColor;
            this.backColor = backColor;
          }
          set text(val) {
            if (val !== this._text) {
              this._text = val;
              this._lines = val.split("\n");
              this.width = this._lines.map((s) => s.length).reduce((max, c) =>
                Math.max(max, c), 0) * types_ts_4.FONT_SIZE;
              this.height = this._lines.length * types_ts_4.FONT_SIZE;
              this.invalidate();
            }
          }
          get text() {
            return this._text;
          }
          drawSelf(context) {
            context.textColor(this.foreColor, this.backColor);
            for (let i = 0; i < this._lines.length; i++) {
              context.moveCursorTo(0, i * types_ts_4.FONT_SIZE).text(
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
  ["engine/src/widgets/widget", "engine/src/types"],
  function (exports_7, context_7) {
    "use strict";
    var widget_ts_2, types_ts_5, CharacterWidget;
    var __moduleName = context_7 && context_7.id;
    return {
      setters: [
        function (widget_ts_2_1) {
          widget_ts_2 = widget_ts_2_1;
        },
        function (types_ts_5_1) {
          types_ts_5 = types_ts_5_1;
        },
      ],
      execute: function () {
        CharacterWidget = class CharacterWidget extends widget_ts_2.BaseWidget {
          constructor(char, foreColor, backColor) {
            super();
            this.width = this.height = types_ts_5.FONT_SIZE;
            this.char = char;
            this.foreColor = foreColor;
            this.backColor = backColor;
          }
          drawSelf(context) {
            context.textColor(this.foreColor, this.backColor).text(this.char);
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
            if (!context.isVisible(this.x, this.y, this.width, this.height)) {
              return;
            }
            context.pushTransform(this.x, this.y);
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
    var types_ts_6, widget_container_ts_1, BoxContainerWidget;
    var __moduleName = context_9 && context_9.id;
    return {
      setters: [
        function (types_ts_6_1) {
          types_ts_6 = types_ts_6_1;
        },
        function (widget_container_ts_1_1) {
          widget_container_ts_1 = widget_container_ts_1_1;
        },
      ],
      execute: function () {
        BoxContainerWidget = class BoxContainerWidget
          extends widget_container_ts_1.BaseWidgetContainer {
          constructor(
            border = types_ts_6.FONT_SIZE,
            borderForeColor = types_ts_6.FixedColor.White,
            borderBackColor = types_ts_6.FixedColor.Black,
            foreColor = types_ts_6.FixedColor.White,
            backColor = types_ts_6.FixedColor.Black,
            fillChar = " ",
          ) {
            super();
            this.title = "";
            this.titleForeColor = types_ts_6.FixedColor.White;
            this.titleBackColor = types_ts_6.FixedColor.Black;
            this.border = 0;
            this.border = border;
            this.borderForeColor = borderForeColor;
            this.borderBackColor = borderBackColor;
            this.foreColor = foreColor;
            this.backColor = backColor;
            this.fillChar = fillChar;
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
              context.textColor(this.foreColor, this.backColor).fillChar(
                types_ts_6.FONT_SIZE,
                types_ts_6.FONT_SIZE,
                this.width - 2 * types_ts_6.FONT_SIZE,
                this.height - 2 * types_ts_6.FONT_SIZE,
                this.fillChar,
              );
              context.textColor(this.borderForeColor, this.borderBackColor)
                .textBorder(0, 0, this.width, this.height);
            } else {
              context.textColor(this.foreColor, this.backColor).fillChar(
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
                  (this.width - this.title.length * types_ts_6.FONT_SIZE) / 2,
                ),
                0,
              )
                .textColor(this.titleForeColor, this.titleBackColor)
                .text(this.title);
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
  [
    "engine/src/widgets/widget-container",
    "engine/src/widgets/box",
    "engine/src/types",
  ],
  function (exports_10, context_10) {
    "use strict";
    var widget_container_ts_2, box_ts_1, types_ts_7, SplitPanelContainerWidget;
    var __moduleName = context_10 && context_10.id;
    return {
      setters: [
        function (widget_container_ts_2_1) {
          widget_container_ts_2 = widget_container_ts_2_1;
        },
        function (box_ts_1_1) {
          box_ts_1 = box_ts_1_1;
        },
        function (types_ts_7_1) {
          types_ts_7 = types_ts_7_1;
        },
      ],
      execute: function () {
        SplitPanelContainerWidget = class SplitPanelContainerWidget
          extends widget_container_ts_2.BaseWidgetContainer {
          constructor(sl = null) {
            super();
            this.panel1 = new box_ts_1.BoxContainerWidget(types_ts_7.FONT_SIZE);
            this.panel2 = new box_ts_1.BoxContainerWidget(types_ts_7.FONT_SIZE);
            this.splitLayout = null;
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
  "engine/src/widgets/scrollable",
  ["engine/src/types", "engine/src/widgets/widget-container"],
  function (exports_11, context_11) {
    "use strict";
    var types_ts_8, widget_container_ts_3, ScrollableContainerWidget;
    var __moduleName = context_11 && context_11.id;
    return {
      setters: [
        function (types_ts_8_1) {
          types_ts_8 = types_ts_8_1;
        },
        function (widget_container_ts_3_1) {
          widget_container_ts_3 = widget_container_ts_3_1;
        },
      ],
      execute: function () {
        ScrollableContainerWidget = class ScrollableContainerWidget
          extends widget_container_ts_3.BaseWidgetContainer {
          constructor(
            foreColor = types_ts_8.FixedColor.White,
            backColor = types_ts_8.FixedColor.Black,
            fillChar = " ",
          ) {
            super();
            this._offsetX = 0;
            this._offsetY = 0;
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
            context.textColor(this.foreColor, this.backColor).fillChar(
              0,
              0,
              this.width,
              this.height,
              this.fillChar,
            );
          }
        };
        exports_11("ScrollableContainerWidget", ScrollableContainerWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/tile",
  ["engine/src/widgets/widget"],
  function (exports_12, context_12) {
    "use strict";
    var widget_ts_4, TileWidget;
    var __moduleName = context_12 && context_12.id;
    return {
      setters: [
        function (widget_ts_4_1) {
          widget_ts_4 = widget_ts_4_1;
        },
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
            context.tile(this.x, this.y, this.tile);
          }
        };
        exports_12("TileWidget", TileWidget);
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
    "engine/src/widgets/scrollable",
    "engine/src/widgets/tile",
  ],
  function (exports_13, context_13) {
    "use strict";
    var character_ts_1,
      label_ts_1,
      types_ts_9,
      split_panel_ts_1,
      scrollable_ts_1,
      tile_ts_1,
      NPCS_COUNT,
      MAP_SIZE,
      OBSTACLES_COUNT,
      mainUI,
      playingBox,
      cameraMode,
      p1,
      p2,
      npcs,
      npcsColors,
      characters,
      obtacleChars,
      obtacleColors,
      pendingInput,
      WALK_SPEED;
    var __moduleName = context_13 && context_13.id;
    function random(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function onInput(input) {
      pendingInput += input;
    }
    function initGame(engine) {
      engine.addWidget(mainUI);
      engine.onInput(onInput);
    }
    exports_13("initGame", initGame);
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
      if (pendingInput) {
        const uniqueChars = pendingInput.split("").map((c) => c.toLowerCase());
        uniqueChars.forEach((c) => {
          switch (c) {
            case "a":
              p1.x -= WALK_SPEED;
              break;
            case "d":
              p1.x += WALK_SPEED;
              break;
            case "w":
              p1.y -= WALK_SPEED;
              break;
            case "s":
              p1.y += WALK_SPEED;
              break;
            case "j":
              p2.x -= WALK_SPEED;
              break;
            case "l":
              p2.x += WALK_SPEED;
              break;
            case "i":
              p2.y -= WALK_SPEED;
              break;
            case "k":
              p2.y += WALK_SPEED;
              break;
            case String.fromCharCode(27): //Escape
              running = false;
              break;
            case "z":
              running = false;
              break;
            case "f":
              if (cameraMode === 0 /* FollowContinuous */) {
                cameraMode = 1 /* FollowDiscrete */;
              } else {
                cameraMode = 0 /* FollowContinuous */;
              }
              break;
          }
        });
        pendingInput = "";
      }
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        char.x = Math.max(
          Math.min(
            char.x,
            MAP_SIZE * types_ts_9.FONT_SIZE -
              char.width * types_ts_9.FONT_SIZE,
          ),
          0,
        );
        char.y = Math.max(
          Math.min(
            char.y,
            MAP_SIZE * types_ts_9.FONT_SIZE -
              char.height * types_ts_9.FONT_SIZE,
          ),
          0,
        );
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
            -(MAP_SIZE * types_ts_9.FONT_SIZE - playingBox.width),
          ),
        ),
        Math.trunc(
          Math.max(
            Math.min(newOffsetY, 0),
            -(MAP_SIZE * types_ts_9.FONT_SIZE - playingBox.height),
          ),
        ),
      );
      return running;
    }
    exports_13("updateGame", updateGame);
    return {
      setters: [
        function (character_ts_1_1) {
          character_ts_1 = character_ts_1_1;
        },
        function (label_ts_1_1) {
          label_ts_1 = label_ts_1_1;
        },
        function (types_ts_9_1) {
          types_ts_9 = types_ts_9_1;
        },
        function (split_panel_ts_1_1) {
          split_panel_ts_1 = split_panel_ts_1_1;
        },
        function (scrollable_ts_1_1) {
          scrollable_ts_1 = scrollable_ts_1_1;
        },
        function (tile_ts_1_1) {
          tile_ts_1 = tile_ts_1_1;
        },
      ],
      execute: function () {
        NPCS_COUNT = 2;
        MAP_SIZE = 512;
        OBSTACLES_COUNT = 512;
        exports_13(
          "mainUI",
          mainUI = new split_panel_ts_1.SplitPanelContainerWidget(),
        );
        mainUI.layout = {
          widthPercent: 100,
          heightPercent: 100,
        };
        mainUI.splitLayout = {
          direction: "horizontal",
          fixed: {
            panel: "panel2",
            amount: 19 * types_ts_9.FONT_SIZE,
          },
        };
        mainUI.panel2.border = 2 * types_ts_9.FONT_SIZE;
        mainUI.panel2.backColor = types_ts_9.FixedColor.BrightBlack;
        playingBox = new scrollable_ts_1.ScrollableContainerWidget();
        playingBox.setLayout({ heightPercent: 100, widthPercent: 100 });
        playingBox.setChildrenLayout({ type: "none" });
        playingBox.parent = mainUI.panel1;
        mainUI.panel1.title = " Map ";
        mainUI.panel1.titleForeColor = types_ts_9.FixedColor.BrightWhite;
        mainUI.panel1.titleBackColor = types_ts_9.rgb(
          51, /* I20 */
          0, /* I0 */
          51, /* I20 */
        );
        mainUI.panel1.borderForeColor = types_ts_9.rgb(
          153, /* I60 */
          0, /* I0 */
          153, /* I60 */
        );
        mainUI.panel1.borderBackColor = types_ts_9.rgb(
          51, /* I20 */
          0, /* I0 */
          51, /* I20 */
        );
        mainUI.panel1.backColor = types_ts_9.FixedColor.Black;
        mainUI.panel1.fillChar = "";
        mainUI.panel2.title = " Stats ";
        mainUI.panel2.titleForeColor = types_ts_9.FixedColor.BrightWhite;
        mainUI.panel2.titleBackColor = types_ts_9.rgb(
          0, /* I0 */
          51, /* I20 */
          102, /* I40 */
        );
        mainUI.panel2.borderForeColor = types_ts_9.rgb(
          0, /* I0 */
          0, /* I0 */
          153, /* I60 */
        );
        mainUI.panel2.borderBackColor = types_ts_9.rgb(
          0, /* I0 */
          51, /* I20 */
          102, /* I40 */
        );
        mainUI.panel2.backColor = types_ts_9.rgb(
          0, /* I0 */
          51, /* I20 */
          102, /* I40 */
        );
        mainUI.panel2.childrenLayout = {
          type: "vertical",
          spacing: 1 * types_ts_9.FONT_SIZE,
        };
        new label_ts_1.LabelWidget(
          "Move P1:\n  W/S/A/D\nMove P2:\n  I/J/K/L\nQuit: Z",
          types_ts_9.FixedColor.White,
          mainUI.panel2.backColor,
        ).parent = mainUI.panel2;
        cameraMode = 0 /* FollowContinuous */;
        p1 = new character_ts_1.CharacterWidget(
          "@",
          types_ts_9.FixedColor.BrightRed,
          types_ts_9.FixedColor.Transparent,
        );
        p1.x = 3 * types_ts_9.FONT_SIZE;
        p1.y = 3 * types_ts_9.FONT_SIZE;
        p2 = new character_ts_1.CharacterWidget(
          "@",
          types_ts_9.FixedColor.BrightBlue,
          types_ts_9.FixedColor.Transparent,
        );
        p2.x = 13 * types_ts_9.FONT_SIZE;
        p2.y = 3 * types_ts_9.FONT_SIZE;
        npcs = [];
        npcsColors = [
          types_ts_9.FixedColor.Green,
          types_ts_9.FixedColor.Yellow,
          types_ts_9.FixedColor.Cyan,
        ];
        for (let i = 0; i < NPCS_COUNT; i++) {
          npcs.push(
            new character_ts_1.CharacterWidget(
              "@",
              npcsColors[i % npcsColors.length],
              types_ts_9.FixedColor.Transparent,
            ),
          );
        }
        characters = [
          ...npcs,
          p1,
          p2,
        ];
        obtacleChars = ["."];
        obtacleColors = [
          types_ts_9.rgb(0, /* I0 */ 51, /* I20 */ 0 /* I0 */),
          types_ts_9.rgb(0, /* I0 */ 102, /* I40 */ 0 /* I0 */),
          types_ts_9.rgb(0, /* I0 */ 153, /* I60 */ 0 /* I0 */),
          types_ts_9.rgb(0, /* I0 */ 204, /* I80 */ 0 /* I0 */),
        ];
        /*for (let i = 0; i < 255; i++) {
              const obstacle = new TileWidget(
                {
                  tilemap: "floor",
                  index: i,
                },
              );
              obstacle.x = i % 21;
              obstacle.y = Math.floor(i / 21);
              obstacle.parent = playingBox;
            }*/
        for (let x = 0; x < 128; x++) {
          for (let y = 0; y < 128; y++) {
            const obstacle = new tile_ts_1.TileWidget({
              tilemap: "floor",
              index: (7 + 6) * 21 + 1,
              width: types_ts_9.FONT_SIZE,
              height: types_ts_9.FONT_SIZE,
            });
            obstacle.x = x * types_ts_9.FONT_SIZE;
            obstacle.y = y * types_ts_9.FONT_SIZE;
            obstacle.parent = playingBox;
          }
        }
        for (let i = 0; i < OBSTACLES_COUNT; i++) {
          const obstacle = new character_ts_1.CharacterWidget(
            random(obtacleChars),
            random(obtacleColors),
            types_ts_9.FixedColor.Transparent,
          );
          obstacle.x = Math.floor(Math.random() * MAP_SIZE) *
            types_ts_9.FONT_SIZE;
          obstacle.y = Math.floor(Math.random() * MAP_SIZE) *
            types_ts_9.FONT_SIZE;
          obstacle.parent = playingBox;
        }
        characters.forEach((c) => c.parent = playingBox);
        pendingInput = "";
        WALK_SPEED = 4;
      },
    };
  },
);
System.register(
  "web/src/native/tileset",
  [],
  function (exports_14, context_14) {
    "use strict";
    var tilesets;
    var __moduleName = context_14 && context_14.id;
    async function loadImage(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });
    }
    async function initTilesets() {
      const map = new Map();
      for (var kv of tilesets) {
        const id = kv[0];
        const tileset = kv[1];
        const image = await loadImage(tileset.data);
        console.log("tileset dimensions:" + image.width + "," + image.height);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const pixels = [];
        for (let y = 0; y < image.height / tileset.dimensions.width; y++) {
          for (let x = 0; x < image.width / tileset.dimensions.height; x++) {
            const pxs =
              ctx.getImageData(
                x * tileset.dimensions.width,
                y * tileset.dimensions.height,
                tileset.dimensions.width,
                tileset.dimensions.height,
              ).data;
            const pxs32 = new Uint32Array(pxs.buffer);
            if (tileset.type === "blackandwhite") {
              for (let i = 0; i < pxs32.length; i++) {
                pxs32[i] = ((pxs32[i] & 0xFFFFFF) === 0) ? 0 : 1;
              }
            }
            pixels.push(pxs32);
          }
        }
        map.set(id, {
          type: tileset.type,
          pixels,
          dimensions: tileset.dimensions,
        });
      }
      return map;
    }
    exports_14("initTilesets", initTilesets);
    return {
      setters: [],
      execute: function () {
        tilesets = new Map([
          [
            "floor",
            {
              type: "color",
              data:
                "data:image/png;base64,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",
              dimensions: { width: 16, height: 16 },
            },
          ],
          [
            "font16x16",
            {
              type: "blackandwhite",
              data:
                "data:image/png;base64,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",
              dimensions: { width: 16, height: 16 },
            },
          ],
        ]);
      },
    };
  },
);
System.register(
  "web/src/native/web",
  ["engine/src/types", "web/src/native/tileset"],
  function (exports_15, context_15) {
    "use strict";
    var types_ts_10, tileset_ts_1, SCALE;
    var __moduleName = context_15 && context_15.id;
    function updateCanvasSize(canvas, width, height) {
      canvas.width = Math.floor(width / SCALE);
      canvas.height = Math.floor(height / SCALE);
      if (SCALE !== 1) {
        canvas.setAttribute(
          "style",
          "width: " + canvas.width * SCALE + "px;" +
            "height: " + canvas.height * SCALE + "px;" +
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
      const screenSize = new types_ts_10.Size(256, 256);
      let tilesets;
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let imageDataPixels = imageData.data;
      let imageDataPixels32 = new Uint32Array(imageDataPixels.buffer);
      const colorsRGB = new Uint32Array(2);
      let dirty = true;
      ctx.imageSmoothingEnabled = false;
      let screenSizeChangedListeners = [];
      let inputListeners = [];
      const updateScreenSize = () => {
        screenSize.set(canvas.width, canvas.height);
      };
      const handleKeyDown = (e) => {
        const key = e.key;
        if (key.length === 1) {
          inputListeners.forEach((l) => l(key));
        }
      };
      const handleMouseDown = (e) => {
        const dx = (e.clientX < window.innerWidth / 3)
          ? -1
          : (e.clientX > window.innerWidth * 2 / 3)
          ? 1
          : 0;
        const dy = (e.clientY < window.innerHeight / 3)
          ? -1
          : (e.clientY > window.innerHeight * 2 / 3)
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
          inputListeners.forEach((l) => l(key));
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
      const tintTile = (t, foreColor, backColor, x, y) => {
        dirty = true;
        if (t.index < 0 || t.index > 255) {
          return;
        }
        colorsRGB[1] = foreColor;
        colorsRGB[0] = backColor;
        const tileset = tilesets.get(t.tilemap);
        if (tileset === undefined) {
          return;
        }
        const tilePixels = tileset.pixels[t.index];
        const tileWidth = tileset.dimensions.width;
        const tileHeight = tileset.dimensions.height;
        const fx = x;
        const fy = y;
        const backTransparent = (backColor >> 24) == 0;
        let p = 0;
        let f = 0;
        if (backTransparent) {
          for (let py = 0; py < tileHeight; py++) {
            p = (fy + py) * imageData.width + fx;
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
            p = (fy + py) * imageData.width + fx;
            f = py * tileWidth;
            for (let px = 0; px < tileWidth; px++) {
              imageDataPixels32[p++] = colorsRGB[tilePixels[f++]];
            }
          }
        }
      };
      const tintTileClip = (
        t,
        foreColor,
        backColor,
        x,
        y,
        cfx,
        cfy,
        ctx,
        cty,
      ) => {
        dirty = true;
        if (t.index < 0 || t.index > 255) {
          return;
        }
        colorsRGB[1] = foreColor;
        colorsRGB[0] = backColor;
        const tileset = tilesets.get(t.tilemap);
        if (tileset === undefined) {
          return;
        }
        const tilePixels = tileset.pixels[t.index];
        const tileWidth = tileset.dimensions.width;
        const tileHeight = tileset.dimensions.height;
        const backTransparent = (backColor >> 24) == 0;
        let p = 0;
        let f = 0;
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
      };
      const setTile = (t, x, y) => {
        dirty = true;
        const tileset = tilesets.get(t.tilemap);
        if (tileset === undefined) {
          return;
        }
        const tilePixels = tileset.pixels[t.index];
        const tileWidth = tileset.dimensions.width;
        const tileHeight = tileset.dimensions.height;
        const fx = x;
        const fy = y;
        let p = 0;
        let f = 0;
        for (let py = 0; py < tileHeight; py++) {
          p = (fy + py) * imageData.width + fx;
          f = py * tileWidth;
          for (let px = 0; px < tileWidth; px++) {
            imageDataPixels32[p++] = tilePixels[f++];
          }
        }
      };
      const setTileClip = (t, x, y, cfx, cfy, ctx, cty) => {
        dirty = true;
        const tileset = tilesets.get(t.tilemap);
        if (tileset === undefined) {
          return;
        }
        const tilePixels = tileset.pixels[t.index];
        const tileWidth = tileset.dimensions.width;
        const tileHeight = tileset.dimensions.height;
        let p = 0;
        let f = 0;
        for (let py = 0; py < tileHeight; py++) {
          p = (y + py) * imageData.width + x;
          f = py * tileWidth;
          for (let px = 0; px < tileWidth; px++) {
            if (px >= cfx && px < ctx && py >= cfy && py < cty) {
              imageDataPixels32[p++] = tilePixels[f++];
            } else {
              p++;
              f++;
            }
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
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
          tintTileClip,
          setTile,
          setTileClip,
          beginDraw: () => {},
          endDraw: () => {
            if (dirty) {
              ctx.putImageData(imageData, 0, 0);
              dirty = false;
            }
          },
        },
        input: {
          onInput: (listener) => {
            inputListeners.push(listener);
          },
        },
        init: async () => {
          tilesets = await tileset_ts_1.initTilesets();
          updateScreenSize();
        },
        destroy: () => {},
      };
    }
    exports_15("getWebNativeContext", getWebNativeContext);
    return {
      setters: [
        function (types_ts_10_1) {
          types_ts_10 = types_ts_10_1;
        },
        function (tileset_ts_1_1) {
          tileset_ts_1 = tileset_ts_1_1;
        },
      ],
      execute: function () {
        SCALE = 1;
      },
    };
  },
);
System.register(
  "web/src/main",
  [
    "engine/src/types",
    "engine/src/engine",
    "engine/src/widgets/label",
    "game/src/game",
    "web/src/native/web",
  ],
  function (exports_16, context_16) {
    "use strict";
    var types_ts_11,
      engine_ts_1,
      label_ts_2,
      game_ts_1,
      web_ts_1,
      TARGET_FPS,
      engine,
      fpsLabel,
      totalRenderTime,
      frames,
      framesTime,
      nextUpdateTime;
    var __moduleName = context_16 && context_16.id;
    function updateFps() {
      const now = performance.now();
      frames++;
      if (now - framesTime > 1000) {
        const fps = frames / ((now - framesTime) / 1000);
        const stats = "FPS: " + fps.toFixed(2) + "\nRender: " +
          (totalRenderTime / frames).toFixed(2) + "ms";
        fpsLabel.text = stats;
        framesTime = now;
        frames = 0;
        totalRenderTime = 0;
      }
    }
    async function init() {
      console.log("Initializing Engine");
      engine = await engine_ts_1.buildEngine(web_ts_1.getWebNativeContext());
      console.log("Engine Initialized");
      game_ts_1.initGame(engine);
      console.log("Game Initialized");
      fpsLabel = new label_ts_2.LabelWidget(
        "FPS: 0.00\nRender: 0.00ms",
        types_ts_11.FixedColor.White,
        game_ts_1.mainUI.panel2.backColor,
      );
      fpsLabel.parent = game_ts_1.mainUI.panel2;
      return engine;
    }
    function update() {
      const start = performance.now();
      if (start < nextUpdateTime) {
        return;
      }
      updateFps();
      engine.update();
      game_ts_1.updateGame(engine);
      engine.draw();
      const end = performance.now();
      const renderTime = end - start;
      totalRenderTime += renderTime;
      nextUpdateTime = start + Math.max(10, 1000 / TARGET_FPS - (end - start));
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
        function (types_ts_11_1) {
          types_ts_11 = types_ts_11_1;
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
      ],
      execute: function () {
        TARGET_FPS = 30;
        totalRenderTime = 0;
        frames = 0;
        framesTime = performance.now();
        nextUpdateTime = 0;
        nextUpdateTime = performance.now() + 1000 / TARGET_FPS;
        run();
      },
    };
  },
);

__instantiate("web/src/main");
