# 📄 Product Requirements Document (PRD) — কবর পথের সামগ্রী (Kabar Pather)

This document specifies the product requirements, user personas, functional features, and non-functional specifications for **কবর পথের সামগ্রী (Kabar Pather Samogri)**.

---

## 1. Executive Summary

**কবর পথের সামগ্রী** is an ultra-fast, compassionate, edge-hosted e-commerce web platform engineered for emergency and planned Islamic burial, kafan, dafon, and janaza essentials in Bangladesh. In times of emotional distress and loss, the platform enables families and community organizers to order authentic, sunnah-compliant burial packages (কাফনের কাপড়, লোবান, কর্পূর, গোলাপ জল, আতর, সুরমা, সাবান, বাঁশের চাটাই ও দাফন কিট) with instant Cash on Delivery, emergency WhatsApp contact, and rapid Dhaka (৳80) and nationwide (৳150) delivery.

---

## 2. User Personas

| Persona | Description | Primary Needs |
| :--- | :--- | :--- |
| **Grieving Family / Relative** | Family members organizing an urgent Islamic funeral in Dhaka or nearby areas. | 24/7 hotline access (`01844-687759`), complete pre-assembled male/female kafan sets, 1-click Cash on Delivery without complex checkout barriers, instant WhatsApp confirmation. |
| **Mosque / Khadem / Murda Gosol Kari** | Community volunteer or mosque committee member stocking janaza essentials. | Authentic halal certified ingredients (pure camphor, natural attar, quality white cotton kafan), bulk pack availability, transparent pricing in BDT (`৳`). |
| **Store Administrator** | Business owner or inventory manager managing products, stock, and emergency orders. | Rapid product listing (sell post) with live card preview, automated WebP photo compression before storage upload, real-time stock decrement, 1-click order fulfillment and direct WhatsApp customer contact. |

---

## 3. Functional Requirements

### 3.1 Storefront & Catalogue (`index.html`, `script.js`)
- **Emergency Helpline & Topbar**: Prominent 24/7 emergency dispatch helpline (`01844-687759`), WhatsApp quick-chat link, and Dhaka emergency delivery badge.
- **Header Navigation & Live Cart**: Brand logo, navigation menu, customer profile access button, and cart icon with real-time numeric item badge.
- **Category Filter Tabs**: Dynamic category filtering supporting:
  - `সকল সামগ্রী` (All Essentials)
  - `কাফনের কাপড়` (Kafan Cloth - Male/Female packages)
  - `আতর ও সুরমা` (Attar, Surma & Fragrances)
  - `সম্পূর্ণ প্যাকেজ` (Complete Janaza & Dafon Bundles)
  - `আনুষঙ্গিক` (Camphor, Loban, Soap, Sponges, etc.)
- **Interactive Product Cards**:
  - High-resolution optimized product photography.
  - Clear BDT pricing (`৳`) with previous price strike-throughs for discounted bundles.
  - Stock availability badges (`ইন-স্টক`, `স্টক সীমিত`, `স্টক আউট`).
  - Direct 1-click "অর্ডার করুন" (Add to Cart) action.
- **Client-Side Live Search**: Real-time Bangla & English query engine filtering title, category, and description instantly without page reload.
- **Dual-Theme Support**: Respectful, serene light & dark theme toggle with persistent user preference storage.

### 3.2 Slide-In Cart Drawer & Checkout Pipeline
- **Slide-In Cart Drawer**: Smooth sliding panel displaying all selected items, unit pricing, quantity stepper (`+` / `-`), and single-click item removal.
- **Delivery Zone Calculation**:
  - Dhaka City (ঢাকার ভেতরে): `৳৮০` (Emergency 2–4 hour delivery option).
  - Outside Dhaka (ঢাকার বাইরে): `৳১৫০` (Curier delivery within 24–48 hours).
  - Dynamic total calculation updating instantly on delivery zone toggle.
- **Checkout Modal**:
  - Customer Name, Mobile Number (Bangladeshi 11-digit validation: `01XXXXXXXXX`), Detailed Delivery Address, Delivery Zone selection, and Optional Notes.
  - Payment Method: Cash on Delivery (ক্যাশ অন ডেলিভারি) default with bKash/Nagad emergency direct confirmation.
- **Order Generation & Reference**:
  - Generates standardized order reference: `KP-XXXXXX` (e.g., `KP-784219`).
  - Direct 1-tap WhatsApp confirmation link pre-filling order reference, item details, delivery address, and total amount.
  - Automatic order submission to Edge D1 database and atomic stock decrement.

### 3.3 Customer Accounts & Order Tracking
- **Customer Authentication Modal**:
  - Unified modal for Customer Login and Registration.
  - Stores customer profile in Edge D1 `users` table and browser session.
- **Order Tracking Modal**:
  - Accessible from header navigation and customer profile.
  - Search order status via Order Reference (`KP-XXXXXX`) or Customer Mobile Phone.
  - Shows visual status timeline: `অপেক্ষমান (Pending)` ➔ `নিশ্চিত (Confirmed)` ➔ `ডেলিভারি সম্পন্ন (Delivered)`.

### 3.4 Admin Portal (`admin.html`, `assets/js/admin.js`)
- **Secure Authentication**:
  - Protected view requiring `admin@kabarpather.com` / `admin123`.
  - Session validation using browser `sessionStorage`.
- **Telemetry & Metrics**:
  - Live metric chips showing Total Products, Total Orders, Total Revenue (`৳`), and Total Customers.
- **Product Management & Sell Post**:
  - Dedicated Sell Post creation form with Title, Bengali Title, Category, Price, Old Price, Stock, Description, and Badges.
  - **Live Card Preview**: Real-time rendering of the exact storefront card as the administrator types.
  - **Automatic WebP Compression**: Image selector utilizing HTML5 Canvas to resize (max 960px) and compress to `.webp` (quality 0.82), reducing upload size by 80%–95% before sending to Edge R2 Storage.
  - **Catalogue Actions**: Edit in-place, Toggle Visibility (`Active` / `Paused`), and Delete product with instant cascade.
- **Order Fulfillment Pipeline**:
  - Live order queue displaying order reference, customer details, delivery address, ordered items, and total amount.
  - Quick action buttons: Direct Call (`tel:`) and Direct WhatsApp message to customer.
  - Status updates: `Pending`, `Confirmed`, `Delivered`, `Cancelled` with 1-click execution.
- **Customer Access Management**:
  - Real-time customer list from Edge D1 database.
  - Status toggle (`Active` / `Suspended`).

---

## 4. API & Data Contract Specifications

| Endpoint | Method | Action / Purpose | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `/api/ping` | GET | Health & Storage Check | None | `{ ok: true, message, databaseConnected, r2Connected }` |
| `/api/products` | GET | Fetch Product Catalogue | None | `{ ok: true, products: [...] }` |
| `/api/products` | POST | Add / Update Product | Product Object | `{ ok: true, product }` |
| `/api/products/:id`| DELETE | Delete Product | None | `{ ok: true, id }` |
| `/api/orders` | GET | Fetch All Orders (Admin) | None | `{ ok: true, orders: [...] }` |
| `/api/orders` | POST | Place New Order | Order Object | `{ ok: true, ref, order }` |
| `/api/orders/status`| POST | Update Order Status | `{ ref, status }` | `{ ok: true, status }` |
| `/api/orders/track` | GET/POST | Track Single Order | `{ ref }` or `?ref=KP-XXXXXX` | `{ ok: true, order }` |
| `/api/users/register`| POST | Register Customer | `{ name, email, phone, password }` | `{ ok: true, user }` |
| `/api/users/login` | POST | Authenticate Customer | `{ email, password }` | `{ ok: true, user }` |
| `/api/upload` | POST | Upload WebP Photo to R2 | `{ image: dataUrl, filename }` | `{ ok: true, url, key }` |
| `/api/images/*` | GET | Stream Photo from R2 Storage | None | Binary WebP stream with public immutable cache headers |

---

## 5. Non-Functional Requirements (NFR)

1. **Edge Performance**:
   - First Contentful Paint (FCP) `< 0.8s`, Time to Interactive (TTI) `< 1.2s` via Edge Pages global CDN.
   - API response latency `< 25ms` globally via Edge Pages Functions and Edge D1.
2. **Bandwidth Optimization**:
   - Mandatory client-side WebP compression ensuring all product photos are under **70 KB** before network upload.
3. **Availability & Resilience**:
   - 99.99% edge uptime using serverless Edge Pages and Edge D1 architecture.
   - Resilient offline fallback using `localStorage` (`kp.products.v1`, `kp.orders.v1`) to prevent data loss during network hiccups.
4. **Data Security**:
   - 100% SQL injection prevention via Edge D1 parameterized prepared statements.
   - Zero exposure of sensitive administrator credentials on public APIs.
