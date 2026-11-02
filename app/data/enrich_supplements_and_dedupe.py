#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Eczane Ürün Kataloğu - Mükerrer Temizleme ve Takviye Klinik Bilgi Zenginleştirme
1. Çift / mükerrer eklenmiş ürünleri eler.
2. Tüm gıda takviyesi, vitamin, mineral ve hapları derin klinik niş bilgilerle donatır:
   - SGK (Devletin Ödediği) vs. Eczane Takviyesi Karşılaştırması & Biyoyararlanım
   - Ne işe yarar & Nasıl kullanılır (Aç/tok, sabah/gece)
   - Kimler içebilir & Kimler içemez (12 yaş sınırı, kan sulandırıcı, tiroid ilacı)
   - Yaş & İdeal Kilo Normu (Persantil Aralığı)
"""

import json
import os

DATA_JSON_PATH = 'app/data/products.json'
DATA_JS_PATH = 'app/data/products.js'

with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f'Mevcut ürün sayısı: {len(products)}')

# 1. MÜKERRER ÜRÜNLERİN TESPİTİ VE ELENMESİ
DUPLICATE_IMAGES_TO_REMOVE = {
    'tum_urunler/Avene Cleanance Aqua-Gel Matifiant Mattifying Aqua-Gel 50 ml (1).jpg',
    'tum_urunler/Avene Cleanance Comedomed Gel Nettoyant Peeling Cleansing Gel 400 ml.jpg',
    'tum_urunler/Cleanance Comedomed Laktik ve Süksinik Asit İçeren Arındırıcı, Peeling Etkili Temizleme Jeli.jpg',
    'tum_urunler/Avene Cleanance Gel Nettoyant Cleansing Gel 400 ml.jpg',
    'tum_urunler/Avene Les Essentiels Creme Nutritive Revitalisante 50 ml (2).jpg',
    'tum_urunler/Avene XeraCalm A.D Huile Lavante Relipidante Cleansing Oil 400 ml.jpg',
    'tum_urunler/Caudalie Serum Capillaire Anti-chute 50 ml.jpg',
    'tum_urunler/Caudalie Vinopure Purifying Gel Cleanser 385 ml (2).jpg',
    'tum_urunler/Lierac Sunissime Le Fluide Veloute Solaire Visage SPF50+ 40 ml (2).jpg',
    'tum_urunler/cerave-cerave-kopuren-temizleyici-473-ml-pompali-sise.jpeg'
}

cleaned_products = []
removed_count = 0

for p in products:
    img = p.get('image', '')
    if img in DUPLICATE_IMAGES_TO_REMOVE:
        print(f'Elenen mükerrer: {p["name"]} ({img})')
        removed_count += 1
    else:
        cleaned_products.append(p)

print(f'{removed_count} adet mükerrer ürün elendi. Kalan: {len(cleaned_products)}')

# 2. YENİ EKLENECEK TEMEL ECZANE TAKVİYELERİ
EXTRA_SUPPLEMENTS = [
    {
        "id": "sup_ocean_pediatric_omega",
        "name": "Ocean Portakal & Tutti Frutti Balık Yağı Şurubu (IFOS 5 Yıldız / Doğal Trigliserit)",
        "brand": "Orzax Ocean",
        "form": "Şurup",
        "size": "150 ml",
        "category_name": "Takviye Edici Gıda",
        "sub_category": "Pediatrik Omega-3 & Balık Yağı",
        "rutin_adimi": "Gıda Takviyesi (Günde 1 Ölçek)",
        "image": "tum_urunler/ocean_orzax_pediatric_omega.jpg",
        "yas_grubu": "Çocuk (4-10 Yaş)",
        "ideal_kilo_araligi": "16 - 35 kg (4-10 Yaş persantil normu)",
        "kimler_icebilir": "4 yaş ve üzeri tüm çocuklar, dikkat eksikliği ve ders odaklanması desteği arayan okul çağı öğrencileri.",
        "kimler_icemez": "Balık ve deniz ürünlerine karşı şiddetli anafilaktik alerjisi olan çocuklar.",
        "cilt_tipleri": ["Tüm Beden", "Hücre Zarı & Beyin Gelişimi"],
        "hangi_sikayetle_gelene_verilir": [
            "Çocuğum derse odaklanamıyor, dikkat eksikliği ve unutkanlık var",
            "Balık yemeyen çocuğuma beyin ve göz gelişimi için balık yağı istiyorum",
            "Bağışıklığını destekleyecek, kokusuz, içimi kolay şurup arıyorum"
        ],
        "ne_ise_yarar": "Beyin hücre zarlarının %60'ını oluşturan DHA ve sinir iletimini destekleyen EPA yağ asitleri içerir. Çocuklarda nörolojik gelişim, retina/göz sağlığı, hafıza, öğrenme hızı ve bilişsel odaklanmayı artırır.",
        "nasil_kullanilir": "Günde 1 tatlı kaşığı (5 ml). Aç karnına verilmemelidir! Safra ve lipaz enzimlerinin salgılanıp emilimin tam olması için mutlaka kahvaltı veya akşam yemeği ortasında tok karnına verilmelidir.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Trigliserit TG vs. Etil Ester EE): Devlet hastanelerinde yazılan veya ucuz market balık yağları sentetik 'Etil Ester (EE)' formundadır; alkol bağı taşır, emilimi zayıftır ve çocukta balık kokulu geğirme yapar. Ocean Balık Yağı ise 'Doğal Trigliserit (TG)' formundadır; anne sütündeki doğal yağ yapısındadır ve biyoyararlanımı 3 kat daha yüksektir. Ayrıca bağımsız Kanada IFOS laboratuvarı tarafından 5 Yıldız onaylıdır (ağır metal, cıva, kurşun ve PCB sıfırdır).",
        "etken_maddeler": ["Doğal Trigliserit Balık Yağı", "Total Omega-3 (1480 mg)", "EPA (740 mg)", "DHA (470 mg)", "E Vitamini"],
        "kimler_kullanamaz": "Balık alerjisi olanlar."
    },
    {
        "id": "sup_newlife_b12_sublingual",
        "name": "New Life B12 Plus Dilaltı Metilkobalamin & Folat & Biotin Tablet",
        "brand": "New Life",
        "form": "Dilaltı Tablet",
        "size": "60 Dilaltı Tablet",
        "category_name": "Takviye Edici Gıda",
        "sub_category": "Sinir Sistemi & Enerji",
        "rutin_adimi": "Gıda Takviyesi (Günde 1 Dilaltı Tablet)",
        "image": "tum_urunler/newlife_b12_plus_sublingual.jpg",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "40 kg üzeri (Yetişkin dozu)",
        "kimler_icebilir": "Unutkanlık, odaklanma güçlüğü, sabah yorgunluğu, el-ayak uyuşması/karıncalanması olanlar ve vegan/vejetaryenler.",
        "kimler_icemez": "12 yaş altı çocuklar (hekim önermedikçe 1000 mcg yüksek B12 dozu verilmez).",
        "cilt_tipleri": ["Hücre Enerjisi", "Sinir Sistemi"],
        "hangi_sikayetle_gelene_verilir": [
            "Kafamı toparlayamıyorum, isimleri unutuyorum ve sabahları çok yorgun kalkıyorum",
            "Elimde ayağımda karıncalanma ve uyuşma oluyor",
            "Kan tahlilimde B12 değerim düşük çıktı, iğne vurulmadan yükseltmek istiyorum"
        ],
        "ne_ise_yarar": "Sinir liflerinin etrafını saran miyelin kılıfını onarır, sinir iletimini hızlandırır. Metiyonin sentaz enzimiyle homosisteini düşürerek damar tıkanıklığı ve felç riskini azaltır. DNA ve kırmızı kan hücresi sentezini destekler.",
        "nasil_kullanilir": "Günde 1 tablet, sabah veya öğle yemeğinden sonra dil altına konarak tamamen erimesi beklenir. Yutulmamalı ve su ile içilmemelidir! Dil altındaki zengin kılcal damar yatağından (sublingual venler) doğrudan emilir.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Benexol B12 / Dodex vs. Metilkobalamin): Devletin ödediği Benexol B12 ve Dodex sentetik 'Siyanokobalamin' formudur; kimyasal yapısında siyanür molekülü taşır ve vücut bunu kullanamaz; önce karaciğerde metilasyondan geçirip aktif forma çevirmek zorundadır. Ancak Türk toplumunun %40'ında MTHFR gen polimorfizmi vardır ve karaciğer bu dönüşümü yapamaz! Ayrıca yutulan B12'nin emilmesi için mide asidi ve 'İntrensek Faktör' şarttır; gastriti olanlarda emilmeden dışkıyla atılır. New Life B12 ise 'Metilkobalamin' aktif koenzim formudur; karaciğere ve mide asidine gerek duymadan dil altından doğrudan kana karışır, etkisi 5 kat daha hızlıdır!",
        "etken_maddeler": ["Metilkobalamin (Aktif B12 - 1000 mcg)", "Aktif Folat (L-Metilfolat - 400 mcg)", "Biotin (D-Biotin - 400 mcg)"],
        "kimler_kullanamaz": "İçeriğindeki vitaminlere aşırı duyarlılığı olanlar."
    },
    {
        "id": "sup_pharmaton_vital_g115",
        "name": "Pharmaton Vital G115 Standartlaştırılmış Ginseng & Multivitamin",
        "brand": "Pharmaton",
        "form": "Kapsül",
        "size": "60 Kapsül",
        "category_name": "Takviye Edici Gıda",
        "sub_category": "Enerji & Kronik Yorgunluk",
        "rutin_adimi": "Gıda Takviyesi (Günde 1 Kapsül - Sabah)",
        "image": "tum_urunler/pharmaton_dynavit_multivitamin.jpg",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "40 kg üzeri yetişkinler",
        "kimler_icebilir": "Yoğun çalışanlar, sınav dönemindeki öğrenciler (12 yaş üstü), sabahları tükenmiş uyananlar, fiziksel ve zihinsel bitkinlik yaşayanlar.",
        "kimler_icemez": "12 yaş altı çocuklar, kontrolsüz hipertansiyonu (yüksek tansiyon) olanlar, gebeler ve emziren kadınlar.",
        "cilt_tipleri": ["Fiziksel Güç", "Zihinsel Performans"],
        "hangi_sikayetle_gelene_verilir": [
            "Kronik yorgunum, gün ortasında enerjim tükeniyor, uykumu alamıyorum",
            "İş yerinde dikkatim dağılıyor, performansımı toparlayacak vitamin istiyorum",
            "Mevsim geçişlerinde sürekli hasta oluyorum ve halsiz düşüyorum"
        ],
        "ne_ise_yarar": "Klinik patentli G115 Panax Ginseng özütü hücre içine oksijen taşınmasını ve mitokondriyal ATP üretimini hızlandırır. 18 temel vitamin ve mineral içeriğiyle laktik asit birikimini geciktirerek yorgunluk hissini ortadan kaldırır.",
        "nasil_kullanilir": "Günde 1 kapsül, sabah kahvaltısı ortasında veya hemen sonrasında 1 büyük bardak su ile yutulmalıdır. Akşam saatlerinde alınmamalıdır (Ginseng canlandırıcı etki yaparak uykusuzluk yapabilir). 3 ay düzenli kullanımdan sonra 2-3 hafta ara verilmesi önerilir.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Kore Ginsengi G115 Standardizasyonu): Sıradan multivitaminlerde ya da aktarlardaki ginseng tozlarında aktif 'Ginsanozit' oranı belirsizdir ve çoğu zaman etkisizdir. Pharmaton'daki G115 özütü, her kapsülde tam %4 standart ginsanozit garantisi sunan dünyadaki tek klinik patentli formdur. Vücudun kortizol stres yanıtını dengeler ve bağışıklık T-hücrelerini aktive eder.",
        "etken_maddeler": ["G115 Standart Panax Ginseng Ekstresi (40 mg)", "A Vitamini", "B Kompleks (B1, B2, B6, B12)", "C Vitamini", "D3", "Demir", "Çinko", "Magnezyum", "Kalsiyum"],
        "kimler_kullanamaz": "Yüksek tansiyon hastaları, 12 yaş altı çocuklar, gebeler."
    },
    {
        "id": "sup_supradyn_all_day_q10",
        "name": "Supradyn All Day Koenzim Q10 & 13 Vitamin 9 Mineral Film Tablet",
        "brand": "Supradyn",
        "form": "Tablet",
        "size": "60 Film Tablet",
        "category_name": "Takviye Edici Gıda",
        "sub_category": "Günlük Canlılık & Antioksidan",
        "rutin_adimi": "Gıda Takviyesi (Günde 1 Tablet - Sabah)",
        "image": "tum_urunler/supradyn_all_day_q10.jpg",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "40 kg üzeri yetişkinler",
        "kimler_icebilir": "Gün boyu aktif kalanlar, spor yapanlar, 30 yaş üstü hücresel yaşlanmayı ve yorgunluğu önlemek isteyen yetişkinler.",
        "kimler_icemez": "12 yaş altı çocuklar, böbrek yetmezliği olanlar (yüksek mineral yükü nedeniyle).",
        "cilt_tipleri": ["Hücresel Mitokondri", "Canlılık"],
        "hangi_sikayetle_gelene_verilir": [
            "Gün boyu dinamik kalmak istiyorum ama öğleden sonra çöküyorum",
            "Hem vitamin ihtiyacımı karşılasın hem de cildime ve enerjime iyi gelsin",
            "Beslenmem düzensiz, vücudumun tüm vitamin-mineral eksiğini kapatmak istiyorum"
        ],
        "ne_ise_yarar": "Koenzim Q10 hücrelerimizin enerji santrali olan mitokondrilerin temel kofaktörüdür. Kalp kası ve çizgili kasların oksijenli solunumla enerji üretmesini sağlar. 13 vitamin ve 9 mineralle birlikte bağışıklık ve metabolizmayı tam destekler.",
        "nasil_kullanilir": "Günde 1 film tablet, sabah kahvaltısından sonra tok karnına 1 bardak su ile yutulur.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Koenzim Q10 Sinerjisi): Yaş ilerledikçe (özellikle 30 yaşından sonra) vücudun doğal Koenzim Q10 üretimi %50'ye varan oranda düşer; kolesterol ilacı (statin) kullananlarda ise Q10 üretimi tamamen bloke olur ve şiddetli kas ağrısı başlar. Supradyn All Day, Q10 ile B vitaminlerini bir araya getirerek hücrede Krebs döngüsünü maksimum hızda çalıştırır.",
        "etken_maddeler": ["Koenzim Q10 (4.5 mg)", "13 Vitamin (A, B1, B2, B6, B12, C, D, E, K, Folik Asit, Biotin, Niasin, Pantotenik Asit)", "9 Mineral (Kalsiyum, Magnezyum, Demir, Çinko, Bakır, Manganez, İyot, Selenyum, Molibden)"],
        "kimler_kullanamaz": "12 yaş altı çocuklar, ileri derece böbrek hastaları."
    },
    {
        "id": "sup_elenatal_pregnancy",
        "name": "Elenatal 1 / Elenatal 2 Metafolin (Aktif Folat) & Omega-3 DHA Gebelik Kompleksi",
        "brand": "Elenatal",
        "form": "Kapsül / Tablet",
        "size": "30 Kapsül",
        "category_name": "Takviye Edici Gıda",
        "sub_category": "Anne & Bebek / Prenatal",
        "rutin_adimi": "Gıda Takviyesi (Günde 1 Kapsül)",
        "image": "tum_urunler/elenatal_bayer_pregnancy.jpg",
        "yas_grubu": "Yetişkin (Hamilelik & Emzirme)",
        "ideal_kilo_araligi": "Yetişkin kadınlar",
        "kimler_icebilir": "Hamilelik planlayan kadınlar, 1., 2. ve 3. trimesterdeki gebeler ve emziren anneler.",
        "kimler_icemez": "Erkekler, çocuklar ve demir yükleme hastalığı (hemokromatozis) olanlar.",
        "cilt_tipleri": ["Gebelikte Fetal Gelişim", "Anne Sağlığı"],
        "hangi_sikayetle_gelene_verilir": [
            "Hamile kalmayı planlıyorum, bebeğimin omurga gelişimi için hangi folik asidi almalıyım?",
            "Doktorum gebelik multivitamini önerdi, bebeğimin beyin gelişimini destekleyecek güvenli ürün arıyorum",
            "Klasik demir ve vitamin hapları midemi çok bulandırıyor"
        ],
        "ne_ise_yarar": "Bebeğin omurilik kapanması (nöral tüp defektini önleme), beyin ve göz dokularının inşası için gereklidir. Annenin gebelikte kan yapımını artırır, saç dökülmesi ve kemik kalsiyum kaybını engeller.",
        "nasil_kullanilir": "Günde 1 kapsül/tablet, tercihen öğle yemeği sırasında bol su ile alınır.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Folik Asit vs. Metafolin / Aktif L-Metilfolat): Sağlık ocaklarında veya reçetede yazılan klasik 'Folik Asit' sentetiktir ve vücutta aktifleşebilmesi için MTHFR enzim basamağına ihtiyaç duyar. Kadınların %40-50'sinde bu genetik enzim yavaştır ve sentetik folik asit kanda birikip (unmetabolized folic acid) bebeğe fayda sağlamaz! Elenatal'daki 'Metafolin', enzime ihtiyaç duymayan doğrudan biyoaktif L-Metilfolattır; plasentadan hızla bebeğe geçer ve nöral tüpü tam korur.",
        "etken_maddeler": ["Metafolin (Aktif Folat 400 mcg)", "DHA (Fetal Beyin Gelişimi İçin 200 mg)", "Demir", "İyot (Fetal Zeka İçin)", "D3 Vitamini", "Çinko"],
        "kimler_kullanamaz": "Hemokromatozis (demir birikimi) hastaları."
    },
    {
        "id": "sup_harveys_multi_protect",
        "name": "Harvey's Multi Protect Kara Mürver & Beta Glukan Pediatrik Çocuk Şurubu",
        "brand": "Harveys",
        "form": "Şurup",
        "size": "150 ml",
        "category_name": "Takviye Edici Gıda",
        "sub_category": "Pediatrik Bağışıklık Güçlendirici",
        "rutin_adimi": "Gıda Takviyesi (Günde 1 Ölçek)",
        "image": "tum_urunler/harveys_multi_protect_syrup.jpg",
        "yas_grubu": "Çocuk (4-10 Yaş)",
        "ideal_kilo_araligi": "16 - 32 kg (4-10 Yaş normal persantil normu)",
        "kimler_icebilir": "Kreşe ve ilkokula giden, sık sık nezle, grip, üst solunum yolu enfeksiyonu geçiren ve iştahsız çocuklar.",
        "kimler_icemez": "1 yaş altı bebekler, otoimmün hastalığı olanlar (aşırı bağışıklık uyarılmaması gerekenler).",
        "cilt_tipleri": ["Solunum Yolu Mukozası", "Bağışıklık Kalkanı"],
        "hangi_sikayetle_gelene_verilir": [
            "Çocuğum kreşe başladığından beri 2 haftada bir hasta oluyor",
            "Antibiyotik kullanmadan önce doğal bağışıklık şurubu vermek istiyorum",
            "Boğaz enfeksiyonu ve öksürüğe karşı koruyucu vitamin arıyorum"
        ],
        "ne_ise_yarar": "Kara mürver (Sambucus nigra) virüslerin hücre içine girişini sağlayan hemaglutinin reseptörlerini bloke eder. Beta Glukan 1,3/1,6 makrofaj beyaz kan hücrelerini aktive ederek enfeksiyon süresini ve sıklığını %60 azaltır.",
        "nasil_kullanilir": "4-10 yaş grubu çocuklar için günde 1 ölçek (5 ml); hastalık dönemlerinde günde 2 ölçek (sabah-akşam). Aç veya tok verilebilir, tatlı meyve aromalıdır.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Standardize Kara Mürver vs. Sıradan C Vitamini): C vitamini tek başına virüsün hücreye girmesini önleyemez. Standardize Kara Mürver antosiyaninleri ise influenza ve soğuk algınlığı virüslerinin yüzeyindeki tutunma kancalarına yapışarak virüsün çoğalmasını fiziksel olarak durdurur.",
        "etken_maddeler": ["Kara Mürver Ekstresi (Sambucus Nigra)", "Beta Glukan (1,3/1,6)", "C Vitamini", "Çinko", "Propolis"],
        "kimler_kullanamaz": "Bal veya arı ürünlerine aşırı duyarlılığı olanlar."
    },
    {
        "id": "sup_baybay_pediatric_drops",
        "name": "BayBay Gece Rahatlama & Uyku Destek Pediatrik Bitkisel Damla",
        "brand": "BayBay",
        "form": "Damla",
        "size": "50 ml",
        "category_name": "Takviye Edici Gıda",
        "sub_category": "Pediatrik Uyku & Huzursuzluk",
        "rutin_adimi": "Gıda Takviyesi (Gece Yatmadan Önce)",
        "image": "tum_urunler/baybay_harveys_pediatric.jpg",
        "yas_grubu": "Bebek & Çocuk (1-10 Yaş)",
        "ideal_kilo_araligi": "10 - 30 kg",
        "kimler_icebilir": "Gece sık uyanan, diş çıkarma döneminde huzursuz olan, uykuya dalmakta zorlanan bebek ve çocuklar.",
        "kimler_icemez": "Alerjik bünyeli bebeklerde bitki ekstrelerine karşı hekime danışılmalıdır.",
        "cilt_tipleri": ["Sinir Sistemi Rahatlama", "Derin Uyku"],
        "hangi_sikayetle_gelene_verilir": [
            "Bebeğim/çocuğum gece saat başı uyanıyor, uykuya dalarken çok ağlıyor",
            "Diş çıkarma sancısından dolayı geceleri çok huzursuz",
            "Kimyasal uyku ilacı değil, tamamen doğal bitkisel damla arıyorum"
        ],
        "ne_ise_yarar": "Melisa (Oğul otu), Ihlamur ve Mayıs Papatyası ekstreleri santral sinir sisteminde GABA reseptörlerine hafifçe bağlanarak doğal bir gevşeme ve uyku kalitesi sağlar. Gaz sancısını hafifletir, bağımlılık yapmaz.",
        "nasil_kullanilir": "Gece yatmadan 30-40 dakika önce 10-15 damla doğrudan ağıza damlatılarak veya ılık su/süt/ıhlamur içerisine karıştırılarak verilir.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Doğal Bitkisel GABA vs. Antihistaminik Sedatifler): Eski dönemde bazı hekimlerin çocuk uyutmak için yazdığı alerji şurupları (antihistaminikler) santral sinir sistemini uyuşturur, REM uykusunu bozar ve gündüz sersemlik yapar. BayBay damla sentetik kimyasal içermez; melatonin döngüsünü bozmadan biyolojik derin uykuyu destekler.",
        "etken_maddeler": ["Melisa Yaprağı Ekstresi (Melissa Officinalis)", "Mayıs Papatyası Ekstresi (Matricaria Chamomilla)", "Ihlamur Çiçeği Ekstresi (Tilia Cordata)"],
        "kimler_kullanamaz": "Papatyagiller ailesine alerjisi olanlar."
    }
]

# Mevcut takviye ürünlerinin klinik bilgilerini zenginleştirme tablosu
SUPPLEMENT_ENRICHMENTS = {
    "Solgar - Magnesium Citrate 60 Tablet": {
        "form": "Tablet",
        "size": "60 Tablet",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "40 kg üzeri (Yetişkin dozu)",
        "kimler_icebilir": "Kas krampları, huzursuz bacak, kabızlık eşlik eden kas spazmları ve spor sonrası laktik asit birikimi yaşayanlar.",
        "kimler_icemez": "İleri derece böbrek yetmezliği olanlar, myastenia gravis hastaları, aktif ishal atağı yaşayanlar.",
        "ne_ise_yarar": "Magnezyum sitrat, magnezyum mineralinin sitrik asit ile şelatlandığı organik formdur. Kasların gevşemesini sağlar, krampları önler, bağırsak peristaltizmini hafifçe uyararak kabızlığı giderir ve enerji metabolizmasında 300'den fazla enzimi aktive eder.",
        "nasil_kullanilir": "Günde 1-2 tablet, akşam yemeğinden sonra veya yatmadan 1-2 saat önce bol su ile alınır. Tiroid ilacı (Levotiron), demir hapı veya antibiyotik (kinolon/tetrasiklin) kullanılıyorsa aralarında en az 3-4 saat bırakılmalıdır!",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Sitrat vs. Oksit / Magvital): Reçeteyle devletin ödediği Magvital, Magnorm vb. toz ve hapların içeriği genellikle 'Magnezyum Oksit'tir. Magnezyum oksitin biyoyararlanımı yalnızca %4'tür! Yani aldığınız magnezyumun %96'sı kana geçmeden bağırsakta kalır, suyu içine çeker ve şiddetli ishal yapar ama kas krampına fayda sağlamaz. Solgar Magnezyum Sitrat ise %30-35 yüksek emilime sahiptir; kas dokusuna ve hücre içine hızla geçer.",
        "etken_maddeler": ["Magnezyum Sitrat (Elemental Magnezyum 200-400 mg)"]
    },
    "Solgar Vitamin B-12 1000mcg 100 Tablet": {
        "form": "Dilaltı / Çiğneme Tableti",
        "size": "100 Tablet",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "40 kg üzeri",
        "kimler_icebilir": "Hafıza bulanıklığı, unutkanlık, kronik yorgunluk, ellerde ayaklarda karıncalanma yaşayanlar, metformin (şeker ilacı) veya mide koruyucu (lansoprazol/pantoprazol) kullananlar.",
        "kimler_icemez": "12 yaş altı çocuklar (hekim yazmadıkça 1000 mcg verilmez), Leber optik atrofisi olanlar.",
        "ne_ise_yarar": "Kırmızı kan hücresi (eritrosit) oluşumunu destekleyerek megaloblastik anemiyi engeller. Sinir kılıflarını (miyelin) onararak nöropatik ağrıları ve unutkanlığı giderir. Homosistein düzeyini düşürerek damar sağlığını korur.",
        "nasil_kullanilir": "Günde 1 tablet, tercihen sabah kahvaltısından sonra dil altında eritilerek veya çiğnenerek alınır.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Benexol B12 vs. Eczane Formu): Mide koruyucu (PPI) veya şeker ilacı (Metformin) kullananlarda midede 'İntrensek Faktör' üretimi çöker; bu nedenle yutulan Benexol hapları mideden emilemez. Solgar Dilaltı formu ise ağız mukozasından mideye uğramadan emildiği için gastriti veya mide koruyucu kullanımı olanlarda dahi %100 kana geçer.",
        "etken_maddeler": ["Siyanokobalamin / Kobalamin (1000 mcg)"]
    },
    "Solgar omega 3 950 mg fish oil": {
        "form": "Yumuşak Kapsül (Softgel)",
        "size": "50 Softgel",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "45 kg üzeri yetişkinler",
        "kimler_icebilir": "Yüksek trigliserit, kalp-damar tıkanıklığı riski, kuru göz sendromu, eklem romatizması veya zihinsel odaklanma desteği arayan yetişkinler.",
        "kimler_icemez": "Kanama bozukluğu olanlar, ameliyata girecek olanlar (ameliyattan 1 hafta önce kesilmelidir), kan sulandırıcı (Varfarin/Coumadin) yüksek doz kullananlar hekim onayıyla almalıdır.",
        "ne_ise_yarar": "Yüksek konsantrasyonda EPA (504 mg) ve DHA (378 mg) içerir. Damar içi aterom plaklarının oluşumunu yavaşlatır, trigliserit seviyesini düşürür, beyin fonksiyonlarını güçlendirir ve eklem inflamasyonunu azaltır.",
        "nasil_kullanilir": "Günde 1-2 softgel, mutlaka yağlı bir öğün (kahvaltı veya akşam yemeği) ortasında 1 bardak su ile alınmalıdır. Aç karnına alınırsa safra salgılanmadığı için emilmez ve çöpe gider!",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Yüksek Konsantre EPA/DHA vs. Sıradan Balık Yağı): Sıradan market balık yağlarında 1000 mg kapsülün sadece 300 mg'ı aktif omegadır, kalan 700 mg'ı gereksiz doymuş balık yağıdır. Solgar 950 mg'da ise tek bir kapsülde tam 950 mg saf aktif Omega-3 bulunur; soğuk su derin deniz balıklarından moleküler distilasyonla cıva ve ağır metallerden arındırılarak üretilmiştir.",
        "etken_maddeler": ["Toplam Omega-3 (950 mg)", "EPA (504 mg)", "DHA (378 mg)"]
    },
    "Solgar Vitamin C 1000 Mg 90 Tablet": {
        "form": "Tablet",
        "size": "90 Tablet",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "40 kg üzeri",
        "kimler_icebilir": "Bağışıklığını güçlendirmek isteyenler, sigara içenler (sigara C vitaminini hızla tüketir), demir ilacıyla emilimi artırmak isteyenler ve kollajen takviyesi kullananlar.",
        "kimler_icemez": "Aktif böbrek taşı (özellikle kalsiyum oksalat taşı) öyküsü olanlar, talasemi veya hemokromatozis hastaları.",
        "ne_ise_yarar": "Güçlü bir antioksidandır. Kollajen sentezinde lizin ve prolin amino asitlerinin hidroksilasyonu için zorunlu kofaktördür. Demir mineralini Fe3+ formundan Fe2+ emilebilir forma çevirir.",
        "nasil_kullanilir": "Günde 1 tablet, tercihen sabah veya öğle yemeğinden sonra bol su ile içilir. Gece geç saatte alınırsa idrar sıklığını artırabilir.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Kuşburnu / Bioflavonoid Sinerjisi): Yalnızca saf askorbik asit alındığında vücut bunu hızla böbrekten atar. Solgar C Vitamini içerisindeki doğal 'Kuşburnu (Rose Hips)' bioflavonoidleri sayesinde C vitamininin hücre içi kalıcılığı ve biyoyararlanımı 2 katına çıkar.",
        "etken_maddeler": ["L-Askorbik Asit (1000 mg)", "Kuşburnu Ekstresi (Rose Hips)"]
    },
    "Solgar L-Carnitine 500mg 30 Tablet": {
        "form": "Tablet",
        "size": "30 Tablet",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "Yetişkinler (50 kg üzeri)",
        "kimler_icebilir": "Spor ve kardiyo yapanlar, yağ yakımını ve enerji üretimini hızlandırmak isteyenler, sperm hareketliliği desteği arayan erkekler.",
        "kimler_icemez": "Epilepsi (sara) hastaları (nöbet eşiğini düşürebilir), tiroid hormonu düşük olanlar (L-karnitin tiroid hormonlarının hücreye girişini yavaşlatabilir).",
        "ne_ise_yarar": "Uzun zincirli serbest yağ asitlerini hücrenin enerji fabrikası olan mitokondri membranından içeri taşır (karnitin mekiği). Yağların yakılarak ATP enerjisine dönüşmesini sağlar.",
        "nasil_kullanilir": "Spordan / antrenmandan 30-45 dakika önce aç karnına 1-2 tablet bol su ile alınır. Spor yapılmayan günlerde sabah aç karnına alınabilir.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ: Karnitin tek başına otururken yağ yakmaz; mutlaka aerobik hareket veya kalori açığıyla birlikte mitokondriye yağ asidi pompalamalıdır.",
        "etken_maddeler": ["Serbest Form L-Karnitin (500 mg)"]
    },
    "Voonka Beauty Collagen Plus Hidrolize Kollajen Tip 1 - Tip 3 Ananas Aromalı": {
        "form": "Toz Saşe",
        "size": "30 Saşe",
        "yas_grubu": "Yetişkin (25 Yaş Üstü)",
        "ideal_kilo_araligi": "Yetişkinler",
        "kimler_icebilir": "25 yaşından sonra azalan kollajen üretimini telafi etmek, cilt elastikiyetini artırmak, kırışıklıkları doldurmak ve saç/tırnakları güçlendirmek isteyen kadın ve erkekler.",
        "kimler_icemez": "18 yaş altı ergenler, gebeler ve emziren anneler (hekim önerisi olmadan).",
        "ne_ise_yarar": "2000 Dalton molekül ağırlığında Tip 1 ve Tip 3 hidrolize balık/sığır kollajen peptitleri içerir. Dermal fibroblast hücrelerini uyararak cildin kendi hyaluronik asit ve kollajenini üretmesini tetikler.",
        "nasil_kullanilir": "Günde 1 saşe, 1 bardak (200 ml) oda sıcaklığındaki suya karıştırılarak içilir. Emilimin en yüksek olduğu zaman: Gece yatmadan önce veya sabah aç karnına. 8-12 haftalık kür halinde kullanılmalıdır.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Dalton Büyüklüğü): Klasik kemik suyu veya jelatin içindeki kollajen 300.000 Dalton büyüklüğündedir ve bağırsaktan emilemez, midede parçalanır. Voonka Beauty Collagen enzimatik hidrolizle 2000 Daltona küçültülmüş peptittir; kana hızla karışıp doğrudan dermise taşınır. İçeriğindeki C vitamini kollajenin vücutta çapraz bağlanması için zorunludur.",
        "etken_maddeler": ["Hidrolize Kollajen Peptitleri Tip 1 & Tip 3 (10.000 mg)", "C Vitamini", "Hyaluronik Asit", "Çinko", "Biotin", "Bakır", "Selenyum"]
    },
    "Voonka Multi Collagen Tip 1-2-3 90 tb": {
        "form": "Tablet",
        "size": "90 Tablet",
        "yas_grubu": "Yetişkin",
        "ideal_kilo_araligi": "Yetişkinler",
        "kimler_icebilir": "Hem cilt sarkması hem de diz/eklem kireçlenmesi, kıkırdak aşınması ve çıtırtısı yaşayan 40 yaş üstü bireyler.",
        "kimler_icemez": "Deniz ve tavuk ürünlerine şiddetli alerjisi olanlar.",
        "ne_ise_yarar": "Tip 1 ve 3 cildi gerginleştirip kırışıklığı açarken; Tip 2 kollajen eklem kıkırdak matriksini onarır ve sinovyal eklem sıvısını artırarak sürtünmeyi önler.",
        "nasil_kullanilir": "Günde 2-3 tablet, tercihen yemeklerden sonra bol su ile.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ: Tip 1-3 cildi, Tip 2 ise eklemleri onarır. İkisinin bir arada olması eklem sıvısını ve cilt elastikiyetini eş zamanlı onarır.",
        "etken_maddeler": ["Hidrolize Tip 1 Kollajen", "Hidrolize Tip 2 Kollajen (Eklem Kıkırdağı)", "Hidrolize Tip 3 Kollajen", "C Vitamini", "Hyaluronik Asit"]
    },
    "Voonka Omega 3 975": {
        "form": "Softgel",
        "size": "60 Softgel",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "45 kg üzeri",
        "kimler_icebilir": "Kalp-damar sağlığını korumak, kolesterol dengesini sağlamak ve hafızasını güçlendirmek isteyenler.",
        "kimler_icemez": "Kanama diyatezi olanlar, operasyon öncesi hastalar.",
        "ne_ise_yarar": "Trigliserit formda yüksek EPA ve DHA sunarak damar endotelini korur, pıhtılaşma eğilimini dengeler.",
        "nasil_kullanilir": "Günde 1-2 softgel, mutlaka yağlı yemeklerin ortasında.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ: Doğal trigliserit formdadır, mideyi rahatsız etmez ve emilimi sentetik etil esterlere kıyasla 3 kat yüksektir.",
        "etken_maddeler": ["Toplam Balık Yağı (1200 mg)", "EPA (585 mg)", "DHA (390 mg)"]
    },
    "Voonka Omega 3 DHA Max": {
        "form": "Softgel",
        "size": "30 Softgel",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "Yetişkinler",
        "kimler_icebilir": "Özellikle zihinsel performans, hafıza, Alzheimer koruması, yoğun sınav dönemi ve göz kuruluğu yaşayanlar (DHA beyin ve retina için asıl maddedir).",
        "kimler_icemez": "Balık alerjisi olanlar.",
        "ne_ise_yarar": "Yüksek DHA konsantrasyonuyla beyin nöron zarlarını onarır ve sinaptik iletim hızını artırır.",
        "nasil_kullanilir": "Günde 1 softgel kahvaltı veya akşam yemeği ortasında.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ BİLGİ: EPA kalp ve damar için ön plandayken, DHA doğrudan beyin ve göz retinası için kritiktir.",
        "etken_maddeler": ["DHA (Yüksek Doz 500+ mg)", "EPA", "Doğal Trigliserit Balık Yağı"]
    },
    "Voonka Omega 7": {
        "form": "Yumuşak Kapsül",
        "size": "30 Kapsül",
        "yas_grubu": "Yetişkin",
        "ideal_kilo_araligi": "Yetişkinler",
        "kimler_icebilir": "Göz kuruluğu, ağız kuruluğu, menopoz sonrası vajinal kuruluk ve şiddetli cilt kuruluğu yaşayanlar.",
        "kimler_icemez": "Kır iğdesi meyvesine alerjisi olanlar.",
        "ne_ise_yarar": "Kır iğdesi (Sea Buckthorn) yağından elde edilen Palmitoleik asittir (Omega-7). Vücudun tüm iç ve dış mukoza zarlarının (göz, ağız, vajina, bağırsak) doğal nem dengesini içeriden hücresel olarak onarır.",
        "nasil_kullanilir": "Günde 1 kapsül yemeklerle birlikte.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ: Dışarıdan sürülen damlalar veya kremler geçici rahatlama sağlarken, Omega-7 meibomian göz bezlerini ve vajinal mukozayı içeriden doğal lipid tabakasıyla besler.",
        "etken_maddeler": ["Kır İğdesi Yağı (Sea Buckthorn Oil)", "Palmitoleik Asit (Omega-7 500 mg)"]
    },
    "INFINITY BerberiQ": {
        "form": "Kapsül",
        "size": "60 Kapsül",
        "yas_grubu": "18 Yaş Üstü Yetişkin",
        "ideal_kilo_araligi": "Yetişkinler (Özellikle insülin direnci ve göbek bölgesi yağlanması olanlar)",
        "kimler_icebilir": "İnsülin direnci, tip 2 diyabet eğilimi, tatlı krizleri, karaciğer yağlanması ve kilo vermekte zorlananlar.",
        "kimler_icemez": "18 yaş altı, gebeler, emzirenler ve hipoglisemi (ani şeker düşmesi) yaşayanlar.",
        "ne_ise_yarar": "Berberin hidroklorür, hücresel düzeyde AMPK (hücresel enerji sensörü) enzimini aktive eder. Hücrelerin glukoz alımını insülinden bağımsız olarak artırarak kan şekerini dengeler ve tatlı krizlerini keser.",
        "nasil_kullanilir": "Günde 2 kapsül, ana yemeklerden (öğle ve akşam) 15-20 dakika önce 1 bardak su ile alınır.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Berberin vs. Metformin): Klinik çalışmalarda Berberin'in HbA1c ve açlık kan şekerini düşürme mekanizmasının metformin ilacıyla neredeyse eşdeğer olduğu gösterilmiştir. Karaciğerde yağ üretimini (lipogenez) baskılar.",
        "etken_maddeler": ["Berberis Aristata Kök Ekstresi (%97 Berberin HCL 500 mg)", "Koenzim Q10", "Krom Pikolinat"]
    },
    "INFINITY Resveratrol": {
        "form": "Kapsül",
        "size": "60 Kapsül",
        "yas_grubu": "Yetişkin",
        "ideal_kilo_araligi": "Yetişkinler",
        "kimler_icebilir": "Anti-aging (hücresel gençleşme), damar elastikiyeti, karaciğer detoksu ve serbest radikallere karşı hücresel koruma arayanlar.",
        "kimler_icemez": "Hormon duyarlı kanser öyküsü olanlar, kan sulandırıcı kullananlar (doktora danışmalı).",
        "ne_ise_yarar": "Trans-resveratrol, uzun ömür genleri olarak bilinen 'SIRT1 (Sirtuin)' enzimlerini aktive eder. Mitokondri hasarını önler ve damar çeperlerindeki nitrik oksit (NO) üretimini artırarak damarları genç tutar.",
        "nasil_kullanilir": "Günde 1 kapsül, tercihen sabah kahvaltısıyla birlikte.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ BİLGİ (Trans-Resveratrol Saflığı): Sıradan üzüm çekirdeği tozlarında aktif resveratrol oranı %1'in altındadır. INFINITY Resveratrol standardize %98 saf 'Trans' izomer formundadır ve hücre içine doğrudan nüfuz eder.",
        "etken_maddeler": ["Standartlaştırılmış Trans-Resveratrol (250 mg)", "Piperin (Karabiber Ekstresi - Biyoyararlanımı 10 kat artırır)"]
    },
    "INFINITY Bromelain": {
        "form": "Kapsül",
        "size": "60 Kapsül",
        "yas_grubu": "12 Yaş Üstü & Yetişkin",
        "ideal_kilo_araligi": "Yetişkinler",
        "kimler_icebilir": "Ödem problemi yaşayanlar, estetik/burun ameliyatı sonrası şişlikleri olanlar, selülit ve lenf drenaj desteği arayanlar.",
        "kimler_icemez": "Ananas alerjisi olanlar, aktif mide ülseri olanlar, kan sulandırıcı (Coumadin) kullananlar.",
        "ne_ise_yarar": "Ananas sapından elde edilen proteolitik enzimdir. İnflamatuvar bradikinin ve prostaglandinleri parçalayarak dokulardaki fazla suyun ve ödemin lenfatik drenajla atılmasını sağlar.",
        "nasil_kullanilir": "Ödem ve şişlik için: Öğün aralarında AÇ KARNINA günde 1-2 kapsül bol su ile. Sindirimi rahatlatmak için: Yemek ortasında.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ BİLGİ: Aç karnına alındığında kana geçip ödem söktürür; tok karnına alınırsa midedeki proteinleri sindirir. Ödem için MUTLAKA aç karnına alınmalıdır!",
        "etken_maddeler": ["Standardize Bromelain (2400 GDU/g yüksek enzim aktivitesi)"]
    },
    "NutraFarm Medobyocomplex-M Biotin": {
        "form": "Kapsül",
        "size": "60 Kapsül",
        "yas_grubu": "Erkek Yetişkin",
        "ideal_kilo_araligi": "Yetişkin erkekler",
        "kimler_icebilir": "Erkek tipi genetik saç dökülmesi (Androgenetik alopesi), saç tellerinde incelme ve tepe açılması yaşayan erkekler.",
        "kimler_icemez": "Kadınlar (Erkek formülüdür, Saw Palmetto içerir), 18 yaş altı.",
        "ne_ise_yarar": "Saw Palmetto (Cüce Palmiye) ekstresi saç köklerini öldüren DHT (Dihidrotestosteron) hormonunu bloke eder. Biotin, Çinko ve At kuyruğu silisyumu saç tellerinin çapını kalınlaştırır.",
        "nasil_kullanilir": "Günde 2 kapsül, sabah ve akşam yemeklerden sonra bol su ile.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ FARMAKOLOJİK BİLGİ (Saw Palmetto vs. Finasterid): Reçeteli finasterid ilacı libido kaybı yapabilirken; standardize Saw Palmetto doğal 5-alfa redüktaz inhibitörüdür, hormonal yan etki yapmadan saç folikülünü DHT saldırısından korur.",
        "etken_maddeler": ["Saw Palmetto Ekstresi", "Biotin (5000 mcg)", "At Kuyruğu Ekstresi (Doğal Silisyum)", "Çinko", "L-Sistin", "B5 Vitamini"]
    },
    "NutraFarm Medobiocomplex-W": {
        "form": "Kapsül",
        "size": "60 Kapsül",
        "yas_grubu": "Kadın Yetişkin",
        "ideal_kilo_araligi": "Yetişkin kadınlar",
        "kimler_icebilir": "Mevsimsel, stres veya doğum sonrası yoğun saç dökülmesi yaşayan, tırnakları kırılan ve saçları cansızlaşan kadınlar.",
        "kimler_icemez": "İçeriğindeki vitaminlere alerjisi olanlar.",
        "ne_ise_yarar": "Kadın tipi telogen effluvium dökülmelerinde saç folikülünün anagen (büyüme) fazını uzatır. Keratin sentezini uyararak saç kökünü besler.",
        "nasil_kullanilir": "Günde 2 kapsül yemeklerden sonra.",
        "sgk_karsilastirmasi_ve_nis_bilgi": "🏆 NİŞ BİLGİ: Demir eksikliği anemisi olan kadınlarda demir takviyesiyle birlikte kullanıldığında saç dökülmesini 3 haftada durdurur.",
        "etken_maddeler": ["Biotin (5000 mcg)", "L-Sistin & L-Metiyonin (Keratin Yapıtaşları)", "Çinko", "Folik Asit", "B3 & B5 Vitaminleri"]
    }
}

# Mevcut takviyeleri zenginleştir
enriched_count = 0
for p in cleaned_products:
    name = p['name']
    for k, info in SUPPLEMENT_ENRICHMENTS.items():
        if k.lower() in name.lower() or name.lower() in k.lower():
            p.update(info)
            enriched_count += 1
            print(f'Zenginleştirildi: {p["name"]}')
            break

# Ekstra takviyeleri ekle
for extra in EXTRA_SUPPLEMENTS:
    cleaned_products.append(extra)
    print(f'Yeni Takviye Eklendi: {extra["name"]}')

print(f'\nToplam {len(cleaned_products)} ürün hazırlandı ({enriched_count} mevcut takviye güncellendi, {len(EXTRA_SUPPLEMENTS)} yeni klinik takviye eklendi).')

# Dosyaları kaydet
with open(DATA_JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(cleaned_products, f, ensure_ascii=False, indent=2)

js_content = 'const PRODUCTS_DATA = ' + json.dumps(cleaned_products, ensure_ascii=False, indent=2) + ';\n\n'
js_content += 'if (typeof window !== "undefined") {\n  window.PRODUCTS = PRODUCTS_DATA;\n}\n'

with open(DATA_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'✓ {DATA_JSON_PATH} ve {DATA_JS_PATH} başarıyla güncellendi!')
