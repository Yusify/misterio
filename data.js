/* Misterio — kateqoriya və məkan məlumatları
   ⚠️ MÜHÜM: brauzer öz yaddaşından HEÇ NƏ göstərmir.
   Bütün məkanlar SUPABASE-dən gəlir (DB.shops). STATİK siyahı YOXDUR.
   Bu, çarxın üzərindəki məkanların serverin seçdiyi qalib ilə eyni olmasını təmin edir. */

/* mystery palitrası — tünd fon üzərində parlaq, lakin premium tonlar */
const COLORS = ["#6d3bff","#a855ff","#c026d3","#ff4d8d","#ff7a45","#ffcf5c",
                "#3ddcff","#2d9bf0","#7c4dff","#e0479e","#f59e0b","#4dd4ac"];

/* Kateqoriya siyahısı — açarlar MUTLAQA Supabase `cat` sahəsi ilə eyni olmalıdır
   (spin.js DB.shops(k) çağıranda bu açarı birbaşa ötürür) */
const CATEGORY_LIST = [
  {key:"restoran",  icon:"🍽️", name:"Restoran"},
  {key:"coffeeshop",icon:"☕", name:"Coffeeshop"},
  {key:"kurs",     icon:"🎓", name:"Kurslar"},
  {key:"kitab",    icon:"📚", name:"Kitab mağazaları"},
  {key:"anticafe", icon:"🕹️", name:"Anticafe"},
  {key:"coworking",icon:"💼", name:"Co-working"}
];

/* Supabase-dən gələn real məkanlar — yaddaşda saxlanılır ki,
   çarx sinxron işləsin (amma mənbə həmişə serverdir) */
let CUSTOM_COMPANIES = [];

async function loadCompanies(){
  try{
    const rows = await DB.shops("");   // bütün aktiv məkanlar (API → Supabase)
    CUSTOM_COMPANIES = rows.filter(r=>r.cat).map(r=>({
      id:r.id, name:r.name, cat:r.cat, disc:r.disc, phone:r.phone
    }));
  }catch(e){ console.error("companies yüklənmədi", e); CUSTOM_COMPANIES=[]; }
  refreshData();
  return CUSTOM_COMPANIES;
}

function customCompanies(){ return CUSTOM_COMPANIES; }

async function addCompany(c){
  const row = await DB.companyRegister(c);
  if (row && row.company) {
    CUSTOM_COMPANIES.push({id:row.company.id, name:row.company.name, cat:row.company.cat, disc:row.company.disc, phone:row.company.phone});
    refreshData();
  }
  return row;
}

/* ---------- Müqavilə / Contract (backend-də saxlanılır) ---------- */
const CONTRACT_VERSION = "v1.0";
function contracts(){ return CUSTOM_COMPANIES; }
function addContract(c){ return c; }
function clientIp(){ return "backend (server-dən gəlir)"; }

/* ============================================================
   DATA qurulması — YALNIZ Supabase məkanlarından
   BASE_DATA statik siyahısı SİLİNDİ. Çarx 100% server məlumatı ilə çəkilir.
   ============================================================ */
function buildData(){
  const d = {};
  CATEGORY_LIST.forEach(c => { d[c.key] = { icon:c.icon, name:c.name, shops:[] }; });

  customCompanies().forEach(c=>{
    if(!d[c.cat]) return;
    d[c.cat].shops.push({
      n:c.name, d:c.disc, phone:c.phone,
      id:c.id, catKey:c.cat, custom:true
    });
  });

  /* "Hamısı" — bütün kateqoriyaların cəmi (server məkanları) */
  const all = [];
  Object.keys(d).forEach(k=> d[k].shops.forEach(s=> all.push({...s})));
  const out = { all:{ icon:"✨", name:"Hamısı", shops:all, isAll:true } };
  Object.keys(d).forEach(k=> out[k]=d[k]);
  return out;
}

let DATA = buildData();
function refreshData(){ DATA = buildData(); return DATA; }

window.CATEGORY_LIST = CATEGORY_LIST;
