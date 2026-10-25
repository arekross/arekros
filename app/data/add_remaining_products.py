import json

extra_products = [
    {
        "id": "mustela-baby-oil-100ml",
        "name": "Mustela Baby Oil Bebek Masaj Yağı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Bebek Masajı & Rahatlama",
        "brand": "Mustela",
        "size": "100 ml",
        "form": "Kuru Yağ (Sprey Şişe)",
        "image": "images/mustela/mustela-baby-oil-100ml.jpeg",
        "cilt_tipleri": ["Normal Cilt", "Kuru Cilt"],
        "yas_grubu": "Doğumdan itibaren tüm bebekler",
        "kimler_kullanamaz": "Yüzde açık gözeneklere veya yağlı egzamalı bölgelere önerilmez.",
        "nasil_kullanilir": "Avuç içine birkaç damla sıkılıp ısıtıldıktan sonra bebeğin vücuduna dairesel hareketlerle masaj yapılır. Banyo sonrası idealdir.",
        "hangi_sikayetle_gelene_verilir": [
            "Gaz sancısı (kolik) çeken bebeklerde karın masajı",
            "Uyku öncesi bebeği sakinleştirme ve gevşetme",
            "Kuru pullanan bebek cildini derinlemesine besleme"
        ],
        "kombinasyon_ve_uyarilar": "%99 doğal bitkisel yağlar içerir (avokado, nar çekirdeği, ayçiçeği). Hızlı emilir, giysilere yapışmaz.",
        "etken_maddeler": ["Avokado Yağı", "Nar Çekirdeği Yağı", "Ayçiçek Yağı"],
        "tags": ["bebek yağı", "masaj", "kolik", "rahatlatıcı", "uyku"]
    },
    {
        "id": "mustela-detangling-cream-shampoo-200ml",
        "name": "Mustela Kolay Tarama ve Besleyici Krem Şampuan",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Saç Bakımı & Kolay Tarama",
        "brand": "Mustela",
        "size": "200 ml",
        "form": "Krem Şampuan (Tüp)",
        "image": "images/mustela/mustela-detangling-and-nourishing-cream-shampoo-200ml.jpeg",
        "cilt_tipleri": ["Düğümlenen, Kıvırcık ve Kuru Saçlar"],
        "yas_grubu": "Doğumdan itibaren bebekler ve çocuklar",
        "kimler_kullanamaz": "Göz yakmaz.",
        "nasil_kullanilir": "Islak saça az miktarda uygulanır, köpürtülüp nazikçe taranarak durulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Banyo sonrası taranırken canı yanan, ağlayan uzun ve kıvırcık saçlı çocuklar",
            "Elektriklenen ve düğüm olan ince telli bebek saçları"
        ],
        "kombinasyon_ve_uyarilar": "Saç kremi gerektirmez, 2'si 1 arada krem dokusu saçı anında açar. Mustela Ferahlatıcı Bakım Suyu (Sprey) ile birlikte kuru taramada da desteklenebilir.",
        "etken_maddeler": ["Organik Avokado Yağı", "Organik Papatya Özü"],
        "tags": ["kolay tarama", "krem şampuan", "dolaşık saç", "kıvırcık"]
    },
    {
        "id": "mustela-gentle-cleansing-gel-200ml",
        "name": "Mustela Gentle Cleansing Gel Yenidoğan Şampuanı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Günlük Temizlik & Saç/Vücut",
        "brand": "Mustela",
        "size": "200 ml",
        "form": "Jel Şampuan (Tüp)",
        "image": "images/mustela/mustela-gentle-cleansing-gel-200ml.jpeg",
        "cilt_tipleri": ["Normal Cilt"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göz yakmaz.",
        "nasil_kullanilir": "Islak saç ve vücuda uygulanır, köpürtülüp durulanır. Seyahat ve çanta boyu olarak idealdir.",
        "hangi_sikayetle_gelene_verilir": [
            "Hastaneye doğum çantası hazırlayan anneler",
            "Tatil veya seyahat için pratik tüp boy bebek şampuanı arayanlar"
        ],
        "kombinasyon_ve_uyarilar": "Sabun içermez, fizyolojik pH değerine sahiptir.",
        "etken_maddeler": ["Avokado Perseose", "B5 Vitamini"],
        "tags": ["şampuan", "tüp", "yenidoğan", "çanta boy"]
    },
    {
        "id": "mustela-gentle-shampoo-200ml",
        "name": "Mustela Gentle Shampoo Papatya Özlü Bebek Şampuanı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Saç Bakımı",
        "brand": "Mustela",
        "size": "200 ml",
        "form": "Şampuan (Kapaklı Şişe)",
        "image": "images/mustela/mustela-gentle-shampoo-200ml.jpeg",
        "cilt_tipleri": ["İnce Telli Bebek Saçları", "Hassas Saç Derisi"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göz yakmaz.",
        "nasil_kullanilir": "Islak saça az miktarda dökülüp köpürtülür, nazikçe durulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Sadece saç yıkamak için özel hafif bebek şampuanı isteyenler",
            "Papatya özü ile saçın parlak ve yumuşak kalmasını isteyenler"
        ],
        "kombinasyon_ve_uyarilar": "Papatya özü açık renkli bebek saçlarının ışıltısını korur.",
        "etken_maddeler": ["Avokado Perseose", "Organik Papatya Özü"],
        "tags": ["şampuan", "papatya", "200ml", "saç bakımı"]
    },
    {
        "id": "mustela-gentle-shampoo-500ml",
        "name": "Mustela Gentle Shampoo Papatya Özlü Bebek Şampuanı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Saç Bakımı",
        "brand": "Mustela",
        "size": "500 ml",
        "form": "Şampuan (Büyük Boy Şişe)",
        "image": "images/mustela/mustela-gentle-shampoo-500ml.jpeg",
        "cilt_tipleri": ["Normal Saç Derisi"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göz yakmaz.",
        "nasil_kullanilir": "Islak saça uygulanır, köpürtülüp durulanır. Ekonomik aile boyudur.",
        "hangi_sikayetle_gelene_verilir": [
            "Uzun süreli kullanım için büyük boy saç şampuanı arayan aileler"
        ],
        "kombinasyon_ve_uyarilar": "%93 doğal kökenli içerik.",
        "etken_maddeler": ["Avokado Perseose", "Papatya Özü"],
        "tags": ["şampuan", "500ml", "büyük boy"]
    },
    {
        "id": "mustela-gentle-soap-with-cold-cream-100g",
        "name": "Mustela Cold Cream İçeren Katı Sabun",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Kuru Cilt Temizliği",
        "brand": "Mustela",
        "size": "100 g",
        "form": "Kalıp Sabun (Kutu)",
        "image": "images/mustela/mustela-gentle-soap-with-cold-cream-100g.jpeg",
        "cilt_tipleri": ["Kuru Cilt", "Hassas Cilt"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Bilinen kısıtlama yoktur.",
        "nasil_kullanilir": "Suyla köpürtülüp el, yüz ve vücuda uygulanır, durulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Kalıp sabun alışkanlığı olan ama cildinin kuruyup gerilmesini istemeyenler",
            "Bebeğin yüz ve el temizliğinde besleyici katı sabun arayanlar"
        ],
        "kombinasyon_ve_uyarilar": "Klasik sabunlar gibi cildi kurutmaz; Cold Cream ve seramidler içerir.",
        "etken_maddeler": ["Cold Cream", "Seramidler", "Gliserin"],
        "tags": ["katı sabun", "cold cream", "kuru cilt", "el yüz sabunu"]
    },
    {
        "id": "mustela-hair-styler-and-skin-freshener-200ml",
        "name": "Mustela Ferahlatıcı ve Kolay Tarama Saç & Ten Suyu",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Ferahlatıcı Sprey",
        "brand": "Mustela",
        "size": "200 ml",
        "form": "Sprey Şişe",
        "image": "images/mustela/mustela-hair-styler-and-skin-freshener-200ml.jpeg",
        "cilt_tipleri": ["Tüm Cilt ve Saç Tipleri"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göze direkt püskürtülmez.",
        "nasil_kullanilir": "Sabah uyandığında bebeğin dağılmış saçlarını düzeltmek veya terleyen ensesini/tenini ferahlatmak için sıkılır, taranır. Durulama gerektirmez.",
        "hangi_sikayetle_gelene_verilir": [
            "Sabah uyanınca şekli bozulan bebek saçlarını yatıştırma",
            "Sıcak yaz günlerinde ter kokusunu önleme ve bebeği ferahlatma"
        ],
        "kombinasyon_ve_uyarilar": "Organik papatya suyu içerir, durulanmaz.",
        "etken_maddeler": ["Organik Papatya Suyu"],
        "tags": ["sprey", "saç şekillendirici", "ferahlatıcı", "durulanmaz"]
    },
    {
        "id": "mustela-hydra-bebe-face-cream-40ml",
        "name": "Mustela Hydra Bébé Nemlendirici Yüz Kremi",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Günlük Yüz Bakımı",
        "brand": "Mustela",
        "size": "40 ml",
        "form": "Yüz Kremi (Kutu / Tüp)",
        "image": "images/mustela/mustela-hydra-bebe-face-cream-40ml.jpeg",
        "cilt_tipleri": ["Normal Cilt"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göz içine sürülmez.",
        "nasil_kullanilir": "Sabah ve akşam bebeğin temiz yüzüne hafif masajla sürülür.",
        "hangi_sikayetle_gelene_verilir": [
            "Bebeğin yanaklarını günlük dış etkenlere karşı nemli ve yumuşak tutmak"
        ],
        "kombinasyon_ve_uyarilar": "Akışkan dokusu ile 24 saat nem kilitler.",
        "etken_maddeler": ["Avokado Perseose", "Jojoba Yağı", "E Vitamini"],
        "tags": ["yüz kremi", "hydra bebe", "günlük nem"]
    },
    {
        "id": "mustela-maternite-nursing-comfort-balm-10ml",
        "name": "Mustela Maternité Organik Göğüs Ucu Bakım Balmı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Anne & Emzirme",
        "brand": "Mustela",
        "size": "10 ml",
        "form": "Balm (Kutu / Tüp)",
        "image": "images/mustela/mustela-maternite-nursing-comfort-balm-bio-10ml.jpeg",
        "cilt_tipleri": ["Hassas ve Çatlayan Göğüs Uçları"],
        "yas_grubu": "Emziren Anneler",
        "kimler_kullanamaz": "Bilinen kontrendikasyonu yoktur.",
        "nasil_kullanilir": "Her emzirme seansının hemen ardından göğüs ucuna sürülür. Emzirmeden önce temizlenmesi GEREKMEZ (bebek için %100 güvenli gıda sınıfı organik içerik).",
        "hangi_sikayetle_gelene_verilir": [
            "Emzirmeye bağlı göğüs ucu çatlağı, acı, kanama ve yanma hissi",
            "Lanolin alerjisi veya vegan alternatif arayan anneler"
        ],
        "kombinasyon_ve_uyarilar": "Kokusuz ve tatsızdır, bebeğin emme refleksini ve koku alışkanlığını bozmaz.",
        "etken_maddeler": ["Organik Zeytinyağı", "E Vitamini"],
        "tags": ["göğüs ucu", "çatlak", "emzirme", "vegan", "organik"]
    },
    {
        "id": "mustela-maternite-stretch-marks-cream-150ml",
        "name": "Mustela Maternité Çatlak Öncesi 3'ü 1 Arada Krem",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Anne & Hamilelik",
        "brand": "Mustela",
        "size": "150 ml",
        "form": "Krem (Kutu / Tüp)",
        "image": "images/mustela/mustela-maternite-stretch-marks-cream-3in1-150ml.jpeg",
        "cilt_tipleri": ["Hamile Cildi"],
        "yas_grubu": "Hamile ve Yeni Anneler",
        "kimler_kullanamaz": "İyileşmemiş sezaryen dikişleri.",
        "nasil_kullanilir": "Günde 2 kez karın, göğüs ve kalçalara sürülür. Yağsız emilir, giyinmeye hemen olanak sağlar.",
        "hangi_sikayetle_gelene_verilir": [
            "Yağ formülü yerine krem formunda hızlı emilen çatlak kremi isteyen anne adayları"
        ],
        "kombinasyon_ve_uyarilar": "Sabah krem, akşam Çatlak Bakım Yağı şeklinde ikili kür uygulanması en yüksek başarıyı sağlar.",
        "etken_maddeler": ["Maracuja Yağı", "Avokado Yağı"],
        "tags": ["çatlak kremi", "3in1", "hamile"]
    },
    {
        "id": "mustela-no-rinse-cleansing-water-300ml",
        "name": "Mustela No-Rinse Cleansing Water Durulama Gerektirmeyen Temizleme Suyu",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Hızlı Temizlik (Miseler Su)",
        "brand": "Mustela",
        "size": "300 ml",
        "form": "Temizleme Suyu (Pompalı)",
        "image": "images/mustela/mustela-no-rinse-cleansing-water-300ml.jpeg",
        "cilt_tipleri": ["Normal Cilt"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göz içine sıkılmaz.",
        "nasil_kullanilir": "Pamuğa sıkılır; bebeğin yüzü, elleri veya bez bölgesi nazikçe silinir. Durulama gerektirmez.",
        "hangi_sikayetle_gelene_verilir": [
            "Dışarıdayken, parkta veya arabadayken su bulamadan temizlik ihtiyacı",
            "Bebeğin yüzündeki mama ve tükürük kalıntılarını yıpratmadan silme"
        ],
        "kombinasyon_ve_uyarilar": "Islak mendil yerine pamuk + bu su kombinasyonu pişik riskini sıfıra indirir.",
        "etken_maddeler": ["Avokado Perseose", "Aloe Vera Özü", "Allantoin"],
        "tags": ["temizleme suyu", "miseler su", "durulanmaz", "bebek pamuğu"]
    },
    {
        "id": "mustela-nourishing-cleansing-gel-cold-cream-300ml",
        "name": "Mustela Cold Cream İçeren Besleyici Temizleme Jeli",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Kuru Cilt Temizliği",
        "brand": "Mustela",
        "size": "300 ml",
        "form": "Jel Şampuan (Pompalı)",
        "image": "images/mustela/mustela-nourishing-cleansing-gel-with-cold-cream-300ml.jpeg",
        "cilt_tipleri": ["Kuru Cilt"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göz yakmaz.",
        "nasil_kullanilir": "Islak saç ve vücuda uygulanır, köpürtülüp durulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Banyo sırasında cildinin kurumasını ve gerilmesini istemeyen kuru ciltli bebekler"
        ],
        "kombinasyon_ve_uyarilar": "Banyo sonrası Cold Cream İçeren Vücut Losyonu ile tamamlanmalıdır.",
        "etken_maddeler": ["Cold Cream", "Avokado Perseose", "Seramidler"],
        "tags": ["cold cream", "yıkama jeli", "kuru cilt", "300ml"]
    },
    {
        "id": "mustela-nourishing-lotion-cold-cream-200ml",
        "name": "Mustela Cold Cream İçeren Besleyici Vücut Losyonu",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Kuru Cilt Nemlendirme",
        "brand": "Mustela",
        "size": "200 ml",
        "form": "Losyon (Tüp)",
        "image": "images/mustela/mustela-nourishing-lotion-with-cold-cream-200ml.jpeg",
        "cilt_tipleri": ["Kuru Cilt"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Bilinen kısıtlama yoktur.",
        "nasil_kullanilir": "Sabah ve akşam tüm vücuda uygulanır. Zengin ve kremsi dokuludur.",
        "hangi_sikayetle_gelene_verilir": [
            "Standart losyonların yetersiz kaldığı, pul pul dökülen kuru bebek cildi"
        ],
        "kombinasyon_ve_uyarilar": "Kuru ciltli yetişkinler için de kollar ve bacaklarda harika bir bariyer nemlendiricisidir.",
        "etken_maddeler": ["Cold Cream", "Seramidler", "Bitkisel Yağlar"],
        "tags": ["vücut losyonu", "cold cream", "kuru cilt"]
    },
    {
        "id": "mustela-solid-shampoo-cleansing-bar-75g",
        "name": "Mustela Organik Katı Şampuan ve Duş Sabunu",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Çevre Dostu Katı Bakım",
        "brand": "Mustela",
        "size": "75 g",
        "form": "Katı Şampuan (Kutu)",
        "image": "images/mustela/mustela-solid-shampoo-body-cleansing-bar-75g.jpeg",
        "cilt_tipleri": ["Tüm Aile ve Çocuklar"],
        "yas_grubu": "3 yaş ve üzeri çocuklar ve tüm yetişkinler",
        "kimler_kullanamaz": "3 yaş altı bebekler için yenidoğan şampuanı tercih edilmelidir.",
        "nasil_kullanilir": "Islak elde köpürtülüp saça ve vücuda sürülür, durulanır. Plastiksiz ambalajdır.",
        "hangi_sikayetle_gelene_verilir": [
            "Sıfır atık, çevre dostu ve organik banyo ürünü isteyen aileler",
            "Çocuklar için eğlenceli ve pratik katı yıkama barı"
        ],
        "kombinasyon_ve_uyarilar": "Kullandıktan sonra kuru bir sabunlukta saklanması ömrünü 2 kat uzatır (2 adet 200ml şişeye denktir).",
        "etken_maddeler": ["Organik Zeytinyağı", "Organik Avokado Yağı"],
        "tags": ["katı şampuan", "sıfır atık", "çocuk şampuanı", "organik"]
    },
    {
        "id": "mustela-soothing-cleansing-gel-300ml",
        "name": "Mustela Soothing Cleansing Gel Çok Hassas Cilt Temizleme Jeli",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Çok Hassas & Kızarık Cilt",
        "brand": "Mustela",
        "size": "300 ml",
        "form": "Jel Şampuan (Pompalı)",
        "image": "images/mustela/mustela-soothing-cleansing-gel-300ml.jpeg",
        "cilt_tipleri": ["Çok Hassas Cilt", "Kızarıklığa Meyilli Ten"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Göz yakmaz.",
        "nasil_kullanilir": "Islak saça ve vücuda nazikçe uygulanıp durulanır. Kokusuzdur.",
        "hangi_sikayetle_gelene_verilir": [
            "En ufak temasta hemen pembeleşen, kızaran aşırı reaktif ciltler",
            "Parfüme alerjisi veya hassasiyeti olan bebekler"
        ],
        "kombinasyon_ve_uyarilar": "Şisandra (Schisandra) meyve özü kızarıklığı ve gerginliği dindirir.",
        "etken_maddeler": ["Schisandra Özü", "Avokado Perseose"],
        "tags": ["çok hassas", "kızarıklık", "kokusuz", "şampuan"]
    },
    {
        "id": "mustela-soothing-cleansing-water-300ml",
        "name": "Mustela Soothing Cleansing Water Çok Hassas Cilt Temizleme Suyu",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Çok Hassas & Kızarık Cilt",
        "brand": "Mustela",
        "size": "300 ml",
        "form": "Temizleme Suyu (Pompalı)",
        "image": "images/mustela/mustela-soothing-cleansing-water-300ml.jpeg",
        "cilt_tipleri": ["Çok Hassas Cilt", "Kızarık Yüz & Bez Bölgesi"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Bilinen kısıtlama yoktur.",
        "nasil_kullanilir": "Pamuğa dökülüp yüz, boyun veya bez bölgesine sürülür. Durulanmaz.",
        "hangi_sikayetle_gelene_verilir": [
            "Suyla yıkandığında bile hemen kızaran reaktif hassas bebek yüzü",
            "Kokusuz ve durulanmayan pratik temizlik"
        ],
        "kombinasyon_ve_uyarilar": "Kızarıklık ve batma hissini %98 oranında yatıştırır.",
        "etken_maddeler": ["Schisandra Özü", "Avokado Perseose"],
        "tags": ["temizleme suyu", "çok hassas", "kızarıklık", "durulanmaz"]
    },
    {
        "id": "mustela-soothing-moisturizing-lotion-200ml",
        "name": "Mustela Soothing Moisturizing Lotion Çok Hassas Cilt Nemlendirici Losyon",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Çok Hassas & Kızarık Cilt",
        "brand": "Mustela",
        "size": "200 ml",
        "form": "Losyon (Tüp)",
        "image": "images/mustela/mustela-soothing-moisturizing-lotion-200ml.jpeg",
        "cilt_tipleri": ["Çok Hassas Cilt", "Reaktif Cilt"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Kokusuz formüldür.",
        "nasil_kullanilir": "Sabah ve akşam tüm vücuda hafif dokunuşlarla uygulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Hava değişiminde, rüzgarda veya sürtünmede hemen kızaran aşırı hassas bebek vücudu"
        ],
        "kombinasyon_ve_uyarilar": "Hafif ikinci bir ten gibi koruyucu tabaka örter, parfümsüzdür.",
        "etken_maddeler": ["Schisandra", "Avokado Perseose"],
        "tags": ["losyon", "çok hassas", "kızarıklık", "parfümsüz"]
    }
]

# Read existing JSON
with open('/home/arekros/Projects/uygulama projesi/app/data/products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Append extra products
existing_ids = set(p['id'] for p in products)
added = 0
for p in extra_products:
    if p['id'] not in existing_ids:
        products.append(p)
        added += 1

with open('/home/arekros/Projects/uygulama projesi/app/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"Toplam {added} yeni ürün eklendi. Genel toplam: {len(products)} ürün!")
