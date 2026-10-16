# 📜 Engineering Rules & Code Guidelines — কবর পথের সামগ্রী (Kabar Pather)

This document establishes the mandatory engineering standards, architectural invariants, code organization rules, and operational protocols for all developers working on **কবর পথের সামগ্রী (Kabar Pather Samogri)**.

---

## 1. Architectural Invariants

1. **Lightweight Vanilla Core**: No bloated frontend frameworks (React, Vue, Angular). All UI logic must be implemented using clean, modern Vanilla ES6+ JavaScript, native DOM APIs, and CSS Design Tokens.
2. **Edge-First Serverless Architecture**: All server logic must be compatible with the Edge Pages Functions runtime (V8 isolates without heavy native Node.js C++ bindings).
3. **Optimistic UI with Dual-Layer Cache**: All storefront interactions must operate smoothly even during temporary cellular network disruptions via browser `localStorage` fallbacks.
4. **Zero Proprietary Vendor Names**: Under no circumstances should proprietary vendor brand names or transliterations be introduced into source code, comments, config files, or user-facing documentation. Always use neutral edge terms: "Edge Pages", "Edge D1 Database", "Edge R2 Storage", "Edge Pages Functions".

---

## 2. Code Organization & Architecture

```
Kabar-Pather/
├── index.html              # Main customer storefront & emergency hotline
├── admin.html              # Admin management portal & Sell Post form
├── assets/
│   ├── css/
│   │   └── styles.css      # Central design tokens, dark theme, & responsive styles
│   ├── js/
│   │   ├── theme.js        # System Auto Day/Night theme engine
│   │   ├── script.js       # Storefront controller (cart, auth, checkout, search)
│   │   ├── api-client.js   # Unified API client with localStorage fallback
│   │   ├── admin.js        # Admin portal controller & live card preview
│   │   └── optimization.js # HTML5 Canvas WebP photo compression engine
│   └── images/             # Product photography, logo variations & icons
├── database/
│   ├── schema.sql          # Edge D1 SQLite schema (users, products, orders)
│   └── seed.sql            # Built-in funeral packages & admin seed data
├── functions/
│   └── api/
│       ├── [[path]].js     # Edge Pages catch-all API gateway
│       └── _api.js         # Core Edge API router & business logic
├── docs/                   # Full documentation suite (PRD, ARCHITECTURE, etc.)
├── wrangler.toml           # Edge deployment configuration & resource bindings
└── package.json            # Project scripts & tooling
```

---

## 3. Database & SQL Governance (Edge D1 Database)

1. **Prepared Statements Only**:
   - Every database query must use parameterized prepared statements with explicit binding:
     ```javascript
     // ✅ CORRECT:
     await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();

     // ❌ FORBIDDEN:
     await env.DB.prepare(`SELECT * FROM products WHERE id = '${productId}'`).first();
     ```
2. **Atomic Stock Decrements**:
   - Order placement must execute stock decrements atomically alongside order insertion via `env.DB.batch([...])`.
3. **Schema Preservation**:
   - Any database schema changes must be documented in `database/schema.sql` and synchronized with `docs/ARCHITECTURE.md`.

---

## 4. Media & Photo Storage Rules (Edge R2 Storage)

1. **Mandatory In-Browser WebP Compression**:
   - Any image selected by an admin must pass through `PhotoOptimizer.compressImage(file)` before transmission to the Edge R2 storage endpoint (`POST /api/upload`).
   - Photos must be scaled to a maximum dimension of 960px and encoded into WebP (quality: 0.82) with an average file size under **70 KB**.
2. **Clean Edge URL Persistence**:
   - The database must store clean edge URLs (`/api/images/products/kp_...webp`), never raw massive Base64 strings.
3. **Public Edge Caching**:
   - Images served via `/api/images/*` must retain strong public cache headers:
     `Cache-Control: public, max-age=31536000, immutable`.

---

## 5. Security & Authentication Rules

1. **Fixed Administrator Account**:
   - Admin email: `admin@kabarpather.com`
   - Admin password: `admin123`
   - Session validation uses `sessionStorage.getItem('kp.admin.auth.v1')`.
2. **Customer Access Governance**:
   - Suspended customer accounts (`status === 'Suspended'`) must be blocked at login and checkout verification.
3. **Input Validation**:
   - Customer phone numbers must be validated as 11-digit Bangladeshi mobile formats (`01XXXXXXXXX`).

---

## 6. Pre-Release Verification Protocol

Before pushing changes to GitHub or deploying to Edge Pages, execute:
```bash
npm test
```
Ensure all automated verification checks (165+ tests) return clean exit code 0.

---

## 7. Continuous Documentation & GitHub Synchronization Protocol

1. **Mandatory Documentation Synchronization**:
   - Every architectural, feature, bug fix, or configuration change must be reflected in the relevant documentation in `docs/` (`README.md`, `MEMORY.md`, `TASKS.md`, `RULES.md`, `ARCHITECTURE.md`, `PRD.md`, `DESIGN.md`, `EDGE_DEPLOYMENT.md`, and root `README.md`).
   - `docs/TASKS.md` must be updated with milestone progress and checkmarks.
   - `docs/MEMORY.md` must record new Architectural Decision Records (ADRs) whenever system patterns or invariant rules change.
2. **Pre-Push Validation**:
   - The test suite (`npm test`) must pass cleanly (170+ tests, 0 failures) before any code is committed.
3. **Mandatory GitHub Push**:
   - Changes must be committed with descriptive conventional commit messages (e.g., `feat:`, `fix:`, `docs:`, `test:`).
   - Working trees must not be left uncommitted; all completed changes must be pushed to GitHub (`git push origin <branch>`).

---

## 8. Device-Autonomous Day/Night Theme & Responsive Viewport Rules

1. **Autonomous OS Theme Sync Only**:
   - The platform strictly adheres to the user's phone or computer OS theme (`prefers-color-scheme`).
   - Manual Day/Night toggle buttons are strictly prohibited from user-facing markup to ensure a dignified, distraction-free environment.
2. **Mobile Address Bar Integration**:
   - `<meta name="theme-color">` must always dynamically reflect `#003885` in daylight mode and `#060d17` in night mode.
3. **Defensive Viewport Height Standards**:
   - Every modal dialog (`.product-modal-dialog`, `.custom-modal-box`) must include `max-height: 90vh/92vh; overflow-y: auto;` to guarantee all interactive buttons remain reachable on compact phone viewports.

---

## 9. Contrast & Theme Invariance Rules

1. **Mathematical Invariance of `--white`**:
   - `--white` must ALWAYS be defined as `#ffffff;` in both `:root` and `[data-theme="dark"]`. Never assign dark hexes to `--white`. Surfaces must exclusively use `--bg-card`, `--bg-page`, or `--bg-subtle`.
2. **Explicit Input Placeholder Styling**:
   - Inputs, textareas, and selects must define high-contrast `::placeholder` styling for both day mode (`#64748b`) and night mode (`#94a3b8`).
3. **Primary Button Contrast Invariance**:
   - Primary action buttons in dark mode must use sapphire gradients with pure `#ffffff` text to guarantee 11:1+ contrast ratios.
4. **Clean Input Semantics**:
   - Search input placeholders must never contain redundant icon emojis when a physical icon element is positioned inside the input wrapper.


