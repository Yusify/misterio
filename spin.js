/* Misterio — çarx məntiqi (təhlükəsiz versiya)
   QALİB SERVERDƏ seçilir (/api/spin). Brauzer yalnız kateqoriya göndərir,
   nəticəni server qaytarır və kuponu özü yaradır. */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}
(async function () {
  let user = await requireAuth();
  if (!user) return;
  
  /*LOADING-ANIM-START*/ if (window.hidePageLoading) window.hidePageLoading(); /*LOADING-ANIM-END*/
  /* ƏVVƏLCƏ Supabase-dən bütün şirkətləri yüklə ki, çarx onlarla çəkilsin */
  await loadCompanies();
  const q = id => document.getElementById(id);
  /* XSS qorunması: istifadəçi adını təmizlə */
  const esc = s => (s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  q("welcome").innerHTML = `${I18N.t("common.welcome")}<b>${esc(user.name) || esc(user.email)}</b>`;

  /* ---- sürpriz qutu animasiyası: YALNIZ ilk qeydiyyatdan keçən istifadəçi ----
     auth.html verify uğurla bitəndə ?welcome=1 ilə gəlir.
     Sadəcə o zaman göstər; sonradan giriş edənlər (welcome=yox) görmür. */
  function playSurprise() {
    const box = q("surprise"), gift = q("giftBox"), ticket = q("ticket");
    if (!box) return;
    box.classList.remove("hidden");
    gift.classList.add("shake");
    setTimeout(() => {
      gift.classList.remove("shake");
      gift.classList.add("open");
    }, 2300); // silkələnmə ~2.3s
    setTimeout(() => {
      ticket.classList.remove("hidden");
      void ticket.offsetWidth;
      ticket.classList.add("show");
    }, 2900); // qutu açıldıqdan sonra bilet
  }
  const WELCOME_MODE = new URLSearchParams(location.search).get("welcome") === "1";
  if (WELCOME_MODE) {
    playSurprise();
    /* ilk qeydiyyat anında kilid/abunə blokunu və kateqoriya seçimini gizlə.
       Kateqoriyalar yalnız istifadəçi "Profilim" → çarxı fırlatdıqdan sonra görünəcək. */
    const bb = q("blockBox");
    if (bb) bb.classList.add("hidden");
    const prep = q("preparing");
    if (prep) prep.classList.add("hidden");
    const area = q("spinArea");
    if (area) area.classList.add("hidden");
    const sec = q("wheelSec");
    if (sec) sec.classList.add("hidden");
    /* biletdəki "Profilim" kliklənəndə bayraq qoy ki,
       profildə çarx fırladıldıqdan sonra spin.html kateqoriyanı göstərsin */
    const tp = q("ticketProfile");
    if (tp) tp.onclick = () => {
      try { sessionStorage.setItem("mist_show_spin_cats", "1"); } catch {}
    };
  }

  const catsEl = q("cats"), sec = q("wheelSec"), title = q("wheelTitle"),
    btn = q("spinBtn"), hint = q("hint"),
    cv = q("wheel"), ctx = cv.getContext("2d");
  let curKey = null, spinning = false;
  let absAngle = 0;
  let currentShops = [];

  /* ---- Spin səsi (real audio faylları) ---- */
  const spinAudio = new Audio("assets/audio/spin.mp3");
  const winAudio = new Audio("assets/audio/win.mp3");
  spinAudio.preload = "auto"; winAudio.preload = "auto";
  let lastTick = 0;

  function playSpinSound() {
    try {
      spinAudio.currentTime = 0;
      spinAudio.play().catch(() => {});
    } catch (e) {}
  }
  function playWinSound() {
    try {
      winAudio.currentTime = 0;
      winAudio.play().catch(() => {});
    } catch (e) {}
  }

  /* ---- kateqoriya siyahısı (API-dən, parolsuz) ---- */
  Object.entries(DATA).forEach(([k, v]) => {
    const d = document.createElement("div");
    d.className = "cat" + (v.isAll ? " all" : ""); d.dataset.k = k;
    const nm = I18N.t("cat."+k) !== ("cat."+k) ? I18N.t("cat."+k) : v.name;
    d.innerHTML = `<div class="ic">${esc(v.icon||"")}</div><div class="nm">${esc(nm||"")}</div><div class="cnt">${esc(v.count || "")} ${I18N.t("cat.count")}</div>`;
    d.onclick = () => select(k);
    catsEl.appendChild(d);
  });

  function gate() {
    const s = subInfo();
    const bb = q("blockBox"), area = q("spinArea");
    if (!s.active) {
      bb.classList.remove("hidden"); area.classList.add("hidden"); sec.classList.remove("show");
      q("bbIc").textContent = "🔒";
      q("bbTitle").textContent = I18N.t("spin.blockTitle");
      q("bbText").textContent = I18N.t("spin.blockText");
      q("bbBtn").textContent = I18N.t("spin.subCta");
      q("bbBtn").classList.remove("hidden");
      q("bbProfileBtn").classList.add("hidden");
      MA.kilidGordu("abunelik_yoxdur");
      return false;
    }
    if (!s.canSpin) {
      bb.classList.remove("hidden"); area.classList.add("hidden"); sec.classList.remove("show");
      q("bbIc").textContent = "⏳";
      q("bbTitle").textContent = I18N.t("spin.spinsOver");
      q("bbText").innerHTML = `${I18N.t("spin.renewOn")} <b>${s.renewText}</b>. ${I18N.t("spin.renewNote")}`;
      q("bbBtn").textContent = I18N.t("spin.extraBtn");
      q("bbBtn").classList.remove("hidden");
      q("bbProfileBtn").classList.add("hidden");
      MA.kilidGordu("firlatma_bitdi");
      return false;
    }
    bb.classList.add("hidden"); area.classList.remove("hidden");
    hint.textContent = `✦ Bu ay ${s.spinsLeft} fırlatma haqqın qalıb. Nə çıxacaq — bilinmir.`;
    return true;
  }

  function select(k) {
    if (spinning) return;
    curKey = k;
    const nm = I18N.t("cat."+k) !== ("cat."+k) ? I18N.t("cat."+k) : DATA[k].name;
    MA.kateqoriyaSecdi(DATA[k].name);
    currentShops = DATA[k].shops.slice();
    document.querySelectorAll(".cat").forEach(c => c.classList.toggle("active", c.dataset.k === k));
    title.textContent = "2. " + nm + " " + I18N.t("spin.title2");
    /* FANTASTİK qoşulana qədər: kateqoriya seçiləndə fırlatma çarxı (wheelSec) AÇILMASIN */
    // sec.classList.add("show");
    absAngle = 0;
    cv.style.transition = "none";
    cv.style.transform = "rotate(0deg)";
    void cv.offsetWidth;
    cv.style.transition = "";
    draw();
  }

  function draw() {
    const n = currentShops.length, R = cv.width / 2, step = 2 * Math.PI / n;
    const big = n > 8;
    ctx.clearRect(0, 0, cv.width, cv.height);
    currentShops.forEach((s, i) => {
      const a0 = i * step - Math.PI / 2, a1 = a0 + step;
      ctx.beginPath(); ctx.moveTo(R, R); ctx.arc(R, R, R - 4, a0, a1); ctx.closePath();
      const g = ctx.createRadialGradient(R, R, R * 0.18, R, R, R);
      const base = COLORS[i % COLORS.length];
      g.addColorStop(0, shade(base, -38)); g.addColorStop(1, base);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = document.documentElement.getAttribute("data-theme") === "light"
        ? "rgba(255,255,255,.85)" : "rgba(255,214,120,.55)";
      ctx.lineWidth = big ? 1.2 : 2; ctx.stroke();
      ctx.save(); ctx.translate(R, R); ctx.rotate(a0 + step / 2);
      ctx.fillStyle = "#fff"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      const fs = big ? 12 : 15, fs2 = big ? 13 : 17;
      let nm = s.n; const maxLen = big ? 16 : 20;
      if (nm.length > maxLen) nm = nm.length > 18 ? nm.slice(0, 15) + "…" : nm;
      ctx.font = `bold ${fs}px Segoe UI, sans-serif`;
      ctx.fillText(nm, R - 18, big ? -6 : -7);
      ctx.font = `bold ${fs2}px Segoe UI, sans-serif`;
      ctx.fillText("-" + s.d + "%", R - 18, big ? 9 : 14);
      ctx.restore();
    });
    const light = document.documentElement.getAttribute("data-theme") === "light";
    /* mərkəz dairəsi — balaca, məkan adlarını örtməsin */
    const hr = big ? 22 : 28;
    const hg = ctx.createRadialGradient(R, R - hr * 0.4, 2, R, R, hr);
    if (light) { hg.addColorStop(0, "#ffffff"); hg.addColorStop(1, "#f0e8ff"); }
    else { hg.addColorStop(0, "#2a1550"); hg.addColorStop(1, "#0d0620"); }
    ctx.beginPath(); ctx.arc(R, R, hr, 0, 2 * Math.PI); ctx.fillStyle = hg; ctx.fill();
    ctx.strokeStyle = light ? "#d97706" : "#ffcf5c"; ctx.lineWidth = 3; ctx.stroke();
    ctx.shadowColor = light ? "rgba(217,119,6,.5)" : "rgba(255,207,92,.9)"; ctx.shadowBlur = 12;
    ctx.fillStyle = light ? "#b45309" : "#ffcf5c"; ctx.font = `bold ${big ? 16 : 20}px Segoe UI`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("?", R, R + 1);
    ctx.shadowBlur = 0;
    /* OX göstəricisi (yuxarıda, sabit) */
    ctx.fillStyle = "#ffcf5c";
    ctx.beginPath();
    ctx.moveTo(R, R - cv.width/2 + 2);
    ctx.lineTo(R - 12, R - cv.width/2 + 26);
    ctx.lineTo(R + 12, R - cv.width/2 + 26);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#7b2ff7"; ctx.lineWidth = 2; ctx.stroke();
  }

  function drawPrepWheel() {
    const pcv = q("prepWheel");
    if (!pcv) return;
    /* məkanlar yoxdursa (kateqoriya seçilməyib) "Hamısı" üzərindən götür */
    const shops = (currentShops && currentShops.length)
      ? currentShops
      : (DATA.all && DATA.all.shops ? DATA.all.shops : []);
    if (!shops.length) return;
    const pctx = pcv.getContext("2d");
    const n = shops.length, R = pcv.width / 2, step = 2 * Math.PI / n;
    const big = n > 8;
    pctx.clearRect(0, 0, pcv.width, pcv.height);
    shops.forEach((s, i) => {
      const a0 = i * step - Math.PI / 2, a1 = a0 + step;
      pctx.beginPath(); pctx.moveTo(R, R); pctx.arc(R, R, R - 4, a0, a1); pctx.closePath();
      const g = pctx.createRadialGradient(R, R, R * 0.18, R, R, R);
      const base = COLORS[i % COLORS.length];
      g.addColorStop(0, shade(base, -38)); g.addColorStop(1, base);
      pctx.fillStyle = g; pctx.fill();
      pctx.strokeStyle = "rgba(255,214,120,.55)";
      pctx.lineWidth = big ? 1.2 : 2; pctx.stroke();
      pctx.save(); pctx.translate(R, R); pctx.rotate(a0 + step / 2);
      pctx.fillStyle = "#fff"; pctx.textAlign = "right"; pctx.textBaseline = "middle";
      let nm = s.n; const maxLen = big ? 16 : 20;
      if (nm.length > maxLen) nm = nm.length > 18 ? nm.slice(0, 15) + "…" : nm;
      pctx.font = `bold ${big ? 12 : 15}px Segoe UI, sans-serif`;
      pctx.fillText(nm, R - 18, big ? -6 : -7);
      pctx.font = `bold ${big ? 13 : 17}px Segoe UI, sans-serif`;
      pctx.fillText("-" + s.d + "%", R - 18, big ? 9 : 14);
      pctx.restore();
    });
    const hr = big ? 22 : 28;
    const hg = pctx.createRadialGradient(R, R - hr * 0.4, 2, R, R, hr);
    hg.addColorStop(0, "#2a1550"); hg.addColorStop(1, "#0d0620");
    pctx.beginPath(); pctx.arc(R, R, hr, 0, 2 * Math.PI); pctx.fillStyle = hg; pctx.fill();
    pctx.strokeStyle = "#ffcf5c"; pctx.lineWidth = 3; pctx.stroke();
    pctx.fillStyle = "#ffcf5c"; pctx.font = `bold ${big ? 16 : 20}px Segoe UI`;
    pctx.textAlign = "center"; pctx.textBaseline = "middle";
    pctx.fillText("?", R, R + 1);
  }

  function showPreparing() {
    const prep = q("preparing"), area = q("spinArea");
    if (area) area.classList.remove("hidden");   // kateqoriyalar aydın görünur (blur YOX)
    if (prep) {
      try { refreshData(); } catch {}
      drawPrepWheel();
      prep.classList.remove("hidden");
    }
    // QEYD: sessionStorage bayrağı SİLİNMİR — beləliklə səhifə refresh ediləndə
    // də "Çarx Hazırlanır" overlay-i eyni cür görünür (klik və refresh eyni nəticə).
  }

  if (WELCOME_MODE) {
    /* ilk qeydiyyat: çarx kilid blokunu və kateqoriyanı göstərmə,
       sadəcə sürpriz animasiya. Yalnız profildə çarx fırladıb qayıdanda overlay açılır. */
  } else {
    /* profildə "Çarxı fırlat" basıbsa (welcome sonrası) → dinamik
       "Çarx Hazırlanır" overlay-i: kateqoriyalar blurred, üstündə overlay */
    if (sessionStorage.getItem("mist_show_spin_cats") === "1") {
      showPreparing();
    } else if (gate()) {
      hint.textContent = `✦ Bu ay ${subInfo().spinsLeft} fırlatma haqqın qalıb. Nə çıxacaq — bilinmir.`;
    }
  }

  btn.onclick = () => {
    if (spinning) return;
    if (!curKey) { alert("Əvvəlcə kateqoriya seçin"); return; }
    if (WELCOME_MODE) { /* ilk qeydiyyatda fırlatmaya icazə vermə, yalnız bilet */ return; }
    if (!gate()) return;
    spin();
  };

  async function spin() {
    spinning = true; btn.disabled = true;
    MA.firlatma(DATA[curKey].name);
    btn.textContent = "✦ Çarx fırlanır...";
    document.querySelector(".wheel-outer").classList.add("spinning");
    playSpinSound(); // "tirrrrr" fırlatma səsi

    let res;
    try {
      res = await DB.spin(curKey);
    } catch (e) {
      spinning = false; btn.disabled = false; btn.textContent = "🔮 Çarxı fırlat";
      MA.xeta("spin", e.message);
      alert("Çarx fırladıla bilmədi: " + e.message);
      document.querySelector(".wheel-outer").classList.remove("spinning");
      return;
    }

    /* OXU MƏHZ QALİBİN SEQMENTİNƏ YÖNLƏNDİRİRİK
       Server winnerId qaytarır → currentShops-da indeksi tapırıq.
       draw() funksiyasında seqment i: [i*step - 90°, (i+1)*step - 90°] aralığında
       (0° = yuxarı, əks-saat istiqaməti). Ox yuxarıda (0°) durur.
       Oxun qalib seqmentin mərkəzini göstərməsi üçün çarxı
       (90° + i*step + step/2) bucağına fırlatmaq lazımdır. */
    const c = res.coupon;
    const winnerIdx = currentShops.findIndex(s => s.id === res.winnerId);
    const n = currentShops.length;
    const step = 360 / n;
    const idx = winnerIdx >= 0 ? winnerIdx : 0;
    /* DÜSTUR:
       Segment i-nin çarx üzərindəki (fırlatmadan əvvəlki) mərkəz bucağı:
         θ_i = i*step - 90° + step/2   (canvas: 0°=sağ, 90°=alt, 270°=əlavə/yuxarı)
       Ox yuxarıda (270°) durur. Çarxı R dərəcə fırlatdıqda qalibin mərkəzi
       ekranın 270°-nə düşməlidir:
         θ_i + R ≡ 270° (mod 360)  =>  R ≡ 360 - (i*step + step/2) (mod 360) */
    const centerDeg = 360 - (idx * step + step / 2);
    const jitter = (Math.random() - 0.5) * step * 0.5;    // seqment daxilində kiçik təsadüfi sapma
    const targetMod = ((centerDeg + jitter) % 360 + 360) % 360;
    const turns = 6 + Math.floor(Math.random() * 2);
    const currentMod = ((absAngle % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;
    absAngle += turns * 360 + delta;
    cv.style.transform = `rotate(${absAngle}deg)`;

    setTimeout(() => {
      spinning = false; btn.disabled = false;
      btn.textContent = "🔮 Çarxı fırlat";
      document.querySelector(".wheel-outer").classList.remove("spinning");
      playWinSound(); // qalib seçildi — qazanma fanfarı

      // local sessiya məlumatını yenilə (fırlatma haqqı)
      if (CURRENT_USER && CURRENT_USER.sub) CURRENT_USER.sub.spinsLeft = res.spinsLeft;
      try {
        MA.kuponQazandi(c.shop, c.disc, c.cat);
      } catch {}

      q("winTxt").textContent = `${c.shop} — ${c.disc}% endirim`;
      q("winCat").textContent = c.cat;
      q("modal").classList.remove("hidden");
      const s = subInfo();
      hint.textContent = s.canSpin
        ? `✦ Bu ay ${s.spinsLeft} fırlatma haqqın qalıb.`
        : `Bu ayki fırlatma haqqın bitdi. Yeniləmə: ${s.renewText}`;
    }, 5200);
  }

  q("closeModal").onclick = () => {
    q("modal").classList.add("hidden");
    gate();
  };

  new MutationObserver(() => { if (curKey) draw(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // Dil dəyişəndə kateqoriyaları yenidən çək (adlar tərcümə olunsun)
  window.LANG_onChange = function(){
    try {
      const catsEl = q("cats");
      if (catsEl) {
        catsEl.innerHTML = "";
        Object.entries(DATA).forEach(([k, v]) => {
          const d = document.createElement("div");
          d.className = "cat" + (v.isAll ? " all" : ""); d.dataset.k = k;
          const nm = I18N.t("cat."+k) !== ("cat."+k) ? I18N.t("cat."+k) : v.name;
          d.innerHTML = `<div class="ic">${esc(v.icon||"")}</div><div class="nm">${esc(nm||"")}</div><div class="cnt">${esc(v.count || "")} ${I18N.t("cat.count")}</div>`;
          d.onclick = () => select(k);
          catsEl.appendChild(d);
        });
      }
      I18N.apply();
      if (WELCOME_MODE) {
        /* ilk qeydiyyat ekranı: dil dəyişəndə də kilid/abunə blokları gizli qalsın,
           yalnız qarşılama mətni yenidən tərcümə olunsun */
        q("welcome").innerHTML = `${I18N.t("common.welcome")}<b>${esc(user.name) || esc(user.email)}</b>`;
      } else {
        gate();
      }
    } catch(e){ console.warn(e); }
  };
})();
