/* Misterio — ortaq: auth, abunəlik (API backed)
   localStorage yalnız oxunmuş istifadəçi məlumatını keşləyir (session üçün). */
const SESSION_KEY = "mist_user_v2";
const PLAN = { price: "9.90 AZN", priceNum: 9.90, spins: 3, period: "ay" };

let CURRENT_USER = null;

const Session = {
  uid: () => CURRENT_USER ? CURRENT_USER.id : null,
  login: (u) => { CURRENT_USER = u; try { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch {} },
  logout: () => { localStorage.removeItem(SESSION_KEY); CURRENT_USER = null; },
  user: () => CURRENT_USER
};

function addMonth(d) {
  const n = new Date(d); const day = n.getDate();
  n.setMonth(n.getMonth() + 1);
  if (n.getDate() < day) n.setDate(0);
  return n;
}
const AZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const fmtDate = d => {
  const x = new Date(d);
  return `${x.getDate()} ${AZ_MONTHS[x.getMonth()]} ${x.getFullYear()}`;
};

/* abunəlik vaxtı keçibsə fırlatmaları sıfırla (serverdə də yoxlanılır) */
function isActiveSub(u) {
  if (!u || !u.sub || !u.sub.active) return false;
  if (u.sub.expires && new Date(u.sub.expires) < new Date()) return false;
  return true;
}

async function loadSession() {
  // keşdən sürətli oxu
  try {
    const cached = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (cached && cached.id) CURRENT_USER = cached;
  } catch {}
  // serverdən təsdiq (cookie ilə)
  try {
    const u = await DB.me();
    if (u) { CURRENT_USER = u; Session.login(u); }
    else Session.logout();
  } catch { /* offlayn → keşdən davam */ }
  return CURRENT_USER;
}

/* abunəliyi serverdə kart ödənişi ilə aktiv et (pricing.html DB.payment çağırır) */
async function activateSubscription() {
  if (MA && MA.abuneOldu) MA.abuneOldu();
  try {
    const r = await DB.payment("sub");
    if (r && r.user) { CURRENT_USER = r.user; Session.login(r.user); return CURRENT_USER; }
  } catch (e) { console.error("activate:", e.message); }
  return CURRENT_USER;
}
async function cancelSubscription() {
  if (MA && MA.abuneLegv) MA.abuneLegv();
  if (CURRENT_USER && CURRENT_USER.sub) CURRENT_USER.sub.active = false;
  return CURRENT_USER;
}
/* əlavə fırlatma — serverdə +1 */
async function buyExtraSpin() {
  if (MA && MA.elaveFirlatma) MA.elaveFirlatma();
  try {
    const r = await DB.payment("extra");
    if (r && r.user) { CURRENT_USER = r.user; Session.login(r.user); return CURRENT_USER; }
  } catch (e) { console.error("extra:", e.message); }
  if (CURRENT_USER && CURRENT_USER.sub) {
    CURRENT_USER.sub.spinsLeft = (CURRENT_USER.sub.spinsLeft || 0) + 1;
  }
  return CURRENT_USER;
}
async function consumeSpin() {
  if (CURRENT_USER && CURRENT_USER.sub) {
    CURRENT_USER.sub.spinsLeft = Math.max(0, (CURRENT_USER.sub.spinsLeft || 0) - 1);
    CURRENT_USER.sub.totalSpins = (CURRENT_USER.sub.totalSpins || 0) + 1;
  }
  return CURRENT_USER;
}
function subInfo() {
  const u = CURRENT_USER; if (!u) return null;
  const s = u.sub || {};
  const active = isActiveSub(u);
  const isFree = !!s.isFree || !!s.free;
  /* free istifadəçi öz 1 pulsuz haqqını saxlayır (abunə olmayanda da) */
  const spinsLeft = isFree ? (s.spinsLeft || 0) : (active ? (s.spinsLeft || 0) : 0);
  return {
    active,
    isFree,
    spinsLeft,
    expires: s.expires || null,
    renewText: s.expires ? fmtDate(s.expires) : "—",
    canSpin: active && (s.spinsLeft || 0) > 0,
    /* ödənişsiz (free) haqq var, amma hələ fırladıla bilməz — aktiv olacaq */
    isFreePending: isFree && (s.spinsLeft || 0) > 0
  };
}

/* səhifə girişi: sessiyanı yüklə, yoxdursa auth-a at */
async function requireAuth() {
  const u = await loadSession();
  if (!u || !u.verified) {
    location.href = "auth.html?next=" + encodeURIComponent(location.pathname.split("/").pop() || "index.html");
    return null;
  }
  return u;
}
async function updateUser(patch) {
  const u = CURRENT_USER; if (!u) return null;
  Object.assign(u, patch);
  Session.login(u);
  return u;
}

/* header */
document.addEventListener("DOMContentLoaded", async () => {
  const av = document.querySelector(".avatar");
  const u = CURRENT_USER || await loadSession();
  if (av && u && u.verified) { av.title = u.name || u.email; av.classList.add("on"); }
  const out = document.getElementById("logoutBtn");
  if (out) out.onclick = async () => { await DB.logout(); Session.logout(); location.href = "index.html"; };
});
