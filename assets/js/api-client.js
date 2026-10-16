/**
 * ============================================================================
 * কবর পথের সামগ্রী — Client API & Local Fallback Layer
 * ============================================================================
 * Connects browser frontend to Edge Functions (/api)
 * with transparent localStorage caching and offline fallback.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    AUTH_USER: 'kp.auth.user.v1',
    ADMIN_AUTH: 'kp.admin.auth.v1',
    LOCAL_PRODUCTS: 'kp.products.v1',
    LOCAL_ORDERS: 'kp.orders.v1',
    LOCAL_USERS: 'kp.users.v1',
    CART: 'kp.cart.v1'
  };

  // Default seed products for offline/fallback use
  const DEFAULT_PRODUCTS = [
    {
      id: 'kp-prod-001',
      title: 'কাফনের কাপড় সেট (পুরুষ / মহিলা)',
      category: 'kafan',
      price: 1650,
      oldPrice: 1850,
      unit: 'সেট',
      badge: 'প্রিমিয়াম কোয়ালিটি',
      stock: 25,
      short_desc: 'উন্নত মানের ১০০% সুতি সাদা কাফনের কাপড় ও গোসলের কমপ্লিট সেট।',
      description: 'শরীয়তসম্মত উপায়ে প্রস্তুতকৃত উন্নত মানের ১০০% সুতি সাদা কাফনের কাপড়ের সেট। পুরুষ, মহিলা ও শিশু—সকলের জন্য পৃথক পরিমাপ অনুযায়ী প্রস্তুত রাখা হয়। পর্যাপ্ত কাফুর, সুতি ফিতা এবং জীবাণুমুক্ত তুলা সংযুক্ত রয়েছে।',
      items: [
        'পুরুষের জন্য ৩ খণ্ড অথবা মহিলার জন্য ৫ খণ্ড উন্নত সাদা কাফনের থান',
        'কাফন বাঁধার জন্য ৩টি সুতি ফিতা',
        'গোসলের জন্য সুগন্ধি সাবান ও জীবাণুনাশক সামগ্রী',
        'উন্নত মানের প্রাকৃতিক কাফুর (কর্পূর) ও চন্দন গুঁড়া',
        'খাঁটি অ্যালকোহলমুক্ত আতর ও সুরমা',
        'পর্যাপ্ত পরিমাণ পরিষ্কার জীবাণুমুক্ত তুলা'
      ],
      image: 'assets/images/product-kafan.jpg',
      images: ['assets/images/product-kafan.jpg'],
      status: 'Active'
    },
    {
      id: 'kp-prod-002',
      title: 'দাফনের প্রয়োজনীয় সামগ্রী সেট',
      category: 'dafon',
      price: 2200,
      oldPrice: 2500,
      unit: 'সেট',
      badge: 'পূর্ণাঙ্গ সেট',
      stock: 18,
      short_desc: 'কবর খনন পরবর্তী প্রস্তুতি ও সম্পূর্ণ দাফন প্রক্রিয়ার জন্য অপরিহার্য সকল সামগ্রীর কমপ্লিট সেট।',
      description: 'কবর খনন ও দাফনের জন্য যা যা প্রয়োজন তা এক সাথে গোছানো। এতে রয়েছে উন্নত মানের শক্ত বাঁশের কাঠি, চাটাই, নামানোর মজবুত রশি, বিশেষ সুতি গ্লাভস ও সুরক্ষা পলিথিন।',
      items: [
        'উন্নত মানের বাঁশের কাঠি ও শক্ত বাঁশের চাটাই',
        'মজবুত সুতা ও মরদেহ নামানোর সুতি রশি',
        'দাফনকারীদের জন্য বিশেষ সাদা সুতি গ্লাভস',
        'মাটি সমান করা ও কবর খনন সহায়ক সামগ্রী',
        'কবরের ওপর বিছানোর পলিথিন ও সুরক্ষা স্তর'
      ],
      image: 'assets/images/product-dafon.jpg',
      images: ['assets/images/product-dafon.jpg'],
      status: 'Active'
    },
    {
      id: 'kp-prod-003',
      title: 'জানাজার সামগ্রী কিট',
      category: 'janaza',
      price: 1400,
      oldPrice: 1600,
      unit: 'কিট',
      badge: 'প্রস্তুতি সামগ্রী',
      stock: 20,
      short_desc: 'জানাজার নামাজ সুষ্ঠু ও সুশৃঙ্খলভাবে সম্পন্ন করার জন্য প্রয়োজনীয় সহায়ক সামগ্রী।',
      description: 'জানাজার নামাজের জন্য প্রয়োজনীয় সামগ্রীর কমপ্লিট সেট। ইমাম সাহেবের জন্য আরামদায়ক জায়নামাজ, মুসল্লিদের জন্য উন্নত টুপি, খাঁটি আতর এবং তসবিহ অন্তর্ভুক্ত।',
      items: [
        'ইমাম সাহেবের জন্য বিশেষ আরামদায়ক জায়নামাজ',
        'উপস্থিত মুসল্লিদের জন্য উন্নত মানের নামাজের টুপি (১০টি)',
        'পবিত্র কাঠের সুগন্ধি তাসবীহ',
        'জানাজায় আগতদের ব্যবহারের জন্য সুরভিত খাঁটি আতর',
        'ইমামতি চাদর বা পবিত্র শাল'
      ],
      image: 'assets/images/product-janaza.jpg',
      images: ['assets/images/product-janaza.jpg'],
      status: 'Active'
    },
    {
      id: 'kp-prod-004',
      title: 'পবিত্র সুগন্ধি আতর, গোলাপ জল ও কাফুর প্যাক',
      category: 'attar',
      price: 750,
      oldPrice: 900,
      unit: 'প্যাক',
      badge: 'সহায়ক পণ্য',
      stock: 35,
      short_desc: 'দাফন ও শেষ বিদায়ের জন্য খাঁটি প্রাকৃতিক সুগন্ধি, গোলাপ জল, সাবান ও কাফুরের পবিত্র প্যাক।',
      description: 'সম্পূর্ণ অ্যালকোহলমুক্ত পবিত্র আতর, বিশুদ্ধ গোলাপ জলের স্প্রে বোতল, প্রাকৃতিক কাফুর (কর্পূর), লোবান ও মেডিকেল গ্রেড জীবাণুমুক্ত তুলা।',
      items: [
        'খাঁটি ও প্রাকৃতিক সুগন্ধি আতর (নন-অ্যালকোহলিক)',
        'বিশুদ্ধ গোলাপ জল ও সুগন্ধি স্প্রে',
        'বিশুদ্ধ প্রাকৃতিক কাফুর ও লোবান',
        'মেডিকেল গ্রেড জীবাণুমুক্ত তুলার বান্ডিল',
        'গোসলের জন্য খাঁটি সাবান ও সুরমা'
      ],
      image: 'assets/images/product-attar.jpg',
      images: ['assets/images/product-attar.jpg'],
      status: 'Active'
    },
    {
      id: 'kp-prod-005',
      title: 'পূর্ণাঙ্গ দাফন ও জানাজা সুপার প্যাকেজ (অল-ইন-ওয়ান)',
      category: 'package',
      price: 4800,
      oldPrice: 5500,
      unit: 'প্যাকেজ',
      badge: 'অল-ইন-ওয়ান',
      stock: 15,
      short_desc: 'কাফনের কাপড়, দাফন সামগ্রী, জানাজা কিট ও সুগন্ধিসহ একবারে সম্পূর্ণ আয়োজন।',
      description: 'জরুরি সময়ে আলাদা আলাদা সামগ্রী খোঁজার ঝামেলা ছাড়া এক বক্সেই সকল প্রয়োজনীয় উপাদান। কাফন, বাঁশের চাটাই ও কাঠি, রশি, আতর, কাফুর, টুপি ও জায়নামাজসহ সম্পূর্ণ প্যাকেজ।',
      items: [
        '১০০% সুতি প্রিমিয়াম কাফনের কাপড় সেট',
        'সম্পূর্ণ বাঁশের চাটাই ও মজবুত কাঠি',
        'মরদেহ নামানোর সুতি রশি ও গ্লাভস',
        'ইমামের জায়নামাজ ও ১০টি নামাজের টুপি',
        'খাঁটি আতর, কাফুর, গোলাপ জল ও জীবাণুমুক্ত তুলা',
        '২৪/৭ দ্রুত ডেলিভারি সুবিধা'
      ],
      image: 'assets/images/hero-showcase.jpg',
      images: ['assets/images/hero-showcase.jpg'],
      status: 'Active'
    }
  ];

  class KabarApi {
    static baseUrl = '/api';

    static getApiUrl() {
      if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
        return this.baseUrl;
      }
      return null;
    }

    static async request(path, options = {}) {
      const url = this.getApiUrl();
      if (!url) return { ok: false, error: 'Offline local mode', offline: true };

      const fullUrl = path.startsWith('/') ? path : `${url}/${path}`;
      try {
        const response = await fetch(fullUrl, {
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
          ...options
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return { ok: false, status: response.status, error: data.error || response.statusText };
        }
        return data;
      } catch (err) {
        return { ok: false, error: err.message, networkError: true };
      }
    }

    /* ─── Health / Ping ─── */
    static async ping() {
      const start = Date.now();
      const res = await this.request('/ping');
      const latency = Date.now() - start;
      return { ...res, latency };
    }

    /* ─── Products ─── */
    static async getProducts() {
      const res = await this.request('/products');
      if (res && res.ok && Array.isArray(res.products) && res.products.length > 0) {
        try {
          localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(res.products));
        } catch (_) {}
        return res.products;
      }

      // Fallback to local storage or defaults
      try {
        const local = localStorage.getItem(STORAGE_KEYS.LOCAL_PRODUCTS);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length) return parsed;
        }
      } catch (_) {}

      try {
        localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      } catch (_) {}
      return DEFAULT_PRODUCTS;
    }

    static async addProduct(product) {
      const res = await this.request('/products', {
        method: 'POST',
        body: JSON.stringify(product)
      });

      // Always update local cache as well
      try {
        let list = await this.getProducts();
        const savedProd = (res && res.ok && res.product) ? res.product : {
          ...product,
          id: product.id || ('kp-prod-' + Date.now().toString(36))
        };
        const idx = list.findIndex(p => p.id === savedProd.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...savedProd };
        } else {
          list.unshift(savedProd);
        }
        localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(list));
      } catch (_) {}

      return res && res.ok ? res : { ok: true, product };
    }

    static async deleteProduct(id) {
      const res = await this.request(`/products/${id}`, { method: 'DELETE' });

      try {
        let list = await this.getProducts();
        list = list.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(list));
      } catch (_) {}

      return res && res.ok ? res : { ok: true, id };
    }

    /* ─── Orders ─── */
    static async placeOrder(orderData) {
      const res = await this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      const ref = (res && res.ok && res.ref) ? res.ref : ('KP-' + Math.floor(10000 + Math.random() * 90000));
      const finalizedOrder = {
        ref,
        placedAt: new Date().toISOString(),
        ...orderData,
        status: 'Pending'
      };

      // Save locally
      try {
        let orders = [];
        const local = localStorage.getItem(STORAGE_KEYS.LOCAL_ORDERS);
        if (local) orders = JSON.parse(local);
        orders.unshift(finalizedOrder);
        localStorage.setItem(STORAGE_KEYS.LOCAL_ORDERS, JSON.stringify(orders));
      } catch (_) {}

      // Clear cart
      this.clearCart();

      return res && res.ok ? res : { ok: true, ref, order: finalizedOrder };
    }

    static async getOrders() {
      const res = await this.request('/orders');
      if (res && res.ok && Array.isArray(res.orders)) {
        try {
          localStorage.setItem(STORAGE_KEYS.LOCAL_ORDERS, JSON.stringify(res.orders));
        } catch (_) {}
        return res.orders;
      }

      try {
        const local = localStorage.getItem(STORAGE_KEYS.LOCAL_ORDERS);
        if (local) return JSON.parse(local);
      } catch (_) {}
      return [];
    }

    static async updateOrderStatus(ref, status) {
      const res = await this.request('/orders/status', {
        method: 'POST',
        body: JSON.stringify({ ref, status })
      });

      try {
        let orders = await this.getOrders();
        const found = orders.find(o => (o.ref || '').toUpperCase() === ref.toUpperCase());
        if (found) {
          found.status = status;
          localStorage.setItem(STORAGE_KEYS.LOCAL_ORDERS, JSON.stringify(orders));
        }
      } catch (_) {}

      return res && res.ok ? res : { ok: true, ref, status };
    }

    static async trackOrders(phoneOrRef) {
      const clean = (phoneOrRef || '').trim();
      const res = await this.request(`/orders/track?phone=${encodeURIComponent(clean)}&ref=${encodeURIComponent(clean)}`);
      if (res && res.ok && Array.isArray(res.orders)) {
        return res.orders;
      }

      // Filter locally
      const all = await this.getOrders();
      const phoneDigits = clean.replace(/[\s-]/g, '').slice(-11);
      return all.filter(o => 
        (o.ref && o.ref.toUpperCase() === clean.toUpperCase()) ||
        (phoneDigits && o.customer_phone && o.customer_phone.replace(/[\s-]/g, '').includes(phoneDigits)) ||
        (phoneDigits && o.phone && o.phone.replace(/[\s-]/g, '').includes(phoneDigits)) ||
        (clean.includes('@') && o.customer_email && o.customer_email.toLowerCase() === clean.toLowerCase()) ||
        (clean.includes('@') && o.email && o.email.toLowerCase() === clean.toLowerCase())
      );
    }

    /* ─── Photo Upload ─── */
    static async uploadPhoto(fileOrDataUrl, filename = 'photo.jpg') {
      try {
        let res;
        if (typeof fileOrDataUrl === 'string') {
          res = await this.request('/upload', {
            method: 'POST',
            body: JSON.stringify({ image: fileOrDataUrl, filename })
          });
        } else {
          const formData = new FormData();
          formData.append('file', fileOrDataUrl, filename);
          const response = await fetch('/api/upload', { method: 'POST', body: formData });
          res = await response.json();
        }
        if (res && res.ok && res.url) return res;
      } catch (err) {
        console.warn('R2 upload failed, fallback to data URL:', err);
      }
      return { ok: true, url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '', fallback: true };
    }

    /* ─── User Authentication ─── */
    static getCurrentUser() {
      try {
        const u = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
        return u ? JSON.parse(u) : null;
      } catch (_) {
        return null;
      }
    }

    static async registerUser({ name, email, phone, password }) {
      const res = await this.request('/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password })
      });

      if (res && res.ok && res.user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(res.user));
        try {
          let users = [];
          const local = localStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
          if (local) users = JSON.parse(local);
          const idx = users.findIndex(u => (u.email || '').toLowerCase() === email.toLowerCase());
          const userWithCreds = { ...res.user, password };
          if (idx !== -1) users[idx] = userWithCreds;
          else users.unshift(userWithCreds);
          localStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
        } catch (_) {}
        return res;
      }

      // Local fallback for offline mode
      if (!res || !res.ok) {
        const user = {
          id: 'USR-' + Math.random().toString(36).slice(2, 9).toUpperCase(),
          name,
          email,
          phone,
          status: 'Active',
          role: 'Customer',
          registeredAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
        try {
          let users = [];
          const local = localStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
          if (local) users = JSON.parse(local);
          const idx = users.findIndex(u => (u.email || '').toLowerCase() === email.toLowerCase());
          const userWithCreds = { ...user, password };
          if (idx !== -1) users[idx] = userWithCreds;
          else users.unshift(userWithCreds);
          localStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
        } catch (_) {}
        return { ok: true, user };
      }
      return res;
    }

    static async loginUser({ email, password }) {
      const res = await this.request('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res && res.ok && res.user) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(res.user));
        return res;
      }

      // Local admin check
      if (email.toLowerCase() === 'admin@kabarpather.com' && password === 'admin123') {
        const adminUser = {
          id: 'USR-ADMIN-01',
          name: 'কবর পথের সামগ্রী এডমিন',
          email: 'admin@kabarpather.com',
          phone: '+8801844687759',
          status: 'Active',
          role: 'Admin'
        };
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(adminUser));
        return { ok: true, user: adminUser };
      }

      // Local fallback for registered customers
      try {
        const local = localStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
        if (local) {
          const users = JSON.parse(local);
          const found = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase() && u.password === password);
          if (found) {
            if (found.status && (found.status.toLowerCase() === 'inactive' || found.status.toLowerCase() === 'suspended')) {
              return { ok: false, error: 'আপনার অ্যাকাউন্টটি স্থগিত রয়েছে।' };
            }
            const safeUser = { ...found };
            delete safeUser.password;
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(safeUser));
            return { ok: true, user: safeUser };
          }
        }
      } catch (_) {}

      return res || { ok: false, error: 'ভুল ইমেইল অথবা পাসওয়ার্ড।' };
    }

    static logoutUser() {
      try {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      } catch (_) {}
    }

    static async getUsers() {
      const res = await this.request('/users');
      if (res && res.ok && Array.isArray(res.users)) {
        try {
          localStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(res.users));
        } catch (_) {}
        return res.users;
      }

      try {
        const local = localStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            return parsed.map(u => {
              const safe = { ...u };
              delete safe.password;
              return safe;
            });
          }
        }
      } catch (_) {}
      return [];
    }

    static async updateUserStatus(idOrEmail, status) {
      const res = await this.request('/users/status', {
        method: 'POST',
        body: JSON.stringify({ id: idOrEmail, email: idOrEmail, status })
      });

      try {
        let users = [];
        const local = localStorage.getItem(STORAGE_KEYS.LOCAL_USERS);
        if (local) users = JSON.parse(local);
        const found = users.find(u => u.id === idOrEmail || (u.email || '').toLowerCase() === String(idOrEmail).toLowerCase());
        if (found) {
          found.status = status;
          localStorage.setItem(STORAGE_KEYS.LOCAL_USERS, JSON.stringify(users));
        }
      } catch (_) {}

      return res && res.ok ? res : { ok: true, status };
    }

    /* ─── Cart Management ─── */
    static getCart() {
      try {
        const cart = localStorage.getItem(STORAGE_KEYS.CART);
        return cart ? JSON.parse(cart) : [];
      } catch (_) {
        return [];
      }
    }

    static saveCart(items) {
      try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('kp:cart-updated', { detail: items }));
      } catch (_) {}
    }

    static addToCart(product, qty = 1) {
      let cart = this.getCart();
      const existing = cart.find(i => i.id === product.id);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          unit: product.unit || 'সেট',
          image: product.image || (product.images && product.images[0]) || 'assets/images/product-kafan.jpg',
          qty: qty
        });
      }
      this.saveCart(cart);
      return cart;
    }

    static updateCartQty(productId, qty) {
      let cart = this.getCart();
      if (qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
      } else {
        const item = cart.find(i => i.id === productId);
        if (item) item.qty = qty;
      }
      this.saveCart(cart);
      return cart;
    }

    static removeFromCart(productId) {
      let cart = this.getCart().filter(i => i.id !== productId);
      this.saveCart(cart);
      return cart;
    }

    static clearCart() {
      this.saveCart([]);
    }

    static getCartSummary() {
      const cart = this.getCart();
      const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0);
      return { count, subtotal, items: cart };
    }
  }

  window.KabarApi = KabarApi;
  window.STORAGE_KEYS = STORAGE_KEYS;
})(window);
