/* greifiks.org — Zero-Flash Theme & Automatic Timezone-First i18n Controller */
(function () {
  var KEY = "greifiks-theme";
  var root = document.documentElement;
  var theme = "dark";
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") theme = saved;
  } catch (e) {}
  root.setAttribute("data-theme", theme);

  function syncThemeBtn() {
    var cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    var l = (root.lang || "en").toLowerCase();
    var lightLbl = l === "lt" ? "Šviesi" : ((l === "no" || l === "nb") ? "Lys" : (l === "pt" ? "Claro" : "Light"));
    var darkLbl = l === "lt" ? "Tamsi" : ((l === "no" || l === "nb") ? "Mørk" : (l === "pt" ? "Escuro" : "Dark"));
    var btns = document.querySelectorAll("[data-theme-set]");
    for (var i = 0; i < btns.length; i++) {
      var target = btns[i].getAttribute("data-theme-set");
      var isAct = target === cur;
      btns[i].textContent = target === "light" ? lightLbl : darkLbl;
      btns[i].classList.toggle("active", isAct);
      btns[i].setAttribute("aria-pressed", isAct ? "true" : "false");
    }
  }

  function applySaved() {
    var t = "dark";
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") t = saved;
    } catch (e) {}
    root.setAttribute("data-theme", t);
    syncThemeBtn();
  }

  window.greifiksSyncTheme = syncThemeBtn;

  /* Pure automatic language: device time zone decides first, then browser language, then English.
     Silent URL override (?lang=lt|en|no|pt) exists strictly for direct preview without UI selectors. */
  var TZ = {
    "Europe/Vilnius": "lt",
    "Europe/Oslo": "no", "Arctic/Longyearbyen": "no", "Atlantic/Jan_Mayen": "no",
    "Europe/Lisbon": "pt", "Portugal": "pt", "Atlantic/Azores": "pt", "Atlantic/Madeira": "pt",
    "Atlantic/Cape_Verde": "pt", "Africa/Luanda": "pt", "Africa/Maputo": "pt",
    "Africa/Bissau": "pt", "Africa/Sao_Tome": "pt", "Asia/Dili": "pt",
    "America/Sao_Paulo": "pt", "America/Fortaleza": "pt", "America/Recife": "pt", "America/Bahia": "pt",
    "America/Belem": "pt", "America/Maceio": "pt", "America/Araguaina": "pt", "America/Santarem": "pt",
    "America/Manaus": "pt", "America/Cuiaba": "pt", "America/Campo_Grande": "pt", "America/Porto_Velho": "pt",
    "America/Boa_Vista": "pt", "America/Rio_Branco": "pt", "America/Eirunepe": "pt", "America/Noronha": "pt",
    "Brazil/East": "pt", "Brazil/West": "pt", "Brazil/DeNoronha": "pt", "Brazil/Acre": "pt"
  };

  function autoLang() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q) {
        q = q.toLowerCase();
        if (q === "nb" || q === "nn") q = "no";
        if (/^(lt|en|no|pt)$/.test(q)) return q;
      }
    } catch (e) {}
    try { var z = Intl.DateTimeFormat().resolvedOptions().timeZone; if (TZ[z]) return TZ[z]; } catch (e) {}
    var ls = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < ls.length; i++) {
      var c = String(ls[i]).toLowerCase().slice(0, 2);
      if (c === "lt") return "lt";
      if (c === "nb" || c === "nn" || c === "no") return "no";
      if (c === "pt") return "pt";
      if (c === "en") return "en";
    }
    return "en";
  }

  window.greifiksLang = autoLang;

  /* Silent, cookie-free custom event helper for GoatCounter (no-op if blocked or offline) */
  window.greifiksTrack = function (path, title) {
    try {
      if (window.goatcounter && typeof window.goatcounter.count === "function") {
        window.goatcounter.count({ path: String(path).replace(/^\/+/, ""), title: title || path, event: true });
      }
    } catch (e) {}
  };

  /* Unified automatic i18n wiring shared across all pages */
  window.greifiksI18n = function (cfg) {
    cfg = cfg || {};
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
    var EN = { page_title: document.title };
    nodes.forEach(function (el) { EN[el.getAttribute("data-i18n")] = el.innerHTML; });
    var dicts = { en: EN, lt: cfg.lt || EN, no: cfg.no || EN, pt: cfg.pt || EN };

    function apply(lang) {
      var l = (lang === "lt" || lang === "no" || lang === "pt") ? lang : "en";
      var d = dicts[l];
      root.lang = l === "no" ? "nb" : l;
      if (d.page_title || EN.page_title) document.title = d.page_title || EN.page_title;
      nodes.forEach(function (el) {
        var k = el.getAttribute("data-i18n");
        el.innerHTML = d[k] !== undefined ? d[k] : EN[k];
      });
      syncThemeBtn();
      if (cfg.onChange) cfg.onChange(l);
    }

    apply(autoLang());
    return apply;
  };

  window.addEventListener("pageshow", applySaved);
  window.addEventListener("storage", function (ev) {
    if (ev.key === KEY) applySaved();
  });

  document.addEventListener("DOMContentLoaded", function () {
    applySaved();
    var btns = document.querySelectorAll("[data-theme-set]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        var next = this.getAttribute("data-theme-set") === "light" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        syncThemeBtn();
      });
    }
  });
})();
