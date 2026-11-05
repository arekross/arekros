#!/usr/bin/env python3
"""
Dermokozmetik ve Takviye — Otomatik Stüdyo Fotoğraf Pipeline'ı
=============================================================
1. Telefonla çekilen veya ham ürün fotoğraflarını alır.
2. Ürünün gerçek görünümünü, ambalajını ve etiketini %100 korur.
3. Arka plandaki raf, eczane masası, el ve gölgeleri yapay zeka (rembg) ile siler.
4. Ürünü 800x800 piksel kare (1:1) stüdyo tuvalinin ortasına %12 nefes alma payıyla yerleştirir.
5. Altına doğal, yumuşak bir stüdyo temas gölgesi ekler.
6. Kaliteli ve optimize JPEG formatında kaydeder.
7. İleride 3 gün sonra yeni ürün eklendiğinde de tek komutla aynı stüdyo formatını uygular.
"""

import sys
import os
import io
import argparse
from pathlib import Path

try:
    import rembg
    from PIL import Image, ImageDraw, ImageFilter
except ImportError as e:
    print(f"Hata: Gerekli kütüphaneler (.venv) bulunamadı: {e}")
    print("Lütfen sanal ortamı kullanın: ./studio.sh")
    sys.exit(1)


# Global rembg oturumu (modeli belleğe bir kez yükler, sonra her görseli ~1.5 sn'de işler)
_SESSION = None

def get_session(model_name: str = 'u2netp'):
    global _SESSION
    if _SESSION is None:
        _SESSION = rembg.new_session(model_name)
    return _SESSION


def process_image_to_studio(
    input_path: str,
    output_path: str = None,
    target_size: int = 800,
    padding_ratio: float = 0.12,
    add_shadow: bool = True,
    bg_color: tuple = (255, 255, 255),
    quality: int = 90,
    model_name: str = 'u2netp'
) -> bool:
    """Tek bir fotoğrafı stüdyo standartlarına dönüştürür."""
    if not os.path.exists(input_path):
        print(f"❌ Dosya bulunamadı: {input_path}")
        return False

    if output_path is None:
        output_path = input_path

    try:
        raw_img = Image.open(input_path).convert('RGB')

        # Hızlı işlem için aşırı büyük telefon fotoğraflarını (4000px+) makul boyuta çek
        max_dim = 1200
        if max(raw_img.size) > max_dim:
            ratio = max_dim / max(raw_img.size)
            raw_img = raw_img.resize(
                (int(raw_img.width * ratio), int(raw_img.height * ratio)),
                Image.Resampling.LANCZOS
            )

        buf = io.BytesIO()
        raw_img.save(buf, format='PNG')
        input_bytes = buf.getvalue()

        # 1. Yapay zeka ile arka planı temizle
        session = get_session(model_name)
        nobg_bytes = rembg.remove(input_bytes, session=session)
        nobg_img = Image.open(io.BytesIO(nobg_bytes)).convert('RGBA')

        # 2. Ürünün sınırlarını (bounding box) bul ve fazlalıkları kırp
        bbox = nobg_img.getbbox()
        if not bbox:
            print(f"⚠️ Uyarı: {input_path} görselinde ürün tespit edilemedi.")
            return False

        cropped_prod = nobg_img.crop(bbox)

        # 3. 1:1 Kare tuval için ölçekle (oranı kesinlikle bozmadan)
        padding = int(target_size * padding_ratio)
        avail_w = target_size - (2 * padding)
        avail_h = target_size - (2 * padding)

        w, h = cropped_prod.size
        scale = min(avail_w / w, avail_h / h)
        new_w = max(1, int(w * scale))
        new_h = max(1, int(h * scale))

        scaled_prod = cropped_prod.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # 4. Kare stüdyo tuvali oluştur
        canvas = Image.new('RGB', (target_size, target_size), bg_color)
        x = (target_size - new_w) // 2
        y = (target_size - new_h) // 2

        # 5. Doğal stüdyo zemin gölgesi ekle
        if add_shadow:
            shadow_w = int(new_w * 0.72)
            shadow_h = max(12, int(shadow_w * 0.14))
            pad_s = 24
            shadow = Image.new('RGBA', (shadow_w + pad_s * 2, shadow_h + pad_s * 2), (0, 0, 0, 0))
            draw = ImageDraw.Draw(shadow)
            draw.ellipse(
                [pad_s, pad_s, pad_s + shadow_w, pad_s + shadow_h],
                fill=(0, 0, 0, 48)
            )
            shadow = shadow.filter(ImageFilter.GaussianBlur(radius=7))

            shadow_x = (target_size - shadow.width) // 2
            shadow_y = y + new_h - int(shadow.height * 0.46)
            canvas.paste(shadow, (shadow_x, shadow_y), shadow)

        # 6. Ürünü tuvalin ortasına yapıştır
        canvas.paste(scaled_prod, (x, y), scaled_prod)

        # 7. Çıktıyı kaydet
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        canvas.save(output_path, 'JPEG', quality=quality, optimize=True)
        print(f"✓ Stüdyo packshot hazırlandı: {output_path}")
        return True

    except Exception as e:
        print(f"❌ {input_path} işlenirken hata oluştu: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Dermokozmetik Stüdyo Fotoğraf Pipeline'ı")
    parser.add_argument("--file", type=str, help="İşlenecek tek görsel dosya yolu")
    parser.add_argument("--folder", type=str, help="İşlenecek klasör yolu")
    parser.add_argument("--output", type=str, help="Özel çıktı klasörü veya dosya adı (isteğe bağlı)")
    parser.add_argument("--size", type=int, default=800, help="Kare tuval boyutu (varsayılan: 800)")
    parser.add_argument("--padding", type=float, default=0.12, help="Boşluk oranı (varsayılan: 0.12)")
    parser.add_argument("--no-shadow", action="store_true", help="Zemin gölgesini kapatır")
    parser.add_argument("--model", type=str, default="u2netp", help="rembg modeli (u2netp: çok hızlı, u2net: ağır)")

    args = parser.parse_args()

    if not args.file and not args.folder:
        parser.print_help()
        print("\nÖrnek Kullanım:")
        print("  ./studio.sh --file 'app/tum_urunler/ornek.jpg'")
        print("  ./studio.sh --folder 'ürünler/' --output 'app/tum_urunler/'")
        sys.exit(0)

    add_shadow = not args.no_shadow

    if args.file:
        out = args.output if args.output else args.file
        process_image_to_studio(
            args.file,
            out,
            target_size=args.size,
            padding_ratio=args.padding,
            add_shadow=add_shadow,
            model_name=args.model
        )

    elif args.folder:
        folder = Path(args.folder)
        if not folder.is_dir():
            print(f"Hata: {args.folder} bir klasör değil.")
            sys.exit(1)

        extensions = {'.jpg', '.jpeg', '.png', '.webp'}
        files = [p for p in folder.iterdir() if p.suffix.lower() in extensions]
        print(f"📁 {len(files)} adet görsel bulundu, stüdyo işlemine başlanıyor...")

        success_count = 0
        for idx, f in enumerate(files, 1):
            out = os.path.join(args.output, f.name) if args.output else str(f)
            print(f"[{idx}/{len(files)}] İşleniyor: {f.name}")
            if process_image_to_studio(
                str(f),
                out,
                target_size=args.size,
                padding_ratio=args.padding,
                add_shadow=add_shadow,
                model_name=args.model
            ):
                success_count += 1

        print(f"\n🎉 Tamamlandı! {success_count} / {len(files)} görsel stüdyo kalitesine dönüştürüldü.")


if __name__ == '__main__':
    main()
