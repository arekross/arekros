/**
 * arekros — Mobil Öncelikli Dermokozmetik Ürün Kataloğu & Danışmanlık Konsolu
 * 254 Doğrulanmış Ürün Verisi ve Tıklanabilir Detay Modalı
 */

(function () {
  'use strict';

  // --- UYGULAMA DURUMU (STATE) ---
  const state = {
    products: [],
    filteredProducts: [],
    selectedProduct: null,
    
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

    // Modal
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

    // Lightbox
    lightboxBackdrop: document.getElementById('lightboxBackdrop'),
    lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxCaption: document.getElementById('lightboxCaption'),

    // Toast
    toast: document.getElementById('toastNotification')
  };

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

  // --- VERİ YÜKLEME ---
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

    state.products = prods;
    state.filteredProducts = prods;

    renderBrandChips();
    renderRoutineChips();
    applyFilter();
  }

  // --- FİLTRE ÇİPLERİ ---
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
      if (btn.dataset.brand.toLowerCase() === state.activeBrand.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function renderRoutineChips() {
    if (!el.routineChipsTrack) return;

    const routineMap = {
      'all': 'Tüm Rutinler',
      'Yüz & Vücut Temizleyici': '🧼 Temizleyiciler',
      'Serum & Konsantre Bakım': '💧 Serumlar',
      'Nemlendirici & Bariyer Krem': '🧴 Nemlendiriciler',
      'Güneş Koruması': '☀️ Güneş Koruması',
      'Şampuan & Saç Bakımı': '🚿 Saç Bakımı',
      'Göz Çevresi Bakımı': '👁️ Göz Çevresi',
      'Özel & SOS Onarıcı': '🩹 SOS & Onarıcı',
      'Gıda Takviyesi & Vitamin': '💊 Vitamin & Takviye'
    };

    let html = '';
    Object.entries(routineMap).forEach(([key, label]) => {
      const isActive = state.activeRoutine === key;
      html += `
        <button type="button" class="filter-chip ${isActive ? 'active' : ''}" data-routine="${escapeHtml(key)}">
          <span>${label}</span>
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
        const pRutin = (p.rutin_adimi || '');
        if (!pRutin.toLowerCase().includes(routine.toLowerCase().replace(/^[^\w\s]+/, '').trim())) {
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

      return `
        <article class="product-card" data-index="${idx}" tabindex="0" role="button" aria-label="${escapeHtml(p.name)}">
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

  // --- ÜRÜN DETAY MODALI (TIKLAYINCA AÇILIR) ---
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
      el.modalUsageText.textContent = product.nasil_kullanilir || 'Temizlenmiş cilde sabah ve/veya akşam nazik dairesel hareketlerle uygulayınız.';
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
      document.body.style.overflow = 'hidden'; // Arka plan kaymasını engelle
    }
  }

  function closeDetailModal() {
    if (el.modalBackdrop) {
      el.modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // --- DANIŞAN KULLANIM NOTUNU KOPYALA (WHATSAPP/SMS) ---
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

    // Modal Kapatma
    if (el.modalCloseBtn) el.modalCloseBtn.addEventListener('click', closeDetailModal);
    if (el.modalBackdrop) {
      el.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === el.modalBackdrop) {
          closeDetailModal();
        }
      });
    }

    // Modal Görsele Dokununca Lightbox Aç
    if (el.modalImgFrame) {
      el.modalImgFrame.addEventListener('click', openLightbox);
    }

    // Danışan Notunu Kopyala
    if (el.btnCopyNote) {
      el.btnCopyNote.addEventListener('click', copyProductNote);
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
