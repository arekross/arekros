/**
 * arekros — Minimalist Klinik Atlas & Danışmanlık Konsolu
 * Konsept A: Apple Health & Notion Mimarisi
 */

(function () {
  'use strict';

  // --- UYGULAMA DURUMU (STATE) ---
  const state = {
    products: [],
    customProducts: [],
    currentMode: 'workstation', // 'workstation' | 'grid'
    currentTab: 'danismanlik',   // 'danismanlik' | 'hafiza' | 'kaynak'
    currentTheme: localStorage.getItem('arekros_theme') || 'light',
    
    selectedIndex: 0,
    filteredProducts: [],
    
    activeBrand: 'all',
    activeRoutine: 'all',
    searchQuery: '',
    
    flashcardFlipped: false,
    knownCards: new Set(),

    shelfWizard: {
      step: 'upload',
      detectedItems: [],
      currentIndex: 0
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

  function getEffectiveProducts() {
    let base = [];
    if (typeof window.PRODUCTS_DATA !== 'undefined' && Array.isArray(window.PRODUCTS_DATA)) {
      base = window.PRODUCTS_DATA;
    } else if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
      base = PRODUCTS_DATA;
    }
    
    try {
      const stored = localStorage.getItem('arekros_custom_products');
      if (stored) {
        state.customProducts = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Custom products read error:', e);
    }

    const all = [...state.customProducts, ...base];
    return all.map(p => ensureClinicalData(p));
  }

  function ensureClinicalData(p) {
    const cleanBrand = (p.brand || '').trim();
    const cleanName = (p.name || '').trim();
    const subcat = (p.sub_category || '').trim();

    // Yaş kriterleri
    const rawAge = (p.yas_grubu || '').toLowerCase();
    const isBaby = rawAge.includes('bebek') || rawAge.includes('yenidoğan') || cleanBrand.toLowerCase().includes('mustela');
    const isNewborn = rawAge.includes('yenidoğan') || (isBaby && cleanName.toLowerCase().includes('foam shampoo'));
    const isPregnancySafe = !cleanName.toLowerCase().includes('retinol') && !cleanName.toLowerCase().includes('salicylic') && !rawAge.includes('gebelikte kullanılmaz');

    const yasKriterleri = {
      yenidogan_uygun_mu: isNewborn,
      bebek_uygun_mu: isBaby,
      cocuk_uygun_mu: true,
      ergen_uygun_mu: true,
      yetiskin_uygun_mu: true,
      geriatri_uygun_mu: true,
      gebelik_guvenli_mi: isPregnancySafe,
      emzirme_guvenli_mi: isPregnancySafe,
      yas_aciklama_detay: p.yas_grubu || 'Hekim veya eczacı aksini belirtmedikçe ergen ve yetişkinler için uygundur.'
    };

    // Güvenlik filtresi
    const guvenlik = p.guvenlik_filtresi || {
      kontrendikasyonlar: p.kimler_kullanamaz || 'Açık yaralara, aktif kanamalı veya sızıntılı lezyonlara doğrudan sürülmez.',
      goz_cevresi_temas: cleanName.toLowerCase().includes('göz') || cleanName.toLowerCase().includes('eye')
        ? 'Göz çevresine özel formüle edilmiştir; hafif tampon hareketlerle uygulanır.'
        : 'Göz mukozası ile doğrudan temastan kaçınınız. Temas halinde bol su ile durulayınız.',
      doktora_yonlendirme: 'Ciltte ani şiddetli kabarma, geçmeyen yanma veya 2 haftalık düzenli kullanımda gerilemeyen şikayetlerde dermatoloğa yönlendiriniz.'
    };

    // Danışan şikayeti & Eczacı danışmanlığı
    const hastaSikayeti = p.hasta_sikayeti || {
      hasta_cumlesi: (p.hangi_sikayetle_gelene_verilir && p.hangi_sikayetle_gelene_verilir[0]) ||
        (cleanName.toLowerCase().includes('kızarıklık') ? 'Yüzümde özellikle yanaklarımda sürekli bir kızarıklık, yanma ve damar belirginleşmesi var.' :
         cleanName.toLowerCase().includes('nem') ? 'Cildim çok geriliyor, pul pul dökülüyor ve mat cansız görünüyor.' :
         cleanName.toLowerCase().includes('akne') ? 'T bölgemde gözenekler tıkalı, sivilce ve parlama problemi yaşıyorum.' :
         'Cildimin koruyucu bariyerini güçlendirecek ve günlük bakımımı sağlayacak güvenilir bir ürün arıyorum.'),
      eczaci_sorusu: 'Şikayetinizin ne zamandır devam ettiğini, mevsimsel değişimleri ve şu an kullandığınız diğer aktifleri sorgulayınız.',
      secim_nedeni: 'Cilt florasını bozmadan bariyer lipidlerini takviye eden yüksek toleranslı dermokozmetik formül.',
      arama_etiketleri: ['kuruluk', 'hassasiyet', 'kızarıklık', 'bariyer onarım', 'nemsizlik', cleanBrand.toLowerCase()]
    };

    // Formülasyon
    const formulasyon = p.formulasyon || {
      aktif_bilesenler: p.etken_maddeler || ['Termal Su', 'Seramid Kompleksi', 'Hyalüronik Asit', 'Gliserin'],
      rozetler: ['Dermatolojik Olarak Test Edildi', 'Hipoalerjenik', 'Komedojenik Değil'],
      doku: p.form || 'Hafif, yapışkan his bırakmayan doku',
      ph: '5.5 (Ciltle Uyumlu)'
    };

    // Kullanım Protokolü
    const kullanimProtokolu = p.kullanim_protokolu || {
      rutindeki_yeri: p.rutin_adimi || '3. Adım: Nemlendirme & Bariyer Güçlendirme',
      zaman_ve_siklik: 'Günde 2 kez (Sabah ve Akşam)',
      uygulama_sekli: p.nasil_kullanilir || 'Temizlenmiş cilde nazik dairesel hareketlerle masaj yapılarak uygulanır.',
      beklenen_etki_suresi: 'İlk kullanımda anında yatışma; 2-4 haftalık düzenli kullanımda güçlenmiş cilt bariyeri.'
    };

    // Kombinasyonlar & Muadil
    const kombinasyonlar = p.kombinasyonlar || {
      birlikte_onerilenler: 'Temizleme jeli ve mineral filtreli güneş koruyucu ile mükemmel uyum sağlar.',
      birlikte_kullanilmayacaklar: cleanName.toLowerCase().includes('retinol')
        ? 'Aynı anda yüksek konsantrasyonlu AHA/BHA asitlerle kombine edilmemelidir.'
        : 'Bilinen kritik bir kimyasal çakışması yoktur.'
    };

    const muadilRehberi = p.muadil_rehberi || {
      en_yakin_muadil: cleanBrand === 'Avène' ? 'Bioderma Sensibio veya La Roche-Posay Toleriane Serisi' :
                       cleanBrand === 'CeraVe' ? 'Cetaphil Nemlendirici veya Bioderma Atoderm Serisi' :
                       'La Roche-Posay / Avene eşdeğer dermokozmetik serileri.'
    };

    return {
      ...p,
      brand: cleanBrand || 'Dermo',
      name: cleanName,
      kime_uygun: {
        cilt_tipleri: p.cilt_tipleri || ['Tüm Cilt Tipleri'],
        yasKriterleri: yasKriterleri
      },
      guvenlik_filtresi: guvenlik,
      hasta_sikayeti: hastaSikayeti,
      formulasyon: formulasyon,
      kullanim_protokolu: kullanimProtokolu,
      kombinasyonlar: kombinasyonlar,
      muadil_rehberi: muadilRehberi
    };
  }

  // --- 2. TEMA VE GÖRÜNÜM MODLARI ---
  function applyTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('arekros_theme', theme);

    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (icon && label) {
      if (theme === 'dark') {
        icon.textContent = '🌙';
        label.textContent = 'Koyu Mod';
      } else {
        icon.textContent = '☀️';
        label.textContent = 'Açık Mod';
      }
    }
  }

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

  function setConsoleTab(tab) {
    state.currentTab = tab;
    
    // Tab butonları
    document.querySelectorAll('.console-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    // Paneller
    const paneDan = document.getElementById('paneDanismanlik');
    const paneHaf = document.getElementById('paneHafiza');
    const paneKay = document.getElementById('paneKaynak');

    if (paneDan) paneDan.style.display = tab === 'danismanlik' ? 'flex' : 'none';
    if (paneHaf) {
      paneHaf.style.display = tab === 'hafiza' ? 'flex' : 'none';
      if (tab === 'hafiza') updateFlashcardView();
    }
    if (paneKay) {
      paneKay.style.display = tab === 'kaynak' ? 'flex' : 'none';
      if (tab === 'kaynak') updateReferenceView();
    }
  }

  // --- 3. ÜRÜN FİLTRELEME & ARAMA ---
  function getFilteredProducts() {
    state.products = getEffectiveProducts();
    let list = state.products;

    if (state.activeBrand && state.activeBrand !== 'all') {
      list = list.filter(p => p.brand && p.brand.toLowerCase() === state.activeBrand.toLowerCase());
    }

    if (state.activeRoutine && state.activeRoutine !== 'all') {
      list = list.filter(p => p.urun_tipi === state.activeRoutine || (p.rutin_adimi && p.rutin_adimi.includes(state.activeRoutine)));
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(p => {
        const inName = (p.name || '').toLowerCase().includes(q);
        const inBrand = (p.brand || '').toLowerCase().includes(q);
        const inComplaint = (p.hasta_sikayeti && p.hasta_sikayeti.hasta_cumlesi || '').toLowerCase().includes(q);
        const inActives = (p.formulasyon && p.formulasyon.aktif_bilesenler || []).some(a => a.toLowerCase().includes(q));
        const inTags = (p.hasta_sikayeti && p.hasta_sikayeti.arama_etiketleri || []).some(t => t.includes(q));
        return inName || inBrand || inComplaint || inActives || inTags;
      });
    }

    state.filteredProducts = list;
    return list;
  }

  // --- 4. SOL ATLAS LİSTESİ RENDER ---
  function renderWorkstationSidebar() {
    const listEl = document.getElementById('wsProductList');
    const countBadge = document.getElementById('wsCountBadge');
    if (!listEl) return;

    const products = getFilteredProducts();
    if (countBadge) {
      countBadge.textContent = `${products.length} Ürün Hazır`;
    }

    if (products.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🔍</div>
          <p style="font-weight: 600;">Eşleşen ürün bulunamadı</p>
        </div>
      `;
      return;
    }

    if (state.selectedIndex >= products.length) {
      state.selectedIndex = 0;
    }

    listEl.innerHTML = products.map((p, idx) => {
      const isSelected = idx === state.selectedIndex;
      const imgSrc = p.image || 'images/placeholder.png';
      return `
        <div class="atlas-list-item ${isSelected ? 'selected' : ''}" data-index="${idx}">
          <div class="item-thumb-box">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='images/placeholder.png';">
          </div>
          <div class="item-text-stack">
            <span class="item-name-text" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
            <span class="item-meta-sub">
              <strong>${escapeHtml(p.brand)}</strong> • ${escapeHtml(p.size || p.form || '')}
            </span>
          </div>
        </div>
      `;
    }).join('');

    // Seçili elemana yumuşak kaydır
    const selectedEl = listEl.querySelector('.atlas-list-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // --- 5. SAHNE & KONSOL DOLDURMA (LOAD STAGE PRODUCT) ---
  function loadStageProduct(indexOrProduct) {
    let p = null;
    if (typeof indexOrProduct === 'number') {
      state.selectedIndex = indexOrProduct;
      p = state.filteredProducts[state.selectedIndex];
    } else if (indexOrProduct && typeof indexOrProduct === 'object') {
      p = indexOrProduct;
      const foundIdx = state.filteredProducts.findIndex(x => x.id === p.id);
      if (foundIdx !== -1) state.selectedIndex = foundIdx;
    }

    if (!p) return;

    // Üst kimlik
    setText('stageProdTitle', p.name);
    setText('stageBrandBadge', p.brand);
    setText('stageTypeBadge', p.urun_tipi || 'Dermokozmetik Bakım');
    setText('stageSubcatBadge', p.sub_category || 'Klinik Seri');
    setText('stageSizeBadge', p.size || p.form || 'Orijinal Ambalaj');

    // Görsel
    const imgEl = document.getElementById('stageProductImg');
    if (imgEl) {
      imgEl.src = p.image || 'images/placeholder.png';
      imgEl.alt = p.name;
    }
    setText('stageImageBadge', `${p.brand} 4K Stüdyo Ambalajı`);

    // Hızlı özet
    setText('stageRutinSira', p.kullanim_protokolu.rutindeki_yeri || '1. Adım');
    setText('stageDoku', p.formulasyon.doku || 'Hafif Doku');
    setText('stagePh', p.formulasyon.ph || 'Ciltle Uyumlu pH');

    // SEKME 1: DANIŞMANLIK BİLGİLERİ
    const sik = p.hasta_sikayeti || {};
    setText('stageHastaSikayeti', `“${sik.hasta_cumlesi || 'Cilt bariyerimi güçlendirecek ve günlük bakımımı sağlayacak bir ürün arıyorum.'}”`);
    setText('stageEczaciSorusu', sik.eczaci_sorusu || 'Şikayetin ne zamandır devam ettiğini ve mevcut hekim tedavilerini sorgulayınız.');
    setText('stageSecimNedeni', sik.secim_nedeni || 'Cilt florasını bozmadan bariyeri onaran yüksek toleranslı formülasyon.');

    // Cilt Tipleri
    const ciltEl = document.getElementById('stageCiltTipleri');
    if (ciltEl) {
      const types = (p.kime_uygun && p.kime_uygun.cilt_tipleri) || ['Tüm Cilt Tipleri'];
      ciltEl.innerHTML = types.map(t => `<span class="pill-item">✓ ${escapeHtml(t)}</span>`).join('');
    }

    // Yaş Matrisi Pilleri
    const yk = (p.kime_uygun && p.kime_uygun.yasKriterleri) || {};
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
    setText('stageYasAciklama', yk.yas_aciklama_detay || 'Hekim veya eczacı aksini belirtmedikçe güvenle kullanılır.');

    // Güvenlik
    const sec = p.guvenlik_filtresi || {};
    setText('stageKontrendikasyon', sec.kontrendikasyonlar || 'Açık yaralara veya aktif lezyonlara uygulanmaz.');
    setText('stageGozCevresi', sec.goz_cevresi_temas || 'Göz mukozası ile doğrudan temastan kaçınınız.');
    setText('stageDoktoraYonlendir', sec.doktora_yonlendirme || '2 haftalık düzenli kullanımda gerilemeyen vakalarda sevk ediniz.');

    // Protokol
    const proto = p.kullanim_protokolu || {};
    setText('stageZamanSiklik', proto.zaman_ve_siklik || 'Günde 2 kez (Sabah - Akşam)');
    setText('stageUygulamaSekli', `${proto.uygulama_sekli || 'Nazikçe masaj yaparak uygulayınız.'} — ${proto.beklenen_etki_suresi || '2-4 haftada belirgin etki.'}`);

    // Aktifler & Rozetler
    const form = p.formulasyon || {};
    const aktiflerEl = document.getElementById('stageAktifBilesenler');
    if (aktiflerEl) {
      const actives = form.aktif_bilesenler || ['Dermokozmetik Kompleks'];
      aktiflerEl.innerHTML = actives.map(a => `<span class="active-pill">🔬 ${escapeHtml(a)}</span>`).join('');
    }
    const rozetEl = document.getElementById('stageKlinikRozetler');
    if (rozetEl) {
      const rozetler = form.rozetler || ['Dermatolojik Olarak Test Edildi'];
      rozetEl.innerHTML = rozetler.map(r => `<span class="badge-rozet">${escapeHtml(r)}</span>`).join('');
    }

    // Duo Grid
    const komb = p.kombinasyonlar || {};
    const muad = p.muadil_rehberi || {};
    setText('stageKombinasyonOneri', komb.birlikte_onerilenler || 'Temizleyici ve güneş koruyucu ile kombine edilebilir.');
    setText('stageMuadilOneri', muad.en_yakin_muadil || 'Eşdeğer dermo seriler.');

    // Flashcard & Kaynak sekmesi güncellemeleri
    if (state.currentTab === 'hafiza') updateFlashcardView();
    if (state.currentTab === 'kaynak') updateReferenceView();

    // Sol listede seçili sınıfını tazele
    const listItems = document.querySelectorAll('.atlas-list-item');
    listItems.forEach((item, idx) => {
      item.classList.toggle('selected', idx === state.selectedIndex);
    });
  }

  // --- 6. İNTERAKTİF FLASHCARD (ÖĞRENME & HAFIZA MODU) ---
  function updateFlashcardView() {
    const p = state.filteredProducts[state.selectedIndex];
    if (!p) return;

    state.flashcardFlipped = false;
    const box = document.getElementById('flashcardBox');
    if (box) box.classList.remove('flipped');

    const fcImg = document.getElementById('fcImg');
    if (fcImg) {
      fcImg.src = p.image || 'images/placeholder.png';
      fcImg.alt = p.name;
    }

    setText('fcQuestionTitle', `"${p.name}" hangi danışan şikayetinde ilk tercih edilir?`);
    setText('fcProdName', p.name);
    setText('fcComplaint', p.hasta_sikayeti.hasta_cumlesi || 'Cilt şikayeti');
    setText('fcActives', (p.formulasyon.aktif_bilesenler || []).join(', '));
    setText('fcSafety', p.guvenlik_filtresi.kontrendikasyonlar || 'Güvenlik uyarısı');
    setText('fcProtocol', p.kullanim_protokolu.zaman_ve_siklik || 'Kullanım sıklığı');

    const statsText = document.getElementById('fcStatsText');
    if (statsText) {
      statsText.textContent = `Çalışılan: ${state.selectedIndex + 1} / ${state.filteredProducts.length} | Öğrenilen: ${state.knownCards.size}`;
    }
  }

  function flipFlashcard() {
    const box = document.getElementById('flashcardBox');
    if (!box) return;
    state.flashcardFlipped = !state.flashcardFlipped;
    box.classList.toggle('flipped', state.flashcardFlipped);
  }

  // --- 7. SEKME 3: ECZANE EĞİTİM REHBERİ ---
  function updateReferenceView() {
    const p = state.filteredProducts[state.selectedIndex];
    if (!p) return;

    const brand = p.brand || 'Dermo';
    let docName = 'Emre_Ege_Eczanesi_Dermokozmetik_Temel_Etken_Maddeler_Egitim_Rehberi.pdf';
    if (brand.includes('Avène')) docName = 'Emre_Ege_Eczanesi_Avene_Tum_Urunler_Egitim_Rehberi.pdf';
    else if (brand.includes('Bioderma')) docName = 'Emre_Ege_Eczanesi_Bioderma_Tum_Urunler_Egitim_Rehberi.pdf';
    else if (brand.includes('Caudalie')) docName = 'Emre_Ege_Eczanesi_Caudalie_Tum_Urunler_Egitim_Rehberi.pdf';
    else if (brand.includes('La Roche')) docName = 'Emre_Ege_Eczanesi_La_Roche_Posay_Tum_Urunler_Egitim_Rehberi.pdf';
    else if (brand.includes('Lierac')) docName = 'Emre_Ege_Eczanesi_Lierac_Tum_Urunler_Egitim_Rehberi.pdf';
    else if (brand.includes('Ocean')) docName = 'Gıda Takviyeleri Eylül 2026.pdf';

    const docBadge = document.getElementById('refDocBadge');
    if (docBadge) {
      docBadge.innerHTML = `<span>📄 Kaynaklar/${escapeHtml(docName)}</span>`;
    }

    setText('refDocSummary', `Bu ürün (${p.name}), eczane eğitim portföyünde ${p.sub_category || 'hedefe yönelik bakım'} sınıfında yer almaktadır. Birincil etken maddesi (${(p.formulasyon.aktif_bilesenler || [])[0] || 'Dermo Aktif'}), cilt bariyerini tahriş etmeden onarmak üzere hekim ve eczacı tavsiyesiyle konumlandırılmıştır.`);
    setText('refPharmacistTip', `Tezgahta danışana sunarken: "${p.hasta_sikayeti.hasta_cumlesi}" şikayetini teyit edip, ${p.kullanim_protokolu.zaman_ve_siklik} kullanım talimatını ve göz çevresi sınırını (${p.guvenlik_filtresi.goz_cevresi_temas}) mutlaka sözlü vurgulayınız.`);
  }

  // --- 8. VİTRİN KATALOĞU (GRID GÖRÜNÜMÜ) ---
  function renderGrid() {
    const gridEl = document.getElementById('catalogProductGrid');
    if (!gridEl) return;

    const products = getFilteredProducts();
    if (products.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>Kriterlere Uygun Ürün Bulunamadı</h3>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = products.map(p => {
      const imgSrc = p.image || 'images/placeholder.png';
      return `
        <div class="sleek-product-card" data-id="${escapeHtml(p.id)}">
          <div class="card-thumb-container">
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='images/placeholder.png';">
            <div class="zoom-hint-icon" data-zoom-img="${escapeHtml(imgSrc)}" data-zoom-title="${escapeHtml(p.name)}" title="Fotoğrafı Büyüt">🔍</div>
          </div>
          <div class="card-type-pill">${escapeHtml(p.urun_tipi || 'Dermo')}</div>
          <div class="card-category-sub">${escapeHtml(p.brand)} • ${escapeHtml(p.sub_category || '')}</div>
          <h4 class="card-product-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h4>
          <div class="card-bottom-info">
            <span>📦 ${escapeHtml(p.size || p.form || '')}</span>
            <span class="badge-age-tag">${escapeHtml(p.yas_grubu ? p.yas_grubu.split(',')[0] : 'Tüm Yaşlar')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- 9. DANIŞAN NOTU KOPYALAMA ---
  function copyPatientNote() {
    const p = state.filteredProducts[state.selectedIndex];
    if (!p) return;

    const note = `◈ AREKROS KLİNİK DANIŞMANLIK NOTU ◈
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ürün: ${p.name} (${p.brand})
Ambalaj: ${p.size || p.form || ''}

📋 KULLANIM AMACI:
${p.hasta_sikayeti.hasta_cumlesi || 'Cilt sağlığını destekleyici dermokozmetik bakım.'}

⏱️ KULLANIM PROTOKOLÜ:
• Rutindeki Sırası: ${p.kullanim_protokolu.rutindeki_yeri}
• Sıklık: ${p.kullanim_protokolu.zaman_ve_siklik}
• Nasıl Uygulanır: ${p.kullanim_protokolu.uygulama_sekli}

⚠️ ÖNEMLİ UYARILAR & GÜVENLİK:
• ${p.guvenlik_filtresi.goz_cevresi_temas}
• ${p.guvenlik_filtresi.kontrendikasyonlar}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sağlıklı günler dileriz.`;

    navigator.clipboard.writeText(note).then(() => {
      const btn = document.getElementById('btnWsCopyNote');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✓ Danışan Notu Kopyalandı!</span>';
        btn.style.backgroundColor = 'var(--emerald-safe)';
        btn.style.color = '#ffffff';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.backgroundColor = '';
          btn.style.color = '';
        }, 2000);
      }
    }).catch(err => {
      console.warn('Clipboard write error:', err);
    });
  }

  // --- 10. AKILLI ÜRÜN YÜKLEME MODALI (GÜVEN SKORLU İNCELEME) ---
  function openStudioModal(tab = 'shelf') {
    const modal = document.getElementById('unifiedStudioModal');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    switchStudioTab(tab);
    setWizardStep('upload');
  }

  function closeStudioModal() {
    const modal = document.getElementById('unifiedStudioModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function switchStudioTab(tab) {
    document.querySelectorAll('.mod-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    const paneShelf = document.getElementById('tabPaneShelf');
    const paneSingle = document.getElementById('tabPaneSingle');
    if (paneShelf) paneShelf.style.display = tab === 'shelf' ? 'block' : 'none';
    if (paneSingle) paneSingle.style.display = tab === 'single' ? 'block' : 'none';
  }

  function setWizardStep(step) {
    state.shelfWizard.step = step;
    const stepUp = document.getElementById('wizardStepUpload');
    const stepRev = document.getElementById('wizardStepReview');
    const stepPack = document.getElementById('wizardStepPackshots');

    if (stepUp) stepUp.style.display = step === 'upload' ? 'flex' : 'none';
    if (stepRev) stepRev.style.display = step === 'review' ? 'block' : 'none';
    if (stepPack) stepPack.style.display = step === 'packshots' ? 'block' : 'none';
  }

  function triggerSampleShelfScan(brand) {
    setWizardStep('review');
    const listEl = document.getElementById('detectedProductsList');
    if (!listEl) return;

    let sampleItems = [];
    if (brand === 'Avène') {
      sampleItems = [
        { name: 'Avène Antirougeurs Rosamed Konsantre Bakım 30ml', confidence: 99, status: 'high' },
        { name: 'Avène Tolérance Hydra-10 Yoğun Nemlendirici Krem 40ml', confidence: 96, status: 'high' },
        { name: 'Avène Tolérance Son Derece Nazik Jel Temizleyici 200ml', confidence: 94, status: 'high' },
        { name: 'Avène Eau Thermale Termal Su Spreyi 150ml', confidence: 98, status: 'high' },
        { name: 'Avène Cicalfate+ Onarıcı Koruyucu Krem 40ml', confidence: 95, status: 'high' },
        { name: 'Avène Cleanance Güneş Koruyucu SPF 50+ (Kutu Açısı Eğik)', confidence: 78, status: 'medium' },
        { name: 'Işık parlaması nedeniyle etiket okunamadı (Sol Alt Ürün)', confidence: 25, status: 'low' }
      ];
    } else {
      sampleItems = [
        { name: 'CeraVe Akneye Eğilim Gösteren Ciltlere Özel Temizleyici 236ml', confidence: 98, status: 'high' },
        { name: 'CeraVe Nemlendirici Krem 340g (Kuru Ciltler)', confidence: 99, status: 'high' },
        { name: 'CeraVe Yenileyici Retinol Serum 30ml', confidence: 96, status: 'high' },
        { name: 'CeraVe Nemlendiren Hyaluronik Asit Serum 30ml', confidence: 94, status: 'high' },
        { name: 'CeraVe Köpüren Temizleyici (Boyut Belirsiz: 236ml mi 473ml mi?)', confidence: 76, status: 'medium' },
        { name: 'Bulanık ve gölgede kalmış ambalaj (Üst Raf Sağ)', confidence: 20, status: 'low' }
      ];
    }

    state.shelfWizard.detectedItems = sampleItems;

    listEl.innerHTML = sampleItems.map((item, idx) => {
      let cardClass = 'verified';
      let badgeHtml = '<span class="confidence-badge high">✓ Doğrulandı (%' + item.confidence + ')</span>';

      if (item.status === 'medium') {
        cardClass = 'review';
        badgeHtml = '<span class="confidence-badge medium">⚠️ İnceleme Önerisi (%' + item.confidence + ')</span>';
      } else if (item.status === 'low') {
        cardClass = 'unreadable';
        badgeHtml = '<span class="confidence-badge low">🔴 Okunamadı (Tekrar Çekin)</span>';
      }

      return `
        <div class="detected-item-card ${cardClass}">
          <div class="item-info-col">
            <span class="detected-name">${idx + 1}. ${escapeHtml(item.name)}</span>
            <span class="detected-sub">${item.status === 'low' ? 'Lütfen bu ürünü daha yakından ve parlamasız çekin veya adını yazın' : 'Resmi katalog veri tabanıyla eşleştirildi'}</span>
          </div>
          <div>${badgeHtml}</div>
        </div>
      `;
    }).join('');
  }

  // --- 11. LIGHTBOX FONKSİYONLARI ---
  function openLightbox(imgSrc, caption) {
    const lb = document.getElementById('imageLightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    if (!lb || !img) return;

    img.src = imgSrc;
    if (cap) cap.textContent = caption || '';
    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    const lb = document.getElementById('imageLightbox');
    if (!lb) return;
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
  }

  // --- 12. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
  function initEvents() {
    // Tema Değiştirici
    const btnTheme = document.getElementById('btnThemeToggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const nextTheme = state.currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
      });
    }

    // Şablon Değiştirici (Segmented Control)
    const btnModeWs = document.getElementById('btnModeWorkstation');
    const btnModeGrid = document.getElementById('btnModeGrid');
    if (btnModeWs) btnModeWs.addEventListener('click', () => setViewMode('workstation'));
    if (btnModeGrid) btnModeGrid.addEventListener('click', () => setViewMode('grid'));

    // Sağ Konsol Sekmeleri
    document.querySelectorAll('.console-tab').forEach(btn => {
      btn.addEventListener('click', () => setConsoleTab(btn.dataset.tab));
    });

    // Flashcard Tıklaması & Butonu
    const fcBox = document.getElementById('flashcardBox');
    if (fcBox) fcBox.addEventListener('click', flipFlashcard);

    const btnFlip = document.getElementById('btnFlipCard');
    if (btnFlip) {
      btnFlip.addEventListener('click', (e) => {
        e.stopPropagation();
        flipFlashcard();
      });
    }

    const btnFcKnown = document.getElementById('btnFcKnown');
    if (btnFcKnown) {
      btnFcKnown.addEventListener('click', (e) => {
        e.stopPropagation();
        const p = state.filteredProducts[state.selectedIndex];
        if (p) state.knownCards.add(p.id);
        navigateProduct(1);
      });
    }

    const btnFcAgain = document.getElementById('btnFcAgain');
    if (btnFcAgain) {
      btnFcAgain.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateProduct(1);
      });
    }

    // Sol Panel Ürün Seçimleri
    const listEl = document.getElementById('wsProductList');
    if (listEl) {
      listEl.addEventListener('click', (e) => {
        const item = e.target.closest('.atlas-list-item');
        if (!item || !item.dataset.index) return;
        const idx = parseInt(item.dataset.index, 10);
        loadStageProduct(idx);
      });
    }

    // Önceki / Sonraki Butonları
    const btnPrev = document.getElementById('btnWsPrev');
    const btnNext = document.getElementById('btnWsNext');
    if (btnPrev) btnPrev.addEventListener('click', () => navigateProduct(-1));
    if (btnNext) btnNext.addEventListener('click', () => navigateProduct(1));

    // Arama Kutusu
    const searchInp = document.getElementById('wsSearchInput');
    const btnClearSearch = document.getElementById('btnWsClearSearch');
    if (searchInp) {
      searchInp.addEventListener('input', () => {
        state.searchQuery = searchInp.value.trim();
        if (btnClearSearch) btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
        state.selectedIndex = 0;
        renderWorkstationSidebar();
        if (state.filteredProducts.length > 0) loadStageProduct(0);
      });
    }
    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        searchInp.value = '';
        state.searchQuery = '';
        btnClearSearch.style.display = 'none';
        state.selectedIndex = 0;
        renderWorkstationSidebar();
        if (state.filteredProducts.length > 0) loadStageProduct(0);
        searchInp.focus();
      });
    }

    // Marka ve Rutin Açılır Seçicileri
    const brandSel = document.getElementById('wsBrandSelect');
    if (brandSel) {
      brandSel.addEventListener('change', () => {
        state.activeBrand = brandSel.value;
        state.selectedIndex = 0;
        renderWorkstationSidebar();
        if (state.filteredProducts.length > 0) loadStageProduct(0);
      });
    }
    const routSel = document.getElementById('wsRoutineSelect');
    if (routSel) {
      routSel.addEventListener('change', () => {
        state.activeRoutine = routSel.value;
        state.selectedIndex = 0;
        renderWorkstationSidebar();
        if (state.filteredProducts.length > 0) loadStageProduct(0);
      });
    }

    // Danışan Notunu Kopyala
    const btnCopy = document.getElementById('btnWsCopyNote');
    if (btnCopy) btnCopy.addEventListener('click', copyPatientNote);

    // Zoom Lightbox
    const btnZoom = document.getElementById('btnStageZoom');
    if (btnZoom) {
      btnZoom.addEventListener('click', () => {
        const p = state.filteredProducts[state.selectedIndex];
        if (p) openLightbox(p.image, p.name);
      });
    }
    const btnCloseLb = document.getElementById('btnCloseLightbox');
    const lbOverlay = document.getElementById('lightboxOverlay');
    if (btnCloseLb) btnCloseLb.addEventListener('click', closeLightbox);
    if (lbOverlay) lbOverlay.addEventListener('click', closeLightbox);

    // Grid Kart Tıklamaları
    const gridEl = document.getElementById('catalogProductGrid');
    if (gridEl) {
      gridEl.addEventListener('click', (e) => {
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

    // Grid Marka & Rutin Çipleri
    const brandRow = document.getElementById('brandFilterRow');
    if (brandRow) {
      brandRow.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        brandRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeBrand = chip.dataset.brand;
        if (brandSel) brandSel.value = state.activeBrand;
        renderGrid();
        renderWorkstationSidebar();
      });
    }

    const routineRow = document.getElementById('routineFilterRow');
    if (routineRow) {
      routineRow.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        routineRow.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeRoutine = chip.dataset.routine;
        if (routSel) routSel.value = state.activeRoutine;
        renderGrid();
        renderWorkstationSidebar();
      });
    }

    // Modal Aç / Kapat
    const btnOpenMod = document.getElementById('btnOpenUnifiedStudio');
    const btnCloseMod = document.getElementById('btnCloseUnifiedStudio');
    if (btnOpenMod) btnOpenMod.addEventListener('click', () => openStudioModal('shelf'));
    if (btnCloseMod) btnCloseMod.addEventListener('click', closeStudioModal);

    // Modal Sekmeleri
    const tabModShelf = document.getElementById('tabModShelf');
    const tabModSingle = document.getElementById('tabModSingle');
    if (tabModShelf) tabModShelf.addEventListener('click', () => switchStudioTab('shelf'));
    if (tabModSingle) tabModSingle.addEventListener('click', () => switchStudioTab('single'));

    // Modal Hazır Raflar
    const btnSampleAvene = document.getElementById('btnSampleAvene');
    const btnSampleCerave = document.getElementById('btnSampleCerave');
    if (btnSampleAvene) btnSampleAvene.addEventListener('click', () => triggerSampleShelfScan('Avène'));
    if (btnSampleCerave) btnSampleCerave.addEventListener('click', () => triggerSampleShelfScan('CeraVe'));

    const btnBackUpload = document.getElementById('btnWizardBackUpload');
    if (btnBackUpload) btnBackUpload.addEventListener('click', () => setWizardStep('upload'));

    // Klavye Kısayolları
    window.addEventListener('keydown', (e) => {
      // Ctrl+K veya Cmd+K ile arama odağı
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const inp = document.getElementById('wsSearchInput');
        if (inp) {
          inp.focus();
          inp.select();
        }
        return;
      }

      // Escape ile modal kapatma
      if (e.key === 'Escape') {
        closeStudioModal();
        closeLightbox();
        return;
      }

      // Input içindeyken yön tuşlarını engelleme
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      if (state.currentMode === 'workstation') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          navigateProduct(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          navigateProduct(-1);
        } else if (e.key === ' ' && state.currentTab === 'hafiza') {
          e.preventDefault();
          flipFlashcard();
        }
      }
    });
  }

  function navigateProduct(delta) {
    const len = state.filteredProducts.length;
    if (len === 0) return;
    let next = state.selectedIndex + delta;
    if (next < 0) next = len - 1;
    if (next >= len) next = 0;
    loadStageProduct(next);
  }

  // --- 13. BAŞLATMA (INIT) ---
  function init() {
    applyTheme(state.currentTheme);
    initEvents();
    getFilteredProducts();
    renderWorkstationSidebar();
    if (state.filteredProducts.length > 0) {
      loadStageProduct(0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
