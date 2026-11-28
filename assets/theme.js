/* greifiks.org — Zero-Flash Theme Controller (Dark Default + Light/Dark Switch) */
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

  /* Language: a visitor's own choice (clicking LT/EN/NO/PT) wins; otherwise the country of the
     device's time zone decides, then the browser's language, then English. Nothing leaves the browser. */
  var TZ = {
    "Europe/Vilnius": "lt", "Europe/Oslo": "no", "Arctic/Longyearbyen": "no",
    "Europe/Lisbon": "pt", "Atlantic/Azores": "pt", "Atlantic/Madeira": "pt", "Africa/Luanda": "pt", "Africa/Maputo": "pt",
    "America/Sao_Paulo": "pt", "America/Fortaleza": "pt", "America/Recife": "pt", "America/Bahia": "pt", "America/Belem": "pt",
    "America/Maceio": "pt", "America/Araguaina": "pt", "America/Santarem": "pt", "America/Manaus": "pt", "America/Cuiaba": "pt",
    "America/Campo_Grande": "pt", "America/Porto_Velho": "pt", "America/Boa_Vista": "pt", "America/Rio_Branco": "pt",
    "America/Eirunepe": "pt", "America/Noronha": "pt"
  };
  function autoLang() {
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
  window.greifiksLang = function () {
    try {
      var m = localStorage.getItem("greifiks-lang");
      if (localStorage.getItem("greifiks-lang-manual") === "1" && /^(lt|en|no|pt)$/.test(m)) return m;
    } catch (e) {}
    return autoLang();
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lang]");
    if (b) try { localStorage.setItem("greifiks-lang-manual", "1"); } catch (er) {}
  }, true);
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
