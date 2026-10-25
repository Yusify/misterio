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
  /* ƏVVƏLCƏ Supabase-dən bütün şirkətləri yüklə ki, çarx onlarla çəkilsin */
  await loadCompanies();
  const q = id => document.getElementById(id);
  /* XSS qorunması: istifadəçi adını təmizlə */
  const esc = s => (s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  q("welcome").innerHTML = `Xoş gəldin, <b>${esc(user.name) || esc(user.email)}</b> · <a class="link" href="profile.html">Profilim</a>`;

  const freeNotice = q("freeNotice");
  function showFreeNotice(title, text) {
    q("tnTitle").textContent = title;
    q("tnText").textContent = text;
    freeNotice.classList.remove("hidden");
  }

  /* ---- doğrulamadan sonra 1 dəfə ödənişsiz endirim şansı bildirişi ---- */
  if (subInfo().isFreePending) {
    showFreeNotice(
      "🎁 1 dəfə ödənişsiz çarx fırlatma şansı qazandınız!",
      "Təbriklər — hesabına 1 pulsuz fırlatma haqqı əlavə olundu. Aşağıdan kateqoriya seç və çarxı fırlat."
    );
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
    d.innerHTML = `<div class="ic">${esc(v.icon||"")}</div><div class="nm">${esc(v.name||"")}</div><div class="cnt">${esc(v.count || "")} məkan</div>`;
    d.onclick = () => select(k);
    catsEl.appendChild(d);
  });

  function gate() {
    const s = subInfo();
    const bb = q("blockBox"), area = q("spinArea");
    /* ödənişsiz (free) şans var, amma hələ aktiv olmayıb — fırlatma yox, bildiriş */
    if (s.isFreePending) {
      bb.classList.remove("hidden"); area.classList.add("hidden"); sec.classList.remove("show");
      q("bbIc").textContent = "⏳";
      q("bbTitle").textContent = "Çarx hazırlanır";
      q("bbText").textContent = "Ən sevdiyiniz məkanlar əlavə edilir. Təzəliklə aktiv olacaq — bir az səbr edin.";
      q("bbBtn").classList.add("hidden");
      q("bbProfileBtn").classList.remove("hidden");
      return false;
    }
    if (!s.active) {
      bb.classList.remove("hidden"); area.classList.add("hidden"); sec.classList.remove("show");
      q("bbIc").textContent = "🔒";
      q("bbTitle").textContent = "Çarx kilidlidir";
      q("bbText").textContent = "Çarxın arxasında nə gizləndiyini görmək üçün abunəliyi aktivləşdirin — 9.90 AZN, ayda 3 fırlatma.";
      q("bbBtn").textContent = "Abunə ol — 9.90 AZN/ay";
      q("bbBtn").classList.remove("hidden");
      q("bbProfileBtn").classList.add("hidden");
      MA.kilidGordu("abunelik_yoxdur");
      return false;
    }
    if (!s.canSpin) {
      bb.classList.remove("hidden"); area.classList.add("hidden"); sec.classList.remove("show");
      q("bbIc").textContent = "⏳";
      q("bbTitle").textContent = "Bu ayki fırlatma haqqın bitib";
      q("bbText").innerHTML = `Yeniləmə tarixi: <b>${s.renewText}</b>. O tarixdə hesabınıza yenidən 3 fırlatma əlavə olunacaq.`;
      q("bbBtn").textContent = "Əlavə fırlatma al — 4.90 AZN";
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
    MA.kateqoriyaSecdi(DATA[k].name);
    currentShops = DATA[k].shops.slice();
    document.querySelectorAll(".cat").forEach(c => c.classList.toggle("active", c.dataset.k === k));
    title.textContent = "2. " + DATA[k].name + " çarxını fırlat";
    sec.classList.add("show");
    absAngle = 0;
    cv.style.transition = "none";
    cv.style.transform = "rotate(0deg)";
    void cv.offsetWidth;
    cv.style.transition = "";
    draw();
    sec.scrollIntoView({ behavior: "smooth", block: "center" });
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

  if (gate()) hint.textContent = `✦ Bu ay ${subInfo().spinsLeft} fırlatma haqqın qalıb. Nə çıxacaq — bilinmir.`;

  btn.onclick = () => {
    if (spinning) return;
    if (!curKey) { alert("Əvvəlcə kateqoriya seçin"); return; }
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
})();
