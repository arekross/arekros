/**
 * arekros — Klinik Dermokozmetik & Danışmanlık Konsolu
 * Modern, Yüksek Hızlı Cyber-Clinical Workstation ve Ambalaj Stüdyosu
 */

(function () {
  'use strict';

  // --- UYGULAMA DURUMU (APP STATE) ---
  const state = {
    products: [],
    customProducts: [],
    currentMode: 'workstation', // 'workstation' | 'grid'
    selectedIndex: 0,
    filteredProducts: [],

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
        hastaSikayeti.secim_nedeni = '%2 Salisilik Asit gözenek içindeki sebumu eritir; hektonit kili fazla yağı çeker, seramidler bariyeri dengeler.';
        formulasyon.aktif_bilesenler = ['%2 Salisilik Asit (BHA)', 'Hektonit Kili', 'Niasinamid (B3 Vitamini)', '3 Temel Seramid'];
        muadilRehberi.en_yakin_muadil = 'La Roche-Posay Effaclar Jel / Bioderma Sébium Gel Actif';
      } else if (nameLower.includes('nemlendiren') || nameLower.includes('hydrating')) {
        ciltTipleri = ['Kuru Ciltler', 'Çok Kuru Ciltler', 'Normal Ciltler', 'Hassas Ciltler'];
        yasKriterleri.bebek_uygun_mu = true;
        hastaSikayeti.hasta_cumlesi = 'Yüzümü suyla bile yıkasam hemen geriliyor, pul pul dökülüyor ve kuruluktan kaşınıyor.';
        hastaSikayeti.secim_nedeni = 'Köpüksüz kremsi jel teknolojisi hidrolipidik tabakayı korur; Hyalüronik asit ve MVE ile yıkarken nemlendirir.';
        formulasyon.aktif_bilesenler = ['3 Temel Seramid (1, 3, 6-II)', 'Hyalüronik Asit', 'MVE Teknolojisi', 'Gliserin'];
        muadilRehberi.en_yakin_muadil = 'Cetaphil Nazik Cilt Temizleyici / Avene Tolerance Temizleme Losyonu';
      }
    }

    // ─── AVÈNE ÖZEL KURALLARI ───
    if (brandLower.includes('avene') || brandLower.includes('avène') || nameLower.includes('avene') || nameLower.includes('avène')) {
      if (nameLower.includes('termal') || nameLower.includes('thermal')) {
        ciltTipleri = ['Tüm Cilt Tipleri', 'Hassas Ciltler', 'Aşırı Reaktif Ciltler', 'Güneş Yanığı Olan Ciltler'];
        yasKriterleri.yenidogan_uygun_mu = true;
        yasKriterleri.bebek_uygun_mu = true;
        hastaSikayeti.hasta_cumlesi = 'Yüzümde ani kızarma, yanma ve batma hissi var; güneşten yandım ve tıraş/lazer sonrası cildim alev alev.';
        hastaSikayeti.secim_nedeni = 'Doğrudan kaynaktan steril ambalajlanan Avène Termal Suyu mikroflora dengesini korur, reaktiviteyi %64 azaltır.';
        formulasyon.aktif_bilesenler = ['%100 Saf Avène Termal Kaynak Suyu', 'Düşük Mineral İçeriği (266 mg/L)', 'Kalsiyum/Magnezyum 2:1 Dengesi'];
        muadilRehberi.en_yakin_muadil = 'La Roche-Posay Thermal Spring Water / Uriage Termal Su';
      } else if (nameLower.includes('rosamed') || nameLower.includes('antirougeurs')) {
        ciltTipleri = ['Kızarıklığa Eğilimli Ciltler', 'Rozasea (Gül Hastalığı)', 'Kılcal Damar Belirgin Ciltler'];
        hastaSikayeti.hasta_cumlesi = 'Yanaklarım ve burnum sürekli kırmızı, sıcak basınca hemen kızarıp alev alev yanıyor.';
        hastaSikayeti.secim_nedeni = 'Angiopause™ %1.8 etken maddesi ile kılcal damar genişlemesini ve kızarıklık nükslerini hedefler.';
        formulasyon.aktif_bilesenler = ['Angiopause™ %1.8', 'Avène Termal Kaynak Suyu', 'Dekstran Sülfat'];
        muadilRehberi.en_yakin_muadil = 'Bioderma Sensibio AR / La Roche-Posay Rosaliac AR';
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
        yasKriterleri: yasKriterleri
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
  // BÖLÜM 2: ŞABLON MODLARI (WORKSTATION vs GRID VITRIN)
  // =========================================================================
  function setViewMode(mode) {
    state.currentMode = mode;

    const btnWs = document.getElementById('btnModeWorkstation');
    const btnGrid = document.getElementById('btnModeGrid');
    const viewWs = document.getElementById('viewWorkstation');
    const viewGrid = document.getElementById('viewGrid');

    if (btnWs) btnWs.classList.toggle('active', mode === 'workstation');
    if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');

    if (viewWs) viewWs.style.display = mode === 'workstation' ? 'grid' : 'none';
    if (viewGrid) viewGrid.style.display = mode === 'grid' ? 'flex' : 'none';

    if (mode === 'grid') {
      renderGrid();
    } else {
      renderWorkstationSidebar();
      if (state.filteredProducts.length > 0) {
        loadStageProduct(state.selectedIndex);
      }
    }
  }

  // =========================================================================
  // BÖLÜM 3: ŞABLON 1 — KLİNİK ÇALIŞMA MASASI (SPLIT WORKSTATION)
  // =========================================================================
  function getFilteredProducts() {
    state.products = getEffectiveProducts();
    let list = state.products;

    if (state.activeBrand && state.activeBrand !== 'all') {
      const bTarget = state.activeBrand.toLowerCase();
      list = list.filter(p => (p.brand || '').toLowerCase().includes(bTarget));
    }

    if (state.activeRoutine && state.activeRoutine !== 'all') {
      list = list.filter(p => p.urun_tipi === state.activeRoutine);
    }

    const q = (state.searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(p => {
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

    return list;
  }

  function renderWorkstationSidebar() {
    const listEl = document.getElementById('wsProductList');
    const badgeEl = document.getElementById('wsCountBadge');
    if (!listEl) return;

    state.filteredProducts = getFilteredProducts();

    if (badgeEl) {
      badgeEl.textContent = `${state.filteredProducts.length} Ürün Hazır`;
    }

    if (state.filteredProducts.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.8rem;">🔍 Eşleşen ürün bulunamadı.</div>`;
      return;
    }

    // Ensure selectedIndex is within bounds
    if (state.selectedIndex >= state.filteredProducts.length) {
      state.selectedIndex = 0;
    }

    listEl.innerHTML = state.filteredProducts.map((p, idx) => {
      const isSelected = idx === state.selectedIndex;
      const imgSrc = p.image || 'images/placeholder.png';
      return `
        <div class="ws-list-item ${isSelected ? 'active' : ''}" data-idx="${idx}" data-id="${escapeHtml(p.id)}">
          <div class="ws-item-thumb">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='images/placeholder.png';">
          </div>
          <div class="ws-item-info">
            <div class="ws-item-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
            <div class="ws-item-meta">
              <span>${escapeHtml(p.brand || 'Dermo')}</span>
              <span>•</span>
              <span class="ws-item-badge">${escapeHtml(p.size || '')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function loadStageProduct(indexOrProduct) {
    let p = null;
    let idx = 0;

    if (typeof indexOrProduct === 'number') {
      idx = Math.max(0, Math.min(indexOrProduct, state.filteredProducts.length - 1));
      p = state.filteredProducts[idx];
      state.selectedIndex = idx;
    } else if (indexOrProduct && typeof indexOrProduct === 'object') {
      p = indexOrProduct;
      idx = state.filteredProducts.findIndex(x => x.id === p.id);
      if (idx !== -1) state.selectedIndex = idx;
    }

    if (!p) return;
    state.selectedProduct = p;

    // Sidebar active item güncelle
    document.querySelectorAll('.ws-list-item').forEach((item, i) => {
      item.classList.toggle('active', i === state.selectedIndex);
    });

    // Başlık ve Rozetler
    setText('stageProdTitle', p.name);
    setText('stageBrandBadge', p.brand || 'Klinik');
    setText('stageTypeBadge', `${p.urun_tipi_icon || '🏷️'} ${p.urun_tipi || 'Dermokozmetik'}`);
    setText('stageSubcatBadge', p.sub_category || 'Özel Bakım');
    setText('stageSizeBadge', `📦 ${p.size || p.form || 'Orijinal Ambalaj'}`);

    // Görsel
    const imgEl = document.getElementById('stageProductImg');
    if (imgEl) {
      imgEl.src = p.image || 'images/placeholder.png';
      imgEl.alt = p.name;
    }
    setText('stageImageBadge', `${p.brand || 'Resmi'} 4K Stüdyo Ambalajı`);

    // BLOK 1: KİME UYGUN? & YAŞ MATRİSİ
    const skinTypes = (p.kime_uygun && p.kime_uygun.cilt_tipleri) || p.cilt_tipleri || [];
    const ciltEl = document.getElementById('stageCiltTipleri');
    if (ciltEl) {
      ciltEl.innerHTML = skinTypes.length > 0
        ? skinTypes.map(c => `<span class="pill-item">✓ ${escapeHtml(c)}</span>`).join('')
        : '<span class="pill-item">Tüm Cilt Tipleri</span>';
    }

    const yk = (p.kime_uygun && p.kime_uygun.yasKriterleri) || (p.kime_uygun && p.kime_uygun.yas_kriterleri) || {};
    const yasMatrisiEl = document.getElementById('stageYasMatrisi');
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

    const yasAciklamaEl = document.getElementById('stageYasAciklama');
    if (yasAciklamaEl) {
      yasAciklamaEl.textContent = yk.yas_aciklama_detay || p.yas_grubu || 'Özel bir yaş sınırlaması bulunmamaktadır.';
    }

    // BLOK 2: GÜVENLİK FİLTRESİ
    const sec = p.guvenlik_filtresi || {};
    setText('stageKontrendikasyon', sec.kontrendikasyonlar || p.kimler_kullanamaz || 'Açık yaralara ve sızıntılı enfekte dokulara doğrudan uygulanmaz.');
    setText('stageGozCevresi', sec.goz_cevresi_temas || 'Göz mukozası ile doğrudan temastan kaçınınız. Temas halinde bol su ile yıkayınız.');
    setText('stageDoktoraYonlendir', sec.doktora_yonlendirme || '2 haftayı aşan, şiddetli yanma veya kabarma görülen durumlarda hekime yönlendiriniz.');

    // BLOK 3: HASTA ŞİKAYETİ
    const sik = p.hasta_sikayeti || {};
    const hastaCumle = sik.hasta_cumlesi || (p.hangi_sikayetle_gelene_verilir && p.hangi_sikayetle_gelene_verilir[0]) || 'Cilt sağlığımı destekleyecek ve günlük bakımımı sağlayacak güvenilir bir ürün arıyorum.';
    setText('stageHastaSikayeti', `💬 “${hastaCumle}”`);
    setText('stageEczaciSorusu', `🩺 Eczacı Sorusu: ${sik.eczaci_sorusu || 'Şikayetinizin ne zamandır devam ettiğini ve mevcut hekim tedavilerinizi sorgulayınız.'}`);
    setText('stageSecimNedeni', `💡 Neden Bu Ürün?: ${sik.secim_nedeni || 'Cilt florasını bozmadan bariyeri onaran yüksek toleranslı dermokozmetik formülasyon.'}`);

    // BLOK 4: FORMÜLASYON & AKTİFLER
    const form = p.formulasyon || {};
    const aktiflerEl = document.getElementById('stageAktifBilesenler');
    if (aktiflerEl) {
      const actives = form.aktif_bilesenler || p.etken_maddeler || [];
      aktiflerEl.innerHTML = actives.length > 0
        ? actives.map(a => `<span class="active-pill">🔬 ${escapeHtml(a)}</span>`).join('')
        : '<span class="active-pill">Dermokozmetik Kompleks</span>';
    }

    const rozetlerEl = document.getElementById('stageKlinikRozetler');
    if (rozetlerEl) {
      const badges = form.rozetler || ['Dermatolojik Olarak Test Edildi', 'Hipoalerjenik', 'Parfümsüz'];
      rozetlerEl.innerHTML = badges.map(b => `<span class="badge-rozet">${escapeHtml(b)}</span>`).join('');
    }

    setText('stageDoku', `🧴 Doku: ${form.doku || 'Hafif, yapışkan his bırakmayan doku'}`);
    setText('stagePh', `⚖️ pH: ${form.fizyolojik_ph || '5.5'}`);

    // BLOK 5: PROTOKOL
    const proto = p.kullanim_protokolu || {};
    setText('stageRutinSira', proto.rutin_siralamasi || p.rutin_adimi || 'Temel Cilt Bakım Protokolü');
    setText('stageZamanSiklik', `⏱️ Zaman & Sıklık: ${proto.zaman_ve_siklik || 'Günde 2 kez (Sabah - Akşam)'} • Miktar: ${proto.miktar || 'Yeterli miktar'}`);
    setText('stageUygulamaSekli', `✋ Uygulama: ${proto.uygulama_sekli || p.nasil_kullanilir || 'Temiz cilde dairesel masajla uygulanır.'}\n📈 Beklenen Sonuç: ${proto.beklenen_sonuc || 'İlk kullanımda rahatlama, düzenli kullanımda güçlü bariyer.'}`);

    // BLOK 6: KOMBİNASYONLAR
    const komb = p.kombinasyonlar || {};
    const tamamEl = document.getElementById('stageTamamlayici');
    if (tamamEl) {
      const comps = komb.tamamlayici_kombinler || [];
      tamamEl.innerHTML = comps.length > 0
        ? comps.map(c => `<span class="comp-pill-link">🔗 ${escapeHtml(c)}</span>`).join('')
        : '<span style="font-size:0.75rem; color:var(--text-muted);">Temel günlük rutin ürünleriyle güvenle kombine edilebilir.</span>';
    }

    const cakismaEl = document.getElementById('stageYasakliCakisma');
    if (cakismaEl) {
      const confs = komb.yasakli_cakismalar || [];
      cakismaEl.innerHTML = confs.length > 0
        ? confs.map(c => `<span class="pill-item danger">⚠️ ${escapeHtml(c)}</span>`).join('')
        : '<span style="font-size:0.75rem; color:var(--emerald);">✓ Bilinen kritik bir kimyasal çakışması bulunmuyor.</span>';
    }

    // BLOK 7: MUADİL REHBERİ
    const muad = p.muadil_rehberi || {};
    setText('stageEnYakinMuadil', `🎯 En Yakın Alternatif: ${muad.en_yakin_muadil || 'Benzer dermokozmetik formülasyonlar değerlendirilebilir.'}`);
    setText('stageMuadilFark', `⚖️ Klinik Fark: ${muad.alternatif_fark_notu || 'Doku ve tolerans profiline göre danışana uygun olanı tercih ediniz.'}`);
  }

  function nextStageProduct() {
    if (state.filteredProducts.length === 0) return;
    const nextIdx = (state.selectedIndex + 1) % state.filteredProducts.length;
    loadStageProduct(nextIdx);
  }

  function prevStageProduct() {
    if (state.filteredProducts.length === 0) return;
    const prevIdx = (state.selectedIndex - 1 + state.filteredProducts.length) % state.filteredProducts.length;
    loadStageProduct(prevIdx);
  }

  function copyCurrentPatientNote() {
    const p = state.selectedProduct;
    if (!p) return;

    const yk = (p.kime_uygun && p.kime_uygun.yas_kriterleri) || {};
    const sec = p.guvenlik_filtresi || {};
    const sik = p.hasta_sikayeti || {};
    const proto = p.kullanim_protokolu || {};
    const muad = p.muadil_rehberi || {};

    const text = `📋 ${p.name} (${p.size || ''})\n` +
      `═══════════════════════════════════════════\n` +
      `🎯 KİME UYGUN: ${(p.kime_uygun?.cilt_tipleri || p.cilt_tipleri || []).join(', ')}\n` +
      `👶 YAŞ GRUBU: ${yk.yas_aciklama_detay || p.yas_grubu || 'Tüm Yaşlar'}\n` +
      `⚠️ GÜVENLİK: ${sec.kontrendikasyonlar || p.kimler_kullanamaz || 'Açık yaralara sürülmez'}\n` +
      `💬 DANIŞAN ŞİKAYETİ: "${sik.hasta_cumlesi || ''}"\n` +
      `⏱️ NASIL KULLANILIR: ${proto.uygulama_sekli || p.nasil_kullanilir || ''} (${proto.zaman_ve_siklik || 'Günde 2 kez'})\n` +
      `⚖️ EN YAKIN MUADİL: ${muad.en_yakin_muadil || 'Eşdeğer dermo formülasyon'}\n` +
      `═══════════════════════════════════════════\n` +
      `[arekros — Klinik Danışmanlık Konsolu]`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ Danışan klinik notu panoya kopyalandı!');
    });
  }

  // =========================================================================
  // BÖLÜM 4: ŞABLON 2 — VİTRİN KATALOĞU (GRID VIEW)
  // =========================================================================
  function renderGrid() {
    const gridEl = document.getElementById('catalogProductGrid');
    const countPill = document.getElementById('catalogCountPill');
    if (!gridEl) return;

    const filtered = getFilteredProducts();

    if (countPill) {
      countPill.textContent = `${filtered.length} Ürün Hazır`;
    }

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="color:#ffffff; margin-bottom: 0.35rem;">Kriterlere Uygun Ürün Bulunamadı</h3>
        </div>
      `;
      return;
    }

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
  // BÖLÜM 5: BİRLEŞİK YENİ ÜRÜN STÜDYOSU (RAF & WEBDEN TEKİL EKLEME)
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
      
      // Update lists
      renderWorkstationSidebar();
      loadStageProduct(fullProduct);
      renderGrid();

      showToast(`✓ "${item.name}" başarıyla eklendi!`);

      state.shelfWizard.completed.add(state.shelfWizard.currentIndex);
      const nextIdx = state.shelfWizard.currentIndex + 1;
      if (nextIdx < state.shelfWizard.queue.length) {
        loadWizardProduct(nextIdx);
      } else {
        closeUnifiedStudio();
        showToast('🌟 Tebrikler! Raftaki tüm ürünler stüdyo fotoğrafları ve 7 blok klinik künyeleriyle arekros sistemine eklendi!');
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
      
      closeUnifiedStudio();
      showToast(`✓ "${cleanName}" başarıyla arekros sistemine eklendi!`);
      
      setViewMode('workstation');
      renderWorkstationSidebar();
      loadStageProduct(newProduct);
      renderGrid();
    } catch (err) {
      showToast('Ürün kaydedilirken hata oluştu.');
      console.error(err);
    }
  }

  // =========================================================================
  // BÖLÜM 6: LIGHTBOX BÜYÜTME MODALI
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
  // BÖLÜM 7: SUNUCU DURUMU & TOGGLE
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
  // BÖLÜM 8: EVENT DİNLEYİCİLERİ
  // =========================================================================
  function initEventListeners() {
    // 1. Şablon Değiştirici Butonları
    const btnModeWs = document.getElementById('btnModeWorkstation');
    const btnModeGrid = document.getElementById('btnModeGrid');

    if (btnModeWs) btnModeWs.addEventListener('click', () => setViewMode('workstation'));
    if (btnModeGrid) btnModeGrid.addEventListener('click', () => setViewMode('grid'));

    // 2. Workstation Sidebar Arama & Filtreler
    const wsSearch = document.getElementById('wsSearchInput');
    const btnWsClear = document.getElementById('btnWsClearSearch');
    let searchTimer = null;

    if (wsSearch) {
      wsSearch.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const val = wsSearch.value;
        if (btnWsClear) btnWsClear.style.display = val ? 'block' : 'none';

        searchTimer = setTimeout(() => {
          state.searchQuery = val;
          renderWorkstationSidebar();
          if (state.filteredProducts.length > 0) {
            loadStageProduct(0);
          }
          if (state.currentMode === 'grid') renderGrid();
        }, 120);
      });

      if (btnWsClear) {
        btnWsClear.addEventListener('click', () => {
          wsSearch.value = '';
          btnWsClear.style.display = 'none';
          state.searchQuery = '';
          renderWorkstationSidebar();
          if (state.filteredProducts.length > 0) loadStageProduct(0);
          if (state.currentMode === 'grid') renderGrid();
          wsSearch.focus();
        });
      }
    }

    // Workstation Select Filtreleri
    const wsBrandSel = document.getElementById('wsBrandSelect');
    if (wsBrandSel) {
      wsBrandSel.addEventListener('change', (e) => {
        state.activeBrand = e.target.value;
        renderWorkstationSidebar();
        if (state.filteredProducts.length > 0) loadStageProduct(0);
        if (state.currentMode === 'grid') renderGrid();
      });
    }

    const wsRoutineSel = document.getElementById('wsRoutineSelect');
    if (wsRoutineSel) {
      wsRoutineSel.addEventListener('change', (e) => {
        state.activeRoutine = e.target.value;
        renderWorkstationSidebar();
        if (state.filteredProducts.length > 0) loadStageProduct(0);
        if (state.currentMode === 'grid') renderGrid();
      });
    }

    // Workstation Sidebar Ürün Tıklamaları
    const wsList = document.getElementById('wsProductList');
    if (wsList) {
      wsList.addEventListener('click', (e) => {
        const item = e.target.closest('.ws-list-item');
        if (!item) return;
        const idx = parseInt(item.dataset.idx, 10);
        loadStageProduct(idx);
      });
    }

    // Workstation Sahne Kontrolleri (Önceki/Sonraki/Kopyala)
    const btnWsPrev = document.getElementById('btnWsPrev');
    const btnWsNext = document.getElementById('btnWsNext');
    if (btnWsPrev) btnWsPrev.addEventListener('click', prevStageProduct);
    if (btnWsNext) btnWsNext.addEventListener('click', nextStageProduct);

    const btnWsCopy = document.getElementById('btnWsCopyNote');
    if (btnWsCopy) btnWsCopy.addEventListener('click', copyCurrentPatientNote);

    const btnStageZoom = document.getElementById('btnStageZoom');
    if (btnStageZoom) {
      btnStageZoom.addEventListener('click', () => {
        if (state.selectedProduct) {
          openLightbox(state.selectedProduct.image, state.selectedProduct.name);
        }
      });
    }

    // Klavye Kısayolları (Ctrl+K, Sol/Sağ/Yukarı/Aşağı Ok)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (wsSearch) {
          wsSearch.focus();
          wsSearch.select();
        }
        return;
      }

      if (e.key === 'Escape') {
        closeLightbox();
        closeUnifiedStudio();
        return;
      }

      // Sadece input odaklı değilse ok tuşlarıyla gezin
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
      if (!isInput && state.currentMode === 'workstation') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          nextStageProduct();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          prevStageProduct();
        }
      }
    });

    // Grid Modu Kart Tıklamaları (Tıklanan ürünü doğrudan Workstation'da açar)
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
          const p = state.products.find(x => x.id === card.dataset.id);
          if (p) {
            setViewMode('workstation');
            loadStageProduct(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });
    }

    // Grid Modu Marka ve Rutin Çipleri
    const brandRow = document.getElementById('brandFilterRow');
    if (brandRow) {
      brandRow.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        brandRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeBrand = chip.dataset.brand;
        if (wsBrandSel) wsBrandSel.value = state.activeBrand;
        renderGrid();
        renderWorkstationSidebar();
      });
    }

    const routineRow = document.getElementById('routineFilterRow');
    if (routineRow) {
      routineRow.addEventListener('click', (e) => {
        const pill = e.target.closest('.routine-pill');
        if (!pill) return;
        routineRow.querySelectorAll('.routine-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeRoutine = pill.dataset.type;
        if (wsRoutineSel) wsRoutineSel.value = state.activeRoutine;
        renderGrid();
        renderWorkstationSidebar();
      });
    }

    // Birleşik Stüdyo Modal Butonları
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

    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchStudioTab(btn.dataset.tab));
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

    // Lightbox Kapatma & Seçim
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

    // Stüdyo Aç/Kapat Butonu
    const headerToggleBtn = document.getElementById('headerServerToggleBtn');
    if (headerToggleBtn) headerToggleBtn.addEventListener('click', toggleServerEngine);
  }

  // =========================================================================
  // BAŞLATMA
  // =========================================================================
  function initApp() {
    loadPersistedData();
    state.products = getEffectiveProducts();
    state.filteredProducts = [...state.products];

    // Varsayılan görünüm: Workstation (Klinik Çalışma Masası)
    setViewMode('workstation');
    renderWorkstationSidebar();
    if (state.filteredProducts.length > 0) {
      loadStageProduct(0);
    }

    initEventListeners();
    startServerHealthCheck();
  }

  window.openLightbox = openLightbox;
  window.openUnifiedStudio = openUnifiedStudio;
  window.setViewMode = setViewMode;

  document.addEventListener('DOMContentLoaded', initApp);

})();
