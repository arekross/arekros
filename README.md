# ◈ arekros — Klinik Danışmanlık Konsolu

> **Profesyonel Dermokozmetik Danışmanlık Portalı & Yapay Zeka Destekli Ambalaj Stüdyosu**

---

## 📌 Genel Bakış

**arekros**, eczacılar, dermatologlar ve dermokozmetik danışmanları için geliştirilmiş yüksek performanslı bir klinik danışmanlık konsoludur. Geleneksel e-ticaret ızgaralarından farklı olarak, hastaya/danışana anında bilimsel ve güvenli ürün tavsiyesi sunulmasını sağlayan **Klinik Çalışma Masası (Workstation)** mimarisine sahiptir.

Ayrıca bünyesinde barındırdığı **AI Destekli Ürün Stüdyosu** sayesinde, eczane rafından çekilen toplu fotoğrafları tarayarak ürünleri algılar, internetten 4K stüdyo ambalajlarını bulur ve 7 blokluk klinik künyeyi otomatik oluşturur.

---

## ✨ Temel Özellikler

### 1. 🩺 Klinik Çalışma Masası (Workstation Console)
- **Hızlı Ürün Gezgini:** Sol panelde anlık arama (`Ctrl+K`), Marka ve Rutin filtreleri, anlık ürün sayacı.
- **Klavye Kısayolları:** 
  - `↑ / ↓` ile sol listede gezinme
  - `← / →` ile sahnede önceki / sonraki ürüne geçiş
- **Dev 4:3 Ambalaj Sahnesi:** 4K stüdyo ambalajı ve tek tıkla yüksek çözünürlüklü büyüteç (lightbox).
- **7 Kritik Klinik Blok:**
  1. **Kime Uygun? & Yaş Matrisi:** Yenidoğan, Bebek, Çocuk, Ergen, Yetişkin, Geriatri, Gebelik ve Emzirme uygunluk durumu.
  2. **Güvenlik Filtresi:** Kontrendikasyonlar, göz çevresi kısıtlamaları ve hekime sevk kriterleri.
  3. **Danışan Şikayeti:** Danışanın geliş cümlesi, eczacının sorması gereken soru ve ürün seçim nedeni.
  4. **Formülasyon & Aktifler:** Öne çıkan etken maddeler, dermatolojik rozetler ve doku.
  5. **Kullanım Protokolü:** Rutindeki sırası, uygulama zamanı & sıklığı, beklenen etki süresi.
  6. **Kombinasyon & Etkileşimler:** Birlikte önerilebilecekler ve çakışan kimyasallar.
  7. **Muadil Rehberi:** En yakın dermokozmetik eşdeğer alternatifler.
- **📋 Danışan Notunu Kopyala:** Danışana WhatsApp veya mesaj ile gönderilecek profesyonel kullanım tavsiyesini tek tıkla panoya kopyalar.

### 2. 🎴 Vitrin Kataloğu Modu
- Üst bardan tek tıkla geçilebilen zengin kartlı vitrin.
- Vitrindeki herhangi bir ürüne tıklandığında kesintisiz olarak Çalışma Masası moduna geçer ve o ürünü sahnede odaklar.

### 3. 📸 Birleşik Stüdyo & AI Motoru
- **Eczane Rafından Otomatik Ekleme:** Raf fotoğrafını yükleyin; sistem raftaki tüm ürünleri tespit eder, listeler, internetten en kaliteli ambalajları getirir ve onayınızla kataloğa ekler.
- **Webden İsimle Tekil Ekleme:** Ürün adını yazarak saniyeler içinde ambalaj ve klinik bilgileri çekin.
- **0.7s AI Arka Plan Temizleme:** Saydamlaştırılmış stüdyo ambalajları.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Linux / macOS / Windows
- Python 3.10+
- Modern Web Tarayıcısı (Chrome, Edge, Firefox, Brave)

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/arekross/arekros.git
cd arekros
```

### 2. Sanal Ortamı Hazırlayın
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # veya gerekli paketler
```

### 3. Konsolu Başlatın
```bash
python3 process_product_photo.py --serve
```

Tarayıcınızdan **`http://localhost:8088/app/`** adresine gidin.

---

## 🛠️ Sistem Servisi Olarak Çalıştırma (Arch / Linux)

Sistemin arka planda kesintisiz çalışması veya üst panelden açılıp kapatılabilmesi için systemd user servisi kullanılabilir:

```bash
# Servisi başlatma
systemctl --user start eczane-pro.service

# Servis durumunu kontrol etme
systemctl --user status eczane-pro.service
```

---

## 📂 Proje Yapısı

```text
arekros/
├── app/
│   ├── index.html        # Çift şablonlu modern UI (Workstation & Grid)
│   ├── style.css         # Siber-klinik konsol tasarımı & animasyonlar
│   ├── app.js            # Workstation ve filtreleme mantığı
│   ├── clinical_data.json# 60+ ürünün 7 blokluk klinik veri tabanı
│   └── images/           # Yüksek çözünürlüklü stüdyo ambalajları
├── process_product_photo.py # Python API, raf analizi ve stüdyo sunucusu
├── github_yukle.sh       # GitHub eşitleme yardımcısı
└── README.md
```

---

## 📄 Lisans
Tüm hakları saklıdır © 2026 arekros.
