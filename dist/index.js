"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // node_modules/.pnpm/@finsweet+ts-utils@0.40.0/node_modules/@finsweet/ts-utils/dist/webflow/getSiteId.js
  var getSiteId = (page = document) => page.documentElement.getAttribute("data-wf-site");

  // node_modules/.pnpm/@finsweet+ts-utils@0.40.0/node_modules/@finsweet/ts-utils/dist/webflow/restartWebflow.js
  var restartWebflow = async (modules) => {
    const { Webflow } = window;
    if (!Webflow || !("destroy" in Webflow) || !("ready" in Webflow) || !("require" in Webflow))
      return;
    if (modules && !modules.length)
      return;
    if (!modules) {
      Webflow.destroy();
      Webflow.ready();
    }
    if (!modules || modules.includes("ix2")) {
      const ix2 = Webflow.require("ix2");
      if (ix2) {
        const { store, actions } = ix2;
        const { eventState } = store.getState().ixSession;
        const stateEntries = Object.entries(eventState);
        if (!modules)
          ix2.destroy();
        ix2.init();
        await Promise.all(stateEntries.map((state) => store.dispatch(actions.eventStateChanged(...state))));
      }
    }
    if (!modules || modules.includes("commerce")) {
      const commerce = Webflow.require("commerce");
      const siteId = getSiteId();
      if (commerce && siteId) {
        commerce.destroy();
        commerce.init({ siteId, apiUrl: "https://render.webflow.com" });
      }
    }
    if (modules?.includes("lightbox"))
      Webflow.require("lightbox")?.ready();
    if (modules?.includes("slider")) {
      const slider = Webflow.require("slider");
      if (slider) {
        slider.redraw();
        slider.ready();
      }
    }
    if (modules?.includes("tabs"))
      Webflow.require("tabs")?.redraw();
    return new Promise((resolve) => Webflow.push(() => resolve(void 0)));
  };

  // src/swup/fsLibrairies.ts
  var loadedScripts = [];
  var FS_LIBRAIRIES_SRCS = [
    "https://cdn.jsdelivr.net/npm/@finsweet/attributes-accordion@1/accordion.js"
  ];
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
      loadedScripts.push(script);
    });
  }
  function initFsLibrairiesScripts() {
    return Promise.all(FS_LIBRAIRIES_SRCS.map(loadScript));
  }
  function destroyFsLibrairiesScripts() {
    loadedScripts.forEach((script) => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    loadedScripts.length = 0;
  }

  // node_modules/.pnpm/@swup+plugin@4.0.0/node_modules/@swup/plugin/dist/index.modern.js
  function r() {
    return r = Object.assign ? Object.assign.bind() : function(r4) {
      for (var n4 = 1; n4 < arguments.length; n4++) {
        var e2 = arguments[n4];
        for (var t2 in e2) Object.prototype.hasOwnProperty.call(e2, t2) && (r4[t2] = e2[t2]);
      }
      return r4;
    }, r.apply(this, arguments);
  }
  var n = (r4) => String(r4).split(".").map((r5) => String(parseInt(r5 || "0", 10))).concat(["0", "0"]).slice(0, 3).join(".");
  var e = class {
    constructor() {
      this.isSwupPlugin = true, this.swup = void 0, this.version = void 0, this.requires = {}, this.handlersToUnregister = [];
    }
    mount() {
    }
    unmount() {
      this.handlersToUnregister.forEach((r4) => r4()), this.handlersToUnregister = [];
    }
    _beforeMount() {
      if (!this.name) throw new Error("You must define a name of plugin when creating a class.");
    }
    _afterUnmount() {
    }
    _checkRequirements() {
      return "object" != typeof this.requires || Object.entries(this.requires).forEach(([r4, e2]) => {
        if (!function(r5, e3, t2) {
          const s3 = function(r6, n4) {
            var e4;
            if ("swup" === r6) return null != (e4 = n4.version) ? e4 : "";
            {
              var t3;
              const e5 = n4.findPlugin(r6);
              return null != (t3 = null == e5 ? void 0 : e5.version) ? t3 : "";
            }
          }(r5, t2);
          return !!s3 && ((r6, e4) => e4.every((e5) => {
            const [, t3, s4] = e5.match(/^([\D]+)?(.*)$/) || [];
            var o3, i3;
            return ((r7, n4) => {
              const e6 = { "": (r8) => 0 === r8, ">": (r8) => r8 > 0, ">=": (r8) => r8 >= 0, "<": (r8) => r8 < 0, "<=": (r8) => r8 <= 0 };
              return (e6[n4] || e6[""])(r7);
            })((i3 = s4, o3 = n(o3 = r6), i3 = n(i3), o3.localeCompare(i3, void 0, { numeric: true })), t3 || ">=");
          }))(s3, e3);
        }(r4, e2 = Array.isArray(e2) ? e2 : [e2], this.swup)) {
          const n4 = `${r4} ${e2.join(", ")}`;
          throw new Error(`Plugin version mismatch: ${this.name} requires ${n4}`);
        }
      }), true;
    }
    on(r4, n4, e2 = {}) {
      var t2;
      n4 = !(t2 = n4).name.startsWith("bound ") || t2.hasOwnProperty("prototype") ? n4.bind(this) : n4;
      const s3 = this.swup.hooks.on(r4, n4, e2);
      return this.handlersToUnregister.push(s3), s3;
    }
    once(n4, e2, t2 = {}) {
      return this.on(n4, e2, r({}, t2, { once: true }));
    }
    before(n4, e2, t2 = {}) {
      return this.on(n4, e2, r({}, t2, { before: true }));
    }
    replace(n4, e2, t2 = {}) {
      return this.on(n4, e2, r({}, t2, { replace: true }));
    }
    off(r4, n4) {
      return this.swup.hooks.off(r4, n4);
    }
  };

  // node_modules/.pnpm/@swup+head-plugin@2.3.1_swup@4.8.3/node_modules/@swup/head-plugin/dist/index.modern.js
  function t() {
    return t = Object.assign ? Object.assign.bind() : function(e2) {
      for (var t2 = 1; t2 < arguments.length; t2++) {
        var s3 = arguments[t2];
        for (var n4 in s3) ({}).hasOwnProperty.call(s3, n4) && (e2[n4] = s3[n4]);
      }
      return e2;
    }, t.apply(null, arguments);
  }
  function s(e2) {
    return "title" !== e2.localName && !e2.matches("[data-swup-theme]");
  }
  function n2(e2, t2) {
    return e2.outerHTML === t2.outerHTML;
  }
  function r2(e2, t2 = []) {
    const s3 = Array.from(e2.attributes);
    return t2.length ? s3.filter(({ name: e3 }) => t2.some((t3) => t3 instanceof RegExp ? t3.test(e3) : e3 === t3)) : s3;
  }
  function o(e2) {
    return e2.matches("link[rel=stylesheet][href]");
  }
  var i = class extends e {
    constructor(e2 = {}) {
      var i3;
      super(), i3 = this, this.name = "SwupHeadPlugin", this.requires = { swup: ">=4.6" }, this.defaults = { persistTags: false, persistAssets: false, awaitAssets: false, attributes: ["lang", "dir"], timeout: 3e3 }, this.options = void 0, this.updateHead = async function(e3, { page: {} }) {
        const { awaitAssets: a2, attributes: l2, timeout: u2 } = i3.options, c2 = e3.to.document, { removed: d2, added: h } = function(e4, r4, { shouldPersist: o3 = () => false } = {}) {
          const i4 = Array.from(e4.children), a3 = Array.from(r4.children), l3 = (u3 = i4, a3.reduce((e5, t2, s3) => (u3.some((e6) => n2(t2, e6)) || e5.push({ el: t2, index: s3 }), e5), []));
          var u3;
          const c3 = function(e5, t2) {
            return e5.reduce((e6, s3) => (t2.some((e7) => n2(s3, e7)) || e6.push({ el: s3 }), e6), []);
          }(i4, a3);
          c3.reverse().filter(({ el: e5 }) => s(e5)).filter(({ el: e5 }) => !o3(e5)).forEach(({ el: t2 }) => e4.removeChild(t2));
          const d3 = l3.filter(({ el: e5 }) => s(e5)).map((s3) => {
            let n4 = s3.el.cloneNode(true);
            return e4.insertBefore(n4, e4.children[(s3.index || 0) + 1] || null), t({}, s3, { el: n4 });
          });
          return { removed: c3.map(({ el: e5 }) => e5), added: d3.map(({ el: e5 }) => e5) };
        }(document.head, c2.head, { shouldPersist: (e4) => i3.isPersistentTag(e4) });
        if (i3.swup.log(`Removed ${d2.length} / added ${h.length} tags in head`), null != l2 && l2.length && function(e4, t2, s3 = []) {
          const n4 = /* @__PURE__ */ new Set();
          for (const { name: o3, value: i4 } of r2(t2, s3)) e4.setAttribute(o3, i4), n4.add(o3);
          for (const { name: t3 } of r2(e4, s3)) n4.has(t3) || e4.removeAttribute(t3);
        }(document.documentElement, c2.documentElement, l2), a2) {
          const e4 = function(e5, t2 = 0) {
            return e5.filter(o).map((e6) => function(e7, t3 = 0) {
              let s3;
              const n4 = (t4) => {
                e7.sheet ? t4() : s3 = setTimeout(() => n4(t4), 10);
              };
              return new Promise((r4) => {
                n4(() => r4(e7)), t3 > 0 && setTimeout(() => {
                  s3 && clearTimeout(s3), r4(e7);
                }, t3);
              });
            }(e6, t2));
          }(h, u2);
          e4.length && (i3.swup.log(`Waiting for ${e4.length} assets to load`), await Promise.all(e4));
        }
      }, this.options = t({}, this.defaults, e2), this.options.persistAssets && !this.options.persistTags && (this.options.persistTags = "link[rel=stylesheet], script[src], style");
    }
    mount() {
      this.before("content:replace", this.updateHead);
    }
    isPersistentTag(e2) {
      const { persistTags: t2 } = this.options;
      return "function" == typeof t2 ? t2(e2) : "string" == typeof t2 && t2.length > 0 ? e2.matches(t2) : Boolean(t2);
    }
  };

  // node_modules/.pnpm/delegate-it@6.3.0/node_modules/delegate-it/delegate.js
  var ledger = /* @__PURE__ */ new WeakMap();
  function editLedger(wanted, baseElement, callback, setup) {
    if (!wanted && !ledger.has(baseElement)) {
      return false;
    }
    const elementMap = ledger.get(baseElement) ?? /* @__PURE__ */ new WeakMap();
    ledger.set(baseElement, elementMap);
    const setups = elementMap.get(callback) ?? /* @__PURE__ */ new Set();
    elementMap.set(callback, setups);
    const existed = setups.has(setup);
    if (wanted) {
      setups.add(setup);
    } else {
      setups.delete(setup);
    }
    return existed && wanted;
  }
  function safeClosest(event, selector) {
    let target = event.target;
    if (target instanceof Text) {
      target = target.parentElement;
    }
    if (target instanceof Element && event.currentTarget instanceof Node) {
      const closest = target.closest(selector);
      if (closest && event.currentTarget.contains(closest)) {
        return closest;
      }
    }
  }
  function delegate(selector, type, callback, options = {}) {
    const { signal, base = document } = options;
    if (signal?.aborted) {
      return;
    }
    const { once, ...nativeListenerOptions } = options;
    const baseElement = base instanceof Document ? base.documentElement : base;
    const capture = Boolean(typeof options === "object" ? options.capture : options);
    const listenerFunction = (event) => {
      const delegateTarget = safeClosest(event, String(selector));
      if (delegateTarget) {
        const delegateEvent = Object.assign(event, { delegateTarget });
        callback.call(baseElement, delegateEvent);
        if (once) {
          baseElement.removeEventListener(type, listenerFunction, nativeListenerOptions);
          editLedger(false, baseElement, callback, setup);
        }
      }
    };
    const setup = JSON.stringify({ selector, type, capture });
    const isAlreadyListening = editLedger(true, baseElement, callback, setup);
    if (!isAlreadyListening) {
      baseElement.addEventListener(type, listenerFunction, nativeListenerOptions);
    }
    signal?.addEventListener("abort", () => {
      editLedger(false, baseElement, callback, setup);
    });
  }
  var delegate_default = delegate;

  // node_modules/.pnpm/swup@4.8.3/node_modules/swup/dist/Swup.modern.js
  function i2() {
    return i2 = Object.assign ? Object.assign.bind() : function(t2) {
      for (var e2 = 1; e2 < arguments.length; e2++) {
        var i3 = arguments[e2];
        for (var s3 in i3) ({}).hasOwnProperty.call(i3, s3) && (t2[s3] = i3[s3]);
      }
      return t2;
    }, i2.apply(null, arguments);
  }
  var s2 = (t2, e2) => String(t2).toLowerCase().replace(/[\s/_.]+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "") || e2 || "";
  var n3 = ({ hash: t2 } = {}) => window.location.pathname + window.location.search + (t2 ? window.location.hash : "");
  var o2 = (t2, e2 = {}) => {
    const s3 = i2({ url: t2 = t2 || n3({ hash: true }), random: Math.random(), source: "swup" }, e2);
    window.history.pushState(s3, "", t2);
  };
  var r3 = (t2 = null, e2 = {}) => {
    t2 = t2 || n3({ hash: true });
    const s3 = i2({}, window.history.state || {}, { url: t2, random: Math.random(), source: "swup" }, e2);
    window.history.replaceState(s3, "", t2);
  };
  var a = (e2, s3, n4, o3) => {
    const r4 = new AbortController();
    return o3 = i2({}, o3, { signal: r4.signal }), delegate_default(e2, s3, n4, o3), { destroy: () => r4.abort() };
  };
  var l = class _l extends URL {
    constructor(t2, e2 = document.baseURI) {
      super(t2.toString(), e2), Object.setPrototypeOf(this, _l.prototype);
    }
    get url() {
      return this.pathname + this.search;
    }
    static fromElement(t2) {
      const e2 = t2.getAttribute("href") || t2.getAttribute("xlink:href") || "";
      return new _l(e2);
    }
    static fromUrl(t2) {
      return new _l(t2);
    }
  };
  var c = class extends Error {
    constructor(t2, e2) {
      super(t2), this.url = void 0, this.status = void 0, this.aborted = void 0, this.timedOut = void 0, this.name = "FetchError", this.url = e2.url, this.status = e2.status, this.aborted = e2.aborted || false, this.timedOut = e2.timedOut || false;
    }
  };
  async function u(t2, e2 = {}) {
    var s3;
    t2 = l.fromUrl(t2).url;
    const { visit: n4 = this.visit } = e2, o3 = i2({}, this.options.requestHeaders, e2.headers), r4 = null != (s3 = e2.timeout) ? s3 : this.options.timeout, a2 = new AbortController(), { signal: h } = a2;
    e2 = i2({}, e2, { headers: o3, signal: h });
    let u2, d2 = false, p2 = null;
    r4 && r4 > 0 && (p2 = setTimeout(() => {
      d2 = true, a2.abort("timeout");
    }, r4));
    try {
      u2 = await this.hooks.call("fetch:request", n4, { url: t2, options: e2 }, (t3, { url: e3, options: i3 }) => fetch(e3, i3)), p2 && clearTimeout(p2);
    } catch (e3) {
      if (d2) throw this.hooks.call("fetch:timeout", n4, { url: t2 }), new c(`Request timed out: ${t2}`, { url: t2, timedOut: d2 });
      if ("AbortError" === (null == e3 ? void 0 : e3.name) || h.aborted) throw new c(`Request aborted: ${t2}`, { url: t2, aborted: true });
      throw e3;
    }
    const { status: m2, url: w2 } = u2, f2 = await u2.text();
    if (500 === m2) throw this.hooks.call("fetch:error", n4, { status: m2, response: u2, url: w2 }), new c(`Server error: ${w2}`, { status: m2, url: w2 });
    if (!f2) throw new c(`Empty response: ${w2}`, { status: m2, url: w2 });
    const { url: g2 } = l.fromUrl(w2), v = { url: g2, html: f2 };
    return !n4.cache.write || e2.method && "GET" !== e2.method || t2 !== g2 || this.cache.set(v.url, v), v;
  }
  var d = class {
    constructor(t2) {
      this.swup = void 0, this.pages = /* @__PURE__ */ new Map(), this.swup = t2;
    }
    get size() {
      return this.pages.size;
    }
    get all() {
      const t2 = /* @__PURE__ */ new Map();
      return this.pages.forEach((e2, s3) => {
        t2.set(s3, i2({}, e2));
      }), t2;
    }
    has(t2) {
      return this.pages.has(this.resolve(t2));
    }
    get(t2) {
      const e2 = this.pages.get(this.resolve(t2));
      return e2 ? i2({}, e2) : e2;
    }
    set(t2, e2) {
      e2 = i2({}, e2, { url: t2 = this.resolve(t2) }), this.pages.set(t2, e2), this.swup.hooks.callSync("cache:set", void 0, { page: e2 });
    }
    update(t2, e2) {
      t2 = this.resolve(t2);
      const s3 = i2({}, this.get(t2), e2, { url: t2 });
      this.pages.set(t2, s3);
    }
    delete(t2) {
      this.pages.delete(this.resolve(t2));
    }
    clear() {
      this.pages.clear(), this.swup.hooks.callSync("cache:clear", void 0, void 0);
    }
    prune(t2) {
      this.pages.forEach((e2, i3) => {
        t2(i3, e2) && this.delete(i3);
      });
    }
    resolve(t2) {
      const { url: e2 } = l.fromUrl(t2);
      return this.swup.resolveUrl(e2);
    }
  };
  var p = (t2, e2 = document) => e2.querySelector(t2);
  var m = (t2, e2 = document) => Array.from(e2.querySelectorAll(t2));
  var w = () => new Promise((t2) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        t2();
      });
    });
  });
  function f(t2) {
    return !!t2 && ("object" == typeof t2 || "function" == typeof t2) && "function" == typeof t2.then;
  }
  function g(t2, e2 = []) {
    return new Promise((i3, s3) => {
      const n4 = t2(...e2);
      f(n4) ? n4.then(i3, s3) : i3(n4);
    });
  }
  function y(t2, e2) {
    const i3 = null == t2 ? void 0 : t2.closest(`[${e2}]`);
    return null != i3 && i3.hasAttribute(e2) ? (null == i3 ? void 0 : i3.getAttribute(e2)) || true : void 0;
  }
  var k = class {
    constructor(t2) {
      this.swup = void 0, this.swupClasses = ["to-", "is-changing", "is-rendering", "is-popstate", "is-animating", "is-leaving"], this.swup = t2;
    }
    get selectors() {
      const { scope: t2 } = this.swup.visit.animation;
      return "containers" === t2 ? this.swup.visit.containers : "html" === t2 ? ["html"] : Array.isArray(t2) ? t2 : [];
    }
    get selector() {
      return this.selectors.join(",");
    }
    get targets() {
      return this.selector.trim() ? m(this.selector) : [];
    }
    add(...t2) {
      this.targets.forEach((e2) => e2.classList.add(...t2));
    }
    remove(...t2) {
      this.targets.forEach((e2) => e2.classList.remove(...t2));
    }
    clear() {
      this.targets.forEach((t2) => {
        const e2 = t2.className.split(" ").filter((t3) => this.isSwupClass(t3));
        t2.classList.remove(...e2);
      });
    }
    isSwupClass(t2) {
      return this.swupClasses.some((e2) => t2.startsWith(e2));
    }
  };
  var b = class {
    constructor(t2, e2) {
      this.id = void 0, this.state = void 0, this.from = void 0, this.to = void 0, this.containers = void 0, this.animation = void 0, this.trigger = void 0, this.cache = void 0, this.history = void 0, this.scroll = void 0, this.meta = void 0;
      const { to: i3, from: s3, hash: n4, el: o3, event: r4 } = e2;
      this.id = Math.random(), this.state = 1, this.from = { url: null != s3 ? s3 : t2.location.url, hash: t2.location.hash }, this.to = { url: i3, hash: n4 }, this.containers = t2.options.containers, this.animation = { animate: true, wait: false, name: void 0, native: t2.options.native, scope: t2.options.animationScope, selector: t2.options.animationSelector }, this.trigger = { el: o3, event: r4 }, this.cache = { read: t2.options.cache, write: t2.options.cache }, this.history = { action: "push", popstate: false, direction: void 0 }, this.scroll = { reset: true, target: void 0 }, this.meta = {};
    }
    advance(t2) {
      this.state < t2 && (this.state = t2);
    }
    abort() {
      this.state = 8;
    }
    get done() {
      return this.state >= 7;
    }
  };
  function S(t2) {
    return new b(this, t2);
  }
  var E = class {
    constructor(t2) {
      this.swup = void 0, this.registry = /* @__PURE__ */ new Map(), this.hooks = ["animation:out:start", "animation:out:await", "animation:out:end", "animation:in:start", "animation:in:await", "animation:in:end", "animation:skip", "cache:clear", "cache:set", "content:replace", "content:scroll", "enable", "disable", "fetch:request", "fetch:error", "fetch:timeout", "history:popstate", "link:click", "link:self", "link:anchor", "link:newtab", "page:load", "page:view", "scroll:top", "scroll:anchor", "visit:start", "visit:transition", "visit:abort", "visit:end"], this.swup = t2, this.init();
    }
    init() {
      this.hooks.forEach((t2) => this.create(t2));
    }
    create(t2) {
      this.registry.has(t2) || this.registry.set(t2, /* @__PURE__ */ new Map());
    }
    exists(t2) {
      return this.registry.has(t2);
    }
    get(t2) {
      const e2 = this.registry.get(t2);
      if (e2) return e2;
      console.error(`Unknown hook '${t2}'`);
    }
    clear() {
      this.registry.forEach((t2) => t2.clear());
    }
    on(t2, e2, s3 = {}) {
      const n4 = this.get(t2);
      if (!n4) return console.warn(`Hook '${t2}' not found.`), () => {
      };
      const o3 = i2({}, s3, { id: n4.size + 1, hook: t2, handler: e2 });
      return n4.set(e2, o3), () => this.off(t2, e2);
    }
    before(t2, e2, s3 = {}) {
      return this.on(t2, e2, i2({}, s3, { before: true }));
    }
    replace(t2, e2, s3 = {}) {
      return this.on(t2, e2, i2({}, s3, { replace: true }));
    }
    once(t2, e2, s3 = {}) {
      return this.on(t2, e2, i2({}, s3, { once: true }));
    }
    off(t2, e2) {
      const i3 = this.get(t2);
      i3 && e2 ? i3.delete(e2) || console.warn(`Handler for hook '${t2}' not found.`) : i3 && i3.clear();
    }
    async call(t2, e2, i3, s3) {
      const [n4, o3, r4] = this.parseCallArgs(t2, e2, i3, s3), { before: a2, handler: l2, after: h } = this.getHandlers(t2, r4);
      await this.run(a2, n4, o3);
      const [c2] = await this.run(l2, n4, o3, true);
      return await this.run(h, n4, o3), this.dispatchDomEvent(t2, n4, o3), c2;
    }
    callSync(t2, e2, i3, s3) {
      const [n4, o3, r4] = this.parseCallArgs(t2, e2, i3, s3), { before: a2, handler: l2, after: h } = this.getHandlers(t2, r4);
      this.runSync(a2, n4, o3);
      const [c2] = this.runSync(l2, n4, o3, true);
      return this.runSync(h, n4, o3), this.dispatchDomEvent(t2, n4, o3), c2;
    }
    parseCallArgs(t2, e2, i3, s3) {
      return e2 instanceof b || "object" != typeof e2 && "function" != typeof i3 ? [e2, i3, s3] : [void 0, e2, i3];
    }
    async run(t2, e2 = this.swup.visit, i3, s3 = false) {
      const n4 = [];
      for (const { hook: o3, handler: r4, defaultHandler: a2, once: l2 } of t2) if (null == e2 || !e2.done) {
        l2 && this.off(o3, r4);
        try {
          const t3 = await g(r4, [e2, i3, a2]);
          n4.push(t3);
        } catch (t3) {
          if (s3) throw t3;
          console.error(`Error in hook '${o3}':`, t3);
        }
      }
      return n4;
    }
    runSync(t2, e2 = this.swup.visit, i3, s3 = false) {
      const n4 = [];
      for (const { hook: o3, handler: r4, defaultHandler: a2, once: l2 } of t2) if (null == e2 || !e2.done) {
        l2 && this.off(o3, r4);
        try {
          const t3 = r4(e2, i3, a2);
          n4.push(t3), f(t3) && console.warn(`Swup will not await Promises in handler for synchronous hook '${o3}'.`);
        } catch (t3) {
          if (s3) throw t3;
          console.error(`Error in hook '${o3}':`, t3);
        }
      }
      return n4;
    }
    getHandlers(t2, e2) {
      const i3 = this.get(t2);
      if (!i3) return { found: false, before: [], handler: [], after: [], replaced: false };
      const s3 = Array.from(i3.values()), n4 = this.sortRegistrations, o3 = s3.filter(({ before: t3, replace: e3 }) => t3 && !e3).sort(n4), r4 = s3.filter(({ replace: t3 }) => t3).filter((t3) => true).sort(n4), a2 = s3.filter(({ before: t3, replace: e3 }) => !t3 && !e3).sort(n4), l2 = r4.length > 0;
      let h = [];
      if (e2 && (h = [{ id: 0, hook: t2, handler: e2 }], l2)) {
        const i4 = r4.length - 1, { handler: s4, once: n5 } = r4[i4], o4 = (t3) => {
          const i5 = r4[t3 - 1];
          return i5 ? (e3, s5) => i5.handler(e3, s5, o4(t3 - 1)) : e2;
        };
        h = [{ id: 0, hook: t2, once: n5, handler: s4, defaultHandler: o4(i4) }];
      }
      return { found: true, before: o3, handler: h, after: a2, replaced: l2 };
    }
    sortRegistrations(t2, e2) {
      var i3, s3;
      return (null != (i3 = t2.priority) ? i3 : 0) - (null != (s3 = e2.priority) ? s3 : 0) || t2.id - e2.id || 0;
    }
    dispatchDomEvent(t2, e2, i3) {
      if (null != e2 && e2.done) return;
      const s3 = { hook: t2, args: i3, visit: e2 || this.swup.visit };
      document.dispatchEvent(new CustomEvent("swup:any", { detail: s3, bubbles: true })), document.dispatchEvent(new CustomEvent(`swup:${t2}`, { detail: s3, bubbles: true }));
    }
    parseName(t2) {
      const [e2, ...s3] = t2.split(".");
      return [e2, s3.reduce((t3, e3) => i2({}, t3, { [e3]: true }), {})];
    }
  };
  var C = (t2) => {
    if (t2 && "#" === t2.charAt(0) && (t2 = t2.substring(1)), !t2) return null;
    const e2 = decodeURIComponent(t2);
    let i3 = document.getElementById(t2) || document.getElementById(e2) || p(`a[name='${CSS.escape(t2)}']`) || p(`a[name='${CSS.escape(e2)}']`);
    return i3 || "top" !== t2 || (i3 = document.body), i3;
  };
  var U = "transition";
  var P = "animation";
  async function $({ selector: t2, elements: e2 }) {
    if (false === t2 && !e2) return;
    let i3 = [];
    if (e2) i3 = Array.from(e2);
    else if (t2 && (i3 = m(t2, document.body), !i3.length)) return void console.warn(`[swup] No elements found matching animationSelector \`${t2}\``);
    const s3 = i3.map((t3) => function(t4) {
      const { type: e3, timeout: i4, propCount: s4 } = function(t5) {
        const e4 = window.getComputedStyle(t5), i5 = A(e4, `${U}Delay`), s5 = A(e4, `${U}Duration`), n4 = x(i5, s5), o3 = A(e4, `${P}Delay`), r4 = A(e4, `${P}Duration`), a2 = x(o3, r4), l2 = Math.max(n4, a2), h = l2 > 0 ? n4 > a2 ? U : P : null;
        return { type: h, timeout: l2, propCount: h ? h === U ? s5.length : r4.length : 0 };
      }(t4);
      return !(!e3 || !i4) && new Promise((n4) => {
        const o3 = `${e3}end`, r4 = performance.now();
        let a2 = 0;
        const l2 = () => {
          t4.removeEventListener(o3, h), n4();
        }, h = (e4) => {
          e4.target === t4 && ((performance.now() - r4) / 1e3 < e4.elapsedTime || ++a2 >= s4 && l2());
        };
        setTimeout(() => {
          a2 < s4 && l2();
        }, i4 + 1), t4.addEventListener(o3, h);
      });
    }(t3));
    s3.filter(Boolean).length > 0 ? await Promise.all(s3) : t2 && console.warn(`[swup] No CSS animation duration defined on elements matching \`${t2}\``);
  }
  function A(t2, e2) {
    return (t2[e2] || "").split(", ");
  }
  function x(t2, e2) {
    for (; t2.length < e2.length; ) t2 = t2.concat(t2);
    return Math.max(...e2.map((e3, i3) => H(e3) + H(t2[i3])));
  }
  function H(t2) {
    return 1e3 * parseFloat(t2);
  }
  function V(t2, e2 = {}, s3 = {}) {
    if ("string" != typeof t2) throw new Error("swup.navigate() requires a URL parameter");
    if (this.shouldIgnoreVisit(t2, { el: s3.el, event: s3.event })) return void window.location.assign(t2);
    const { url: n4, hash: o3 } = l.fromUrl(t2), r4 = this.createVisit(i2({}, s3, { to: n4, hash: o3 }));
    this.performNavigation(r4, e2);
  }
  async function I(t2, e2 = {}) {
    if (this.navigating) {
      if (this.visit.state >= 6) return t2.state = 2, void (this.onVisitEnd = () => this.performNavigation(t2, e2));
      await this.hooks.call("visit:abort", this.visit, void 0), delete this.visit.to.document, this.visit.state = 8;
    }
    this.navigating = true, this.visit = t2;
    const { el: i3 } = t2.trigger;
    e2.referrer = e2.referrer || this.location.url, false === e2.animate && (t2.animation.animate = false), t2.animation.animate || this.classes.clear();
    const n4 = e2.history || y(i3, "data-swup-history");
    "string" == typeof n4 && ["push", "replace"].includes(n4) && (t2.history.action = n4);
    const a2 = e2.animation || y(i3, "data-swup-animation");
    var h, c2;
    "string" == typeof a2 && (t2.animation.name = a2), t2.meta = e2.meta || {}, "object" == typeof e2.cache ? (t2.cache.read = null != (h = e2.cache.read) ? h : t2.cache.read, t2.cache.write = null != (c2 = e2.cache.write) ? c2 : t2.cache.write) : void 0 !== e2.cache && (t2.cache = { read: !!e2.cache, write: !!e2.cache }), delete e2.cache;
    try {
      await this.hooks.call("visit:start", t2, void 0), t2.state = 3;
      const i4 = this.hooks.call("page:load", t2, { options: e2 }, async (t3, e3) => {
        let i5;
        return t3.cache.read && (i5 = this.cache.get(t3.to.url)), e3.page = i5 || await this.fetchPage(t3.to.url, e3.options), e3.cache = !!i5, e3.page;
      });
      i4.then(({ html: e3 }) => {
        t2.advance(5), t2.to.html = e3, t2.to.document = new DOMParser().parseFromString(e3, "text/html");
      });
      const n5 = t2.to.url + t2.to.hash;
      if (t2.history.popstate || ("replace" === t2.history.action || t2.to.url === this.location.url ? r3(n5) : (this.currentHistoryIndex++, o2(n5, { index: this.currentHistoryIndex }))), this.location = l.fromUrl(n5), t2.history.popstate && this.classes.add("is-popstate"), t2.animation.name && this.classes.add(`to-${s2(t2.animation.name)}`), t2.animation.wait && await i4, t2.done) return;
      if (await this.hooks.call("visit:transition", t2, void 0, async () => {
        if (!t2.animation.animate) return await this.hooks.call("animation:skip", void 0), void await this.renderPage(t2, await i4);
        t2.advance(4), await this.animatePageOut(t2), t2.animation.native && document.startViewTransition ? await document.startViewTransition(async () => await this.renderPage(t2, await i4)).finished : await this.renderPage(t2, await i4), await this.animatePageIn(t2);
      }), t2.done) return;
      await this.hooks.call("visit:end", t2, void 0, () => this.classes.clear()), t2.state = 7, this.navigating = false, this.onVisitEnd && (this.onVisitEnd(), this.onVisitEnd = void 0);
    } catch (e3) {
      if (!e3 || null != e3 && e3.aborted) return void (t2.state = 8);
      t2.state = 9, console.error(e3), this.options.skipPopStateHandling = () => (window.location.assign(t2.to.url + t2.to.hash), true), window.history.back();
    } finally {
      delete t2.to.document;
    }
  }
  var L = async function(t2) {
    await this.hooks.call("animation:out:start", t2, void 0, () => {
      this.classes.add("is-changing", "is-animating", "is-leaving");
    }), await this.hooks.call("animation:out:await", t2, { skip: false }, (t3, { skip: e2 }) => {
      if (!e2) return this.awaitAnimations({ selector: t3.animation.selector });
    }), await this.hooks.call("animation:out:end", t2, void 0);
  };
  var q = function(t2) {
    var e2;
    const i3 = t2.to.document;
    if (!i3) return false;
    const s3 = (null == (e2 = i3.querySelector("title")) ? void 0 : e2.innerText) || "";
    document.title = s3;
    const n4 = m('[data-swup-persist]:not([data-swup-persist=""])'), o3 = t2.containers.map((t3) => {
      const e3 = document.querySelector(t3), s4 = i3.querySelector(t3);
      return e3 && s4 ? (e3.replaceWith(s4.cloneNode(true)), true) : (e3 || console.warn(`[swup] Container missing in current document: ${t3}`), s4 || console.warn(`[swup] Container missing in incoming document: ${t3}`), false);
    }).filter(Boolean);
    return n4.forEach((t3) => {
      const e3 = t3.getAttribute("data-swup-persist"), i4 = p(`[data-swup-persist="${e3}"]`);
      i4 && i4 !== t3 && i4.replaceWith(t3);
    }), o3.length === t2.containers.length;
  };
  var R = function(t2) {
    const e2 = { behavior: "auto" }, { target: s3, reset: n4 } = t2.scroll, o3 = null != s3 ? s3 : t2.to.hash;
    let r4 = false;
    return o3 && (r4 = this.hooks.callSync("scroll:anchor", t2, { hash: o3, options: e2 }, (t3, { hash: e3, options: i3 }) => {
      const s4 = this.getAnchorElement(e3);
      return s4 && s4.scrollIntoView(i3), !!s4;
    })), n4 && !r4 && (r4 = this.hooks.callSync("scroll:top", t2, { options: e2 }, (t3, { options: e3 }) => (window.scrollTo(i2({ top: 0, left: 0 }, e3)), true))), r4;
  };
  var T = async function(t2) {
    if (t2.done) return;
    const e2 = this.hooks.call("animation:in:await", t2, { skip: false }, (t3, { skip: e3 }) => {
      if (!e3) return this.awaitAnimations({ selector: t3.animation.selector });
    });
    await w(), await this.hooks.call("animation:in:start", t2, void 0, () => {
      this.classes.remove("is-animating");
    }), await e2, await this.hooks.call("animation:in:end", t2, void 0);
  };
  var N = async function(t2, e2) {
    if (t2.done) return;
    t2.advance(6);
    const { url: i3 } = e2;
    this.isSameResolvedUrl(n3(), i3) || (r3(i3), this.location = l.fromUrl(i3), t2.to.url = this.location.url, t2.to.hash = this.location.hash), await this.hooks.call("content:replace", t2, { page: e2 }, (t3, {}) => {
      if (this.classes.remove("is-leaving"), t3.animation.animate && this.classes.add("is-rendering"), !this.replaceContent(t3)) throw new Error("[swup] Container mismatch, aborting");
      t3.animation.animate && (this.classes.add("is-changing", "is-animating", "is-rendering"), t3.animation.name && this.classes.add(`to-${s2(t3.animation.name)}`));
    }), await this.hooks.call("content:scroll", t2, void 0, () => this.scrollToContent(t2)), await this.hooks.call("page:view", t2, { url: this.location.url, title: document.title });
  };
  var O = function(t2) {
    var e2;
    if (e2 = t2, Boolean(null == e2 ? void 0 : e2.isSwupPlugin)) {
      if (t2.swup = this, !t2._checkRequirements || t2._checkRequirements()) return t2._beforeMount && t2._beforeMount(), t2.mount(), this.plugins.push(t2), this.plugins;
    } else console.error("Not a swup plugin instance", t2);
  };
  function D(t2) {
    const e2 = this.findPlugin(t2);
    if (e2) return e2.unmount(), e2._afterUnmount && e2._afterUnmount(), this.plugins = this.plugins.filter((t3) => t3 !== e2), this.plugins;
    console.error("No such plugin", e2);
  }
  function M(t2) {
    return this.plugins.find((e2) => e2 === t2 || e2.name === t2 || e2.name === `Swup${String(t2)}`);
  }
  function W(t2) {
    if ("function" != typeof this.options.resolveUrl) return console.warn("[swup] options.resolveUrl expects a callback function."), t2;
    const e2 = this.options.resolveUrl(t2);
    return e2 && "string" == typeof e2 ? e2.startsWith("//") || e2.startsWith("http") ? (console.warn("[swup] options.resolveUrl needs to return a relative url"), t2) : e2 : (console.warn("[swup] options.resolveUrl needs to return a url"), t2);
  }
  function B(t2, e2) {
    return this.resolveUrl(t2) === this.resolveUrl(e2);
  }
  var j = { animateHistoryBrowsing: false, animationSelector: '[class*="transition-"]', animationScope: "html", cache: true, containers: ["#swup"], hooks: {}, ignoreVisit: (t2, { el: e2 } = {}) => !(null == e2 || !e2.closest("[data-no-swup]")), linkSelector: "a[href]", linkToSelf: "scroll", native: false, plugins: [], resolveUrl: (t2) => t2, requestHeaders: { "X-Requested-With": "swup", Accept: "text/html, application/xhtml+xml" }, skipPopStateHandling: (t2) => {
    var e2;
    return "swup" !== (null == (e2 = t2.state) ? void 0 : e2.source);
  }, timeout: 0 };
  var _ = class {
    get currentPageUrl() {
      return this.location.url;
    }
    constructor(t2 = {}) {
      var e2, s3;
      this.version = "4.8.3", this.options = void 0, this.defaults = j, this.plugins = [], this.visit = void 0, this.cache = void 0, this.hooks = void 0, this.classes = void 0, this.location = l.fromUrl(window.location.href), this.currentHistoryIndex = void 0, this.clickDelegate = void 0, this.navigating = false, this.onVisitEnd = void 0, this.use = O, this.unuse = D, this.findPlugin = M, this.log = () => {
      }, this.navigate = V, this.performNavigation = I, this.createVisit = S, this.delegateEvent = a, this.fetchPage = u, this.awaitAnimations = $, this.renderPage = N, this.replaceContent = q, this.animatePageIn = T, this.animatePageOut = L, this.scrollToContent = R, this.getAnchorElement = C, this.getCurrentUrl = n3, this.resolveUrl = W, this.isSameResolvedUrl = B, this.options = i2({}, this.defaults, t2), this.handleLinkClick = this.handleLinkClick.bind(this), this.handlePopState = this.handlePopState.bind(this), this.cache = new d(this), this.classes = new k(this), this.hooks = new E(this), this.visit = this.createVisit({ to: "" }), this.currentHistoryIndex = null != (e2 = null == (s3 = window.history.state) ? void 0 : s3.index) ? e2 : 1, this.enable();
    }
    async enable() {
      var t2;
      const { linkSelector: e2 } = this.options;
      this.clickDelegate = this.delegateEvent(e2, "click", this.handleLinkClick), window.addEventListener("popstate", this.handlePopState), this.options.animateHistoryBrowsing && (window.history.scrollRestoration = "manual"), this.options.native = this.options.native && !!document.startViewTransition, this.options.plugins.forEach((t3) => this.use(t3));
      for (const [t3, e3] of Object.entries(this.options.hooks)) {
        const [i3, s3] = this.hooks.parseName(t3);
        this.hooks.on(i3, e3, s3);
      }
      "swup" !== (null == (t2 = window.history.state) ? void 0 : t2.source) && r3(null, { index: this.currentHistoryIndex }), await w(), await this.hooks.call("enable", void 0, void 0, () => {
        const t3 = document.documentElement;
        t3.classList.add("swup-enabled"), t3.classList.toggle("swup-native", this.options.native);
      });
    }
    async destroy() {
      this.clickDelegate.destroy(), window.removeEventListener("popstate", this.handlePopState), this.cache.clear(), this.options.plugins.forEach((t2) => this.unuse(t2)), await this.hooks.call("disable", void 0, void 0, () => {
        const t2 = document.documentElement;
        t2.classList.remove("swup-enabled"), t2.classList.remove("swup-native");
      }), this.hooks.clear();
    }
    shouldIgnoreVisit(t2, { el: e2, event: i3 } = {}) {
      const { origin: s3, url: n4, hash: o3 } = l.fromUrl(t2);
      return s3 !== window.location.origin || !(!e2 || !this.triggerWillOpenNewWindow(e2)) || !!this.options.ignoreVisit(n4 + o3, { el: e2, event: i3 });
    }
    handleLinkClick(t2) {
      const e2 = t2.delegateTarget, { href: i3, url: s3, hash: n4 } = l.fromElement(e2);
      if (this.shouldIgnoreVisit(i3, { el: e2, event: t2 })) return;
      if (this.navigating && s3 === this.visit.to.url) return void t2.preventDefault();
      const o3 = this.createVisit({ to: s3, hash: n4, el: e2, event: t2 });
      t2.metaKey || t2.ctrlKey || t2.shiftKey || t2.altKey ? this.hooks.callSync("link:newtab", o3, { href: i3 }) : 0 === t2.button && this.hooks.callSync("link:click", o3, { el: e2, event: t2 }, () => {
        var e3;
        const i4 = null != (e3 = o3.from.url) ? e3 : "";
        t2.preventDefault(), s3 && s3 !== i4 ? this.isSameResolvedUrl(s3, i4) || this.performNavigation(o3) : n4 ? this.hooks.callSync("link:anchor", o3, { hash: n4 }, () => {
          r3(s3 + n4), this.scrollToContent(o3);
        }) : this.hooks.callSync("link:self", o3, void 0, () => {
          "navigate" === this.options.linkToSelf ? this.performNavigation(o3) : (r3(s3), this.scrollToContent(o3));
        });
      });
    }
    handlePopState(t2) {
      var e2, i3, s3, o3;
      const r4 = null != (e2 = null == (i3 = t2.state) ? void 0 : i3.url) ? e2 : window.location.href;
      if (this.options.skipPopStateHandling(t2)) return;
      if (this.isSameResolvedUrl(n3(), this.location.url)) return;
      const { url: a2, hash: h } = l.fromUrl(r4), c2 = this.createVisit({ to: a2, hash: h, event: t2 });
      c2.history.popstate = true;
      const u2 = null != (s3 = null == (o3 = t2.state) ? void 0 : o3.index) ? s3 : 0;
      u2 && u2 !== this.currentHistoryIndex && (c2.history.direction = u2 - this.currentHistoryIndex > 0 ? "forwards" : "backwards", this.currentHistoryIndex = u2), c2.animation.animate = false, c2.scroll.reset = false, c2.scroll.target = false, this.options.animateHistoryBrowsing && (c2.animation.animate = true, c2.scroll.reset = true), this.hooks.callSync("history:popstate", c2, { event: t2 }, () => {
        this.performNavigation(c2);
      });
    }
    triggerWillOpenNewWindow(t2) {
      return !!t2.matches('[download], [target="_blank"]');
    }
  };

  // src/swup/swupTransition.ts
  var PAGE_ORDER = {
    "/": 0,
    "/chems": -1,
    "/sex": 1
  };
  function getPagePosition(url) {
    const path = new URL(url, window.location.origin).pathname.replace(/\/$/, "") || "/";
    return PAGE_ORDER[path] ?? 0;
  }
  function initSwup() {
    const swup = new _({
      animationSelector: '[class*="transition-"]',
      containers: ["#swup"],
      plugins: [new i({ persistAssets: true })]
    });
    swup.hooks.on("visit:start", (visit) => {
      const from = getPagePosition(visit.from.url);
      const to = getPagePosition(visit.to.url);
      if (to > from) {
        document.documentElement.classList.add("to-right");
      } else {
        document.documentElement.classList.add("to-left");
      }
    });
    swup.hooks.on("animation:out:end", () => {
      document.documentElement.classList.remove("to-left", "to-right");
    });
    return swup;
  }

  // src/index.ts
  var initGlobalFunctions = () => {
    initFsLibrairiesScripts();
  };
  var init = () => {
    initGlobalFunctions();
    const swup = initSwup();
    swup.hooks.on("content:replace", () => {
      destroyFsLibrairiesScripts();
    });
    swup.hooks.on("page:view", () => {
      initGlobalFunctions();
    });
    swup.hooks.on("visit:end", () => {
      restartWebflow();
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
//# sourceMappingURL=index.js.map
