/**
 * Emre Ege Eczanesi — Klinik Dermokozmetik Portalı & Stüdyo
 * Modern, Yüksek Hızlı Vanilla JavaScript Mantığı
 */

(function () {
  'use strict';

  // --- UYGULAMA DURUMU (APP STATE) ---
  const state = {
    products: [],
    customProducts: [],
    activeBrand: 'all',
    activeRoutine: 'all',
    searchQuery: '',

    selectedProduct: null,
    lightboxCallback: null,

    shelfWizard: {
      step: 'upload',
      detectedProducts: [],
      detectedBrand: 'Genel',
      shelfPreview: '',
      queue: [],
      currentIndex: 0,
      completed: new Set()
    }
  };

  // --- YARDIMCI FONKSİYONLAR ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => { toast.classList.remove('active'); }, 2800);
  }

  // --- VERİ YÜKLEME ---
  function loadPersistedData() {
    try {
      const saved = localStorage.getItem('user_custom_products_v1');
      if (saved) state.customProducts = JSON.parse(saved);
    } catch (e) {
      console.error('Özel ürünler yüklenemedi:', e);
    }
  }

  function getEffectiveProducts() {
    const base = window.PRODUCTS_DATA || [];
    const combined = [...state.customProducts, ...base];
    const seen = new Set();
    const unique = [];
    for (const p of combined) {
      if (p && p.id && !seen.has(p.id)) {
        seen.add(p.id);
        unique.push(p);
      }
    }
    return unique;
  }

  // =========================================================================
  // BÖLÜM 1: OTOMATİK 7 BLOKLU KLİNİK KÜNYE MOTORU (0 SANİYE, ELLE DOLDURMA YOK)
  // =========================================================================
  function generateClinicalProfile(brand, name, urunTipi, size, subcat, category) {
    const cleanBrand = (brand || 'Genel').trim();
    const cleanName = (name || 'Ürün').trim();
    const brandLower = cleanBrand.toLowerCase();
    const nameLower = cleanName.toLowerCase();
    const tipoLower = (urunTipi || '').toLowerCase();

    const typeIcons = {
      'Yüz & Vücut Temizleyici': { icon: '🧼', step: '1. Adım: Cilt Temizliği & Arındırma' },
      'Nemlendirici & Bariyer Krem': { icon: '🧴', step: '3. Adım: Nemlendirme & Bariyer Onarımı' },
      'Serum & Konsantre Bakım': { icon: '💧', step: '2. Adım: Hedefe Yönelik Konsantre Bakım' },
      'Gıda Takviyesi & Vitamin': { icon: '💊', step: 'Destek: Dahili Besin Takviyesi' },
      'Özel & SOS Onarıcı': { icon: '🩹', step: '4. Adım: Lokal / SOS Yoğun İyileştirme' },
      'Şampuan & Saç Bakımı': { icon: '🚿', step: '1. Adım: Saç ve Saç Derisi Temizliği' },
      'Vücut & Masaj Yağı': { icon: '✨', step: 'Tamamlayıcı: Besleyici Masaj & Bakım' },
      'Ağız & Diş Sağlığı': { icon: '🪥', step: 'Ağız & Diş Bakım Protokolü' }
    };
    const typeMeta = typeIcons[urunTipi] || { icon: '🏷️', step: 'Kişisel Cilt Rutini' };

    let ciltTipleri = ['Tüm Cilt Tipleri'];
    let yasKriterleri = {
      yenidogan_uygun_mu: false,
      bebek_uygun_mu: false,
      cocuk_uygun_mu: true,
      ergen_uygun_mu: true,
      yetiskin_uygun_mu: true,
      geriatri_uygun_mu: true,
      gebelik_guvenli_mi: true,
      emzirme_guvenli_mi: true,
      yas_aciklama_detay: 'Ergen ve yetişkin kullanımı için uygundur.'
    };
    let guvenlik = {
      kontrendikasyonlar: 'Açık yaralara veya sızıntılı enfekte dokulara doğrudan uygulanmaz.',
      goz_cevresi_temas: 'Göz mukozası ile doğrudan temastan kaçınınız. Temas halinde bol su ile durulayınız.',
      doktora_yonlendirme: 'Ciltte ani kabarma, şiddetli yanma veya 2 haftayı geçen inatçı reaksiyonlarda hekime yönlendiriniz.'
    };
    let hastaSikayeti = {
      hasta_cumlesi: 'Cilt bariyerimi güçlendirecek ve günlük bakımımı sağlayacak güvenilir bir ürün arıyorum.',
      eczaci_sorusu: 'Cildinizde kuruluk, sivilce veya hassasiyet şikayetiniz ne zamandır devam ediyor?',
      secim_nedeni: 'Cilt florasını bozmadan bariyeri onaran yüksek toleranslı dermokozmetik formülasyon.',
      arama_etiketleri: [cleanName.toLowerCase(), cleanBrand.toLowerCase(), tipoLower]
    };
    let formulasyon = {
      aktif_bilesenler: ['3 Temel Seramid', 'Hyalüronik Asit'],
      rozetler: ['Dermatolojik Olarak Test Edildi', 'Parfümsüz', 'Komedojenik Değildir'],
      doku: 'Hafif, yapışkan his bırakmayan konforlu doku.',
      fizyolojik_ph: '5.5'
    };
    let kullanimProtokolu = {
      rutin_siralamasi: typeMeta.step,
      zaman_ve_siklik: 'Günde 2 kez (Sabah - Akşam)',
      miktar: 'Yeterli miktar (1-2 pompa veya nohut büyüklüğü)',
      uygulama_sekli: 'Temizlenmiş cilde nazik dairesel hareketlerle masaj yapılarak uygulanır.',
      beklenen_sonuc: 'İlk uygulamada ferahlama ve nem artışı; 2-4 haftalık düzenli kullanımda güçlü bariyer.'
    };
    let kombinasyonlar = {
      tamamlayici_kombinler: [],
      yasakli_cakismalar: []
    };
    let muadilRehberi = {
      en_yakin_muadil: 'Eşdeğer klinik dermokozmetik formülasyonlar',
      alternatif_fark_notu: 'Klinik saflık ve yüksek biyoyararlanımlı aktif içerikleriyle ön plana çıkar.'
    };

    // ─── CERAVE ÖZEL KURALLARI ───
    if (brandLower.includes('cerave') || nameLower.includes('cerave')) {
      if (nameLower.includes('akne') || nameLower.includes('blemish')) {
        ciltTipleri = ['Yağlı Ciltler', 'Akneye Eğilimli Ciltler', 'Pürüzlü Ciltler'];
        yasKriterleri.yas_aciklama_detay = '12 yaş ve üzeri ergenler ile yetişkinlerin kullanımına uygundur.';
        hastaSikayeti.hasta_cumlesi = 'Yüzümde sürekli sivilce ve siyah noktalar çıkıyor, gün içinde çok yağlanıp parlıyor.';
        hastaSikayeti.eczaci_sorusu = 'Sivilceleriniz iltihaplı kistik mi yoksa yüzeysel siyah nokta/komedon şeklinde mi?';
        hastaSikayeti.secim_nedeni = '%2 Salisilik Asit gözenek içindeki sebumu eritir; hektonit kili fazla yağı çeker, seramidler bariyeri dengeler.';
        hastaSikayeti.arama_etiketleri = ['akne', 'sivilce', 'siyah nokta', 'salisilik asit', 'gözenek', 'yağlanma', 'parlama'];
        formulasyon.aktif_bilesenler = ['%2 Salisilik Asit (BHA)', 'Hektonit Kili', 'Niasinamid (B3 Vitamini)', '3 Temel Seramid'];
        formulasyon.rozetler = ['Salisilik Asit %2', 'Gözenek Arındırıcı Kil', 'Komedojenik Değildir', 'Parfümsüz'];
        formulasyon.doku = 'Ferahlatıcı, köpüren jel doku.';
        muadilRehberi.en_yakin_muadil = 'La Roche-Posay Effaclar Jel / Bioderma Sébium Gel Actif';
        muadilRehberi.alternatif_fark_notu = 'Effaclar kurutabilirken, CeraVe 3 temel seramid sayesinde cilt bariyerini sıyırmadan arındırır.';
      } else if (nameLower.includes('nemlendiren') || nameLower.includes('hydrating')) {
        ciltTipleri = ['Kuru Ciltler', 'Çok Kuru Ciltler', 'Normal Ciltler', 'Hassas Ciltler'];
        yasKriterleri.bebek_uygun_mu = true;
        yasKriterleri.yas_aciklama_detay = 'Bebeklerden geriatrik döneme kadar tüm yaş gruplarında güvenle kullanılabilir.';
        hastaSikayeti.hasta_cumlesi = 'Yüzümü suyla bile yıkasam hemen geriliyor, pul pul dökülüyor ve kuruluktan kaşınıyor.';
        hastaSikayeti.secim_nedeni = 'Köpüksüz kremsi jel teknolojisi hidrolipidik tabakayı korur; Hyalüronik asit ve MVE ile yıkarken nemlendirir.';
        formulasyon.aktif_bilesenler = ['3 Temel Seramid (1, 3, 6-II)', 'Hyalüronik Asit', 'MVE Teknolojisi', 'Gliserin'];
        formulasyon.doku = 'Kremsi, köpürmeyen ipeksi losyon kıvamı.';
        muadilRehberi.en_yakin_muadil = 'Cetaphil Nazik Cilt Temizleyici / Avene Tolerance Temizleme Losyonu';
        muadilRehberi.alternatif_fark_notu = 'MVE teknolojisi aktif nemlendirici ajanların gün boyu kademeli salınmasını sağlar.';
      } else if (nameLower.includes('retinol')) {
        ciltTipleri = ['Akne İzi Olan Ciltler', 'Geniş Gözenekli Ciltler', 'Cilt Tonu Eşitsizliği'];
        hastaSikayeti.hasta_cumlesi = 'Sivilcelerim geçti ama kırmızı-kahverengi lekeleri kaldı, gözeneklerim çok belirgin.';
        hastaSikayeti.secim_nedeni = 'Kapsüllenmiş Retinol cildi soymadan hücre yenilenmesini hızlandırır; Meyan Kökü özü lekeleri açar.';
        formulasyon.aktif_bilesenler = ['Kapsüllenmiş Retinol', 'Meyan Kökü Ekstresi', 'Niasinamid', '3 Temel Seramid'];
        kullanimProtokolu.zaman_ve_siklik = 'Günde 1 kez (Sadece akşamları)';
        kombinasyonlar.yasakli_cakismalar = ['Aynı akşamda AHA/BHA asitli serumlar ve C vitamini.'];
        muadilRehberi.en_yakin_muadil = 'La Roche-Posay Retinol B3 Serum';
      }
    }

    // ─── AVÈNE ÖZEL KURALLARI ───
    if (brandLower.includes('avene') || brandLower.includes('avène') || nameLower.includes('avene') || nameLower.includes('avène')) {
      if (nameLower.includes('termal') || nameLower.includes('thermal')) {
        ciltTipleri = ['Tüm Cilt Tipleri', 'Hassas Ciltler', 'Aşırı Reaktif Ciltler', 'Güneş Yanığı Olan Ciltler'];
        yasKriterleri.yenidogan_uygun_mu = true;
        yasKriterleri.bebek_uygun_mu = true;
        yasKriterleri.yas_aciklama_detay = 'Yenidoğandan itibaren tüm aile fertlerinde ve en hassas ciltlerde %100 güvenlidir.';
        hastaSikayeti.hasta_cumlesi = 'Yüzümde ani kızarma, yanma ve batma hissi var; güneşten yandım ve tıraş/lazer sonrası cildim alev alev.';
        hastaSikayeti.secim_nedeni = 'Doğrudan kaynaktan steril ambalajlanan Avène Termal Suyu mikroflora dengesini korur, reaktiviteyi %64 azaltır.';
        formulasyon.aktif_bilesenler = ['%100 Saf Avène Termal Kaynak Suyu', 'Düşük Mineral İçeriği (266 mg/L)', 'Kalsiyum/Magnezyum 2:1 Dengesi'];
        formulasyon.rozetler = ['Saf Termal Su', 'Steril Ambalaj', '0 Koruyucu', 'Hipoalerjenik'];
        formulasyon.doku = 'Mikro damlacıklar halinde cildi saran yatıştırıcı su sisi.';
        muadilRehberi.en_yakin_muadil = 'La Roche-Posay Thermal Spring Water / Uriage Termal Su';
      } else if (nameLower.includes('rosamed') || nameLower.includes('antirougeurs')) {
        ciltTipleri = ['Kızarıklığa Eğilimli Ciltler', 'Rozasea (Gül Hastalığı)', 'Kılcal Damar Belirgin Ciltler'];
        hastaSikayeti.hasta_cumlesi = 'Yanaklarım ve burnum sürekli kırmızı, sıcak basınca hemen kızarıp alev alev yanıyor.';
        hastaSikayeti.secim_nedeni = 'Angiopause™ %1.8 etken maddesi ile kılcal damar genişlemesini ve kızarıklık nükslerini hedefler.';
        formulasyon.aktif_bilesenler = ['Angiopause™ %1.8', 'Avène Termal Kaynak Suyu', 'Dekstran Sülfat'];
        formulasyon.doku = 'Hafif, ferahlatıcı yağsız jel-krem kıvamı.';
        muadilRehberi.en_yakin_muadil = 'Bioderma Sensibio AR / La Roche-Posay Rosaliac AR';
      } else if (nameLower.includes('tolerance') || nameLower.includes('tolérance')) {
        ciltTipleri = ['Aşırı Hassas Ciltler', 'Alerjik Ciltler', 'Reaktif Ciltler'];
        yasKriterleri.bebek_uygun_mu = true;
        hastaSikayeti.hasta_cumlesi = 'Sürdüğüm her krem cildimde yanma, kızarıklık ve alerji yapıyor; hiçbir ürünü tolere edemiyorum.';
        hastaSikayeti.secim_nedeni = 'Steril Kozmetik® teknolojisi: 0 koruyucu, 0 parfüm ve %100 biyomimetik doğal nemlendirme.';
        formulasyon.aktif_bilesenler = ['Avène Termal Suyu (%60+)', 'Saf Hyalüronik Asit', 'Doğal Bitkisel Trigliseritler'];
        formulasyon.rozetler = ['Steril Kozmetik®', '0 Koruyucu Madde', '0 Parfüm', 'Mikrobiyom Dostu'];
        muadilRehberi.en_yakin_muadil = 'La Roche-Posay Toleriane Dermallergo Krem';
      }
    }

    // ─── MUSTELA ÖZEL KURALLARI ───
    if (brandLower.includes('mustela') || nameLower.includes('mustela')) {
      yasKriterleri.yenidogan_uygun_mu = true;
      yasKriterleri.bebek_uygun_mu = true;
      yasKriterleri.yas_aciklama_detay = 'Doğumdan itibaren (yenidoğan yoğun bakım ünitesi hariç) bebek ve çocuklarda güvenlidir.';
      formulasyon.rozetler = ['Pediatrik Onaylı', '%95+ Doğal İçerik', 'Avokado Perseose®', 'Hipoalerjenik'];
      if (nameLower.includes('stelatopia')) {
        ciltTipleri = ['Atopik Ciltler', 'Egzamaya Eğilimli Bebek Cildi', 'Aşırı Kuru Ciltler'];
        hastaSikayeti.hasta_cumlesi = 'Bebeğimin cildi pütür pütür, kızarık ve gece kaşıntıdan uyuyamıyor.';
        hastaSikayeti.secim_nedeni = 'Organik Ayçiçeği Oleodistilatı ve Prebiyotik Bioécolia ile lipit sentezini tetikler, kaşıntıyı ilk günden keser.';
        formulasyon.aktif_bilesenler = ['Ayçiçeği Yağı Oleodistilatı', 'Bioécolia® Prebiyotik', 'Avokado Perseose®'];
        muadilRehberi.en_yakin_muadil = 'La Roche-Posay Lipikar Baume AP+M / Bioderma Atoderm Intensive Baume';
      } else if (nameLower.includes('pisik') || nameLower.includes('barrier')) {
        ciltTipleri = ['Pişik Oluşmuş Ciltler', 'Kızarık Bebek Bezi Bölgesi'];
        hastaSikayeti.hasta_cumlesi = 'Bebeğimin poposu idrar temasından çok kızardı ve yanıyor.';
        hastaSikayeti.secim_nedeni = '%10 Çinko Oksit bariyer oluşturur, Oxeoline of Alcacea ile tahrişi 1 günde yatıştırır.';
        formulasyon.aktif_bilesenler = ['%10 Çinko Oksit', 'Avokado Perseose®', 'Ayçiçeği Oleodistilatı'];
        muadilRehberi.en_yakin_muadil = 'Sudocrem / Bepanthol Baby Pişik Merhemi';
      }
    }

    const id = `${cleanBrand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    return {
      id: id,
      name: cleanName,
      brand: cleanBrand,
      urun_tipi: urunTipi || 'Nemlendirici & Bariyer Krem',
      urun_tipi_icon: typeMeta.icon,
      rutin_adimi: typeMeta.step,
      category: category || 'dermo',
      category_name: category === 'dermo' ? 'Kozmetik & Dermokozmetik' : (category === 'vitamin' ? 'Besin Takviyeleri & Vitaminler' : 'Ağız & Diş Sağlığı'),
      sub_category: subcat || 'Özel Bakım',
      size: size || 'Standart Boyut',
      form: 'Orijinal Ambalaj',
      image: '',
      cilt_tipleri: ciltTipleri,
      yas_grubu: yasKriterleri.yas_aciklama_detay,
      kimler_kullanamaz: guvenlik.kontrendikasyonlar,
      nasil_kullanilir: kullanimProtokolu.uygulama_sekli,
      hangi_sikayetle_gelene_verilir: [hastaSikayeti.hasta_cumlesi],
      kombinasyon_ve_uyarilar: 'Rutin adımlarına uygun şekilde güvenle uygulanabilir.',
      etken_maddeler: formulasyon.aktif_bilesenler,
      kime_uygun: {
        profil: ciltTipleri.join(', '),
        cilt_tipleri: ciltTipleri,
        yas_grubu: yasKriterleri.yas_aciklama_detay,
        oncelikli_hedef: subcat || 'Hedefe Yönelik Klinik Bakım',
        yas_kriterleri: yasKriterleri
      },
      guvenlik_filtresi: guvenlik,
      hasta_sikayeti: hastaSikayeti,
      formulasyon: formulasyon,
      kullanim_protokolu: kullanimProtokolu,
      kombinasyonlar: kombinasyonlar,
      muadil_rehberi: muadilRehberi,
      tags: [...hastaSikayeti.arama_etiketleri, cleanBrand.toLowerCase(), cleanName.toLowerCase()]
    };
  }

  // =========================================================================
  // BÖLÜM 2: KATALOG RENDER & ANLIK FİLTRELEME
  // =========================================================================
  function renderCatalog() {
    const gridEl = document.getElementById('catalogProductGrid');
    const countPill = document.getElementById('catalogCountPill');
    const filterInfo = document.getElementById('catalogFilterInfo');
    if (!gridEl) return;

    state.products = getEffectiveProducts();

    let filtered = state.products;

    // 1. Marka Filtresi
    if (state.activeBrand && state.activeBrand !== 'all') {
      const bTarget = state.activeBrand.toLowerCase();
      filtered = filtered.filter(p => (p.brand || '').toLowerCase().includes(bTarget));
    }

    // 2. Rutin / Ürün Tipi Filtresi
    if (state.activeRoutine && state.activeRoutine !== 'all') {
      filtered = filtered.filter(p => p.urun_tipi === state.activeRoutine);
    }

    // 3. Canlı Arama Filtresi (Debounced)
    const q = (state.searchQuery || '').trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(p => {
        const sik = p.hasta_sikayeti || {};
        const form = p.formulasyon || {};
        const muad = p.muadil_rehberi || {};
        const kime = p.kime_uygun || {};
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sub_category && p.sub_category.toLowerCase().includes(q)) ||
          (p.urun_tipi && p.urun_tipi.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
          (sik.arama_etiketleri && sik.arama_etiketleri.some(t => t.toLowerCase().includes(q))) ||
          (sik.hasta_cumlesi && sik.hasta_cumlesi.toLowerCase().includes(q)) ||
          (kime.cilt_tipleri && kime.cilt_tipleri.some(c => c.toLowerCase().includes(q))) ||
          (p.cilt_tipleri && p.cilt_tipleri.some(c => c.toLowerCase().includes(q))) ||
          (form.aktif_bilesenler && form.aktif_bilesenler.some(e => e.toLowerCase().includes(q))) ||
          (p.etken_maddeler && p.etken_maddeler.some(e => e.toLowerCase().includes(q))) ||
          (muad.en_yakin_muadil && muad.en_yakin_muadil.toLowerCase().includes(q))
        );
      });
    }

    // Sayaç güncellemesi
    if (countPill) {
      if (q || state.activeBrand !== 'all' || state.activeRoutine !== 'all') {
        countPill.textContent = `${filtered.length} Ürün Bulundu (${state.products.length} Toplam)`;
      } else {
        countPill.textContent = `${filtered.length} Ürün Hazır`;
      }
    }

    // Filtre Bilgi Şeridi
    if (filterInfo) {
      const activeTags = [];
      if (state.activeBrand !== 'all') activeTags.push(`Marka: ${state.activeBrand}`);
      if (state.activeRoutine !== 'all') activeTags.push(`Rutin: ${state.activeRoutine}`);
      if (q) activeTags.push(`Arama: "${q}"`);

      if (activeTags.length > 0) {
        filterInfo.innerHTML = `
          <span style="color:var(--text-muted); font-size:0.75rem;">Filtreler:</span>
          ${activeTags.map(t => `<span class="badge-age-tag">${escapeHtml(t)}</span>`).join(' ')}
          <button type="button" id="btnResetFilters" style="background:transparent; border:none; color:var(--cyan); font-size:0.75rem; cursor:pointer; font-weight:700; text-decoration:underline;">Sıfırla</button>
        `;
        const resetBtn = document.getElementById('btnResetFilters');
        if (resetBtn) {
          resetBtn.onclick = () => {
            state.activeBrand = 'all';
            state.activeRoutine = 'all';
            state.searchQuery = '';
            const searchInput = document.getElementById('catalogSearchInput');
            if (searchInput) searchInput.value = '';
            document.querySelectorAll('#brandFilterRow .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.brand === 'all'));
            document.querySelectorAll('#routineFilterRow .routine-pill').forEach(c => c.classList.toggle('active', c.dataset.type === 'all'));
            const btnClear = document.getElementById('btnClearSearch');
            if (btnClear) btnClear.style.display = 'none';
            renderCatalog();
          };
        }
      } else {
        filterInfo.innerHTML = '';
      }
    }

    // Boş Durum
    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="color:#ffffff; margin-bottom: 0.35rem;">Kriterlere Uygun Ürün Bulunamadı</h3>
          <p style="font-size:0.85rem;">Farklı bir kelimeyle arayabilir veya yeni ürün stüdyosundan ekleyebilirsiniz.</p>
        </div>
      `;
      return;
    }

    // Kartlar
    gridEl.innerHTML = filtered.map(p => {
      const imgSrc = p.image || 'images/placeholder.png';
      const typeBadge = p.urun_tipi ? `<div class="card-type-pill">${p.urun_tipi_icon || '🏷️'} ${escapeHtml(p.urun_tipi)}</div>` : '';
      return `
        <div class="sleek-product-card" data-id="${escapeHtml(p.id)}">
          <div class="card-thumb-container">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='images/placeholder.png';">
            <div class="zoom-hint-icon" data-zoom-img="${escapeHtml(imgSrc)}" data-zoom-title="${escapeHtml(p.name)}" title="Fotoğrafı Büyüt">🔍</div>
          </div>
          ${typeBadge}
          <div class="card-category-sub">${escapeHtml(p.sub_category || p.brand || 'Dermo')}</div>
          <h4 class="card-product-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h4>
          <div class="card-bottom-info">
            <span>📦 ${escapeHtml(p.size || p.form || '')}</span>
            <span class="badge-age-tag">${escapeHtml(p.yas_grubu ? p.yas_grubu.split(',')[0] : 'Tüm Yaşlar')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // BÖLÜM 3: 7 BLOKLU KLİNİK DETAY MODALI
  // =========================================================================
  function openProductDetail(productId) {
    const p = state.products.find(x => x.id === productId);
    if (!p) return;
    state.selectedProduct = p;

    setText('detailProductName', p.name);
    setText('detailCatBadge', p.category_name || (p.category === 'dermo' ? 'Dermokozmetik' : (p.category === 'vitamin' ? 'Besin Takviyesi' : 'Ağız & Diş')));

    const urunTipiBadge = document.getElementById('detailUrunTipiBadge');
    if (urunTipiBadge) {
      urunTipiBadge.textContent = `${p.urun_tipi_icon || '🏷️'} ${p.urun_tipi || 'Dermokozmetik'}`;
      urunTipiBadge.style.display = p.urun_tipi ? 'inline-block' : 'none';
    }
    setText('detailSubcatBadge', p.sub_category || 'Özel Bakım');
    setText('detailBrandBadge', p.brand || 'Klinik');

    // BLOK 1: KİME UYGUN? & YAŞ MATRİSİ
    const skinTypes = (p.kime_uygun && p.kime_uygun.cilt_tipleri) || p.cilt_tipleri || [];
    const ciltEl = document.getElementById('detailCiltTipleri');
    if (ciltEl) {
      ciltEl.innerHTML = skinTypes.length > 0
        ? skinTypes.map(c => `<span class="pill-item">✓ ${escapeHtml(c)}</span>`).join('')
        : '<span class="pill-item">Tüm Cilt Tipleri</span>';
    }

    const yk = (p.kime_uygun && p.kime_uygun.yas_kriterleri) || {};
    const yasMatrisiEl = document.getElementById('detailYasMatrisi');
    if (yasMatrisiEl) {
      const matrix = [
        { label: '👶 Yenidoğan (0-28 Gün)', ok: yk.yenidogan_uygun_mu },
        { label: '🍼 Bebek (1-24 Ay)', ok: yk.bebek_uygun_mu },
        { label: '🧒 Çocuk (2-12 Yaş)', ok: yk.cocuk_uygun_mu },
        { label: '🧑 Ergen (12-18 Yaş)', ok: yk.ergen_uygun_mu },
        { label: '👤 Yetişkin (18-65)', ok: yk.yetiskin_uygun_mu },
        { label: '🧓 Geriatri (65+)', ok: yk.geriatri_uygun_mu },
        { label: '🤰 Gebelik', ok: yk.gebelik_guvenli_mi, warn: !yk.gebelik_guvenli_mi },
        { label: '🤱 Emzirme', ok: yk.emzirme_guvenli_mi, warn: !yk.emzirme_guvenli_mi }
      ];
      yasMatrisiEl.innerHTML = matrix.map(m => `
        <div class="age-matrix-pill ${m.ok ? 'suitable' : (m.warn ? 'caution' : 'not-suitable')}">
          <span class="amp-title">${m.label}</span>
          <span class="amp-status">${m.ok ? '✓ UYGUN' : (m.warn ? '⚠️ DİKKAT' : '✗ UYGUN DEĞİL')}</span>
        </div>
      `).join('');
    }

    const yasAciklamaEl = document.getElementById('detailYasAciklama');
    if (yasAciklamaEl) {
      yasAciklamaEl.textContent = yk.yas_aciklama_detay || p.yas_grubu || 'Özel bir yaş sınırlaması bulunmamaktadır.';
    }

    // BLOK 2: GÜVENLİK FİLTRESİ
    const sec = p.guvenlik_filtresi || {};
    setText('detailKontrendikasyon', sec.kontrendikasyonlar || p.kimler_kullanamaz || 'Açık yaralara ve sızıntılı enfekte dokulara doğrudan uygulanmaz.');
    setText('detailGozCevresi', sec.goz_cevresi_temas || 'Göz mukozası ile doğrudan temastan kaçınınız. Temas halinde bol su ile yıkayınız.');
    setText('detailDoktoraYonlendir', sec.doktora_yonlendirme || '2 haftayı aşan, şiddetli yanma veya kabarma görülen durumlarda hekime yönlendiriniz.');

    // BLOK 3: HASTA ŞİKAYETİ
    const sik = p.hasta_sikayeti || {};
    const hastaCumle = sik.hasta_cumlesi || (p.hangi_sikayetle_gelene_verilir && p.hangi_sikayetle_gelene_verilir[0]) || 'Cilt sağlığımı destekleyecek ve günlük bakımımı sağlayacak güvenilir bir ürün arıyorum.';
    setText('detailHastaSikayeti', `💬 “${hastaCumle}”`);
    setText('detailEczaciSorusu', `🩺 Eczacı Sorusu: ${sik.eczaci_sorusu || 'Şikayetinizin ne zamandır devam ettiğini ve mevcut hekim tedavilerinizi sorgulayınız.'}`);
    setText('detailSecimNedeni', `💡 Neden Bu Ürün?: ${sik.secim_nedeni || 'Cilt florasını bozmadan bariyeri onaran yüksek toleranslı dermokozmetik formülasyon.'}`);

    // BLOK 4: FORMÜLASYON & AKTİFLER
    const form = p.formulasyon || {};
    const aktiflerEl = document.getElementById('detailAktifBilesenler');
    if (aktiflerEl) {
      const actives = form.aktif_bilesenler || p.etken_maddeler || [];
      aktiflerEl.innerHTML = actives.length > 0
        ? actives.map(a => `<span class="active-pill">🔬 ${escapeHtml(a)}</span>`).join('')
        : '<span class="active-pill">Dermokozmetik Kompleks</span>';
    }

    const rozetlerEl = document.getElementById('detailKlinikRozetler');
    if (rozetlerEl) {
      const badges = form.rozetler || ['Dermatolojik Olarak Test Edildi', 'Hipoalerjenik', 'Parfümsüz'];
      rozetlerEl.innerHTML = badges.map(b => `<span class="badge-rozet">${escapeHtml(b)}</span>`).join('');
    }

    setText('detailDoku', `🧴 Doku: ${form.doku || 'Hafif, yapışkan his bırakmayan doku'}`);
    setText('detailPh', `⚖️ pH: ${form.fizyolojik_ph || '5.5'}`);

    // BLOK 5: GÖRSEL & PROTOKOL
    const imgEl = document.getElementById('detailProductImg');
    if (imgEl) {
      imgEl.src = p.image || 'images/placeholder.png';
      imgEl.alt = p.name;
    }

    const proto = p.kullanim_protokolu || {};
    setText('detailRutinSira', proto.rutin_siralamasi || p.rutin_adimi || 'Temel Cilt Bakım Protokolü');
    setText('detailZamanSiklik', `⏱️ Zaman & Sıklık: ${proto.zaman_ve_siklik || 'Günde 2 kez (Sabah - Akşam)'} • Miktar: ${proto.miktar || 'Yeterli miktar'}`);
    setText('detailUygulamaSekli', `✋ Uygulama: ${proto.uygulama_sekli || p.nasil_kullanilir || 'Temiz cilde dairesel masajla uygulanır.'}\n📈 Beklenen Sonuç: ${proto.beklenen_sonuc || 'İlk kullanımda rahatlama, düzenli kullanımda güçlü bariyer.'}`);

    // BLOK 6: KOMBİNASYONLAR
    const komb = p.kombinasyonlar || {};
    const tamamEl = document.getElementById('detailTamamlayici');
    if (tamamEl) {
      const comps = komb.tamamlayici_kombinler || [];
      tamamEl.innerHTML = comps.length > 0
        ? comps.map(c => `<span class="comp-pill-link">🔗 ${escapeHtml(c)}</span>`).join('')
        : '<span style="font-size:0.75rem; color:var(--text-muted);">Temel günlük rutin ürünleriyle güvenle kombine edilebilir.</span>';
    }

    const cakismaEl = document.getElementById('detailYasakliCakisma');
    if (cakismaEl) {
      const confs = komb.yasakli_cakismalar || [];
      cakismaEl.innerHTML = confs.length > 0
        ? confs.map(c => `<span class="pill-item danger">⚠️ ${escapeHtml(c)}</span>`).join('')
        : '<span style="font-size:0.75rem; color:var(--emerald);">✓ Bilinen kritik bir kimyasal çakışması bulunmuyor.</span>';
    }

    // BLOK 7: MUADİL REHBERİ
    const muad = p.muadil_rehberi || {};
    setText('detailEnYakinMuadil', `🎯 En Yakın Alternatif: ${muad.en_yakin_muadil || 'Benzer dermokozmetik formülasyonlar değerlendirilebilir.'}`);
    setText('detailMuadilFark', `⚖️ Klinik Fark: ${muad.alternatif_fark_notu || 'Doku ve tolerans profiline göre danışana uygun olanı tercih ediniz.'}`);

    // Modalı Aç
    const modal = document.getElementById('productDetailModal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProductDetail() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  // =========================================================================
  // BÖLÜM 4: BİRLEŞİK YENİ ÜRÜN STÜDYOSU (RAF & WEBDEN TEKİL EKLEME)
  // =========================================================================
  function openUnifiedStudio(tab = 'shelf') {
    const modal = document.getElementById('unifiedStudioModal');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    switchStudioTab(tab);
  }

  function closeUnifiedStudio() {
    const modal = document.getElementById('unifiedStudioModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function switchStudioTab(tab) {
    document.querySelectorAll('.studio-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    const paneShelf = document.getElementById('tabPaneShelf');
    const paneSingle = document.getElementById('tabPaneSingle');

    if (paneShelf) paneShelf.style.display = tab === 'shelf' ? 'block' : 'none';
    if (paneSingle) paneSingle.style.display = tab === 'single' ? 'block' : 'none';
  }

  // ─── SEKME 1: RAFTAN SIRALI EKLEME SİHİRBAZI ───
  function setWizardStep(step) {
    state.shelfWizard.step = step;

    const stepUpload = document.getElementById('wizardStepUpload');
    const stepReview = document.getElementById('wizardStepReview');
    const stepPackshots = document.getElementById('wizardStepPackshots');

    if (stepUpload) stepUpload.style.display = step === 'upload' ? 'flex' : 'none';
    if (stepReview) stepReview.style.display = step === 'review' ? 'flex' : 'none';
    if (stepPackshots) stepPackshots.style.display = step === 'packshots' ? 'flex' : 'none';
  }

  async function analyzeShelfPhoto(payload) {
    const scanning = document.getElementById('shelfScanningState');
    const dropzone = document.getElementById('shelfDropzone');
    const sampleRow = document.querySelector('.sample-actions-row');
    const sampleDiv = document.querySelector('.sample-divider');

    if (scanning) scanning.style.display = 'flex';
    if (dropzone) dropzone.style.display = 'none';
    if (sampleRow) sampleRow.style.display = 'none';
    if (sampleDiv) sampleDiv.style.display = 'none';

    showToast('🔍 Fotoğraftan marka ve Türkçe ambalaj adları taranıyor...');

    try {
      const resp = await fetch('/api/analyze-shelf-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();

      if (!data.success || !data.products || data.products.length === 0) {
        throw new Error(data.error || 'Fotoğraftan ürün okunamadı');
      }

      state.shelfWizard.detectedProducts = data.products;
      state.shelfWizard.detectedBrand = data.detected_brand || 'Genel';
      state.shelfWizard.shelfPreview = data.shelf_preview || '';

      renderDetectedProducts();
      setWizardStep('review');
      showToast(`✓ Raftan ${data.products.length} ürün başarıyla tespit edildi!`);
    } catch (err) {
      showToast('⚠️ Tarama yapılamadı: ' + err.message);
    } finally {
      if (scanning) scanning.style.display = 'none';
      if (dropzone) dropzone.style.display = 'flex';
      if (sampleRow) sampleRow.style.display = 'flex';
      if (sampleDiv) sampleDiv.style.display = 'flex';
    }
  }

  function renderDetectedProducts() {
    const listEl = document.getElementById('detectedProductsList');
    const thumbEl = document.getElementById('reviewShelfThumb');
    const brandEl = document.getElementById('reviewDetectedBrand');
    const countBadge = document.getElementById('reviewCountBadge');
    const btnStartCount = document.getElementById('btnStartCount');

    if (!listEl || !state.shelfWizard) return;

    const prods = state.shelfWizard.detectedProducts;
    if (thumbEl && state.shelfWizard.shelfPreview) thumbEl.src = state.shelfWizard.shelfPreview;
    if (brandEl) brandEl.textContent = state.shelfWizard.detectedBrand || 'Genel';
    if (countBadge) countBadge.textContent = `${prods.length} Ürün`;
    if (btnStartCount) btnStartCount.textContent = prods.length;

    listEl.innerHTML = prods.map((prod, idx) => `
      <div class="detected-product-item" data-idx="${idx}">
        <div class="detected-item-left">
          <span class="detected-num-badge">#${idx + 1}</span>
          <input type="text" class="detected-name-input" value="${escapeHtml(prod.name)}" data-idx="${idx}" title="Düzenlemek için tıklayın">
        </div>
        <div class="detected-item-meta">
          <span class="card-type-pill" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">${escapeHtml(prod.urunTipi || 'Dermokozmetik')}</span>
          <button type="button" class="btn-remove-detected" data-idx="${idx}" title="Listeden Çıkar">✕</button>
        </div>
      </div>
    `).join('');
  }

  function renderWizardQueueChips() {
    const container = document.getElementById('wizardQueueChips');
    if (!container || !state.shelfWizard || !state.shelfWizard.queue) return;

    container.innerHTML = state.shelfWizard.queue.map((item, idx) => {
      const isCurrent = idx === state.shelfWizard.currentIndex;
      const isDone = state.shelfWizard.completed.has(idx);
      const icon = isDone ? '✓' : `${idx + 1}.`;
      const shortName = item.name.length > 22 ? (item.name.substring(0, 20) + '...') : item.name;
      let cls = 'wizard-queue-chip';
      if (isCurrent) cls += ' active';
      if (isDone) cls += ' done';

      return `<button type="button" class="${cls}" data-idx="${idx}">${icon} ${escapeHtml(shortName)}</button>`;
    }).join('');
  }

  async function loadWizardProduct(idx) {
    if (!state.shelfWizard || idx < 0 || idx >= state.shelfWizard.queue.length) return;
    state.shelfWizard.currentIndex = idx;
    const item = state.shelfWizard.queue[idx];

    setText('wizardQueueTag', `Raf Ürünü ${idx + 1} / ${state.shelfWizard.queue.length}`);
    setText('wizardActiveName', item.name);
    setText('wizardActiveType', item.urunTipi || 'Dermokozmetik');
    setText('wizardActiveBrand', item.brand || 'Klinik');
    setText('wizardActiveSize', item.size || 'Orijinal Boyut');

    renderWizardQueueChips();

    const loadingEl = document.getElementById('wizardLoading');
    const gridEl = document.getElementById('wizardPackshotGrid');
    if (loadingEl) loadingEl.style.display = 'flex';
    if (gridEl) gridEl.innerHTML = '';

    const query = item.searchQuery || `${item.brand} ${item.name} resmi ambalaj packshot`;

    try {
      const resp = await fetch(`/api/search-images?q=${encodeURIComponent(query)}`);
      const data = await resp.json();

      if (loadingEl) loadingEl.style.display = 'none';

      if (!data.success || !data.results || data.results.length === 0) {
        if (gridEl) gridEl.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--text-muted);">Görsel servisi sonuç döndürmedi. Lütfen "Bu Ürünü Atla"ya basın.</div>`;
        return;
      }

      if (gridEl) {
        gridEl.innerHTML = data.results.map((res, rIdx) => `
          <div class="wizard-packshot-card" data-idx="${rIdx}">
            <div class="wizard-packshot-img-wrap" data-img="${escapeHtml(res.image)}" data-title="${escapeHtml(res.title || item.name)}" title="Büyütüp İncelemek İçin Tıklayın">
              <img src="${escapeHtml(res.thumbnail || res.image)}" alt="${escapeHtml(res.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.src!=='${escapeHtml(res.image)}')this.src='${escapeHtml(res.image)}';">
            </div>
            <div class="wizard-packshot-title" title="${escapeHtml(res.title)}">${escapeHtml(res.title || item.name)}</div>
            <div class="wizard-packshot-actions">
              <button type="button" class="btn-packshot-zoom" data-img="${escapeHtml(res.image)}" data-title="${escapeHtml(res.title || item.name)}">
                🔍 Büyüt
              </button>
              <button type="button" class="btn-packshot-select" data-img="${escapeHtml(res.image)}" data-title="${escapeHtml(res.title || item.name)}">
                ✓ Ambalajı Seç
              </button>
            </div>
          </div>
        `).join('');
      }
    } catch (err) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (gridEl) gridEl.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--rose);">Görsel servisine ulaşılamadı. Sunucu açık mı?</div>`;
    }
  }

  async function saveWizardProduct(imgUrl, item) {
    showToast(`⏳ "${item.name}" ambalajı stüdyo fonuna dönüştürülüyor...`);

    try {
      const resp = await fetch('/api/save-web-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imgUrl,
          brand: item.brand,
          name: item.name,
          size: item.size,
          apply_bg_removal: true
        })
      });

      const resData = await resp.json();
      if (!resData.success) {
        showToast('Görsel işlenemedi: ' + (resData.error || 'Bilinmeyen hata'));
        return;
      }

      const fullProduct = generateClinicalProfile(
        item.brand,
        item.name,
        item.urunTipi,
        item.size,
        item.subcat,
        item.category
      );
      fullProduct.image = resData.relative_path;

      try {
        await fetch('/api/add-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: fullProduct })
        });
      } catch (ex) {
        console.warn('API add-product çağrısı:', ex);
      }

      state.customProducts.unshift(fullProduct);
      localStorage.setItem('user_custom_products_v1', JSON.stringify(state.customProducts));
      state.products = getEffectiveProducts();
      renderCatalog();

      showToast(`✓ "${item.name}" başarıyla eklendi!`);

      state.shelfWizard.completed.add(state.shelfWizard.currentIndex);
      const nextIdx = state.shelfWizard.currentIndex + 1;
      if (nextIdx < state.shelfWizard.queue.length) {
        loadWizardProduct(nextIdx);
      } else {
        closeUnifiedStudio();
        showToast('🌟 Tebrikler! Raftaki tüm ürünler stüdyo fotoğrafları ve 7 blok klinik künyeleriyle sisteme eklendi!');
      }
    } catch (err) {
      showToast('Ürün kaydedilirken bir hata oluştu.');
      console.error(err);
    }
  }

  // ─── SEKME 2: WEBDEN TEKİL ARAMA & EKLEME ───
  async function handleSingleWebSearch() {
    const input = document.getElementById('singleSearchInput');
    const loading = document.getElementById('singleLoading');
    const galleryContainer = document.getElementById('singleGalleryContainer');
    const grid = document.getElementById('singleGalleryGrid');

    if (!input) return;
    const q = input.value.trim();
    if (!q) {
      showToast('Lütfen eklemek istediğiniz ürün adını yazın.');
      input.focus();
      return;
    }

    if (loading) loading.style.display = 'flex';
    if (galleryContainer) galleryContainer.style.display = 'none';
    if (grid) grid.innerHTML = '';

    try {
      const resp = await fetch(`/api/search-images?q=${encodeURIComponent(q)}`);
      const data = await resp.json();

      if (loading) loading.style.display = 'none';

      if (!data.success || !data.results || data.results.length === 0) {
        showToast('Uygun ürün görseli bulunamadı. Lütfen ürün adını detaylandırın.');
        return;
      }

      if (grid) {
        grid.innerHTML = data.results.map((res, idx) => `
          <div class="wizard-packshot-card" data-idx="${idx}" data-img="${escapeHtml(res.image)}" data-title="${escapeHtml(res.title || q)}">
            <div class="wizard-packshot-img-wrap" title="Büyütüp İncelemek İçin Tıklayın">
              <img src="${escapeHtml(res.thumbnail || res.image)}" alt="${escapeHtml(res.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.src!=='${escapeHtml(res.image)}')this.src='${escapeHtml(res.image)}';">
            </div>
            <div class="wizard-packshot-title" title="${escapeHtml(res.title)}">${escapeHtml(res.title || q)}</div>
            <div class="wizard-packshot-actions">
              <button type="button" class="btn-packshot-zoom" data-img="${escapeHtml(res.image)}" data-title="${escapeHtml(res.title || q)}">
                🔍 Büyüt
              </button>
              <button type="button" class="btn-packshot-select" data-img="${escapeHtml(res.image)}" data-title="${escapeHtml(res.title || q)}">
                ✓ Bu Ambalajı Ekle
              </button>
            </div>
          </div>
        `).join('');
      }

      if (galleryContainer) galleryContainer.style.display = 'block';
    } catch (err) {
      if (loading) loading.style.display = 'none';
      showToast('Görsel araması gerçekleştirilemedi (Sunucu yanıt vermedi).');
    }
  }

  async function handleSingleImagePick(imgUrl, title) {
    const input = document.getElementById('singleSearchInput');
    const query = input ? input.value.trim() : title;

    // Basit marka & isim ayrıştırma
    let detectedBrand = 'Genel';
    const knownBrands = ['Avène', 'Avene', 'CeraVe', 'Cerave', 'Mustela', 'Bioderma', 'La Roche-Posay', 'Caudalie', 'Ducray', 'Ocean', 'Sensodyne'];
    for (const b of knownBrands) {
      if (query.toLowerCase().includes(b.toLowerCase()) || title.toLowerCase().includes(b.toLowerCase())) {
        detectedBrand = b.replace('Avene', 'Avène').replace('Cerave', 'CeraVe');
        break;
      }
    }

    const cleanName = query.length > 3 ? query : title;

    showToast(`⏳ "${cleanName}" ambalajı stüdyo fonuna dönüştürülüyor...`);

    try {
      const resp = await fetch('/api/save-web-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imgUrl,
          brand: detectedBrand,
          name: cleanName,
          apply_bg_removal: true
        })
      });

      const resData = await resp.json();
      if (!resData.success) {
        showToast('Görsel işlenemedi: ' + (resData.error || 'Bilinmeyen hata'));
        return;
      }

      const newProduct = generateClinicalProfile(
        detectedBrand,
        cleanName,
        'Nemlendirici & Bariyer Krem',
        'Orijinal Boyut',
        'Klinik Seri',
        'dermo'
      );
      newProduct.image = resData.relative_path;

      try {
        await fetch('/api/add-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: newProduct })
        });
      } catch (ex) {
        console.warn('API add-product çağrısı:', ex);
      }

      state.customProducts.unshift(newProduct);
      localStorage.setItem('user_custom_products_v1', JSON.stringify(state.customProducts));
      state.products = getEffectiveProducts();
      renderCatalog();

      closeUnifiedStudio();
      showToast(`✓ "${cleanName}" başarıyla kataloğa eklendi!`);
      openProductDetail(newProduct.id);
    } catch (err) {
      showToast('Ürün kaydedilirken hata oluştu.');
      console.error(err);
    }
  }

  // =========================================================================
  // BÖLÜM 5: LIGHTBOX BÜYÜTME MODALI
  // =========================================================================
  function openLightbox(src, caption, onSelect) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    const btnSelect = document.getElementById('btnLightboxSelect');

    if (!modal || !img) return;

    img.src = src;
    if (cap) cap.textContent = caption || '';

    state.lightboxCallback = onSelect || null;
    if (btnSelect) {
      btnSelect.style.display = onSelect ? 'block' : 'none';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    state.lightboxCallback = null;
  }

  // =========================================================================
  // BÖLÜM 6: SUNUCU DURUMU & TOGGLE
  // =========================================================================
  function updateServerStatusUI(isActive) {
    const toggleBtn = document.getElementById('headerServerToggleBtn');
    const toggleText = document.getElementById('headerToggleText');

    if (toggleBtn) {
      if (isActive) {
        toggleBtn.classList.add('active');
        toggleBtn.classList.remove('inactive');
        if (toggleText) toggleText.textContent = '🟢 Stüdyo: AÇIK';
      } else {
        toggleBtn.classList.remove('active');
        toggleBtn.classList.add('inactive');
        if (toggleText) toggleText.textContent = '⚪ Stüdyo: KAPALI';
      }
    }
  }

  async function toggleServerEngine() {
    const toggleBtn = document.getElementById('headerServerToggleBtn');
    if (toggleBtn) toggleBtn.style.pointerEvents = 'none';

    try {
      const resp = await fetch('/api/service/toggle', { method: 'POST' });
      const data = await resp.json();
      const isActive = !!data.studio_active;
      updateServerStatusUI(isActive);
      showToast(isActive ? '🟢 Stüdyo motoru başlatıldı!' : '⚪ Stüdyo motoru durduruldu (beklemede).');
    } catch (err) {
      showToast('⚠️ Stüdyo servisi yanıt vermedi.');
    } finally {
      if (toggleBtn) toggleBtn.style.pointerEvents = '';
    }
  }

  function startServerHealthCheck() {
    async function checkHealth() {
      try {
        const resp = await fetch('/api/health');
        const data = await resp.json();
        const isRunning = data.status === 'ok' && data.running;
        const isActive = isRunning && (data.studio_active !== false);
        updateServerStatusUI(isActive);
      } catch (err) {
        updateServerStatusUI(false);
      }
    }

    checkHealth();
    setInterval(checkHealth, 5000);
  }

  // =========================================================================
  // BÖLÜM 7: EVENT DİNLEYİCİLERİ
  // =========================================================================
  function initEventListeners() {
    // 1. Canlı Arama Çubuğu (Debounced)
    const searchInput = document.getElementById('catalogSearchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');
    let searchTimer = null;

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const val = searchInput.value;
        if (btnClearSearch) btnClearSearch.style.display = val ? 'block' : 'none';

        searchTimer = setTimeout(() => {
          state.searchQuery = val;
          renderCatalog();
        }, 120);
      });

      if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
          searchInput.value = '';
          btnClearSearch.style.display = 'none';
          state.searchQuery = '';
          renderCatalog();
          searchInput.focus();
        });
      }
    }

    // Ctrl+K Klavye Kısayolu
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      if (e.key === 'Escape') {
        closeLightbox();
        closeUnifiedStudio();
        closeProductDetail();
      }
    });

    // 2. Marka Filtre Çipleri
    const brandRow = document.getElementById('brandFilterRow');
    if (brandRow) {
      brandRow.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        brandRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeBrand = chip.dataset.brand;
        renderCatalog();
      });
    }

    // 3. Rutin Rolü Filtre Pilleri
    const routineRow = document.getElementById('routineFilterRow');
    if (routineRow) {
      routineRow.addEventListener('click', (e) => {
        const pill = e.target.closest('.routine-pill');
        if (!pill) return;
        routineRow.querySelectorAll('.routine-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeRoutine = pill.dataset.type;
        renderCatalog();
      });
    }

    // 4. Katalog Kart Tıklamaları (Detay veya Büyütme)
    const catalogGrid = document.getElementById('catalogProductGrid');
    if (catalogGrid) {
      catalogGrid.addEventListener('click', (e) => {
        const zoomBtn = e.target.closest('.zoom-hint-icon');
        if (zoomBtn) {
          e.stopPropagation();
          openLightbox(zoomBtn.dataset.zoomImg, zoomBtn.dataset.zoomTitle);
          return;
        }

        const card = e.target.closest('.sleek-product-card');
        if (card && card.dataset.id) {
          openProductDetail(card.dataset.id);
        }
      });
    }

    // 5. Birleşik Stüdyo Modal Butonları
    const btnOpenStudio = document.getElementById('btnOpenUnifiedStudio');
    if (btnOpenStudio) {
      btnOpenStudio.addEventListener('click', () => openUnifiedStudio('shelf'));
    }

    const btnCloseStudio = document.getElementById('btnCloseUnifiedStudio');
    if (btnCloseStudio) {
      btnCloseStudio.addEventListener('click', closeUnifiedStudio);
    }

    const studioModal = document.getElementById('unifiedStudioModal');
    if (studioModal) {
      studioModal.addEventListener('click', (e) => {
        if (e.target.id === 'unifiedStudioModal') closeUnifiedStudio();
      });
    }

    // Stüdyo Sekmeleri
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchStudioTab(btn.dataset.tab);
      });
    });

    // Sekme 1: Raf Yükleme, Sürükle-Bırak & Hazır Butonlar
    const dropzone = document.getElementById('shelfDropzone');
    const fileInput = document.getElementById('shelfFileInput');
    const btnBrowse = document.getElementById('btnBrowseShelfFile');

    if (btnBrowse && fileInput) {
      btnBrowse.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => analyzeShelfPhoto({ image_data: evt.target.result });
        reader.readAsDataURL(file);
      });
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => analyzeShelfPhoto({ image_data: evt.target.result });
        reader.readAsDataURL(file);
      });
    }

    const btnSampleAvene = document.getElementById('btnLoadSampleAvene');
    if (btnSampleAvene) {
      btnSampleAvene.addEventListener('click', () => {
        analyzeShelfPhoto({
          image_path: '/home/arekros/.gemini/antigravity/brain/dc49476f-a700-4315-a1e2-093e9bc503a2/.user_uploaded/media_1792954929563.jpg'
        });
      });
    }

    const btnSampleCerave = document.getElementById('btnLoadSampleShelf');
    if (btnSampleCerave) {
      btnSampleCerave.addEventListener('click', () => {
        analyzeShelfPhoto({
          image_path: '/home/arekros/.gemini/antigravity/brain/dc49476f-a700-4315-a1e2-093e9bc503a2/.user_uploaded/media_1792795790857.jpg'
        });
      });
    }

    // Sekme 1: İnceleme Adımı
    const detectedList = document.getElementById('detectedProductsList');
    if (detectedList) {
      detectedList.addEventListener('input', (e) => {
        if (e.target.classList.contains('detected-name-input')) {
          const idx = parseInt(e.target.dataset.idx, 10);
          if (state.shelfWizard.detectedProducts[idx]) {
            const newName = e.target.value.trim();
            state.shelfWizard.detectedProducts[idx].name = newName;
            const brand = state.shelfWizard.detectedProducts[idx].brand || 'Genel';
            state.shelfWizard.detectedProducts[idx].searchQuery = `${brand} ${newName} resmi ambalaj packshot`;
          }
        }
      });

      detectedList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove-detected');
        if (removeBtn) {
          const idx = parseInt(removeBtn.dataset.idx, 10);
          state.shelfWizard.detectedProducts.splice(idx, 1);
          renderDetectedProducts();
        }
      });
    }

    const btnAddDetected = document.getElementById('btnAddDetectedItem');
    const inputNewDetected = document.getElementById('inputNewDetectedItem');
    function handleAddExtraDetected() {
      if (!inputNewDetected) return;
      const val = inputNewDetected.value.trim();
      if (!val) return;
      const brand = state.shelfWizard.detectedBrand || 'Genel';
      state.shelfWizard.detectedProducts.push({
        name: val,
        searchQuery: `${brand} ${val} resmi ambalaj packshot`,
        brand: brand,
        urunTipi: 'Yüz & Vücut Temizleyici',
        subcat: 'Genel Bakım',
        size: '',
        category: 'dermo'
      });
      inputNewDetected.value = '';
      renderDetectedProducts();
      showToast(`+ "${val}" listeye eklendi.`);
    }

    if (btnAddDetected) btnAddDetected.addEventListener('click', handleAddExtraDetected);
    if (inputNewDetected) {
      inputNewDetected.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddExtraDetected();
        }
      });
    }

    const btnBackToUpload = document.getElementById('btnBackToUpload');
    if (btnBackToUpload) {
      btnBackToUpload.addEventListener('click', () => setWizardStep('upload'));
    }

    const btnStartPackshots = document.getElementById('btnStartPackshots');
    if (btnStartPackshots) {
      btnStartPackshots.addEventListener('click', () => {
        if (!state.shelfWizard.detectedProducts || state.shelfWizard.detectedProducts.length === 0) {
          showToast('Lütfen listede en az bir ürün bulundurun.');
          return;
        }
        state.shelfWizard.queue = state.shelfWizard.detectedProducts.map(p => ({ ...p }));
        state.shelfWizard.currentIndex = 0;
        state.shelfWizard.completed = new Set();
        setWizardStep('packshots');
        loadWizardProduct(0);
      });
    }

    // Sekme 1: Sıralı Packshotlar
    const btnBackToReview = document.getElementById('btnBackToReview');
    if (btnBackToReview) {
      btnBackToReview.addEventListener('click', () => setWizardStep('review'));
    }

    const btnSkip = document.getElementById('btnWizardSkip');
    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        const nextIdx = state.shelfWizard.currentIndex + 1;
        if (nextIdx < state.shelfWizard.queue.length) {
          loadWizardProduct(nextIdx);
        } else {
          closeUnifiedStudio();
          showToast('Kuyruktaki tüm ürünler gözden geçirildi.');
        }
      });
    }

    const queueChips = document.getElementById('wizardQueueChips');
    if (queueChips) {
      queueChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.wizard-queue-chip');
        if (chip) loadWizardProduct(parseInt(chip.dataset.idx, 10));
      });
    }

    const wizardGrid = document.getElementById('wizardPackshotGrid');
    if (wizardGrid) {
      wizardGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.wizard-packshot-card');
        if (!card) return;
        const item = state.shelfWizard.queue[state.shelfWizard.currentIndex];

        const zoomBtn = e.target.closest('.btn-packshot-zoom');
        const imgWrap = e.target.closest('.wizard-packshot-img-wrap');
        const selectBtn = e.target.closest('.btn-packshot-select');

        if (zoomBtn || imgWrap) {
          const el = zoomBtn || imgWrap;
          const imgUrl = el.dataset.img;
          const title = el.dataset.title;
          openLightbox(imgUrl, title, () => {
            saveWizardProduct(imgUrl, item);
          });
          return;
        }

        if (selectBtn) {
          const imgUrl = selectBtn.dataset.img;
          saveWizardProduct(imgUrl, item);
        }
      });
    }

    // Sekme 2: Web Tekil Arama
    const btnSingleSearch = document.getElementById('btnSingleSearch');
    const inputSingleSearch = document.getElementById('singleSearchInput');
    if (btnSingleSearch) btnSingleSearch.addEventListener('click', handleSingleWebSearch);
    if (inputSingleSearch) {
      inputSingleSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSingleWebSearch();
        }
      });
    }

    const singleGrid = document.getElementById('singleGalleryGrid');
    if (singleGrid) {
      singleGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.wizard-packshot-card');
        if (!card) return;

        const zoomBtn = e.target.closest('.btn-packshot-zoom');
        const imgWrap = e.target.closest('.wizard-packshot-img-wrap');
        const selectBtn = e.target.closest('.btn-packshot-select');

        const imgUrl = card.dataset.img;
        const title = card.dataset.title;

        if (zoomBtn || imgWrap) {
          openLightbox(imgUrl, title, () => {
            handleSingleImagePick(imgUrl, title);
          });
          return;
        }

        if (selectBtn || card) {
          handleSingleImagePick(imgUrl, title);
        }
      });
    }

    // 6. Detay Modalı Kapatma & Zoom
    const btnCloseDetail = document.getElementById('btnCloseDetail');
    if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeProductDetail);

    const detailModal = document.getElementById('productDetailModal');
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target.id === 'productDetailModal') closeProductDetail();
      });
    }

    const detailZoomBtn = document.getElementById('detailZoomBtn');
    if (detailZoomBtn) {
      detailZoomBtn.addEventListener('click', () => {
        if (state.selectedProduct) {
          openLightbox(state.selectedProduct.image, state.selectedProduct.name);
        }
      });
    }

    // 7. Lightbox Kapatma & Seçim
    const btnCloseLightbox = document.getElementById('btnCloseLightbox');
    if (btnCloseLightbox) btnCloseLightbox.addEventListener('click', closeLightbox);

    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target.id === 'lightboxModal') closeLightbox();
      });
    }

    const btnLightboxSelect = document.getElementById('btnLightboxSelect');
    if (btnLightboxSelect) {
      btnLightboxSelect.addEventListener('click', () => {
        if (typeof state.lightboxCallback === 'function') {
          const cb = state.lightboxCallback;
          closeLightbox();
          cb();
        }
      });
    }

    // 8. Stüdyo Aç/Kapat Butonu
    const headerToggleBtn = document.getElementById('headerServerToggleBtn');
    if (headerToggleBtn) headerToggleBtn.addEventListener('click', toggleServerEngine);
  }

  // =========================================================================
  // BAŞLATMA
  // =========================================================================
  function initApp() {
    loadPersistedData();
    state.products = getEffectiveProducts();

    renderCatalog();
    initEventListeners();
    startServerHealthCheck();

    // URL Hash yönlendirmesi
    if (window.location.hash.startsWith('#product=')) {
      const id = window.location.hash.replace('#product=', '');
      openProductDetail(id);
    }
  }

  window.openProductDetail = openProductDetail;
  window.openLightbox = openLightbox;
  window.openUnifiedStudio = openUnifiedStudio;

  document.addEventListener('DOMContentLoaded', initApp);

})();
