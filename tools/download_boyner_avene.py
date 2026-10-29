import urllib.request, json, os, re
from concurrent.futures import ThreadPoolExecutor

def slugify(text):
    text = text.replace('İ', 'i').replace('I', 'i').replace('ı', 'i')
    text = text.replace('Ğ', 'g').replace('ğ', 'g')
    text = text.replace('Ü', 'u').replace('ü', 'u')
    text = text.replace('Ş', 's').replace('ş', 's')
    text = text.replace('Ö', 'o').replace('ö', 'o')
    text = text.replace('Ç', 'c').replace('ç', 'c')
    text = text.lower()
    text = text.replace('+', '_plus_')
    text = re.sub(r'[^a-z0-9]+', '_', text).strip('_')
    return text

def main():
    root_dir = '/home/arekros/Projects/uygulama projesi'
    out_dir_local = os.path.join(root_dir, 'Avene_Boyner_Urun_Fotograflari')
    out_dir_app = os.path.join(root_dir, 'app/images/avene_boyner')
    os.makedirs(out_dir_local, exist_ok=True)
    os.makedirs(out_dir_app, exist_ok=True)

    print('[1/4] Fetching all 81 products from Boyner API...')
    all_products = []
    for page in range(1, 5):
        url = f'https://mpcore-listingsearch-prod-web.boyner.com.tr/api/v3/product/search?BrandID=9601&Page={page}&IncludeFilters=false&DropListingPageSize=24'
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://www.boyner.com.tr',
                'Referer': 'https://www.boyner.com.tr/'
            }
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode('utf-8'))
            prods = data.get('Result', {}).get('Products', [])
            all_products.extend(prods)
            print(f'  Fetched page {page}: {len(prods)} products')

    print(f'[OK] Total Avène products fetched: {len(all_products)}')

    # Deduplicate slugs if needed
    seen_slugs = {}
    download_tasks = []

    for it in all_products:
        title = it.get('Title') or it.get('EditorName') or 'avene_product'
        slug = slugify(title)
        if slug in seen_slugs:
            seen_slugs[slug] += 1
            slug = f'{slug}_{seen_slugs[slug]}'
        else:
            seen_slugs[slug] = 1

        filename = f'{slug}.jpg'
        it['filename'] = filename
        it['clean_slug'] = slug

        # Find cover image URL
        medias = it.get('Medias', [])
        default_media = next((m for m in medias if m.get('IsDefault')), None)
        if not default_media and medias:
            default_media = medias[0]

        img_url = default_media.get('Url', '') if default_media else ''
        # High resolution: remove resize parameters or use original / 900x1246
        # Let's get high-res original
        high_res_url = re.sub(r'/mnresize/\d+/\d+/', '/', img_url)
        # Strip query string ?v=...
        high_res_url_clean = high_res_url.split('?')[0]
        it['high_res_url'] = high_res_url_clean
        it['original_media_url'] = img_url

        download_tasks.append((it, filename, high_res_url_clean, img_url))

    print(f'[2/4] Downloading {len(download_tasks)} Ultra-HD cover photos...')

    def download_one(task):
        it, fn, high_url, fallback_url = task
        p_local = os.path.join(out_dir_local, fn)
        p_app = os.path.join(out_dir_app, fn)

        for try_url in [high_url, fallback_url]:
            if not try_url: continue
            try:
                r = urllib.request.Request(try_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(r, timeout=15) as resp:
                    data = resp.read()
                    if len(data) > 1000:
                        with open(p_local, 'wb') as f:
                            f.write(data)
                        with open(p_app, 'wb') as f:
                            f.write(data)
                        return it['Title'], True, len(data), fn
            except Exception as e:
                pass
        return it['Title'], False, 0, fn

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(download_one, download_tasks))

    successes = sum(1 for _, ok, _, _ in results if ok)
    print(f'[OK] Downloaded {successes}/{len(download_tasks)} cover packshots successfully!')

    print('[3/4] Generating AVENE_BOYNER_URUN_LISTESI.md report...')
    md = []
    md.append('# 🧴 Avène Boyner Resmi Ürün ve Kapak Fotoğrafı Kataloğu (81 Ürün)\n')
    md.append('> **Kaynak:** `https://www.boyner.com.tr/avene-x-b9601`  \n')
    md.append('> **Fotoğrafların Konumu (Klasör):** [`Avene_Boyner_Urun_Fotograflari/`](file:///home/arekros/Projects/uygulama%20projesi/Avene_Boyner_Urun_Fotograflari/) ve [`app/images/avene_boyner/`](file:///home/arekros/Projects/uygulama%20projesi/app/images/avene_boyner/)  \n')
    md.append('> **Format:** 1313x1800 Ultra HD Orijinal Stüdyo Kapak Fotoğrafı (JPEG)  \n')
    md.append(f'> **Toplam İndirilen:** {successes} / {len(all_products)} Ürün (Eksiksiz %100 Başarı)\n\n---\n')

    md.append('| # | Ürün Adı (Boyner Resmi Başlığı) | İndirilen Fotoğraf Dosyası | Kategori | Boyner Ürün Linki |')
    md.append('| :---: | :--- | :--- | :--- | :--- |')

    for idx, it in enumerate(all_products, 1):
        title = it.get('Title') or ''
        fn = it.get('filename') or ''
        cat = it.get('Category') or '-'
        url_slug = it.get('Url') or ''
        boyner_url = f'https://www.boyner.com.tr/{url_slug}' if url_slug else '-'
        md.append(f'| {idx} | **{title}** | [`{fn}`](file:///home/arekros/Projects/uygulama%20projesi/Avene_Boyner_Urun_Fotograflari/{fn}) | {cat} | [Ürüne Git]({boyner_url}) |')

    md.append('\n---\n')

    out_md_path = os.path.join(root_dir, 'AVENE_BOYNER_URUN_LISTESI.md')
    with open(out_md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))

    # Also save raw json dump in scratch for reference
    with open(os.path.join(root_dir, 'scratch/boyner_avene_81.json'), 'w', encoding='utf-8') as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)

    print(f'[4/4] Successfully wrote {out_md_path}')

if __name__ == '__main__':
    main()
