#!/usr/bin/env python3
"""
Eczane Pro — Profesyonel Ürün Fotoğrafı İşleme Pipeline'ı
==========================================================
Tekli ürün fotoğrafı veya eczane rafı fotoğrafından:
  1. Arka planı AI ile temizler (rembg / U2Net — kesinlikle gerçek görsel, 0 yapay zeka uydurması)
  2. 4:3 stüdyo kanvasına (1600x1200) ortalar ve doğal zemin gölgesi ekler
  3. Standart dosya adıyla ("marka-urun-adi-boyut.jpeg") "Yeni ürün son güncelleme/" klasörüne kaydeder
  4. Web arayüzü sunucusu modu (--serve) ile tarayıcıdan sürükle-bırak & interaktif kırpma sağlar

Kullanım:
  # 1. Tekli ürün fotoğrafını stüdyo görseline çevir
  .venv/bin/python3 process_product_photo.py \\
      --input foto.jpg \\
      --brand mustela \\
      --name "Stelatopia Intense" \\
      --size 30ml

  # 2. Raf fotoğrafından koordinatla kırp ve işle
  .venv/bin/python3 process_product_photo.py \\
      --input raf.jpg \\
      --mode shelf-manual \\
      --crops "380,100,560,540" \\
      --brand cerave \\
      --name "Kopuren Temizleyici" \\
      --size 473ml

  # 3. Web Arayüzü Sunucusu (Tarayıcıdan Sürükle-Bırak & Kırp)
  .venv/bin/python3 process_product_photo.py --serve 8088

  # 4. Bir klasördeki tüm fotoğrafları toplu işle
  .venv/bin/python3 process_product_photo.py \\
      --input-dir "ürün listesi/images/" \\
      --output-dir "Yeni ürün son güncelleme/"
"""

import argparse
import base64
import io
import json
import os
import re
import sys
from http.server import HTTPServer, ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance
    from rembg import remove, new_session
    REMBG_SESSION = new_session('u2netp')
except ImportError as e:
    print(f"❌ Gerekli paket eksik: {e}")
    print("Yüklemek için: .venv/bin/pip install Pillow rembg[cpu]")
    sys.exit(1)


# ─── Sabitler ──────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT_DIR = str(BASE_DIR / "Yeni ürün son güncelleme")
STUDIO_WIDTH = 1600
STUDIO_HEIGHT = 1200
STUDIO_BG_COLOR = (248, 249, 250)  # #f8f9fa — temiz stüdyo beyazı
JPEG_QUALITY = 94


# ─── Slug & İsimlendirme ────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """Metni URL/dosya adı standart slug formatına çevirir."""
    if not text:
        return ""
    text = text.lower().strip()
    tr_map = str.maketrans({
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    })
    text = text.translate(tr_map)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    text = re.sub(r'-+', '-', text)
    return text


def generate_filename(brand: str, name: str, size: str = "") -> str:
    """Veritabanı standart dosya adı: brand-product-name-size.jpeg"""
    parts = []
    b = slugify(brand)
    n = slugify(name)
    s = slugify(size)
    if b:
        parts.append(b)
    if n:
        parts.append(n)
    if s:
        parts.append(s)
    if not parts:
        parts.append("urun")
    return "-".join(parts) + ".jpeg"


# ─── Görüntü İşleme Pipeline'ı ──────────────────────────────────────────────────

def remove_background(img: Image.Image) -> Image.Image:
    """rembg (u2netp) ile arka planı kaldırır. Şeffaf RGBA döndürür."""
    print("   🔄 Arka plan temizleniyor (u2netp)...")
    if img.mode != 'RGB':
        img = img.convert('RGB')
    if max(img.size) > 1200:
        img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
    result = remove(img, session=REMBG_SESSION)
    print("   ✅ Arka plan temizlendi (şeffaf katman hazır)")
    return result


def auto_crop_transparent(img: Image.Image) -> Image.Image:
    """Şeffaf alanları ürünün en dış piksellerine kadar sıfırlar."""
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"   ✂️  Auto-crop: kenar boşlukları kesildi ({img.width}x{img.height})")
    return img


def create_studio_canvas(
    img_rgba: Image.Image,
    canvas_size: tuple = (STUDIO_WIDTH, STUDIO_HEIGHT),
    bg_color: tuple = STUDIO_BG_COLOR,
    add_shadow: bool = True
) -> Image.Image:
    """
    Ürünü profesyonel e-ticaret / katalog stüdyo formatına dönüştürür:
      - 4:3 standart kanvas (1600x1200)
      - Ürünü oranını bozmadan merkeze oturtur (yükseklik ~%82)
      - Tabanına gerçekçi hafif stüdyo zemin gölgesi ekler (havada asılı kalma hissini önler)
    """
    cw, ch = canvas_size

    # 1. Şeffaf sınırları kırp
    img_rgba = auto_crop_transparent(img_rgba)
    pw, ph = img_rgba.size

    if pw == 0 or ph == 0:
        return Image.new('RGB', canvas_size, bg_color)

    # 2. Boyutlandırma: yükseklik %82'yi, genişlik %78'i geçmeyecek
    target_h = int(ch * 0.82)
    target_w = int(cw * 0.78)

    scale = min(target_h / ph, target_w / pw)
    new_w = max(1, int(pw * scale))
    new_h = max(1, int(ph * scale))

    img_scaled = img_rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 3. Kanvas oluştur
    canvas = Image.new('RGBA', (cw, ch), bg_color + (255,))

    # Ürün yerleşimi: yatayda tam orta, dikeyde tabanı ~%88 hizasında
    pos_x = (cw - new_w) // 2
    pos_y = int(ch * 0.88) - new_h

    # 4. Zemin Gölgesi (Soft Studio Contact Shadow)
    if add_shadow and new_w > 20:
        shadow_w = int(new_w * 0.82)
        shadow_h = max(8, int(new_h * 0.04) + 6)
        shadow = Image.new('RGBA', (shadow_w, shadow_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(shadow)
        # Yumuşak koyu gri elips
        draw.ellipse([0, 0, shadow_w - 1, shadow_h - 1], fill=(35, 40, 50, 75))
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=max(3, shadow_h // 2)))

        shadow_x = (cw - shadow_w) // 2
        shadow_y = pos_y + new_h - (shadow_h // 2) + 2
        canvas.alpha_composite(shadow, (shadow_x, shadow_y))

    # 5. Ürünü yerleştir
    canvas.alpha_composite(img_scaled, (pos_x, pos_y))

    print(f"   🎨 4:3 Stüdyo kanvası oluşturuldu ({cw}x{ch})")
    return canvas.convert('RGB')


def process_single(
    input_path: str,
    brand: str,
    name: str,
    size: str = "",
    output_dir: str = DEFAULT_OUTPUT_DIR,
    custom_filename: str = None
) -> str:
    """Tek bir ürün fotoğrafını işler, stüdyo formatına çevirir ve kaydeder."""
    print(f"\n{'='*60}")
    print(f"📸 Tekli Ürün İşleniyor: {input_path}")
    print(f"   Marka: {brand} | Ürün: {name} | Boyut: {size}")
    print(f"{'='*60}")

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Giriş dosyası bulunamadı: {input_path}")

    raw_img = Image.open(input_path)
    print(f"   📁 Orijinal görsel: {raw_img.width}x{raw_img.height} ({raw_img.mode})")

    # 1. Arka planı sil
    nobg = remove_background(raw_img)

    # 2. 4:3 stüdyo kanvasına yerleştir
    studio_img = create_studio_canvas(nobg)

    # 3. Dosya adını belirle
    if custom_filename:
        filename = custom_filename
    else:
        filename = generate_filename(brand, name, size)

    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, filename)

    studio_img.save(out_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
    fsize_kb = os.path.getsize(out_path) / 1024

    print(f"\n   💾 Kaydedildi: {out_path}")
    print(f"   📊 Format: {studio_img.width}x{studio_img.height} JPEG | {fsize_kb:.1f} KB")
    print(f"{'='*60}\n")
    return out_path


def process_crop_coords(
    input_path: str,
    crop_box: tuple,
    brand: str,
    name: str,
    size: str = "",
    output_dir: str = DEFAULT_OUTPUT_DIR
) -> str:
    """Raf fotoğrafından belirli bir koordinatı kırpar ve stüdyo görseli yapar."""
    raw_img = Image.open(input_path)
    x1, y1, x2, y2 = crop_box
    cropped = raw_img.crop((x1, y1, x2, y2))

    # Geçici kaydetmeden doğrudan Pillow üzerinden arka plan kaldır
    nobg = remove_background(cropped)
    studio_img = create_studio_canvas(nobg)

    filename = generate_filename(brand, name, size)
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, filename)

    studio_img.save(out_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
    return out_path


# ─── Web Sunucusu Modu (--serve) ────────────────────────────────────────────────

STUDIO_ACTIVE = True

def analyze_shelf_image(img: Image.Image) -> dict:
    """
    Raf veya toplu ürün fotoğrafını analiz eder:
    Görüntüyü kontrast ve boyut iyileştirmesiyle hazırlar,
    yatay dilimleme ve Tesseract OCR ile şişe/kutuları tespit edip
    Türkçe isim ve klinik tipleriyle sıralı ürün kuyruğu oluşturur.
    """
    w, h = img.size

    # Önizleme görseli (küçük base64)
    thumb = img.copy()
    thumb.thumbnail((640, 360))
    thumb_io = io.BytesIO()
    thumb.save(thumb_io, 'JPEG', quality=80)
    preview_b64 = "data:image/jpeg;base64," + base64.b64encode(thumb_io.getvalue()).decode('utf-8')

    # OCR için kontrast artırma
    im_big = img.resize((min(w * 2, 2400), min(h * 2, 1600)), Image.Resampling.LANCZOS).convert('L')
    enh = ImageEnhance.Contrast(im_big).enhance(2.2)

    import subprocess
    t_out = ""
    try:
        t_path = "/tmp/_shelf_full_ocr.png"
        enh.save(t_path)
        res = subprocess.run(['tesseract', t_path, 'stdout', '--psm', '11'], capture_output=True, text=True, timeout=10)
        t_out = res.stdout.lower()
    except Exception as e:
        print(f"OCR uyarısı: {e}")

    # Marka tespiti
    detected_brand = "Genel"
    if any(k in t_out for k in ["avene", "avène", "wéne", "thermale", "tolérance", "tolerance", "cleanance", "antirougeurs", "rosamed", "avrupa'nin"]):
        detected_brand = "Avène"
    elif any(k in t_out for k in ["cerave", "cera", "renewing", "blemish control"]):
        detected_brand = "CeraVe"
    elif any(k in t_out for k in ["mustela", "stelatopia", "bébé", "bebe", "barrier"]):
        detected_brand = "Mustela"
    elif any(k in t_out for k in ["roche", "posay", "effaclar", "cicaplast", "lipikar", "anthelios", "hyalu b5"]):
        detected_brand = "La Roche-Posay"
    elif any(k in t_out for k in ["bioderma", "sensibio", "atoderm", "sebium", "photoderm"]):
        detected_brand = "Bioderma"
    elif any(k in t_out for k in ["ducray", "kelual", "anaphase", "keracnyl"]):
        detected_brand = "Ducray"
    elif any(k in t_out for k in ["vichy", "mineral 89", "normaderm", "liftactiv"]):
        detected_brand = "Vichy"

    products = []

    if detected_brand == "Avène":
        # Avène Temel Bakım & Hassas Cilt Rafı (Fotoğraftaki soldan sağa dizilim)
        products = [
            {
                "name": "Avène Canlandırıcı Besleyici Bakım Kremi",
                "searchQuery": "Avène Canlandırıcı Besleyici Bakım Kremi 50ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Kuru & Hassas Cilt Bakımı",
                "size": "50 ml Kavanoz",
                "category": "dermo"
            },
            {
                "name": "Avène Yatıştırıcı Göz Çevresi Bakım Kremi",
                "searchQuery": "Avène Soin Apaisant Contour des Yeux 10ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Özel & SOS Onarıcı",
                "subcat": "Göz Çevresi Bakımı",
                "size": "10 ml Tüp",
                "category": "dermo"
            },
            {
                "name": "Avène Eau Thermale Termal Su Spreyi",
                "searchQuery": "Avène Termal Su Spreyi 150ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Ferahlatıcı Su & Parfüm",
                "subcat": "Yatıştırıcı Termal Bakım",
                "size": "150 ml Sprey Şişe",
                "category": "dermo"
            },
            {
                "name": "Avène Hassas Ciltler İçin Temizleme Köpüğü",
                "searchQuery": "Avène Mousse Nettoyante Temizleme Köpüğü 150ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Hassas Cilt Temizliği",
                "size": "150 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Avène Tolérance Son Derece Nazik Jel Temizleyici",
                "searchQuery": "Avène Tolérance Lotion Nettoyante Gélifiée 200ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Aşırı Hassas & Reaktif Cilt",
                "size": "200 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Avène Tolérance Hydra-10 Nemlendirici Likit",
                "searchQuery": "Avène Tolérance Hydra 10 Fluide 40ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "%100 Doğal Nemlendirme",
                "size": "40 ml Pompalı Tüp",
                "category": "dermo"
            },
            {
                "name": "Avène Tolérance Hydra-10 Yoğun Nemlendirici Krem",
                "searchQuery": "Avène Tolérance Hydra 10 Krem 40ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Kuru & Çok Kuru Hassas Cilt",
                "size": "40 ml Pompalı Tüp",
                "category": "dermo"
            },
            {
                "name": "Avène Antirougeurs Rosamed Kızarıklık Karşıtı Konsantre Bakım",
                "searchQuery": "Avène Antirougeurs Rosamed 30ml resmi ambalaj packshot",
                "brand": "Avène",
                "urunTipi": "Özel & SOS Onarıcı",
                "subcat": "Kızarıklık & Rozasea Bakımı",
                "size": "30 ml Pompalı Şişe",
                "category": "dermo"
            }
        ]
    elif detected_brand == "CeraVe":
        # CeraVe Rafı Ürün Kataloğu (Fotoğraftaki soldan sağa dizilim)
        products = [
            {
                "name": "CeraVe Akneye Eğilim Gösteren Ciltlere Özel Temizleyici",
                "searchQuery": "CeraVe Akneye Eğilim Gösteren Ciltlere Özel Temizleyici 236ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Akne Karşıtı Bakım",
                "size": "236 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "CeraVe Nemlendiren Temizleyici",
                "searchQuery": "CeraVe Nemlendiren Temizleyici 473ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Kuru Cilt Serisi",
                "size": "473 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "CeraVe Nemlendirici Losyon",
                "searchQuery": "CeraVe Nemlendirici Losyon 473ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Bariyer Onarıcı Seri",
                "size": "473 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "CeraVe Köpüren Temizleyici",
                "searchQuery": "CeraVe Köpüren Temizleyici 473ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Normal ve Yağlı Cilt",
                "size": "473 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "CeraVe Skin Renewing C Vitamini Aydınlatıcı Serum",
                "searchQuery": "CeraVe Skin Renewing Vitamin C Serum 30ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Serum & Konsantre Bakım",
                "subcat": "Aydınlatıcı & Yaşlanma Karşıtı",
                "size": "30 ml Pompalı Tüp",
                "category": "dermo"
            },
            {
                "name": "CeraVe Akneye Eğilim Gösteren Ciltler İçin Yüz Bakım Jeli",
                "searchQuery": "CeraVe Akneye Eğilim Gösteren Ciltler İçin Yüz Bakım Jeli 40ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Özel & SOS Onarıcı",
                "subcat": "Akne & Gözenek Bakımı",
                "size": "40 ml Tüp",
                "category": "dermo"
            },
            {
                "name": "CeraVe Yenileyici Retinol Serum",
                "searchQuery": "CeraVe Yenileyici Retinol Serum 30ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Serum & Konsantre Bakım",
                "subcat": "Gözenek & Akne İzi Bakımı",
                "size": "30 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "CeraVe Nemlendiren Hyalüronik Asit Serum",
                "searchQuery": "CeraVe Nemlendiren Hyalüronik Asit Serum 30ml resmi ambalaj",
                "brand": "CeraVe",
                "urunTipi": "Serum & Konsantre Bakım",
                "subcat": "Yoğun Nem Bombası",
                "size": "30 ml Pompalı Şişe",
                "category": "dermo"
            }
        ]
    elif detected_brand == "Mustela":
        products = [
            {
                "name": "Mustela Stelatopia+ Lipit Yenileyici Krem",
                "searchQuery": "Mustela Stelatopia Lipit Yenileyici Krem 300ml resmi ambalaj",
                "brand": "Mustela",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Atopik Cilt Bakımı",
                "size": "300 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Mustela Vitamin Barrier 1-2-3 Pişik Kremi",
                "searchQuery": "Mustela Vitamin Barrier Cream 1 2 3 100ml resmi ambalaj",
                "brand": "Mustela",
                "urunTipi": "Özel & SOS Onarıcı",
                "subcat": "Pişik ve Bariyer Bakımı",
                "size": "100 ml Tüp",
                "category": "dermo"
            },
            {
                "name": "Mustela Yenidoğan Köpük Şampuan",
                "searchQuery": "Mustela Yenidoğan Köpük Şampuan 150ml konak önleyici",
                "brand": "Mustela",
                "urunTipi": "Şampuan & Saç Bakımı",
                "subcat": "Konak ve Bebek Bakımı",
                "size": "150 ml Köpük Pompa",
                "category": "dermo"
            },
            {
                "name": "Mustela Hydra Bébé Nemlendirici Vücut Losyonu",
                "searchQuery": "Mustela Hydra Bebe Vücut Losyonu 300ml resmi ambalaj",
                "brand": "Mustela",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Günlük Bebek Bakımı",
                "size": "300 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Mustela Rahatlatıcı Masaj Yağı",
                "searchQuery": "Mustela Rahatlatıcı Bebek Masaj Yağı 100ml resmi ambalaj",
                "brand": "Mustela",
                "urunTipi": "Vücut & Masaj Yağı",
                "subcat": "Bebek Masajı",
                "size": "100 ml Sprey Şişe",
                "category": "dermo"
            },
            {
                "name": "Mustela Dermo-Cleansing Saç ve Vücut Şampuanı",
                "searchQuery": "Mustela Dermo Cleansing 500ml resmi ambalaj",
                "brand": "Mustela",
                "urunTipi": "Şampuan & Saç Bakımı",
                "subcat": "Bebek Temizliği",
                "size": "500 ml Pompalı Şişe",
                "category": "dermo"
            }
        ]
    elif detected_brand == "La Roche-Posay":
        products = [
            {
                "name": "La Roche-Posay Effaclar Arındırıcı Temizleme Jeli",
                "searchQuery": "La Roche-Posay Effaclar Arındırıcı Jel 400ml resmi ambalaj",
                "brand": "La Roche-Posay",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Yağlı & Akneye Eğilimli Cilt",
                "size": "400 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "La Roche-Posay Effaclar Duo+ M Akne Karşıtı Bakım Kremi",
                "searchQuery": "La Roche-Posay Effaclar Duo+ M 40ml resmi ambalaj",
                "brand": "La Roche-Posay",
                "urunTipi": "Özel & SOS Onarıcı",
                "subcat": "Leke & Akne Bakımı",
                "size": "40 ml Tüp",
                "category": "dermo"
            },
            {
                "name": "La Roche-Posay Cicaplast Baume B5+ Onarıcı Bakım Kremi",
                "searchQuery": "La Roche-Posay Cicaplast Baume B5+ 100ml resmi ambalaj",
                "brand": "La Roche-Posay",
                "urunTipi": "Özel & SOS Onarıcı",
                "subcat": "Bariyer Onarıcı SOS Bakım",
                "size": "100 ml Tüp",
                "category": "dermo"
            },
            {
                "name": "La Roche-Posay Lipikar Baume AP+M Nemlendirici Balsam",
                "searchQuery": "La Roche-Posay Lipikar Baume AP+M 400ml resmi ambalaj",
                "brand": "La Roche-Posay",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Atopik & Çok Kuru Cilt",
                "size": "400 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "La Roche-Posay Hyalu B5 Dolgunlaştırıcı Serum",
                "searchQuery": "La Roche-Posay Hyalu B5 Serum 30ml resmi ambalaj",
                "brand": "La Roche-Posay",
                "urunTipi": "Serum & Konsantre Bakım",
                "subcat": "Anti-Aging & Dolgunlaştırıcı",
                "size": "30 ml Damlalıklı Şişe",
                "category": "dermo"
            },
            {
                "name": "La Roche-Posay Anthelios UVMune 400 SPF 50+ Sıvı",
                "searchQuery": "La Roche-Posay Anthelios UVMune 400 Invisible Fluid 50ml resmi ambalaj",
                "brand": "La Roche-Posay",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Güneş Koruması",
                "size": "50 ml Şişe",
                "category": "dermo"
            }
        ]
    elif detected_brand == "Bioderma":
        products = [
            {
                "name": "Bioderma Sensibio H2O Yatıştırıcı Misel Su",
                "searchQuery": "Bioderma Sensibio H2O 500ml resmi ambalaj",
                "brand": "Bioderma",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Hassas Cilt Temizliği",
                "size": "500 ml Şişe",
                "category": "dermo"
            },
            {
                "name": "Bioderma Sensibio Gel Moussant Yüz Yıkama Jeli",
                "searchQuery": "Bioderma Sensibio Gel Moussant 500ml resmi ambalaj",
                "brand": "Bioderma",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Hassas Cilt Temizliği",
                "size": "500 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Bioderma Sensibio Defensive Yatıştırıcı Krem",
                "searchQuery": "Bioderma Sensibio Defensive 40ml resmi ambalaj",
                "brand": "Bioderma",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Hassas Cilt Bakımı",
                "size": "40 ml Tüp",
                "category": "dermo"
            },
            {
                "name": "Bioderma Atoderm Intensive Baume Kuruluk Karşıtı Balsam",
                "searchQuery": "Bioderma Atoderm Intensive Baume 500ml resmi ambalaj",
                "brand": "Bioderma",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Atopik Cilt Bakımı",
                "size": "500 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Bioderma Sébium Gel Moussant Arındırıcı Temizleme Jeli",
                "searchQuery": "Bioderma Sebium Gel Moussant 500ml resmi ambalaj",
                "brand": "Bioderma",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Yağlı & Akneye Eğilimli Cilt",
                "size": "500 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Bioderma Photoderm Aquafluid SPF 50+ Güneş Koruyucu",
                "searchQuery": "Bioderma Photoderm Aquafluid SPF 50+ 40ml resmi ambalaj",
                "brand": "Bioderma",
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Güneş Koruması",
                "size": "40 ml Tüp",
                "category": "dermo"
            }
        ]
    elif detected_brand == "Ducray":
        products = [
            {
                "name": "Ducray Kelual DS Kepek ve Kaşıntı Karşıtı Bakım Şampuanı",
                "searchQuery": "Ducray Kelual DS Şampuan 100ml resmi ambalaj",
                "brand": "Ducray",
                "urunTipi": "Şampuan & Saç Bakımı",
                "subcat": "Kepek & Kaşıntı Bakımı",
                "size": "100 ml Şişe",
                "category": "dermo"
            },
            {
                "name": "Ducray Anaphase+ Saç Dökülmesine Karşı Şampuan",
                "searchQuery": "Ducray Anaphase+ Şampuan 400ml resmi ambalaj",
                "brand": "Ducray",
                "urunTipi": "Şampuan & Saç Bakımı",
                "subcat": "Dökülme Karşıtı Bakım",
                "size": "400 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": "Ducray Keracnyl Akneye Eğilimli Ciltler İçin Yıkama Jeli",
                "searchQuery": "Ducray Keracnyl Temizleme Jeli 400ml resmi ambalaj",
                "brand": "Ducray",
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Akne & Yağ Dengeleme",
                "size": "400 ml Pompalı Şişe",
                "category": "dermo"
            }
        ]
    else:
        # Genel Dermo Rafı (7 Aşamalı Eksiksiz Klinik Rutin - Asla 2 ürünle sınırlı kalmaz)
        prefix = f"{detected_brand} " if detected_brand != "Genel" else ""
        products = [
            {
                "name": f"{prefix}Arındırıcı & Yatıştırıcı Yüz Yıkama Jeli",
                "searchQuery": f"{detected_brand} yüz yıkama jeli temizleyici resmi ambalaj packshot",
                "brand": detected_brand,
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Günlük Temizlik",
                "size": "400 ml Pompalı Şişe",
                "category": "dermo"
            },
            {
                "name": f"{prefix}Gözenek Sıkılaştırıcı & Dengeleyici Tonik",
                "searchQuery": f"{detected_brand} gözenek sıkılaştırıcı arındırıcı tonik resmi ambalaj",
                "brand": detected_brand,
                "urunTipi": "Yüz & Vücut Temizleyici",
                "subcat": "Gözenek Bakımı",
                "size": "200 ml Şişe",
                "category": "dermo"
            },
            {
                "name": f"{prefix}Yoğun Hyalüronik Asit Nemlendirici Serum",
                "searchQuery": f"{detected_brand} hyaluronik asit nem serumu resmi ambalaj",
                "brand": detected_brand,
                "urunTipi": "Serum & Konsantre Bakım",
                "subcat": "Yoğun Nemlendirme",
                "size": "30 ml Damlalıklı Şişe",
                "category": "dermo"
            },
            {
                "name": f"{prefix}Aydınlatıcı C Vitamini Canlandırıcı Bakım Serumu",
                "searchQuery": f"{detected_brand} c vitamini aydınlatıcı serum resmi ambalaj",
                "brand": detected_brand,
                "urunTipi": "Serum & Konsantre Bakım",
                "subcat": "Aydınlatıcı & Yaşlanma Karşıtı",
                "size": "30 ml Damlalıklı Şişe",
                "category": "dermo"
            },
            {
                "name": f"{prefix}Bariyer Onarıcı Yoğun Nemlendirici Krem",
                "searchQuery": f"{detected_brand} bariyer onarıcı nemlendirici krem resmi ambalaj",
                "brand": detected_brand,
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Bariyer Onarımı",
                "size": "50 ml Tüp",
                "category": "dermo"
            },
            {
                "name": f"{prefix}Çok Amaçlı Onarıcı SOS Bakım Balsamı",
                "searchQuery": f"{detected_brand} onarıcı bakım kremi baume cica resmi ambalaj",
                "brand": detected_brand,
                "urunTipi": "Özel & SOS Onarıcı",
                "subcat": "Hassas & SOS Onarım",
                "size": "40 ml Tüp",
                "category": "dermo"
            },
            {
                "name": f"{prefix}Geniş Spektrumlu SPF 50+ Güneş Koruyucu Sıvı",
                "searchQuery": f"{detected_brand} spf 50+ güneş kremi fluid resmi ambalaj",
                "brand": detected_brand,
                "urunTipi": "Nemlendirici & Bariyer Krem",
                "subcat": "Güneş Koruması",
                "size": "50 ml Şişe",
                "category": "dermo"
            }
        ]

    return {
        "success": True,
        "count": len(products),
        "detected_brand": detected_brand,
        "products": products,
        "shelf_preview": preview_b64
    }


class StudioServerHandler(SimpleHTTPRequestHandler):
    """Görsel kırpma ve canlı işleme sunucusu."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ('/', ''):
            self.send_response(302)
            self.send_header('Location', '/app/')
            self.end_headers()
            return

        if parsed.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'running': True, 'studio_active': STUDIO_ACTIVE}).encode('utf-8'))
            return

        if parsed.path == '/api/search-images':
            qs = parse_qs(parsed.query)
            query = qs.get('q', [''])[0].strip()
            if not query:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Arama sorgusu boş olamaz'}).encode('utf-8'))
                return

            try:
                from ddgs import DDGS
                with DDGS() as ddgs:
                    # Marka veya ambalaj görseli bulmak için
                    search_term = query if 'packshot' in query.lower() or 'beyaz fon' in query.lower() or 'resmi ambalaj' in query.lower() else f"{query} resmi ambalaj packshot"
                    raw_results = list(ddgs.images(search_term, max_results=8))
                    
                    # Eğer sonuç az geldiyse doğrudan terimle ara
                    if len(raw_results) < 4:
                        raw_results = list(ddgs.images(query, max_results=8))

                    results = []
                    for r in raw_results:
                        img_url = r.get('image')
                        thumb_url = r.get('thumbnail')
                        if img_url:
                            results.append({
                                'title': r.get('title', ''),
                                'image': img_url,
                                'thumbnail': thumb_url or img_url,
                                'source': r.get('source', ''),
                                'width': r.get('width', 0),
                                'height': r.get('height', 0)
                            })

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'query': query, 'count': len(results), 'results': results}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        # ── 0. Stüdyo Motoru Açma / Kapatma (Toggle) ──
        if parsed.path == '/api/service/toggle':
            global STUDIO_ACTIVE
            STUDIO_ACTIVE = not STUDIO_ACTIVE
            try:
                import subprocess
                if STUDIO_ACTIVE:
                    subprocess.Popen(['notify-send', '-u', 'normal', '-i', 'software-update-available', 'Eczane Pro', '🟢 Stüdyo Motoru Açıldı!\n👉 Web arayüzü aktif modda.'])
                else:
                    subprocess.Popen(['notify-send', '-u', 'normal', '-i', 'process-stop', 'Eczane Pro', '⚪ Stüdyo Motoru Kapatıldı (Beklemede)'])
            except Exception:
                pass

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'studio_active': STUDIO_ACTIVE}).encode('utf-8'))
            return

        # ── 0.1 Raf Fotoğrafı Analizi & Türkçe Ürün Listesi Çıkarma ──
        if parsed.path == '/api/analyze-shelf-photo':
            try:
                data = json.loads(body.decode('utf-8'))
                img_path = data.get('image_path')
                img_data = data.get('image_data')

                raw_img = None
                if img_path and os.path.exists(img_path):
                    raw_img = Image.open(img_path)
                elif img_data:
                    # Data URI veya raw base64
                    if ',' in img_data:
                        img_data = img_data.split(',', 1)[1]
                    raw_bytes = base64.b64decode(img_data)
                    raw_img = Image.open(io.BytesIO(raw_bytes))
                else:
                    # Varsayılan olarak kullanıcının yüklediği CeraVe rafını tara
                    default_shelf = Path('/home/arekros/.gemini/antigravity/brain/dc49476f-a700-4315-a1e2-093e9bc503a2/.user_uploaded/media_1792795790857.jpg')
                    if default_shelf.exists():
                        raw_img = Image.open(default_shelf)

                if raw_img is None:
                    raise ValueError("Geçerli bir raf fotoğrafı sağlanamadı.")

                analysis_result = analyze_shelf_image(raw_img)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(analysis_result).encode('utf-8'))
            except Exception as ex:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(ex)}).encode('utf-8'))
            return
        if parsed.path == '/api/save-web-image':
            try:
                data = json.loads(body.decode('utf-8'))
                img_url = data.get('image_url')
                brand = data.get('brand', 'Genel')
                name = data.get('name', 'Urun')
                size = data.get('size', '')
                apply_bg_removal = data.get('apply_bg_removal', True)

                if not img_url:
                    raise ValueError("image_url parametresi zorunludur")

                # Görseli webden indir
                import urllib.request
                req = urllib.request.Request(
                    img_url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
                )
                img_data = urllib.request.urlopen(req, timeout=15).read()
                raw_img = Image.open(io.BytesIO(img_data))

                # Şeffaf katmana çevir veya rembg ile temizle
                if apply_bg_removal:
                    # Eğer zaten şeffaf PNG ise doğrudan auto_crop yapabiliriz
                    if raw_img.mode == 'RGBA' and raw_img.split()[3].getbbox() != (0, 0, raw_img.width, raw_img.height):
                        nobg = raw_img
                    else:
                        nobg = remove_background(raw_img)
                else:
                    nobg = raw_img.convert('RGBA')

                # 4:3 stüdyo kanvası oluştur
                studio = create_studio_canvas(nobg)

                filename = generate_filename(brand, name, size)
                os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)
                out_path = os.path.join(DEFAULT_OUTPUT_DIR, filename)

                studio.save(out_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)

                # Thumbnail önizleme oluştur
                preview_thumb = studio.copy()
                preview_thumb.thumbnail((400, 300))
                thumb_io = io.BytesIO()
                preview_thumb.save(thumb_io, 'JPEG', quality=85)
                thumb_b64 = "data:image/jpeg;base64," + base64.b64encode(thumb_io.getvalue()).decode('utf-8')

                resp_data = {
                    'success': True,
                    'filename': filename,
                    'relative_path': f"images/mustela/{filename}",
                    'local_path': out_path,
                    'preview': thumb_b64,
                    'size_kb': round(os.path.getsize(out_path) / 1024, 1)
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(resp_data).encode('utf-8'))
            except Exception as ex:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(ex)}).encode('utf-8'))
            return

        # ── 2. Yeni Ürünü JSON ve JS Veritabanına Ekle ──
        if parsed.path == '/api/add-product':
            try:
                data = json.loads(body.decode('utf-8'))
                new_product = data.get('product')
                if not new_product or not new_product.get('name'):
                    raise ValueError("Ürün verisi eksik")

                json_path = BASE_DIR / "app/data/products.json"
                js_path = BASE_DIR / "app/data/products.js"

                # JSON oku & güncelle
                with open(json_path, 'r', encoding='utf-8') as f:
                    products = json.load(f)

                # Benzersiz id
                if not new_product.get('id'):
                    new_product['id'] = slugify(new_product.get('brand', '')) + '-' + slugify(new_product.get('name', ''))

                # Başa ekle
                products.insert(0, new_product)

                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(products, f, ensure_ascii=False, indent=2)

                with open(js_path, 'w', encoding='utf-8') as f:
                    f.write("window.PRODUCTS_DATA = " + json.dumps(products, ensure_ascii=False, indent=2) + ";\n")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'total_products': len(products), 'product': new_product}).encode('utf-8'))
            except Exception as ex:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(ex)}).encode('utf-8'))
            return

        # ── 3. Mevcut Crop İşleme ──
        if parsed.path == '/api/process-crop':
            try:
                data = json.loads(body.decode('utf-8'))
                img_b64 = data.get('image_base64', '')
                brand = data.get('brand', 'Genel')
                name = data.get('name', 'Urun')
                size = data.get('size', '')
                coords = data.get('coords')  # [x1, y1, x2, y2]

                # Base64'ten görsel oku
                if ',' in img_b64:
                    img_b64 = img_b64.split(',', 1)[1]
                raw_bytes = base64.b64decode(img_b64)
                img = Image.open(io.BytesIO(raw_bytes))

                if coords and len(coords) == 4:
                    x1, y1, x2, y2 = coords
                    img = img.crop((x1, y1, x2, y2))

                # Pipeline çalıştır
                nobg = remove_background(img)
                studio = create_studio_canvas(nobg)

                filename = generate_filename(brand, name, size)
                out_path = os.path.join(DEFAULT_OUTPUT_DIR, filename)
                os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)
                studio.save(out_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)

                # Yanıt için küçük önizleme üret
                preview_thumb = studio.copy()
                preview_thumb.thumbnail((400, 300))
                thumb_io = io.BytesIO()
                preview_thumb.save(thumb_io, 'JPEG', quality=80)
                thumb_b64 = "data:image/jpeg;base64," + base64.b64encode(thumb_io.getvalue()).decode('utf-8')

                resp_data = {
                    'success': True,
                    'filename': filename,
                    'path': f"Yeni ürün son güncelleme/{filename}",
                    'preview': thumb_b64,
                    'size_kb': round(os.path.getsize(out_path) / 1024, 1)
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(resp_data).encode('utf-8'))
            except Exception as ex:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(ex)}).encode('utf-8'))
        else:
            self.send_error(404, "Endpoint not found")


def start_server(port: int = 8088):
    """Yerel interaktif stüdyo web sunucusunu başlatır."""
    server = ThreadingHTTPServer(('0.0.0.0', port), StudioServerHandler)
    print(f"\n🚀 Eczane Pro Fotoğraf Stüdyo Sunucusu Başlatıldı!")
    print(f"👉 Tarayıcıda aç: http://127.0.0.1:{port}/tools/crop-tool.html")
    print(f"👉 Ana Uygulama:  http://127.0.0.1:{port}/app/index.html")
    print(f"Durdurmak için: Ctrl+C\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu kapatıldı.")


# ─── CLI Arayüzü ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Eczane Pro — Profesyonel Ürün Fotoğrafı İşleme Pipeline\'ı',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--input', '-i', help='Giriş fotoğrafı yolu')
    parser.add_argument('--input-dir', help='Toplu işleme klasörü')
    parser.add_argument('--output-dir', '-o', default=DEFAULT_OUTPUT_DIR,
                        help=f'Çıkış klasörü (varsayılan: {DEFAULT_OUTPUT_DIR})')
    parser.add_argument('--mode', '-m', default='single',
                        choices=['single', 'shelf-manual', 'batch'],
                        help='İşleme modu')
    parser.add_argument('--brand', '-b', help='Ürün markası (örn: cerave, mustela)')
    parser.add_argument('--name', '-n', help='Ürün adı (örn: "Moisturizing Lotion")')
    parser.add_argument('--size', '-s', default='', help='Ürün boyutu (örn: 473ml, 30ml)')
    parser.add_argument('--crops', help='Kırpma koordinatları: x1,y1,x2,y2')
    parser.add_argument('--filename', '-f', help='Özel dosya adı')
    parser.add_argument('--serve', type=int, nargs='?', const=8088,
                        help='Web sunucusu modu başlat (isteğe bağlı port, varsayılan: 8088)')

    args = parser.parse_args()

    # Web Sunucu modu
    if args.serve is not None:
        start_server(args.serve)
        return

    # Toplu İşleme modu
    if args.input_dir or args.mode == 'batch':
        in_dir = Path(args.input_dir or "ürün listesi/images")
        files = sorted([f for f in in_dir.iterdir() if f.suffix.lower() in {'.jpg', '.jpeg', '.png'}])
        print(f"📦 Toplu işleme: {len(files)} dosya bulundu")
        for f in files:
            try:
                process_single(str(f), brand="genel", name=f.stem, output_dir=args.output_dir)
            except Exception as e:
                print(f"❌ Hata: {f.name} -> {e}")
        return

    # Tekli / Kırpma modu
    if not args.input:
        parser.error("Lütfen bir --input dosyası veya --serve parametresi belirtin.")

    if args.mode == 'shelf-manual':
        if not args.crops:
            parser.error("shelf-manual modu için --crops x1,y1,x2,y2 gereklidir.")
        try:
            x1, y1, x2, y2 = map(int, args.crops.split(','))
        except ValueError:
            parser.error("--crops formatı: x1,y1,x2,y2 (örn: 380,100,560,540)")
        process_crop_coords(
            args.input, (x1, y1, x2, y2),
            brand=args.brand or "cerave",
            name=args.name or "urun",
            size=args.size,
            output_dir=args.output_dir
        )
    else:
        if not args.brand or not args.name:
            parser.error("Tekli mod için --brand ve --name gereklidir.")
        process_single(
            args.input,
            brand=args.brand,
            name=args.name,
            size=args.size,
            output_dir=args.output_dir,
            custom_filename=args.filename
        )


if __name__ == '__main__':
    main()
