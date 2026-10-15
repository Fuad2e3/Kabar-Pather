# 🏛️ System Architecture — কবর পথের সামগ্রী (Kabar Pather)

This document outlines the complete architectural design, data flow, component decomposition, and infrastructure topology of **কবর পথের সামগ্রী (Kabar Pather Samogri)**.

---

## 1. High-Level Architecture Topology

কবর পথের সামগ্রী is engineered as an ultra-fast, edge-first, serverless e-commerce platform hosted globally on high-performance edge network infrastructure with zero cold-start latency.

```mermaid
graph TD
    Client["Visitor / Admin Browser\n(HTML5, CSS3, Vanilla JS)"]
    
    subgraph Global Edge Network
        Pages["Edge Pages Static Assets\n(index.html, admin.html, styles.css, JS)"]
        Router["Edge Pages Functions Router\n(functions/api/[[path]].js & _api.js)"]
        D1[("Edge D1 SQL Database\n(kabar-pather-db)")]
        R2[("Edge R2 Object Storage\n(kabar-pather-photos)")]
    end
    
    subgraph Client-Side Dual Layer
        LocalStore[("Browser LocalStorage\n(kp.products.v1, kp.orders.v1)")]
        CanvasOpt["HTML5 Photo Optimizer\n(In-browser WebP 80-95% compression)"]
    end

    Client -->|1. Requests static assets| Pages
    Client -->|2. Reads cached listings| LocalStore
    Client -->|3. Compresses product photos| CanvasOpt
    CanvasOpt -->|4. Uploads WebP image| Router
    Router -->|Stores binary WebP image| R2
    Router -->|Serves image /api/images/*| Client
    Client -->|5. Queries / Mutates data| Router
    Router -->|SQL Queries & Transactions| D1
```

---

## 2. Infrastructure & Edge Components

| Component | Technology | Role & Responsibility |
| :--- | :--- | :--- |
| **Frontend Edge CDN** | Edge Pages Static Assets | Global edge delivery of static HTML (`index.html`, `admin.html`), CSS design tokens, and JavaScript modules. |
| **Serverless API Layer** | Edge Pages Functions | Serverless Edge REST and RPC Action API router located in `functions/api/[[path]].js` and `functions/api/_api.js`. |
| **Relational Database** | Edge D1 SQLite Database | Relational database (`kabar-pather-db`) storing records for `users`, `products`, and `orders` with parameterized prepared queries. |
| **Media Object Storage** | Edge R2 Object Storage | Zero-egress media bucket (`kabar-pather-photos`) storing WebP product photos with public immutable edge cache headers. |
| **Client-Side Cache Layer** | Browser `localStorage` | Instant rendering layer (`kp.products.v1`, `kp.orders.v1`) providing optimistic UI updates, zero perceived latency, and offline resilience. |
| **Photo Compression Engine** | HTML5 Canvas WebP Engine | Client-side compression script (`assets/js/optimization.js`) resizing raw photos and compressing to `.webp` format prior to upload. |

---

## 3. Data Flow & Transaction Lifecycles

### 3.1 Storefront Product Browsing Flow
1. **Initial Asset Request**: Client requests `index.html`. Browser loads design system `styles.css` and scripts from edge CDN.
2. **Instant Cache Check**: `KabarApi.getProducts()` retrieves the local product catalogue immediately from `localStorage` (`kp.products.v1`).
3. **Edge Synchronization**: Concurrently, the client fires a network query `GET /api/products` to the Edge API router.
4. **Edge D1 Query**: The Edge Function executes `SELECT * FROM products ORDER BY rowid DESC`, parses JSON columns (`images`, `tags`), and returns product records.
5. **DOM Reconciliation**: The frontend reconciles remote data with local state and renders the storefront product grid seamlessly.

### 3.2 Product Photo Upload & Optimization Flow (R2 Storage)
1. **Admin Photo Selection**: Admin selects an image (JPEG, PNG, or camera capture) in the sell post form (`admin.html`).
2. **In-Browser WebP Compression**: `PhotoOptimizer.compressImage(file)` loads the image onto an HTML5 Canvas, scales the maximum dimension to 960px, and encodes it into `image/webp` (quality: 0.82). File size is reduced by 80%–95% (typically `< 60 KB`).
3. **Edge R2 Transmission**: The compressed WebP data is transmitted via `POST /api/upload`.
4. **Bucket Storage**: The Edge Function writes the binary buffer into `env.PHOTOS_BUCKET.put('products/kp_...webp', buffer, { httpMetadata })`.
5. **Immutable Edge URL**: The Edge Function returns `/api/images/products/kp_...webp`, which is stored in the product record.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Browser as Browser & Canvas
    participant API as Edge Router (/api/upload)
    participant R2 as Edge R2 Storage
    participant D1 as Edge D1 Database

    Admin->>Browser: Selects product image (2MB - 10MB)
    Browser->>Browser: PhotoOptimizer compresses to WebP (<60KB)
    Browser->>API: POST /api/upload (WebP base64)
    API->>R2: env.PHOTOS_BUCKET.put(key, buffer, webpHeaders)
    R2-->>API: 200 OK (Uploaded)
    API-->>Browser: { ok: true, url: "/api/images/products/kp_...webp" }
    Browser->>API: POST /api/products (Save product with WebP URL)
    API->>D1: INSERT INTO products (...)
    D1-->>API: 200 OK
    API-->>Browser: { ok: true, product }
```

### 3.3 Checkout & Stock Decrement Transaction Flow
1. **Order Submission**: Customer places an order on `index.html` checkout modal via `KabarApi.placeOrder()`.
2. **Edge Batch Transaction**: The Edge Function invokes an atomic batch transaction on `env.DB`:
   - Inserts order record into `orders` table.
   - For every line item in the order, executes:
     ```sql
     UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?;
     ```
3. **Immediate Confirmation**: Customer receives the confirmed order reference (`KP-XXXXXX`), a direct WhatsApp confirmation link, and catalog stock is decremented immediately across the store.

---

## 4. Database Schema Design (Edge D1 Database)

```mermaid
erDiagram
    USERS {
        string id PK
        string registered_at
        string name
        string email UK
        string phone
        string password
        string status
    }
    PRODUCTS {
        string id PK
        string created_at
        string title
        string title_bn
        string category
        real price
        real old_price
        int stock
        string description
        string status
        string images
        string badge
        string tags
    }
    ORDERS {
        string ref PK
        string placed_at
        string customer_name
        string customer_email
        string customer_phone
        string address
        string delivery_zone
        real delivery_fee
        string payment_method
        int items_count
        real total_amount
        string items_details
        string order_status
        string notes
    }
```

### Table Specifications:
- **`users`**: Customer accounts and admin profiles. Enforces unique email constraint and indexed access status (`Active` / `Suspended`).
- **`products`**: Product catalogue with technical specifications, English & Bengali titles, pricing, stock levels, and JSON-encoded image URL arrays.
- **`orders`**: Placed orders, customer delivery metadata, delivery zone (`inside_dhaka` / `outside_dhaka`), line item details (JSON array), and fulfillment lifecycle states (`Pending`, `Confirmed`, `Delivered`, `Cancelled`).

---

## 5. Security Architecture

1. **Authentication & Session Isolation**:
   - Fixed Administrator authentication (`admin@kabarpather.com` / `admin123`) verified with session storage flags.
   - Real-time customer access status checks (`Active` / `Suspended`). Suspended accounts are rejected at the edge.
2. **SQL Injection Defense**:
   - 100% of Edge D1 database operations use prepared statements with strict parameter binding (`env.DB.prepare(...).bind(...)`).
3. **CORS Governance**:
   - Standard CORS headers (`Access-Control-Allow-Origin: *`, standard safe methods, pre-flight caching) enabled across all `/api/*` endpoints.
4. **Media Validation**:
   - Upload endpoint strictly accepts and verifies image payloads, converting all uploaded media into `.webp` format before persisting in Edge R2 Storage.
