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

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
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
    document.body.classList.add("page-out");
    setTimeout(() => { window.location.href = href; }, 200);
  });

  // səhifə geri/geriya düyməsi ilə gələndə də hamar olsun
  window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-out");
  });
})();
