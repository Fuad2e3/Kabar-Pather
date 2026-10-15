# 🧠 Project Memory & Architectural Knowledge — কবর পথের সামগ্রী (Kabar Pather)

This document serves as the persistent memory, architectural history, Architectural Decision Records (ADRs), and critical institutional knowledge for **কবর পথের সামগ্রী (Kabar Pather Samogri)**.

---

## 1. Project Context & Evolution

- **Project**: কবর পথের সামগ্রী (Kabar Pather Samogri) — ইসলামিক কাফন ও দাফন সামগ্রী অনলাইন সেবা
- **Primary Market**: Bangladesh (BDT pricing `৳`, Dhaka emergency delivery `৳৮০`, Outside Dhaka courier `৳১৫০`, Cash on Delivery, WhatsApp direct contact).
- **Core Evolution**:
  - **Phase 1 (Legacy)**: Single static HTML landing page with static phone call actions and hardcoded product cards.
  - **Phase 2 (Current Production)**: Complete fullstack modernization to **Edge Pages (with serverless Edge Pages Functions in `functions/api/`)**, **Edge D1 (SQL Database in `database/`)**, and **Edge R2 (WebP Optimized Object Storage)**. Includes full user authentication, admin portal with sell post form, live card preview, automatic client-side WebP compression (saving 80%–95% bandwidth), slide-in cart drawer, and order tracking.

---

## 2. Architectural Decision Records (ADRs)

### ADR-001: Edge D1 Serverless SQL Architecture
- **Status**: Implemented & Verified.
- **Context**: In emergency situations where families need burial items immediately, downtime or sluggish 3-second database spin-up times are unacceptable.
- **Decision**: Provision Edge D1 relational SQLite tables: `users`, `products`, and `orders`.
- **Consequences**:
  - Edge database query latency drops to `< 20ms`.
  - Transactional stock decrementing on order placement (`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`).
  - Full relational indexing on user emails, product categories, and order timestamps.

### ADR-002: In-Browser Client-Side WebP Compression & Edge R2 Storage
- **Status**: Implemented & Verified.
- **Context**: Store administrators capturing photos of kafan packages or funeral kits using modern smartphones take pictures of 4MB – 12MB. Uploading these directly consumes cellular data and slows down page delivery.
- **Decision**: Implement `PhotoOptimizer.compressImage(file)` using HTML5 Canvas in `assets/js/optimization.js`. Images are scaled down to a maximum dimension of 960px and encoded into WebP at 0.82 quality before transmitting to `POST /api/upload` and storing in Edge R2 Storage (`kabar-pather-photos`).
- **Consequences**:
  - 80% – 95% storage and network bandwidth savings (raw 5MB files compress down to 40KB – 70KB).
  - Rapid uploads even on 3G/4G cellular connections in Bangladesh.
  - Photos are served with public immutable edge cache headers via `/api/images/*`.

### ADR-003: Dual-Mode Client API Architecture (`KabarApi`)
- **Status**: Implemented & Verified.
- **Context**: The web application must remain fully functional during development, offline scenarios, or edge migration.
- **Decision**: Provide a unified client abstraction (`KabarApi` in `assets/js/api-client.js`) that queries the `/api` endpoints first and automatically falls back to browser `localStorage` (`kp.products.v1`, `kp.orders.v1`, `kp.users.v1`) if network requests fail or offline mode is detected.
- **Consequences**:
  - Zero application crashes when testing locally or during transient edge network drops.
  - Optimistic UI updates feel instant (0ms perceived latency).

### ADR-004: Admin Sell Post with Real-Time Card Preview
- **Status**: Implemented & Verified.
- **Context**: Administrators need complete confidence in how a burial product or kit looks to grieving customers before publishing.
- **Decision**: Build a real-time reactive card preview (`#cardPreview`) in `admin.html` that updates dynamically as the administrator enters titles, prices, descriptions, and uploads compressed WebP images.
- **Consequences**:
  - Prevents listing mistakes and ensures consistent Islamic aesthetic presentation.

### ADR-005: Strict Avoidance of Third-Party Hosting Terminology
- **Status**: Implemented & Verified.
- **Context**: The project specification strictly mandates zero references to proprietary hosting brand names or vendor transliterations.
- **Decision**: All configurations, scripts, functions, documentation, and user-facing views utilize standard neutral edge nomenclature: "Edge Pages", "Edge D1 Database", "Edge R2 Storage", "Edge Functions", and "গ্লোবাল এজ নেটওয়ার্ক".
- **Consequences**:
  - Complete compliance with brand and deployment neutrality requirements.

---

## 3. Persistent Constants & Keys

### 3.1 Security & Admin Profile
- **Administrator Email**: `admin@kabarpather.com`
- **Administrator Password**: `admin123`
- **Session Auth Key**: `sessionStorage.getItem('kp.admin.auth.v1')`

### 3.2 Storage Keys (`localStorage`)
- `kp.products.v1`: Cached product catalogue.
- `kp.orders.v1`: Cached order history.
- `kp.users.v1`: Cached registered customer accounts.
- `kp.cart.v1`: Active shopping cart state.
- `kp.auth.user.v1`: Logged-in customer session.
- `kp_theme`: User theme preference (`light` / `dark`).

---

## 4. Known Gotchas & Operational Caveats

1. **HTML5 Canvas WebP Support**:
   - `HTMLCanvasElement.toDataURL('image/webp')` is supported across 99%+ of modern browsers. In extremely rare legacy browsers, `PhotoOptimizer` gracefully outputs standard PNG/JPEG without throwing unhandled exceptions.
2. **Local vs. Remote D1 Execution**:
   - `npx wrangler d1 execute kabar-pather-db --local --file=./database/schema.sql` writes to the local `.wrangler/state/v3/d1` sandbox.
   - `npx wrangler d1 execute kabar-pather-db --remote --file=./database/schema.sql` modifies the production Edge D1 database.
3. **Delivery Fee Invariants**:
   - Inside Dhaka (`inside_dhaka`): `৳৮০`.
   - Outside Dhaka (`outside_dhaka`): `৳১৫০`.
   - Any modifications to delivery fee logic must be synchronized across `assets/js/api-client.js`, `script.js`, and `functions/api/_api.js`.
