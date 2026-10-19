# Hazır Tasarım Vitrini

Hazır web sitesi tasarımlarını sergileyen tek sayfalık satış sayfası. Ziyaretçi tasarımı seçer, WhatsApp'tan bilgi alır ya da sipariş verir.

## Araçlar
- Bootstrap 5.3.3 ve Bootstrap Icons 1.11.3 (CDN), sade JavaScript. Kurulum ya da paket gerekmez.

## Dosyalar
- `index.html`: sayfa
- `style.css`: görünüm (kart kaydırma efekti, kolaj, sabit WhatsApp butonu)
- `app.js`: en üstteki `AYARLAR` nesnesi marka adı, WhatsApp numarası, telefon, e-posta ve Instagram'ı tek yerden yönetir
- `tasarimlar.json`: tüm tasarımlar. Yeni tasarım için buraya bir kayıt eklemek yeter
  (`id, ad, kategoriler[], fiyat, gorsel, onizlemeLinki, aciklama, ozellikler[], etiket?`)
- `img/`: kart görselleri (600 px genişliğinde tam sayfa ekran görüntüsü)
- `onizleme/`: canlı önizleme sayfaları (Web_Site_Satis_Otomasyonu şablonlarından, uydurma işletmelerle derlendi)

## Çalıştırma
`tasarimlar.json` fetch ile okunduğu için dosyaya çift tıklamak yetmez. `Onizle.bat` yerel sunucu açar (http://localhost:8765).
Yayın için klasörün tamamı herhangi bir statik barındırmaya (Surge, Netlify) yüklenir.

## Paylaşılabilir link
Bir tasarımın detayı açıkken adres `#tasarim-<id>` olur; bu link o tasarımı doğrudan açar.
