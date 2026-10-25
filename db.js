/* ============================================================
   MISTERIO — frontend data qatı (API kliyenti)
   Brauzer artıq BAZAYA birbaşa müraciət etmir.
   Bütün yazma əməliyyatları /api/ üzərindən, serverdə icra olunur.
   localStorage yalnız oxunmuş istifadəçi məlumatını keşləyir (session üçün).
   ============================================================ */
const API = "/api";

async function apiCall(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok || (data && data.ok === false)) {
    const msg = (data && data.error) || `Xəta (${res.status})`;
    const err = new Error(msg); err.status = res.status; throw err;
  }
  return data;
}

/* ---- həmin kodun əvvəlki DB interfeysini qoruyuruq ki,
        digər fayllar az dəyişsin ---- */
const DB = {
  /* istifadəçi */
  async me()           { const r = await apiCall("/auth?x=me", { method: "POST", body: { action: "me" } }); return r.user; },
  async register(u)    { return apiCall("/auth", { method: "POST", body: { action: "register", ...u } }); },
  async verify(e, c)   { return apiCall("/auth", { method: "POST", body: { action: "verify", email: e, code: c } }); },
  async resend(e)      { return apiCall("/auth", { method: "POST", body: { action: "resend", email: e } }); },
  async login(e, p)    { return apiCall("/auth", { method: "POST", body: { action: "login", email: e, password: p } }); },
  async logout()       { return apiCall("/auth", { method: "POST", body: { action: "logout" } }); },

  /* çarx */
  async shops(cat)     { const r = await apiCall(`/shops?cat=${encodeURIComponent(cat || "")}`); return r.shops || []; },
  async spin(cat)      { return apiCall("/spin", { method: "POST", body: { cat } }); },
  /* kuponu "istifadə edildi" kimi qeyd et (istifadəçi özü, profildən) */
  async markCouponUsed(couponId) {
    return apiCall("/coupon", { method: "POST", body: { action: "markUsed", couponId } });
  },

  async useCoupon(code)   { return apiCall("/coupon", { method: "POST", body: { code } }); },

  /* kuponlar (brauzerdə yalnız oxunmuş siyahı keşdə saxlanılır) */
  couponsKey: "misterio_coupons_v2",

  /* şirkət admin */
  async companyRegister(c){ return apiCall("/company", { method: "POST", body: { action: "register", ...c } }); },
  async companyLogin(e, p){ return apiCall("/company", { method: "POST", body: { action: "login", email: e, password: p } }); },
  async companyMe()       { const r = await apiCall("/company", { method: "POST", body: { action: "me" } }); return r.company; },
  async companyLogout()   { return apiCall("/company", { method: "POST", body: { action: "logout" } }); },
  /* ödəniş (abunə / əlavə fırlatma) — serverdə aktiv edir */
  async payment(mode, card)  {
    // ödəniş yaradıb abunəni kart məlumatı ilə aktiv edir (demo rejimdə birbaşa)
    const r = await apiCall("/payment-create", { method: "POST", body: { mode, card } });
    // sonra təzə sessiya məlumatını çək
    try { const u = await DB.me(); if (u) return { ...r, user: u }; } catch { }
    return r;
  },
};
window.DB = DB;
