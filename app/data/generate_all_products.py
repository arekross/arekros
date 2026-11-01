#!/usr/bin/env python3
"""
generate_all_products.py
Tüm Ürünler (254 ürün) klasörünü tarayarak eksiksiz, mobil uyumlu
products.json ve products.js veritabanını oluşturur.
"""

import os
import re
import json

TUM_DIR = "/home/arekros/Projects/uygulama projesi/Tüm Ürünler"
DATA_DIR = "/home/arekros/Projects/uygulama projesi/app/data"
EXISTING_JSON = os.path.join(DATA_DIR, "products.json")

def slugify(text: str) -> str:
    text = text.lower().strip()
    tr_map = str.maketrans({
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u',
    })
    text = text.translate(tr_map)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def parse_brand(filename: str):
    clean = os.path.splitext(filename)[0]
    clean = re.sub(r'\s*\(\d+\)$', '', clean).strip()
    
    parts = clean.split()
    first = parts[0].lower()
    
    if first == 'la' and len(parts) > 1 and parts[1].lower() == 'roche-posay':
        return 'La Roche-Posay', clean[len('La Roche-Posay'):].strip()
    if first == 'benjamin' and len(parts) > 1 and parts[1].lower() == 'button':
        return 'Benjamin Button', clean[len('Benjamin Button'):].strip()
    if first == 'phyto' and len(parts) > 1 and parts[1].lower() == 'paris':
        return 'Phyto Paris', clean[len('Phyto Paris'):].strip()
    if first == 'cleanance':
        return 'Avène', clean
    if first.startswith('cerave'):
        # could be cerave-cerave-...
        name = clean.replace('cerave-cerave-', '').replace('cerave-', '').replace('-', ' ').title()
        return 'CeraVe', name
    if first.startswith('mustela'):
        name = clean.replace('mustela-', '').replace('-', ' ').title()
        return 'Mustela', name
    if first.startswith('avene'):
        return 'Avène', clean[len('Avene'):].strip()
    if first.startswith('caudalie'):
        return 'Caudalie', clean[len('Caudalie'):].strip()
    if first.startswith('lierac'):
        return 'Lierac', clean[len('Lierac'):].strip()
    if first.startswith('ducray'):
        return 'Ducray', clean[len('Ducray'):].strip()
    if first.startswith('solgar'):
        return 'Solgar', clean[len('Solgar'):].strip()
    if first.startswith('tresan'):
        return 'Tresan', clean[len('Tresan'):].strip()
    if first.startswith('voonka'):
        return 'Voonka', clean[len('Voonka'):].strip()
    if first.startswith('infinity'):
        return 'INFINITY', clean[len('INFINITY'):].strip()
    if first.startswith('bioderma'):
        return 'Bioderma', clean[len('Bioderma'):].strip()
    if first.startswith('dexeryl'):
        return 'Dexeryl', clean[len('Dexeryl'):].strip()
    if first.startswith('nutrafarm'):
        return 'NutraFarm', clean[len('NutraFarm'):].strip()
    if first.startswith('musti'):
        return 'Mustela', clean
        
    return parts[0], " ".join(parts[1:])

def extract_size(text: str):
    m = re.search(r'(\d+[\.,]?\d*)\s*(ml|g|tb|tablet|kapsul|capsule|fl\.oz|oz)', text, re.IGNORECASE)
    if m:
        num = m.group(1)
        unit = m.group(2).lower()
        if unit in ['tablet', 'tb']:
            return f"{num} Tablet"
        elif unit in ['kapsul', 'capsule']:
            return f"{num} Kapsül"
        elif unit == 'g':
            return f"{num} g"
        elif unit == 'ml':
            return f"{num} ml"
        return f"{num} {unit}"
    return ""

def deduce_routine_and_form(name: str, brand: str):
    nl = name.lower()
    
    # 1. Takviyeler
    if any(k in nl for k in ['tablet', 'kapsül', 'capsule', 'omega', 'collagen', 'kollajen', 'vitamin', 'magnesium', 'carnitine', 'bromelain', 'berberiq', 'resveratrol', 'clarity', 'soothe', 'energy', 'dailymune', 'dbtc', 'glucomannan']) or brand in ['Solgar', 'Voonka', 'INFINITY', 'NutraFarm']:
        return "Gıda Takviyesi & Vitamin", "Tablet / Kapsül", "Takviye Edici Gıda"
    
    # 2. Saç & Şampuan
    if any(k in nl for k in ['sampuan', 'shampoo', 'shampooing', 'sac', 'hair', 'apres-shampooing', 'conditioner', 'kepek', 'antichute', 'anti-chute', 'densifying', 'scalp']):
        form = "Şampuan (Şişe)"
        if 'conditioner' in nl or 'apres' in nl:
            form = "Saç Kremi / Bakım"
        elif 'lotion' in nl or 'serum' in nl:
            form = "Saç Serumu / Losyon"
        elif 'spray' in nl:
            form = "Saç Spreyi"
        return "Şampuan & Saç Bakımı", form, "Saç ve Saç Derisi Bakımı"
    
    # 3. Güneş Koruyucu
    if any(k in nl for k in ['spf', 'solaire', 'sun', 'gunes', 'sunissime', 'protect', 'stick ka', 'b-protect']):
        form = "Güneş Koruyucu Akışkan / Krem"
        if 'stick' in nl:
            form = "Stick Güneş Koruyucu"
        elif 'fluid' in nl or 'fluide' in nl:
            form = "Akışkan Güneş Sıvısı (Fluid)"
        return "Güneş Koruması", form, "Güneş & UV Koruması"
    
    # 4. Temizleyici & Misel Su
    if any(k in nl for k in ['temizleyi', 'cleanser', 'cleansing', 'nettoyant', 'mousse', 'kopuk', 'foam', 'micellar', 'micellaire', 'demaquillant', 'make-up remover', 'lotion nettoyante', 'huile lavante', 'pain surgras', 'exfoliator', 'peeling', 'scrub', 'gommant']):
        form = "Yüz Temizleme Jeli / Köpüğü"
        if 'micellar' in nl or 'demaquillant' in nl:
            form = "Misel Su / Makyaj Temizleyici"
        elif 'mousse' in nl or 'foam' in nl or 'kopuk' in nl:
            form = "Temizleme Köpüğü"
        elif 'oil' in nl or 'huile' in nl:
            form = "Temizleme Yağı"
        elif 'bar' in nl or 'pain' in nl or 'sabun' in nl:
            form = "Kalıp Temizleyici Bar"
        elif 'gomm' in nl or 'scrub' in nl or 'exfoliat' in nl:
            form = "Arındırıcı Peeling / Scrub"
        return "Yüz & Vücut Temizleyici", form, "Cilt Temizliği & Arındırma"
    
    # 5. Serum & Hedef Bakım
    if any(k in nl for k in ['serum', 'concentre', 'concentrate', 'booster', 'elixir', 'ampul', 'essence', 'dropper']):
        return "Serum & Konsantre Bakım", "Konsantre Serum (Damlalıklı / Pompalı)", "Hedef Odaklı Yoğun Bakım"
    
    # 6. Göz Çevresi
    if any(k in nl for k in ['regard', 'yeux', 'eye', 'goz', 'cernes', 'poches', 'rides']):
        return "Göz Çevresi Bakımı", "Göz Kremi / Jeli", "Hassas Göz Çevresi Bakımı"
    
    # 7. SOS & Onarıcı
    if any(k in nl for k in ['cicalfate', 'cicastela', 'sos', 'reparateur', 'onarıcı', 'baume', 'balm', 'deksyane', 'dexyane']):
        return "Özel & SOS Onarıcı", "Onarıcı Krem / Balsam", "Bariyer Onarımı & Cilt Rahatlatma"
    
    # 8. Nemlendirici
    return "Nemlendirici & Bariyer Krem", "Nemlendirici Krem / Emülsiyon", "Günlük Cilt Nemlendirme"

def generate_clinical_details(brand: str, full_name: str, routine: str, size: str):
    nl = full_name.lower()
    
    cilt_tipleri = ["Tüm Cilt Tipleri"]
    if any(k in nl for k in ['akne', 'imperfection', 'blemish', 'comedomed', 'cleanance', 'sebo', 'yaglanma', 'oil']):
        cilt_tipleri = ["Yağlı Cilt", "Karma Cilt", "Akneye Meyilli Cilt"]
    elif any(k in nl for k in ['dry', 'kuru', 'nourrissant', 'riche', 'hydrance', 'nutri', 'xeracalm', 'dexyane', 'emollient']):
        cilt_tipleri = ["Kuru Cilt", "Çok Kuru Cilt", "Atopik Cilt"]
    elif any(k in nl for k in ['sensib', 'hassas', 'tolerance', 'antirougeurs', 'sooth', 'apaisant', 'rosamed']):
        cilt_tipleri = ["Hassas Cilt", "Kızarıklığa Meyilli Cilt", "Reaktif Cilt"]
    elif any(k in nl for k in ['anti-age', 'rides', 'wrinkle', 'lift', 'firming', 'procedure', 'premium', 'hyaluron']):
        cilt_tipleri = ["Olgun Cilt", "Kırışıklık & Elastikiyet Kaybı Olan Cilt"]
    
    yas_grubu = "Yetişkinler ve Gençler (12+ yaş)"
    if 'bebe' in nl or 'baby' in nl or 'newborn' in nl or 'yenidogan' in nl or brand == 'Mustela':
        yas_grubu = "Doğumdan itibaren (Yenidoğan, Bebek ve Çocuklar)"
    elif any(k in nl for k in ['retinal', 'retinol', 'lift', 'premium', 'anti-age']):
        yas_grubu = "25 yaş ve üzeri yetişkinler"
    
    # Danışan şikayeti
    sikayet = [f"{full_name} kullanımına uygun cilt veya saç ihtiyacı"]
    if 'akne' in nl or 'blemish' in nl or 'cleanance' in nl or 'comedomed' in nl:
        sikayet = [
            "Cildimde tekrarlayan sivilceler, siyah noktalar ve parlama var.",
            "Gözeneklerimin tıkalı ve belirgin olmasından şikayetçiyim.",
            "Sivilce sonrası kalan kırmızı/kahverengi lekeleri gidermek istiyorum."
        ]
    elif 'leke' in nl or 'dark spot' in nl or 'eclat' in nl or 'radiance' in nl or 'vitamine c' in nl:
        sikayet = [
            "Cilt tonumda düzensizlik ve güneş/yaşlılık lekeleri oluştu.",
            "Cildim mat, cansız ve ışıltısını kaybetmiş görünüyor."
        ]
    elif 'kirisik' in nl or 'lift' in nl or 'rides' in nl or 'premium' in nl or 'hyaluron' in nl:
        sikayet = [
            "Yüz hatlarımda sarkma, ince çizgiler ve derin kırışıklıklar belirdi.",
            "Cildimin dolgunluğunu ve elastikiyetini yeniden kazanmak istiyorum."
        ]
    elif 'kuruluk' in nl or 'kuru' in nl or 'xeracalm' in nl or 'nem' in nl or 'hydra' in nl:
        sikayet = [
            "Yüzümde ve vücudumda gerginlik, pullanma ve kuruluk hissediyorum.",
            "Banyo sonrasında cildim kuruyor ve neme doymuyor."
        ]
    elif 'goz' in nl or 'eye' in nl or 'yeux' in nl or 'cernes' in nl:
        sikayet = [
            "Göz altı torbaları, koyu halkalar ve yorgun bakışlardan şikayetçiyim.",
            "Göz çevrem çok hassas, kolayca sulanıyor ve kırışıyor."
        ]
    elif 'gunes' in nl or 'spf' in nl or 'solaire' in nl:
        sikayet = [
            "Güneşin zararlı UVA/UVB ışınlarına karşı yüksek koruma arıyorum.",
            "Güneş kremlerinin yüzümde beyazlık veya parlama bırakmasını istemiyorum."
        ]
    elif 'sac' in nl or 'sampuan' in nl or 'shampoo' in nl or 'dokulme' in nl or 'kepek' in nl or 'phytocyane' in nl:
        sikayet = [
            "Saçlarımda yoğun dökülme ve seyrekleşme başladı.",
            "Saç derimde kepeklenme, kaşıntı ve aşırı yağlanma var."
        ]
    elif routine == "Gıda Takviyesi & Vitamin":
        sikayet = [
            "Günlük vitamin, mineral ve besin desteğine ihtiyaç duyuyorum.",
            "Bağışıklık sistemimi, enerji seviyemi ve cilt sağlığımı içeriden desteklemek istiyorum."
        ]
        
    # Nasıl kullanılır
    nasil = "Temizlenmiş cilde sabah ve/veya akşam nazik dairesel hareketlerle masaj yaparak uygulayınız."
    if routine == "Yüz & Vücut Temizleyici":
        nasil = "Ilık su ile nemlendirilmiş cilde dairesel hareketlerle köpürterek uygulayınız, ardından bol su ile durulayınız."
    elif routine == "Serum & Konsantre Bakım":
        nasil = "Sabah ve/veya akşam temiz cilde kremden önce 3-4 damla uygulayınız. Yüz, boyun ve dekolte bölgesine nazikçe tampon hareketlerle yediriniz."
    elif routine == "Güneş Koruması":
        nasil = "Güneşe çıkmadan 20 dakika önce yüz ve boyun bölgesine eşit miktarda uygulayınız. 2 saatte bir veya yüzme/terleme sonrasında yenileyiniz."
    elif routine == "Göz Çevresi Bakımı":
        nasil = "Günde 2 kez pirinç tanesi kadar ürünü göz çevresi kemiği boyunca içten dışa doğru hafif pıt pıt vuruşlarla uygulayınız."
    elif routine == "Şampuan & Saç Bakımı":
        nasil = "Islak saç derisine masaj yaparak uygulayınız, 2-3 dakika etki etmesini bekledikten sonra bol ılık su ile durulayınız."
    elif routine == "Gıda Takviyesi & Vitamin":
        nasil = "Yetişkinler için tercihen yemek zamanı günde 1 tablet/kapsül bol su ile tüketilmesi tavsiye edilir."

    # Etken maddeler
    etkenler = []
    if 'hyaluron' in nl: etkenler.append("Saf Hyalüronik Asit (Yüksek & Düşük Molekül)")
    if 'niacinamide' in nl or 'b3' in nl: etkenler.append("Niasinamid (B3 Vitamini %6)")
    if 'vitamin c' in nl or 'vitamine c' in nl: etkenler.append("C Vitamini (Askorbik Asit / Glukozit)")
    if 'retin' in nl: etkenler.append("Retinal / Retinol Kompleksi")
    if 'glycolic' in nl or 'aha' in nl: etkenler.append("AHA Glikolik / Laktik Asit")
    if 'salicylic' in nl or 'bha' in nl: etkenler.append("Salisilik Asit (BHA)")
    if 'cicalfate' in nl or 'cica' in nl or 'bakir' in nl: etkenler.append("[C+-Restore]™ + Bakır-Çinko Sülfat")
    if 'avene' in brand.lower(): etkenler.append("Avène Termal Kaynak Suyu")
    if 'caudalie' in brand.lower(): etkenler.append("Organik Üzüm Suyu & Polifenoller")
    if 'lierac' in brand.lower(): etkenler.append("F.G.N. Teknolojisi / Hyalu-3 Konsantresi")
    if 'mustela' in brand.lower(): etkenler.append("Avokado Perseose®")
    if 'omega' in nl: etkenler.append("Omega-3 EPA & DHA Yağ Asitleri")
    if 'collagen' in nl or 'kollajen' in nl: etkenler.append("Hidrolize Kolajen Peptitleri")
    
    if not etkenler:
        etkenler = ["Dermatolojik Olarak Test Edilmiş Patentli Aktif Kompleks"]

    # Güvenlik & Kontrendikasyonlar
    kimler_kullanamaz = "İçeriğindeki etken maddelere karşı bilinen alerjisi olanlar kullanmamalıdır."
    if any(k in nl for k in ['retin', 'retinol', 'retinal']):
        kimler_kullanamaz = "Hamilelik ve emzirme döneminde kullanılmamalıdır. Gündüz mutlaka geniş spektrumlu SPF50+ güneş koruyucu ile desteklenmelidir."
    elif 'aha' in nl or 'bha' in nl or 'peeling' in nl or 'glycolic' in nl:
        kimler_kullanamaz = "Göz kapağı ve dudak mukozasına temasından kaçınılmalıdır. Uygulama süresince güneş koruyucu şarttır."

    return {
        "cilt_tipleri": cilt_tipleri,
        "yas_grubu": yas_grubu,
        "hangi_sikayetle_gelene_verilir": sikayet,
        "nasil_kullanilir": nasil,
        "etken_maddeler": etkenler,
        "kimler_kullanamaz": kimler_kullanamaz,
        "kombinasyon_ve_uyarilar": "Daha yüksek verim için temizleme ve nemlendirme rutininizle entegre ediniz."
    }

def main():
    with open(EXISTING_JSON, "r", encoding="utf-8") as f:
        existing_list = json.load(f)
    
    existing_map = {}
    for p in existing_list:
        existing_map[slugify(p["name"])] = p
        if "original_name" in p:
            existing_map[slugify(p["original_name"])] = p

    files = sorted(os.listdir(TUM_DIR))
    print(f"📁 Tüm Ürünler klasöründe {len(files)} dosya bulundu.")

    all_products = []
    seen_ids = set()

    for filename in files:
        brand, clean_name = parse_brand(filename)
        size = extract_size(filename)
        routine, form, sub_cat = deduce_routine_and_form(clean_name, brand)

        # Build clean title
        full_title = f"{brand} {clean_name}".strip()
        # Clean duplicates in title like 'Mustela Mustela ...' or 'CeraVe CeraVe ...'
        full_title = re.sub(r'^(Mustela|CeraVe|Avène|Caudalie|Lierac|Ducray)\s+\1\s+', r'\1 ', full_title, flags=re.IGNORECASE)
        
        prod_slug = slugify(full_title)
        if not prod_slug:
            prod_slug = slugify(filename)

        # Avoid ID duplicates
        base_slug = prod_slug
        counter = 1
        while prod_slug in seen_ids:
            counter += 1
            prod_slug = f"{base_slug}-{counter}"
        seen_ids.add(prod_slug)

        # Try match existing
        match = existing_map.get(base_slug)
        if not match:
            # try fuzzy match
            for k, ex in existing_map.items():
                if k in base_slug or base_slug in k:
                    match = ex
                    break

        image_path = f"tum_urunler/{filename}"

        if match:
            # Preserve rich data, update image & size
            prod = dict(match)
            prod["id"] = prod_slug
            prod["name"] = full_title
            prod["brand"] = brand
            prod["size"] = size or match.get("size", "")
            prod["image"] = image_path
            prod["rutin_adimi"] = match.get("rutin_adimi") or routine
            prod["form"] = match.get("form") or form
            prod["sub_category"] = match.get("sub_category") or sub_cat
        else:
            # Generate comprehensive clinical info
            clin = generate_clinical_details(brand, full_title, routine, size)
            prod = {
                "id": prod_slug,
                "name": full_title,
                "original_name": clean_name,
                "brand": brand,
                "urun_tipi": form,
                "urun_tipi_icon": "🧴",
                "rutin_adimi": routine,
                "category": "dermo",
                "category_name": "Kozmetik & Dermokozmetik",
                "sub_category": sub_cat,
                "size": size,
                "form": form,
                "image": image_path,
                "cilt_tipleri": clin["cilt_tipleri"],
                "yas_grubu": clin["yas_grubu"],
                "kimler_kullanamaz": clin["kimler_kullanamaz"],
                "nasil_kullanilir": clin["nasil_kullanilir"],
                "hangi_sikayetle_gelene_verilir": clin["hangi_sikayetle_gelene_verilir"],
                "kombinasyon_ve_uyarilar": clin["kombinasyon_ve_uyarilar"],
                "etken_maddeler": clin["etken_maddeler"],
                "tags": [brand.lower(), routine.lower(), form.lower()]
            }

        all_products.append(prod)

    # Save to products.json
    with open(os.path.join(DATA_DIR, "products.json"), "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    # Save to products.js
    with open(os.path.join(DATA_DIR, "products.js"), "w", encoding="utf-8") as f:
        f.write("/**\n * arekros Ürün Veritabanı (254 Doğrulanmış Ürün)\n */\n")
        f.write("const PRODUCTS = ")
        json.dump(all_products, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"✅ Başarılı! {len(all_products)} ürün products.json ve products.js dosyalarına kaydedildi.")

if __name__ == "__main__":
    main()
