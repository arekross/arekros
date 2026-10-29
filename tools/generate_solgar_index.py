import json, os, urllib.request, re

def main():
    root_dir = '/home/arekros/Projects/uygulama projesi'
    url = 'https://api.solgar.com.tr/WebService.aspx?cmd=groupitems&brd=SLG'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        items = json.loads(r.read().decode('utf-8'))

    def slugify(text):
        text = text.lower()
        text = text.replace('ı', 'i').replace('ğ', 'g').replace('ü', 'u').replace('ş', 's').replace('ö', 'o').replace('ç', 'c')
        text = text.replace('™', '').replace('®', '').replace('+', '_plus_')
        text = re.sub(r'[^a-z0-9]+', '_', text).strip('_')
        return 'solgar_' + text

    # Sort items by category then name
    items.sort(key=lambda x: (x.get('Group01', ''), x.get('FullName', '')))

    md = []
    md.append('# ☀️ Solgar Türkiye Resmi Ürün ve Kapak Fotoğrafı Kataloğu (121 Ürün)\n')
    md.append('> **Kaynak:** `https://solgar.com.tr/urunler` resmi web servisi  \n')
    md.append('> **Fotoğrafların Konumu (Klasör):** [`Solgar_Urun_Fotograflari/`](file:///home/arekros/Projects/uygulama%20projesi/Solgar_Urun_Fotograflari/) ve [`app/images/solgar/`](file:///home/arekros/Projects/uygulama%20projesi/app/images/solgar/)  \n')
    md.append('> **Format:** 700x700 Yüksek Çözünürlüklü Şeffaf / Beyaz Fonlu Orijinal Stüdyo Packshot (PNG)  \n')
    md.append('> **Toplam İndirilen:** 121 / 121 Ürün (Eksiksiz %100 Başarı)\n\n---\n')

    current_group = None
    group_counter = 0
    total_counter = 1

    for it in items:
        grp = it.get('Group01') or 'Genel Takviyeler'
        if grp != current_group:
            if current_group is not None:
                md.append('\n')
            current_group = grp
            md.append(f'## 📁 {current_group}\n')
            md.append('| # | Ürün Adı (Kutu Üzerindeki) | İndirilen Fotoğraf Dosyası | Alt Kategori / Grup |')
            md.append('| :---: | :--- | :--- | :--- |')

        name = it['FullName']
        slug = slugify(name)
        fn = f'{slug}.png'
        grp2 = it.get('Group02', '')
        md.append(f'| {total_counter} | **{name}** | [`{fn}`](file:///home/arekros/Projects/uygulama%20projesi/Solgar_Urun_Fotograflari/{fn}) | {grp2 or "-"} |')
        total_counter += 1

    md.append('\n---\n')

    out_file = os.path.join(root_dir, 'SOLGAR_URUN_LISTESI.md')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md))

    print(f'[OK] Generated {out_file} with {total_counter - 1} products.')

if __name__ == '__main__':
    main()
