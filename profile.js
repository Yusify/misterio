/* Misterio — profil, abunəlik və kuponlar */
(async function(){
  // Dil dəyişəndə profil mətnlərini + formu yenilə (async gözləmədən asılı olmayaraq)
  function refreshLang(){
    try {
      if (typeof I18N === "undefined") return;
      I18N.apply();
      if (typeof head === "function") head();
      if (typeof renderSub === "function") renderSub();
      if (typeof fillForm === "function") fillForm();
      if (typeof render === "function") render(); // kuponlar (boş mesaj da daxil)
    } catch(e){ console.warn("refreshLang:", e); }
  }
  window.LANG_onChange = refreshLang;
  document.addEventListener("langchange", () => refreshLang());

  /*LOADDING-ANIM-START*/
  // profil content-i əvvəlcədən gizlə (redirect və ya login gözlənilir)
  const pr0 = document.getElementById("profileRoot");
  if (pr0) pr0.style.display = "none";
  /*LOADING-ANIM-END*/

  let user = null;
  try {
    user = await requireAuth();
  } catch (e) {
    console.error("requireAuth xətası:", e);
    // Xəta olsa da profili göstər (NaN olmayan istifadəçi varsa)
    user = (typeof Session !== "undefined" && Session.user && Session.user()) || null;
  }
  if(!user) return;   // requireAuth login olmayanı auth.html-ə redirect edir → overlay orada görünəcək
  
  /* yalnız login təsdiqləndi və profil content-i göstəriləcək ki, overlay-i gizlət */
  /*LOADING-ANIM-START*/
  const pr = document.getElementById("profileRoot");
  if (pr) pr.style.display = "";
  if (window.hidePageLoading) window.hidePageLoading();
  /*LOADING-ANIM-END*/
  const q=id=>document.getElementById(id);
  let COUPONS = [];

  function maskName(name){
    const s=(name||"İstifadəçi").trim();
    const parts=s.split(/\s+/);
    if(parts.length>1){
      const last=parts[parts.length-1];
      parts[parts.length-1]=last.slice(0,Math.min(2,last.length))+"***";
      return parts.join(" ");
    }
    return s.slice(0,Math.max(2,Math.ceil(s.length/2)))+"***";
  }
  const initial = s => (s||"?").trim().charAt(0).toUpperCase();

  function head(){
    user=Session.user();
    const s=subInfo();
    q("pfAv").textContent=initial(user.name||user.email);
    q("pfName").textContent=user.name||"—";
    q("pfMail").textContent=user.email;
    q("pfSpin").textContent = s.active ? `🎡 ${s.spinsLeft} ${I18N.t("user.spins")}` : "🔒 " + I18N.t("profile.inactive");
  }

  function renderSub(){
    const s=subInfo();
    const box=q("subCard");

    /* ödənişsiz (free) şansı olanlar: profildə fırlat düyməsi + hazırlanır bildirişi */
    if (s.isFreePending) {
      box.innerHTML=`
        <div class="sub-row">
          <div>
            <div class="sub-state off">${I18N.t("profile.free")}</div>
            <p class="sub">${I18N.t("profile.freeText")}</p>
          </div>
          <div class="sub-actions">
            <button class="btn" id="freeSpinBtn">${I18N.t("profile.freeSpin")}</button>
            <a class="btn ghost" href="pricing.html">${I18N.t("profile.monthly")}</a>
          </div>
        </div>`;
      const fb=q("freeSpinBtn");
      if(fb) fb.onclick=()=>{
        MA.firlatma("free");
        location.href="spin.html";
      };
      return;
    }

    if(!s.active){
      box.innerHTML=`
        <div class="sub-row">
          <div><div class="sub-state off">${I18N.t("profile.deact")}</div>
          <p class="sub">${I18N.t("profile.deactText")}</p></div>
          <div class="sub-actions">
            <a class="btn" href="pricing.html">${I18N.t("profile.monthly")}</a>
          </div>
        </div>`;
      return;
    }
    box.innerHTML=`
      <div class="sub-row">
        <div>
          <div class="sub-state on">${I18N.t("profile.active")}</div>
          <div class="sub-grid">
            <div><span>${I18N.t("profile.plan")}</span><b>Misterio Aylıq · ${I18N.price("sub").text}</b></div>
            <div><span>${I18N.t("profile.spinsLeft")}</span><b>${s.spinsLeft} / 3</b></div>
            <div><span>${I18N.t("profile.nextRenew")}</span><b>${s.renewText}</b></div>
          </div>
          ${s.canSpin?"":'<p class="warn">'+I18N.t("profile.warn")+'</p>'}
        </div>
        <div class="sub-actions">
          ${s.canSpin?`<a class="btn" href="spin.html">${I18N.t("profile.freeSpin")} 🔮</a>`
                     :`<a class="btn" href="pricing.html">${I18N.t("profile.extraSpin")}</a>`}
          <button class="btn ghost" id="cancelSub">${I18N.t("profile.cancelSub")}</button>
        </div>
      </div>`;
    const cb=q("cancelSub");
    if(cb) cb.onclick=async()=>{
      if(confirm("Abunəliyi ləğv etmək istədiyinizə əminsiniz? Növbəti ay ödəniş alınmayacaq.")){
        await cancelSubscription(); head(); renderSub();
      }
    };
  }

  head(); renderSub();

  function fillForm(){
    const u = Session.user();
    q("pName").value = u.name || "";
    q("pEmail").value = u.email;
    q("pPhone").value = u.phone || "";
    q("pCity").value = u.city || "";
  }
  fillForm();

  q("profForm").onsubmit=async e=>{
    e.preventDefault();
    await updateUser({name:q("pName").value.trim(),phone:q("pPhone").value.trim(),city:q("pCity").value.trim()});
    head(); render();
    const s=q("saved"); s.classList.remove("hidden"); setTimeout(()=>s.classList.add("hidden"),2000);
  };

  const box=q("coupons"), cm=q("cModal");
  let openId=null;

  /* KART: baş hərf + qısaldılmış şəbəkə adı + kateqoriya + Bax
     Ad qısaldılır ki, kart heç vaxt kəsik yazı göstərməsin, amma müştəri
     hansı kuponu açdığını bilsin. */
  function shortName(name, max){
    const s=(name||"").trim();
    if(s.length<=max) return s;
    /* söz sərhədində kəs, sonra … */
    const cut=s.slice(0,max);
    const sp=cut.lastIndexOf(" ");
    return (sp>max*0.5 ? cut.slice(0,sp) : cut).trim()+"…";
  }

  async function loadCoupons(){
    try{
      // kuponlar sessiya user obyektində gəlir (server tərəfindən təmizlənmiş)
      const u = Session.user();
      // əlavə olaraq serverdən təzə siyahı çək
      const me = await DB.me();
      COUPONS = (me && me.coupons) ? me.coupons : (u.coupons || []);
    }catch(e){ console.error("kuponlar yüklənmədi", e); COUPONS=[]; }
    render();
  }

  function render(){
    user=Session.user();
    const list=COUPONS;
    if(!list.length){
      box.innerHTML='<div class="empty">🔮 ' + I18N.t('profile.noCoupons') + '</div>';
      return;
    }
    box.innerHTML="";
    list.slice().forEach(c=>{
      const d=document.createElement("div");
      d.className="coupon";
      d.innerHTML=`
        <div class="c-initial">${initial(c.shop)}</div>
        <div class="c-shop" title="${c.shop}">${shortName(c.shop,30)}</div>
        <div class="c-cat">${c.cat}</div>
        <div class="c-status">✦ Aktiv</div>
        <button class="btn">Bax</button>`;
      d.querySelector("button").onclick=()=>openC(c);
      box.appendChild(d);
    });
  }

  function openC(c){
    openId=c.id;
    MA.kuponBaxdi(c.shop);
    q("cInitial").textContent=initial(c.shop);
    q("cTitle").textContent=c.shop;
    q("cDisc").textContent=c.disc+"% endirim";
    q("cCode").textContent=c.code;
    q("cOwner").textContent=maskName(Session.user().name);
    q("cTerms").innerHTML=`
      <li>Kupon yalnız 1 dəfə istifadə oluna bilər.</li>
      <li>Digər kampaniya və endirimlərlə birləşdirilmir.</li>
      <li>Qazanılma tarixi: ${fmtDate(c.created_at)} · Kateqoriya: ${c.cat}</li>
      <li>Qazanıldığı tarixdən 30 gün ərzində istifadə edilməlidir.</li>
      <li>Kodu kassada təqdim edin, şəxsiyyət vəsiqəsi tələb oluna bilər.</li>`;
    cm.classList.remove("hidden");
  }

  q("cDismiss").onclick=()=>cm.classList.add("hidden");
  q("cClose").onclick=async()=>{
    const cp = COUPONS.find(x=>x.id===openId);
    if (cp) {
      MA.kuponIstifade(cp.shop||"");
      try {
        // Kuponu serverdə "istifadə edildi" kimi qeyd et (1 dəfəlik)
        await DB.markCouponUsed(cp.id);
        // Siyahıdan çıxar
        COUPONS = COUPONS.filter(x=>x.id!==openId);
        render();
        const t=q("marked"); if(t){ t.classList.remove("hidden"); setTimeout(()=>t.classList.add("hidden"),2500); }
      } catch(e){ console.error("markUsed:", e.message); }
    }
    cm.classList.add("hidden");
  };
  await loadCoupons();
})();
