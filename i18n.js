/* MISTERIO — Mətnlər (yalnız AZ)
 * Sayt tamamilə Azərbaycan dilindədir.
 */
(function () {
  "use strict";

  // ───────── Tərcümələr (yalnız AZ) ─────────
  const T = {
    az: {
      "app.name": "Misterio",
      "nav.home": "Ana səhifə", "nav.spin": "Çarx", "nav.pricing": "Qiymətlər",
      "nav.profile": "Profil", "nav.addCompany": "Şirkət əlavə et",
      "nav.login": "Daxil ol", "nav.logout": "Çıxış",
      "hero.badge": "🔮 Sürpriz endirim platforması",
      "hero.title1": "Bu gün səni",
      "hero.title2": "nə gözləyir?",
      "hero.lead": "Çarxın arxasında nə gizlənir — bilmirsən. Bakının onlarla məkanından biri, gözlənilməz bir endirim.\n       Ayda 3 fırlatma — cəmi 9.90 AZN.",
      "hero.cta": "Çarxı fırlat 🔮",
      "hero.cta2": "İndi başla 🔮",
      "hero.signup": "Hesab yarat",
      "hero.hint": "Çarxı fırlatmaq üçün hesab və aktiv abunəlik tələb olunur.",
      "info.spinsTitle": "🔮 Ayda 3 fırlatma",
      "info.spinsDesc": "Hər ay 3 dəfə çarxı fırlada bilərsən. Nə çıxacağını əvvəlcədən heç kim bilmir.",
      "info.priceTitle": "💳 9.90 AZN / ay",
      "info.priceDesc": "Aylıq təkrarlanan abunəlik. Free trial yoxdur — qoşulduğun gün ilk fırlatmanı edə bilərsən.",
      "info.autoTitle": "✨ Avtomatik yenilənmə",
      "info.autoDesc": "3 fırlatma bitəndə növbəti ay hesabın avtomatik yenilənir. İstədiyin vaxt ləğv edə bilərsən.",
      "how.title": "Necə işləyir?",
      "step1.title": "Hesab yarat",
      "step1.desc": "Email ilə qeydiyyatdan keç və poçtuna gələn 6 rəqəmli kodla hesabını təsdiqlə.",
      "step2.title": "Abunə ol",
      "step2.desc": "9.90 AZN/ay ödə və ayda 3 fırlatma hüququ qazan.",
      "step3.title": "Çarxı fırlat",
      "step3.desc": "Kateqoriya seç (və ya \"Hamısı\") — çarx təsadüfi dayanır. Nəticəni əvvəlcədən heç kim bilmir.",
      "step4.title": "Kuponu istifadə et",
      "step4.desc": "Kupon \"Kuponlarım\"a düşür. Kassada kodu göstər — hər kupon 1 dəfəlikdir.",
      "cats.title": "Kateqoriyalar",
      "cats.hint": "Çarx yalnız hesaba daxil olduqdan sonra açılır.",
      "cta.title": "Sənə nə qismət olacaq?",
      "user.badge": "✦ Xoş gəldin",
      "user.name": "İstifadəçi",
      "user.spins": "Qalan fırlatma",
      "user.sub": "Abunəlik statusu",
      "user.renew": "Növbəti yenilənmə",
      "spin.title": "Çarxı fırlat", "spin.btn": "🔮 Çarxı fırlat",
      "spin.cat": "Kateqoriya seç",
      "pricing.title": "Qiymətlər", "pricing.perMonth": "/ay",
      "pricing.subscribe": "Abunə ol", "pricing.extra": "Əlavə fırlatma",
      "pricing.buy": "Al", "pricing.sub": "Abunəlik",
      "pricing.newBadge": "🔮 Yeni gələnlər üçün fürsət", "pricing.heroTitle": "Hər ay 3 sürpriz şans",
      "pricing.heroLead": "İndi qoşul, ilk fırlatmanı elə bu gün et. Çarxın arxasında Bakının ən yaxşı restoran, kafe,\n       kurs və co-working məkanları gizlənir — hansı sənə düşəcək, bilinmir.",
      "pricing.popular": "ƏN POPULYAR", "pricing.planName": "Misterio Aylıq", "pricing.recurring": "aylıq təkrarlanan ödəniş",
      "pricing.perk1": "✦ Ayda 3 sürpriz fırlatma", "pricing.perk2": "✦ Bütün kateqoriyalara giriş (Restoran, Coffeeshop, Kurslar, Co-working, Anticafe, Kitab)",
      "pricing.perk3": "✦ \"Hamısı\" çarxı — bütün məkanlar bir çarxda", "pricing.perk4": "✦ Qazandığın kuponlar profilində saxlanılır",
      "pricing.perk5": "✦ 10%-dən 40%-ə qədər endirimlər", "pricing.perk6": "✦ İstədiyin vaxt ləğv edə bilərsən",
      "pricing.cta": "İndi qoşul və qazanmağa başla 🔮", "pricing.note": "Free trial yoxdur — abunəlik dərhal aktivləşir.",
      "pricing.whyTitle": "🔮 Niyə Misterio?", "pricing.whyDesc": "Adi endirim saytlarında nə alacağını əvvəlcədən bilirsən. Burada isə hər fırlatma bir sürprizdir —\n             və çox vaxt gözlədiyindən daha yaxşı çıxır.",
      "pricing.couponTitle": "💸 Bir kupon abunəliyi ödəyir", "pricing.couponDesc": "Orta hesabla bir restoran endirimi 15-30 AZN qənaət deməkdir. Ayda 3 kupon — abunəlik özünü ilk gün çıxarır.",
      "pricing.cancelTitle": "🔁 Ləğvetmə şərtləri", "pricing.cancelDesc": "Abunəlik hər ay avtomatik yenilənir. Profil səhifəsindən bir kliklə ləğv edə bilərsən —\n             ləğv etdikdə cari dövrün sonuna qədər fırlatmaların qalır, sonrakı ay ödəniş alınmır.",
      "pricing.extraTitle": "Əlavə fırlatma lazımdır?", "pricing.extraName": "Tək fırlatma", "pricing.extraDesc": "Bu ayki 3 fırlatman bitibsə, növbəti ayı gözləmədən əlavə şans ala bilərsən.",
      "pricing.extraBtn": "Əlavə fırlatma al", "pricing.faqTitle": "Tez-tez verilən suallar",
      "pricing.faq1q": "Free trial varmı?", "pricing.faq1a": "Xeyr. Xidmət ödənişlidir — qeydiyyatdan sonra abunə olmaq lazımdır.",
      "pricing.faq2q": "3 fırlatma bitəndə nə olur?", "pricing.faq2a": "Növbəti ay avtomatik yenilənənə qədər çarx bağlanır. Yeniləmə tarixi profilində və ana səhifədə göstərilir. İstəsən əlavə fırlatma ala bilərsən.",
      "pricing.faq3q": "Kuponlar nə qədər etibarlıdır?", "pricing.faq3a": "Hər kupon 1 dəfəlikdir və qazanıldığı tarixdən etibarən 30 gün ərzində istifadə edilməlidir.",
      "pricing.faq4q": "Necə ləğv edim?", "pricing.faq4a": "Profil → Abunəlik → \"Abunəliyi ləğv et\". Növbəti ay ödəniş alınmır.",
      "profile.title": "Profil", "profile.active": "Aktiv", "profile.inactive": "Deaktiv",
      "profile.coupons": "Kuponların", "profile.noCoupons": "Hələ kupon yoxdur",
      "profile.useBtn": "İstifadə etdim ✓",
      "auth.login": "Daxil ol", "auth.signup": "Qeydiyyatdan keç",
      "auth.email": "Email", "auth.password": "Şifrə", "auth.name": "Ad",
      "auth.verify": "Email təsdiqi", "auth.verifyText": "6 rəqəmli kodu daxil et",
      "auth.resend": "Kodu yenidən göndər",
      "auth.loginBtn": "Daxil ol", "auth.signupBtn": "Qeydiyyatdan keç",
      "auth.loginTitle": "Daxil ol", "auth.signupTitle": "Qeydiyyatdan keç",
      "auth.haveAccount": "Hesabın var?", "auth.noAccount": "Hesabın yoxdur?",
      "auth.verifyTitle": "Email təsdiqi",
      "addCompany.title": "Şirkətini çarxa əlavə et",
      "addCompany.name": "Şirkət adı", "addCompany.cat": "Kateqoriya", "addCompany.desc": "Təsvir",
      "addCompany.submit": "Göndər",
    },
  };

  // ───────── API ─────────
  const I18N = {
    T,
    t: (key) => (T.az && T.az[key]) || key,
    apply: () => {
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const txt = I18N.t(key);
        if (txt) el.textContent = txt;
      });
      document.documentElement.lang = "az";
    },
  };

  window.I18N = I18N;
})();
