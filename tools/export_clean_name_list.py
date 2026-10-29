import json, os

def main():
    root_dir = '/home/arekros/Projects/uygulama projesi'
    json_path = os.path.join(root_dir, 'scratch/stock_inventory_final.json')
    out_path = os.path.join(root_dir, 'URUN_ISIM_LISTESI.md')

    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    brands_order = [
        ('Caudalie', '🍇 Caudalie (59 Ürün - Birebir Tek Çekimler)'),
        ('Avène', '💧 Avène (10 Ürün)'),
        ('Bioderma', '🛡️ Bioderma (4 Ürün)'),
        ('CeraVe', '🧴 CeraVe (4 Ürün)'),
        ('Lierac', '🌸 Lierac (6 Ürün)'),
        ('La Roche-Posay', '🔬 La Roche-Posay (2 Ürün)'),
        ('Benjamin Button', '✨ Benjamin Button (5 Ürün)'),
        ('Bioxcin', '🌿 Bioxcin Saç Bakımı (5 Ürün)'),
        ('Phyto Paris', '🌱 Phyto Paris Botanik Saç Bakımı (4 Ürün)'),
        ('Gıda Takviyeleri & Diğer', '💊 Gıda Takviyeleri, Vitaminler ve Diğer Standlar (20 Ürün)')
    ]

    grouped = {b[0]: [] for b in brands_order}
    for it in items:
        b = it.get('brand', '')
        if b in grouped:
            grouped[b].append(it)
        else:
            grouped['Gıda Takviyeleri & Diğer'].append(it)

    md = []
    md.append('# 📋 Eczane Tüm Stok Ürün İsimleri ve Arama Listesi (119 Ürün)\n')
    md.append('> Bu liste, eczanedeki 119 stok fotoğrafından çıkarılmış **resmi ürün isimleri**, **Türkçe eczane karşılıkları**, **hacimleri** ve **fotoğraf dosya adlarının** tam listesidir.\n')
    md.append('> İnternette arama yaparken veya resmi görselleri bulurken bu isimleri doğrudan kopyalayabilirsiniz.\n\n---\n')

    counter = 1
    for brand_key, brand_title in brands_order:
        brand_items = grouped[brand_key]
        md.append(f'## {brand_title}\n')
        md.append('| # | Fotoğraf Dosyası | Tam Orijinal Ürün Adı | Türkçe Eczane Adı | Hacim / Form | Ürün Tipi / Seri |')
        md.append('| :---: | :--- | :--- | :--- | :--- | :--- |')
        for it in brand_items:
            fn = it.get('filename', '')
            p_name = it.get('product_name', '')
            tr_name = it.get('turkish_name', '')
            vol = it.get('volume', '')
            line = it.get('line', '')
            md.append(f"| {counter} | `{fn}` | **{p_name}** | {tr_name} | {vol} | {line} |")
            counter += 1
        md.append('\n---\n')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))

    print(f'[OK] Generated {out_path} with {counter - 1} products.')

if __name__ == '__main__':
    main()
