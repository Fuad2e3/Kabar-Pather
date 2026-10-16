# 🎨 Design System & UI Specifications — কবর পথের সামগ্রী (Kabar Pather)

This document outlines the visual language, design token architecture, typography hierarchy, Islamic aesthetic principles, and component specifications of **কবর পথের সামগ্রী (Kabar Pather Samogri)**.

---

## 1. Design Philosophy

কবর পথের সামগ্রী is designed around four foundational visual and emotional principles:

1. **Serenity & Reverence (গাম্ভীর্য ও পবিত্রতা)**: Islamic emergency funeral services require a respectful, solemn, and calming aesthetic. We utilize serene Royal Sapphire Blue (`#003885`), gentle accents, and clean spiritual white backdrops.
2. **Instant Scannability under Stress (সংকটে দ্রুত সিদ্ধান্ত)**: Users visiting the site are often grieving or under urgent time constraints. Pricing in Taka (`৳`), product inclusions, emergency hotline numbers (`01844-687759`), and delivery times are prominently presented with zero clutter.
3. **Compassionate Tactility**: Smooth, gentle micro-transitions, elevated cards, and a slide-in cart drawer that feels responsive and assuring.
4. **Authentic Bengali Typography**: Deep integration of the **Hind Siliguri** font for natural, readable Bengali letterforms combined with **Inter** for clean numerals and Latin text.

---

## 2. Design Token System

### 2.1 Color Tokens
The interface utilizes structured CSS custom properties defined in `styles.css`:

```css
:root {
  /* Brand Primary (Royal Sapphire Blue) */
  --primary:        #003885;
  --primary-hover:  #004bb3;
  --primary-dark:   #00275c;
  --primary-light:  #1d64c9;
  --primary-rgb:    0, 56, 133;

  /* Accent & Semantics */
  --accent:         #c99738; /* Gold Accent */
  --accent-light:   #fff8eb;
  --success:        #15803d; /* In Stock / Delivered */
  --warning:        #b45309; /* Low Stock */
  --danger:         #b91c1c; /* Urgent / Out of Stock / Cancelled */
  --info:           #0369a1; /* Processing / Info */

  /* Neutrals (Light Mode) */
  --bg-body:        #f8fafd;
  --bg-card:        #ffffff;
  --bg-elevated:    #ffffff;
  --border-color:   #cfe0f7;
  --text-main:      #0d1b2a;
  --text-muted:     #64748b;
  --text-light:     #f0f5fc;

  /* Elevation Shadows */
  --shadow-sm:      0 1px 3px rgba(0, 56, 133, 0.06);
  --shadow-md:      0 4px 14px rgba(0, 56, 133, 0.08);
  --shadow-lg:      0 12px 28px rgba(0, 56, 133, 0.12);
}

[data-theme="dark"] {
  --bg-body:        #060d17;
  --bg-card:        #0b1626;
  --bg-elevated:    #0f1f36;
  --border-color:   #1e355b;
  --text-main:      #f0f7ff;
  --text-muted:     #94a3b8;
  --text-light:     #ffffff;
  --primary:        #38bdf8;
  --primary-light:  #1e40af;
}
```

### 2.2 Radius & Motion Tokens
```css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. Typography Hierarchy

The typography pairs **Hind Siliguri** (for natural Bengali scripts) with **Inter** (for numeric and English precision):

| Element | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Emergency Bar** | 0.85rem – 0.95rem | 600 (SemiBold) | 1.4 | 24/7 Hotline & Emergency delivery note |
| **Hero Title** | 2.0rem – 2.75rem | 700 (Bold) | 1.25 | Main page spiritual headline |
| **Section Heading** | 1.5rem – 1.85rem | 700 (Bold) | 1.3 | Category sections, catalog divider |
| **Card Title** | 1.05rem – 1.15rem | 600 (SemiBold) | 1.35 | Product names (e.g. কাফন প্যাকেজ পুরুষ) |
| **Body Text** | 0.9rem – 0.95rem | 400 (Regular) | 1.6 | Inclusions list, descriptions |
| **Price Display** | 1.2rem – 1.35rem | 700 (Bold) | 1.0 | Pricing in Taka (`৳২,২০০`) |
| **Badge Pill** | 0.72rem – 0.78rem | 600 (SemiBold) | 1.0 | Stock badges, discount tags |

---

## 4. Key Component Specifications

### 4.1 Product Card (`.product-card`)
- **Visual Presentation**: White elevated surface with subtle royal blue shadow on hover (`transform: translateY(-4px)`).
- **Product Image Frame**: 4:3 aspect ratio container with soft background, lazy loading, and object-fit containment.
- **Badge Indicators**:
  - `প্রিমিয়াম প্যাকেজ`: Gold accent pill for curated sets.
  - `ইন-স্টক`: Soft emerald green pill.
  - `স্টক সীমিত`: Amber warning pill.
- **Price Block**: Current price in bold primary color with optional struck-through previous price.
- **Order Action Button**: 1-click "অর্ডার করুন" with shopping bag icon triggering instant cart addition and animated badge feedback.

### 4.2 Slide-In Cart Drawer (`#cartDrawer`)
- Slide-in glassmorphic drawer anchored to the right viewport.
- Itemized list with thumbnail, item title, quantity stepper (`+` / `-`), and line item removal button (`✕`).
- **Account-Linked Customer Profile (`#checkoutUserCard`)**:
  - Displays avatar with user initial, customer full name, verified badge ("✓ অ্যাকাউন্ট থেকে যুক্ত"), and mobile number automatically taken from the account.
  - Manual text inputs for name and mobile number are eliminated from view.
- **Guest Auth Interception Prompt (`#checkoutAuthPrompt`)**:
  - For unauthenticated users, displays a prominent callout with "✨ নতুন অ্যাকাউন্ট তৈরি করুন" and "লগইন করুন" buttons.
- **Dynamic Delivery Zone Calculation**:
  - Select dropdown between Dhaka City (`৳৮০`) and Outside Dhaka (`৳১৫০`).
  - Subtotal + Delivery Fee = Grand Total recalculation with 0ms delay.
- Delivery address textarea (`#checkoutAddress`) and Cash on Delivery guarantee badge.

### 4.3 Admin Sell Post Live Preview (`#cardPreview`)
- Real-time mirrored rendering of the exact storefront product card inside `admin.html`.
- Updates title, category, pricing, description, and photo dynamically as the administrator types.
- Visual WebP optimization indicator displaying original size vs. compressed size with percentage savings badge (`80-95% সাশ্রয়`).

### 4.4 Order Tracking Dialog (`#trackingModal`)
- Modal window allowing quick search by Order Reference (`KP-XXXXXX`) or Phone Number.
- Step-by-step graphical timeline:
  1. `অপেক্ষমান (Pending)` — অর্ডার গ্রহণ করা হয়েছে।
  2. `নিশ্চিত (Confirmed)` — সামগ্রী প্রস্তুত ও ডেলিভারিতে পাঠানো হয়েছে।
  3. `ডেলিভারি সম্পন্ন (Delivered)` — কাস্টমারের নিকট সফলভাবে হস্তান্তরিত।

---

## 5. Responsive Breakpoint Matrix & Device Support

| Viewport Category | Breakpoint Range | Architectural Layout Strategy |
| :--- | :--- | :--- |
| **Ultra-Compact Mobile** | `< 380px` (e.g. iPhone SE, Galaxy Fold) | 1-column/condensed grid, 12px gutter padding, font scale dampening (`0.88rem` titles), 150px modal image height, 100vw full-screen cart drawer. |
| **Standard Mobile** | `380px – 768px` (iPhone 13/14/15/16, Pixel, Galaxy S) | 2-column product grid, touch-smooth horizontal scrollable category filter pills, full-screen cart drawer (`100vw`), product details modal with vertical scroll safety (`max-height: 92vh; overflow-y: auto`). |
| **Tablet (Portrait & Landscape)** | `769px – 1199px` (iPad, Galaxy Tab) | 3-column product grid, dedicated `380px` slide-in cart drawer, stacked or dual-column administrative sell-post form. |
| **Desktop & Large Displays** | `1200px+` (Laptops, iMacs, 4K displays) | 4-column product grid, 1220px centered container, side-by-side sell post form and reactive live card preview. |

---

## 6. Autonomous Device OS Day/Night Architecture
- **Strict Device Detection**: Theme follows user's operating system mode automatically using `window.matchMedia('(prefers-color-scheme: dark)')`.
- **Zero UI Button Distraction**: Manual Day/Night toggle buttons are deliberately eliminated from both Storefront and Admin interfaces.
- **Mobile Address Bar Chrome Sync**: Dynamic `<meta name="theme-color">` updates to `#003885` (Day) and `#060d17` (Night) for seamless integration with mobile browser UI.

---

## 7. Contrast & Legibility Standards (WCAG AAA/AA)

Every button, icon, heading, and body text element is engineered to guarantee immediate scannability in high-glare daytime and OLED night environments:

| Theme Context | Foreground Token / Hex | Surface Background | Measured Ratio | WCAG Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **Day Primary Brand** | `#003885` | `#ffffff` | **11.03:1** | Pass (AAA) |
| **Day Body Text** | `#334155` | `#ffffff` | **10.35:1** | Pass (AAA) |
| **Day Muted / Placeholders** | `#64748b` | `#ffffff` | **4.76:1** | Pass (AA) |
| **Day Primary Button Text** | `#ffffff` | `#003885` | **11.03:1** | Pass (AAA) |
| **Day WhatsApp Button** | `#ffffff` | `#15803d` (Forest Green) | **5.02:1** | Pass (AA) |
| **Night Headings & Titles** | `#f0f7ff` | `#0b1626` (Card) | **16.81:1** | Pass (AAA) |
| **Night Body Text** | `#cbd5e1` | `#0b1626` (Card) | **12.23:1** | Pass (AAA) |
| **Night Muted / Placeholders** | `#94a3b8` | `#0d1b2e` (Input) | **6.75:1** | Pass (AAA) |
| **Night Primary Button Text** | `#ffffff` | `#003885` (Sapphire) | **11.03:1** | Pass (AAA) |
| **Night Footer Text** | `#cbd5e1` | `#040810` (Footer) | **13.50:1** | Pass (AAA) |
| **Night Footer Phone Link** | `#ffffff` | `#040810` (Footer) | **20.05:1** | Pass (AAA) |

- **Invariance Rule**: `--white` is mathematically invariant (`#ffffff`) in both Light and Dark themes. Surfaces must always use `--bg-card`, `--bg-page`, or `--bg-subtle`.

---

## 8. Mobile Component Engineering Specifications

### 8.1 Floating Quick Actions (`.floating-quick-actions`)
- **Viewport Anchoring**: Fixed at bottom-right of the physical screen (`position: fixed !important; right: max(16px, env(safe-area-inset-right, 16px)) !important; bottom: max(20px, env(safe-area-inset-bottom, 20px)) !important; z-index: 99999 !important; transform: translateZ(0) !important;`).
- **Isolation**: High z-index and GPU compositor layering prevent overlap or occlusion by modals, cards, or hero elements.
- **Blowout Prevention**: `html, body` enforce `width: 100%; max-width: 100%; overflow-x: hidden;` ensuring floating icons never drift off-screen due to wide child elements.

### 8.2 Catalog Live Search Bar (`.catalog-search-wrap`)
- **Single Crisp Icon**: Inline SVG magnifying glass (`.catalog-search-icon`) with 2.2px stroke width, eliminating dual-icon rendering caused by emoji placeholders.
- **Font-Size Zoom Protection**: Input font size is fixed at `16px` on mobile (`@media (max-width: 768px)`) to prevent mobile Safari/Chrome from triggering automatic page zoom on focus.

### 8.3 Category Filter Pills (`.category-tabs-wrapper`)
- **Edge-to-Edge Container**: Stretches full-bleed across mobile screens (`width: 100vw; margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); overflow: hidden;`).
- **Touch Inertial Scrolling**: `.category-tabs` uses `display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; touch-action: pan-x !important; justify-content: flex-start !important;` with hidden scrollbars for native app-like swipeability.

### 8.4 Order CTA Banner Action Hierarchy (`.banner-actions`)
- **Vertical Button Stacking**: To eliminate horizontal cramping and ensure maximum legibility for the 11-digit phone number and Bengali WhatsApp message, `.banner-actions` enforces `flex-direction: column; align-items: stretch; gap: 12px; min-width: 270px;`.
- **Top Priority Phone Call**: The phone button (`#bannerCallBtn`, `01844-687759`) is positioned directly on top of the WhatsApp button (`#bannerWhatsappBtn`), providing instantaneous one-tap emergency calling with prominent, clean typography and full touch-target width across desktop and mobile.

### 8.5 Proportional Section & Footer Spacing Calibration
- **Tighter Vertical Flow**: Section paddings (previously 80px–95px) and footer padding (previously 70px) created oversized empty dark bands in dark mode. Vertical paddings were re-calibrated proportionally (~60% ratio: 100px -> 60px) to `42px–54px` on desktop and `30px–40px` on mobile.
- **Enhanced Scannability**: Eliminates excessive empty space above footer columns and between sections, keeping content cohesive and accessible on all viewport heights.



