/**
 * ============================================================================
 * কবর পথের সামগ্রী — Interactive JavaScript & Store Controller
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  let productsCatalog = [];

  /* ─── Toast Notification ─── */
  const siteToast = document.getElementById('siteToast');
  function showToast(msg) {
    if (!siteToast) return;
    siteToast.textContent = msg;
    siteToast.style.display = 'flex';
    setTimeout(() => {
      siteToast.style.display = 'none';
    }, 3200);
  }

  /* ─── Bengali Digit Formatter ─── */
  function toBengaliNum(n) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/[0-9]/g, d => bengaliDigits[d]);
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

  /* ─── 1. Dynamic Products Loading, Filtering & Rendering ─── */
  const dynamicProductsGrid = document.getElementById('dynamicProductsGrid');
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const categoryTabs = document.getElementById('categoryTabs');
  let selectedCategory = 'all';
  let searchQuery = '';

  function renderFilteredProducts() {
    if (!dynamicProductsGrid) return;

    let filtered = productsCatalog.slice();

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const cat = (item.category || '').toLowerCase();
        const badge = (item.badge || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        return cat.includes(selectedCategory) || badge.includes(selectedCategory) || title.includes(selectedCategory);
      });
    }

    // 2. Search Filter
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const title = (item.title || '').toLowerCase();
        const desc = (item.short_desc || item.description || item.desc || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        return title.includes(searchQuery) || desc.includes(searchQuery) || cat.includes(searchQuery);
      });
    }

    if (filtered.length === 0) {
      dynamicProductsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">
          🔍 কোনো পণ্য খুঁজে পাওয়া যায়নি। অন্য ক্যাটাগরি অথবা সার্চ দিয়ে চেষ্টা করুন।
        </div>`;
      return;
    }

    dynamicProductsGrid.innerHTML = filtered.map(item => {
      const img = item.image || (item.images && item.images[0]) || 'assets/images/product-kafan.jpg';
      const badge = item.badge || 'বিশেষ পণ্য';
      const oldPriceHtml = (item.oldPrice || item.old_price) ? 
        `<span class="product-price-old">৳${toBengaliNum(item.oldPrice || item.old_price)}</span>` : '';

      return `
        <article class="product-card" data-id="${escapeHtml(item.id)}">
          <div class="product-img-wrap">
            <img src="${img}" alt="${escapeHtml(item.title)}" class="product-img" loading="lazy" width="400" height="300">
            <span class="product-tag">${escapeHtml(badge)}</span>
          </div>
          <div class="product-card-body">
            <h3 class="product-title">${escapeHtml(item.title)}</h3>
            <p class="product-desc">${escapeHtml(item.short_desc || item.desc || '')}</p>
            
            <div class="product-card-pricing">
              <span class="product-price-current">৳${toBengaliNum(item.price)}</span>
              ${oldPriceHtml}
              <small style="color:var(--text-muted)">/ ${escapeHtml(item.unit || 'সেট')}</small>
            </div>

            <div class="product-card-actions">
              <button type="button" class="btn-quick-view open-product-detail-btn" data-id="${escapeHtml(item.id)}">
                বিস্তারিত
              </button>
              <button type="button" class="btn-add-cart add-to-cart-btn" data-id="${escapeHtml(item.id)}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>অর্ডারে যোগ</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach Event Handlers to Dynamic Buttons
    dynamicProductsGrid.querySelectorAll('.open-product-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-id');
        openProductModalById(prodId);
      });
    });

    dynamicProductsGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-id');
        const prod = productsCatalog.find(p => p.id === prodId);
        if (prod && window.KabarApi) {
          window.KabarApi.addToCart(prod, 1);
          updateCartUi();
          showToast(`"${prod.title}" কার্টে যোগ করা হয়েছে!`);
          openCartDrawer();
        }
      });
    });
  }

  // Category Tabs Listener
  if (categoryTabs) {
    categoryTabs.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryTabs.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCategory = btn.getAttribute('data-category') || 'all';
        renderFilteredProducts();
      });
    });
  }

  // Search Input Listener
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderFilteredProducts();
    });
  }

  async function loadAndRenderProducts() {
    if (window.KabarApi) {
      productsCatalog = await window.KabarApi.getProducts();
    }
    renderFilteredProducts();
  }

  /* ─── 2. Product Details Modal Logic ─── */
  const modal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalProductImg');
  const modalTitle = document.getElementById('modalProductTitle');
  const modalDesc = document.getElementById('modalProductDesc');
  const modalCategory = document.getElementById('modalProductCategory');
  const modalPackageItems = document.getElementById('modalPackageItems');
  const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
  const modalOrderBtn = document.getElementById('modalOrderBtn');
  let currentActiveModalProduct = null;

  function openProductModalById(productId) {
    const prod = productsCatalog.find(p => p.id === productId);
    if (!prod || !modal) return;
    currentActiveModalProduct = prod;

    modalImg.src = prod.image || (prod.images && prod.images[0]) || 'assets/images/product-kafan.jpg';
    modalImg.alt = prod.title;
    modalTitle.textContent = prod.title;
    modalCategory.textContent = prod.badge || 'পণ্য বিবরণী';
    modalDesc.textContent = prod.description || prod.short_desc || prod.desc || '';

    // Populate items list
    modalPackageItems.innerHTML = '';
    const items = prod.items || prod.items_included || [];
    if (Array.isArray(items) && items.length) {
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        modalPackageItems.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'উন্নত মানের শরীয়তসম্মত সামগ্রী অন্তর্ভুক্ত';
      modalPackageItems.appendChild(li);
    }

    // Update WhatsApp link
    const waMsg = `আসসালামু আলাইকুম, আমি "${prod.title}" (মূল্য: ৳${prod.price}) সম্পর্কে জানতে ও অর্ডার করতে চাই।`;
    modalWhatsappBtn.href = `https://wa.me/8801844687759?text=${encodeURIComponent(waMsg)}`;

    modal.removeAttribute('hidden');
    void modal.offsetWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
      modal.setAttribute('hidden', '');
      document.body.style.overflow = '';
      currentActiveModalProduct = null;
    }, 250);
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
  if (modalOrderBtn) {
    modalOrderBtn.addEventListener('click', () => {
      if (!currentActiveModalProduct) return;
      if (window.KabarApi) {
        window.KabarApi.addToCart(currentActiveModalProduct, 1);
        updateCartUi();
        closeProductModal();
        showToast(`"${currentActiveModalProduct.title}" কার্টে যোগ করা হয়েছে!`);
        openCartDrawer();
      }
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProductModal();
    });
  }

  /* ─── 3. Cart Drawer & Checkout Controller ─── */
  const headerCartBtn = document.getElementById('headerCartBtn');
  const headerCartCount = document.getElementById('headerCartCount');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartDrawerBody = document.getElementById('cartDrawerBody');
  const cartItemsCountText = document.getElementById('cartItemsCountText');
  const cartSubtotalText = document.getElementById('cartSubtotalText');
  const cartDeliveryFeeText = document.getElementById('cartDeliveryFeeText');
  const cartTotalText = document.getElementById('cartTotalText');
  const checkoutArea = document.getElementById('checkoutArea');
  const drawerCheckoutForm = document.getElementById('drawerCheckoutForm');
  const submitOrderBtn = document.getElementById('submitOrderBtn');

  function openCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawerOverlay.classList.add('active');
      cartDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateCartUi();
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawerOverlay.classList.remove('active');
      cartDrawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (headerCartBtn) headerCartBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  function getDeliveryFee() {
    if (!checkoutArea) return 80;
    const opt = checkoutArea.options[checkoutArea.selectedIndex];
    return Number(opt ? opt.getAttribute('data-fee') : 80) || 80;
  }

  function updateCartUi() {
    if (!window.KabarApi) return;
    const summary = window.KabarApi.getCartSummary();
    const count = summary.count;
    const subtotal = summary.subtotal;
    const deliveryFee = count > 0 ? getDeliveryFee() : 0;
    const total = subtotal + deliveryFee;

    // Badges & Counters
    if (headerCartCount) headerCartCount.textContent = count;
    if (cartItemsCountText) cartItemsCountText.textContent = toBengaliNum(count);
    if (cartSubtotalText) cartSubtotalText.textContent = toBengaliNum(subtotal);
    if (cartDeliveryFeeText) cartDeliveryFeeText.textContent = toBengaliNum(deliveryFee);
    if (cartTotalText) cartTotalText.textContent = toBengaliNum(total);

    // Populate Cart Items
    if (!cartDrawerBody) return;

    if (summary.items.length === 0) {
      cartDrawerBody.innerHTML = `
        <div class="cart-empty-state">
          <span class="cart-empty-icon">🛒</span>
          <h4>আপনার কার্ট বর্তমানে খালি</h4>
          <p style="font-size:0.88rem;margin-top:6px">প্রয়োজনীয় পণ্য কার্টে যোগ করে অর্ডার সম্পন্ন করুন।</p>
        </div>`;
      if (submitOrderBtn) submitOrderBtn.disabled = true;
      return;
    }

    if (submitOrderBtn) submitOrderBtn.disabled = false;

    cartDrawerBody.innerHTML = summary.items.map(it => `
      <div class="cart-item">
        <img src="${it.image || 'assets/images/product-kafan.jpg'}" alt="${escapeHtml(it.title)}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${escapeHtml(it.title)}</div>
          <div class="cart-item-price">৳${toBengaliNum(it.price)}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button type="button" class="cart-qty-btn cart-dec-btn" data-id="${it.id}">−</button>
          <span class="cart-qty-val">${toBengaliNum(it.qty)}</span>
          <button type="button" class="cart-qty-btn cart-inc-btn" data-id="${it.id}">+</button>
        </div>
        <button type="button" class="cart-item-del" data-id="${it.id}" title="মুছুন">✕</button>
      </div>
    `).join('');

    // Attach Cart Action Listeners
    cartDrawerBody.querySelectorAll('.cart-inc-btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const it = summary.items.find(i => i.id === id);
        if (it) {
          window.KabarApi.updateCartQty(id, it.qty + 1);
          updateCartUi();
        }
      });
    });

    cartDrawerBody.querySelectorAll('.cart-dec-btn').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        const it = summary.items.find(i => i.id === id);
        if (it) {
          window.KabarApi.updateCartQty(id, it.qty - 1);
          updateCartUi();
        }
      });
    });

    cartDrawerBody.querySelectorAll('.cart-item-del').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        window.KabarApi.removeFromCart(id);
        updateCartUi();
      });
    });
  }

  if (checkoutArea) {
    checkoutArea.addEventListener('change', updateCartUi);
  }

  // Pre-fill user info if logged in
  function prefillCheckoutUser() {
    if (!window.KabarApi) return;
    const user = window.KabarApi.getCurrentUser();
    if (user) {
      const nameInput = document.getElementById('checkoutName');
      const phoneInput = document.getElementById('checkoutPhone');
      if (nameInput && !nameInput.value) nameInput.value = user.name || '';
      if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
    }
  }

  // Order Submission
  if (drawerCheckoutForm) {
    drawerCheckoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const summary = window.KabarApi.getCartSummary();
      if (!summary.items || summary.items.length === 0) {
        alert('কার্টে কোনো পণ্য নেই!');
        return;
      }

      const name = document.getElementById('checkoutName').value.trim();
      const phone = document.getElementById('checkoutPhone').value.trim();
      const address = document.getElementById('checkoutAddress').value.trim();
      const area = checkoutArea.value;
      const deliveryFee = getDeliveryFee();
      const subtotal = summary.subtotal;
      const total = subtotal + deliveryFee;

      if (!name || !phone || !address) {
        alert('অনুগ্রহ করে নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।');
        return;
      }

      submitOrderBtn.disabled = true;
      submitOrderBtn.textContent = 'অর্ডার প্রসেস হচ্ছে...';

      const orderPayload = {
        name,
        phone,
        address,
        area,
        deliveryFee,
        subtotal,
        total,
        payment: 'ক্যাশ অন ডেলিভারি',
        items: summary.items.map(i => ({ id: i.id, title: i.title, price: i.price, qty: i.qty }))
      };

      try {
        const res = await window.KabarApi.placeOrder(orderPayload);
        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = 'অর্ডার নিশ্চিত করুন →';

        if (res && res.ok) {
          closeCartDrawer();
          openOrderConfirmModal(res.order || { ...orderPayload, ref: res.ref });
          updateCartUi();
          drawerCheckoutForm.reset();
        } else {
          alert('ত্রুটি: ' + (res.error || 'অর্ডার গ্রহণ করা সম্ভব হয়নি'));
        }
      } catch (err) {
        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = 'অর্ডার নিশ্চিত করুন →';
        alert('অর্ডার ত্রুটি: ' + err.message);
      }
    });
  }

  /* ─── 4. Order Confirmation Modal ─── */
  const orderConfirmModal = document.getElementById('orderConfirmModal');
  const successOrderRef = document.getElementById('successOrderRef');
  const successCustomerName = document.getElementById('successCustomerName');
  const successCustomerPhone = document.getElementById('successCustomerPhone');
  const successCustomerAddress = document.getElementById('successCustomerAddress');
  const successOrderTotal = document.getElementById('successOrderTotal');
  const successWhatsappBtn = document.getElementById('successWhatsappBtn');
  const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');

  function openOrderConfirmModal(order) {
    if (!orderConfirmModal) return;

    if (successOrderRef) successOrderRef.textContent = order.ref;
    if (successCustomerName) successCustomerName.textContent = order.name;
    if (successCustomerPhone) successCustomerPhone.textContent = order.phone;
    if (successCustomerAddress) successCustomerAddress.textContent = order.address;
    if (successOrderTotal) successOrderTotal.textContent = toBengaliNum(order.total);

    const waMsg = `আসসালামু আলাইকুম, আমি কবর পথের সামগ্রী ওয়েবসাইট থেকে একটি অর্ডার সম্পন্ন করেছি।\nঅর্ডার আইডি: #${order.ref}\nপ্রাপক: ${order.name}\nঠিকানা: ${order.address}\nসর্বমোট: ৳${order.total} (ক্যাশ অন ডেলিভারি)`;
    if (successWhatsappBtn) {
      successWhatsappBtn.href = `https://wa.me/8801844687759?text=${encodeURIComponent(waMsg)}`;
    }

    orderConfirmModal.classList.add('active');
  }

  if (closeSuccessModalBtn) {
    closeSuccessModalBtn.addEventListener('click', () => {
      orderConfirmModal.classList.remove('active');
    });
  }

  /* ─── 5. User Authentication Controller ─── */
  const userAuthNav = document.getElementById('userAuthNav');
  const authModal = document.getElementById('authModal');
  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const authTabs = document.querySelectorAll('.auth-tab-btn');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const userLoginForm = document.getElementById('userLoginForm');
  const userRegisterForm = document.getElementById('userRegisterForm');

  function openAuthModal(tab = 'loginTab') {
    if (authModal) {
      authModal.classList.add('active');
      switchAuthTab(tab);
    }
  }

  function closeAuthModal() {
    if (authModal) authModal.classList.remove('active');
  }

  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => openAuthModal('loginTab'));
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuthModal);
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  function switchAuthTab(tabId) {
    authTabs.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-auth-tab') === tabId);
    });
    if (loginTab) loginTab.style.display = (tabId === 'loginTab') ? 'block' : 'none';
    if (registerTab) registerTab.style.display = (tabId === 'registerTab') ? 'block' : 'none';
  }

  authTabs.forEach(b => {
    b.addEventListener('click', () => {
      switchAuthTab(b.getAttribute('data-auth-tab'));
    });
  });

  // Handle Login
  if (userLoginForm) {
    userLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('uLoginEmail').value.trim();
      const password = document.getElementById('uLoginPassword').value.trim();
      const btn = document.getElementById('userLoginSubmitBtn');

      btn.disabled = true;
      btn.textContent = 'লগইন হচ্ছে...';

      const res = await window.KabarApi.loginUser({ email, password });
      btn.disabled = false;
      btn.textContent = 'লগইন করুন';

      if (res && res.ok && res.user) {
        closeAuthModal();
        renderUserNav();
        prefillCheckoutUser();
        showToast(`স্বাগতম, ${res.user.name}!`);
      } else {
        alert(res.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড!');
      }
    });
  }

  // Handle Register
  if (userRegisterForm) {
    userRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('uRegName').value.trim();
      const email = document.getElementById('uRegEmail').value.trim();
      const phone = document.getElementById('uRegPhone').value.trim();
      const password = document.getElementById('uRegPassword').value.trim();
      const btn = document.getElementById('userRegSubmitBtn');

      if (!name || !email || !phone || !password) {
        alert('সকল তথ্য সঠিকভাবে পূরণ করুন।');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'অ্যাকাউন্ট তৈরি হচ্ছে...';

      const res = await window.KabarApi.registerUser({ name, email, phone, password });
      btn.disabled = false;
      btn.textContent = 'অ্যাকাউন্ট তৈরি করুন';

      if (res && res.ok && res.user) {
        closeAuthModal();
        renderUserNav();
        prefillCheckoutUser();
        showToast('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      } else {
        alert(res.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
      }
    });
  }

  // Render User Profile Nav Button & Dropdown
  function renderUserNav() {
    if (!userAuthNav || !window.KabarApi) return;
    const user = window.KabarApi.getCurrentUser();

    if (user) {
      const initial = (user.name || 'ক').charAt(0).toUpperCase();
      userAuthNav.innerHTML = `
        <button type="button" class="user-profile-btn" id="userDropdownTrigger">
          <span class="user-avatar-circle">${escapeHtml(initial)}</span>
          <span>${escapeHtml(user.name.split(' ')[0])}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>

        <div class="user-dropdown-menu" id="userMenuDropdown">
          <div class="user-dropdown-header">
            <b>${escapeHtml(user.name)}</b>
            <small>${escapeHtml(user.email)}</small>
          </div>
          <button type="button" class="user-dropdown-item" id="userMyOrdersBtn">
            📦 আমার অর্ডারসমূহ
          </button>
          <a href="admin.html" class="user-dropdown-item" target="_blank">
            ⚙️ এডমিন ড্যাশবোর্ড
          </a>
          <button type="button" class="user-dropdown-item danger" id="userLogoutBtn">
            🚪 লগআউট
          </button>
        </div>
      `;

      const trigger = document.getElementById('userDropdownTrigger');
      const dropdown = document.getElementById('userMenuDropdown');

      if (trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('active');
        });
        document.addEventListener('click', () => dropdown.classList.remove('active'));
      }

      const myOrdersBtn = document.getElementById('userMyOrdersBtn');
      if (myOrdersBtn) {
        myOrdersBtn.addEventListener('click', () => {
          openTrackModal(user.phone || '');
        });
      }

      const logoutBtn = document.getElementById('userLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          window.KabarApi.logoutUser();
          renderUserNav();
          showToast('আপনি লগআউট করেছেন');
        });
      }
    } else {
      userAuthNav.innerHTML = `
        <button type="button" class="user-profile-btn" id="openAuthModalBtn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>লগইন</span>
        </button>
      `;
      const btn = document.getElementById('openAuthModalBtn');
      if (btn) btn.addEventListener('click', () => openAuthModal('loginTab'));
    }
  }

  /* ─── 6. Order Tracking Controller ─── */
  const trackOrderModal = document.getElementById('trackOrderModal');
  const closeTrackModalBtn = document.getElementById('closeTrackModalBtn');
  const navTrackOrderBtn = document.getElementById('navTrackOrderBtn');
  const trackSearchInput = document.getElementById('trackSearchInput');
  const trackSearchBtn = document.getElementById('trackSearchBtn');
  const trackResultsContainer = document.getElementById('trackResultsContainer');

  function openTrackModal(prefill = '') {
    if (trackOrderModal) {
      trackOrderModal.classList.add('active');
      if (trackSearchInput && prefill) {
        trackSearchInput.value = prefill;
        performOrderTrack(prefill);
      }
    }
  }

  function closeTrackModal() {
    if (trackOrderModal) trackOrderModal.classList.remove('active');
  }

  if (navTrackOrderBtn) {
    navTrackOrderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const user = window.KabarApi ? window.KabarApi.getCurrentUser() : null;
      openTrackModal(user ? (user.phone || '') : '');
    });
  }

  if (closeTrackModalBtn) closeTrackModalBtn.addEventListener('click', closeTrackModal);
  if (trackOrderModal) {
    trackOrderModal.addEventListener('click', (e) => {
      if (e.target === trackOrderModal) closeTrackModal();
    });
  }

  async function performOrderTrack(query) {
    if (!trackResultsContainer) return;
    const clean = query.trim();
    if (!clean) {
      trackResultsContainer.innerHTML = `<p style="text-align:center;color:var(--text-muted)">অনুগ্রহ করে ফোন নম্বর বা অর্ডার আইডি লিখুন।</p>`;
      return;
    }

    trackResultsContainer.innerHTML = `<p style="text-align:center;color:var(--text-muted)">অনুসন্ধান করা হচ্ছে...</p>`;

    const orders = await window.KabarApi.trackOrders(clean);
    if (!orders || orders.length === 0) {
      trackResultsContainer.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text-muted)">"${clean}" এর জন্য কোনো অর্ডার পাওয়া যায়নি।</p>`;
      return;
    }

    trackResultsContainer.innerHTML = orders.map(o => {
      const status = o.status || o.order_status || 'Pending';
      let statusColor = '#b45309';
      let statusBg = '#fef3c7';
      let statusBangla = 'অপেক্ষমাণ (Pending)';

      if (status === 'Confirmed') {
        statusColor = '#1d4ed8'; statusBg = '#dbeafe'; statusBangla = 'নিশ্চিত (Confirmed)';
      } else if (status === 'Delivered') {
        statusColor = '#15803d'; statusBg = '#dcfce7'; statusBangla = 'ডেলিভারড (Delivered)';
      } else if (status === 'Cancelled') {
        statusColor = '#b91c1c'; statusBg = '#fee2e2'; statusBangla = 'বাতিল (Cancelled)';
      }

      return `
        <div class="tracking-result-card" style="background:var(--lavender-50);border:1px solid var(--lavender-border);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong style="font-family:monospace;color:var(--primary);font-size:1rem">#${escapeHtml(o.ref)}</strong>
            <span style="background:${statusBg};color:${statusColor};padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700">
              ${statusBangla}
            </span>
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:6px">
            প্রাপক: <b>${escapeHtml(o.customerName || o.name || 'গ্রাহক')}</b> · ঠিকানা: ${escapeHtml(o.address || o.area || '')}
          </div>
          <div style="font-size:0.95rem;font-weight:800;color:var(--text-heading)">
            সর্বমোট: ৳${toBengaliNum(o.total || o.total_amount || 0)}
          </div>
        </div>
      `;
    }).join('');
  }

  if (trackSearchBtn) {
    trackSearchBtn.addEventListener('click', () => {
      performOrderTrack(trackSearchInput.value);
    });
  }

  if (trackSearchInput) {
    trackSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performOrderTrack(trackSearchInput.value);
    });
  }

  /* ─── 7. Mobile Navigation Toggle ─── */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        navMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      } else {
        navMenu.classList.add('open');
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─── 8. Scroll To Top ─── */
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    if (scrollTopBtn) {
      if (window.scrollY > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── 9. ScrollSpy ─── */
  const sections = document.querySelectorAll('section[id], footer[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').replace('#', '');
      if (href === current) {
        link.classList.add('active');
      }
    });
  });

  /* ─── 10. Smooth Scroll ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '' || targetId.startsWith('#!')) return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ─── Initial Startup ─── */
  renderUserNav();
  prefillCheckoutUser();
  updateCartUi();
  loadAndRenderProducts();
});
