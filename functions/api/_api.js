/**
 * ============================================================================
 * কবর পথের সামগ্রী — Edge Pages Functions API
 * ============================================================================
 * Fullstack API handler connecting:
 *   - Database: Edge D1 (Tables: users, products, orders)
 *   - Photo Storage: Edge R2 (Bucket: PHOTOS_BUCKET)
 *   - Edge REST & Action-compatible Dispatcher
 * ============================================================================
 */

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      ...extraHeaders
    }
  });
}

export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function handleApiRequest(request, env, ctx) {
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();

  // 1. Health check & status
  if (pathname === '/api' || pathname === '/api/ping' || pathname === '/api/health') {
    if (method === 'GET') {
      return jsonResponse({
        ok: true,
        message: 'কবর পথের সামগ্রী Edge API is live and operational.',
        databaseConnected: !!env.DB,
        r2StorageConnected: !!env.PHOTOS_BUCKET,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 2. Photo Storage in R2: Serve photo
  if (pathname.startsWith('/api/images/')) {
    const key = pathname.replace('/api/images/', '');
    return handleServePhoto(key, env);
  }

  // Parse Body for POST / PUT / PATCH
  let body = {};
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json') || contentType.includes('text/plain')) {
        const text = await request.text();
        if (text && text.trim().length > 0) {
          body = JSON.parse(text);
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const form = await request.formData();
        for (const [k, v] of form.entries()) body[k] = v;
      }
    } catch (err) {
      return jsonResponse({ ok: false, error: 'Invalid JSON payload: ' + err.message }, 400);
    }
  }

  // 3. Photo Upload to R2
  if (pathname === '/api/upload' && method === 'POST') {
    return handleUploadPhoto(request, env, body);
  }

  // Action-based RPC compatibility dispatcher (for POST /api or POST /api/dispatch)
  if ((pathname === '/api' || pathname === '/api/dispatch') && method === 'POST') {
    const action = body.action || url.searchParams.get('action');
    if (action) {
      return dispatchAction(action, body, env, url);
    }
  }

  // Action-based GET compatibility: /api?action=...
  if ((pathname === '/api' || pathname === '/api/dispatch') && method === 'GET') {
    const action = url.searchParams.get('action') || 'ping';
    return dispatchAction(action, {}, env, url);
  }

  // REST Routes:
  // --- Products ---
  if (pathname === '/api/products') {
    if (method === 'GET') return getProducts(env);
    if (method === 'POST') return addOrUpdateProduct(body, env);
  }

  if (pathname.startsWith('/api/products/')) {
    const id = pathname.replace('/api/products/', '');
    if (id === 'seed' && method === 'POST') return seedProducts(body.products || [], env);
    if (method === 'PUT' || method === 'POST') return addOrUpdateProduct({ ...body, id }, env);
    if (method === 'DELETE') return deleteProduct(id, env);
  }

  // --- Orders ---
  if (pathname === '/api/orders') {
    if (method === 'GET') return getOrders(env);
    if (method === 'POST') return placeOrder(body, env);
  }

  if (pathname === '/api/orders/status' && (method === 'POST' || method === 'PUT')) {
    return updateOrderStatus(body.ref, body.status, env);
  }

  if (pathname === '/api/orders/track' && method === 'GET') {
    const phone = url.searchParams.get('phone');
    const ref = url.searchParams.get('ref');
    return trackOrders(phone, ref, env);
  }

  if (pathname.startsWith('/api/orders/')) {
    const ref = pathname.replace('/api/orders/', '');
    if (method === 'PATCH' || method === 'PUT') return updateOrderStatus(ref, body.status, env);
  }

  // --- Users & Access ---
  if (pathname === '/api/users') {
    if (method === 'GET') return getUsers(env);
  }

  if (pathname === '/api/users/register' && method === 'POST') {
    return registerUser(body, env);
  }

  if (pathname === '/api/users/login' && method === 'POST') {
    return loginUser(body, env);
  }

  if (pathname === '/api/users/status' && method === 'POST') {
    return updateUserStatus(body.email || body.id, body.status, body.userId || body.id, env);
  }

  return jsonResponse({ ok: false, error: 'Endpoint not found: ' + pathname }, 404);
}

/**
 * Dispatcher for action-based calls
 */
async function dispatchAction(action, data, env, url) {
  switch (action) {
    case 'ping':
      return jsonResponse({
        ok: true,
        message: 'কবর পথের সামগ্রী Edge D1 & R2 API is active and ready.',
        databaseConnected: !!env.DB,
        r2Connected: !!env.PHOTOS_BUCKET
      });

    case 'get_products':
      return getProducts(env);

    case 'add_product':
    case 'update_product':
      return addOrUpdateProduct(data, env);

    case 'delete_product':
      return deleteProduct(data.id, env);

    case 'seed_products':
      return seedProducts(data.products || [], env);

    case 'place_order':
      return placeOrder(data, env);

    case 'get_orders':
      return getOrders(env);

    case 'update_order_status':
      return updateOrderStatus(data.ref, data.status, env);

    case 'track_orders':
      return trackOrders(data.phone, data.ref, env);

    case 'register_user':
      return registerUser(data, env);

    case 'login_user':
      return loginUser(data, env);

    case 'get_users':
      return getUsers(env);

    case 'update_user_status':
      return updateUserStatus(data.email || data.id, data.status, data.userId || data.id, env);

    case 'upload_photo':
      return handleUploadPhotoDirect(data, env);

    default:
      return jsonResponse({ ok: false, error: 'Unknown action: ' + action }, 400);
  }
}

/* ============================================================================
   1. Edge R2 Photo Storage Handlers
   ============================================================================ */

async function handleServePhoto(key, env) {
  if (!env.PHOTOS_BUCKET) {
    return new Response('Edge R2 Bucket (PHOTOS_BUCKET) not configured.', { status: 500 });
  }

  try {
    const object = await env.PHOTOS_BUCKET.get(key);
    if (!object) {
      return new Response('Photo not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err) {
    return new Response('Error retrieving photo: ' + err.message, { status: 500 });
  }
}

async function handleUploadPhoto(request, env, body = {}) {
  if (body && (body.image || body.photo || body.dataUrl || body.data)) {
    return handleUploadPhotoDirect(body, env);
  }

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json') || contentType.includes('text/plain')) {
    try {
      const parsed = await request.json();
      return handleUploadPhotoDirect(parsed, env);
    } catch (_) {
      return handleUploadPhotoDirect(body, env);
    }
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('photo') || formData.get('image');
    if (!file) {
      return jsonResponse({ ok: false, error: 'No image file found in form data' }, 400);
    }

    const buffer = await file.arrayBuffer();
    const mimeType = file.type || 'image/webp';
    return saveBufferToR2(buffer, mimeType, file.name, env);
  }

  return jsonResponse({ ok: false, error: 'Unsupported upload format. Use JSON dataUrl or multipart/form-data.' }, 400);
}

async function handleUploadPhotoDirect(data, env) {
  const rawImage = data.image || data.dataUrl || data.photo || '';
  if (!rawImage) {
    return jsonResponse({ ok: false, error: 'No image data provided.' }, 400);
  }

  let mimeType = 'image/webp';
  let base64Data = rawImage;

  if (rawImage.startsWith('data:')) {
    const matches = rawImage.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      const commaIdx = rawImage.indexOf(',');
      if (commaIdx !== -1) {
        base64Data = rawImage.slice(commaIdx + 1);
      }
    }
  }

  try {
    let bytes;
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(base64Data, 'base64');
      bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    } else {
      let cleaned = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
      while (cleaned.length % 4 !== 0) cleaned += '=';
      const binaryStr = atob(cleaned);
      const len = binaryStr.length;
      bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
    }

    return saveBufferToR2(bytes.buffer, mimeType, data.filename, env);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Failed to decode base64 image: ' + err.message }, 400);
  }
}

async function saveBufferToR2(arrayBuffer, mimeType, originalName, env) {
  if (!env.PHOTOS_BUCKET) {
    return jsonResponse({
      ok: true,
      fallback: true,
      note: 'R2 bucket PHOTOS_BUCKET is not bound in wrangler.toml yet.',
      url: ''
    });
  }

  // Enforce optimized .webp extension and mime type
  const cleanId = Math.random().toString(36).slice(2, 8);
  const key = `products/kp_${Date.now()}_${cleanId}.webp`;

  try {
    await env.PHOTOS_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable'
      }
    });

    const publicUrl = `/api/images/${key}`;

    return jsonResponse({
      ok: true,
      key,
      url: publicUrl,
      size: arrayBuffer.byteLength,
      mimeType: 'image/webp'
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: 'R2 upload failed: ' + err.message }, 500);
  }
}

/* ============================================================================
   2. Edge D1 Products Handlers
   ============================================================================ */

function assertDb(env) {
  if (!env.DB) {
    throw new Error('Edge D1 binding (env.DB) is missing. Please configure [[d1_databases]] in wrangler.toml.');
  }
}

async function getProducts(env) {
  try {
    assertDb(env);
    const { results } = await env.DB.prepare('SELECT * FROM products ORDER BY rowid ASC').all();

    const formatted = (results || []).map(row => {
      let images = [];
      try {
        images = typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []);
      } catch (_) { images = []; }

      let items = [];
      try {
        items = typeof row.items_included === 'string' ? JSON.parse(row.items_included) : (row.items_included || []);
      } catch (_) { items = []; }

      let tags = [];
      try {
        tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []);
      } catch (_) { tags = []; }

      return {
        id: row.id,
        created_at: row.created_at,
        title: row.title,
        category: row.category || 'other',
        price: Number(row.price) || 0,
        old_price: Number(row.old_price) || 0,
        oldPrice: Number(row.old_price) || 0,
        unit: row.unit || 'সেট',
        badge: row.badge || '',
        stock: Number(row.stock) || 0,
        short_desc: row.short_desc || '',
        desc: row.description || '',
        description: row.description || '',
        items: items,
        items_included: items,
        status: row.status || 'Active',
        images,
        image: images[0] || 'assets/images/product-kafan.jpg',
        rating: Number(row.rating) || 5.0,
        reviews: Number(row.reviews) || 0,
        views: Number(row.views) || 0,
        tags
      };
    });

    return jsonResponse({ ok: true, products: formatted });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function addOrUpdateProduct(product, env) {
  try {
    assertDb(env);
    if (!product || !product.title) {
      return jsonResponse({ ok: false, error: 'Product title is required.' }, 400);
    }

    const id = product.id || ('kp-prod-' + Math.random().toString(36).slice(2, 8));
    const created_at = product.created_at || new Date().toISOString();
    const title = String(product.title || '').trim();
    const category = String(product.category || 'other').trim();
    const price = Number(product.price) || 0;
    const old_price = Number(product.oldPrice !== undefined ? product.oldPrice : (product.old_price || 0));
    const unit = String(product.unit || 'সেট').trim();
    const badge = String(product.badge || '').trim();
    const stock = Number(product.stock !== undefined ? product.stock : 10);
    const short_desc = String(product.short_desc || product.desc || '').trim();
    const description = String(product.description || product.desc || '').trim();
    
    let items_included = [];
    if (Array.isArray(product.items)) items_included = product.items;
    else if (Array.isArray(product.items_included)) items_included = product.items_included;
    else if (typeof product.items === 'string') {
      items_included = product.items.split('\n').map(s => s.trim()).filter(Boolean);
    }
    const itemsJson = JSON.stringify(items_included);

    const status = String(product.status || 'Active').trim();
    const images = JSON.stringify(Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []));
    const rating = Number(product.rating) || 5.0;
    const reviews = Number(product.reviews) || 0;
    const views = Number(product.views) || 0;
    const tags = JSON.stringify(Array.isArray(product.tags) ? product.tags : []);

    await env.DB.prepare(`
      INSERT INTO products (
        id, created_at, title, category, price, old_price, unit, badge,
        stock, short_desc, description, items_included, status, images,
        rating, reviews, views, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        category = excluded.category,
        price = excluded.price,
        old_price = excluded.old_price,
        unit = excluded.unit,
        badge = excluded.badge,
        stock = excluded.stock,
        short_desc = excluded.short_desc,
        description = excluded.description,
        items_included = excluded.items_included,
        status = excluded.status,
        images = excluded.images,
        tags = excluded.tags
    `).bind(
      id, created_at, title, category, price, old_price, unit, badge,
      stock, short_desc, description, itemsJson, status, images,
      rating, reviews, views, tags
    ).run();

    const savedProduct = {
      id,
      title,
      category,
      price,
      oldPrice: old_price,
      stock,
      unit,
      badge,
      description,
      items: items_included,
      images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
      status
    };

    return jsonResponse({ ok: true, product: savedProduct });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function deleteProduct(id, env) {
  try {
    assertDb(env);
    if (!id) return jsonResponse({ ok: false, error: 'Product ID is required.' }, 400);

    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return jsonResponse({ ok: true, id, message: 'পণ্যটি ডাটাবেস থেকে মুছে ফেলা হয়েছে' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function seedProducts(productsList, env) {
  try {
    assertDb(env);
    if (!Array.isArray(productsList) || !productsList.length) {
      return jsonResponse({ ok: false, error: 'Products array is required.' }, 400);
    }

    const stmts = productsList.map(p => {
      const id = p.id || ('kp-prod-' + Math.random().toString(36).slice(2, 7));
      const created_at = new Date().toISOString();
      const title = p.title || '';
      const category = p.category || 'other';
      const price = Number(p.price) || 0;
      const old_price = Number(p.oldPrice || p.old_price) || 0;
      const unit = p.unit || 'সেট';
      const badge = p.badge || '';
      const stock = Number(p.stock) || 10;
      const short_desc = p.short_desc || p.desc || '';
      const description = p.description || p.desc || '';
      const items = JSON.stringify(Array.isArray(p.items) ? p.items : (Array.isArray(p.items_included) ? p.items_included : []));
      const status = p.status || 'Active';
      const images = JSON.stringify(Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []));
      const rating = Number(p.rating) || 5.0;
      const reviews = Number(p.reviews) || 0;
      const views = Number(p.views) || 0;
      const tags = JSON.stringify(Array.isArray(p.tags) ? p.tags : []);

      return env.DB.prepare(`
        INSERT OR REPLACE INTO products (
          id, created_at, title, category, price, old_price, unit, badge,
          stock, short_desc, description, items_included, status, images,
          rating, reviews, views, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, created_at, title, category, price, old_price, unit, badge,
        stock, short_desc, description, items, status, images,
        rating, reviews, views, tags
      );
    });

    await env.DB.batch(stmts);
    return jsonResponse({ ok: true, count: productsList.length, message: 'Products seeded to D1 successfully' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/* ============================================================================
   3. Edge D1 Orders Handlers
   ============================================================================ */

async function getOrders(env) {
  try {
    assertDb(env);
    const { results } = await env.DB.prepare('SELECT * FROM orders ORDER BY placed_at DESC').all();

    const formatted = (results || []).map(row => {
      let details = [];
      try {
        details = typeof row.items_details === 'string' ? JSON.parse(row.items_details) : (row.items_details || []);
      } catch (_) { details = []; }

      return {
        ref: row.ref,
        placedAt: row.placed_at,
        placed_at: row.placed_at,
        name: row.customer_name,
        customer_name: row.customer_name,
        email: row.customer_email || '',
        customer_email: row.customer_email || '',
        phone: row.customer_phone,
        customer_phone: row.customer_phone,
        address: row.address,
        area: row.area || 'ঢাকা সিটি',
        deliveryType: row.delivery_type || 'জরুরি ডেলিভারি (২৪ ঘণ্টা)',
        deliveryFee: Number(row.delivery_fee) || 80,
        payment: row.payment_method || 'ক্যাশ অন ডেলিভারি',
        count: Number(row.items_count) || 1,
        subtotal: Number(row.subtotal) || Number(row.total_amount) || 0,
        total: Number(row.total_amount) || 0,
        total_amount: Number(row.total_amount) || 0,
        details,
        items: details,
        notes: row.order_notes || '',
        status: row.order_status || 'Pending',
        order_status: row.order_status || 'Pending'
      };
    });

    return jsonResponse({ ok: true, orders: formatted });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function placeOrder(order, env) {
  try {
    assertDb(env);
    if (!order) return jsonResponse({ ok: false, error: 'Order details missing.' }, 400);

    const ref = (order.ref || ('KP-' + Math.floor(10000 + Math.random() * 90000))).toUpperCase();
    const placed_at = order.placedAt || order.placed_at || new Date().toISOString();
    const customer_name = String(order.name || order.customer_name || 'গ্রাহক').trim();
    const customer_email = String(order.email || order.customer_email || '').trim().toLowerCase();
    const customer_phone = String(order.phone || order.customer_phone || '').trim();
    const address = String(order.address || '').trim();
    const area = String(order.area || 'ঢাকা সিটি').trim();
    const delivery_type = String(order.deliveryType || order.delivery_type || 'জরুরি ডেলিভারি (২৪ ঘণ্টা)').trim();
    const delivery_fee = Number(order.deliveryFee !== undefined ? order.deliveryFee : 80);
    const payment_method = String(order.payment || order.payment_method || 'ক্যাশ অন ডেলিভারি').trim();
    const order_notes = String(order.notes || order.order_notes || '').trim();

    const items = Array.isArray(order.items) ? order.items : (Array.isArray(order.details) ? order.details : []);
    const items_count = Number(order.count) || (items.reduce((s, it) => s + (it.qty || 1), 0) || 1);
    const subtotal = Number(order.subtotal !== undefined ? order.subtotal : order.total) || 0;
    const total_amount = Number(order.total !== undefined ? order.total : (subtotal + delivery_fee));
    const items_details = JSON.stringify(items);
    const order_status = String(order.status || order.order_status || 'Pending').trim();

    // 1. Insert order record
    const insertStmt = env.DB.prepare(`
      INSERT INTO orders (
        ref, placed_at, customer_name, customer_email, customer_phone,
        address, area, delivery_type, delivery_fee, payment_method,
        items_count, subtotal, total_amount, items_details, order_notes, order_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      ref, placed_at, customer_name, customer_email, customer_phone,
      address, area, delivery_type, delivery_fee, payment_method,
      items_count, subtotal, total_amount, items_details, order_notes, order_status
    );

    // 2. Decrement stock for ordered items
    const stockStmts = [];
    for (const it of items) {
      if (it && it.id) {
        const qty = Number(it.qty) || 1;
        stockStmts.push(
          env.DB.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').bind(qty, it.id)
        );
      }
    }

    await env.DB.batch([insertStmt, ...stockStmts]);

    return jsonResponse({
      ok: true,
      ref,
      order: {
        ref,
        placedAt: placed_at,
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
        total: total_amount,
        status: order_status
      }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function updateOrderStatus(orderRef, newStatus, env) {
  try {
    assertDb(env);
    if (!orderRef) return jsonResponse({ ok: false, error: 'Order reference is required.' }, 400);

    let cleanStatus = 'Pending';
    const s = String(newStatus || '').toLowerCase();
    if (s === 'delivered' || s.includes('ডেলিভার')) cleanStatus = 'Delivered';
    else if (s === 'confirmed' || s.includes('নিশ্চিত')) cleanStatus = 'Confirmed';
    else if (s === 'cancelled' || s === 'cancel' || s.includes('বাতিল')) cleanStatus = 'Cancelled';

    const res = await env.DB.prepare('UPDATE orders SET order_status = ? WHERE upper(ref) = upper(?)')
      .bind(cleanStatus, orderRef.trim())
      .run();

    return jsonResponse({ ok: true, ref: orderRef, status: cleanStatus, affected: res.meta?.changes || 1 });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function trackOrders(phone, ref, env) {
  try {
    assertDb(env);
    let results = [];
    if (ref) {
      const res = await env.DB.prepare('SELECT * FROM orders WHERE upper(ref) = upper(?)').bind(ref.trim()).all();
      results = res.results || [];
    } else if (phone) {
      const cleanPhone = phone.replace(/[\s-]/g, '').slice(-11);
      const res = await env.DB.prepare('SELECT * FROM orders WHERE customer_phone LIKE ? ORDER BY placed_at DESC').bind(`%${cleanPhone}%`).all();
      results = res.results || [];
    }

    const formatted = results.map(row => {
      let details = [];
      try {
        details = typeof row.items_details === 'string' ? JSON.parse(row.items_details) : (row.items_details || []);
      } catch (_) {}
      return {
        ref: row.ref,
        placedAt: row.placed_at,
        customerName: row.customer_name,
        phone: row.customer_phone,
        address: row.address,
        area: row.area,
        total: row.total_amount,
        status: row.order_status,
        items: details
      };
    });

    return jsonResponse({ ok: true, orders: formatted });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

/* ============================================================================
   4. Edge D1 Users & Access Handlers
   ============================================================================ */

async function getUsers(env) {
  try {
    assertDb(env);
    const { results } = await env.DB.prepare(`
      SELECT id, registered_at, name, email, phone, status, role
      FROM users
      ORDER BY registered_at DESC
    `).all();

    const formatted = (results || []).map(u => ({
      id: u.id,
      registeredAt: u.registered_at,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      status: u.status || 'Active',
      role: u.role || 'Customer'
    }));

    return jsonResponse({ ok: true, users: formatted });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function registerUser(userData, env) {
  try {
    assertDb(env);
    const name = String(userData.name || '').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    const phone = String(userData.phone || '').trim();
    const password = String(userData.password || '').trim();

    if (!name || !email || !password) {
      return jsonResponse({ ok: false, error: 'নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।' }, 400);
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE lower(email) = ?').bind(email).first();
    if (existing) {
      return jsonResponse({ ok: false, error: 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত। অনুগ্রহ করে লগইন করুন।' }, 409);
    }

    const id = 'USR-' + Math.random().toString(36).slice(2, 9).toUpperCase();
    const registered_at = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO users (id, registered_at, name, email, phone, password, status, role)
      VALUES (?, ?, ?, ?, ?, ?, 'Active', 'Customer')
    `).bind(id, registered_at, name, email, phone, password).run();

    return jsonResponse({
      ok: true,
      user: { id, name, email, phone, registeredAt: registered_at, status: 'Active', role: 'Customer' }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function loginUser(creds, env) {
  try {
    assertDb(env);
    const email = String(creds.email || '').trim().toLowerCase();
    const password = String(creds.password || '').trim();

    if (!email || !password) {
      return jsonResponse({ ok: false, error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' }, 400);
    }

    const user = await env.DB.prepare(`
      SELECT id, registered_at, name, email, phone, password, status, role
      FROM users
      WHERE lower(email) = ?
    `).bind(email).first();

    if (!user || user.password !== password) {
      return jsonResponse({ ok: false, error: 'ভুল ইমেইল অথবা পাসওয়ার্ড।' }, 401);
    }

    if (user.status && (user.status.toLowerCase() === 'inactive' || user.status.toLowerCase() === 'suspended')) {
      return jsonResponse({ ok: false, error: `আপনার একাউন্টটি সাময়িকভাবে স্থগিত (${user.status})। বিস্তারিত জানতে যোগাযোগ করুন।` }, 403);
    }

    return jsonResponse({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        registeredAt: user.registered_at,
        status: user.status || 'Active',
        role: user.role || 'Customer'
      }
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

async function updateUserStatus(emailOrId, newStatus, optionalId, env) {
  try {
    assertDb(env);
    const status = String(newStatus || 'Active').trim();
    const query = String(emailOrId || '').trim().toLowerCase();
    const altId = String(optionalId || emailOrId || '').trim();

    const res = await env.DB.prepare(`
      UPDATE users
      SET status = ?
      WHERE lower(email) = ? OR id = ? OR id = ?
    `).bind(status, query, query, altId).run();

    return jsonResponse({ ok: true, status, affected: res.meta?.changes || 1 });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}
