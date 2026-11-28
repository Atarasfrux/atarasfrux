/* entropy.js — every page dissolves into pure black / white.
   One blue word (Stay / Likis / Bli / Fique) frames each actual piece of work, beside its title.
   Pressing it shows that work in full screen, which holds the page. Nothing else stops the clock.
   Includes seamless full-viewport fallback for iPhone Safari where HTMLElement.requestFullscreen is unsupported.
   The collapse starts at the centre and spreads outward: the text turns porous and breaks into
   particles. While a blue word is still visible it can be pressed, which rescues the page. After the
   last word has gone, input does nothing until the page reaches zero and the site returns to its start.
   Active only when entered through the front page (index.html) (sessionStorage flag) or with ?entropy=1.
   Testing: ?idle=10 sets the clock in seconds (kept for the session). */
(function () {
  var ss = window.sessionStorage, qs = new URLSearchParams(location.search);
  var isTar = /\/(index(_tar)?(\.html)?)?$/.test(location.pathname);
  try {
    if (isTar || qs.get("entropy") === "1") ss.setItem("greifiks-entropy", "1");
    if (qs.get("idle")) ss.setItem("greifiks-idle", qs.get("idle"));
  } catch (e) {}
  var on = false; try { on = ss.getItem("greifiks-entropy") === "1"; } catch (e) {}
  if (!on) return;

  var CLOCK = 60000, DUR = 39000, HOME = "./";
  try { var q = parseFloat(ss.getItem("greifiks-idle")); if (q > 0) CLOCK = q * 1000; } catch (e) {}

  var root = document.documentElement;
  function on_(name) { return new RegExp("/" + name + "(\\.html)?$").test(location.pathname); }
  var pageSlug = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index";
  function track(ev) { if (window.greifiksTrack) window.greifiksTrack(ev + "/" + pageSlug, ev + ": " + pageSlug); }
  var L = { en: ["Stay", "Leave"], lt: ["Likis", "Išeik"], nb: ["Bli", "Gå"], pt: ["Fique", "Saia"] };
  function lbl(i) { return (L[root.lang] || L.en)[i]; }

  /* ---------- styles: blue is the only colour on the site, and it means "stay with this work" ---------- */
  var css = document.createElement("style");
  css.textContent = [
    "html{--fs-blue:#4d8dff;}html[data-theme=light]{--fs-blue:#1a56f0;}",
    ".fs-btn{color:var(--fs-blue)!important;display:inline-block;font-family:var(--mono,ui-monospace,monospace);font-size:.68rem;",
    "letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;background:none;border:0;padding:4px 0;margin:0;cursor:pointer;line-height:1;}",
    ".fs-btn:hover,.fs-btn:focus-visible{text-decoration:underline;text-underline-offset:4px;outline:none;}",
    ".fs-head{display:flex;align-items:baseline;flex-wrap:wrap;column-gap:22px;row-gap:4px;}",
    ".fs-head>h1,.fs-head>h2,.fs-head>h3{flex:0 1 auto;min-width:0;}",
    ".fs-row{display:flex;margin:0 0 10px;}",
    ".fs-row.fs-inline{display:inline-flex;margin:0;}.lb-controls .fs-btn{padding:6px 10px;border:1px solid var(--fs-blue);}",
    /* a work in native full screen OR iPhone full-viewport fallback */
    ".fs-target:fullscreen{background:var(--bg);overflow-y:auto;box-sizing:border-box;margin:0;max-width:none;width:100vw;height:100vh;padding:9vh max(24px,calc(50vw - 380px)) 14vh;}",
    ".fs-target:fullscreen::backdrop{background:var(--bg);}",
    ".fs-target.fs-pseudo{position:fixed!important;inset:0!important;z-index:2147483644!important;background:var(--bg)!important;overflow-y:auto!important;box-sizing:border-box!important;margin:0!important;max-width:none!important;width:100vw!important;height:100vh!important;height:100dvh!important;padding:9vh max(24px,calc(50vw - 380px)) 14vh!important;}",
    ".fs-pseudo-exit{position:fixed!important;top:14px!important;right:18px!important;z-index:2147483645!important;background:rgba(9,10,12,.78)!important;padding:6px 10px!important;border:1px solid var(--fs-blue)!important;}",
    /* the film fills the whole screen: no reading column */
    ".stage-wrap.fs-target:fullscreen{padding:0;overflow:hidden;background:#000;width:100vw;height:100vh;max-width:none;}",
    ".stage-wrap.fs-target:-webkit-full-screen{padding:0;overflow:hidden;background:#000;width:100vw;height:100vh;max-width:none;}",
    ".stage-wrap.fs-target.fs-pseudo{padding:0!important;overflow:hidden!important;background:#000!important;display:flex!important;flex-direction:column!important;border:0!important;}",
    ".stage-wrap.fs-target.fs-pseudo .stage{flex:1!important;min-height:0!important;aspect-ratio:auto!important;}",
    ".craft-strip.fs-target:fullscreen{display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:2vh 2vw;background:#000;padding:4vh 3vw;}",
    ".craft-strip.fs-target.fs-pseudo{display:flex!important;flex-wrap:wrap!important;align-content:center!important;justify-content:center!important;gap:2vh 2vw!important;background:#000!important;padding:4vh 3vw!important;}",
    ".craft-strip.fs-target:fullscreen figure,.craft-strip.fs-target.fs-pseudo figure{flex:0 1 30vw;margin:0;}",
    ".craft-strip.fs-target:fullscreen img,.craft-strip.fs-target.fs-pseudo img{width:100%;height:auto;max-height:42vh;object-fit:contain;}",
    ".lightbox:fullscreen,.lightbox.fs-pseudo{background:#000!important;padding:0!important;}",
    ".lightbox:fullscreen .lb-stage,.lightbox.fs-pseudo .lb-stage{padding:0;}",
    ".lightbox:fullscreen .lb-stage img,.lightbox.fs-pseudo .lb-stage img{max-width:100vw;max-height:100vh;width:auto;height:auto;}",
    ".lightbox:fullscreen .lb-bar,.lightbox:fullscreen .lb-foot,.lightbox.fs-pseudo .lb-bar,.lightbox.fs-pseudo .lb-foot{position:fixed;left:0;right:0;z-index:2;opacity:0;transition:opacity .4s;background:rgba(0,0,0,.55);padding:12px 20px;border:0;}",
    ".lightbox:fullscreen .lb-bar,.lightbox.fs-pseudo .lb-bar{top:0;}.lightbox:fullscreen .lb-foot,.lightbox.fs-pseudo .lb-foot{bottom:0;}",
    ".lightbox:fullscreen.ui-show .lb-bar,.lightbox:fullscreen.ui-show .lb-foot,.lightbox.fs-pseudo.ui-show .lb-bar,.lightbox.fs-pseudo.ui-show .lb-foot{opacity:1;}",
    /* the collapse layers */
    "#entropy-veil{position:fixed;left:50%;top:50%;width:0;height:0;transform:translate(-50%,-50%);border-radius:50%;z-index:2147483645;pointer-events:none;}",
    "#entropy-dust{position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483646;pointer-events:none;}",
    "#entropy-block{position:fixed;inset:0;z-index:2147483647;pointer-events:all;background:transparent;cursor:default;}",
    "#entropy-block.over-stay{cursor:pointer;}"
  ].join("");
  (document.head || root).appendChild(css);

  /* ---------- full screen (native + seamless iPhone Safari fallback) ---------- */
  var pseudoTarget = null, pseudoExitBtn = null, prevBodyOverflow = "";
  function nativeFsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsEl() { return nativeFsEl() || pseudoTarget; }
  function anyVideoFs() {
    var v = document.querySelectorAll("video");
    for (var i = 0; i < v.length; i++) if (v[i].webkitDisplayingFullscreen) return true;
    return false;
  }
  function locked() { return !!fsEl() || anyVideoFs(); }

  function enterPseudoFs(el) {
    if (pseudoTarget === el) return;
    exitPseudoFs();
    pseudoTarget = el;
    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.classList.add("fs-pseudo");
    var hasInnerBtn = fsButtons.some(function (b) { return b.__target === el && el.contains(b); });
    if (!hasInnerBtn) {
      pseudoExitBtn = document.createElement("button");
      pseudoExitBtn.type = "button";
      pseudoExitBtn.className = "fs-btn fs-pseudo-exit";
      pseudoExitBtn.textContent = lbl(1);
      pseudoExitBtn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); exitPseudoFs(); });
      el.appendChild(pseudoExitBtn);
    }
    onFs();
  }
  function exitPseudoFs() {
    if (!pseudoTarget) return;
    if (pseudoExitBtn && pseudoExitBtn.parentNode) pseudoExitBtn.parentNode.removeChild(pseudoExitBtn);
    pseudoExitBtn = null;
    pseudoTarget.classList.remove("fs-pseudo");
    pseudoTarget = null;
    document.body.style.overflow = prevBodyOverflow;
    onFs();
  }
  function enterFs(el) {
    var r = el.requestFullscreen || el.webkitRequestFullscreen;
    if (r) {
      try {
        var p = r.call(el);
        if (p && p.catch) p.catch(function () { enterPseudoFs(el); });
        return;
      } catch (e) {}
    }
    enterPseudoFs(el);
  }
  function exitFs() {
    if (pseudoTarget) { exitPseudoFs(); return; }
    var x = document.exitFullscreen || document.webkitExitFullscreen;
    if (x && nativeFsEl()) { try { var p = x.call(document); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
  }
  window.greifiksExitFs = exitFs;
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && pseudoTarget && !running) { e.preventDefault(); exitPseudoFs(); }
  });

  /* zero state: any film or sound that was not held by a blue word dies with the page, it must not play on in the background */
  var dead = false;
  function killMedia() {
    dead = true;
    [].forEach.call(document.querySelectorAll("video,audio"), function (m) {
      try { m.pause(); m.muted = true; m.removeAttribute("src"); m.srcObject = null; m.load(); } catch (x) {}
    });
    try { if (window.greifiksStopMedia) window.greifiksStopMedia(); } catch (x) {}
  }
  window.addEventListener("pagehide", function () { if (dead) killMedia(); });
  window.addEventListener("pageshow", function (ev) { if (dead && ev.persisted) location.replace(HOME); });

  var fsButtons = [];
  /* the blue word for one work. o.before: runs first. o.click: custom action instead of full screen */
  function makeBtn(target, o) {
    o = o || {};
    var b = document.createElement("button");
    b.type = "button"; b.className = "fs-btn"; b.__target = target;
    target.classList.add("fs-target");
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      if (fsEl() !== target) track("stay");
      if (o.click) { o.click(); return; }
      if (fsEl() === target) { exitFs(); return; }
      if (o.before) o.before();
      enterFs(target);
    });
    fsButtons.push(b);
    return b;
  }
  function besideTitle(h, target, o) {
    if (!h || !target) return null;
    var w = document.createElement("div"); w.className = "fs-head";
    h.parentNode.insertBefore(w, h); w.appendChild(h);
    var b = makeBtn(target, o); w.appendChild(b);
    return b;
  }
  function aboveGroup(g, o) {
    if (!g) return null;
    var row = document.createElement("div"); row.className = "fs-row";
    var b = makeBtn(g, o); row.appendChild(b); g.parentNode.insertBefore(row, g);
    return b;
  }
  function syncFsLabels() {
    fsButtons.forEach(function (b) { b.textContent = lbl(fsEl() === b.__target ? 1 : 0); });
    if (pseudoExitBtn) pseudoExitBtn.textContent = lbl(1);
  }

  /* one word per actual work or act of attention; nothing for pure navigation hubs */
  function wire() {
    var main = document.querySelector("main"), q = function (s) { return document.querySelector(s); };
    if (on_("dossier")) {                                // Bio: the CV as a whole, and the five craft images as one set
      besideTitle(q("main h1"), main);
      aboveGroup(q(".craft-strip"));
    }
    if (on_("writing")) {                                // Ink: each piece of writing
      [].forEach.call(document.querySelectorAll("article.piece"), function (a) { besideTitle(a.querySelector("h2"), a); });
    }
    if (on_("mechanics")) {                              // Form: each designed plate (the reference list is left out)
      ["#frame", "#wall-physics", "#classics"].forEach(function (id) { var s = q(id); if (s) besideTitle(s.querySelector("h2"), s); });
    }
    if (on_("link")) {                                   // Back: holding the desk to write a direct letter
      besideTitle(q("main h1"), main);
    }
    var lb = document.getElementById("lightbox");
    if (on_("plates") && lb) {                           // Photography: the series, opened in the viewer from plate I
      besideTitle(q("main h1"), lb, { before: function () { var t = q("#plate-grid .plate-trigger"); if (t && !lb.classList.contains("open")) t.click(); } });
      var ctr = lb.querySelector(".lb-controls");
      if (ctr) { var row = document.createElement("div"); row.className = "fs-row fs-inline"; row.appendChild(makeBtn(lb)); ctr.insertBefore(row, ctr.lastElementChild); }
      var hideT;
      function showLbUi() {
        lb.classList.add("ui-show"); clearTimeout(hideT);
        hideT = setTimeout(function () { lb.classList.remove("ui-show"); }, 1800);
      }
      lb.addEventListener("mousemove", showLbUi);
      lb.addEventListener("touchstart", showLbUi, { passive: true });
      new MutationObserver(function () { if (!lb.classList.contains("open") && fsEl() === lb) exitFs(); })
        .observe(lb, { attributes: true, attributeFilter: ["class"] });
    }
    var stage = document.getElementById("stage-wrap"), pfs = document.getElementById("btn-fs");
    if (on_("vestiges") && stage && pfs) {               // Film: native fullscreen when available, clean viewport lock on iPhone
      besideTitle(q("main h1"), stage, {
        click: function () {
          if (fsEl() === stage) { exitFs(); return; }
          if (stage.requestFullscreen || stage.webkitRequestFullscreen) { pfs.click(); return; }
          enterPseudoFs(stage);
        }
      });
    }

    /* inside this path, Index links lead back to the tar front page */
    [].forEach.call(document.querySelectorAll('a[href="index.html"], a[href="/"], a[href="./"]'), function (a) {
      a.setAttribute("href", HOME);
    });
    syncFsLabels();
    new MutationObserver(syncFsLabels).observe(root, { attributes: true, attributeFilter: ["lang"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire); else wire();

  /* ---------- the clock: input does not stop it, only Stay (full screen) does ---------- */
  var start0 = performance.now(), running = false;
  function onFs() { if (!running) start0 = performance.now(); syncFsLabels(); try { document.dispatchEvent(new Event("greifiks-fs-change")); } catch (e) {} }
  document.addEventListener("fullscreenchange", onFs);
  document.addEventListener("webkitfullscreenchange", onFs);
  setInterval(function () {
    if (running) return;
    if (locked()) { start0 = performance.now(); return; }
    if (performance.now() - start0 >= CLOCK) start();
  }, 250);
  window.greifiksClock = function () { return running ? -1 : Math.max(0, CLOCK - (performance.now() - start0)); };

  /* ---------- the collapse ---------- */
  var items = [], parts = [], S = null;

  function liveStay(x, y) {
    if (!S) return null;
    var t = performance.now() - S.t0;
    for (var i = 0; i < fsButtons.length; i++) {
      var b = fsButtons[i], r = b.getBoundingClientRect();
      if (r.width < 1 || x < r.left - 8 || x > r.right + 8 || y < r.top - 8 || y > r.bottom + 8) continue;
      var it = null;
      for (var k = 0; k < items.length; k++) if (items[k].el === b || items[k].el.contains(b)) { it = items[k]; break; }
      if (!it) continue;
      if ((t - it.delay) / it.len < 0.6) return b;
    }
    return null;
  }
  function guard(e) {
    if (!running) return;
    if ((e.type === "click" || e.type === "touchend") && S && e.isTrusted) {
      var pt = e.changedTouches ? e.changedTouches[0] : e;
      var b = pt ? liveStay(pt.clientX, pt.clientY) : null;
      if (b) { e.preventDefault(); e.stopPropagation(); rescue(); b.click(); return; }
    }
    e.preventDefault(); e.stopPropagation();
  }
  ["keydown", "wheel", "touchmove", "touchend", "click", "mousedown", "contextmenu"].forEach(function (ev) {
    window.addEventListener(ev, guard, { capture: true, passive: false });
  });

  var NF = 14;
  function filters() {
    if (document.getElementById("entropy-defs")) return;
    var s = '<svg id="entropy-defs" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true"><defs>';
    for (var k = 1; k < NF; k++) {
      var a = k / (NF - 1), thr = 0.3 + a * 0.5, sl = 22;
      s += '<filter id="egp' + k + '" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na"/>' +
        '<feComponentTransfer in="na" result="m"><feFuncA type="linear" slope="' + sl + '" intercept="' + (0.5 - sl * thr).toFixed(2) + '"/></feComponentTransfer>' +
        '<feComposite in="SourceGraphic" in2="m" operator="in" result="p"/>' +
        '<feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" seed="9" result="d"/>' +
        '<feDisplacementMap in="p" in2="d" scale="' + (a * a * 46).toFixed(1) + '" xChannelSelector="R" yChannelSelector="G"/></filter>';
    }
    document.body.insertAdjacentHTML("beforeend", s + "</defs></svg>");
  }

  function start() {
    running = true;
    var col = root.getAttribute("data-theme") === "light" ? "#fff" : "#000";
    var blk = document.createElement("div"); blk.id = "entropy-block";
    var veil = null, dust = null, ctx = null, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!isTar) {
      veil = document.createElement("div"); veil.id = "entropy-veil";
      dust = document.createElement("canvas"); dust.id = "entropy-dust";
      dust.width = innerWidth * dpr; dust.height = innerHeight * dpr;
      var soft = Math.round(Math.min(innerWidth, innerHeight) * 0.1);
      veil.style.background = col; veil.style.boxShadow = "0 0 " + soft + "px " + Math.round(soft * 0.4) + "px " + col;
      document.body.appendChild(veil); document.body.appendChild(dust);
      ctx = dust.getContext("2d");
    }
    document.body.appendChild(blk);
    blk.addEventListener("mousemove", function (e) { blk.classList.toggle("over-stay", !!liveStay(e.clientX, e.clientY)); });

    S = { t0: performance.now(), col: col, veil: veil, dust: dust, blk: blk, ctx: ctx, dpr: dpr, raf: 0, end: 0, last: performance.now() };
    window.greifiksEntropy = { t0: S.t0, dur: DUR };
    try { window.dispatchEvent(new CustomEvent("greifiks-entropy", { detail: { dur: DUR } })); } catch (e) {}

    if (!isTar) {
      filters(); collect();
      var sh = veil.style.boxShadow;
      veil.animate([
        { width: "0px", height: "0px", boxShadow: sh, offset: 0 },
        { width: "0px", height: "0px", boxShadow: sh, offset: 0.3 },
        { width: innerWidth * 1.25 + "px", height: innerHeight * 1.25 + "px", boxShadow: sh, offset: 0.93 },
        { width: innerWidth * 1.8 + "px", height: innerHeight * 1.8 + "px", boxShadow: sh, offset: 0.985 },
        { width: innerWidth * 1.8 + "px", height: innerHeight * 1.8 + "px", boxShadow: "0 0 0 300vmax " + col, offset: 1 }
      ], { duration: DUR, easing: "linear", fill: "forwards" });
      S.raf = requestAnimationFrame(frame);
    }

    S.end = setTimeout(function () {
      if (!isTar) { track("collapse"); killMedia(); setTimeout(function () { location.replace(HOME); }, 80); return; }
      try { window.dispatchEvent(new CustomEvent("greifiks-entropy-done")); } catch (e) {}
      window.greifiksEntropy = null;
      if (S.blk) S.blk.remove();
      S = null; running = false; start0 = performance.now();
    }, DUR);
  }

  function rescue() {
    if (!S) return;
    track("rescue");
    clearTimeout(S.end); cancelAnimationFrame(S.raf);
    if (S.veil) S.veil.remove(); if (S.dust) S.dust.remove(); if (S.blk) S.blk.remove();
    items.forEach(function (it) {
      var st = it.el.style;
      st.filter = it.o.filter; st.opacity = it.o.opacity; st.transform = it.o.transform; st.display = it.o.display;
    });
    items = []; parts = []; S = null;
    window.greifiksEntropy = null;
    running = false; start0 = performance.now();
  }

  function collect() {
    var vh = innerHeight, picked = [];
    var all = document.body.querySelectorAll("h1,h2,h3,h4,p,li,a,button,span,img,video,figure,canvas,svg,blockquote,code,td,th,label,input,textarea,figcaption,hr");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.closest("#entropy-defs")) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 1 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > innerWidth) continue;
      var dup = false;
      for (var k = 0; k < picked.length; k++) if (picked[k].contains(el)) { dup = true; break; }
      if (!dup) picked.push(el);
    }
    var cx = innerWidth / 2, cy = vh / 2;
    items = picked.map(function (el) {
      var st = el.style, cs = getComputedStyle(el);
      var it = { el: el, o: { filter: st.filter, opacity: st.opacity, transform: st.transform, display: st.display } };
      if (cs.display === "inline") st.display = "inline-block";
      var r = el.getBoundingClientRect();
      var dx = (Math.max(r.left, Math.min(cx, r.right)) - cx) / cx, dy = (Math.max(r.top, Math.min(cy, r.bottom)) - cy) / cy;
      var d = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 1.2);
      it.len = DUR * (0.2 + Math.random() * 0.08);
      it.delay = d * DUR * 0.66 + Math.random() * DUR * 0.03;
      if (it.delay + it.len > DUR * 0.96) it.delay = DUR * 0.96 - it.len;
      var mx = (r.left + r.right) / 2 - cx, my = (r.top + r.bottom) / 2 - cy, m = Math.hypot(mx, my) || 1;
      it.ux = mx / m; it.uy = my / m;
      it.r = r; it.k = 0; it.acc = 0; it.p = 0;
      var media = /^(IMG|VIDEO|CANVAS|SVG|svg)$/.test(el.tagName);
      it.c = media ? (S.col === "#000" ? "rgba(170,170,170," : "rgba(80,80,80,") : rgbaPrefix(cs.color);
      it.total = Math.max(10, Math.min(media ? 900 : 420, r.width * r.height / (media ? 120 : 160)));
      return it;
    });
  }
  function rgbaPrefix(c) {
    var m = c.match(/[\d.]+/g) || [128, 128, 128];
    return "rgba(" + m[0] + "," + m[1] + "," + m[2] + ",";
  }

  function frame(now) {
    if (!S) return;
    var t = now - S.t0, dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
    for (var i = 0; i < items.length; i++) {
      var it = items[i], p = (t - it.delay) / it.len;
      if (p <= 0 || it.p >= 1) continue;
      p = Math.min(1, p);
      var k = Math.min(NF - 1, Math.floor(p * NF));
      if (k !== it.k) { it.k = k; it.el.style.filter = k ? "url(#egp" + k + ")" : ""; }
      var push = p * p * 18;
      it.el.style.transform = "translate(" + (it.ux * push).toFixed(1) + "px," + (it.uy * push).toFixed(1) + "px)";
      it.el.style.opacity = p > 0.7 ? Math.max(0, 1 - (p - 0.7) / 0.3).toFixed(3) : "";
      it.acc += it.total * (p - it.p) * (0.4 + 1.2 * p);
      it.p = p;
      while (it.acc >= 1 && parts.length < 6000) {
        it.acc -= 1;
        var sp = 14 + Math.random() * 60, a = (Math.random() - 0.5) * 1.4;
        var vx = it.ux * Math.cos(a) - it.uy * Math.sin(a), vy = it.ux * Math.sin(a) + it.uy * Math.cos(a);
        parts.push({ x: it.r.left + Math.random() * it.r.width + it.ux * push, y: it.r.top + Math.random() * it.r.height + it.uy * push,
          vx: vx * sp, vy: vy * sp, life: 0, max: 1.4 + Math.random() * 2.2, s: Math.random() < 0.8 ? 1 : 1.8, c: it.c });
      }
      if (it.acc > 50) it.acc = 50;
    }
    var ctx = S.ctx, dpr = S.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    var keep = [];
    for (var j = 0; j < parts.length; j++) {
      var p2 = parts[j];
      p2.life += dt; if (p2.life >= p2.max) continue;
      p2.vx *= 1 + dt * 0.35; p2.vy *= 1 + dt * 0.35;
      p2.x += p2.vx * dt; p2.y += p2.vy * dt;
      var al = (1 - p2.life / p2.max); al = al * al * 0.9;
      ctx.fillStyle = p2.c + al.toFixed(3) + ")";
      ctx.fillRect(p2.x, p2.y, p2.s, p2.s);
      keep.push(p2);
    }
    parts = keep;
    S.raf = requestAnimationFrame(frame);
  }
})();
