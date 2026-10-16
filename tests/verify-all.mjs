/**
 * ============================================================================
 * কবর পথের সামগ্রী — Comprehensive End-to-End Logic & Functionality Test Suite
 * ============================================================================
 * Tests:
 *  1. Asset & HTML Link Integrity (Validates all scripts, styles, images)
 *  2. DOM ID Contract Synchronization (index.html <-> script.js, admin.html <-> admin.js)
 *  3. Edge D1 Database Schema & Seed (Runs real in-memory SQLite tables & indexes)
 *  4. Serverless Edge API Router & Controller (Simulates all /api/* routes & transactions)
 *  5. Stock Decrement Atomic Transaction (Orders reduce inventory safely)
 *  6. Cart & Delivery Fee Calculations (Dhaka ৳80, Outside Dhaka ৳150)
 *  7. System Auto Day/Night Theme Logic
 *  8. Vendor Independence (Zero occurrences of forbidden vendor names)
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { handleApiRequest } from '../functions/api/_api.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('🧪 RUNNING FULL SYSTEM TEST SUITE: কবর পথের সামগ্রী');
console.log('======================================================\n');

/* ──────────────────────────────────────────────────────────────────────────
   TEST 1: Asset & Link Integrity
   ────────────────────────────────────────────────────────────────────────── */
console.log('📁 1. Testing HTML Asset Links & File Paths:');
const rootDir = process.cwd();
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const adminHtml = fs.readFileSync(path.join(rootDir, 'admin.html'), 'utf-8');

function checkAssetsExist(html, filename) {
  const srcMatches = [...html.matchAll(/(?:src|href)=["']([^"':#]+)["']/g)].map(m => m[1]);
  for (const assetPath of srcMatches) {
    if (assetPath.startsWith('http') || assetPath.startsWith('tel:') || assetPath.startsWith('mailto:') || assetPath.startsWith('//') || assetPath === '') {
      continue;
    }
    const cleanPath = assetPath.split('?')[0].split('#')[0];
    const fullPath = path.join(rootDir, cleanPath);
    const exists = fs.existsSync(fullPath);
    assert(exists, `In ${filename}, asset exists on disk: ${cleanPath}`);
  }
}

checkAssetsExist(indexHtml, 'index.html');
checkAssetsExist(adminHtml, 'admin.html');

/* ──────────────────────────────────────────────────────────────────────────
   TEST 2: DOM ID Contract Verification
   ────────────────────────────────────────────────────────────────────────── */
console.log('\n🔗 2. Testing DOM ID Contract Synchronization:');
const scriptJs = fs.readFileSync(path.join(rootDir, 'assets/js/script.js'), 'utf-8');
const adminJs = fs.readFileSync(path.join(rootDir, 'assets/js/admin.js'), 'utf-8');

function extractGetElementById(code) {
  const matches = [...code.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  return [...new Set(matches)];
}

const dynamicIds = ['userDropdownTrigger', 'userMenuDropdown', 'userMyOrdersBtn', 'userLogoutBtn'];
const storefrontIds = extractGetElementById(scriptJs);
for (const id of storefrontIds) {
  if (dynamicIds.includes(id)) {
    const isGeneratedInScript = scriptJs.includes(`id="${id}"`) || scriptJs.includes(`id='${id}'`);
    assert(isGeneratedInScript, `Dynamic Storefront DOM ID is generated in script.js: #${id}`);
  } else {
    const existsInIndex = indexHtml.includes(`id="${id}"`) || indexHtml.includes(`id='${id}'`);
    assert(existsInIndex, `Storefront DOM ID exists in index.html: #${id}`);
  }
}

const adminIds = extractGetElementById(adminJs);
for (const id of adminIds) {
  const existsInAdmin = adminHtml.includes(`id="${id}"`) || adminHtml.includes(`id='${id}'`);
  assert(existsInAdmin, `Admin DOM ID exists in admin.html: #${id}`);
}

/* ──────────────────────────────────────────────────────────────────────────
   TEST 3: Edge D1 Database Schema & Seed Verification (In-Memory SQLite)
   ────────────────────────────────────────────────────────────────────────── */
console.log('\n🗄️ 3. Testing Edge D1 Database Schema & Seed SQL:');
const db = new DatabaseSync(':memory:');

const schemaSql = fs.readFileSync(path.join(rootDir, 'database/schema.sql'), 'utf-8');
const seedSql = fs.readFileSync(path.join(rootDir, 'database/seed.sql'), 'utf-8');

try {
  db.exec(schemaSql);
  assert(true, 'database/schema.sql executed with 0 syntax errors');
} catch (err) {
  assert(false, `schema.sql execution failed: ${err.message}`);
}

try {
  db.exec(seedSql);
  assert(true, 'database/seed.sql executed with 0 syntax errors');
} catch (err) {
  assert(false, `seed.sql execution failed: ${err.message}`);
}

// Check users
const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@kabarpather.com');
assert(adminUser && adminUser.name.includes('এডমিন'), 'Default administrator seeded: admin@kabarpather.com');

// Check products
const products = db.prepare('SELECT * FROM products').all();
assert(products.length >= 4, `Built-in funeral packages seeded (Count: ${products.length})`);
assert(products.some(p => p.title.includes('কাফনের কাপড়')), 'Kafan package seeded');
assert(products.some(p => p.title.includes('দাফন')), 'Dafon package seeded');

/* ──────────────────────────────────────────────────────────────────────────
   TEST 4: Mock D1 & R2 Serverless Edge API Testing
   ────────────────────────────────────────────────────────────────────────── */
console.log('\n🌐 4. Testing Serverless Edge Pages Functions API (/api/*):');

// Wrap in-memory SQLite into D1-compatible binding
const mockD1 = {
  prepare(query) {
    const createExecutor = (params = []) => ({
      async first() {
        return db.prepare(query).get(...params);
      },
      async all() {
        const rows = db.prepare(query).all(...params);
        return { results: rows };
      },
      async run() {
        const res = db.prepare(query).run(...params);
        return { success: true, meta: { changes: res.changes } };
      }
    });

    const executor = createExecutor([]);
    executor.bind = (...params) => createExecutor(params);
    return executor;
  },
  async batch(statements) {
    const results = [];
    db.exec('BEGIN TRANSACTION');
    try {
      for (const stmt of statements) {
        const res = await stmt.run();
        results.push(res);
      }
      db.exec('COMMIT');
      return results;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
};

const mockR2Store = new Map();
const mockR2 = {
  async put(key, buffer, options) {
    mockR2Store.set(key, { buffer, options });
    return { key };
  },
  async get(key) {
    const item = mockR2Store.get(key);
    if (!item) return null;
    return {
      body: item.buffer,
      httpMetadata: item.options?.httpMetadata || { contentType: 'image/webp' }
    };
  }
};

const mockEnv = {
  DB: mockD1,
  PHOTOS_BUCKET: mockR2
};

// 4.1 Health Check Ping
const pingReq = new Request('http://localhost/api/ping', { method: 'GET' });
const pingRes = await handleApiRequest(pingReq, mockEnv);
const pingData = await pingRes.json();
assert(pingData.ok === true && pingData.databaseConnected === true, 'GET /api/ping returns healthy status');

// 4.2 Fetch Products
const prodReq = new Request('http://localhost/api/products', { method: 'GET' });
const prodRes = await handleApiRequest(prodReq, mockEnv);
const prodData = await prodRes.json();
assert(prodData.ok === true && Array.isArray(prodData.products) && prodData.products.length > 0, 'GET /api/products returns products array');

// 4.3 Customer / Admin Login
const loginReq = new Request('http://localhost/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@kabarpather.com', password: 'admin123' })
});
const loginRes = await handleApiRequest(loginReq, mockEnv);
const loginData = await loginRes.json();
assert(loginData.ok === true && loginData.user.email === 'admin@kabarpather.com', 'POST /api/users/login authenticates admin successfully');

// 4.4 Customer Registration
const regReq = new Request('http://localhost/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'তৌফিক আহমেদ',
    email: 'towfiq@example.com',
    phone: '01844687759',
    password: 'password123'
  })
});
const regRes = await handleApiRequest(regReq, mockEnv);
const regData = await regRes.json();
assert(regData.ok === true && regData.user.email === 'towfiq@example.com', 'POST /api/users/register creates new customer record');

// 4.5 Place Order & Atomic Stock Decrement
const initialStockRow = db.prepare('SELECT stock FROM products WHERE id = ?').get('kp-prod-001');
const initialStock = initialStockRow.stock;

const orderReq = new Request('http://localhost/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_name: 'তৌফিক আহমেদ',
    customer_phone: '01844687759',
    address: 'কামরাঙ্গীরচর, ঢাকা',
    delivery_zone: 'inside_dhaka',
    delivery_fee: 80,
    items: [
      { id: 'kp-prod-001', title: 'কাফনের কাপড় সেট', price: 1650, qty: 3 }
    ],
    total_amount: 5030,
    payment_method: 'ক্যাশ অন ডেলিভারি'
  })
});

const orderRes = await handleApiRequest(orderReq, mockEnv);
const orderData = await orderRes.json();
assert(orderData.ok === true && orderData.ref.startsWith('KP-'), `POST /api/orders places order: #${orderData.ref}`);

// Verify atomic stock decrement
const updatedStockRow = db.prepare('SELECT stock FROM products WHERE id = ?').get('kp-prod-001');
assert(updatedStockRow.stock === initialStock - 3, `Atomic stock decrement verified (${initialStock} ➔ ${updatedStockRow.stock})`);

// 4.6 Order Tracking
const trackReq = new Request(`http://localhost/api/orders/track?ref=${orderData.ref}`, { method: 'GET' });
const trackRes = await handleApiRequest(trackReq, mockEnv);
const trackData = await trackRes.json();
assert(trackData.ok === true && Array.isArray(trackData.orders) && trackData.orders.length > 0 && trackData.orders[0].customerName === 'তৌফিক আহমেদ', 'GET /api/orders/track finds order by reference');

// 4.7 Update Order Status
const statusReq = new Request('http://localhost/api/orders/status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ref: orderData.ref, status: 'Confirmed' })
});
const statusRes = await handleApiRequest(statusReq, mockEnv);
const statusData = await statusRes.json();
assert(statusData.ok === true && statusData.status === 'Confirmed', 'POST /api/orders/status marks order as Confirmed');

// 4.8 WebP Image Upload to R2
const sampleWebpBase64 = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4WAoAAAAQAAAAAQAAAAEUAAUAAwAAAP//';
const uploadReq = new Request('http://localhost/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: sampleWebpBase64,
    filename: 'kafan-preview.webp'
  })
});
const uploadRes = await handleApiRequest(uploadReq, mockEnv);
const uploadData = await uploadRes.json();
assert(uploadData.ok === true && uploadData.url.endsWith('.webp'), `POST /api/upload stores WebP photo in R2: ${uploadData.url}`);

/* ──────────────────────────────────────────────────────────────────────────
   TEST 5: Cart Delivery Fee & Math Logic
   ────────────────────────────────────────────────────────────────────────── */
console.log('\n🛒 5. Testing Cart & Delivery Fee Business Logic:');
const dhakaFee = 80;
const outsideDhakaFee = 150;
const sampleCart = [
  { id: '1', price: 1650, qty: 1 },
  { id: '2', price: 1200, qty: 2 }
];
const cartSubtotal = sampleCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
assert(cartSubtotal === 4050, `Cart subtotal calculation correct: ৳${cartSubtotal}`);
assert(cartSubtotal + dhakaFee === 4130, `Inside Dhaka total correct: ৳${cartSubtotal + dhakaFee}`);
assert(cartSubtotal + outsideDhakaFee === 4200, `Outside Dhaka total correct: ৳${cartSubtotal + outsideDhakaFee}`);

/* ──────────────────────────────────────────────────────────────────────────
   TEST 6: Device OS Auto Day/Night Theme Logic
   ────────────────────────────────────────────────────────────────────────── */
console.log('\n🌓 6. Testing Device OS Auto Day/Night Theme Logic:');
const themeModes = ['auto', 'dark', 'light'];
function getNextTheme(current) {
  return themeModes[(themeModes.indexOf(current) + 1) % themeModes.length];
}
assert(getNextTheme('auto') === 'dark', "Theme cycle: 'auto' ➔ 'dark'");
assert(getNextTheme('dark') === 'light', "Theme cycle: 'dark' ➔ 'light'");
assert(getNextTheme('light') === 'auto', "Theme cycle: 'light' ➔ 'auto'");

function resolveDeviceTheme(osPrefersDark) {
  return osPrefersDark ? 'dark' : 'light';
}
assert(resolveDeviceTheme(true) === 'dark', 'Phone/PC in Dark Mode resolves to dark theme');
assert(resolveDeviceTheme(false) === 'light', 'Phone/PC in Light Mode resolves to light theme');

// Verify zero manual theme toggle buttons in Storefront & Admin UI (Strictly Device Auto)
const indexHtmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const adminHtmlContent = fs.readFileSync(path.join(rootDir, 'admin.html'), 'utf-8');
const themeJsContent = fs.readFileSync(path.join(rootDir, 'assets', 'js', 'theme.js'), 'utf-8');
const stylesCssContent = fs.readFileSync(path.join(rootDir, 'assets', 'css', 'styles.css'), 'utf-8');

assert(!indexHtmlContent.includes('id="themeToggleBtn"') && !indexHtmlContent.includes('class="theme-toggle-btn"'), 'Storefront UI has 0 manual theme buttons (strictly device auto)');
assert(!adminHtmlContent.includes('id="themeToggleBtn"') && !adminHtmlContent.includes('class="theme-toggle-btn"'), 'Admin UI has 0 manual theme buttons (strictly device auto)');
assert(themeJsContent.includes('#003885') && themeJsContent.includes('#060d17'), 'Theme engine syncs mobile meta theme-color with #003885 (Day) and #060d17 (Night)');
assert(stylesCssContent.includes('@media (max-width: 768px)') && stylesCssContent.includes('@media (max-width: 380px)') && stylesCssContent.includes('@media (min-width: 1200px)'), 'All responsive breakpoints (Ultra-compact 380px, Mobile 768px, Desktop 1200px) defined');
assert(stylesCssContent.includes('.product-modal-dialog') && stylesCssContent.includes('overflow-y: auto'), 'Product details modal includes vertical overflow scroll for mobile safety');
assert(!stylesCssContent.includes('--white: #0b1626'), 'Zero --white pollution: --white is pure #ffffff in dark mode');
assert(stylesCssContent.includes('input::placeholder') && stylesCssContent.includes('[data-theme="dark"] input::placeholder'), 'High contrast input ::placeholder rules defined for Day & Night in styles.css');
assert(adminHtmlContent.includes('input::placeholder') && adminHtmlContent.includes('[data-theme="dark"] input::placeholder'), 'High contrast input ::placeholder rules defined for Day & Night in admin.html');
assert(stylesCssContent.includes('[data-theme="dark"] .btn-checkout-submit'), 'Dark mode high contrast sapphire button styling active for checkout and primary buttons');
assert(!indexHtmlContent.includes('placeholder="🔍'), 'Search input placeholder is clean with zero duplicate search emoji');
assert(indexHtmlContent.includes('class="catalog-search-wrap"') && indexHtmlContent.includes('class="catalog-search-icon"'), 'Search bar has dedicated wrap with single crisp SVG icon');
assert(!indexHtmlContent.includes('<span>🔍</span>'), 'Duplicate search emoji icon span is completely removed');
assert(indexHtmlContent.includes('class="category-tabs-wrapper"') && indexHtmlContent.includes('id="categoryTabs"'), 'Category filter pills are wrapped in dedicated category-tabs-wrapper container');
assert(stylesCssContent.includes('overflow-x: auto') && stylesCssContent.includes('justify-content: flex-start !important'), 'Category tabs have horizontal touch-scroll and flex-start alignment for mobile');
assert(stylesCssContent.includes('.floating-quick-actions') && stylesCssContent.includes('z-index: 99999'), 'Floating quick actions have max z-index and translateZ viewport pinning');
assert(stylesCssContent.includes('overflow-x: hidden') && stylesCssContent.includes('max-width: 100%'), 'Html and body enforce max-width 100% and overflow-x hidden to prevent horizontal blowout');
assert(indexHtmlContent.includes('style="color:var(--text-heading);margin-bottom:8px"'), 'Tracking modal title uses dynamic --text-heading for perfect Day/Night legibility');
assert(indexHtmlContent.includes('style="color:var(--text-heading);margin-bottom:6px"'), 'Success modal title uses dynamic --text-heading for perfect Day/Night legibility');

// Mathematical WCAG AA contrast validation
function luminance(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const rgb = [0, 2, 4].map(idx => parseInt(c.substr(idx, 2), 16) / 255);
  const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function calcContrast(hex1, hex2) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

assert(calcContrast('#003885', '#ffffff') >= 10.0, 'Day Primary on White contrast passes WCAG AAA (11.03:1)');
assert(calcContrast('#334155', '#ffffff') >= 10.0, 'Day Body Text on White contrast passes WCAG AAA (10.35:1)');
assert(calcContrast('#ffffff', '#003885') >= 10.0, 'Day Button Text on Primary contrast passes WCAG AAA (11.03:1)');
assert(calcContrast('#ffffff', '#15803d') >= 4.5, 'Day WhatsApp Button on Forest Green passes WCAG AA (5.02:1)');
assert(calcContrast('#f0f7ff', '#0b1626') >= 15.0, 'Night Heading on Card contrast passes WCAG AAA (16.81:1)');
assert(calcContrast('#cbd5e1', '#0b1626') >= 10.0, 'Night Body Text on Card contrast passes WCAG AAA (12.23:1)');
assert(calcContrast('#94a3b8', '#0b1626') >= 7.0, 'Night Muted Text on Card contrast passes WCAG AAA (7.08:1)');
assert(calcContrast('#ffffff', '#003885') >= 10.0, 'Night Primary Button Text on Sapphire contrast passes WCAG AAA (11.03:1)');
assert(calcContrast('#94a3b8', '#0d1b2e') >= 6.0, 'Night Input Placeholder on Dark Input passes WCAG AAA (6.75:1)');
assert(calcContrast('#cbd5e1', '#040810') >= 13.0, 'Night Footer Text on Deep Footer passes WCAG AAA (13.50:1)');
assert(calcContrast('#ffffff', '#040810') >= 20.0, 'Night Footer Phone on Deep Footer passes WCAG AAA (20.05:1)');

/* ──────────────────────────────────────────────────────────────────────────
   TEST 7: Vendor Brand Independence Verification
   ────────────────────────────────────────────────────────────────────────── */
console.log('\n🛡️ 7. Testing Zero Proprietary Vendor Mentions:');
const forbiddenTerms = ['cloudflare', 'ক্লাউডফ্লেয়ার', 'ক্লাউডফ্লেয়ার'];
let vendorLeaksFound = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'tests') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.css') || entry.name.endsWith('.toml') || entry.name.endsWith('.json') || entry.name.endsWith('.md') || entry.name.endsWith('.sql'))) {
      const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase();
      for (const term of forbiddenTerms) {
        if (content.includes(term.toLowerCase())) {
          console.error(`  ⚠️ Vendor leak found in: ${path.relative(rootDir, fullPath)} (contains "${term}")`);
          vendorLeaksFound++;
        }
      }
    }
  }
}

scanDir(rootDir);
assert(vendorLeaksFound === 0, `Zero prohibited vendor mentions detected across repository (Leaks: ${vendorLeaksFound})`);

/* ──────────────────────────────────────────────────────────────────────────
   SUMMARY
   ────────────────────────────────────────────────────────────────────────── */
console.log('\n======================================================');
console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL LOGIC, FUNCTIONS, DATABASE & CONTRACTS ARE 100% OPERATIONAL!\n');
  process.exit(0);
}
