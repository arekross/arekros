# 📋 ECZANE PRO — RESMÎ KLİNİK ÜRÜN ŞABLONU (STANDART METADATA PROTOKOLÜ)

Bu doküman, Eczane Pro Workspace veritabanına eklenecek tüm dermokozmetik, takviye ve ilaç ürünlerinin standart klinik şablonudur. Veri çıkarma (PDF parser) ve ürün kartı gösteriminde bu 7 blokluk hiyerarşi esas alınır.

---

## 🎯 1. Kime Uygun? (Profil & Detaylı Yaş/Yaşam Dönemi Analizi)

> [!IMPORTANT]
> **Yaş ve Yaşam Dönemi Asla Üstünkörü Geçilemez!** Eczacılıkta aktif maddelerin (retinoidler, asitler, kimyasal güneş filtreleri vb.) emilimi ve toksisitesi doğrudan yaş ve deri bariyeri kalınlığına bağlıdır.

* **Cilt Tipi & Durumu:**
  * Kuru / Çok Kuru / Atopik
  * Yağlı / Akneye Eğilimli / Karma (T Bölgesi Yağlı, Yanaklar Kuru)
  * Hassas / Reaktif / Roza & Kızarıklığa Eğilimli
  * Nemsiz (Dehidrate) / Mat & Lekeli
  * İnce, Yaşlanan veya Bariyeri Bozulmuş Cilt

* **🔬 Ayrıntılı Yaş Grubu & Fizyolojik Dönem Kriterleri:**
  * **Yenidoğan (0 - 28 Gün):** Doğumdan itibaren kullanılabilir mi? *(Prematüre bebekler hariç mi? Göbek bağı düşene kadar kuralı var mı?)*
  * **Bebek (1 Ay - 2 Yaş):** Bebek cildi yetişkine göre 3 kat daha incedir; bariyer geçirgendir. Salisilik asit, parfüm ve esansiyel yağlar yasaktır.
  * **Çocuk (2 - 12 Yaş):** Fiziksel aktivite, atopik alevlenme ve güneş koruma dönemi.
  * **Ergenlik / Genç (12 - 18 Yaş):** Hormonal sebum artışı, komedon ve akne başlangıcı. Yüksek konsantrasyonlu sert asitler yerine mikrobiyom ve bariyer koruyucu aktifler tercih edilir.
  * **Yetişkin (18 - 65 Yaş):** Tüm standart dermokozmetik aktifler (Retinol, AHA/BHA, C vitamini vb.) için uygun ana profil.
  * **Geriatri / Yaşlı Cilt (65+ Yaş):** İnceltilmiş epidermiste purpura, kuruluk kaşıntısı (senil pruritus) ve polifarmasi (çoklu ilaç kullanımı) riski.
  * **🤰 Gebelik (Hamilelik) Uygunluğu:**
    * *Güvenli mi?* (Örn: Azelaik asit, C vitamini, Hyaluronik asit, Mineral çinko filtreler güvenlidir.)
    * *YASAK MI?* (Örn: **Retinol / Retinoid türevleri TERATOJENDİR, kesinlikle yasaktır!** Yüksek konsantrasyonlu Salisilik asit önerilmez.)
  * **🤱 Emzirme Dönemi Uygunluğu:** Göğüs ucuna temas uyarısı, emilim riski olan aktifler.

---

## 🩺 2. Güvenlik Filtresi (Kimlere Uygun Değil / Dikkat Edilecekler)

* **Kesin Kontrendikasyonlar (Asla Verilmeyecek Durumlar):**
  * Açık yara, sızıntılı ekzema, aktif herpes/uçuk lezyonları, enfekte dokular.
  * Sistemik/topikal İzotretinoin (Roaccutane) tedavisi gören aşırı incelmiş ciltler.
* **Bölgesel Güvenlik Sınırları:** Göz kapağı, dudak mukozası veya genital bölgeye temas kısıtlamaları.
* **Tolerans & Hekime Yönlendirme (Kırmızı Bayraklar):**
  * 2 haftayı geçen ve düzelmeyen lezyonlar, yayılan döküntüler, enfeksiyon şüphesi doğrudan dermatoloğa yönlendirilir.

---

## ❓ 3. Hasta Hangi Şikayetlerle Geldiğinde Verilmeli? (Klinik Teşhis & Arama Motoru)

Bu blok, uygulamanın akıllı arama ve semptom eşleştirme motorunun temelidir.

* **🗣️ Danışanın Ağzından Gerçek İfadeler:**
  * *“T bölgem gün içinde parlıyor ama yanaklarım pul pul dökülüyor ve geriliyor.”*
  * *“Sivilcelerim söndükten sonra yerinde kırmızı/kahverengi lekeler kalıyor.”*
  * *“Sıcak basınca yüzüm alev gibi yanıyor ve kızarıklık geçmiyor.”*
* **🏷️ Teşhis Etiketleri (Arama Motoru Anahtar Kelimeleri):**
  * Örn: `#t_bölgesi_yağlı`, `#pullanma`, `#akne_lekesi`, `#kızarıklık`, `#komedon`, `#yanma_batma`, `#nemsizlik`
* **🩺 Eczacının Soracağı 1-2 Kilit Soru:**
  * *“Şu an dermatolog kontrolünde kullandığınız reçeteli bir ilaç veya asit var mı?”*
  * *“Kuruluk mevsimsel mi, yoksa banyo/yüz yıkama sonrasında mı artıyor?”*
* **💡 Neden Bu Ürün Seçilmeli?:**
  * Ürünün hastanın şikayetini mekanik veya biyolojik olarak nasıl çözdüğünün 1 cümlelik gerekçesi.

---

## 🧪 4. Formülasyon & Güvenlik Rozetleri (Hap Eczacı Özeti)

Teorik 40 satırlık INCI kimya listesi yerine, danışanın bankoda sorduğu 3 kritik soruya yanıt:

* **Ana Aktif Maddeler & Bilinen Konsantrasyonlar:**
  * Örn: `%10 Saf Niasinamid`, `%2 Salisilik Asit (BHA)`, `%5 Çinko Oksit`, `Prebiyotik Bioécolia`
* **Doku & Bitiş:** (Akışkan jel / Zengin krem / Su bazlı fluid / Çift fazlı yağ)
* **Kritik Eczane Rozetleri:**
  * `[Parfümsüz]` veya `[Hipoalerjenik Parfümlü]`
  * `[Non-Komedojenik (Gözenek Tıkamaz)]`
  * `[Alkolsuz / Koruyucusuz]`
  * `[Mineral / Fiziksel Filtre]` veya `[Kimyasal Filtre]`

---

## ⏱️ 5. Kullanım Protokolü & Beklenti (Detaylı Uygulama Rehberi)

Danışanın ürünü yanlış kullanıp "fayda etmedi" demesini önleyen eksiksiz kılavuz:

* **Rutindeki Sıralaması (Adım Adım):**
  1. *Yüz Yıkama Jeli / Köpük*
  2. *Tonik / Termal Su*
  3. *Serum / Tedavi Edici Konsantre*
  4. *Göz Çevresi Kremi*
  5. *Nemlendirici Krem / Bariyer Losyonu*
  6. *Güneş Koruyucu (Sabah Rutininde)*
* **Uygulama Zamanı & Sıklığı:** (Sabah mı, Akşam mı, Günde 2 kez mi, Haftada 2-3 gece mi?)
* **Uygulama Miktarı:** (Nohut büyüklüğünde / 2 pompa / 3-4 damla)
* **Uygulama Şekli:** Islak cilde mi kuru cilde mi? Ovalayarak mı tamponlayarak mı?
* **Beklenen Sonuç Zaman Çizelgesi:**
  * *Anlık Etki (İlk 15 dk):* Nem artışı, gerginliğin yatışması.
  * *Kısa Vade (1-2 Hafta):* Kızarıklıkta hafifleme *(varsa mikrobiyom kusma uyarısı).*
  * *Orta Vade (4-8 Hafta):* Leke görünümünde azalma, bariyer onarımı, cilt elastikiyeti.

---

## 🔄 6. Rutin Uyumu & Kombinasyonlar (Akıllı Veritabanı İlişkileri)

* **Birlikte Önerilecek Tamamlayıcı Rutin (Kombin Ürünler):**
  * *Temizleme:* Hangi temizleyici ile kombine edilmeli?
  * *Nemlendirme / Onarım:* Üzerine hangi krem kilitlenmeli?
  * *Güneş Koruması:* Hangi güneş koruyucu ile uyumlu?
* **⚠️ Birlikte KULLANILMAMASI Gerekenler (Çakışmalar & İnkompatibilite):**
  * *Etken Madde Bazlı:* Örn: "Salisilik asit ile C vitamini aynı rutinde sürülmez; Retinol ile AHA/BHA asitler aynı gece kullanılmaz."
  * *Ürün Bazlı:* "Kalıp sabunlar bu bariyer kremin etkisini sıfırlar."

---

## ⚖️ 7. Muadil Karşılaştırması & Seçim Rehberi (Alternatif Planı)

Eczanede o an ürün stokta yoksa veya hastanın özel bir doku/bütçe tercihi varsa:

* **1. Derece En Yakın Muadili:** *(Aynı etken madde ve aynı endikasyona sahip alternatif)*
* **2. Derece Doku / Fiyat Alternatifi:** *(Daha hafif/zengin dokulu veya farklı fiyat segmentindeki alternatif)*
* **Seçim Kriteri:** Hangi hastaya ana ürün, hangi hastaya muadil ürün tercih edilmeli?

---

## 💾 JSON Veri Modeli Eşleşmesi (Teknik Geliştirici Şeması)

```json
{
  "id": "marka-seri-urun-adi-boyut",
  "name": "Ürün Resmî Adı",
  "brand": "Bioderma / La Roche-Posay / Mustela vb.",
  "category": "dermo | vitamin | dental",
  "category_name": "Kozmetik & Dermokozmetik",
  "sub_category": "Sensibio / Atoderm vb.",
  "size": "40 ml",
  "form": "Tüp / Pompalı Şişe / Damlalık",
  "image": "images/marka/urun-adi.png",

  "kime_uygun": {
    "cilt_tipleri": ["Kızarıklığa eğilimli hassas cilt", "Nemsiz cilt"],
    "yas_kriterleri": {
      "yenidogan_uygun_mu": false,
      "bebek_uygun_mu": false,
      "cocuk_uygun_mu": false,
      "ergen_uygun_mu": true,
      "yetiskin_uygun_mu": true,
      "geriatri_uygun_mu": true,
      "gebelik_guvenli_mi": true,
      "emzirme_guvenli_mi": true,
      "yas_aciklama_detay": "12 yaşından büyük ergenler ve yetişkinler içindir. Gebelik ve emzirmede sistemik emilim göstermeyen güvenli içeriklere sahiptir."
    }
  },

  "guvenlik_filtresi": {
    "kontrendikasyonlar": "Açık yara ve sızıntılı lezyonlara sürülmez.",
    "goz_cevresi_temas": "Göz kapağına doğrudan uygulanmaz.",
    "doktora_yonlendirme": "Kalıcı ve yaygın telanjiyektazi (kılcal damar çatlaması) durumunda dermatoloğa yönlendirilir."
  },

  "hasta_sikayeti": {
    "hasta_cumlesi": "Yüzüm özellikle sıcak duştan sonra alev alev yanıyor ve kızarıklık geçmiyor.",
    "arama_etiketleri": ["kızarıklık", "yanma", "sıcak basması", "kılcal damar", "roza"],
    "eczaci_sorusu": "Kızarıklık sadece banyodan sonra mı oluyor, yoksa gün boyu kalıcı mı?",
    "secim_nedeni": "Rosactiv patentli formülüyle damar genişlemesini ve yangıyı hedefler."
  },

  "formulasyon": {
    "aktif_bilesenler": ["Rosactiv Patent", "D.A.F Kompleksi", "Gliserin"],
    "doku": "Yumuşak emilen krem",
    "rozetler": ["Parfümsüz", "Non-Komedojenik", "Hipoalerjenik"]
  },

  "kullanim_protokolu": {
    "rutin_siralamasi": "Yüz temizleme jeli veya micellar sudan sonra, güneş kremi öncesinde.",
    "zaman_ve_siklik": "Günde 2 kez (Sabah ve Akşam)",
    "miktar": "Nohut büyüklüğünde tüm yüze ve boyna",
    "uygulama_sekli": "Temiz ve kurulanmış cilde nazik dairesel hareketlerle masaj yapılarak sürülür. Durulanmaz.",
    "beklenen_sonuc": "İlk sürüşte serinletici yatışma, 4 haftada kızarıklık ataklarında belirgin azalma."
  },

  "kombinasyonlar": {
    "tamamlayici_kombinler": ["sensibio-h2o-500ml", "photoderm-ar-spf50"],
    "yasakli_cakismalar": ["Yüksek oranlı Saf Retinol veya Saf Glikolik Asitle aynı seansta sürülmemeli."],
    "etkilesim_uyarisi": "Alkali sabunlarla temizlenen yüzde etkisi azalır."
  },

  "muadil_rehberi": {
    "en_yakin_muadil": "La Roche-Posay Toleriane Rosaliac AR",
    "alternatif_fark_notu": "Sensibio AR daha hafif nemlendirici krem kıvamındayken; Rosaliac AR daha akışkan yeşil renk pigmentli dokudadır."
  }
}
```
