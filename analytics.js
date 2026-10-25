/* ============================================================
   MISTERIO — Analitika (Google Analytics 4)
   Measurement ID: G-206G7S0C48
   Səhifə baxışları + Misterio-ya xas hadisələr:
   qeydiyyat, abunəlik, çarx fırlatma, kupon, sifariş.
   ============================================================ */
(function(){
  var GA_ID = "G-206G7S0C48";

  /* --- gtag.js yüklə --- */
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", GA_ID, {
    anonymize_ip: true,
    send_page_view: true
  });

  /* --- saytda qalma müddəti (səhifə bağlananda göndərilir) --- */
  var start = Date.now();
  var sent = false;
  function sendTime(){
    if(sent) return; sent = true;
    var sec = Math.round((Date.now() - start) / 1000);
    if(sec < 1 || sec > 7200) return;
    gtag("event", "sehife_muddeti", {
      sehife: location.pathname.split("/").pop() || "index.html",
      saniye: sec,
      value: sec
    });
  }
  document.addEventListener("visibilitychange", function(){
    if(document.visibilityState === "hidden") sendTime();
  });
  window.addEventListener("pagehide", sendTime);

  /* --- oxuma dərinliyi (25/50/75/100%) --- */
  var marks = {25:0, 50:0, 75:0, 100:0};
  window.addEventListener("scroll", function(){
    var h = document.documentElement;
    var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight * 100;
    [25,50,75,100].forEach(function(m){
      if(pct >= m && !marks[m]){
        marks[m] = 1;
        gtag("event", "scroll_derinliyi", {faiz: m});
      }
    });
  }, {passive:true});

  /* ---------- MİSTERİO HADİSƏLƏRİ ----------
     Digər skriptlər bunları çağırır: MA.qeydiyyat(), MA.firlatma(...) və s. */
  window.MA = {
    /* qeydiyyat axını */
    qeydiyyatBasladi: function(){ gtag("event","sign_up_start"); },
    qeydiyyat: function(email){
      gtag("event","sign_up",{method:"email"});
    },
    dogrulandi: function(){ gtag("event","email_verified"); },
    giris: function(){ gtag("event","login",{method:"email"}); },

    /* ödəniş / abunəlik */
    qiymetBaxdi: function(){ gtag("event","view_pricing"); },
    odenisAcdi: function(tip){
      gtag("event","begin_checkout",{
        currency:"AZN", value: 9.90, items:[{item_name: tip==="sub"?"Aylıq abunəlik":"Əlavə fırlatma"}]
      });
    },
    abuneOldu: function(){
      gtag("event","purchase",{
        transaction_id: "sub-" + Date.now(),
        currency:"AZN", value: 9.90,
        items:[{item_id:"misterio_monthly", item_name:"Misterio Aylıq", price:9.90, quantity:1}]
      });
    },
    elaveFirlatma: function(){
      gtag("event","purchase",{
        transaction_id: "extra-" + Date.now(),
        currency:"AZN", value: 4.90,
        items:[{item_id:"extra_spin", item_name:"Əlavə fırlatma", price:4.90, quantity:1}]
      });
    },
    abuneLegv: function(){ gtag("event","subscription_cancel"); },

    /* çarx */
    kateqoriyaSecdi: function(kat){ gtag("event","kateqoriya_secildi",{kateqoriya:kat}); },
    firlatma: function(kat){ gtag("event","carx_firlatildi",{kateqoriya:kat}); },
    kuponQazandi: function(shop, disc, kat){
      gtag("event","kupon_qazanildi",{mekan:shop, endirim:disc, kateqoriya:kat});
    },
    kilidGordu: function(sebeb){ gtag("event","carx_kilidli",{sebeb:sebeb}); },

    /* kupon */
    kuponBaxdi: function(shop){ gtag("event","kupon_baxildi",{mekan:shop}); },
    kuponIstifade: function(shop){ gtag("event","kupon_istifade",{mekan:shop}); },

    /* şirkət / admin */
    sirketFormu: function(){ gtag("event","sirket_formu_acildi"); },
    sirketElaveEtdi: function(kat){ gtag("event","sirket_elave",{kateqoriya:kat}); },
    adminGiris: function(){ gtag("event","admin_login"); },
    sifarisTesdiq: function(mebleg, endirim){
      gtag("event","sifaris_tesdiqlendi",{mebleg:mebleg, endirim:endirim, value:mebleg, currency:"AZN"});
    },

    /* ümumi */
    xeta: function(yer, mesaj){ gtag("event","xeta",{yer:yer, mesaj:String(mesaj).slice(0,100)}); }
  };
})();
