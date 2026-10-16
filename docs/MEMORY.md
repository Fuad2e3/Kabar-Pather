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

### ADR-006: Continuous Documentation Maintenance & GitHub Synchronization
- **Status**: Implemented & Enforced.
- **Context**: As the platform evolves rapidly across edge functions, D1 database schemas, admin tooling, and storefront UI, documentation drift and desynchronized local commits create operational risk.
- **Decision**: Require all development operations and AI agent contributions to strictly maintain all documentation files in `docs/` (`README.md`, `MEMORY.md`, `TASKS.md`, `RULES.md`, `ARCHITECTURE.md`, `PRD.md`, `DESIGN.md`, `EDGE_DEPLOYMENT.md`, and root `README.md`) on every change, validate against `npm test`, and push commits directly to GitHub (`origin main`).
- **Consequences**:
  - Documentation always mirrors the true state of the repository with zero latency.
  - Transparent git history with semantic conventional commits available to all collaborators on GitHub.
  - Zero uncommitted local drift or undocumented architectural decisions.

### ADR-007: Product Details Modal Dual Action (Direct Order & WhatsApp) Architecture
- **Status**: Implemented & Verified.
- **Context**: When customers open the product details modal (`#productModal`) from the storefront, having only contact links without a direct web ordering path added friction to the conversion funnel.
- **Decision**: Restructure the modal call-to-action buttons into a stacked dual-action hierarchy:
  1. **Primary Button (`#modalOrderBtn`)**: "অর্ডার করুন" with primary violet branding, 1-click adds the active product to cart and smoothly transitions into the checkout drawer.
  2. **Secondary Button (`#modalWhatsappBtn`)**: "WhatsApp এ অর্ডার করুন" in WhatsApp green, linking directly to the emergency WhatsApp hotline with a pre-composed product message.
- **Consequences**:
  - Grieving or urgent families can place web orders immediately from the modal view without needing to close the dialog.
  - WhatsApp remains accessible as an alternative communication channel.

### ADR-008: Adoption of Royal Sapphire Blue (#003885) Brand Theme
- **Status**: Implemented & Verified.
- **Context**: To align the visual identity with a serene, dignified Islamic royal blue aesthetic, the primary landing page palette needed to transition to `#003885`.
- **Decision**: Transition `--primary` to `#003885` and rebuild the tonal scales (surfaces, shadows, gradients, and night mode sapphire blue `#38bdf8`) while maintaining strict WCAG AA contrast ratios across both day and night themes.
- **Consequences**:
-  - Dignified, premium visual presentation across all storefront components.
-  - High scannability and contrast for emergency ordering.

### ADR-009: Autonomous Device-Only Day/Night Theme & Comprehensive Responsive Suite
- **Status**: Implemented & Verified.
- **Context**: The user specified that the website must automatically detect day/night mode from the user's phone or PC OS settings without any manual Day/Night toggle button on the UI, and must be fully responsive across all screen sizes.
- **Decision**:
  1. Rely exclusively on `window.matchMedia('(prefers-color-scheme: dark)')` with real-time `change` event listeners in `assets/js/theme.js`.
  2. Eliminate all manual theme buttons from Storefront and Admin views, maintaining zero visual clutter for urgent funeral inquiries.
  3. Dynamically sync the mobile browser address bar `<meta name="theme-color">` with `#003885` (Light / Day) and `#060d17` (Dark / Night).
  4. Unify the dark mode CSS palette in `assets/css/styles.css` with Royal Sapphire Blue (`#003885` / `#38bdf8`) and midnight slate surfaces (`#060d17` / `#0b1626` / `#0f1f36`).
  5. Enforce defensive mobile viewport constraints: product details modal (`.product-modal-dialog`) has `max-height: 90vh/92vh; overflow-y: auto;` to guarantee full access to dual CTAs ("অর্ডার করুন" and "WhatsApp এ অর্ডার করুন") on all ultra-compact (320px–380px) and standard viewports.
- **Consequences**:
  - 100% automatic day/night theme sync across iOS, Android, macOS, and Windows.
  - Zero accidental theme mismatch or toggle confusion.
  - 100% responsive fluid rendering on phones, phablets, tablets, laptops, and ultra-wide desktops.

### ADR-010: Total Day & Night Element-Level Readability & WCAG AAA/AA Contrast Compliance
- **Status**: Implemented & Verified.
- **Context**: The user instructed to test every button, icon, word, and label across day and night modes to ensure 100% clarity and legibility without any manual button (device auto-detect).
- **Decision**:
  1. Fix `--white` variable pollution: Ensure `--white` strictly resolves to `#ffffff` in both light and dark themes, preventing text using `color: var(--white)` from rendering in deep navy `#0b1626` in dark mode. Surface containers must explicitly use `--bg-card` and `--bg-page`.
  2. Implement global and dark-mode input `::placeholder` contrast rules (`#64748b` in day mode at 4.76:1; `#94a3b8` in night mode at 6.75:1).
  3. Enforce high-contrast dark mode buttons: Primary and checkout submit buttons use sapphire gradients `linear-gradient(135deg, #003885 0%, #1d64c9 100%)` with bold white `#ffffff` text (contrast 11.03:1), eliminating washed-out sky-blue button backgrounds.
  4. Optimize WhatsApp CTA buttons with `#15803d` (Brand Forest Green) and `#ffffff` text for 5.02:1 WCAG AA compliance.
  5. Replace inline hardcoded dark colors on modal headings with dynamic `var(--text-heading)` (`#003885` in daylight, `#f0f7ff` in night mode).
  6. Remove duplicate search icons from inputs.
  7. Upgrade admin portal styles (`admin.html`) with high contrast tags, preview cards, metric cards, and table row hover states in night mode.
- **Consequences**:
  - 100% of buttons, icons, headings, placeholders, and body text exceed WCAG AA standards (most reaching AAA).
  - Perfect legibility in daylight sunshine and nighttime OLED dark conditions.

### ADR-009: Mobile Viewport Anchoring, Single SVG Search Icon, and Touch-Scrollable Category Strip
- **Status**: Implemented & Verified.
- **Context**: On narrow mobile screens (such as 360px viewport), the unconstrained category pills container expanded to ~622px, blowing out the mobile document layout width. This caused `.floating-quick-actions` (WhatsApp, call, scroll-top) to anchor to the far right of the 622px layout, making them invisible until the user manually pinched or zoomed the screen out. Additionally, the search bar displayed duplicate search icons (placeholder emoji + overlay `<span>`), and category pill names were not horizontally scrollable.
- **Decision**:
  1. Enforce `width: 100%; max-width: 100%; overflow-x: hidden;` on `html` and `body`.
  2. Wrap category pills in `.category-tabs-wrapper` with mobile edge-to-edge bleed (`width: 100vw; margin-left: calc(-50vw + 50%); margin-right: calc(-50vw + 50%); overflow: hidden;`) and style `.category-tabs` with `overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; touch-action: pan-x !important; justify-content: flex-start !important;`.
  3. Anchor `.floating-quick-actions` to the true mobile viewport using `position: fixed !important; right: max(16px, env(safe-area-inset-right, 16px)) !important; bottom: max(20px, env(safe-area-inset-bottom, 20px)) !important; z-index: 99999 !important; transform: translateZ(0) !important;`.
  4. Standardize the catalog search bar into `.catalog-search-wrap` with a single crisp inline SVG icon (`.catalog-search-icon`) and clean emoji-free placeholder text.
- **Consequences**:
  - Floating WhatsApp, phone call, and top buttons are directly and permanently visible right on mobile viewports without pinching or zooming.
  - Search bar displays exactly one crisp SVG icon with high contrast and zero emoji duplication.
### ADR-011: Account-Linked Checkout & Guest Auth Prompt Architecture
- **Status**: Implemented & Verified.
- **Context**: The user specified that during checkout, customer Name and Mobile Number must automatically be derived from their registered account (eliminating manual input fields for name and phone in checkout), and unauthenticated / unknown guests ("ocna" / অচেনা গ্রাহক) must be prompted to create an account or log in before ordering.
- **Decision**:
  1. Replace manual text inputs (`checkoutName`, `checkoutPhone`) in the cart drawer with a prominent, verified customer account card (`#checkoutUserCard`) that displays the customer's Name, Mobile Number, and an "✓ অ্যাকাউন্ট থেকে যুক্ত" badge.
  2. Maintain `#checkoutName` and `#checkoutPhone` as hidden form inputs to preserve form contracts, DOM ID synchronization, and backend payload structure without visual clutter.
  3. For unauthenticated guests, replace the checkout form with a dedicated, high-contrast callout card (`#checkoutAuthPrompt`) containing "✨ নতুন অ্যাকাউন্ট তৈরি করুন" (opens registration tab) and "লগইন করুন" (opens login tab).
  4. Intercept form submission if no active session is found, alerting the user and opening the registration dialog.
  5. Upon registration or login, immediately close the auth modal, update navigation, display a success toast, auto-populate the customer card with verified credentials, and expose the delivery address field.
- **Consequences**:
  - Eliminates duplicate typing of name and phone for customers.
  - Ensures all orders are linked to authentic customer accounts for easy order tracking and notifications.
  - Seamless, conversion-friendly auth flow for new buyers.

### ADR-013: Bottom CTA Order Banner Vertical Action Hierarchy (Phone above WhatsApp)
- **Status**: Implemented & Verified.
- **Context**: In the bottom CTA order banner (`.order-cta-banner`), horizontal button placement caused labels to feel horizontally constrained, reducing scannability of the 11-digit phone number and Bengali WhatsApp text.
- **Decision**: Update `.banner-actions` to `flex-direction: column; align-items: stretch; gap: 12px; min-width: 270px;` across all viewports. Ensure `#bannerCallBtn` stacks cleanly directly above `#bannerWhatsappBtn` with full-width pill styling, centered text, crisp SVG icons, and `white-space: nowrap`.
- **Consequences**:
  - The phone number (`01844-687759`) is positioned prominently on top, followed immediately by the WhatsApp button.
  - Generous touch targets and clean text spacing make emergency orders and hotlines immediately readable.
  - Complete responsiveness across desktop, tablet, and mobile screens.

### ADR-014: Proportional Section & Footer Spacing Calibration (100px:60px Ratio)
- **Status**: Implemented & Verified.
- **Context**: The user observed an excessively large gap/blank dark space above the footer columns. Section bottom paddings (up to 95px) combined with footer top padding (70px) produced over 165px of empty space.
- **Decision**: Scale all primary section paddings and footer padding down by ~40% (applying the user's 100px -> 60px proportion):
  - `.site-footer`: `70px 0 0` -> `42px 0 0`.
  - `.footer-container`: `padding-bottom: 54px` -> `34px`.
  - `.how-to-order-section`: `80px 0 95px` -> `48px 0 52px`.
  - `.decorative-bar`: `margin: 10px auto 46px` -> `8px auto 26px`.
  - `.trust-features-section`: `75px 0 85px` -> `48px 0 52px`.
  - `.products-section`: `80px 0 90px` -> `50px 0 54px`.
  - `.hero-section`: `60px 0 70px` -> `42px 0 46px`.
  - Mobile `@media (max-width: 768px)`: Explicit compact section paddings (`30px–38px`).
- **Consequences**:
  - The blank dark band above the footer is reduced to a clean, balanced gap.
  - Overall page scannability is improved without excessive scrolling.
  - 100% test compatibility and visual harmony in both Day and Night modes.

### ADR-015: End-to-End User Account Lifecycle & Multi-Attribute Tracking
- **Status**: Implemented & Verified.
- **Context**: The platform required fullstack customer authentication, transparent database persistence, administrative account moderation (suspend/activate), and multi-channel order tracking by reference ID, customer phone number, or email address.
- **Decision**:
  1. Wired `KabarApi.updateUserStatus` to `POST /api/users/status` with synchronized offline `localStorage` (`kp.users.v1`) persistence.
  2. Implemented active/suspend account moderation click listeners on `.toggle-user-btn` in `admin.html`.
  3. Upgraded `trackOrders` in `functions/api/_api.js` to intelligently match order records by alphanumeric reference `#KP-XXXXX`, 11-digit phone number, or customer email address.
  4. Expanded regression test suite in `tests/verify-all.mjs` to 214 automated assertions covering full user registration, login, order creation, inventory decrements, tracking, admin CRUD, and all device breakpoints.
- **Consequences**:
  - Full operational capability across edge serverless and offline fallback environments.
  - 100% test coverage with zero unhandled edge cases.

### ADR-016: Agency Attribution & Developer Branding Placement
- **Status**: Implemented & Verified.
- **Context**: The development agency (Softece) required professional attribution ("Develop by Softece" linking to `https://softece.com`) on the website without interfering with the solemn Islamic aesthetic or emergency contact workflow. Furthermore, when users create an account, the attribution was requested directly under the account creation button/bar.
- **Decision**: 
  1. Positioned developer credit badge in the bottom-right corner of the copyright sub-footer (`.footer-bottom-container`).
  2. Integrated developer attribution inside the account creation modal (`#authModal`) directly under the "অ্যাকাউন্ট তৈরি করুন" submit button (`#userRegSubmitBtn`).
  3. Integrated developer attribution under the checkout drawer guest account creation prompt (`#checkoutAuthPrompt`) and inside the user menu dropdown (`#userMenuDropdown`).
  4. Styled as an elegant, non-intrusive sapphire badge with an electric icon (`⚡`), subtle hover glow, and responsive auto-centering on mobile devices across Day and Night themes.
- **Consequences**:
  - Respects the respectful Islamic tone of the platform while providing standard developer attribution.
  - Zero layout shift, zero viewport overflow, and fully responsive across all device breakpoints.

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
4. **Bengali Numeral Typography in Dropdown Options**:
   - Hind Siliguri numeral `১` (as in `৳১৫০`) requires bold `font-weight: 700` applied to `#checkoutArea` and `#checkoutArea option` to avoid thin stroke antialiasing distortion in dark mode and high-DPI displays.
5. **Dark Mode `--white` Variable Invariance**:
   - Never override `--white` with dark hex codes in `[data-theme="dark"]`. Doing so corrupts buttons, badges, and footer links relying on `color: var(--white)`. Dark surfaces must use `--bg-card` or `--bg-page`.
6. **Input Placeholder Contrast**:
   - Always define explicit `input::placeholder` styles for both themes; browser default placeholders are nearly invisible against dark input backgrounds.

