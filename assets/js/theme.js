/**
 * ============================================================================
 * কবর পথের সামগ্রী — Device/OS Auto Day/Night Theme Engine
 * ============================================================================
 * অটো মোড নীতি (Device Theme Sync):
 *  - ব্যবহারকারীর ফোন বা পিসিতে (Phone/PC) যে মোড সক্রিয় থাকবে, স্বয়ংক্রিয়ভাবে
 *    ঠিক সেই মোডটি ওয়েবসাইটে প্রদর্শিত হবে:
 *      * ফোন/পিসি ডার্ক মোডে থাকলে => ওয়েবসাইট হবে ডার্ক (Dark / Night Mode)
 *      * ফোন/পিসি লাইট মোডে থাকলে => ওয়েবসাইট হবে লাইট (Light / Day Mode)
 *  - ব্যবহারকারী মোবাইল বা পিসির সেটিংসে মোড পরিবর্তন করলে সাথে সাথে রিয়েল-টাইমে
 *    ওয়েবসাইট নিজে থেকেই আপডেট হয়ে যাবে (matchMedia listener)।
 *  - ডার্ক মোডে লোগো অটোমেটিক সাদা ভার্সনে পরিবর্তিত হয়ে উজ্জ্বল দেখাবে।
 *  - কোনো পুরনো localStorage ভ্যালু যাতে ডিভাইস থিমকে ব্লক না করে, তা নিশ্চিত করা হয়েছে।
 * ============================================================================
 */

(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'kp_theme';

  // Always clear any stale manual lock from previous testing
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch (_) {}

  /**
   * Check if user's device (phone or PC) is currently set to dark mode
   */
  function isDeviceDarkMode() {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return !!window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (_) {}
    return false;
  }

  /**
   * Determine resolved theme ('dark' or 'light')
   * Follows phone or computer (OS) system theme
   */
  function resolveTheme() {
    return isDeviceDarkMode() ? 'dark' : 'light';
  }

  /**
   * Automatically swap header & navbar logos to match background contrast
   */
  function updateThemeLogos(resolved) {
    try {
      const logos = document.querySelectorAll('#siteLogoImg, #adminSiteLogoImg, .logo-img');
      logos.forEach(img => {
        if (!img || !img.src) return;
        if (resolved === 'dark') {
          if (img.src.includes('logo-icon-dark-web.png')) {
            img.src = img.src.replace('logo-icon-dark-web.png', 'logo-icon-white-web.png');
          }
        } else {
          if (img.src.includes('logo-icon-white-web.png')) {
            img.src = img.src.replace('logo-icon-white-web.png', 'logo-icon-dark-web.png');
          }
        }
      });
    } catch (_) {}
  }

  /**
   * Apply theme to <html> element, update meta theme-color, and sync logos
   */
  function applyTheme() {
    const resolved = resolveTheme();

    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-mode', 'auto');

    // Update <meta name="theme-color"> for mobile browser address bars
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = resolved === 'dark' ? '#0d0718' : '#451970';

    updateThemeLogos(resolved);
  }

  /**
   * Setup real-time listener for Phone & PC system dark/light changes
   */
  function initTheme() {
    // 1. Initial application based on device OS
    applyTheme();

    // 2. Real-time OS Listener: When phone or PC toggles dark/light mode
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const osChangeHandler = () => {
          applyTheme();
        };

        if (mql.addEventListener) {
          mql.addEventListener('change', osChangeHandler);
        } else if (mql.addListener) {
          mql.addListener(osChangeHandler);
        }
      }
    } catch (_) {}
  }

  // Run immediately to prevent Flash of Unstyled Content (FOUC)
  try {
    const initial = isDeviceDarkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initial);
    document.documentElement.setAttribute('data-theme-mode', 'auto');
  } catch (_) {}

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Export to global scope
  window.KabarTheme = {
    getMode: () => 'auto',
    resolve: resolveTheme,
    isDark: isDeviceDarkMode,
    refresh: applyTheme
  };
})();
