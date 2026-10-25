import json
import os

products = [
    # --- MUSTELA STELATOPIA (ATOPIK & ÇOK KURU CİLT) ---
    {
        "id": "mustela-stelatopia-plus-150ml",
        "name": "Mustela Stelatopia+ Lipit Yenileyici Krem",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Atopik & Çok Kuru Cilt",
        "brand": "Mustela",
        "size": "150 ml",
        "form": "Krem (Tüp / Kutu)",
        "image": "images/mustela/mustela-stelatopia-plus-lipid-replenishing-cream-150ml.jpeg",
        "cilt_tipleri": ["Çok Kuru Cilt", "Atopik Cilt", "Egzamaya Meyilli Cilt"],
        "yas_grubu": "Doğumdan itibaren (Yenidoğan dahil), Çocuklar ve Tüm Aile",
        "kimler_kullanamaz": "Açık yara veya sızıntılı enfekte lezyonlara sürülmez. Yağlı/akneye meyilli bölgelere uygulanmaz.",
        "nasil_kullanilir": "Günde 2 kez tüm vücuda ve yüze nazikçe masaj yaparak uygulanır. Duş/banyodan sonra cildin nemi henüz kaybolmadan sürülmesi etkiyi katlar.",
        "hangi_sikayetle_gelene_verilir": [
            "Aşırı cilt kuruluğu ve pullanma",
            "Yoğun gece kaşıntısı ve huzursuzluk",
            "Atopik dermatit alevlenmesi ve yatıştırma ihtiyacı",
            "Bozulmuş cilt bariyerini onarma"
        ],
        "kombinasyon_ve_uyarilar": "Kortizonlu medikal krem kullanılıyorsa, önce medikal krem sürülür; 15-20 dakika sonra üzerine bu bariyer krem uygulanarak nem kilitlenir. Duşta sabun yerine Stelatopia Temizleme Yağı ile kombine edilmesi şarttır.",
        "etken_maddeler": ["Organik Ayçiçeği Oleodistilatı", "Bioécolia (Prebiyotik)", "Avokado Perseose"],
        "tags": ["atopik", "egzama", "kaşıntı", "kuru cilt", "bebek", "krem"]
    },
    {
        "id": "mustela-stelatopia-plus-300ml",
        "name": "Mustela Stelatopia+ Lipit Yenileyici Krem",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Atopik & Çok Kuru Cilt",
        "brand": "Mustela",
        "size": "300 ml",
        "form": "Krem (Pompalı Şişe)",
        "image": "images/mustela/mustela-stelatopia-plus-lipid-replenishing-cream-300ml.jpeg",
        "cilt_tipleri": ["Çok Kuru Cilt", "Atopik Cilt", "Egzamaya Meyilli Cilt"],
        "yas_grubu": "Doğumdan itibaren (Yenidoğan dahil), Çocuklar ve Tüm Aile",
        "kimler_kullanamaz": "Açık yara veya sızıntılı cilt lezyonlarına doğrudan sürülmez.",
        "nasil_kullanilir": "Günde 2 kez tüm vücuda pompa ile kolayca uygulanır. Geniş vücut yüzeyleri için pratik aile boyudur.",
        "hangi_sikayetle_gelene_verilir": [
            "Geniş vücut yüzeyinde yoğun kuruluk",
            "Kronik atopik kaşıntı nöbetleri",
            "Bebek ve çocuklarda banyo sonrası gerginlik hissi"
        ],
        "kombinasyon_ve_uyarilar": "Kalıp sabun veya köpüren deterjan bazlı jellerle yıkanmamalı, Stelatopia Temizleme Yağı ile birlikte kullanılmalıdır.",
        "etken_maddeler": ["Organik Ayçiçeği Oleodistilatı", "Bioécolia Prebiyotik"],
        "tags": ["atopik", "pompalı", "aile boyu", "kuru cilt", "kaşıntı"]
    },
    {
        "id": "mustela-stelatopia-cleansing-oil-500ml",
        "name": "Mustela Stelatopia Temizleme Yağı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Atopik & Çok Kuru Cilt",
        "brand": "Mustela",
        "size": "500 ml",
        "form": "Yıkama Yağı (Pompalı)",
        "image": "images/mustela/mustela-stelatopia-cleansing-oil-500ml.jpeg",
        "cilt_tipleri": ["Çok Kuru Cilt", "Atopik Cilt", "Banyo Suyu Kirecine Hassas Ciltler"],
        "yas_grubu": "Doğumdan itibaren (Yenidoğan dahil), Çocuk ve Yetişkinler",
        "kimler_kullanamaz": "Göz içine direkt temas ettirilmemelidir (göz yakmaz formüldür ama doğrudan temas önerilmez).",
        "nasil_kullanilir": "Islak cilde banyoda nazikçe sürülüp durulanır veya bebek banyo küveti suyuna 2-3 pompa sıkılarak karıştırılır. Ovalamadan, havluyla tampon hareketlerle kurulanmalıdır.",
        "hangi_sikayetle_gelene_verilir": [
            "Banyo sonrası aşırı kuruyan, gerilen ve kızaran cilt",
            "Şebeke suyunun kirecinden tahriş olan hassas tenler",
            "Atopik bebeklerde sabunsuz nazik yıkama ihtiyacı"
        ],
        "kombinasyon_ve_uyarilar": "Banyo çıkışında hemen Stelatopia+ Lipit Krem ile devam edilmelidir. Küvet zeminini kayganlaştırabileceğinden dikkat edilmelidir.",
        "etken_maddeler": ["Ayçiçeği Yağı Distilatı", "Avokado Perseose", "Gliserin"],
        "tags": ["banyo yağı", "atopik", "kireç önleyici", "duş yağı", "bebek"]
    },
    {
        "id": "mustela-stelatopia-cleansing-gel-200ml",
        "name": "Mustela Stelatopia Temizleme Jeli",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Atopik & Çok Kuru Cilt",
        "brand": "Mustela",
        "size": "200 ml",
        "form": "Jel (Tüp)",
        "image": "images/mustela/mustela-stelatopia-cleansing-gel-200ml.jpeg",
        "cilt_tipleri": ["Atopik Cilt", "Kuru Cilt"],
        "yas_grubu": "Doğumdan itibaren bebekler ve çocuklar",
        "kimler_kullanamaz": "Bilinen kontrendikasyonu yoktur.",
        "nasil_kullanilir": "Elde köpürtülüp ıslak saç ve vücuda nazikçe uygulanır, ardından durulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Atopik bebekte hem saç hem vücut için tek tüp arayanlar",
            "Seyahatte veya çantada pratik atopik yıkama jeli isteyenler"
        ],
        "kombinasyon_ve_uyarilar": "Parfüm içermez. Yıkama sonrası Stelatopia krem uygulanması zorunludur.",
        "etken_maddeler": ["Ayçiçeği Oleodistilatı", "Avokado Perseose"],
        "tags": ["jel", "atopik", "saç vücut", "parfümsüz"]
    },
    {
        "id": "mustela-stelatopia-emollient-face-cream-40ml",
        "name": "Mustela Stelatopia Emolyent Yüz Kremi",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Atopik & Çok Kuru Cilt",
        "brand": "Mustela",
        "size": "40 ml",
        "form": "Yüz Kremi (Kutu / Tüp)",
        "image": "images/mustela/mustela-stelatopia-emollient-face-cream-40ml.jpeg",
        "cilt_tipleri": ["Yüzünde Atopi Olan Ciltler", "Kuru Yanaklar", "Göz Kapağı Kuruluğu"],
        "yas_grubu": "Doğumdan itibaren bebekler ve çocuklar",
        "kimler_kullanamaz": "Gözün içine kaçırılmamalıdır.",
        "nasil_kullanilir": "Sabah ve akşam temiz yüze ve göz kapaklarına nazikçe sürülür. Yağlı his bırakmaz, hızlı emilir.",
        "hangi_sikayetle_gelene_verilir": [
            "Bebeğin yanaklarında kızarıklık, pütürlülük ve sertleşme",
            "Soğuk havada rüzgar yanığı gibi kızaran çocuk yüzleri",
            "Göz kapağı çevresinde atopik pullanma"
        ],
        "kombinasyon_ve_uyarilar": "Yetişkinlerde de göz çevresi ve burun kenarı atopik kızarıklıklarında güvenle verilebilir.",
        "etken_maddeler": ["Ayçiçeği Oleodistilatı", "Seramidler", "Meyan Kökü Özü"],
        "tags": ["yüz kremi", "yanak kızarıklığı", "atopik yüz", "göz kapağı"]
    },
    {
        "id": "mustela-stelatopia-intense-30ml",
        "name": "Mustela Stelatopia Intense Egzama & Kaşıntı Kremi",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Atopik & Medikal Bakım",
        "brand": "Mustela",
        "size": "30 ml",
        "form": "Lokal Krem (Kutu / Tüp)",
        "image": "images/mustela/mustela-stelatopia-intense-30ml.jpeg",
        "cilt_tipleri": ["Alevlenme Dönemindeki Atopik Cilt", "Akut Egzama Plakları"],
        "yas_grubu": "1 aydan büyük bebekler, çocuklar ve yetişkinler",
        "kimler_kullanamaz": "Enfekte olmuş iltihaplı açık yaralar.",
        "nasil_kullanilir": "Sadece lezyonlu ve kızarık bölgelere günde 2-3 kez lokal olarak uygulanır. Kortizonsuzdur.",
        "hangi_sikayetle_gelene_verilir": [
            "Kortizon kullanmak istemeyen ama egzaması alevlenen hastalar",
            "Dirsek içi, diz arkası ve boyundaki akut kızarık kaşıntı odakları"
        ],
        "kombinasyon_ve_uyarilar": "İçeriğindeki %7 Ectoin hücresel kalkan oluşturur. Medikal cihaz statüsündedir. Normal nemlendirici gibi tüm vücuda değil, sadece kızarık plaklara sürülür.",
        "etken_maddeler": ["%7 Ectoin", "Seramidler", "Zeytinyağı"],
        "tags": ["yoğun bakım", "kızarıklık", "kaşıntı giderici", "ectoin", "kortizonsuz egzama"]
    },

    # --- PİŞİK & ONARICI BAKIM ---
    {
        "id": "mustela-vitamin-barrier-cream-123",
        "name": "Mustela Vitamin Barrier Cream 1-2-3 Pişik Kremi",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Pişik & Alt Değiştirme",
        "brand": "Mustela",
        "size": "50 ml / 100 ml",
        "form": "Bariyer Krem (Kutu / Tüp)",
        "image": "images/mustela/mustela-vitamin-barrier-cream-1-2-3.jpeg",
        "cilt_tipleri": ["Bez Bölgesi", "Hassas ve Pişiğe Meyilli Bebek Cildi"],
        "yas_grubu": "Doğumdan itibaren tüm bebekler",
        "kimler_kullanamaz": "Mantar (kandida) enfeksiyonu gelişmiş iltihaplı pişiklerde doktor antifungal kremle birlikte vermelidir.",
        "nasil_kullanilir": "Her bez değişiminde, temizlenmiş ve kurulanmış bez bölgesine kalın bir tabaka halinde uygulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Bez bölgesinde kızarıklık, yanma ve pişik",
            "Diş çıkarma veya antibiyotik kullanımı döneminde asidik dışkı pişiğini önleme"
        ],
        "kombinasyon_ve_uyarilar": "%10 Çinko Oksit içerir, bariyer kalkanı oluşturarak idrar ve dışkının cilde temasını keser. Çinko ciltten silinirken ovulmamalı, ılık su veya temizleme suyu ile nazikçe arındırılmalıdır.",
        "etken_maddeler": ["%10 Çinko Oksit", "Avokado Perseose", "Alkasyea Oxeoline", "Ayçiçeği Yağı Distilatı"],
        "tags": ["pişik", "çinko oksit", "bez bölgesi", "123", "bariyer"]
    },
    {
        "id": "mustela-cicastela-moisture-recovery-cream-40ml",
        "name": "Mustela Cicastela Onarıcı Bakım Kremi",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Onarıcı & SOS Bakım",
        "brand": "Mustela",
        "size": "40 ml",
        "form": "SOS Onarıcı Krem (Kutu / Tüp)",
        "image": "images/mustela/mustela-cicastela-moisture-recovery-cream-40ml.jpeg",
        "cilt_tipleri": ["Tahriş Olmuş Cilt", "Sıyrıklar", "Ağız Çevresi Tükürük Tahrişi", "Böcek Isırığı"],
        "yas_grubu": "Doğumdan itibaren bebekler, çocuklar ve yetişkinler",
        "kimler_kullanamaz": "Derin açık kanamalı cerrahi yaralar.",
        "nasil_kullanilir": "Temiz ve kuru tahrişli bölgeye günde 2 kez uygulanır. İnce uçlu aplikatörü ile hedefe yönelik sürülür.",
        "hangi_sikayetle_gelene_verilir": [
            "Emzik/diş çıkarma kaynaklı ağız kenarı tükürük egzaması",
            "Bebek boyun ve kol kıvrımlarındaki sürtünme pişiği",
            "Yüzeysel çizikler, böcek ısırığı sonrası kaşıntı ve kızarıklık"
        ],
        "kombinasyon_ve_uyarilar": "Bakır ve Çinko içeriği antibakteriyel koruma sağlar. İz kalmasını önler.",
        "etken_maddeler": ["Avokado Perseose", "Bakır & Çinko", "Hyalüronik Asit", "Pantenol"],
        "tags": ["cica", "onarıcı", "çizik", "tükürük tahrişi", "kurtarıcı krem"]
    },
    {
        "id": "mustela-cradle-cap-cream-40ml",
        "name": "Mustela Konak Önleyici Bakım Kremi",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Saç Derisi & Konak",
        "brand": "Mustela",
        "size": "40 ml",
        "form": "Krem (Kutu / Tüp)",
        "image": "images/mustela/mustela-cradle-cap-cream-40ml.jpeg",
        "cilt_tipleri": ["Konaklı Saç Derisi", "Kabuklanan Bebek Başı"],
        "yas_grubu": "Doğumdan itibaren yenidoğan ve bebekler",
        "kimler_kullanamaz": "Bilinen kısıtlama yoktur.",
        "nasil_kullanilir": "Akşam yatmadan önce bebeğin saç derisindeki kabuklu bölgelere hafifçe masaj yaparak sürülür, gece boyunca bırakılır. Sabah banyoda Mustela Köpük Şampuan ile yıkanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Bebeğin kafasında kalın sarı pul pul konak tabakası",
            "Konakların tekrarlamasını önleme ihtiyacı"
        ],
        "kombinasyon_ve_uyarilar": "ASLA kabuklar tırnakla veya sert tarakla kazınmamalıdır! Bu krem kabukları yumuşatır, Köpük Şampuan ile yıkanınca kendiliğinden dökülür.",
        "etken_maddeler": ["Avokado Polifenolleri", "Patentli Yatıştırıcı Kompleks"],
        "tags": ["konak", "saç derisi", "sarı kabuk", "bebek başı"]
    },
    {
        "id": "mustela-foam-shampoo-for-newborns-150ml",
        "name": "Mustela Yenidoğan Konak Önleyici Köpük Şampuan",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Saç Derisi & Konak",
        "brand": "Mustela",
        "size": "150 ml",
        "form": "Köpük Şampuan (Pompalı)",
        "image": "images/mustela/mustela-foam-shampoo-for-newborns-150ml.jpeg",
        "cilt_tipleri": ["Yenidoğan Saç Derisi", "Konak Görülen Saçlar"],
        "yas_grubu": "Doğumdan itibaren (0-6 ay)",
        "kimler_kullanamaz": "Göz yakmaz.",
        "nasil_kullanilir": "Islak saça 1-2 pompa köpük sıkılır, 1-2 dakika saç derisinde bekletildikten sonra nazikçe durulanır.",
        "hangi_sikayetle_gelene_verilir": [
            "Yenidoğanda konak başlangıcı veya konağın önlenmesi",
            "Bebeğin başını ovalamadan kolayca köpükle yıkamak isteyen anneler"
        ],
        "kombinasyon_ve_uyarilar": "İçeriğindeki hafif salisilik asit mikro orandadır ve kabukları eritir. Konak Kremi ile birlikte 'tam çözüm' paketidir.",
        "etken_maddeler": ["Avokado Polifenolleri", "Hafif Salisilik Asit"],
        "tags": ["köpük şampuan", "konak şampuanı", "yenidoğan"]
    },

    # --- GÜNLÜK BAKIM (NORMAL & KURU CİLT) ---
    {
        "id": "mustela-gentle-cleansing-gel-500ml",
        "name": "Mustela Gentle Cleansing Gel Yenidoğan Şampuanı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Günlük Temizlik & Saç/Vücut",
        "brand": "Mustela",
        "size": "500 ml",
        "form": "Jel Şampuan (Pompalı)",
        "image": "images/mustela/mustela-gentle-cleansing-gel-500ml.jpeg",
        "cilt_tipleri": ["Normal Cilt", "Hassas Bebek Cildi"],
        "yas_grubu": "Doğumdan itibaren tüm bebekler",
        "kimler_kullanamaz": "Göz yakmaz (Tear-free).",
        "nasil_kullanilir": "Islak saç ve vücuda uygulanır, köpürtülüp durulanır. Günlük banyo için uygundur.",
        "hangi_sikayetle_gelene_verilir": [
            "Hastaneden yeni çıkan bebeğe ilk banyo şampuanı arayanlar",
            "Hem saçı hem vücudu tek ürünle nazikçe yıkamak isteyenler"
        ],
        "kombinasyon_ve_uyarilar": "Sabun içermez, cildi kurutmaz. Banyo sonrası Hydra Bébé Vücut Losyonu ile tamamlanması önerilir.",
        "etken_maddeler": ["Avokado Perseose", "Vitamin B5"],
        "tags": ["yenidoğan şampuanı", "temizleme jeli", "en çok satan", "günlük"]
    },
    {
        "id": "mustela-hydra-bebe-body-lotion-300ml",
        "name": "Mustela Hydra Bébé Nemlendirici Vücut Losyonu",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Günlük Nemlendirme",
        "brand": "Mustela",
        "size": "300 ml",
        "form": "Losyon (Pompalı)",
        "image": "images/mustela/mustela-hydra-bebe-body-lotion-300ml.jpeg",
        "cilt_tipleri": ["Normal Cilt"],
        "yas_grubu": "Doğumdan itibaren bebekler ve çocuklar",
        "kimler_kullanamaz": "Aşırı atopik döküntülü ciltlerde yetersiz kalabilir, atopik ciltlere Stelatopia önerilir.",
        "nasil_kullanilir": "Sabah ve akşam tüm vücuda masajla uygulanır. Akışkan hafif dokuludur.",
        "hangi_sikayetle_gelene_verilir": [
            "Bebeğin günlük ipeksi cilt nemini korumak isteyenler",
            "Banyo sonrası hafif ve taze bebek kokulu losyon isteyenler"
        ],
        "kombinasyon_ve_uyarilar": "Cilt bariyerini %97 doğal içerikle destekler. Yüz için Hydra Bébé Yüz Kremi ile eşleştirilir.",
        "etken_maddeler": ["Avokado Perseose", "Ayçiçeği Yağı", "E Vitamini"],
        "tags": ["vücut losyonu", "hydra bebe", "günlük nemlendirici"]
    },
    {
        "id": "mustela-nourishing-cream-with-cold-cream-40ml",
        "name": "Mustela Cold Cream İçeren Besleyici Yüz Kremi",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Kuru Cilt & Kış Bakımı",
        "brand": "Mustela",
        "size": "40 ml",
        "form": "Besleyici Krem (Kutu / Tüp)",
        "image": "images/mustela/mustela-nourishing-cream-with-cold-cream-40ml.jpeg",
        "cilt_tipleri": ["Kuru Cilt", "Soğuktan Çatlayan Yanaklar"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Bilinen kısıtlama yoktur.",
        "nasil_kullanilir": "Sabah ve akşam, özellikle dışarı çıkmadan önce yüze sürülür.",
        "hangi_sikayetle_gelene_verilir": [
            "Kışın soğuk hava ve rüzgardan kızaran, kuruyan yanaklar",
            "Yapısal olarak kuru ciltli bebekler"
        ],
        "kombinasyon_ve_uyarilar": "İçeriğindeki organik balmumu cildin üzerinde rüzgara ve soğuğa karşı koruyucu bir tabaka oluşturur.",
        "etken_maddeler": ["Cold Cream (Organik Balmumu)", "Avokado Perseose", "Seramidler"],
        "tags": ["cold cream", "kuru cilt", "kış kremi", "balmumu"]
    },
    {
        "id": "mustela-gel-arnica-calendula-bio-100ml",
        "name": "Mustela Organik Arnica & Calendula Jel",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Darbe & Morluk SOS",
        "brand": "Mustela",
        "size": "100 ml",
        "form": "Jel (Pompalı)",
        "image": "images/mustela/mustela-gel-arnica-calendula-bio-100ml.jpeg",
        "cilt_tipleri": ["Tüm Cilt Tipleri (Darbe Alan Bölge)"],
        "yas_grubu": "9 aydan büyük bebekler, çocuklar ve yetişkinler",
        "kimler_kullanamaz": "9 aydan küçük bebeklerde, açık yaralarda ve göz çevresinde KULLANILMAZ.",
        "nasil_kullanilir": "Darbe veya çarpma anından hemen sonra etkilenen bölgeye günde 2-3 kez hafifçe masaj yaparak sürülür.",
        "hangi_sikayetle_gelene_verilir": [
            "Düşme, çarpma sonrası şişlik, morarma ve ağrı riski",
            "Yürümeye yeni başlayan aktif çocukların ev kazaları"
        ],
        "kombinasyon_ve_uyarilar": "Arnica montana morluk oluşumunu engeller, Calendula yatıştırır. Açık kanamalı yaraya sürülmemelidir.",
        "etken_maddeler": ["Organik Arnica Çiçek Özü", "Organik Calendula (Aynısefa)"],
        "tags": ["arnica", "morluk", "düşme çarpma", "şişlik"]
    },
    {
        "id": "mustela-maternite-stretch-marks-oil-bio-105ml",
        "name": "Mustela Maternité Organik Çatlak Bakım Yağı",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Anne & Hamilelik",
        "brand": "Mustela",
        "size": "105 ml",
        "form": "Vücut Yağı (Şişe)",
        "image": "images/mustela/mustela-maternite-stretch-marks-oil-bio-105ml.jpeg",
        "cilt_tipleri": ["Gerilen Hamile Cildi", "Çatlağa Meyilli Cilt"],
        "yas_grubu": "Hamileler ve Emziren Anneler",
        "kimler_kullanamaz": "Sezaryen dikişi tam kapanmadan yara üzerine sürülmez.",
        "nasil_kullanilir": "Hamileliğin ilk aylarından itibaren sabah-akşam karın, basen, kalça ve göğüslere dairesel hareketlerle masaj yapılarak sürülür.",
        "hangi_sikayetle_gelene_verilir": [
            "Hamilelikte karın büyümesine bağlı çatlak oluşumunu önleme",
            "Hızlı kilo alıp verme döneminde cilt elastikiyetini artırma"
        ],
        "kombinasyon_ve_uyarilar": "%100 doğal içeriklidir. Emzirme döneminde göğüs ucuna sürülürse emzirmeden önce silinmelidir.",
        "etken_maddeler": ["Organik Avokado Yağı", "Maracuja (Çarkıfelek Meyvesi) Yağı", "Organik Ayçiçek Yağı"],
        "tags": ["çatlak yağı", "hamile", "anne", "maternite", "organik"]
    },
    {
        "id": "musti-eau-de-soin-50ml",
        "name": "Musti Eau de Soin Alkolsüz Bebek Parfümü",
        "category": "dermo",
        "category_name": "Kozmetik & Dermokozmetik",
        "sub_category": "Bebek Parfümü",
        "brand": "Mustela",
        "size": "50 ml",
        "form": "Parfüm (Kutu / Cam Şişe)",
        "image": "images/mustela/musti-eau-de-soin-delicate-fragrance-50ml.jpeg",
        "cilt_tipleri": ["Hassas Bebek Cildi ve Giysileri"],
        "yas_grubu": "Doğumdan itibaren",
        "kimler_kullanamaz": "Yüze veya göze direkt sıkılmaz.",
        "nasil_kullanilir": "Bebeğin boynuna, saçına veya kıyafetlerine nazikçe sıkılır.",
        "hangi_sikayetle_gelene_verilir": [
            "Bebek için alkolsüz, güvenli ve hafif narenciye kokulu parfüm arayanlar",
            "Hediye seti arayanlar"
        ],
        "kombinasyon_ve_uyarilar": "Alkol içermez, cildi kurutmaz ve alerji yapmaz.",
        "etken_maddeler": ["Papatya ve Ihlamur Özleri", "Mavi Kantaron"],
        "tags": ["parfüm", "alkolsüz", "musti", "bebek kokusu"]
    },

    # --- BESİN TAKVİYELERİ & VİTAMİNLER (GELECEK KATEGORİ TEMSİLCİLERİ) ---
    {
        "id": "ocean-b12-sprey-1000mcg",
        "name": "Ocean Methyl B12 Dilaltı Sprey 1000 mcg",
        "category": "vitamin",
        "category_name": "Besin Takviyeleri & Vitaminler",
        "sub_category": "B Vitamini & Enerji",
        "brand": "Orzax / Ocean",
        "size": "20 ml (160 Puf)",
        "form": "Dilaltı Sprey",
        "image": "",
        "cilt_tipleri": ["Tüm Bireyler (İçsel Takviye)"],
        "yas_grubu": "11 yaş ve üzeri bireyler ile yetişkinler",
        "kimler_kullanamaz": "Kobalt veya B12 alerjisi olanlar.",
        "nasil_kullanilir": "Günde 1 puf dil altına püskürtülür. 45 saniye yutkunmadan dil altında bekletilir, ardından yutulur. Sabah aç veya tok alınabilir.",
        "hangi_sikayetle_gelene_verilir": [
            "Sürekli yorgunluk, halsizlik ve enerji düşüklüğü",
            "Konsantrasyon eksikliği, unutkanlık ve kafa sisi",
            "Metformin (diyabet ilacı) veya mide koruyucu kullananlarda emilim azlığı",
            "Vegan veya vejetaryen beslenenler"
        ],
        "kombinasyon_ve_uyarilar": "Metilkobalamin formundadır, karaciğerde dönüşüme ihtiyaç duymadan doğrudan aktif formdadır. Mide koruyucular B12 emilimini bozduğu için dilaltı sprey formu haplara göre çok daha üstün emilir.",
        "etken_maddeler": ["1000 mcg Metilkobalamin (Aktif B12)"],
        "tags": ["b12", "dilaltı sprey", "metilkobalamin", "yorgunluk", "unutkanlık"]
    },
    {
        "id": "ocean-d3k2-damla-20ml",
        "name": "Ocean Vitamin D3 K2 Damla",
        "category": "vitamin",
        "category_name": "Besin Takviyeleri & Vitaminler",
        "sub_category": "D Vitamini & Kemik Sağlığı",
        "brand": "Orzax / Ocean",
        "size": "20 ml (Damla)",
        "form": "Zeytinyağlı Sıvı Damla",
        "image": "",
        "cilt_tipleri": ["Tüm Bireyler (İçsel Takviye)"],
        "yas_grubu": "11 yaş üzeri ve yetişkinler (Bebeklerde sadece D3 formu tercih edilir)",
        "kimler_kullanamaz": "Kan sulandırıcı (Coumadin/Warfarin) kullanan hastalar K2 vitamini içerdiği için doktora danışmadan KULLANAMAZ.",
        "nasil_kullanilir": "Günde 1 damla (1000 IU D3 + 22.5 mcg K2) yağ içeren bir öğünün (örn: kahvaltı veya öğle yemeği) hemen ardından ekmeğe veya kaşığa damlatılarak alınır.",
        "hangi_sikayetle_gelene_verilir": [
            "Bağışıklık düşüklüğü, sık enfeksiyon geçirme",
            "Kemik ve eklem ağrıları, osteoporoz riski",
            "Güneş görmeyen ofis çalışanlarında kronik halsizlik"
        ],
        "kombinasyon_ve_uyarilar": "K2 vitamini (Menakinon-7), kalsiyumun damar duvarlarında birikmesini önleyip doğrudan kemik ve dişlere yönlendirir. D vitamini yağda eridiği için yağlı yemekle alınmalıdır.",
        "etken_maddeler": ["1000 IU Vitamin D3 (Kolekalsiferol)", "22.5 mcg Vitamin K2 (MK-7)", "Hakiki Zeytinyağı"],
        "tags": ["d vitamini", "d3k2", "bağışıklık", "kemik", "damla"]
    },

    # --- AĞIZ & DİŞ SAĞLIĞI (GELECEK KATEGORİ TEMSİLCİSİ) ---
    {
        "id": "sensodyne-hizli-rahatlama-75ml",
        "name": "Sensodyne Hızlı Rahatlama Diş Macunu",
        "category": "dental",
        "category_name": "Ağız & Diş Sağlığı",
        "sub_category": "Hassasiyet Karşıtı",
        "brand": "Sensodyne",
        "size": "75 ml",
        "form": "Diş Macunu",
        "image": "",
        "cilt_tipleri": ["Hassas Diş ve Diş Etleri"],
        "yas_grubu": "12 yaş ve üzeri",
        "kimler_kullanamaz": "12 yaş altı çocuklarda diş hekimi önermedikçe kullanılmaz.",
        "nasil_kullanilir": "Günde 2 kez dişler fırçalanır. Hızlı rahatlama için parmak ucuna az miktarda alınıp hassas dişin dibine 1 dakika doğrudan masaj yapılabilir.",
        "hangi_sikayetle_gelene_verilir": [
            "Soğuk su, dondurma veya sıcak çay içerken dişte ani sızlama",
            "Diş eti çekilmesine bağlı kök yüzeyi hassasiyeti"
        ],
        "kombinasyon_ve_uyarilar": "Stannöz florür içerir, dentin kanallarını tıkayarak sinire giden ağrı iletimini 60 saniyede keser. Sert kıllı fırça yerine soft fırça ile kombine edilmelidir.",
        "etken_maddeler": ["Stannous Fluoride (Stannöz Florür)"],
        "tags": ["diş macunu", "hassasiyet", "hızlı rahatlama", "sızlama"]
    }
]

# Write to products.json
with open('/home/arekros/Projects/uygulama projesi/app/data/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"Başarıyla {len(products)} ürün JSON'a aktarıldı.")
