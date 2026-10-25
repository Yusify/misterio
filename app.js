/* Misterio — add-company səhifəsi (təmiz, sadə) */
(function () {
  "use strict";

  var q = function (id) { return document.getElementById(id); };
  var sel = q("cCat");

  // kateqoriyaları select-ə doldur
  window.CATEGORY_LIST.forEach(function (c) {
    var o = document.createElement("option");
    o.value = c.key;
    o.textContent = c.icon + " " + c.name;
    sel.appendChild(o);
  });

  if (window.MA && window.MA.sirketFormu) window.MA.sirketFormu();

  function catName(k) {
    var f = window.CATEGORY_LIST.find(function (x) { return x.key === k; });
    return f ? f.name : k;
  }
  function fmtDate(d) {
    return (d || new Date()).toLocaleDateString("az-AZ");
  }

  // Müqavilə mətni — təmiz hüquqi struktur
  function contractHTML(c) {
    var today = fmtDate();
    var h = function (t) { return '<h3 class="mh">' + t + '</h3>'; };
    var p = function (t) { return '<p>' + t + '</p>'; };
    var li = function (t) { return '<p class="mi">' + t + '</p>'; };
    return '' +
      '<div class="mhead">' +
      '<p style="text-align:center"><b>TƏRƏFDAŞLIQ VƏ ENDİRİM TƏMİNATI MÜQAVİLƏSİ</b></p>' +
      '<p style="text-align:center">("Misterio" Şəxs1 ilə Tərəfdaş arasında)</p>' +
      '</div>' +
      p('Bu Müqavilə aşağıda göstərilən tərəflər arasında, Misterio rəqəmsal endirim platforması çərçivəsində əməkdaşlığın şərtlərini müəyyən etmək məqsədilə bağlanır.') +
      '<p><b>Bağlanma tarixi:</b> ' + today + '</p>' +

      h('Maddə 1. Tərəflər') +
      li('<b>1.1.</b> Misterio platformasının təmsilçisi Kamal Ağayev (bundan sonra — "Şəxs1"):') +
      li('&nbsp;&nbsp;&nbsp;• Fiziki şəxsin adı: Kamal Ağayev') +
      li('&nbsp;&nbsp;&nbsp;• VÖEN / şəxsiyyət vəsiqəsi №: 1203626292') +
      li('&nbsp;&nbsp;&nbsp;• Təmsil edən şəxs, vəzifəsi: Təsisçi') +
      li('<b>1.2.</b> Tərəfdaş müəssisə (bundan sonra — "Tərəfdaş"):') +
      li('&nbsp;&nbsp;&nbsp;• Müəssisənin adı: <b>' + c.name + '</b>') +
      li('&nbsp;&nbsp;&nbsp;• Fəaliyyət kateqoriyası: <b>' + catName(c.cat) + '</b>') +
      li('&nbsp;&nbsp;&nbsp;• Ünvan: <b>' + c.addr + '</b>') +
      li('&nbsp;&nbsp;&nbsp;• Əlaqə telefonu / e-mail: <b>' + c.phone + '</b> / <b>' + c.email + '</b>') +

      h('Maddə 2. Müqavilənin predmeti') +
      li('<b>2.1.</b> Şəxs1 öz rəqəmsal tətbiqi (Misterio) vasitəsilə istifadəçilərə (bundan sonra — "Müştəri") Tərəfdaşın müəyyən etdiyi endirim faizini təqdim edən elektron kupon kodları təqdim edir.') +
      li('<b>2.2.</b> Tərəfdaş bu Müqaviləni imzalamaqla, aşağıdakı 3-cü Maddədə göstərilən endirim şərtlərini Şəxs1 vasitəsilə gələn hər bir Müştəriyə tətbiq etməyi öhdəsinə götürür.') +
      li('<b>2.3.</b> Bu Müqavilə Tərəfdaşın Şəxs1-in platformasında qeydiyyatının rəsmi təsdiqi hesab olunur və Tərəfdaşın Misterio çarxında (spin) iştirak etməsi üçün əsasdır.') +

      h('Maddə 3. Razılaşdırılmış endirim şərtləri') +
      p('Təklif edilən endirim faizi (%): <b>' + c.disc + '%</b>') +
      li('<b>3.1.</b> Tərəfdaş yuxarıda göstərilən endirim faizini, Müştəri tərəfindən etibarlı Misterio kupon kodu təqdim edildiyi hər halda, heç bir istisna qoymadan tətbiq etməyi təəhhüd edir.') +
      li('<b>3.2.</b> Endirimin məbləği tamamilə Tərəfdaşın öz hesabına aiddir — Şəxs1 endirimin maliyyə yükünü Tərəfdaşa kompensasiya etmir.') +

      h('Maddə 4. Tərəfdaşın öhdəlikləri') +
      li('<b>4.1.</b> Kupon kodu təqdim edən hər bir Müştəriyə, kodun etibarlılığını yoxladıqdan sonra, razılaşdırılmış faiz həcmində endirim tətbiq etmək.') +
      li('<b>4.2.</b> Kupon kodunun etibarlılığını əsassız şəkildə rədd etməmək və ya süni maneələr yaratmamaq. Belə bir hal yarandığı halda isə müştəriyə alternativlər təqdim etmək.') +
      li('<b>4.3.</b> Hər təsdiqlənmiş sifarişi Şəxs1 tərəfindən təqdim olunan admin panel vasitəsilə (sifariş məbləği, tətbiq olunan endirim, yekun məbləğ) qeydə almaq.') +
      li('<b>4.4.</b> Endirim şərtlərində hər hansı dəyişiklik etmək istədikdə, bunu qabaqcadan (ən azı 7 (yeddi) təqvim günü əvvəl) Şəxs1-ə yazılı şəkildə bildirmək.') +

      h('Maddə 5. Öhdəliyin pozulması və məsuliyyət') +
      li('<b>5.1.</b> Əgər Tərəfdaş bu Müqavilədə razılaşdırılmış endirimi əsassız olaraq tətbiq etməzsə və ya imtina edərsə, bu, Müqavilənin bilavasitə pozulması sayılır.') +
      li('<b>5.2.</b> Bu cür pozuntu nəticəsində Müştəriyə dəyən hər hansı maddi və ya mənəvi zərər tamamilə Tərəfdaşın öz məsuliyyətinə aiddir.') +
      li('<b>5.3.</b> Şəxs1, Tərəfdaşın öhdəliyi pozması nəticəsində yaranan birbaşa maddi zərərə görə məsuliyyət daşımır, lakin belə halların araşdırılmasında Müştəriyə dəstək məqsədilə sübut materiallarını (kupon istifadəsi tarixçəsi, admin panel qeydləri) təqdim edə bilər.') +
      li('<b>5.4.</b> Tərəfdaş tərəfindən 3 (üç) və ya daha çox təsdiqlənmiş pozuntu halının qeydə alınması Şəxs1-ə yazılı bildiriş göndərməklə Tərəfdaşı birtərəfli qaydada platformadan çıxarmaq hüququ verir.') +

      h('Maddə 6. Müqavilənin qüvvədə olma müddəti və ləğvi') +
      li('<b>6.1.</b> Bu Müqavilə imzalandığı tarixdən qüvvəyə minir və qarşılıqlı razılaşma olmadıqda müddətsiz olaraq bağlanır.') +
      li('<b>6.2.</b> Hər bir Tərəf, digər Tərəfə ən azı 14 (on dörd) təqvim günü əvvəl yazılı bildiriş göndərməklə, əsas göstərmədən Müqaviləni birtərəfli qaydada ləğv edə bilər.') +
      li('<b>6.3.</b> Müqavilənin ləğvi, ləğvdən əvvəl yaranmış öhdəliklərə (o cümlədən artıq təqdim edilmiş, lakin hələ istifadə olunmamış kuponlara) təsir etmir — bu cür kuponlar öz etibarlılıq müddəti bitənə qədər qüvvədə qalır.') +

      h('Maddə 7. Digər şərtlər') +
      li('<b>7.1.</b> Bu Müqavilə Azərbaycan Respublikasının qüvvədə olan qanunvericiliyinə uyğun tənzimlənir.') +
      li('<b>7.2.</b> Tərəflər arasında yaranan mübahisələr ilk növbədə danışıqlar yolu ilə həll edilməyə çalışılır; nəticə əldə olunmadıqda, mübahisə Azərbaycan Respublikasının müvafiq məhkəməsinə göndərilir.') +
      li('<b>7.3.</b> Bu Müqavilə 2 (iki) əsl nüsxədə, hər bir Tərəf üçün bir nüsxə olmaqla tərtib edilmişdir və hər iki nüsxə bərabər hüquqi qüvvəyə malikdir.') +
      li('<b>7.4.</b> Bu Müqaviləyə hər hansı əlavə və dəyişiklik yalnız yazılı formada və hər iki Tərəfin imzası ilə edildikdə qüvvəyə minir.') +

      h('Maddə 8. Tərəflərin imzaları') +
      p('<b>ŞƏXS1:</b> Ad, Soyad: Kamal Ağayev | Vəzifə: Təsisçi | Tarix: ' + today + '</p>') +
      p('<b>TƏRƏFDAŞ:</b> Ad, Soyad: ' + (c.sign || "____________") + ' | Tarix: ' + today + '</p>');
  }

  var pending = null;

  q("compForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = q("cErr");
    err.classList.add("hidden");
    var name = q("cName").value.trim();
    var cat = sel.value;
    var addr = q("cAddr").value.trim();
    var sign = q("cSign").value.trim();
    var disc = parseInt(q("cDisc").value, 10);
    var phone = q("cPhone").value.trim();
    var email = q("cEmail").value.trim().toLowerCase();
    var pass = q("cPass").value;

    if (name.length < 2) { err.textContent = "Şirkət adı çox qısadır."; err.classList.remove("hidden"); return; }
    if (addr.length < 3) { err.textContent = "Ünvan daxil edin."; err.classList.remove("hidden"); return; }
    if (sign.length < 3) { err.textContent = "Tərəfdaşın adı və soyadını daxil edin."; err.classList.remove("hidden"); return; }
    if (!(disc >= 5 && disc <= 90)) { err.textContent = "Endirim faizi 5-90 aralığında olmalıdır."; err.classList.remove("hidden"); return; }
    if (phone.replace(/\D/g, "").length < 7) { err.textContent = "Əlaqə nömrəsi düzgün deyil."; err.classList.remove("hidden"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) { err.textContent = "Admin paneli üçün düzgün email daxil edin."; err.classList.remove("hidden"); return; }
    if (pass.length < 6) { err.textContent = "Admin paneli şifrəsi ən azı 6 simvol olmalıdır."; err.classList.remove("hidden"); return; }

    pending = { name: name, cat: cat, addr: addr, sign: sign, disc: disc, phone: phone, email: email, pass: pass };
    q("contractText").innerHTML = contractHTML(pending);
    q("agreeChk").checked = false;
    q("signBtn").disabled = true;
    q("contractErr").classList.add("hidden");
    q("contractModal").classList.remove("hidden");
  });

  q("agreeChk").addEventListener("change", function (e) {
    q("signBtn").disabled = !e.target.checked;
  });
  q("contractCancel").addEventListener("click", function () {
    q("contractModal").classList.add("hidden");
  });

  var lastContract = null;

  q("signBtn").addEventListener("click", function () {
    if (!q("agreeChk").checked || !pending) return;
    q("signBtn").disabled = true;
    var ts = new Date();
    var rec = {
      id: "C-" + ts.getTime(),
      companyName: pending.name,
      cat: pending.cat, disc: pending.disc, phone: pending.phone,
      address: pending.addr, sign: pending.sign, email: pending.email,
      signedAt: ts.toISOString(),
      ip: (window.clientIp ? window.clientIp() : "—"),
      version: (window.CONTRACT_VERSION || "v1.0"),
      status: "aktiv"
    };

    // 1) DB-yə şirkəti yaz
    window.addCompany({
      name: pending.name, cat: pending.cat, disc: pending.disc, phone: pending.phone,
      address: pending.addr, email: pending.email, password: pending.pass
    }).then(function (r) {
      if (r && r.company) { rec.companyId = r.company.id; if (window.MA && window.MA.sirketElaveEtdi) window.MA.sirketElaveEtdi(pending.cat); }
      return r;
    }).then(function () {
      // 2) Uğur modalı (sadə)
      q("contractModal").classList.add("hidden");
      q("okTxt").textContent = pending.name + " — " + pending.disc + "%";
      q("okSub").textContent = "";
      q("okMeta").innerHTML =
        '<div style="font-size:15px;line-height:1.9;color:#fff">' +
        '✅ Müqavilə uğurla imzalandı və şirkət əlavə edildi.<br>' +
        '📄 Müqavilə PDF forması emailinizə göndərildi: <b>' + pending.email + '</b>' +
        '<div id="mailStatus" style="color:#ffcf5c;margin-top:8px;font-size:13px">📧 Göndərilir…</div>' +
        '</div>';
      q("okModal").classList.remove("hidden");
      q("compForm").reset();
      renderList();

      // 3) Email + PDF (serverdə yaradılır, müştərinin emailinə gedir)
      return fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contract", email: pending.email, companyName: pending.name,
          id: rec.id, cat: pending.cat, disc: pending.disc, phone: pending.phone,
          address: pending.addr, sign: pending.sign, version: rec.version, signedAt: rec.signedAt
        })
      });
    }).then(function (mr) {
      return mr.json().catch(function () { return {}; }).then(function (mj) {
        var ms = q("mailStatus");
        if (mr.ok && mj.ok) {
          lastContract = Object.assign({}, rec, { pdf: mj.pdf || null });
          ms.textContent = "✅ Müqavilə PDF forması emailinizə göndərildi.";
        } else {
          ms.textContent = "⚠️ Müqavilə yaradıldı, amma email göndərilmədi: " + (mj.error || "xəta");
        }
      });
    }).catch(function (err) {
      var ms = q("mailStatus");
      if (ms) ms.textContent = "⚠️ Email göndərmə xətası: " + err.message;
    });
  });

  q("dlPdf").addEventListener("click", function () {
    if (lastContract && lastContract.pdf) {
      var a = document.createElement("a");
      a.href = lastContract.pdf;
      a.download = "misterio-muqavile-" + lastContract.id + ".pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert("PDF hazır deyil (serverdən alınmayıb). Səhifəni yeniləyin və ya emailinizə baxın.");
    }
  });

  q("okMore").addEventListener("click", function () {
    q("okModal").classList.add("hidden");
  });

})();
