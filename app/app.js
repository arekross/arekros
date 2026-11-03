/**
 * arekros — Mobil Öncelikli Dermokozmetik Ürün Kataloğu & Danışmanlık Konsolu
 * 254 Doğrulanmış Ürün Verisi + Mobil Ürün Ekleme / Düzenleme (CRUD) + GitHub API Senkronizasyonu
 */

(function () {
  'use strict';

  // --- UYGULAMA DURUMU (STATE) ---
  const state = {
    baseProducts: [],     // Kaynaktan (products.js/json) gelen orijinal ürünler
    products: [],         // Birleştirilmiş (orijinal + eklenenler - silinenler) ürünler
    filteredProducts: [], // Arama ve filtre sonucunda ekranda listelenenler
    selectedProduct: null,// Detay modalında incelenen ürün
    
    activeBrand: 'all',
    activeRoutine: 'all',
    searchQuery: '',
    activeTagFilter: null, // { label: string, type: string }
    
    currentTheme: localStorage.getItem('arekros_theme') || 'light'
  };

  // --- DOM ELEMANLARI ---
  const el = {
    grid: document.getElementById('productGrid'),
    emptyState: document.getElementById('emptyState'),
    liveCountBadge: document.getElementById('liveCountBadge'),
    statusText: document.getElementById('statusText'),
    resetFilterBtn: document.getElementById('resetFilterBtn'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    brandChipsTrack: document.getElementById('brandChipsTrack'),
    routineChipsTrack: document.getElementById('routineChipsTrack'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    btnEmptyReset: document.getElementById('btnEmptyReset'),

    // Aktif Etiket Banner Elemanları
    activeTagBanner: document.getElementById('activeTagBanner'),
    activeTagValue: document.getElementById('activeTagValue'),
    activeTagCount: document.getElementById('activeTagCount'),
    btnClearActiveTag: document.getElementById('btnClearActiveTag'),

    // Üst Butonlar
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnOpenSettings: document.getElementById('btnOpenSettings'),
    btnOpenWeightRef: document.getElementById('btnOpenWeightRef'),

    // Detay Modalı
    modalBackdrop: document.getElementById('detailModalBackdrop'),
    modalSheet: document.getElementById('detailSheet'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalProductImg: document.getElementById('modalProductImg'),
    modalImgFrame: document.getElementById('modalImgFrame'),
    modalBrandBadge: document.getElementById('modalBrandBadge'),
    modalSizeBadge: document.getElementById('modalSizeBadge'),
    modalRoutineBadge: document.getElementById('modalRoutineBadge'),
    modalProductTitle: document.getElementById('modalProductTitle'),
    modalSubcatText: document.getElementById('modalSubcatText'),
    modalQuickChips: document.getElementById('modalQuickChips'),
    modalComplaintList: document.getElementById('modalComplaintList'),
    modalUsageText: document.getElementById('modalUsageText'),
    modalActivesWrap: document.getElementById('modalActivesWrap'),
    modalBenefitBlock: document.getElementById('modalBenefitBlock'),
    modalBenefitText: document.getElementById('modalBenefitText'),
    modalSgkCompareBlock: document.getElementById('modalSgkCompareBlock'),
    modalSgkCompareText: document.getElementById('modalSgkCompareText'),
    modalWhoCanBlock: document.getElementById('modalWhoCanBlock'),
    modalWhoCanText: document.getElementById('modalWhoCanText'),
    modalWeightNormCallout: document.getElementById('modalWeightNormCallout'),
    modalWeightNormVal: document.getElementById('modalWeightNormVal'),
    modalWhoCannotBlock: document.getElementById('modalWhoCannotBlock'),
    modalWhoCannotText: document.getElementById('modalWhoCannotText'),
    modalWarningBlock: document.getElementById('modalWarningBlock'),
    modalWarningText: document.getElementById('modalWarningText'),
    btnEditCurrentProduct: document.getElementById('btnEditCurrentProduct'),

    // Yaş & Kilo Persantil Dozaj Rehberi Modalı
    weightRefModalBackdrop: document.getElementById('weightRefModalBackdrop'),
    weightRefSheet: document.getElementById('weightRefSheet'),
    weightRefCloseBtn: document.getElementById('weightRefCloseBtn'),
    weightRefSearchInput: document.getElementById('weightRefSearchInput'),
    persantilTableBody: document.getElementById('persantilTableBody'),

    // Editör Modalı (Ürün Ekle / Düzenle)
    editorModalBackdrop: document.getElementById('editorModalBackdrop'),
    editorSheet: document.getElementById('editorSheet'),
    editorCloseBtn: document.getElementById('editorCloseBtn'),
    editorSheetTitle: document.getElementById('editorSheetTitle'),
    productEditForm: document.getElementById('productEditForm'),
    formProductId: document.getElementById('formProductId'),
    photoDropzone: document.getElementById('photoDropzone'),
    formPhotoGalleryInput: document.getElementById('formPhotoGalleryInput'),
    formPhotoCameraInput: document.getElementById('formPhotoCameraInput'),
    btnPickGallery: document.getElementById('btnPickGallery'),
    btnPickCamera: document.getElementById('btnPickCamera'),
    photoPreviewWrap: document.getElementById('photoPreviewWrap'),
    formPhotoPreview: document.getElementById('formPhotoPreview'),
    btnRemovePhoto: document.getElementById('btnRemovePhoto'),
    photoPrompt: document.getElementById('photoPrompt'),
    formProductName: document.getElementById('formProductName'),
    formProductBrand: document.getElementById('formProductBrand'),
    brandListOptions: document.getElementById('brandListOptions'),
    formProductSize: document.getElementById('formProductSize'),
    formProductRoutine: document.getElementById('formProductRoutine'),
    formProductAgeGroup: document.getElementById('formProductAgeGroup'),
    formProductSkinTypes: document.getElementById('formProductSkinTypes'),
    formProductComplaints: document.getElementById('formProductComplaints'),
    formProductUsage: document.getElementById('formProductUsage'),
    formProductActives: document.getElementById('formProductActives'),
    formProductWarnings: document.getElementById('formProductWarnings'),
    btnDeleteProduct: document.getElementById('btnDeleteProduct'),
    btnCancelEditor: document.getElementById('btnCancelEditor'),
    btnSaveProduct: document.getElementById('btnSaveProduct'),

    // Ayarlar & Senkronizasyon Modalı
    settingsModalBackdrop: document.getElementById('settingsModalBackdrop'),
    settingsSheet: document.getElementById('settingsSheet'),
    settingsCloseBtn: document.getElementById('settingsCloseBtn'),
    githubTokenInput: document.getElementById('githubTokenInput'),
    btnSyncGithub: document.getElementById('btnSyncGithub'),
    syncStatusMsg: document.getElementById('syncStatusMsg'),
    btnDownloadJson: document.getElementById('btnDownloadJson'),
    btnCopyJson: document.getElementById('btnCopyJson'),
    btnResetLocalData: document.getElementById('btnResetLocalData'),

    // Lightbox
    lightboxBackdrop: document.getElementById('lightboxBackdrop'),
    lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxCaption: document.getElementById('lightboxCaption'),

    // Toast
    toast: document.getElementById('toastNotification')
  };

  let currentEditingPhoto = ''; // Editörde yüklenen geçici görsel (DataURL veya URL)

  // --- YARDIMCI METOTLAR ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(msg) {
    if (!el.toast) return;
    const msgEl = el.toast.querySelector('.toast-msg');
    if (msgEl) msgEl.textContent = msg || 'İşlem tamamlandı!';
    el.toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2400);
  }

  // --- TEMA YÖNETİMİ ---
  function applyTheme(theme) {
    state.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('arekros_theme', theme);
    if (el.themeIcon) {
      el.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    applyTheme(state.currentTheme === 'dark' ? 'light' : 'dark');
  }

  // --- KALICI DEPOLAMA YÖNETİCİSİ (LOCAL STORAGE CRUD) ---
  const StorageManager = {
    KEYS: {
      CUSTOM: 'arekros_user_custom_products',
      OVERRIDES: 'arekros_user_overrides',
      DELETED: 'arekros_user_deleted_ids',
      GH_TOKEN: 'arekros_gh_token'
    },

    getCustomProducts() {
      try {
        return JSON.parse(localStorage.getItem(this.KEYS.CUSTOM)) || [];
      } catch (e) {
        return [];
      }
    },

    getOverrides() {
      try {
        return JSON.parse(localStorage.getItem(this.KEYS.OVERRIDES)) || {};
      } catch (e) {
        return {};
      }
    },

    getDeletedIds() {
      try {
        return JSON.parse(localStorage.getItem(this.KEYS.DELETED)) || [];
      } catch (e) {
        return [];
      }
    },

    saveProduct(productData, isEdit) {
      if (isEdit) {
        const id = productData.id;
        if (id && id.startsWith('custom_')) {
          const list = this.getCustomProducts();
          const idx = list.findIndex(p => p.id === id);
          if (idx !== -1) {
            list[idx] = productData;
          } else {
            list.push(productData);
          }
          localStorage.setItem(this.KEYS.CUSTOM, JSON.stringify(list));
        } else {
          const overrides = this.getOverrides();
          overrides[productData.id] = productData;
          localStorage.setItem(this.KEYS.OVERRIDES, JSON.stringify(overrides));
        }
      } else {
        const list = this.getCustomProducts();
        productData.id = 'custom_' + Date.now();
        list.unshift(productData); // Listede en başa koy
        localStorage.setItem(this.KEYS.CUSTOM, JSON.stringify(list));
      }
    },

    deleteProduct(id) {
      if (!id) return;
      if (id.startsWith('custom_')) {
        let list = this.getCustomProducts();
        list = list.filter(p => p.id !== id);
        localStorage.setItem(this.KEYS.CUSTOM, JSON.stringify(list));
      } else {
        const deleted = this.getDeletedIds();
        if (!deleted.includes(id)) {
          deleted.push(id);
          localStorage.setItem(this.KEYS.DELETED, JSON.stringify(deleted));
        }
        const overrides = this.getOverrides();
        delete overrides[id];
        localStorage.setItem(this.KEYS.OVERRIDES, JSON.stringify(overrides));
      }
    },

    resetAllLocalData() {
      localStorage.removeItem(this.KEYS.CUSTOM);
      localStorage.removeItem(this.KEYS.OVERRIDES);
      localStorage.removeItem(this.KEYS.DELETED);
    },

    buildMergedProducts(baseProducts) {
      const overrides = this.getOverrides();
      const deleted = new Set(this.getDeletedIds());
      const custom = this.getCustomProducts();

      const mergedBase = [];
      baseProducts.forEach((p, idx) => {
        const id = p.id || `base_${idx}_${(p.name || '').replace(/\s+/g, '_')}`;
        p.id = id;
        if (!deleted.has(id)) {
          if (overrides[id]) {
            mergedBase.push(Object.assign({}, p, overrides[id], { id }));
          } else {
            mergedBase.push(p);
          }
        }
      });

      return [...custom, ...mergedBase];
    }
  };

  // --- VERİ YÜKLEME VE YENİLEME ---
  async function loadProducts() {
    let prods = [];
    if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS) && PRODUCTS.length > 0) {
      prods = PRODUCTS;
    } else if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA) && PRODUCTS_DATA.length > 0) {
      prods = PRODUCTS_DATA;
    } else {
      try {
        const res = await fetch('data/products.json');
        prods = await res.json();
      } catch (err) {
        console.error('products.json yüklenirken hata:', err);
      }
    }

    state.baseProducts = prods;
    refreshProductState();
  }

  function refreshProductState() {
    state.products = StorageManager.buildMergedProducts(state.baseProducts);
    populateBrandDatalist();
    renderBrandChips();
    renderRoutineChips();
    applyFilter();
  }

  // --- FİLTRE ÇİPLERİ VE DATALIST ---
  function populateBrandDatalist() {
    if (!el.brandListOptions) return;
    const brands = new Set();
    state.products.forEach(p => {
      if (p.brand) brands.add(p.brand.trim());
    });
    el.brandListOptions.innerHTML = Array.from(brands).sort().map(b => `<option value="${escapeHtml(b)}">`).join('');
  }

  function renderBrandChips() {
    if (!el.brandChipsTrack) return;

    const brandCounts = {};
    state.products.forEach(p => {
      const b = (p.brand || 'Diğer').trim();
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    });

    const sortedBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);

    let html = `
      <button type="button" class="filter-chip ${state.activeBrand === 'all' ? 'active' : ''}" data-brand="all">
        <span>Tüm Markalar</span>
        <span class="chip-count">(${state.products.length})</span>
      </button>
    `;

    sortedBrands.forEach(([brand, count]) => {
      const isActive = state.activeBrand.toLowerCase() === brand.toLowerCase();
      html += `
        <button type="button" class="filter-chip ${isActive ? 'active' : ''}" data-brand="${escapeHtml(brand)}">
          <span>${escapeHtml(brand)}</span>
          <span class="chip-count">(${count})</span>
        </button>
      `;
    });

    el.brandChipsTrack.innerHTML = html;

    el.brandChipsTrack.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeBrand = btn.dataset.brand;
        updateBrandChipsActive();
        applyFilter();
      });
    });
  }

  function updateBrandChipsActive() {
    el.brandChipsTrack.querySelectorAll('.filter-chip').forEach(btn => {
      const b = btn.dataset.brand;
      if (b.toLowerCase() === state.activeBrand.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // --- TÜRKÇE KARAKTER VE ARAMA NORMALİZASYONU ---
  function normalizeTurkish(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .trim();
  }

  // --- BİREBİR KATEGORİ / RUTİN EŞLEŞTİRİCİSİ (HEM BUTON HEM FİLTRE ORTAK KULLANIR) ---
  function matchesRoutine(p, catId) {
    if (!catId || catId === 'all') return true;
    const isSup = Boolean(p.is_supplement) || Boolean(p.sgk_karsilastirmasi_ve_nis_bilgi) || (p.category_name === 'Takviye Edici Gıda') || (p.category === 'takviye');
    const isHair = Boolean(p.is_hair) || ['Phyto Paris', 'Tresan'].includes(p.brand);
    const text = `${p.rutin_adimi || ''} ${p.sub_category || ''} ${p.name || ''} ${p.category_name || ''}`.toLowerCase();

    if (catId === 'all_supplements' || catId === 'Takviye Edici Gıda') {
      return isSup || ['takviye', 'vitamin', 'omega', 'kolajen', 'magnezyum', 'b12', 'demir', 'ginseng', 'şurup', 'kapsül', 'tablet', 'damla'].some(w => text.includes(w));
    }
    if (catId === 'Saç Bakımı') {
      return isHair || ['şampuan', 'saç', 'shampoo', 'hair', 'scalp', 'kepek', 'antichute', 'anti-chute'].some(w => text.includes(w));
    }
    if (catId === 'Temizleyici') {
      return ['temizle', 'jel', 'köpük', 'foam', 'cleanser', 'mousse', 'peeling'].some(w => text.includes(w));
    }
    if (catId === 'Serum') {
      return ['serum', 'konsantre', 'ampul', 'concentrate'].some(w => text.includes(w));
    }
    if (catId === 'Nemlendirici') {
      return ['nemlendir', 'krem', 'cream', 'losyon', 'lotion', 'balm', 'emülsiyon', 'fluide', 'nutritive', 'riche'].some(w => text.includes(w));
    }
    if (catId === 'Güneş Koruması') {
      return ['güneş', 'spf', 'sun', 'uv', 'solar', 'solaire', 'mineral'].some(w => text.includes(w));
    }
    if (catId === 'Göz Çevresi') {
      return ['göz', 'yeux', 'eye', 'regard'].some(w => text.includes(w));
    }
    if (catId === 'Vücut & Bebek') {
      return ['bebek', 'baby', 'vücut', 'body', 'çocuk', 'enfant', 'xeracalm', 'dexeryl', 'lipikar', 'atoderm'].some(w => text.includes(w));
    }
    return text.includes(catId.toLowerCase());
  }

  // --- İNTERAKTİF ÇİP & ETİKET EŞLEŞTİRME (TİPE ÖZEL VE STOPWORD FİLTRELİ) ---
  const SKIN_STOPWORDS = new Set(['cilt', 'ciltler', 'cildi', 've', 'icin', 'tipi', 'tipleri', 'olan', 'ile', 'tum', 'meyilli', 'egilimli', 'karsi']);
  const HAIR_STOPWORDS = new Set(['sac', 'saclar', 'derisi', 'icin', 'olan', 've', 'ile', 'tipi']);
  const ACTIVE_UNITS = new Set(['mg', 'mcg', 'g', 'iu', 'vitamini', 'ekstresi', 'kompleksi', 'saf', 'aktif', 'yuksek', 'standart', 'standardize']);

  function productMatchesTag(p, tagFilter) {
    if (!tagFilter || !tagFilter.label) return true;
    const tagType = tagFilter.type || 'general';
    const normTag = normalizeTurkish(tagFilter.label);

    // 1. ETKEN MADDE FİLTRESİ (Active Ingredient)
    if (tagType === 'active') {
      const actives = (p.etken_maddeler || []).map(normalizeTurkish);
      const tags = (p.tags || []).map(normalizeTurkish);
      const name = normalizeTurkish(p.name || '');

      for (let i = 0; i < actives.length; i++) {
        if (normTag === actives[i] || (normTag.length > 3 && (actives[i].includes(normTag) || normTag.includes(actives[i])))) {
          return true;
        }
      }

      const tokens = normTag.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !ACTIVE_UNITS.has(w));
      if (tokens.length > 0) {
        const pool = `${actives.join(' ')} ${tags.join(' ')} ${name}`;
        if (tokens.every(tok => pool.includes(tok))) return true;

        const keyActives = ['b12', 'magnezyum', 'demir', 'folat', 'ginseng', 'bromelain', 'resveratrol', 'glucomannan', 'berberin', 'kolajen', 'biotin', 'retinol', 'niasinamid', 'seramid', 'hyaluronik', 'salisilik', 'cinko'];
        for (let j = 0; j < tokens.length; j++) {
          if (keyActives.includes(tokens[j])) {
            if (actives.some(a => a.includes(tokens[j])) || name.includes(tokens[j])) {
              return true;
            }
          }
        }
      }
      return false;
    }

    // 2. CİLT TİPİ FİLTRESİ (Skin Type - Sadece klinik hedefe bakar, 'cilt' kelimesine aldanmaz)
    if (tagType === 'skin') {
      const skins = (p.cilt_tipleri || []).map(normalizeTurkish);
      const sub = normalizeTurkish(p.sub_category || '');

      for (let i = 0; i < skins.length; i++) {
        if (normTag === skins[i] || (normTag.length > 4 && (normTag.includes(skins[i]) || skins[i].includes(normTag)))) {
          return true;
        }
      }

      const rawTokens = normTag.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
      const meaningful = rawTokens.filter(w => !SKIN_STOPWORDS.has(w));
      const targetTokens = meaningful.length > 0 ? meaningful : rawTokens;

      const skinPool = `${skins.join(' ')} ${sub}`;
      if (targetTokens.every(tok => skinPool.includes(tok))) {
        return true;
      }

      // Klinik akıllı semantik haritalama
      if (targetTokens.some(w => ['akne', 'sivilce', 'komedon', 'siyah'].some(k => w.includes(k)))) {
        return skins.some(s => ['akne', 'sivilce', 'komedon', 'siyah nokta'].some(k => s.includes(k))) || sub.includes('akne') || sub.includes('sivilce');
      }
      if (targetTokens.some(w => ['roza', 'kizarik', 'rosacea', 'kuperoz'].some(k => w.includes(k)))) {
        return skins.some(s => ['roza', 'kizarik', 'rosacea', 'kuperoz'].some(k => s.includes(k))) || sub.includes('kizarik') || sub.includes('roza');
      }
      if (targetTokens.some(w => ['leke', 'pigment', 'melazma'].some(k => w.includes(k)))) {
        return skins.some(s => ['leke', 'pigment', 'ton esitsizligi', 'aydinlatici'].some(k => s.includes(k))) || sub.includes('leke');
      }
      if (targetTokens.some(w => ['atopik', 'egzama', 'kasinti'].some(k => w.includes(k)))) {
        return skins.some(s => ['atopik', 'egzama', 'kasinti'].some(k => s.includes(k))) || sub.includes('atopik');
      }
      if (targetTokens.some(w => ['kuru', 'kuruluk', 'nemsiz'].some(k => w.includes(k))) && !targetTokens.some(w => ['akne', 'roza', 'leke'].some(k => w.includes(k)))) {
        return skins.some(s => s.includes('kuru') || s.includes('nemsiz')) || sub.includes('kuru');
      }
      if (targetTokens.some(w => ['yagli', 'sebum', 'parlama', 'matlastirici'].some(k => w.includes(k)))) {
        return skins.some(s => ['yagli', 'sebum', 'parlama', 'matlastirici'].some(k => s.includes(k))) || sub.includes('yagli');
      }
      if (targetTokens.some(w => ['hassas', 'reaktif', 'intolerant', 'alerjik'].some(k => w.includes(k)))) {
        return skins.some(s => ['hassas', 'reaktif', 'intolerant', 'alerjik'].some(k => s.includes(k))) || sub.includes('hassas');
      }
      if (targetTokens.some(w => ['olgun', 'kirisik', 'yaslanma', 'elastikiyet'].some(k => w.includes(k)))) {
        return skins.some(s => ['olgun', 'kirisik', 'yaslanma', 'elastikiyet', 'sarkma'].some(k => s.includes(k))) || sub.includes('kirisik') || sub.includes('anti-aging');
      }
      return false;
    }

    // 3. SAÇ TİPİ FİLTRESİ (Hair Type)
    if (tagType === 'hair') {
      const hairs = (p.sac_tipleri || []).map(normalizeTurkish);
      const sub = normalizeTurkish(p.sub_category || '');
      const rawTokens = normTag.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !HAIR_STOPWORDS.has(w));
      const hairPool = `${hairs.join(' ')} ${sub}`;

      if (rawTokens.some(w => w.includes('kepek') || w.includes('seboreik'))) {
        return hairs.some(h => h.includes('kepek') || h.includes('seboreik')) || hairPool.includes('kepek');
      }
      if (rawTokens.some(w => w.includes('dokul') || w.includes('antichute'))) {
        return hairs.some(h => h.includes('dokul')) || hairPool.includes('dokul');
      }
      if (rawTokens.some(w => w.includes('yagli') || w.includes('sebore'))) {
        return hairs.some(h => h.includes('yagli')) || hairPool.includes('yagli');
      }
      return hairs.some(h => rawTokens.every(tok => h.includes(tok)));
    }

    // 4. TAKVİYE HEDEF SİSTEM FİLTRESİ (Supplement Target)
    if (tagType === 'supplement_target') {
      const targets = (p.cilt_tipleri || []).map(normalizeTurkish);
      const sub = normalizeTurkish(p.sub_category || '');
      const rawTokens = normTag.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !['ve', 'icin', 'olan', 'destegi', 'sagligi'].includes(w));
      const pool = `${targets.join(' ')} ${sub}`;

      if (rawTokens.some(w => w.includes('demir') || w.includes('ferritin') || w.includes('anemi'))) {
        return pool.includes('demir') || pool.includes('ferritin') || pool.includes('anemi');
      }
      if (rawTokens.some(w => w.includes('insulin') || w.includes('seker') || w.includes('glukoz') || w.includes('diyabet'))) {
        return pool.includes('insulin') || pool.includes('seker') || pool.includes('glukoz');
      }
      if (rawTokens.some(w => w.includes('odem') || w.includes('siskinlik') || w.includes('drenaj'))) {
        return pool.includes('odem') || pool.includes('siskinlik') || pool.includes('drenaj');
      }
      if (rawTokens.some(w => w.includes('hafiza') || w.includes('beyin') || w.includes('sis'))) {
        return pool.includes('hafiza') || pool.includes('beyin') || pool.includes('odak');
      }
      if (rawTokens.some(w => w.includes('kramp') || w.includes('kas') || w.includes('spazm'))) {
        return pool.includes('kramp') || pool.includes('kas') || pool.includes('spazm');
      }
      if (rawTokens.length > 0) {
        return rawTokens.every(tok => pool.includes(tok)) || targets.some(t => rawTokens.every(tok => t.includes(tok)));
      }
      return false;
    }

    // 5. YAŞ GRUBU FİLTRESİ (Age Group)
    if (tagType === 'age' || normTag.includes('yas')) {
      const ny = normalizeTurkish(p.yas_grubu || '');
      return ny && (ny.includes(normTag) || normTag.includes(ny));
    }

    // 6. FORMÜLASYON FORMU FİLTRESİ (Form)
    if (tagType === 'form') {
      const nf = normalizeTurkish(p.form || '');
      return nf && (nf.includes(normTag) || normTag.includes(nf));
    }

    // 7. GENEL YEDEK TARAMA (General Fallback)
    const fallbackTokens = normTag.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 3 && !SKIN_STOPWORDS.has(w));
    if (fallbackTokens.length > 0) {
      const pool = normalizeTurkish(`${p.name} ${p.brand} ${p.sub_category} ${(p.etken_maddeler || []).join(' ')}`);
      return fallbackTokens.every(tok => pool.includes(tok));
    }

    return false;
  }

  // --- İNTERAKTİF ETİKET FİLTRESİ BAŞLAT / KALDIR ---
  function filterByTag(tagValue, tagType) {
    if (!tagValue) return;
    state.activeTagFilter = { label: tagValue, type: tagType || 'general' };
    state.activeBrand = 'all';
    state.activeRoutine = 'all';
    state.searchQuery = '';
    if (el.searchInput) el.searchInput.value = '';
    if (el.clearSearchBtn) el.clearSearchBtn.style.display = 'none';

    closeDetailModal();
    updateBrandChipsActive();
    updateRoutineChipsActive();
    applyFilter();

    if (el.activeTagBanner) {
      el.activeTagBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function clearActiveTagFilter() {
    state.activeTagFilter = null;
    applyFilter();
  }

  function renderRoutineChips() {
    if (!el.routineChipsTrack) return;

    const categories = [
      { id: 'all', label: 'Tüm Rutinler', icon: '✨' },
      { id: 'all_supplements', label: 'Takviye & Vitamin', icon: '💊' },
      { id: 'Temizleyici', label: 'Temizleme', icon: '🫧' },
      { id: 'Serum', label: 'Serum & Bakım', icon: '🧪' },
      { id: 'Nemlendirici', label: 'Nemlendirici', icon: '💧' },
      { id: 'Güneş Koruması', label: 'Güneş (SPF)', icon: '☀️' },
      { id: 'Göz Çevresi', label: 'Göz Çevresi', icon: '👁️' },
      { id: 'Saç Bakımı', label: 'Saç & Şampuan', icon: '💇' },
      { id: 'Vücut & Bebek', label: 'Bebek & Vücut', icon: '👶' }
    ];

    let html = '';
    categories.forEach(cat => {
      const count = state.products.filter(p => matchesRoutine(p, cat.id)).length;
      const isActive = state.activeRoutine === cat.id;
      html += `
        <button type="button" class="filter-chip ${isActive ? 'active' : ''}" data-routine="${cat.id}">
          <span>${cat.icon} ${cat.label}</span>
          <span class="chip-count">(${count})</span>
        </button>
      `;
    });

    el.routineChipsTrack.innerHTML = html;

    el.routineChipsTrack.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeRoutine = btn.dataset.routine;
        updateRoutineChipsActive();
        applyFilter();
      });
    });
  }

  function updateRoutineChipsActive() {
    el.routineChipsTrack.querySelectorAll('.filter-chip').forEach(btn => {
      if (btn.dataset.routine === state.activeRoutine) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // --- FİLTRELEME MANTIĞI ---
  function applyFilter() {
    const q = normalizeTurkish(state.searchQuery);
    const brand = state.activeBrand.toLowerCase();
    const routine = state.activeRoutine;

    state.filteredProducts = state.products.filter(p => {
      // 1. Marka Filtresi
      if (brand !== 'all' && (p.brand || '').toLowerCase() !== brand) {
        return false;
      }

      // 2. Rutin Filtresi (Sayım fonksiyonuyla 100% eşleşir)
      if (routine !== 'all' && !matchesRoutine(p, routine)) {
        return false;
      }

      // 3. Tıklanan Çip / Etiket Filtresi
      if (state.activeTagFilter && !productMatchesTag(p, state.activeTagFilter)) {
        return false;
      }

      // 4. Arama Filtresi (Normalize edilmiş zengin arama)
      if (q) {
        const fullSearchField = normalizeTurkish([
          p.name,
          p.brand,
          p.sub_category,
          p.rutin_adimi,
          p.form,
          p.yas_grubu,
          p.ne_ise_yarar,
          p.sgk_karsilastirmasi_ve_nis_bilgi,
          p.kimler_icebilir,
          p.kimler_icemez,
          p.kimler_kullanamaz,
          (p.etken_maddeler || []).join(' '),
          (p.cilt_tipleri || []).join(' '),
          (p.sac_tipleri || []).join(' '),
          (p.tags || []).join(' '),
          (p.hangi_sikayetle_gelene_verilir || []).join(' ')
        ].filter(Boolean).join(' '));

        const qTokens = q.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 0);
        const match = qTokens.every(tok => fullSearchField.includes(tok));
        if (!match) return false;
      }

      return true;
    });

    renderGrid();
    updateStatusRow();
    updateActiveTagBanner();
  }

  function updateActiveTagBanner() {
    if (!el.activeTagBanner) return;

    if (state.activeTagFilter) {
      el.activeTagBanner.style.display = 'flex';
      if (el.activeTagValue) el.activeTagValue.textContent = state.activeTagFilter.label;
      if (el.activeTagCount) el.activeTagCount.textContent = `(${state.filteredProducts.length} ürün)`;
    } else {
      el.activeTagBanner.style.display = 'none';
    }
  }

  function updateStatusRow() {
    const total = state.products.length;
    const count = state.filteredProducts.length;

    if (el.liveCountBadge) {
      el.liveCountBadge.textContent = `${count} / ${total} Ürün`;
    }

    const hasFilter = state.activeBrand !== 'all' || state.activeRoutine !== 'all' || state.searchQuery.length > 0 || Boolean(state.activeTagFilter);

    if (el.resetFilterBtn) {
      el.resetFilterBtn.style.display = hasFilter ? 'inline-block' : 'none';
    }

    if (el.statusText) {
      if (!hasFilter) {
        el.statusText.textContent = `Toplam ${count} ürün listeleniyor`;
      } else {
        let parts = [];
        if (state.activeBrand !== 'all') parts.push(state.activeBrand);
        if (state.activeRoutine !== 'all') parts.push(state.activeRoutine);
        if (state.activeTagFilter) parts.push(`Etiket: "${state.activeTagFilter.label}"`);
        if (state.searchQuery) parts.push(`"${state.searchQuery}"`);
        el.statusText.textContent = `${parts.join(' + ')} için ${count} sonuç bulundu`;
      }
    }
  }

  function resetAllFilters() {
    state.activeBrand = 'all';
    state.activeRoutine = 'all';
    state.searchQuery = '';
    state.activeTagFilter = null;
    if (el.searchInput) el.searchInput.value = '';
    if (el.clearSearchBtn) el.clearSearchBtn.style.display = 'none';

    updateBrandChipsActive();
    updateRoutineChipsActive();
    applyFilter();
  }

  // --- ÜRÜN IZGARASINI ÇİZ (RENDER GRID) ---
  function renderGrid() {
    if (!el.grid) return;

    if (state.filteredProducts.length === 0) {
      el.grid.innerHTML = '';
      if (el.emptyState) el.emptyState.style.display = 'block';
      return;
    }

    if (el.emptyState) el.emptyState.style.display = 'none';

    const cardsHtml = state.filteredProducts.map((p, idx) => {
      const imgSrc = p.image || 'images/placeholder.png';
      const brand = p.brand || 'Dermokozmetik';
      const size = p.size || '';
      const routine = p.rutin_adimi || p.sub_category || 'Cilt Bakımı';
      const isCustom = p.id && p.id.startsWith('custom_');

      return `
        <article class="product-card ${isCustom ? 'custom-card' : ''}" data-index="${idx}" tabindex="0" role="button" aria-label="${escapeHtml(p.name)}">
          <div class="card-img-wrap">
            <span class="card-brand-badge">${escapeHtml(brand)}</span>
            ${size ? `<span class="card-size-badge">${escapeHtml(size)}</span>` : ''}
            <img 
              src="${encodeURI(imgSrc)}" 
              alt="${escapeHtml(p.name)}" 
              loading="lazy" 
              onerror="this.onerror=null; this.src='images/placeholder.png';"
            >
          </div>
          <div class="card-content">
            <span class="card-routine-tag">${escapeHtml(routine)}</span>
            <h3 class="card-title">${escapeHtml(p.name)}</h3>
            <div class="card-footer">
              <span class="card-action-hint">Detayları Gör →</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    el.grid.innerHTML = cardsHtml;

    // Tıklama Olayları
    el.grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        openDetailModal(state.filteredProducts[idx]);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(card.dataset.index, 10);
          openDetailModal(state.filteredProducts[idx]);
        }
      });
    });
  }

  // --- YAŞ & KİLO PERSANTİL DOZAJ REHBERİ VERİSİ ---
  const PERSANTIL_DATA = [
    {
      yas: '0 - 1 Yaş (Bebek)',
      kiloAraligi: '3.5 - 11.5 kg',
      ortalamaKilo: '7.5 - 10 kg',
      guvenliForm: 'Damla (Damlatıcı ile) veya Sıvı Şurup',
      kural: 'Kapsül/tablet kesinlikle verilmez (aspirasyon riski). D3 vitamini 400 IU damla standarttır.'
    },
    {
      yas: '1 - 3 Yaş (Oyun Çocuğu)',
      kiloAraligi: '9.0 - 16.5 kg',
      ortalamaKilo: '12 - 14 kg',
      guvenliForm: 'Sıvı Şurup, Damla, Saşe (su/yoğurda karışan)',
      kural: 'Tatlandırılmış aromalı şurup/damla. Balık yağı şurup formunda (Ocean vb.) tok karna verilir.'
    },
    {
      yas: '4 - 6 Yaş (Örn: 5 Yaş)',
      kiloAraligi: '14.0 - 24.0 kg',
      ortalamaKilo: '18.5 kg',
      guvenliForm: 'Çiğneme Jeli / Tableti, Şurup, Saşe',
      kural: '5 yaşındaki çocuğun normal kabul edilen ortalama kilosu 18.5 kg\'dır (15-22 kg bandı). Yetişkin tableti yutamaz.'
    },
    {
      yas: '7 - 9 Yaş (Okul Çağı)',
      kiloAraligi: '19.0 - 35.0 kg',
      ortalamaKilo: '25 - 28 kg',
      guvenliForm: 'Çiğneme Formu, Şurup, Saşe',
      kural: 'Okul dönemi odaklanma ve bağışıklık desteği. 30 kg altı çocuklara yetişkin dozu verilmez.'
    },
    {
      yas: '10 - 12 Yaş (Ergenlik Öncesi)',
      kiloAraligi: '28.0 - 50.0 kg',
      ortalamaKilo: '36 - 40 kg',
      guvenliForm: 'Çiğneme Tableti, Küçük Kapsül veya Şurup',
      kural: '12 yaş sınırı. 40 kg altındaki persantil gerisi çocuklara yetişkin takviyesi verilmez, pediatrik doz sürdürülür.'
    },
    {
      yas: '12+ Yaş & Genç (13 - 17 Yaş)',
      kiloAraligi: '42.0 - 70.0 kg',
      ortalamaKilo: '52 - 58 kg',
      guvenliForm: 'Kapsül, Tablet, Saşe, Efervesan',
      kural: '12 yaş üzeri ve 40 kg üzerindeki bireyler yetişkin takviye dozlarını güvenle kullanabilir.'
    },
    {
      yas: 'Yetişkin (18 - 65 Yaş)',
      kiloAraligi: '50.0 - 90.0 kg',
      ortalamaKilo: '65 - 75 kg',
      guvenliForm: 'Kapsül, Tablet, Efervesan, Saşe, Flakon',
      kural: 'Standart yetişkin dozu. Tiroid ilacı (Levotiron), kan sulandırıcı (Coumadin) ve tansiyon ilaçlarıyla araya 2-4 saat mesafe konmalıdır.'
    },
    {
      yas: '65+ Yaş (Geriatrik)',
      kiloAraligi: '50.0 - 85.0 kg',
      ortalamaKilo: '65 - 70 kg',
      guvenliForm: 'Yutması Kolay Küçük Kapsül, Damla, Dilaltı, Saşe',
      kural: 'Polifarmasi (çoklu ilaç) ve azalan böbrek fonksiyonu göz önüne alınarak magnezyum oksit yerine bisglisinat tercih edilir.'
    }
  ];

  function renderPersantilTable(filterText = '') {
    if (!el.persantilTableBody) return;
    const q = (filterText || '').trim().toLowerCase();

    const rows = PERSANTIL_DATA.filter(item => {
      if (!q) return true;
      return item.yas.toLowerCase().includes(q) ||
             item.kiloAraligi.toLowerCase().includes(q) ||
             item.ortalamaKilo.toLowerCase().includes(q) ||
             item.guvenliForm.toLowerCase().includes(q) ||
             item.kural.toLowerCase().includes(q);
    });

    if (rows.length === 0) {
      el.persantilTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding: 24px; color: var(--text-tertiary);">
            Aramanızla eşleşen yaş veya kilo normu bulunamadı.
          </td>
        </tr>
      `;
      return;
    }

    el.persantilTableBody.innerHTML = rows.map(r => {
      const isHighlighted = q && (r.yas.toLowerCase().includes(q) || r.kural.toLowerCase().includes(q));
      return `
        <tr class="${isHighlighted ? 'highlight-row' : ''}">
          <td>
            <div class="table-age-cell">
              <strong>${escapeHtml(r.yas)}</strong>
              <small>${escapeHtml(r.kural)}</small>
            </div>
          </td>
          <td><span class="table-range-badge">${escapeHtml(r.kiloAraligi)}</span></td>
          <td><strong style="color: var(--brand-primary);">${escapeHtml(r.ortalamaKilo)}</strong></td>
          <td><span class="table-form-badge">${escapeHtml(r.guvenliForm)}</span></td>
        </tr>
      `;
    }).join('');
  }

  function openWeightRefModal(targetHighlight = '') {
    if (el.weightRefSearchInput) {
      el.weightRefSearchInput.value = targetHighlight || '';
    }
    renderPersantilTable(targetHighlight || '');

    if (el.weightRefModalBackdrop) {
      el.weightRefModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeWeightRefModal() {
    if (el.weightRefModalBackdrop) {
      el.weightRefModalBackdrop.classList.remove('active');
      if (!el.modalBackdrop?.classList.contains('active') && !el.editorModalBackdrop?.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }
  }

  // --- ÜRÜN DETAY MODALI ---
  function openDetailModal(product) {
    if (!product) return;
    state.selectedProduct = product;

    // Görsel
    const imgSrc = product.image || 'images/placeholder.png';
    if (el.modalProductImg) {
      el.modalProductImg.src = encodeURI(imgSrc);
      el.modalProductImg.alt = product.name;
    }

    // Başlık ve Rozetler
    if (el.modalBrandBadge) el.modalBrandBadge.textContent = product.brand || 'Dermokozmetik';
    if (el.modalSizeBadge) {
      el.modalSizeBadge.textContent = product.size || product.form || 'Orijinal Ambalaj';
    }
    if (el.modalRoutineBadge) {
      el.modalRoutineBadge.textContent = product.rutin_adimi || product.sub_category || 'Klinik Bakım';
    }
    if (el.modalProductTitle) el.modalProductTitle.textContent = product.name;
    if (el.modalSubcatText) el.modalSubcatText.textContent = product.sub_category || product.category_name || '';

    // Hızlı Çipler (İnteraktif Tıklanabilir Rozetler)
    if (el.modalQuickChips) {
      let chipsHtml = '';
      if (product.yas_grubu) {
        chipsHtml += `<button type="button" class="quick-chip age-chip tag-clickable" data-tag="${escapeHtml(product.yas_grubu)}" data-type="age" title="Tüm ${escapeHtml(product.yas_grubu)} ürünlerini filtrele">👥 ${escapeHtml(product.yas_grubu)}</button>`;
        chipsHtml += `<button type="button" class="quick-chip age-ref-chip" data-age="${escapeHtml(product.yas_grubu)}" title="Bu yaş grubu için persantil kilo ve dozaj tablosunu gör">⚖️ Dozaj Tablosu</button>`;
      }

      const isHair = Boolean(product.is_hair) || (product.rutin_adimi && product.rutin_adimi.toLowerCase().includes('saç')) || ['Phyto Paris', 'Tresan'].includes(product.brand);
      const isSup = Boolean(product.is_supplement) || Boolean(product.sgk_karsilastirmasi_ve_nis_bilgi) || (product.category_name === 'Takviye Edici Gıda');

      if (isSup && product.form) {
        chipsHtml += `<button type="button" class="quick-chip supplement-chip tag-clickable" data-tag="${escapeHtml(product.form)}" data-type="form" title="Tüm ${escapeHtml(product.form)} formundaki takviyeleri filtrele">💊 ${escapeHtml(product.form)}</button>`;
      }

      const typeList = (isHair && Array.isArray(product.sac_tipleri) && product.sac_tipleri.length > 0)
        ? product.sac_tipleri
        : (Array.isArray(product.cilt_tipleri) ? product.cilt_tipleri : []);

      typeList.forEach(ct => {
        if (isHair) {
          chipsHtml += `<button type="button" class="quick-chip hair-chip tag-clickable" data-tag="${escapeHtml(ct)}" data-type="hair" title="Tüm ${escapeHtml(ct)} saç ürünlerini filtrele">💇 ${escapeHtml(ct)}</button>`;
        } else if (isSup) {
          chipsHtml += `<button type="button" class="quick-chip supplement-chip tag-clickable" data-tag="${escapeHtml(ct)}" data-type="supplement_target" title="Tüm ${escapeHtml(ct)} hedefine yönelik takviyeleri filtrele">🎯 ${escapeHtml(ct)}</button>`;
        } else {
          chipsHtml += `<button type="button" class="quick-chip skin-chip tag-clickable" data-tag="${escapeHtml(ct)}" data-type="skin" title="Tüm ${escapeHtml(ct)} cilt ürünlerini filtrele">💧 ${escapeHtml(ct)}</button>`;
        }
      });

      el.modalQuickChips.innerHTML = chipsHtml;

      const ageTableBtn = el.modalQuickChips.querySelector('.age-ref-chip');
      if (ageTableBtn) {
        ageTableBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetAge = ageTableBtn.getAttribute('data-age') || '';
          openWeightRefModal(targetAge);
        });
      }

      el.modalQuickChips.querySelectorAll('.tag-clickable').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tag = btn.getAttribute('data-tag');
          const type = btn.getAttribute('data-type');
          filterByTag(tag, type);
        });
      });
    }

    // 1. Danışan Ne Derse Bu Ürün Verilir?
    if (el.modalComplaintList) {
      const complaints = Array.isArray(product.hangi_sikayetle_gelene_verilir) && product.hangi_sikayetle_gelene_verilir.length > 0
        ? product.hangi_sikayetle_gelene_verilir
        : [product.name + ' için hekim ve eczacı danışmanlığı önerilir.'];

      el.modalComplaintList.innerHTML = complaints.map(c => `
        <div class="complaint-item">
          <span>•</span>
          <span>"${escapeHtml(c)}"</span>
        </div>
      `).join('');
    }

    // 2. Nasıl ve Ne Zaman Kullanılır?
    if (el.modalUsageText) {
      el.modalUsageText.textContent = product.nasil_kullanilir || 'Temizlenmiş cilde nazik dairesel hareketlerle uygulayınız.';
    }

    // 3. Öne Çıkan Aktifler (İnteraktif Tıklanabilir Etiketler)
    if (el.modalActivesWrap) {
      const actives = Array.isArray(product.etken_maddeler) && product.etken_maddeler.length > 0
        ? product.etken_maddeler
        : ['Dermatolojik Olarak Test Edilmiş Patentli Formülasyon'];

      el.modalActivesWrap.innerHTML = actives.map(a => `
        <button type="button" class="active-tag tag-clickable" data-tag="${escapeHtml(a)}" data-type="active" title="${escapeHtml(a)} içeren tüm ürünleri filtrele">
          🔬 ${escapeHtml(a)}
        </button>
      `).join('');

      el.modalActivesWrap.querySelectorAll('.tag-clickable').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tag = btn.getAttribute('data-tag');
          filterByTag(tag, 'active');
        });
      });
    }

    // 4. Ne İşe Yarar? (Klinik & Fizyolojik Etki)
    if (el.modalBenefitBlock) {
      if (product.ne_ise_yarar) {
        el.modalBenefitBlock.style.display = 'block';
        if (el.modalBenefitText) el.modalBenefitText.textContent = product.ne_ise_yarar;
      } else {
        el.modalBenefitBlock.style.display = 'none';
      }
    }

    // 5. SGK vs Eczane Takviyesi Niş Karşılaştırma
    if (el.modalSgkCompareBlock) {
      if (product.sgk_karsilastirmasi_ve_nis_bilgi) {
        el.modalSgkCompareBlock.style.display = 'block';
        if (el.modalSgkCompareText) el.modalSgkCompareText.textContent = product.sgk_karsilastirmasi_ve_nis_bilgi;
      } else {
        el.modalSgkCompareBlock.style.display = 'none';
      }
    }

    // 6. Kimler İçebilir & İdeal Kilo / Yaş Sınırı
    if (el.modalWhoCanBlock) {
      const hasWhoCan = Boolean(product.kimler_icebilir);
      const hasWeightNorm = Boolean(product.ideal_kilo_araligi);

      if (hasWhoCan || hasWeightNorm) {
        el.modalWhoCanBlock.style.display = 'block';
        if (el.modalWhoCanText) {
          el.modalWhoCanText.textContent = product.kimler_icebilir || '';
          el.modalWhoCanText.style.display = hasWhoCan ? 'block' : 'none';
        }
        if (el.modalWeightNormCallout) {
          if (hasWeightNorm) {
            el.modalWeightNormCallout.style.display = 'flex';
            if (el.modalWeightNormVal) {
              el.modalWeightNormVal.innerHTML = `${escapeHtml(product.ideal_kilo_araligi)} <button type="button" class="btn-callout-link">Rehberi Aç ↗</button>`;
              const linkBtn = el.modalWeightNormVal.querySelector('.btn-callout-link');
              if (linkBtn) {
                linkBtn.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openWeightRefModal(product.yas_grubu || '');
                });
              }
            }
          } else {
            el.modalWeightNormCallout.style.display = 'none';
          }
        }
      } else {
        el.modalWhoCanBlock.style.display = 'none';
      }
    }

    // 7. Kimler İçemez & İlaç Etkileşimleri (Tekil ve Düzenli Gösterim)
    // Asla alt alta iki tane mükerrer uyarı kutusu çıkmamalı!
    if (product.kimler_icemez) {
      if (el.modalWhoCannotBlock) {
        el.modalWhoCannotBlock.style.display = 'block';
        if (el.modalWhoCannotText) el.modalWhoCannotText.textContent = product.kimler_icemez;
      }
      if (el.modalWarningBlock) {
        el.modalWarningBlock.style.display = 'none';
      }
    } else {
      if (el.modalWhoCannotBlock) {
        el.modalWhoCannotBlock.style.display = 'none';
      }
      if (el.modalWarningBlock) {
        const warning = product.kimler_kullanamaz || 'İçeriğindeki etken maddelere karşı hassasiyeti olanlar kullanmamalıdır.';
        if (el.modalWarningText) el.modalWarningText.textContent = warning;
        el.modalWarningBlock.style.display = 'block';
      }
    }

    // Modalı Göster
    if (el.modalBackdrop) {
      el.modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDetailModal() {
    if (el.modalBackdrop) {
      el.modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }



  // --- FOTOĞRAF YÜKLEYİCİ VE CANVAS SIKIŞTIRMA ---
  function setupPhotoUploader() {
    if (!el.photoDropzone) return;

    function handleFile(file) {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          currentEditingPhoto = canvas.toDataURL('image/jpeg', 0.82);
          showPhotoPreview(currentEditingPhoto);
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    if (el.btnPickGallery && el.formPhotoGalleryInput) {
      el.btnPickGallery.addEventListener('click', (e) => {
        e.stopPropagation();
        el.formPhotoGalleryInput.click();
      });
    }

    if (el.btnPickCamera && el.formPhotoCameraInput) {
      el.btnPickCamera.addEventListener('click', (e) => {
        e.stopPropagation();
        el.formPhotoCameraInput.click();
      });
    }

    el.photoDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btnRemovePhoto') || e.target.closest('.btn-photo-pick')) return;
      if (el.formPhotoGalleryInput) el.formPhotoGalleryInput.click();
    });

    if (el.formPhotoGalleryInput) {
      el.formPhotoGalleryInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        handleFile(file);
      });
    }

    if (el.formPhotoCameraInput) {
      el.formPhotoCameraInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        handleFile(file);
      });
    }

    if (el.btnRemovePhoto) {
      el.btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        currentEditingPhoto = '';
        if (el.formPhotoGalleryInput) el.formPhotoGalleryInput.value = '';
        if (el.formPhotoCameraInput) el.formPhotoCameraInput.value = '';
        hidePhotoPreview();
      });
    }
  }

  function showPhotoPreview(src) {
    if (el.formPhotoPreview) el.formPhotoPreview.src = src;
    if (el.photoPreviewWrap) el.photoPreviewWrap.style.display = 'flex';
    if (el.photoPrompt) el.photoPrompt.style.display = 'none';
  }

  function hidePhotoPreview() {
    if (el.formPhotoPreview) el.formPhotoPreview.src = '';
    if (el.photoPreviewWrap) el.photoPreviewWrap.style.display = 'none';
    if (el.photoPrompt) el.photoPrompt.style.display = 'flex';
    if (el.formPhotoGalleryInput) el.formPhotoGalleryInput.value = '';
    if (el.formPhotoCameraInput) el.formPhotoCameraInput.value = '';
  }

  // --- ÜRÜN EKLE / DÜZENLE MODALI ---
  function openEditorModal(product = null) {
    if (!el.editorModalBackdrop) return;

    if (product) {
      // DÜZENLEME MODU
      el.editorSheetTitle.textContent = '✏️ Ürünü Düzenle';
      el.formProductId.value = product.id || '';
      el.formProductName.value = product.name || '';
      el.formProductBrand.value = product.brand || '';
      el.formProductSize.value = product.size || '';
      el.formProductRoutine.value = product.rutin_adimi || product.sub_category || '';
      el.formProductAgeGroup.value = product.yas_grubu || '';

      const isHair = Boolean(product.is_hair) || ['Phyto Paris', 'Tresan'].includes(product.brand) || ((product.rutin_adimi || '').toLowerCase().includes('saç'));
      const typeList = (isHair && Array.isArray(product.sac_tipleri) && product.sac_tipleri.length > 0)
        ? product.sac_tipleri
        : (Array.isArray(product.cilt_tipleri) ? product.cilt_tipleri : []);
      el.formProductSkinTypes.value = typeList.join(', ');

      const skinTypesLabel = document.getElementById('formProductSkinTypesLabel');
      if (skinTypesLabel) {
        skinTypesLabel.textContent = isHair
          ? '💇 Saç & Saç Derisi Tipleri (Virgülle ayırın)'
          : '💧 Cilt Tipleri veya Hedef Alan (Virgülle ayırın)';
      }
      if (el.formProductSkinTypes) {
        el.formProductSkinTypes.placeholder = isHair
          ? 'Örn: Yağlı Saç Derisi, Kepekli Saçlar, Dökülen Saçlar'
          : 'Örn: Hassas, Yağlı, Akneye Eğilimli veya Kuru';
      }

      el.formProductComplaints.value = Array.isArray(product.hangi_sikayetle_gelene_verilir) ? product.hangi_sikayetle_gelene_verilir.join('\n') : '';
      el.formProductUsage.value = product.nasil_kullanilir || '';
      el.formProductActives.value = Array.isArray(product.etken_maddeler) ? product.etken_maddeler.join(', ') : '';
      el.formProductWarnings.value = product.kimler_kullanamaz || '';

      currentEditingPhoto = product.image || '';
      if (currentEditingPhoto) {
        showPhotoPreview(encodeURI(currentEditingPhoto));
      } else {
        hidePhotoPreview();
      }

      if (el.btnDeleteProduct) el.btnDeleteProduct.style.display = 'inline-block';
    } else {
      // YENİ ÜRÜN EKLEME MODU
      el.editorSheetTitle.textContent = '➕ Yeni Ürün Ekle';
      if (el.productEditForm) el.productEditForm.reset();
      el.formProductId.value = '';
      currentEditingPhoto = '';
      hidePhotoPreview();

      const skinTypesLabel = document.getElementById('formProductSkinTypesLabel');
      if (skinTypesLabel) {
        skinTypesLabel.textContent = '💧 Cilt Tipi veya 💇 Saç / Saç Derisi Tipi (Virgülle ayırın)';
      }
      if (el.formProductSkinTypes) {
        el.formProductSkinTypes.placeholder = 'Örn: Yağlı Saç Derisi, Kepekli Saçlar veya Hassas Cilt';
      }

      if (el.btnDeleteProduct) el.btnDeleteProduct.style.display = 'none';
    }

    populateBrandDatalist();
    el.editorModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeEditorModal() {
    if (el.editorModalBackdrop) {
      el.editorModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Form Kaydetme
  function handleSaveProduct(e) {
    e.preventDefault();

    const name = el.formProductName.value.trim();
    const brand = el.formProductBrand.value.trim();
    if (!name || !brand) {
      alert('Lütfen Ürün Adı ve Marka alanlarını doldurunuz.');
      return;
    }

    const id = el.formProductId.value;
    const isEdit = Boolean(id);

    // Cilt tipleri virgülle ayrılmış
    const cilt_tipleri = el.formProductSkinTypes.value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Aktifler virgülle ayrılmış
    const etken_maddeler = el.formProductActives.value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Şikayetler satır satır
    const hangi_sikayetle_gelene_verilir = el.formProductComplaints.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const existing = isEdit ? state.products.find(p => p.id === id) : null;
    const routineVal = el.formProductRoutine.value.trim();
    const isHair = Boolean(existing && existing.is_hair) ||
      ['Phyto Paris', 'Tresan'].includes(brand) ||
      routineVal.toLowerCase().includes('saç') ||
      routineVal.toLowerCase().includes('şampuan') ||
      name.toLowerCase().includes('şampuan') ||
      name.toLowerCase().includes('saç');

    const productData = {
      ...(existing || {}),
      id: id || ('custom_' + Date.now()),
      name: name,
      brand: brand,
      size: el.formProductSize.value.trim(),
      rutin_adimi: routineVal || (isHair ? 'Şampuan & Saç Bakımı' : 'Cilt Bakımı'),
      sub_category: routineVal || (isHair ? 'Saç & Saç Derisi Bakımı' : 'Dermokozmetik'),
      yas_grubu: el.formProductAgeGroup.value.trim(),
      cilt_tipleri: cilt_tipleri,
      sac_tipleri: isHair ? cilt_tipleri : (existing ? existing.sac_tipleri : undefined),
      is_hair: isHair,
      is_supplement: Boolean(existing && existing.is_supplement),
      hangi_sikayetle_gelene_verilir: hangi_sikayetle_gelene_verilir,
      nasil_kullanilir: el.formProductUsage.value.trim(),
      etken_maddeler: etken_maddeler,
      kimler_kullanamaz: el.formProductWarnings.value.trim(),
      image: currentEditingPhoto || (existing ? existing.image : 'images/placeholder.png')
    };

    StorageManager.saveProduct(productData, isEdit);
    refreshProductState();
    closeEditorModal();

    if (isEdit && state.selectedProduct && state.selectedProduct.id === productData.id) {
      openDetailModal(productData);
    }

    showToast(isEdit ? '✓ Ürün güncellendi!' : '✓ Yeni ürün eklendi!');
  }

  // Ürünü Silme
  function handleDeleteProduct() {
    const id = el.formProductId.value;
    if (!id) return;

    if (!confirm('Bu ürünü listeden silmek istediğinize emin misiniz?')) {
      return;
    }

    StorageManager.deleteProduct(id);
    refreshProductState();
    closeEditorModal();
    closeDetailModal();
    showToast('🗑️ Ürün silindi.');
  }

  // --- AYARLAR VE GITHUB BULUT SENKRONİZASYONU ---
  function openSettingsModal() {
    if (!el.settingsModalBackdrop) return;
    if (el.githubTokenInput) {
      el.githubTokenInput.value = localStorage.getItem(StorageManager.KEYS.GH_TOKEN) || '';
    }
    if (el.syncStatusMsg) {
      el.syncStatusMsg.textContent = '';
      el.syncStatusMsg.className = 'sync-status-msg';
    }
    el.settingsModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSettingsModal() {
    if (el.settingsModalBackdrop) {
      el.settingsModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  async function syncToGitHub() {
    const token = el.githubTokenInput ? el.githubTokenInput.value.trim() : '';
    if (!token) {
      if (el.syncStatusMsg) {
        el.syncStatusMsg.className = 'sync-status-msg error';
        el.syncStatusMsg.textContent = 'Lütfen geçerli bir GitHub Personal Access Token giriniz.';
      }
      return;
    }

    localStorage.setItem(StorageManager.KEYS.GH_TOKEN, token);

    if (el.syncStatusMsg) {
      el.syncStatusMsg.className = 'sync-status-msg loading';
      el.syncStatusMsg.textContent = '⏳ GitHub ile bağlantı kuruluyor ve dosya kontrol ediliyor...';
    }

    const repo = 'arekross/arekros';
    const filePathJson = 'app/data/products.json';
    const filePathJs = 'app/data/products.js';

    try {
      // 1. products.json SHA'sını al
      const getResJson = await fetch(`https://api.github.com/repos/${repo}/contents/${filePathJson}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!getResJson.ok) {
        throw new Error(`GitHub bağlantı hatası (${getResJson.status}). Token yetkisi (repo) veya internet bağlantısını kontrol edin.`);
      }
      const fileDataJson = await getResJson.json();
      const shaJson = fileDataJson.sha;

      // 2. Güncel JSON hazırla ve Base64 kodla
      const jsonStr = JSON.stringify(state.products, null, 2);
      const b64Json = btoa(unescape(encodeURIComponent(jsonStr)));

      // 3. products.json dosyasını güncelle
      const putResJson = await fetch(`https://api.github.com/repos/${repo}/contents/${filePathJson}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'feat(catalog): update products catalog from mobile editor',
          content: b64Json,
          sha: shaJson
        })
      });

      if (!putResJson.ok) {
        throw new Error(`products.json kaydedilemedi (${putResJson.status}).`);
      }

      // 4. products.js dosyasını da güncelle (Statik script uyumluluğu için)
      const getResJs = await fetch(`https://api.github.com/repos/${repo}/contents/${filePathJs}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getResJs.ok) {
        const fileDataJs = await getResJs.json();
        const jsContent = `const PRODUCTS_DATA = ${jsonStr};\nif (typeof window !== 'undefined') { window.PRODUCTS = PRODUCTS_DATA; }\n`;
        const b64Js = btoa(unescape(encodeURIComponent(jsContent)));
        await fetch(`https://api.github.com/repos/${repo}/contents/${filePathJs}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'feat(catalog): update products.js from mobile editor',
            content: b64Js,
            sha: fileDataJs.sha
          })
        });
      }

      if (el.syncStatusMsg) {
        el.syncStatusMsg.className = 'sync-status-msg success';
        el.syncStatusMsg.textContent = '🚀 Başarıyla GitHub\'a aktarıldı! Yaklaşık 30 saniye içinde siteniz canlıda güncellenecek.';
      }
      showToast('☁️ GitHub ile senkronize edildi!');
    } catch (err) {
      console.error(err);
      if (el.syncStatusMsg) {
        el.syncStatusMsg.className = 'sync-status-msg error';
        el.syncStatusMsg.textContent = 'Hata: ' + (err.message || 'Senkronizasyon başarısız.');
      }
    }
  }

  function downloadJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.products, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `arekros_urunler_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('📥 JSON dosyası indirildi!');
  }

  function copyJsonToClipboard() {
    const jsonStr = JSON.stringify(state.products, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      showToast('📋 Tüm ürün verisi JSON olarak kopyalandı!');
    }).catch(() => {
      showToast('Kopyalama başarısız.');
    });
  }

  function handleResetLocalData() {
    if (!confirm('Yerel cihazınızdaki tüm ekleme ve düzenlemeler silinecek ve orijinal 254 ürüne dönülecektir. Onaylıyor musunuz?')) {
      return;
    }
    StorageManager.resetAllLocalData();
    refreshProductState();
    closeSettingsModal();
    showToast('🔄 Orijinal ürün listesine dönüldü.');
  }

  // --- LIGHTBOX (BÜYÜTÜCÜ) ---
  function openLightbox() {
    const p = state.selectedProduct;
    if (!p || !el.lightboxBackdrop || !el.lightboxImg) return;

    el.lightboxImg.src = encodeURI(p.image || '');
    if (el.lightboxCaption) el.lightboxCaption.textContent = p.name;
    el.lightboxBackdrop.style.display = 'flex';
  }

  function closeLightbox() {
    if (el.lightboxBackdrop) {
      el.lightboxBackdrop.style.display = 'none';
    }
  }

  // --- OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
  function initEvents() {
    // Arama
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (el.clearSearchBtn) {
          el.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        }
        applyFilter();
      });
    }

    if (el.clearSearchBtn) {
      el.clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = '';
        if (el.searchInput) {
          el.searchInput.value = '';
          el.searchInput.focus();
        }
        el.clearSearchBtn.style.display = 'none';
        applyFilter();
      });
    }

    // Filtre sıfırla
    if (el.resetFilterBtn) el.resetFilterBtn.addEventListener('click', resetAllFilters);
    if (el.btnEmptyReset) el.btnEmptyReset.addEventListener('click', resetAllFilters);
    if (el.btnClearActiveTag) el.btnClearActiveTag.addEventListener('click', clearActiveTagFilter);

    // Tema Değiştirici
    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Üst Bar Butonları (Ekle & Ayarlar)
    if (el.btnOpenAddModal) {
      el.btnOpenAddModal.addEventListener('click', () => openEditorModal(null));
    }
    if (el.btnOpenSettings) {
      el.btnOpenSettings.addEventListener('click', openSettingsModal);
    }

    // Detay Modalı Olayları
    if (el.modalCloseBtn) el.modalCloseBtn.addEventListener('click', closeDetailModal);
    if (el.modalBackdrop) {
      el.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === el.modalBackdrop) closeDetailModal();
      });
    }
    if (el.modalImgFrame) {
      el.modalImgFrame.addEventListener('click', openLightbox);
    }
    if (el.btnEditCurrentProduct) {
      el.btnEditCurrentProduct.addEventListener('click', () => {
        if (state.selectedProduct) {
          openEditorModal(state.selectedProduct);
        }
      });
    }

    // Editör Modalı Olayları
    if (el.editorCloseBtn) el.editorCloseBtn.addEventListener('click', closeEditorModal);
    if (el.btnCancelEditor) el.btnCancelEditor.addEventListener('click', closeEditorModal);
    if (el.editorModalBackdrop) {
      el.editorModalBackdrop.addEventListener('click', (e) => {
        if (e.target === el.editorModalBackdrop) closeEditorModal();
      });
    }
    if (el.productEditForm) {
      el.productEditForm.addEventListener('submit', handleSaveProduct);
    }
    if (el.btnDeleteProduct) {
      el.btnDeleteProduct.addEventListener('click', handleDeleteProduct);
    }
    setupPhotoUploader();

    // Ayarlar Modalı Olayları
    if (el.settingsCloseBtn) el.settingsCloseBtn.addEventListener('click', closeSettingsModal);
    if (el.settingsModalBackdrop) {
      el.settingsModalBackdrop.addEventListener('click', (e) => {
        if (e.target === el.settingsModalBackdrop) closeSettingsModal();
      });
    }
    if (el.btnSyncGithub) {
      el.btnSyncGithub.addEventListener('click', syncToGitHub);
    }
    if (el.btnDownloadJson) {
      el.btnDownloadJson.addEventListener('click', downloadJson);
    }
    if (el.btnCopyJson) {
      el.btnCopyJson.addEventListener('click', copyJsonToClipboard);
    }
    if (el.btnResetLocalData) {
      el.btnResetLocalData.addEventListener('click', handleResetLocalData);
    }

    // Yaş & Kilo Persantil Rehberi Olayları
    if (el.btnOpenWeightRef) {
      el.btnOpenWeightRef.addEventListener('click', () => openWeightRefModal(''));
    }
    if (el.weightRefCloseBtn) {
      el.weightRefCloseBtn.addEventListener('click', closeWeightRefModal);
    }
    if (el.weightRefModalBackdrop) {
      el.weightRefModalBackdrop.addEventListener('click', (e) => {
        if (e.target === el.weightRefModalBackdrop) closeWeightRefModal();
      });
    }
    if (el.weightRefSearchInput) {
      el.weightRefSearchInput.addEventListener('input', (e) => {
        renderPersantilTable(e.target.value);
      });
    }

    // Lightbox Kapatma
    if (el.lightboxCloseBtn) el.lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (el.lightboxBackdrop) {
      el.lightboxBackdrop.addEventListener('click', (e) => {
        if (e.target === el.lightboxBackdrop) closeLightbox();
      });
    }

    // Klavye Kısayolları (Escape ile kapatma)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.lightboxBackdrop && el.lightboxBackdrop.style.display === 'flex') {
          closeLightbox();
        } else if (el.weightRefModalBackdrop && el.weightRefModalBackdrop.classList.contains('active')) {
          closeWeightRefModal();
        } else if (el.editorModalBackdrop && el.editorModalBackdrop.classList.contains('active')) {
          closeEditorModal();
        } else if (el.settingsModalBackdrop && el.settingsModalBackdrop.classList.contains('active')) {
          closeSettingsModal();
        } else if (el.modalBackdrop && el.modalBackdrop.classList.contains('active')) {
          closeDetailModal();
        }
      }
    });
  }

  // --- BAŞLATMA (INIT) ---
  function init() {
    applyTheme(state.currentTheme);
    initEvents();
    loadProducts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
