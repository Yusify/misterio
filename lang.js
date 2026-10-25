/* MISTERIO — Dil seçici + valyuta
 * Header-dəki .lang-select elementini idarə edir.
 * Seçilən dil sessionStorage-da saxlanır (saytdan çıxana qədər).
 */
(function () {
  "use strict";
  const q = (id) => document.getElementById(id);

  function buildSelector(root) {
    if (!root) return;
    const cur = I18N.LANGS.find((l) => l.code === I18N.lang) || I18N.LANGS[0];
    root.innerHTML = `
      <button class="lang-toggle" aria-haspopup="true" aria-expanded="false">
        <span class="lang-flag">${cur.flag}</span><span class="lang-code">${cur.code.toUpperCase()}</span>
        <span class="lang-caret">▾</span>
      </button>
      <div class="lang-menu" role="menu">
        ${I18N.LANGS.map((l) => `
          <button class="lang-opt${l.code === I18N.lang ? " active" : ""}" data-lang="${l.code}" role="menuitem">
            <span class="lang-flag">${l.flag}</span>
            <span class="lang-name">${l.label}</span>
          </button>`).join("")}
      </div>`;

    const toggle = root.querySelector(".lang-toggle");
    const menu = root.querySelector(".lang-menu");
    toggle.onclick = (e) => {
      e.stopPropagation();
      const open = root.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    menu.querySelectorAll(".lang-opt").forEach((opt) => {
      opt.onclick = (e) => {
        e.stopPropagation();
        const code = opt.dataset.lang;
        I18N.setLang(code);
        I18N.apply();
        if (window.LANG_onChange) window.LANG_onChange(code);
        // bütün səhifələr üçün universal signal (profil kimi async səhifələr də eşidə bilsin)
        try { document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: code } })); } catch(e){}
        // toggle button məzmununu yenilə (buildSelector çağırmadan)
        const cur = I18N.LANGS.find((l) => l.code === code) || I18N.LANGS[0];
        const tg = root.querySelector(".lang-toggle");
        if (tg) tg.innerHTML = `<span class="lang-flag">${cur.flag}</span><span class="lang-code">${cur.code.toUpperCase()}</span><span class="lang-caret">▾</span>`;
        menu.querySelectorAll(".lang-opt").forEach((o) => o.classList.toggle("active", o.dataset.lang === code));
        root.classList.remove("open");
        tg.setAttribute("aria-expanded", "false");
      };
    });
    // xaricə klik → bağla (yalnız bir dəfə, init-də əlavə olunur)
  }

  function closeAll() {
    document.querySelectorAll(".lang-select.open").forEach((s) => {
      s.classList.remove("open");
      const t = s.querySelector(".lang-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  function init() {
    I18N.setLang(I18N.lang); // dir/lang quraşdır
    I18N.apply();            // mətnləri tərcümə et
    document.querySelectorAll(".lang-select").forEach(buildSelector);
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".lang-select")) closeAll();
    });
  }

  // səhifə yüklenəndə (i18n.js-dən sonra çağrılır)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.LANG_init = init;
})();
