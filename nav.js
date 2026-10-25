/* MISTERIO — Sürətli səhifə keçidləri (smooth)
 * Nav linklərinə klikləyəndə səhifə solur, sonra yeni səhifə açılır.
 * Eyni səhifəyə klik və ya external linklər üçün heç bir şey etmir.
 */
(function () {
  "use strict";

  function isInternal(href) {
    if (!href) return false;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    if (href.startsWith("#")) return false;
    return true;
  }

  /*LOADING-ANIM-START*/
  function showPageLoading() {
    const el = document.getElementById("pageLoading");
    if (el) { el.classList.remove("hidden"); el.style.opacity = "1"; el.style.visibility = "visible"; }
  }
  function hidePageLoading() {
    const el = document.getElementById("pageLoading");
    if (el) el.classList.add("hidden");
  }
  // profil.js / spin.js / index.html və s. hər səhifənin öz render funksiyası
  // (renderHomeUser(), requireAuth() sonrası) çağırır — nav.js ümumi çağırış etmir.
  window.hidePageLoading = hidePageLoading;
  /*LOADING-ANIM-END*/

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    // dil seçici və ya onun içinəki elementlər üçün heç bir şey etmə
    if (e.target.closest(".lang-select")) return;

    // Misterio loqosu: həmişə ana səhifəyə (index.html) yönləndir.
    // index.html özü mövcud auth vəziyyətinə görə ya landing (qonaq),
    // ya da dashboard (daxil olmuş istifadəçi) göstərir — yeni səhifə/rout yox.
    if (a.classList && a.classList.contains("logo")) {
      e.preventDefault();
      showPageLoading();           // keçid başlayan kənarı köhnə/default görünüşü gizlə, yalnız animasiyanı göstər
      window.location.href = "index.html";
      return;
    }

    const href = a.getAttribute("href");
    if (!href) return;
    if (!isInternal(href)) return;
    // Eyni səhifədirsə və ya modifier basılıbsa, standart davranış
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const target = href.split("#")[0];
    const cur = location.pathname.split("/").pop() || "index.html";
    if (target === cur) {
      // eyni səhifə — sadəcə yuxarı scroll et
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // sürətli keçid: səhifəni sol və yönləndir
    e.preventDefault();
    showPageLoading();           // keçid başlayan kənarı köhnə/default görünüşü gizlə, yalnız animasiyanı göstər
    document.getElementById("pageWrap").classList.add("page-out");
    setTimeout(() => { window.location.href = href; }, 200);
  });

  // səhifə geri/geriya düyməsi ilə gələndə də hamar olsun
  window.addEventListener("pageshow", () => {
    document.getElementById("pageWrap").classList.remove("page-out");
  });

  /* Bütün səhifələrdə "Çarxı fırlat" düyməsi vurulanda spin.html-ə bayraq qoyuruq.
     Beləliklə spin.html açılan kimi "Çarx Hazırlanır" placeholder-i göstərilir
     (profile.js-dən köçürülüb, ortaq fayla daşındı). */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href="spin.html"], a[href^="spin.html?"]');
    const b = e.target.closest && e.target.closest('#freeSpinBtn, button');
    if (a || (b && /çarx/i.test(b.textContent || ""))) {
      try { sessionStorage.setItem("mist_show_spin_cats", "1"); } catch {}
    }
  });
})();
