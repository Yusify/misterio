/* ============================================================
   MISTERIO — Şirkət Admin Paneli (API backed)
   Sessiya HTTP-only cookie ilə (serverdə imzalanır).
   Kuponu yalnız /api/coupon istifadə edir — brauzer statusu dəyişmir.
   ============================================================ */
(async function () {
  "use strict";
  const q = id => document.getElementById(id);
  let ORDERS = [];

  /* ---------- AUTH ---------- */
  async function adminLogin(email, pass) {
    try {
      const r = await DB.companyLogin(email, pass);
      return !!r.company;
    } catch (e) { return false; }
  }
  async function adminUser() {
    try { return await DB.companyMe(); } catch { return null; }
  }
  async function adminLogout() { try { await DB.companyLogout(); } catch {} }

  /* ---------- KUPON AXTARIŞI (yalnız oxuma, server təsdiqləyir) ---------- */
  async function lookupCoupon(code) {
    if (!code) return null;
    try {
      const r = await fetch("/api/coupon?peek=" + encodeURIComponent(code.trim().toUpperCase()), {
        credentials: "same-origin"
      });
      if (!r.ok) return null;
      const d = await r.json();
      if (!d.ok || !d.coupon) return null;
      return { id: d.coupon.id, code: d.coupon.code, shop: d.coupon.shop, cat: d.coupon.cat || "Ümumi", disc: d.coupon.disc };
    } catch { return null; }
  }

  /* ---------- SİFARİŞLƏR ---------- */
  async function loadOrders() {
    try {
      const r = await fetch("/api/orders", { credentials: "same-origin" });
      if (r.ok) { const d = await r.json(); ORDERS = d.orders || []; }
      else ORDERS = [];
    } catch { ORDERS = []; }
    return ORDERS;
  }
  function orders() { return ORDERS; }

  async function addOrder(code, total, disc) {
    code = (code || "").toUpperCase();
    try {
      const r = await DB.useCoupon(code);
      if (!r.ok) return { ok: false, error: r.error };
      await loadOrders();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  /* ---------- DASHBOARD ---------- */
  const ts = o => o.created_at;
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function startOfWeek(d) { const x = startOfDay(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); return x; }
  function startOfMonth(d) { const x = startOfDay(d); x.setDate(1); return x; }
  function sum(arr) { return arr.reduce((s, o) => s + Number(o.final), 0); }

  function renderDashboard() {
    const list = ORDERS;
    const now = new Date();
    const today = list.filter(o => new Date(ts(o)) >= startOfDay(now));
    const week = list.filter(o => new Date(ts(o)) >= startOfWeek(now));
    const month = list.filter(o => new Date(ts(o)) >= startOfMonth(now));
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v.toFixed(2); };
    set("totalEarned", sum(list));
    set("todayEarned", sum(today));
    set("weekEarned", sum(week));
    set("monthEarned", sum(month));
    const tc = document.getElementById("totalCount");
    if (tc) tc.textContent = list.length + " təsdiqlənmiş sifariş";
  }

  /* ---------- CƏDVƏL + FİLTR ---------- */
  function inRange(t, range, from, to) {
    const d = new Date(t), now = new Date();
    if (range === "today") return d >= startOfDay(now);
    if (range === "week") return d >= startOfWeek(now);
    if (range === "month") return d >= startOfMonth(now);
    if (range === "custom") {
      const f = from ? new Date(from + "T00:00:00") : null;
      const tt = to ? new Date(to + "T23:59:59") : null;
      if (f && d < f) return false;
      if (tt && d > tt) return false;
      return true;
    }
    return true;
  }
  function renderOrders() {
    const range = document.getElementById("rangeSel").value;
    const from = document.getElementById("fromD").value;
    const to = document.getElementById("toD").value;
    let list = ORDERS.filter(o => inRange(ts(o), range, from, to));
    list.sort((a, b) => new Date(ts(b)) - new Date(ts(a)));

    const body = document.getElementById("ordersBody");
    const empty = document.getElementById("emptyOrders");
    body.innerHTML = "";
    if (!list.length) {
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
      const fmt = t => {
        const d = new Date(t), p = n => String(n).padStart(2, "0");
        return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
      };
      list.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td data-l="Tarix">${fmt(ts(o))}</td>
          <td class="mono" data-l="Kupon">${o.code}</td>
          <td data-l="Əsl məbləğ">${Number(o.total).toFixed(2)} ₼</td>
          <td data-l="End.">%${o.disc}</td>
          <td class="bold" data-l="Yekun">${Number(o.final).toFixed(2)} ₼</td>`;
        body.appendChild(tr);
      });
    }
    const ps = document.getElementById("periodSum");
    if (ps) ps.textContent = sum(list).toFixed(2) + " AZN";
  }

  window.adminLogin = adminLogin;
  window.adminUser = adminUser;
  window.adminLogout = adminLogout;
  window.lookupCoupon = lookupCoupon;
  window.addOrder = addOrder;
  window.orders = orders;
  window.loadOrders = loadOrders;
  window.renderDashboard = renderDashboard;
  window.renderOrders = renderOrders;
})();
