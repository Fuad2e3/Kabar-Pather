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
- **Visual Presentation**: White elevated surface with subtle royal purple shadow on hover (`transform: translateY(-4px)`).
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
- **Dynamic Delivery Zone Calculation**:
  - Radio toggle between Dhaka (`৳৮০`) and Outside Dhaka (`৳১৫০`).
  - Subtotal + Delivery Fee = Grand Total recalculation with 0ms delay.
- Direct checkout button transitioning to the checkout modal.

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

## 5. Responsive Breakpoint Matrix

| Viewport | Range | Layout Strategy |
| :--- | :--- | :--- |
| **Mobile Portrait** | `< 576px` | 1-column single product card grid, full-width emergency bar, bottom-sheet style cart drawer. |
| **Mobile Landscape / Phablet**| `576px – 768px` | 2-column product grid, compact category pill scroll, full modal views. |
| **Tablet Portrait** | `769px – 992px` | 2–3 column product grid, right slide-in cart drawer (`380px`), stacked admin panels. |
| **Desktop** | `993px – 1280px` | 3–4 column product grid, side-by-side sell post form and live card preview in admin. |
| **Large Desktop** | `> 1280px` | Max container width `1200px` centered with generous white space and spiritual elegance. |
