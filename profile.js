/* Misterio — profil, abunəlik və kuponlar */
(async function(){
  let user = await requireAuth();
  if(!user) return;
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
    q("pfSpin").textContent = s.active ? `🎡 ${s.spinsLeft} fırlatma qalıb` : "🔒 Abunəlik deaktiv";

    /* ---- ödənişsiz (free) şansı varsa profildə göstər + fırlat düyməsi ---- */
    const fn = q("freeNotice");
    if (s.isFreePending) {
      fn.querySelector("#tnTitle").textContent = "🎁 1 dəfə ödənişsiz çarx fırlatma şansın var!";
      fn.querySelector("#tnText").innerHTML = 'Hesabında <b>1 pulsuz fırlatma haqqı</b> var. Aşağıdakı düymə ilə çarxı fırlat və endirim qazan.';
      fn.classList.remove("hidden");
    } else {
      fn.classList.add("hidden");
    }
  }

  function renderSub(){
    const s=subInfo();
    const box=q("subCard");

    /* ödənişsiz (free) şansı olanlar: profildə fırlat düyməsi + hazırlanır bildirişi */
    if (s.isFreePending) {
      box.innerHTML=`
        <div class="sub-row">
          <div>
            <div class="sub-state off">Free şans</div>
            <p class="sub">Hesabında <b>1 pulsuz fırlatma haqqı</b> var. Çarxı fırlat düyməsinə bas — çarx hazırlanır bildirişi çıxacaq.</p>
          </div>
          <button class="btn" id="freeSpinBtn">🔮 Çarxı fırlat</button>
        </div>`;
      const fb=q("freeSpinBtn");
      if(fb) fb.onclick=()=>{
        MA.firlatma("free");
        // spin.html-ə yönləndir — orda "Çarx hazırlanır" bildirişi çıxır
        location.href="spin.html";
      };
      return;
    }

    if(!s.active){
      box.innerHTML=`
        <div class="sub-row">
          <div><div class="sub-state off">Deaktiv</div>
          <p class="sub">Çarxı fırlatmaq üçün aylıq abunəliyi aktivləşdirin — 9.90 AZN, ayda 3 fırlatma.</p></div>
          <a class="btn" href="pricing.html">Abunə ol</a>
        </div>`;
      return;
    }
    box.innerHTML=`
      <div class="sub-row">
        <div>
          <div class="sub-state on">Aktiv</div>
          <div class="sub-grid">
            <div><span>Plan</span><b>Misterio Aylıq · 9.90 AZN</b></div>
            <div><span>Qalan fırlatma</span><b>${s.spinsLeft} / 3</b></div>
            <div><span>Növbəti yenilənmə</span><b>${s.renewText}</b></div>
          </div>
          ${s.canSpin?"":'<p class="warn">⚠️ Bu ayki fırlatma haqqın bitib.</p>'}
        </div>
        <div class="sub-actions">
          ${s.canSpin?'<a class="btn" href="spin.html">Çarxı fırlat 🔮</a>'
                     :'<a class="btn" href="pricing.html">Əlavə fırlatma al</a>'}
          <button class="btn ghost" id="cancelSub">Abunəliyi ləğv et</button>
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

  q("pName").value=user.name||"";
  q("pEmail").value=user.email;
  q("pPhone").value=user.phone||"";
  q("pCity").value=user.city||"";

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
      box.innerHTML='<div class="empty">🔮 Hələ kuponun yoxdur. <a class="link" href="spin.html">Çarxı fırlat</a> və ilk kuponunu qazan.</div>';
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
