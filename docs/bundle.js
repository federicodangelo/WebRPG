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

System.register(
  "engine/src/widgets/widget",
  ["engine/src/types"],
  function (exports_1, context_1) {
    "use strict";
    var types_ts_1, BaseWidget;
    var __moduleName = context_1 && context_1.id;
    return {
      setters: [
        function (types_ts_1_1) {
          types_ts_1 = types_ts_1_1;
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
            this._layer = 0;
            this._parent = null;
            this._engine = null;
            this._boundingBox = new types_ts_1.Rect();
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
        exports_1("BaseWidget", BaseWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/widget-container",
  ["engine/src/widgets/widget"],
  function (exports_2, context_2) {
    "use strict";
    var widget_ts_1, BaseWidgetContainer;
    var __moduleName = context_2 && context_2.id;
    return {
      setters: [
        function (widget_ts_1_1) {
          widget_ts_1 = widget_ts_1_1;
        },
      ],
      execute: function () {
        BaseWidgetContainer = class BaseWidgetContainer
          extends widget_ts_1.BaseWidget {
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
        exports_2("BaseWidgetContainer", BaseWidgetContainer);
      },
    };
  },
);
System.register(
  "engine/src/widgets/scrollable",
  ["engine/src/types", "engine/src/widgets/widget-container"],
  function (exports_3, context_3) {
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
        },
      ],
      execute: function () {
        ScrollableContainerWidget = class ScrollableContainerWidget
          extends widget_container_ts_1.BaseWidgetContainer {
          constructor() {
            super(...arguments);
            this.backColor = types_ts_2.FixedColor.Black;
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
              if (invalidate) {
                this.invalidate();
              }
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
      },
    };
  },
);
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
        clone() {
          return new Rect(this.x, this.y, this.width, this.height);
        }
      };
      exports_4("Rect", Rect);
    },
  };
});
System.register("engine/src/native-types", [], function (exports_5, context_5) {
  "use strict";
  var __moduleName = context_5 && context_5.id;
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register(
  "engine/src/context",
  ["engine/src/types"],
  function (exports_6, context_6) {
    "use strict";
    var types_ts_3, useCp437, AnsiSpecialChar, EngineContextImpl;
    var __moduleName = context_6 && context_6.id;
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
        function (types_ts_3_1) {
          types_ts_3 = types_ts_3_1;
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
            this.bounds = new types_ts_3.Rect();
            this.clip = new types_ts_3.Rect();
            this.tx = 0;
            this.ty = 0;
            this.x = 0;
            this.y = 0;
            this.foreColor = types_ts_3.FixedColor.White;
            this.backColor = types_ts_3.FixedColor.Black;
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
            this.transformsStack.push(new types_ts_3.Point(this.tx, this.ty));
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
            this.foreColor = types_ts_3.FixedColor.White;
            this.backColor = types_ts_3.FixedColor.Black;
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
          tilemap(x, y, tilemap, indexes) {
            const tileWidth = tilemap.tileWidth;
            const tileHeight = tilemap.tileHeight;
            const clip = this.clip;
            const tx = this.tx;
            const ty = this.ty;
            if (indexes.length == 0) {
              return this;
            }
            const height = indexes.length * tileHeight;
            const width = indexes[0].length * tileWidth;
            const rtx = tx + x;
            const rty = ty + y;
            const x0 = Math.max(
              tx + x,
              floorToMultipleOf(clip.x - rtx, tileWidth) + rtx,
            );
            const y0 = Math.max(
              ty + y,
              floorToMultipleOf(clip.y - rty, tileHeight) + rty,
            );
            const x1 = Math.min(
              tx + x + width,
              ceilToMultipleOf(clip.x1 - rtx, tileWidth) + rtx,
            );
            const y1 = Math.min(
              ty + y + height,
              ceilToMultipleOf(clip.y1 - rty, tileHeight) + rty,
            );
            if (x1 <= x0 || y1 <= y0) {
              return this;
            }
            const tiles = tilemap.tiles;
            for (let screenY = y0; screenY < y1; screenY += tileHeight) {
              const tileY = Math.trunc((screenY - y - ty) / tileHeight);
              const row = indexes[tileY];
              let tileX = Math.trunc((x0 - x - tx) / tileWidth);
              for (
                let screenX = x0; screenX < x1; screenX += tileWidth, tileX++
              ) {
                const tileIndex = row[tileX];
                if (tileIndex >= 0) {
                  const cfx = Math.max(clip.x - screenX, 0);
                  const cfy = Math.max(clip.y - screenY, 0);
                  const ctx = Math.min(clip.x1 - screenX, tileWidth);
                  const cty = Math.min(clip.y1 - screenY, tileHeight);
                  this.nativeContext.setTile(
                    tiles[tileIndex],
                    screenX,
                    screenY,
                    cfx,
                    cfy,
                    ctx,
                    cty,
                  );
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
        exports_6("EngineContextImpl", EngineContextImpl);
      },
    };
  },
);
System.register(
  "engine/src/engine",
  ["engine/src/types", "engine/src/context"],
  function (exports_7, context_7) {
    "use strict";
    var types_ts_4, context_ts_1, EngineImpl;
    var __moduleName = context_7 && context_7.id;
    async function buildEngine(nativeContext) {
      const engine = new EngineImpl(nativeContext);
      await engine.init();
      return engine;
    }
    exports_7("buildEngine", buildEngine);
    function destroyEngine(engine) {
      engine.destroy();
    }
    exports_7("destroyEngine", destroyEngine);
    return {
      setters: [
        function (types_ts_4_1) {
          types_ts_4 = types_ts_4_1;
        },
        function (context_ts_1_1) {
          context_ts_1 = context_ts_1_1;
        },
      ],
      execute: function () {
        EngineImpl = class EngineImpl {
          constructor(nativeContext) {
            this.children = [];
            this.screenSize = new types_ts_4.Size();
            this.invalidRects = [];
            this.mainScrollable = null;
            this.mainScrollableOffset = new types_ts_4.Point();
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
                new types_ts_4.Rect(
                  0,
                  0,
                  this.screenSize.width,
                  this.screenSize.height,
                ),
              );
            }
          }
          drawInvalidRects() {
            if (this.invalidRects.length == 0) {
              return;
            }
            var pendingLayout = true;
            const clip = new types_ts_4.Rect();
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
          draw() {
            this.context.beginDraw();
            this.drawInvalidRects();
            if (this.mainScrollable !== null) {
              const dx = this.mainScrollableOffset.x -
                this.mainScrollable.offsetX;
              const dy = this.mainScrollableOffset.y -
                this.mainScrollable.offsetY;
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
                      new types_ts_4.Rect(bbox.x, bbox.y, bbox.width, dy),
                    );
                  } else if (dy < 0) {
                    this.invalidRects.push(
                      new types_ts_4.Rect(
                        bbox.x,
                        bbox.y + bbox.height + dy,
                        bbox.width,
                        -dy,
                      ),
                    );
                  }
                  if (dx > 0) {
                    this.invalidRects.push(
                      new types_ts_4.Rect(bbox.x, bbox.y, dx, bbox.height),
                    );
                  } else if (dx < 0) {
                    this.invalidRects.push(
                      new types_ts_4.Rect(
                        bbox.x + bbox.width + dx,
                        bbox.y,
                        -dx,
                        bbox.height,
                      ),
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
          setMainScrollable(scrollable) {
            this.mainScrollable = scrollable;
          }
          setMainScroll(offsetX, offsetY) {
            this.mainScrollableOffset.x = offsetX;
            this.mainScrollableOffset.y = offsetY;
          }
        };
      },
    };
  },
);
System.register(
  "engine/src/widgets/label",
  ["engine/src/widgets/widget"],
  function (exports_8, context_8) {
    "use strict";
    var widget_ts_2, LabelWidget;
    var __moduleName = context_8 && context_8.id;
    return {
      setters: [
        function (widget_ts_2_1) {
          widget_ts_2 = widget_ts_2_1;
        },
      ],
      execute: function () {
        LabelWidget = class LabelWidget extends widget_ts_2.BaseWidget {
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
        exports_8("LabelWidget", LabelWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/group",
  ["engine/src/widgets/widget-container"],
  function (exports_9, context_9) {
    "use strict";
    var widget_container_ts_2, GroupContainerWidget;
    var __moduleName = context_9 && context_9.id;
    return {
      setters: [
        function (widget_container_ts_2_1) {
          widget_container_ts_2 = widget_container_ts_2_1;
        },
      ],
      execute: function () {
        GroupContainerWidget = class GroupContainerWidget
          extends widget_container_ts_2.BaseWidgetContainer {
          drawSelf() {}
        };
        exports_9("GroupContainerWidget", GroupContainerWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/animated-tile",
  ["engine/src/widgets/widget"],
  function (exports_10, context_10) {
    "use strict";
    var widget_ts_3, AnimatedTileWidget;
    var __moduleName = context_10 && context_10.id;
    return {
      setters: [
        function (widget_ts_3_1) {
          widget_ts_3 = widget_ts_3_1;
        },
      ],
      execute: function () {
        AnimatedTileWidget = class AnimatedTileWidget
          extends widget_ts_3.BaseWidget {
          constructor(animation) {
            super();
            this.tile = null;
            this.frame = 0;
            this.lastTimeoutCB = -1;
            this.animationFinishedCb = null;
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
            const newTile = this.animation.loops
              ? animation.tiles[this.frame % animation.tiles.length]
              : animation.tiles[
                this.frame < animation.tiles.length
                  ? this.frame
                  : animation.tiles.length - 1
              ];
            if (
              !this.animation.loops &&
              this.frame === animation.tiles.length &&
              this.animationFinishedCb !== null
            ) {
              this.animationFinishedCb();
            }
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
        exports_10("AnimatedTileWidget", AnimatedTileWidget);
      },
    };
  },
);
System.register(
  "game/src/avatar",
  ["engine/src/widgets/group", "engine/src/widgets/animated-tile"],
  function (exports_11, context_11) {
    "use strict";
    var group_ts_1, animated_tile_ts_1, WALK_SPEED, Avatar;
    var __moduleName = context_11 && context_11.id;
    return {
      setters: [
        function (group_ts_1_1) {
          group_ts_1 = group_ts_1_1;
        },
        function (animated_tile_ts_1_1) {
          animated_tile_ts_1 = animated_tile_ts_1_1;
        },
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
            this.avatarAnimations = new animated_tile_ts_1.AnimatedTileWidget(
              assets.getAnimation(avatarId + "-" + this.direction),
            );
            this.shadowAnimations = new animated_tile_ts_1.AnimatedTileWidget(
              assets.getAnimation("shadows-down"),
            );
            this.avatarAnimations.animationFinishedCb = () =>
              this.onAnimationFinished();
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
            this.avatarAnimations.setAnimation(
              this.assets.getAnimation(
                this.avatarId + "-" + this.direction +
                  (this.action
                    ? "-" + this.action
                    : ""),
              ),
            );
            this.shadowAnimations.setAnimation(
              this.assets.getAnimation(
                "shadows" + "-" + this.direction +
                  (this.action
                    ? "-" + this.action
                    : ""),
              ),
            );
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
            } else if (dx > 0) {
              this.setDirection("right");
            } else if (dy < 0) {
              this.setDirection("up");
            } else if (dy > 0) {
              this.setDirection("down");
            }
            if (dx !== 0 || dy !== 0) {
              this.setAction("walking");
            } else if (this.blockingAction) {
              this.setAction(this.nextAction);
            } else {
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
          update() {
            this.updateAnimations();
          }
        };
        exports_11("Avatar", Avatar);
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
            context.tile(0, 0, this.tile);
          }
        };
        exports_12("TileWidget", TileWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/tilemap",
  ["engine/src/widgets/widget"],
  function (exports_13, context_13) {
    "use strict";
    var widget_ts_5, TilemapWidget;
    var __moduleName = context_13 && context_13.id;
    return {
      setters: [
        function (widget_ts_5_1) {
          widget_ts_5 = widget_ts_5_1;
        },
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
          drawSelf(context) {
            const tilemap = this.tilemap;
            const tiles = this.tiles;
            //Draw tilemap
            context.tilemap(0, 0, tilemap, tiles);
          }
        };
        exports_13("TilemapWidget", TilemapWidget);
      },
    };
  },
);
System.register(
  "engine/src/widgets/tiles-container",
  ["engine/src/types", "engine/src/widgets/scrollable"],
  function (exports_14, context_14) {
    "use strict";
    var types_ts_5, scrollable_ts_1, ScrollableTilesContainerWidget;
    var __moduleName = context_14 && context_14.id;
    function compareChildren(c1, c2) {
      if (c1.layer === c2.layer) {
        return c1.visibleY - c2.visibleY;
      }
      return c1.layer - c2.layer;
    }
    return {
      setters: [
        function (types_ts_5_1) {
          types_ts_5 = types_ts_5_1;
        },
        function (scrollable_ts_1_1) {
          scrollable_ts_1 = scrollable_ts_1_1;
        },
      ],
      execute: function () {
        ScrollableTilesContainerWidget = class ScrollableTilesContainerWidget
          extends scrollable_ts_1.ScrollableContainerWidget {
          constructor() {
            super(...arguments);
            this.tilemaps = [];
            this.tilemapsBounds = new types_ts_5.Rect();
          }
          addTilemap(tilemap) {
            tilemap.parent = this;
            this.tilemaps.push(tilemap);
            this.tilemapsBounds.union(
              new types_ts_5.Rect(0, 0, tilemap.width, tilemap.height),
            );
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
              const prevOk = idx == 0 ||
                compareChildren(children[idx - 1], child) <= 0;
              const nextOk = idx == children.length - 1 ||
                compareChildren(children[idx + 1], child) >= 0;
              if (!prevOk) {
                while (
                  idx > 0 && compareChildren(children[idx - 1], child) > 0
                ) {
                  const tmp = children[idx - 1];
                  children[idx - 1] = children[idx];
                  children[idx] = tmp;
                  idx--;
                }
              } else if (!nextOk) {
                while (
                  idx < children.length - 1 &&
                  compareChildren(children[idx + 1], child) < 0
                ) {
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
            if (
              this.tilemapsBounds.width > 0 && this.tilemapsBounds.height > 0
            ) {
              const tilemapHeight = this.tilemapsBounds.height;
              const tilemapWidth = this.tilemapsBounds.width;
              const FAR_FAR_AWAY = 9999999;
              //Top
              context.fillRect(
                this.innerX - FAR_FAR_AWAY,
                this.innerY - FAR_FAR_AWAY,
                FAR_FAR_AWAY + tilemapWidth + FAR_FAR_AWAY,
                FAR_FAR_AWAY,
                this.backColor,
              );
              //Bottom
              context.fillRect(
                this.innerX - FAR_FAR_AWAY,
                this.innerY + tilemapHeight,
                FAR_FAR_AWAY + tilemapWidth + FAR_FAR_AWAY,
                FAR_FAR_AWAY,
                this.backColor,
              );
              //Left
              context.fillRect(
                this.innerX - FAR_FAR_AWAY,
                this.innerY,
                FAR_FAR_AWAY,
                tilemapHeight,
                this.backColor,
              );
              //Right
              context.fillRect(
                this.innerX + tilemapWidth,
                this.innerY,
                FAR_FAR_AWAY,
                tilemapHeight,
                this.backColor,
              );
            } else {
              super.drawSelf(context);
            }
          }
        };
        exports_14(
          "ScrollableTilesContainerWidget",
          ScrollableTilesContainerWidget,
        );
      },
    };
  },
);
System.register("game/src/random", [], function (exports_15, context_15) {
  "use strict";
  var __moduleName = context_15 && context_15.id;
  function random(arr) {
    return arr[Math.trunc(Math.random() * arr.length)];
  }
  exports_15("random", random);
  function randomIntervalInt(min, max) {
    return Math.trunc(min) + Math.trunc(Math.random() * (max - min));
  }
  exports_15("randomIntervalInt", randomIntervalInt);
  function randomDirection() {
    return Math.round(Math.random() * 2 - 1);
  }
  exports_15("randomDirection", randomDirection);
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register(
  "game/src/map",
  [
    "engine/src/types",
    "engine/src/widgets/tile",
    "engine/src/widgets/tilemap",
    "game/src/random",
  ],
  function (exports_16, context_16) {
    "use strict";
    var types_ts_6,
      tile_ts_1,
      tilemap_ts_1,
      random_ts_1,
      MAP_SIZE,
      DECOS_COUNT,
      ALT_TERRAINS_COUNT,
      ALT_TERRAINS_MIN_SIZE,
      ALT_TERRAINS_MAX_SIZE,
      mainTerrain,
      altTerrains;
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
      const floor = new tilemap_ts_1.TilemapWidget(
        floorTilemap,
        MAP_SIZE,
        MAP_SIZE,
        0,
      );
      const floor2 = new tilemap_ts_1.TilemapWidget(
        floorTilemap,
        MAP_SIZE,
        MAP_SIZE,
        -1,
      );
      floor.layer = -3;
      floor2.layer = -2;
      const floorTiles = floor.tiles;
      tilesContainer.addTilemap(floor);
      tilesContainer.addTilemap(floor2);
      const setFloor2Tile = (x, y, id) => {
        floor2.tiles[y][x] = floor2.tilemap.getTile(id).index;
      };
      const addTile = (x, y, id) => {
        const t = new tile_ts_1.TileWidget(assets.getTile(id));
        t.layer = -1;
        t.x = x * t.tile.width;
        t.y = y * t.tile.height;
        t.parent = tilesContainer;
      };
      const getTerrainId = (x, y) => {
        return floorTilemap.tiles[floorTiles[y][x]].id.split("-")[0];
      };
      for (let y = 0; y < MAP_SIZE; y++) {
        const row = floorTiles[y];
        for (let x = 0; x < MAP_SIZE; x++) {
          row[x] = floorTilemap.getTile(randomCenterTile(mainTerrain)).index;
        }
      }
      const addAltTerrain = (terrainId, fx, fy, w, h) => {
        const tx = fx + w;
        const ty = fy + h;
        for (let y = fy; y < ty; y++) {
          for (let x = fx; x < tx; x++) {
            floorTiles[y][x] =
              floorTilemap.getTile(randomCenterTile(terrainId)).index;
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
        const w = random_ts_1.randomIntervalInt(
          ALT_TERRAINS_MIN_SIZE,
          ALT_TERRAINS_MAX_SIZE,
        );
        const h = random_ts_1.randomIntervalInt(
          ALT_TERRAINS_MIN_SIZE,
          ALT_TERRAINS_MAX_SIZE,
        );
        const terrainId = random_ts_1.random(altTerrains);
        const fx = random_ts_1.randomIntervalInt(1, MAP_SIZE - w - 1);
        const fy = random_ts_1.randomIntervalInt(1, MAP_SIZE - h - 1);
        const r = new types_ts_6.Rect(fx, fy, w, h);
        if (altTerrainsRectsOverflow.some((a) => a.intersects(r))) {
          continue;
        }
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
        if (
          altTerrainsRects.some((a) =>
            x == a.x || x == a.x1 || y == a.y || y == a.y1
          )
        ) {
          continue;
        }
        addTile(x, y, "terrain." + randomDecoTile(getTerrainId(x, y)));
      }
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
        },
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
      },
    };
  },
);
System.register(
  "game/src/npc",
  ["game/src/avatar", "game/src/random"],
  function (exports_17, context_17) {
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
        },
      ],
      execute: function () {
        Npc = class Npc extends avatar_ts_1.Avatar {
          constructor() {
            super(...arguments);
            this.dx = 0;
            this.dy = 0;
            this.steps = 0;
          }
          update() {
            if (this.steps <= 0) {
              this.dx = random_ts_2.randomDirection();
              this.dy = random_ts_2.randomDirection();
              this.steps = random_ts_2.randomIntervalInt(60, 120);
            }
            this.move(this.dx, this.dy);
            this.steps--;
            super.update();
          }
        };
        exports_17("Npc", Npc);
      },
    };
  },
);
System.register(
  "engine/src/widgets/box",
  ["engine/src/types", "engine/src/widgets/widget-container"],
  function (exports_18, context_18) {
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
        },
      ],
      execute: function () {
        BoxContainerWidget = class BoxContainerWidget
          extends widget_container_ts_3.BaseWidgetContainer {
          constructor(
            font,
            border = font.tileWidth,
            borderForeColor = types_ts_7.FixedColor.White,
            borderBackColor = types_ts_7.FixedColor.Black,
            foreColor = types_ts_7.FixedColor.White,
            backColor = types_ts_7.FixedColor.Black,
            fillChar = " ",
          ) {
            super();
            this.title = "";
            this.titleForeColor = types_ts_7.FixedColor.White;
            this.titleBackColor = types_ts_7.FixedColor.Black;
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
        exports_18("BoxContainerWidget", BoxContainerWidget);
      },
    };
  },
);
System.register("game/src/types", [], function (exports_19, context_19) {
  "use strict";
  var __moduleName = context_19 && context_19.id;
  return {
    setters: [],
    execute: function () {
    },
  };
});
System.register("game/src/utils", [], function (exports_20, context_20) {
  "use strict";
  var __moduleName = context_20 && context_20.id;
  function followAvatar(avatar, map, engine) {
    let newOffsetX = -avatar.x + Math.floor(map.width * 0.5);
    let newOffsetY = -avatar.y + Math.floor(map.height * 0.5);
    engine.setMainScroll(
      Math.trunc(
        Math.max(
          Math.min(newOffsetX, 0),
          -(map.tilemapsBounds.width - map.width),
        ),
      ),
      Math.trunc(
        Math.max(
          Math.min(newOffsetY, 0),
          -(map.tilemapsBounds.height - map.height),
        ),
      ),
    );
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
    },
  };
});
System.register(
  "engine/src/widgets/split-panel",
  ["engine/src/widgets/widget-container", "engine/src/widgets/box"],
  function (exports_21, context_21) {
    "use strict";
    var widget_container_ts_4, box_ts_1, SplitPanelContainerWidget;
    var __moduleName = context_21 && context_21.id;
    return {
      setters: [
        function (widget_container_ts_4_1) {
          widget_container_ts_4 = widget_container_ts_4_1;
        },
        function (box_ts_1_1) {
          box_ts_1 = box_ts_1_1;
        },
      ],
      execute: function () {
        SplitPanelContainerWidget = class SplitPanelContainerWidget
          extends widget_container_ts_4.BaseWidgetContainer {
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
        exports_21("SplitPanelContainerWidget", SplitPanelContainerWidget);
      },
    };
  },
);
System.register(
  "game/src/ui",
  [
    "engine/src/widgets/label",
    "engine/src/types",
    "engine/src/widgets/split-panel",
    "engine/src/widgets/tiles-container",
  ],
  function (exports_22, context_22) {
    "use strict";
    var label_ts_1, types_ts_8, split_panel_ts_1, tiles_container_ts_1;
    var __moduleName = context_22 && context_22.id;
    function initUI(engine, assets) {
      const font = assets.defaultFont;
      const mainUI = new split_panel_ts_1.SplitPanelContainerWidget(font);
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
      mainUI.panel2.backColor = types_ts_8.FixedColor.BrightBlack;
      const map = new tiles_container_ts_1.ScrollableTilesContainerWidget();
      map.setLayout({ heightPercent: 100, widthPercent: 100 });
      map.setChildrenLayout({ type: "none" });
      map.parent = mainUI.panel1;
      mainUI.panel1.title = " Map ";
      mainUI.panel1.titleForeColor = types_ts_8.FixedColor.BrightWhite;
      mainUI.panel1.titleBackColor = types_ts_8.rgb(
        51, /* I20 */
        0, /* I0 */
        51, /* I20 */
      );
      mainUI.panel1.borderForeColor = types_ts_8.rgb(
        153, /* I60 */
        0, /* I0 */
        153, /* I60 */
      );
      mainUI.panel1.borderBackColor = types_ts_8.rgb(
        51, /* I20 */
        0, /* I0 */
        51, /* I20 */
      );
      mainUI.panel1.backColor = types_ts_8.FixedColor.Black;
      mainUI.panel1.fillChar = "";
      mainUI.panel2.title = " Stats ";
      mainUI.panel2.titleForeColor = types_ts_8.FixedColor.BrightWhite;
      mainUI.panel2.titleBackColor = types_ts_8.rgb(
        0, /* I0 */
        51, /* I20 */
        102, /* I40 */
      );
      mainUI.panel2.borderForeColor = types_ts_8.rgb(
        0, /* I0 */
        0, /* I0 */
        153, /* I60 */
      );
      mainUI.panel2.borderBackColor = types_ts_8.rgb(
        0, /* I0 */
        51, /* I20 */
        102, /* I40 */
      );
      mainUI.panel2.backColor = types_ts_8.rgb(
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
        "Move P1:\n  W/S/A/D\nMove P2:\n  I/J/K/L",
        types_ts_8.FixedColor.White,
        mainUI.panel2.backColor,
      ).parent = mainUI.panel2;
      return { mainUI, map };
    }
    exports_22("initUI", initUI);
    return {
      setters: [
        function (label_ts_1_1) {
          label_ts_1 = label_ts_1_1;
        },
        function (types_ts_8_1) {
          types_ts_8 = types_ts_8_1;
        },
        function (split_panel_ts_1_1) {
          split_panel_ts_1 = split_panel_ts_1_1;
        },
        function (tiles_container_ts_1_1) {
          tiles_container_ts_1 = tiles_container_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "game/src/game",
  [
    "game/src/avatar",
    "game/src/map",
    "game/src/random",
    "game/src/npc",
    "game/src/utils",
    "game/src/ui",
  ],
  function (exports_23, context_23) {
    "use strict";
    var avatar_ts_2,
      map_ts_1,
      random_ts_3,
      npc_ts_1,
      utils_ts_1,
      ui_ts_1,
      NPCS_COUNT;
    var __moduleName = context_23 && context_23.id;
    function onKeyEvent(game, e) {
      if (e.char) {
        if (e.type === "down") {
          utils_ts_1.setKeyDown(game, e.char, true);
        } else if (e.type === "up") {
          utils_ts_1.setKeyDown(game, e.char, false);
        }
      } else if (e.code) {
        if (e.type === "down") {
          utils_ts_1.setSpecialKeyDown(game, e.code, true);
        } else if (e.type === "up") {
          utils_ts_1.setSpecialKeyDown(game, e.code, false);
        }
      }
    }
    function initGame(engine, assets) {
      const { mainUI, map } = ui_ts_1.initUI(engine, assets);
      const ui = mainUI.panel2;
      const scrollable = map;
      const p1 = new avatar_ts_2.Avatar("female1", assets);
      const p2 = new avatar_ts_2.Avatar("female2", assets);
      const npcs = [];
      const avatars = [];
      const updateables = [];
      for (let i = 0; i < NPCS_COUNT; i++) {
        npcs.push(new npc_ts_1.Npc(i % 2 == 0 ? "npc1" : "npc2", assets));
      }
      avatars.push(...npcs, p1, p2);
      updateables.push(...avatars);
      map_ts_1.default(map, assets);
      avatars.forEach((c) => {
        c.parent = map;
        c.x = random_ts_3.randomIntervalInt(
          map.tilemapsBounds.width / 2 - 100,
          map.tilemapsBounds.width / 2 + 100,
        );
        c.y = random_ts_3.randomIntervalInt(
          map.tilemapsBounds.height / 2 - 100,
          map.tilemapsBounds.height / 2 + 100,
        );
      });
      const game = {
        ui,
        scrollable,
        avatars,
        map,
        npcs,
        p1,
        p2,
        updateables,
        keysDown: new Map(),
        specialKeysDown: new Map(),
      };
      engine.addWidget(mainUI);
      engine.onKeyEvent((e) => onKeyEvent(game, e));
      engine.setMainScrollable(map);
      return game;
    }
    exports_23("initGame", initGame);
    function updateGame(engine, game) {
      const { p1, p2, avatars, updateables, map } = game;
      if (
        utils_ts_1.isKeyDown(game, "a") ||
        utils_ts_1.isSpecialKeyDown(game, 1 /* ArrowLeft */)
      ) {
        p1.move(-1, 0);
      }
      if (
        utils_ts_1.isKeyDown(game, "d") ||
        utils_ts_1.isSpecialKeyDown(game, 2 /* ArrowRight */)
      ) {
        p1.move(1, 0);
      }
      if (
        utils_ts_1.isKeyDown(game, "w") ||
        utils_ts_1.isSpecialKeyDown(game, 3 /* ArrowUp */)
      ) {
        p1.move(0, -1);
      }
      if (
        utils_ts_1.isKeyDown(game, "s") ||
        utils_ts_1.isSpecialKeyDown(game, 4 /* ArrowDown */)
      ) {
        p1.move(0, 1);
      }
      if (utils_ts_1.isKeyDown(game, "f") || utils_ts_1.isKeyDown(game, "z")) {
        p1.shoot();
      }
      if (utils_ts_1.isKeyDown(game, "r") || utils_ts_1.isKeyDown(game, "x")) {
        p1.slash();
      }
      if (utils_ts_1.isKeyDown(game, "j")) {
        p2.move(-1, 0);
      }
      if (utils_ts_1.isKeyDown(game, "l")) {
        p2.move(1, 0);
      }
      if (utils_ts_1.isKeyDown(game, "i")) {
        p2.move(0, -1);
      }
      if (utils_ts_1.isKeyDown(game, "k")) {
        p2.move(0, 1);
      }
      if (utils_ts_1.isKeyDown(game, ";")) {
        p2.shoot();
      }
      if (utils_ts_1.isKeyDown(game, "p")) {
        p2.slash();
      }
      avatars.forEach((avatar) => {
        avatar.x = Math.max(Math.min(avatar.x, map.tilemapsBounds.width), 0);
        avatar.y = Math.max(Math.min(avatar.y, map.tilemapsBounds.height), 0);
      });
      updateables.forEach((u) => u.update());
      utils_ts_1.followAvatar(p1, map, engine);
      return true;
    }
    exports_23("updateGame", updateGame);
    return {
      setters: [
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
      ],
      execute: function () {
        NPCS_COUNT = 10;
      },
    };
  },
);
System.register(
  "web/src/native/web",
  ["engine/src/types"],
  function (exports_24, context_24) {
    "use strict";
    var types_ts_9, SCALE;
    var __moduleName = context_24 && context_24.id;
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
      const screenSize = new types_ts_9.Size(256, 256);
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
      const handleKey = (e, type) => {
        const key = e.key;
        if (type === "down" && key === "f") {
          if (globalThis.statsPaused) {
            globalThis.resumeStats();
          } else {
            globalThis.pauseStats();
          }
        }
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
      let mouseKeyCode = null;
      let mouseDown = false;
      const mouseEventToKeyCode = (e) => {
        const dx = e.clientX < window.innerWidth / 3 ? -1
        : e.clientX > (window.innerWidth * 2) / 3
        ? 1
        : 0;
        const dy = e.clientY < window.innerHeight / 3
          ? -1
          : e.clientY > (window.innerHeight * 2) / 3
          ? 1
          : 0;
        return dx === -1
          ? 1 /* ArrowLeft */
          : dx === 1
          ? 2 /* ArrowRight */
          : dy === -1
          ? 3 /* ArrowUp */
          : dy === 1
          ? 4 /* ArrowDown */
          : null;
      };
      const handleMouseDown = (e) => {
        mouseDown = true;
        const code = mouseEventToKeyCode(e);
        if (code !== mouseKeyCode) {
          if (mouseKeyCode !== null) {
            disptachKeyEvent({ type: "up", code: mouseKeyCode });
          }
          mouseKeyCode = code;
          if (mouseKeyCode !== null) {
            disptachKeyEvent({ type: "down", code: mouseKeyCode });
          }
        }
      };
      const handleMouseMove = (e) => {
        if (!mouseDown) {
          return;
        }
        const code = mouseEventToKeyCode(e);
        if (code !== mouseKeyCode) {
          if (mouseKeyCode !== null) {
            disptachKeyEvent({ type: "up", code: mouseKeyCode });
          }
          mouseKeyCode = code;
          if (mouseKeyCode !== null) {
            disptachKeyEvent({ type: "down", code: mouseKeyCode });
          }
        }
      };
      const handleMouseUp = (e) => {
        mouseDown = false;
        if (mouseKeyCode !== null) {
          disptachKeyEvent({ type: "up", code: mouseKeyCode });
        }
        mouseKeyCode = null;
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
        const tilePixels8 = t.pixels;
        switch (t.alphaType) {
          case 0 /* None */:
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
            break;
          case 1 /* Solid */:
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
            break;
          case 2 /* Alpha */:
            if (cfx <= 0 && cfy <= 0 && ctx >= t.width && cty >= t.height) {
              for (let py = 0; py < tileHeight; py++) {
                p = ((y + py) * imageData.width + x) << 2;
                f = (py * tileWidth) << 2;
                for (let px = 0; px < tileWidth; px++) {
                  const r = tilePixels8[f++];
                  const g = tilePixels8[f++];
                  const b = tilePixels8[f++];
                  const a = tilePixels8[f++] / 255;
                  const invA = 1 - a;
                  imageDataPixels[p + 0] = imageDataPixels[p + 0] * invA +
                    r * a;
                  imageDataPixels[p + 1] = imageDataPixels[p + 1] * invA +
                    g * a;
                  imageDataPixels[p + 2] = imageDataPixels[p + 2] * invA +
                    b * a;
                  imageDataPixels[p + 3] = 255; //a
                  p += 4;
                }
              }
            } else {
              for (let py = 0; py < tileHeight; py++) {
                p = ((y + py) * imageData.width + x) << 2;
                f = (py * tileWidth) << 2;
                for (let px = 0; px < tileWidth; px++) {
                  if (px >= cfx && px < ctx && py >= cfy && py < cty) {
                    const r = tilePixels8[f++];
                    const g = tilePixels8[f++];
                    const b = tilePixels8[f++];
                    const a = tilePixels8[f++] / 255;
                    const invA = 1 - a;
                    imageDataPixels[p + 0] = imageDataPixels[p + 0] * invA +
                      r * a;
                    imageDataPixels[p + 1] = imageDataPixels[p + 1] * invA +
                      g * a;
                    imageDataPixels[p + 2] = imageDataPixels[p + 2] * invA +
                      b * a;
                    imageDataPixels[p + 3] = 255; //a
                    p += 4;
                  } else {
                    p += 4;
                    f += 4;
                  }
                }
              }
            }
            break;
        }
      };
      const fillRect = (color, x, y, width, height) => {
        setDirty(x, y, width, height);
        let p = 0;
        for (let py = 0; py < height; py++) {
          p = (y + py) * imageData.width + x;
          for (let px = 0; px < width; px++) {
            imageDataPixels32[p++] = color;
          }
        }
      };
      const scrollRect = (x, y, width, height, dx, dy) => {
        setDirty(x, y, width, height);
        const screenWidth = screenSize.width;
        if (dy > 0) {
          for (let i = y + height - dy; i >= y; i--) {
            const toRowStart = (i + dy) * screenWidth + x;
            const fromRowStart = i * screenWidth + x;
            const fromRowEnd = fromRowStart + width;
            imageDataPixels32.copyWithin(toRowStart, fromRowStart, fromRowEnd);
          }
        } else if (dy < 0) {
          for (let i = y - dy; i < y + height; i++) {
            const toRowStart = (i + dy) * screenWidth + x;
            const fromRowStart = i * screenWidth + x;
            const fromRowEnd = fromRowStart + width;
            imageDataPixels32.copyWithin(toRowStart, fromRowStart, fromRowEnd);
          }
        }
        if (dx > 0) {
          for (let i = y; i < y + height; i++) {
            const toRowStart = i * screenWidth + x + dx;
            const fromRowStart = i * screenWidth + x;
            const fromRowEnd = fromRowStart + width - dx;
            imageDataPixels32.copyWithin(toRowStart, fromRowStart, fromRowEnd);
          }
        } else if (dx < 0) {
          for (let i = y; i < y + height; i++) {
            const toRowStart = i * screenWidth + x;
            const fromRowStart = i * screenWidth + x - dx;
            const fromRowEnd = fromRowStart + width + dx;
            imageDataPixels32.copyWithin(toRowStart, fromRowStart, fromRowEnd);
          }
        }
      };
      window.addEventListener("keydown", (e) => handleKey(e, "down"));
      window.addEventListener("keyup", (e) => handleKey(e, "up"));
      window.addEventListener("keypress", (e) => handleKey(e, "press"));
      //window.addEventListener("mousedown", handleMouseDown);
      //window.addEventListener("mouseup", handleMouseUp);
      //window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("pointerdown", handleMouseDown);
      window.addEventListener("pointerup", handleMouseUp);
      window.addEventListener("pointermove", handleMouseMove);
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
          fillRect,
          scrollRect,
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
    exports_24("getWebNativeContext", getWebNativeContext);
    return {
      setters: [
        function (types_ts_9_1) {
          types_ts_9 = types_ts_9_1;
        },
      ],
      execute: function () {
        SCALE = 1;
      },
    };
  },
);
System.register(
  "web/src/native/assets",
  ["engine/src/types"],
  function (exports_25, context_25) {
    "use strict";
    var types_ts_10;
    var __moduleName = context_25 && context_25.id;
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
        getTileXYByIndex: (index) =>
          new types_ts_10.Point(
            index % imageWidthInTiles,
            Math.trunc(index / imageWidthInTiles),
          ),
      };
      const setTileId = (index, id) => {
        tiles[index].id = id;
        tilesById.set(id, tiles[index]);
      };
      let index = 0;
      for (let y = 0; y < imageHeightInTiles; y++) {
        for (let x = 0; x < imageWidthInTiles; x++) {
          const pixels =
            ctx.getImageData(
              x * tileWidth,
              y * tileHeight,
              tileWidth,
              tileHeight,
            ).data;
          const pixels32 = new Uint32Array(pixels.buffer);
          const hasAlpha = pixels32.some((x) => ((x >> 24) & 0xff) != 255);
          const hasAlphaSolid = pixels32.every((x) =>
            ((x >> 24) & 0xff) == 255 || ((x >> 24) & 0xff) == 0
          );
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
            alphaType: hasAlpha ? hasAlphaSolid ? 1 /* Solid */ : 2 /* Alpha */
            : 0, /* None */
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
      const addAnimation = (id, y, fromX, toX, loops = true, delay = 100) => {
        const tiles = [];
        for (let x = fromX; x <= toX; x++) {
          tiles.push(tilemap.getTileByXY(x, y));
        }
        const animation = {
          id,
          tiles,
          delay,
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
      const delay = json.fps > 0 ? 1000 / json.fps : 0;
      const tiles = [];
      if (json.frames) {
        tiles.push(
          ...json.frames.map((f) => tilemaps.get(json.tilemap).tiles[f]),
        );
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
        delay,
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
      const terrainTilemap = await loadTilemap(
        "terrain",
        assetsJson.terrains,
        "color",
      );
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
        getTile: (tilemapDotTile) =>
          tilemaps.get(tilemapDotTile.split(".")[0]).getTile(
            tilemapDotTile.split(".")[1],
          ),
      };
      return assets;
    }
    exports_25("initAssets", initAssets);
    return {
      setters: [
        function (types_ts_10_1) {
          types_ts_10 = types_ts_10_1;
        },
      ],
      execute: function () {
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
    "web/src/native/assets",
  ],
  function (exports_26, context_26) {
    "use strict";
    var types_ts_11,
      engine_ts_1,
      label_ts_2,
      game_ts_1,
      web_ts_1,
      assets_ts_1,
      TARGET_FPS,
      engine,
      fpsLabel,
      game,
      totalRenderTime,
      frames,
      framesTime,
      firstUpdate,
      lastUpdateTime,
      timeToNextUpdate;
    var __moduleName = context_26 && context_26.id;
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
      game = game_ts_1.initGame(engine, assets);
      console.log("Game Initialized");
      fpsLabel = new label_ts_2.LabelWidget(
        assets.defaultFont,
        "FPS: 0.00\nRender: 0.00ms",
        types_ts_11.FixedColor.White,
        game.ui.backColor,
      );
      fpsLabel.parent = game.ui;
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
      if (firstUpdate) {
        firstUpdate = false;
        timeToNextUpdate = 1000 / TARGET_FPS;
        return;
      }
      if (timeToNextUpdate > 0.1) {
        return;
      }
      timeToNextUpdate += 1000 / TARGET_FPS;
      updateFps();
      engine.update();
      game_ts_1.updateGame(engine, game);
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
        function (assets_ts_1_1) {
          assets_ts_1 = assets_ts_1_1;
        },
      ],
      execute: function () {
        TARGET_FPS = 30;
        totalRenderTime = 0;
        frames = 0;
        framesTime = performance.now();
        firstUpdate = true;
        lastUpdateTime = performance.now();
        timeToNextUpdate = 0;
        run();
      },
    };
  },
);

__instantiate("web/src/main");
