/**
 * ============================================================================
 * কবর পথের সামগ্রী — Admin Panel JavaScript Controller
 * ============================================================================
 */

(function () {
  'use strict';

  let currentProducts = [];
  let currentOrders = [];
  let currentUsers = [];
  let editingId = null;

  /* ─── DOM Elements ─── */
  const loginOverlay = document.getElementById('adminLoginOverlay');
  const loginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const toastBox = document.getElementById('toastBox');

  // Metrics
  const metricProductsCount = document.getElementById('metricProductsCount');
  const metricOrdersCount = document.getElementById('metricOrdersCount');
  const metricPendingCount = document.getElementById('metricPendingCount');
  const metricUsersCount = document.getElementById('metricUsersCount');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const badgeProdCount = document.getElementById('badgeProdCount');
  const badgeOrderCount = document.getElementById('badgeOrderCount');
  const badgeUserCount = document.getElementById('badgeUserCount');

  // Product Form
  const productForm = document.getElementById('productForm');
  const fId = document.getElementById('f-id');
  const fTitle = document.getElementById('f-title');
  const fCategory = document.getElementById('f-category');
  const fUnit = document.getElementById('f-unit');
  const fPrice = document.getElementById('f-price');
  const fOldPrice = document.getElementById('f-old-price');
  const fStock = document.getElementById('f-stock');
  const fBadge = document.getElementById('f-badge');
  const fImageUrl = document.getElementById('f-image-url');
  const fImageFile = document.getElementById('f-image-file');
  const fShortDesc = document.getElementById('f-short-desc');
  const fItems = document.getElementById('f-items');
  const fDesc = document.getElementById('f-desc');
  const fStatus = document.getElementById('f-status');
  const saveProductBtn = document.getElementById('saveProductBtn');
  const resetFormBtn = document.getElementById('resetFormBtn');

  // Edit Mode Banner
  const editModeBanner = document.getElementById('editModeBanner');
  const editingProductTitle = document.getElementById('editingProductTitle');
  const editingProductId = document.getElementById('editingProductId');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const formPanelTitle = document.getElementById('formPanelTitle');

  // Live Preview Elements
  const prevImg = document.getElementById('prevImg');
  const prevBadge = document.getElementById('prevBadge');
  const prevTitle = document.getElementById('prevTitle');
  const prevDesc = document.getElementById('prevDesc');
  const prevPrice = document.getElementById('prevPrice');
  const prevOldPrice = document.getElementById('prevOldPrice');
  const prevOldPriceBox = document.getElementById('prevOldPriceBox');
  const prevUnit = document.getElementById('prevUnit');
  const prevItemsList = document.getElementById('prevItemsList');

  // Product Table & Filters
  const productsTableBody = document.getElementById('productsTableBody');
  const productSearchInput = document.getElementById('productSearchInput');
  const productFilterCat = document.getElementById('productFilterCat');
  const quickAddProductBtn = document.getElementById('quickAddProductBtn');

  // Orders
  const ordersCardsContainer = document.getElementById('ordersCardsContainer');
  const orderSearchInput = document.getElementById('orderSearchInput');
  const orderStatusFilter = document.getElementById('orderStatusFilter');
  const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');

  // Users
  const usersTableBody = document.getElementById('usersTableBody');

  // DB Status
  const dbStatusText = document.getElementById('dbStatusText');

  /* ─── Toast Notification Helper ─── */
  function showToast(msg, isSuccess = true) {
    if (!toastBox) return;
    toastBox.textContent = msg;
    toastBox.style.display = 'flex';
    toastBox.style.borderLeftColor = isSuccess ? 'var(--accent)' : 'var(--danger)';
    setTimeout(() => {
      toastBox.style.display = 'none';
    }, 3200);
  }

  /* ─── Bengali Digit Formatter ─── */
  function toBengaliNum(n) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/[0-9]/g, d => bengaliDigits[d]);
  }

  /* ─── Category Bangla Label Helper ─── */
  function getCategoryName(cat) {
    switch (cat) {
      case 'kafan': return 'কাফনের কাপড়';
      case 'dafon': return 'দাফন সামগ্রী';
      case 'janaza': return 'জানাজার সামগ্রী';
      case 'attar': return 'সুগন্ধি ও আতর';
      case 'package': return 'অল-ইন-ওয়াইন প্যাকেজ';
      default: return 'অন্যান্য সামগ্রী';
    }
  }

  /* ─── 1. Auth Guard ─── */
  function checkAuth() {
    const isAuthed = sessionStorage.getItem(window.STORAGE_KEYS.ADMIN_AUTH) === 'true';
    if (isAuthed) {
      if (loginOverlay) loginOverlay.style.display = 'none';
      initDashboard();
    } else {
      if (loginOverlay) loginOverlay.style.display = 'flex';
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value.trim();

      if (email.toLowerCase() === 'admin@kabarpather.com' && pass === 'admin123') {
        sessionStorage.setItem(window.STORAGE_KEYS.ADMIN_AUTH, 'true');
        loginOverlay.style.display = 'none';
        showToast('এডমিন ড্যাশবোর্ডে স্বাগতম!');
        initDashboard();
      } else {
        alert('ভুল ইমেইল অথবা পাসওয়ার্ড! ডিফল্ট: admin@kabarpather.com / admin123');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(window.STORAGE_KEYS.ADMIN_AUTH);
      checkAuth();
    });
  }

  /* ─── 2. Tab Navigation ─── */
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  if (quickAddProductBtn) {
    quickAddProductBtn.addEventListener('click', () => {
      const addTab = document.querySelector('[data-tab="tab-add-product"]');
      if (addTab) addTab.click();
    });
  }

  /* ─── 3. Live Card Preview Synchronization ─── */
  function updateLivePreview() {
    if (!prevTitle) return;

    prevTitle.textContent = fTitle.value.trim() || 'পণ্যের নাম';
    prevDesc.textContent = fShortDesc.value.trim() || fDesc.value.trim() || 'পণ্যের সংক্ষিপ্ত বিবরণ এখানে প্রদর্শিত হবে।';
    prevPrice.textContent = fPrice.value || '০';
    prevUnit.textContent = fUnit.value.trim() || 'সেট';

    if (fOldPrice.value && Number(fOldPrice.value) > 0) {
      prevOldPriceBox.style.display = 'inline';
      prevOldPrice.textContent = fOldPrice.value;
    } else {
      prevOldPriceBox.style.display = 'none';
    }

    if (fBadge.value) {
      prevBadge.style.display = 'inline-block';
      prevBadge.textContent = fBadge.value;
    } else {
      prevBadge.style.display = 'none';
    }

    if (fImageUrl.value.trim()) {
      prevImg.src = fImageUrl.value.trim();
    } else {
      prevImg.src = 'assets/images/product-kafan.jpg';
    }

    // Items list
    const itemsText = fItems.value.trim();
    if (itemsText) {
      const items = itemsText.split('\n').filter(s => s.trim().length > 0);
      prevItemsList.innerHTML = items.map(it => `<li>${escapeHtml(it)}</li>`).join('');
    } else {
      prevItemsList.innerHTML = '<li>উন্নত মানের সামগ্রী অন্তর্ভুক্ত</li>';
    }
  }

  const formInputs = [fTitle, fPrice, fOldPrice, fUnit, fBadge, fImageUrl, fShortDesc, fItems, fDesc];
  formInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateLivePreview);
      input.addEventListener('change', updateLivePreview);
    }
  });

  // Photo file upload with automatic .webp optimization
  const photoOptimizedBadge = document.getElementById('photoOptimizedBadge');

  if (fImageFile) {
    fImageFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        showToast('ছবি .webp ফরম্যাটে অপ্টিমাইজ করা হচ্ছে...');
        let uploadTarget = file;
        let filename = file.name;

        // Automatically optimize to .webp format (<80KB)
        if (window.PhotoOptimizer) {
          const optResult = await window.PhotoOptimizer.optimize(file, { maxWidth: 960, maxHeight: 960, quality: 0.82 });
          uploadTarget = optResult.blob || optResult.dataUrl;
          filename = optResult.filename;

          if (photoOptimizedBadge) {
            const origStr = window.PhotoOptimizer.formatBytes(optResult.originalBytes);
            const optStr = window.PhotoOptimizer.formatBytes(optResult.optimizedBytes);
            photoOptimizedBadge.innerHTML = `⚡ <strong>WebP অপ্টিমাইজেশন সম্পন্ন:</strong> ${origStr} ➔ <strong>${optStr}</strong> (সাশ্রয়: ${optResult.savingsPercent}%)`;
            photoOptimizedBadge.style.display = 'block';
          }

          // Immediately preview the WebP image
          fImageUrl.value = optResult.dataUrl;
          updateLivePreview();
        }

        showToast('ক্লাউড স্টোরেজে আপলোড হচ্ছে...');
        const res = await window.KabarApi.uploadPhoto(uploadTarget, filename);
        if (res && res.url && !res.fallback) {
          fImageUrl.value = res.url;
          updateLivePreview();
          showToast('ছবি সফলভাবে .webp ফরম্যাটে আপলোড সম্পন্ন!');
        } else {
          showToast('ছবি .webp ফরম্যাটে লোকালভাবে সংরক্ষিত হয়েছে');
        }
      } catch (err) {
        console.error('Photo optimization/upload error:', err);
        showToast('ছবি অপ্টিমাইজেশনে ত্রুটি: ' + err.message, false);
      }
    });
  }

  /* ─── 4. Product Add & Edit Handlers ─── */
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = fTitle.value.trim();
      const price = Number(fPrice.value);

      if (!title || !price) {
        alert('অনুগ্রহ করে পণ্যের নাম এবং বিক্রয় মূল্য সঠিকভাবে পূরণ করুন।');
        return;
      }

      saveProductBtn.disabled = true;
      saveProductBtn.textContent = 'সংরক্ষণ করা হচ্ছে...';

      const items = fItems.value.split('\n').map(s => s.trim()).filter(Boolean);
      const imgUrl = fImageUrl.value.trim() || 'assets/images/product-kafan.jpg';

      const productPayload = {
        id: editingId || ('kp-prod-' + Date.now().toString(36)),
        title,
        category: fCategory.value,
        price,
        oldPrice: Number(fOldPrice.value) || 0,
        unit: fUnit.value.trim() || 'সেট',
        badge: fBadge.value.trim(),
        stock: Number(fStock.value) || 10,
        short_desc: fShortDesc.value.trim(),
        description: fDesc.value.trim(),
        items,
        images: [imgUrl],
        image: imgUrl,
        status: fStatus.value
      };

      try {
        const res = await window.KabarApi.addProduct(productPayload);
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = '✓ পণ্য প্রকাশ করুন (Publish Post)';

        if (res && res.ok) {
          showToast(editingId ? 'পণ্য সফলভাবে আপডেট করা হয়েছে!' : 'নতুন পণ্য সফলভাবে প্রকাশ করা হয়েছে!');
          resetForm();
          await loadProducts();
          // Switch to products table
          const manageTab = document.querySelector('[data-tab="tab-manage-products"]');
          if (manageTab) manageTab.click();
        } else {
          alert('ত্রুটি: ' + (res.error || 'পণ্য সংরক্ষণ করা সম্ভব হয়নি'));
        }
      } catch (err) {
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = '✓ পণ্য প্রকাশ করুন (Publish Post)';
        alert('নেটওয়ার্ক ত্রুটি: ' + err.message);
      }
    });
  }

  function resetForm() {
    editingId = null;
    if (fId) fId.value = '';
    if (productForm) productForm.reset();
    if (photoOptimizedBadge) photoOptimizedBadge.style.display = 'none';
    if (editModeBanner) editModeBanner.style.display = 'none';
    if (formPanelTitle) formPanelTitle.textContent = 'নতুন সামগ্রী / বিক্রয় পোস্ট যোগ করুন';
    if (saveProductBtn) saveProductBtn.textContent = '✓ পণ্য প্রকাশ করুন (Publish Post)';
    updateLivePreview();
  }

  if (resetFormBtn) resetFormBtn.addEventListener('click', resetForm);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);

  function startEditProduct(product) {
    editingId = product.id;
    if (fId) fId.value = product.id;
    fTitle.value = product.title || '';
    fCategory.value = product.category || 'other';
    fUnit.value = product.unit || 'সেট';
    fPrice.value = product.price || '';
    fOldPrice.value = product.oldPrice || product.old_price || '';
    fStock.value = product.stock !== undefined ? product.stock : 10;
    fBadge.value = product.badge || '';
    fImageUrl.value = product.image || (product.images && product.images[0]) || '';
    fShortDesc.value = product.short_desc || '';
    fDesc.value = product.description || product.desc || '';
    fStatus.value = product.status || 'Active';

    const items = product.items || product.items_included || [];
    fItems.value = Array.isArray(items) ? items.join('\n') : '';

    if (editModeBanner) editModeBanner.style.display = 'flex';
    if (editingProductTitle) editingProductTitle.textContent = product.title;
    if (editingProductId) editingProductId.textContent = product.id;
    if (formPanelTitle) formPanelTitle.textContent = 'পণ্য সম্পাদনা করুন';
    if (saveProductBtn) saveProductBtn.textContent = '✓ পরিবর্তন সংরক্ষণ করুন';

    updateLivePreview();

    // Switch to Add/Edit tab
    const addTab = document.querySelector('[data-tab="tab-add-product"]');
    if (addTab) addTab.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ─── 5. Render Products Table ─── */
  async function loadProducts() {
    currentProducts = await window.KabarApi.getProducts();
    renderProductsTable();
    updateMetrics();
  }

  function renderProductsTable() {
    if (!productsTableBody) return;

    const query = (productSearchInput ? productSearchInput.value : '').toLowerCase().trim();
    const cat = productFilterCat ? productFilterCat.value : 'all';

    const filtered = currentProducts.filter(p => {
      const matchCat = (cat === 'all') || (p.category === cat);
      const matchQuery = !query || (p.title || '').toLowerCase().includes(query) || (p.id || '').toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted)">
            কোনো পণ্য পাওয়া যায়নি।
          </td>
        </tr>`;
      return;
    }

    productsTableBody.innerHTML = filtered.map(p => {
      const img = p.image || (p.images && p.images[0]) || 'assets/images/product-kafan.jpg';
      const isActive = p.status === 'Active';
      return `
        <tr>
          <td><img src="${img}" alt="${escapeHtml(p.title)}" class="thumb-cell"></td>
          <td>
            <strong>${escapeHtml(p.title)}</strong><br>
            <small style="color:var(--text-muted)">ID: ${escapeHtml(p.id)}</small>
          </td>
          <td><span class="tab-badge">${getCategoryName(p.category)}</span></td>
          <td>
            <b>৳${p.price}</b>
            ${p.oldPrice ? `<small style="text-decoration:line-through;color:#999;margin-left:4px">৳${p.oldPrice}</small>` : ''}
          </td>
          <td>${toBengaliNum(p.stock)} ${escapeHtml(p.unit || 'সেট')}</td>
          <td>
            <span class="status-badge ${isActive ? 'active' : 'inactive'}">
              ${isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:6px">
              <button type="button" class="btn btn-outline btn-sm edit-prod-btn" data-id="${p.id}" style="color:var(--primary);border-color:var(--primary)">
                ✏️ সম্পাদনা
              </button>
              <button type="button" class="btn btn-outline-danger btn-sm del-prod-btn" data-id="${p.id}">
                🗑️ মুছুন
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    // Attach row events
    productsTableBody.querySelectorAll('.edit-prod-btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const prod = currentProducts.find(p => p.id === id);
        if (prod) startEditProduct(prod);
      });
    });

    productsTableBody.querySelectorAll('.del-prod-btn').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-id');
        if (confirm('আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?')) {
          await window.KabarApi.deleteProduct(id);
          showToast('পণ্যটি সফলভাবে মুছে ফেলা হয়েছে');
          loadProducts();
        }
      });
    });
  }

  if (productSearchInput) productSearchInput.addEventListener('input', renderProductsTable);
  if (productFilterCat) productFilterCat.addEventListener('change', renderProductsTable);

  /* ─── 6. Orders Management ─── */
  async function loadOrders() {
    currentOrders = await window.KabarApi.getOrders();
    renderOrders();
    updateMetrics();
  }

  function renderOrders() {
    if (!ordersCardsContainer) return;

    const query = (orderSearchInput ? orderSearchInput.value : '').toLowerCase().trim();
    const statusFilter = orderStatusFilter ? orderStatusFilter.value : 'all';

    const filtered = currentOrders.filter(o => {
      const matchStatus = (statusFilter === 'all') || (o.status === statusFilter) || (o.order_status === statusFilter);
      const matchQuery = !query || 
        (o.ref || '').toLowerCase().includes(query) || 
        (o.customer_name || o.name || '').toLowerCase().includes(query) ||
        (o.customer_phone || o.phone || '').includes(query);
      return matchStatus && matchQuery;
    });

    if (filtered.length === 0) {
      ordersCardsContainer.innerHTML = `
        <div style="text-align:center;padding:40px;background:#fff;border-radius:var(--radius-md);border:1px solid var(--surface-border);color:var(--text-muted)">
          📦 কোনো অর্ডার পাওয়া যায়নি।
        </div>`;
      return;
    }

    ordersCardsContainer.innerHTML = filtered.map(order => {
      const name = order.customer_name || order.name || 'অজ্ঞাত গ্রাহক';
      const phone = order.customer_phone || order.phone || '';
      const address = order.address || '';
      const area = order.area || 'ঢাকা সিটি';
      const total = order.total || order.total_amount || 0;
      const status = order.status || order.order_status || 'Pending';
      const placedAt = order.placed_at || order.placedAt || '';
      const dateStr = placedAt ? new Date(placedAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }) : 'আজ';

      const items = order.items || order.details || [];
      const itemsListHtml = items.map(it => `
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span>• ${escapeHtml(it.title || 'পণ্য')} × ${it.qty || 1}</span>
          <b>৳${(it.price || 0) * (it.qty || 1)}</b>
        </div>
      `).join('');

      let statusBadgeClass = 'pending';
      let statusBangla = 'অপেক্ষমাণ';
      if (status === 'Confirmed') { statusBadgeClass = 'confirmed'; statusBangla = 'নিশ্চিত'; }
      else if (status === 'Delivered') { statusBadgeClass = 'delivered'; statusBangla = 'ডেলিভারড'; }
      else if (status === 'Cancelled') { statusBadgeClass = 'cancelled'; statusBangla = 'বাতিল'; }

      const cleanPhone = phone.replace(/[\s-]/g, '');
      const waMsg = encodeURIComponent(`আসসালামু আলাইকুম ${name}, কবর পথের সামগ্রী থেকে আপনার অর্ডার (${order.ref}) সম্পর্কে যোগাযোগ করছি।`);

      return `
        <div class="order-card" data-ref="${escapeHtml(order.ref)}">
          <div class="order-card-header">
            <div>
              <span class="order-ref">#${escapeHtml(order.ref)}</span>
              <span style="font-size:0.85rem;color:var(--text-muted);margin-left:8px">📅 ${dateStr}</span>
            </div>
            <div>
              <span class="status-badge ${statusBadgeClass}">${statusBangla}</span>
            </div>
          </div>

          <div class="order-meta-info">
            <div>
              <strong style="color:var(--primary-dark)">👤 গ্রাহকের নাম:</strong> ${escapeHtml(name)}<br>
              <strong>📞 ফোন:</strong> <a href="tel:${cleanPhone}" style="color:var(--primary);font-weight:700">${escapeHtml(phone)}</a>
            </div>
            <div>
              <strong>📍 ডেলিভারি এলাকা:</strong> ${escapeHtml(area)}<br>
              <strong>🏠 ঠিকানা:</strong> ${escapeHtml(address)}
            </div>
            <div>
              <strong>💳 পেমেন্ট:</strong> ${escapeHtml(order.payment || order.payment_method || 'ক্যাশ অন ডেলিভারি')}<br>
              <strong>💰 মোট মূল্য:</strong> <span style="font-size:1.15rem;font-weight:800;color:var(--primary)">৳${total}</span>
            </div>
          </div>

          <div class="order-items-summary">
            <strong style="display:block;margin-bottom:6px;font-size:0.85rem;color:var(--text-muted)">অর্ডারকৃত সামগ্রী (${items.length}টি আইটেম):</strong>
            ${itemsListHtml || '<em>কোনো বিস্তারিত আইটেম পাওয়া যায়নি</em>'}
          </div>

          <div class="order-actions">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <a href="tel:${cleanPhone}" class="btn btn-outline btn-sm" style="color:var(--primary);border-color:var(--primary)">
                📞 কল করুন
              </a>
              <a href="https://wa.me/${cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone}?text=${waMsg}" target="_blank" class="btn btn-outline btn-sm" style="color:#15803d;border-color:#15803d">
                💬 WhatsApp মেসেজ
              </a>
            </div>

            <div style="display:flex;gap:8px;align-items:center">
              <select class="form-control change-order-status" data-ref="${order.ref}" style="padding:4px 8px;font-size:0.85rem;width:auto">
                <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>অপেক্ষমাণ (Pending)</option>
                <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>নিশ্চিত (Confirmed)</option>
                <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>ডেলিভারড (Delivered)</option>
                <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>বাতিল (Cancelled)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach status change events
    ordersCardsContainer.querySelectorAll('.change-order-status').forEach(sel => {
      sel.addEventListener('change', async () => {
        const ref = sel.getAttribute('data-ref');
        const newStatus = sel.value;
        await window.KabarApi.updateOrderStatus(ref, newStatus);
        showToast(`অর্ডার ${ref} এর স্ট্যাটাস আপডেট হয়েছে!`);
        loadOrders();
      });
    });
  }

  if (orderSearchInput) orderSearchInput.addEventListener('input', renderOrders);
  if (orderStatusFilter) orderStatusFilter.addEventListener('change', renderOrders);
  if (refreshOrdersBtn) refreshOrdersBtn.addEventListener('click', () => {
    showToast('অর্ডার রিফ্রেশ হচ্ছে...');
    loadOrders();
  });

  /* ─── 7. Users Management ─── */
  async function loadUsers() {
    currentUsers = await window.KabarApi.getUsers();
    renderUsers();
    updateMetrics();
  }

  function renderUsers() {
    if (!usersTableBody) return;

    if (!currentUsers || currentUsers.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">
            এখনও কোনো গ্রাহক একাউন্ট নিবন্ধিত হয়নি।
          </td>
        </tr>`;
      return;
    }

    usersTableBody.innerHTML = currentUsers.map(u => {
      const date = u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('bn-BD') : 'আজ';
      const isActive = u.status === 'Active';
      return `
        <tr>
          <td><strong>${escapeHtml(u.name || 'গ্রাহক')}</strong></td>
          <td>${escapeHtml(u.email || '')}</td>
          <td><a href="tel:${escapeHtml(u.phone)}" style="color:var(--primary)">${escapeHtml(u.phone || '—')}</a></td>
          <td>${date}</td>
          <td>
            <span class="status-badge ${isActive ? 'active' : 'inactive'}">
              ${isActive ? 'সক্রিয়' : 'স্থগিত'}
            </span>
          </td>
          <td>
            <button type="button" class="btn btn-outline btn-sm toggle-user-btn" data-id="${u.id}" data-status="${u.status || 'Active'}">
              ${isActive ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
            </button>
          </td>
        </tr>`;
    }).join('');

    // Attach user status toggle event
    usersTableBody.querySelectorAll('.toggle-user-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const currentStatus = btn.getAttribute('data-status') || 'Active';
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        const actionLabel = newStatus === 'Active' ? 'সক্রিয়' : 'স্থগিত';

        if (confirm(`আপনি কি এই গ্রাহক অ্যাকাউন্টটি ${actionLabel} করতে চান?`)) {
          await window.KabarApi.updateUserStatus(id, newStatus);
          showToast(`গ্রাহক অ্যাকাউন্টটি ${actionLabel} করা হয়েছে`);
          loadUsers();
        }
      });
    });
  }

  /* ─── 8. Update Metrics & Badge Counters ─── */
  function updateMetrics() {
    if (metricProductsCount) metricProductsCount.textContent = toBengaliNum(currentProducts.length);
    if (badgeProdCount) badgeProdCount.textContent = toBengaliNum(currentProducts.length);

    if (metricOrdersCount) metricOrdersCount.textContent = toBengaliNum(currentOrders.length);
    if (badgeOrderCount) badgeOrderCount.textContent = toBengaliNum(currentOrders.length);

    const pending = currentOrders.filter(o => (o.status === 'Pending' || o.order_status === 'Pending')).length;
    if (metricPendingCount) metricPendingCount.textContent = toBengaliNum(pending);

    if (metricUsersCount) metricUsersCount.textContent = toBengaliNum(currentUsers.length);
    if (badgeUserCount) badgeUserCount.textContent = toBengaliNum(currentUsers.length);
  }

  /* ─── 9. Database Health Ping ─── */
  async function checkDbHealth() {
    try {
      const pingRes = await window.KabarApi.ping();
      if (pingRes && pingRes.ok) {
        if (dbStatusText) dbStatusText.textContent = `ক্লাউড ডাটাবেস সক্রিয় (${pingRes.latency}ms)`;
      } else {
        if (dbStatusText) dbStatusText.textContent = 'লোকাল অফলাইন মোড সক্রিয়';
      }
    } catch (_) {
      if (dbStatusText) dbStatusText.textContent = 'লোকাল অফলাইন মোড সক্রিয়';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ─── Initialize Dashboard ─── */
  async function initDashboard() {
    checkDbHealth();
    updateLivePreview();
    await Promise.all([loadProducts(), loadOrders(), loadUsers()]);
  }

  // Auto-init on page load
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
  });

})();
