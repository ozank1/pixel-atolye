/* =========================================================
   AYARLAR: Marka ve iletişim bilgilerini yalnızca buradan değiştirin.
   ========================================================= */
const AYARLAR = {
    markaAdi: "Pixel Atölye",
    whatsappNumarasi: "905375663551", // 905XXXXXXXXX biçiminde, başında + olmadan
    telefon: "0537 566 35 51",
    email: "ozankosar907@gmail.com",
    instagram: "ozankosarr", // @ işareti olmadan; boş bırakılırsa alt bilgide gösterilmez
    fiyatGoster: false // true yapılırsa kartlarda, detayda ve sıralamada fiyat görünür
};

/* =========================================================
   Durum
   ========================================================= */
let tasarimlar = [];          // tasarimlar.json'dan gelen kayıtlar
let seciliKategori = "Tümü";  // aktif kategori
let aramaMetni = "";          // arama kutusundaki metin
let siralama = "onerilen";    // aktif sıralama

const detayModal = new bootstrap.Modal(document.getElementById("detay-modal"));
const kategoriModal = new bootstrap.Modal(document.getElementById("kategori-modal"));

/* =========================================================
   Yardımcılar
   ========================================================= */

// 7900 -> "7.900,00 ₺"
function fiyatYaz(fiyat) {
    return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(fiyat) + " ₺";
}

// Hazır mesajlı WhatsApp linki
function whatsappLinki(mesaj) {
    return "https://wa.me/" + AYARLAR.whatsappNumarasi + "?text=" + encodeURIComponent(mesaj);
}

// Türkçe karakterlere duyarlı küçük harfe çevirme (arama için)
function kucult(metin) {
    return (metin || "").toLocaleLowerCase("tr-TR");
}

// HTML'e güvenli yazı basmak için
function kacis(metin) {
    const d = document.createElement("div");
    d.textContent = metin == null ? "" : String(metin);
    return d.innerHTML;
}

/* =========================================================
   Ayarları sayfaya uygula (marka adı, iletişim, WhatsApp linkleri)
   ========================================================= */
function ayarlariUygula() {
    document.querySelectorAll('[data-ayar="markaAdi"]').forEach(el => el.textContent = AYARLAR.markaAdi);
    document.title = "Hazır Web Sitesi Tasarımları | " + AYARLAR.markaAdi;

    document.querySelectorAll("[data-whatsapp]").forEach(el => {
        el.href = whatsappLinki(el.dataset.whatsapp);
    });

    const tel = document.getElementById("footer-telefon");
    tel.textContent = AYARLAR.telefon;
    tel.href = "tel:" + AYARLAR.telefon.replace(/[^\d+]/g, "");

    const mail = document.getElementById("footer-email");
    mail.textContent = AYARLAR.email;
    mail.href = "mailto:" + AYARLAR.email;

    const ig = document.getElementById("footer-instagram");
    if (AYARLAR.instagram) {
        ig.textContent = "@" + AYARLAR.instagram;
        ig.href = "https://instagram.com/" + AYARLAR.instagram;
    } else {
        ig.closest("li").remove();
    }

    document.getElementById("yil").textContent = new Date().getFullYear();

    // Fiyat kapalıysa fiyata göre sıralama seçenekleri kaldırılır
    if (!AYARLAR.fiyatGoster) document.querySelectorAll('#siralama option[value^="fiyat"]').forEach(o => o.remove());
}

/* =========================================================
   Kategoriler: JSON'dan otomatik çıkarılır, alfabetik sıralanır
   ========================================================= */
function kategoriSayilari() {
    const sayilar = {};
    tasarimlar.forEach(t => (t.kategoriler || []).forEach(k => sayilar[k] = (sayilar[k] || 0) + 1));
    return Object.keys(sayilar)
        .sort((a, b) => a.localeCompare(b, "tr"))
        .map(ad => ({ ad, sayi: sayilar[ad] }));
}

function kategorileriCiz() {
    const liste = [{ ad: "Tümü", sayi: tasarimlar.length }, ...kategoriSayilari()];
    const html = liste.map(k => `
        <button type="button" class="list-group-item list-group-item-action ${k.ad === seciliKategori ? "active" : ""}" data-kategori="${kacis(k.ad)}">
            <span>${kacis(k.ad)}</span><span class="sayi">${k.sayi}</span>
        </button>`).join("");
    document.getElementById("kategori-listesi").innerHTML = html;
    document.getElementById("kategori-listesi-mobil").innerHTML = html;
}

/* =========================================================
   Filtreleme + sıralama
   ========================================================= */
function filtrelenmisTasarimlar() {
    const aranan = kucult(aramaMetni.trim());

    let sonuc = tasarimlar.filter(t => {
        const kategoriUyar = seciliKategori === "Tümü" || (t.kategoriler || []).includes(seciliKategori);
        const metinUyar = !aranan ||
            kucult(t.ad).includes(aranan) ||
            (t.kategoriler || []).some(k => kucult(k).includes(aranan));
        return kategoriUyar && metinUyar;
    });

    if (siralama === "fiyat-artan") sonuc.sort((a, b) => a.fiyat - b.fiyat);
    else if (siralama === "fiyat-azalan") sonuc.sort((a, b) => b.fiyat - a.fiyat);
    else if (siralama === "az") sonuc.sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
    // "onerilen": JSON'daki sıra korunur

    return sonuc;
}

/* =========================================================
   Kartları çiz
   ========================================================= */
function kartlariCiz() {
    const liste = filtrelenmisTasarimlar();
    const kap = document.getElementById("kartlar");

    // Üst bar yazısı
    const yazi = document.getElementById("sonuc-yazi");
    if (seciliKategori === "Tümü" && !aramaMetni.trim()) yazi.textContent = "Tüm kategoriler gösteriliyor";
    else if (seciliKategori === "Tümü") yazi.textContent = `"${aramaMetni.trim()}" araması – ${liste.length} tasarım`;
    else yazi.textContent = `${seciliKategori} kategorisi – ${liste.length} tasarım`;

    document.getElementById("sonuc-yok").classList.toggle("d-none", liste.length > 0);

    kap.innerHTML = liste.map(t => {
        const rozet = t.etiket
            ? `<span class="rozet ${kucult(t.etiket).includes("pop") ? "rozet-populer" : "rozet-yeni"}">${kacis(t.etiket)}</span>`
            : "";
        const kategoriler = (t.kategoriler || []).join(", ");
        const onizleme = t.onizlemeLinki
            ? `<a href="${kacis(t.onizlemeLinki)}" target="_blank" rel="noopener" class="btn btn-xs btn-outline-secondary ms-auto rounded-3" data-dur>Önizleme</a>`
            : `<span class="btn btn-xs btn-outline-secondary ms-auto rounded-3 disabled">Yakında</span>`;
        return `
        <div class="col-12 col-md-6 col-xl-4">
            <div class="card tasarim-kart rounded-4 border-light-subtle h-100" data-id="${kacis(t.id)}" tabindex="0" role="button" aria-label="${kacis(t.ad)} detayını aç">
                <div class="kart-gorsel rounded-top-4 border-bottom">
                    ${rozet}
                    <img src="${kacis(t.gorsel)}" alt="${kacis(t.ad)}" loading="lazy">
                </div>
                <div class="card-body">
                    <p class="mb-0 small fw-bold text-truncate" title="${kacis(t.ad)}">${kacis(t.ad)}</p>
                    <p class="mb-0 small text-muted text-truncate" title="${kacis(kategoriler)}">${kacis(kategoriler)}</p>
                    ${t.menuLinki ? `<p class="mb-0 small text-success fw-semibold"><i class="bi bi-qr-code me-1"></i>Karekodlu menü hediye</p>` : ""}
                    ${AYARLAR.fiyatGoster ? `<p class="my-2 text-primary fw-semibold">${fiyatYaz(t.fiyat)}</p>` : `<div class="mb-2"></div>`}
                    <div class="d-flex align-items-center mt-2">
                        <a href="${whatsappLinki(`Merhaba, ${t.ad} tasarımı hakkında bilgi almak istiyorum`)}" target="_blank" rel="noopener" class="btn btn-xs btn-outline-secondary rounded-3" data-dur>Bilgi al</a>
                        ${onizleme}
                    </div>
                </div>
            </div>
        </div>`;
    }).join("");
}

/* =========================================================
   Kart görseli kaydırma efekti
   Fare kartın üzerine gelince görsel, yüksekliğine göre hesaplanan
   mesafe kadar yukarı kayar (2 sn, CSS geçişi). Fare çekilince geri döner.
   ========================================================= */
function kaydirmaBaslat(kart) {
    const kutu = kart.querySelector(".kart-gorsel");
    const img = kutu.querySelector("img");
    const mesafe = img.offsetHeight - kutu.clientHeight;
    if (mesafe > 0) img.style.transform = `translateY(-${mesafe}px)`;
}
function kaydirmaBitir(kart) {
    kart.querySelector(".kart-gorsel img").style.transform = "translateY(0)";
}

/* =========================================================
   Detay modalı + paylaşılabilir #tasarim-ID linki
   ========================================================= */
function detayAc(id, hashGuncelle = true) {
    const t = tasarimlar.find(x => x.id === id);
    if (!t) return;

    document.getElementById("detay-img").src = t.gorsel;
    document.getElementById("detay-img").alt = t.ad;
    document.getElementById("detay-ad").textContent = t.ad;
    document.getElementById("detay-kategoriler").textContent = (t.kategoriler || []).join(", ");
    const detayFiyat = document.getElementById("detay-fiyat");
    detayFiyat.textContent = AYARLAR.fiyatGoster ? fiyatYaz(t.fiyat) : "";
    detayFiyat.classList.toggle("d-none", !AYARLAR.fiyatGoster);
    document.getElementById("detay-aciklama").textContent = t.aciklama || "";
    document.getElementById("detay-ozellikler").innerHTML = (t.ozellikler || []).map(o => `<li>${kacis(o)}</li>`).join("");

    const onizleme = document.getElementById("detay-onizleme");
    onizleme.classList.toggle("d-none", !t.onizlemeLinki);
    onizleme.href = t.onizlemeLinki || "#";

    const menu = document.getElementById("detay-menu");
    menu.classList.toggle("d-none", !t.menuLinki);
    menu.href = t.menuLinki || "#";

    document.getElementById("detay-siparis").href =
        whatsappLinki(AYARLAR.fiyatGoster
            ? `Merhaba, ${t.ad} tasarımını ${fiyatYaz(t.fiyat)} fiyatıyla sipariş vermek istiyorum`
            : `Merhaba, ${t.ad} tasarımıyla web sitesi yaptırmak istiyorum`);

    document.querySelector("#detay-modal .detay-gorsel").scrollTop = 0;
    if (hashGuncelle) history.replaceState(null, "", "#tasarim-" + t.id);
    detayModal.show();
}

// Modal kapanınca adres çubuğundaki #tasarim-ID temizlenir
document.getElementById("detay-modal").addEventListener("hidden.bs.modal", () => {
    if (location.hash.startsWith("#tasarim-")) history.replaceState(null, "", location.pathname + location.search);
});

// Adres #tasarim-ID ise o tasarımı aç (paylaşılan link)
function hashKontrol() {
    if (location.hash.startsWith("#tasarim-")) detayAc(decodeURIComponent(location.hash.slice(9)), false);
}
window.addEventListener("hashchange", hashKontrol);

/* =========================================================
   Kategori seçimi (liste, popüler aramalar, hero butonu)
   ========================================================= */
function kategoriSec(ad, kaydir = true) {
    seciliKategori = ad;
    aramaMetni = "";
    document.getElementById("arama").value = "";
    kategorileriCiz();
    kartlariCiz();
    if (kaydir) document.getElementById("tasarimlar").scrollIntoView({ behavior: "smooth" });
}

/* =========================================================
   Olaylar
   ========================================================= */
function olaylariBagla() {
    // Arama: yazdıkça anında filtrele (arama tüm kategorilerde yapılır)
    document.getElementById("arama").addEventListener("input", e => {
        aramaMetni = e.target.value;
        if (aramaMetni.trim() && seciliKategori !== "Tümü") {
            seciliKategori = "Tümü";
            kategorileriCiz();
        }
        kartlariCiz();
    });

    // Sıralama
    document.getElementById("siralama").addEventListener("change", e => {
        siralama = e.target.value;
        kartlariCiz();
    });

    // Kategori listeleri (masaüstü + mobil modal)
    document.querySelectorAll(".kategori-listesi").forEach(liste => {
        liste.addEventListener("click", e => {
            const btn = e.target.closest("[data-kategori]");
            if (!btn) return;
            const mobilden = liste.id === "kategori-listesi-mobil";
            if (mobilden) kategoriModal.hide();
            kategoriSec(btn.dataset.kategori, mobilden);
        });
    });

    // Popüler aramalar ve "E-ticaret tasarımları" butonu
    document.querySelectorAll("[data-kategori-sec]").forEach(btn => {
        btn.addEventListener("click", () => kategoriSec(btn.dataset.kategoriSec));
    });

    // Kartlar: tıklama detay açar, hover kaydırma efektini başlatır
    const kap = document.getElementById("kartlar");
    kap.addEventListener("click", e => {
        if (e.target.closest("[data-dur]")) return; // "Bilgi al" ve "Önizleme" kendi linkini açar
        const kart = e.target.closest(".tasarim-kart");
        if (kart) detayAc(kart.dataset.id);
    });
    kap.addEventListener("keydown", e => {
        const kart = e.target.closest(".tasarim-kart");
        if (kart && (e.key === "Enter" || e.key === " ") && e.target === kart) { e.preventDefault(); detayAc(kart.dataset.id); }
    });
    kap.addEventListener("mouseover", e => {
        const kart = e.target.closest(".tasarim-kart");
        if (kart && !kart.contains(e.relatedTarget)) kaydirmaBaslat(kart);
    });
    kap.addEventListener("mouseout", e => {
        const kart = e.target.closest(".tasarim-kart");
        if (kart && !kart.contains(e.relatedTarget)) kaydirmaBitir(kart);
    });
}

/* =========================================================
   Hero kolajı: ilk 3 tasarımın görseli
   ========================================================= */
function kolajiDoldur() {
    const resimler = document.querySelectorAll("#kolaj img");
    tasarimlar.slice(0, 3).forEach((t, i) => { if (resimler[i]) resimler[i].src = t.gorsel; });
}

/* =========================================================
   Başlat
   ========================================================= */
async function baslat() {
    ayarlariUygula();
    olaylariBagla();
    try {
        const yanit = await fetch("tasarimlar.json", { cache: "no-cache" });
        tasarimlar = await yanit.json();
    } catch (hata) {
        console.error("tasarimlar.json okunamadı:", hata);
        document.getElementById("sonuc-yok").classList.remove("d-none");
        document.querySelector("#sonuc-yok p").textContent =
            "Tasarımlar yüklenemedi. Sayfayı bir sunucu üzerinden açın (dosyaya çift tıklayınca tarayıcı buna izin vermez).";
        return;
    }
    document.getElementById("tasarim-sayisi").textContent = tasarimlar.length;
    kolajiDoldur();
    kategorileriCiz();
    kartlariCiz();
    hashKontrol();
}

baslat();
