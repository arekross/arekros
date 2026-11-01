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

    // Üst Butonlar
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnOpenSettings: document.getElementById('btnOpenSettings'),

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
    modalWarningText: document.getElementById('modalWarningText'),
    btnCopyNote: document.getElementById('btnCopyNote'),
    copyBtnText: document.getElementById('copyBtnText'),
    btnEditCurrentProduct: document.getElementById('btnEditCurrentProduct'),

    // Editör Modalı (Ürün Ekle / Düzenle)
    editorModalBackdrop: document.getElementById('editorModalBackdrop'),
    editorSheet: document.getElementById('editorSheet'),
    editorCloseBtn: document.getElementById('editorCloseBtn'),
    editorSheetTitle: document.getElementById('editorSheetTitle'),
    productEditForm: document.getElementById('productEditForm'),
    formProductId: document.getElementById('formProductId'),
    photoDropzone: document.getElementById('photoDropzone'),
    formPhotoInput: document.getElementById('formPhotoInput'),
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

  function renderRoutineChips() {
    if (!el.routineChipsTrack) return;

    const routineCounts = {
      'all': state.products.length,
      'Temizleyici': 0,
      'Serum': 0,
      'Nemlendirici': 0,
      'Güneş Koruması': 0,
      'Göz Çevresi': 0,
      'Vücut & Bebek': 0,
      'Saç Bakımı': 0,
      'Takviye Edici Gıda': 0
    };

    state.products.forEach(p => {
      const text = `${p.rutin_adimi || ''} ${p.sub_category || ''} ${p.name || ''}`.toLowerCase();
      if (text.includes('temizle') || text.includes('jel') || text.includes('köpük') || text.includes('foam') || text.includes('cleanser')) routineCounts['Temizleyici']++;
      if (text.includes('serum') || text.includes('konsantre') || text.includes('ampul')) routineCounts['Serum']++;
      if (text.includes('nemlendir') || text.includes('krem') || text.includes('cream') || text.includes('lotion') || text.includes('losyon') || text.includes('balm')) routineCounts['Nemlendirici']++;
      if (text.includes('güneş') || text.includes('spf') || text.includes('sun') || text.includes('uv')) routineCounts['Güneş Koruması']++;
      if (text.includes('göz') || text.includes('yeux') || text.includes('eye')) routineCounts['Göz Çevresi']++;
      if (text.includes('bebek') || text.includes('baby') || text.includes('vücut') || text.includes('body')) routineCounts['Vücut & Bebek']++;
      if (text.includes('şampuan') || text.includes('saç') || text.includes('shampoo') || text.includes('hair')) routineCounts['Saç Bakımı']++;
      if (text.includes('tablet') || text.includes('kapsül') || text.includes('takviye') || text.includes('vitamin') || text.includes('omega') || text.includes('kolajen')) routineCounts['Takviye Edici Gıda']++;
    });

    const categories = [
      { id: 'all', label: 'Tüm Rutinler', count: routineCounts['all'], icon: '✨' },
      { id: 'Temizleyici', label: 'Temizleme', count: routineCounts['Temizleyici'], icon: '🫧' },
      { id: 'Serum', label: 'Serum & Bakım', count: routineCounts['Serum'], icon: '🧪' },
      { id: 'Nemlendirici', label: 'Nemlendirici', count: routineCounts['Nemlendirici'], icon: '💧' },
      { id: 'Güneş Koruması', label: 'Güneş (SPF)', count: routineCounts['Güneş Koruması'], icon: '☀️' },
      { id: 'Göz Çevresi', label: 'Göz Çevresi', count: routineCounts['Göz Çevresi'], icon: '👁️' },
      { id: 'Saç Bakımı', label: 'Saç & Şampuan', count: routineCounts['Saç Bakımı'], icon: '💇' },
      { id: 'Vücut & Bebek', label: 'Bebek & Vücut', count: routineCounts['Vücut & Bebek'], icon: '👶' },
      { id: 'Takviye Edici Gıda', label: 'Takviye & Vitamin', count: routineCounts['Takviye Edici Gıda'], icon: '💊' }
    ];

    let html = '';
    categories.forEach(cat => {
      const isActive = state.activeRoutine === cat.id;
      html += `
        <button type="button" class="filter-chip ${isActive ? 'active' : ''}" data-routine="${cat.id}">
          <span>${cat.icon} ${cat.label}</span>
          <span class="chip-count">(${cat.count})</span>
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
    const q = state.searchQuery.toLowerCase().trim();
    const brand = state.activeBrand.toLowerCase();
    const routine = state.activeRoutine;

    state.filteredProducts = state.products.filter(p => {
      // Marka Filtresi
      if (brand !== 'all' && (p.brand || '').toLowerCase() !== brand) {
        return false;
      }

      // Rutin Filtresi
      if (routine !== 'all') {
        const pRutin = `${p.rutin_adimi || ''} ${p.sub_category || ''} ${p.name || ''}`.toLowerCase();
        let targetWord = routine.toLowerCase();
        if (targetWord === 'temizleyici') targetWord = 'temiz';
        else if (targetWord === 'güneş koruması') targetWord = 'güneş';
        else if (targetWord === 'göz çevresi') targetWord = 'göz';
        else if (targetWord === 'vücut & bebek') targetWord = 'bebek';
        else if (targetWord === 'saç bakımı') targetWord = 'saç';
        else if (targetWord === 'takviye edici gıda') targetWord = 'tablet';

        if (!pRutin.includes(targetWord) && !pRutin.includes(routine.toLowerCase())) {
          return false;
        }
      }

      // Arama Filtresi
      if (q) {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const brandMatch = (p.brand || '').toLowerCase().includes(q);
        const activesMatch = (p.etken_maddeler || []).some(a => a.toLowerCase().includes(q));
        const tagsMatch = (p.tags || []).some(t => t.toLowerCase().includes(q));
        const complaintMatch = (p.hangi_sikayetle_gelene_verilir || []).some(c => c.toLowerCase().includes(q));
        
        if (!nameMatch && !brandMatch && !activesMatch && !tagsMatch && !complaintMatch) {
          return false;
        }
      }

      return true;
    });

    renderGrid();
    updateStatusRow();
  }

  function updateStatusRow() {
    const total = state.products.length;
    const count = state.filteredProducts.length;

    if (el.liveCountBadge) {
      el.liveCountBadge.textContent = `${count} / ${total} Ürün`;
    }

    const hasFilter = state.activeBrand !== 'all' || state.activeRoutine !== 'all' || state.searchQuery.length > 0;

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
        if (state.searchQuery) parts.push(`"${state.searchQuery}"`);
        el.statusText.textContent = `${parts.join(' + ')} için ${count} sonuç bulundu`;
      }
    }
  }

  function resetAllFilters() {
    state.activeBrand = 'all';
    state.activeRoutine = 'all';
    state.searchQuery = '';
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

    // Hızlı Çipler (Cilt Tipleri & Yaş Grubu)
    if (el.modalQuickChips) {
      let chipsHtml = '';
      if (product.yas_grubu) {
        chipsHtml += `<span class="quick-chip">👥 ${escapeHtml(product.yas_grubu)}</span>`;
      }
      if (Array.isArray(product.cilt_tipleri)) {
        product.cilt_tipleri.forEach(ct => {
          chipsHtml += `<span class="quick-chip">💧 ${escapeHtml(ct)}</span>`;
        });
      }
      el.modalQuickChips.innerHTML = chipsHtml;
    }

    // 1. Danışan Ne Derse Bu Ürün Verilir?
    if (el.modalComplaintList) {
      const complaints = Array.isArray(product.hangi_sikayetle_gelene_verilir) && product.hangi_sikayetle_gelene_verilir.length > 0
        ? product.hangi_sikayetle_gelene_verilir
        : [product.name + ' kullanımına uygun danışan şikayetlerinde tercih edilir.'];

      el.modalComplaintList.innerHTML = complaints.map(c => `
        <div class="complaint-item">
          <span>•</span>
          <span>"${escapeHtml(c)}"</span>
        </div>
      `).join('');
    }

    // 2. Nasıl Kullanılır?
    if (el.modalUsageText) {
      el.modalUsageText.textContent = product.nasil_kullanilir || 'Temizlenmiş cilde nazik dairesel hareketlerle uygulayınız.';
    }

    // 3. Öne Çıkan Aktifler
    if (el.modalActivesWrap) {
      const actives = Array.isArray(product.etken_maddeler) && product.etken_maddeler.length > 0
        ? product.etken_maddeler
        : ['Dermatolojik Olarak Test Edilmiş Patentli Formülasyon'];

      el.modalActivesWrap.innerHTML = actives.map(a => `
        <span class="active-tag">${escapeHtml(a)}</span>
      `).join('');
    }

    // 4. Güvenlik & Kimler Kullanamaz
    if (el.modalWarningText) {
      el.modalWarningText.textContent = product.kimler_kullanamaz || 'İçeriğindeki etken maddelere karşı hassasiyeti olanlar kullanmamalıdır.';
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

  // --- DANIŞAN KULLANIM NOTUNU KOPYALA ---
  function copyProductNote() {
    const p = state.selectedProduct;
    if (!p) return;

    const actives = (p.etken_maddeler || []).join(', ');
    const note = [
      `*${p.name}*`,
      p.size ? `📦 Boyut / Form: ${p.size}` : '',
      `🧴 Rutin: ${p.rutin_adimi || p.sub_category || 'Bakım'}`,
      '',
      `🩺 *Nasıl Kullanılır:*`,
      `${p.nasil_kullanilir || 'Temiz cilde günde 1-2 kez nazikçe masaj yaparak uygulayınız.'}`,
      '',
      actives ? `🧪 *Öne Çıkan Aktifler:* ${actives}` : '',
      p.kimler_kullanamaz ? `⚠️ *Önemli Uyarı:* ${p.kimler_kullanamaz}` : '',
      '',
      `_Sağlıklı günler dileriz._`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(note).then(() => {
      showToast('📋 Danışan kullanım notu kopyalandı!');
      if (el.copyBtnText) {
        const orig = el.copyBtnText.textContent;
        el.copyBtnText.textContent = '✓ Kopyalandı!';
        setTimeout(() => {
          el.copyBtnText.textContent = orig;
        }, 1800);
      }
    }).catch(err => {
      console.warn('Clipboard error:', err);
      showToast('Kopyalama başarısız oldu.');
    });
  }

  // --- FOTOĞRAF YÜKLEYİCİ VE CANVAS SIKIŞTIRMA ---
  function setupPhotoUploader() {
    if (!el.photoDropzone || !el.formPhotoInput) return;

    el.photoDropzone.addEventListener('click', (e) => {
      if (e.target.closest('#btnRemovePhoto')) return;
      el.formPhotoInput.click();
    });

    el.formPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
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
    });

    if (el.btnRemovePhoto) {
      el.btnRemovePhoto.addEventListener('click', (e) => {
        e.stopPropagation();
        currentEditingPhoto = '';
        el.formPhotoInput.value = '';
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
      el.formProductSkinTypes.value = Array.isArray(product.cilt_tipleri) ? product.cilt_tipleri.join(', ') : '';
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

    const productData = {
      id: id || ('custom_' + Date.now()),
      name: name,
      brand: brand,
      size: el.formProductSize.value.trim(),
      rutin_adimi: el.formProductRoutine.value.trim() || 'Cilt Bakımı',
      sub_category: el.formProductRoutine.value.trim() || 'Dermokozmetik',
      yas_grubu: el.formProductAgeGroup.value.trim(),
      cilt_tipleri: cilt_tipleri,
      hangi_sikayetle_gelene_verilir: hangi_sikayetle_gelene_verilir,
      nasil_kullanilir: el.formProductUsage.value.trim(),
      etken_maddeler: etken_maddeler,
      kimler_kullanamaz: el.formProductWarnings.value.trim(),
      image: currentEditingPhoto || 'images/placeholder.png'
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
    if (el.btnCopyNote) {
      el.btnCopyNote.addEventListener('click', copyProductNote);
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
