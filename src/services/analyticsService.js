/**
 * Google Analytics Service
 * Tracks events using GA4 via gtag.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

/**
 * Track a custom event
 * @param {string} eventName - Event name
 * @param {Object} params - Event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', eventName, params);
}

/**
 * Track language change event
 * @param {string} fromLang - Previous language code
 * @param {string} toLang - New language code
 */
export function trackLanguageChange(fromLang, toLang) {
  trackEvent('language_change', { from: fromLang, to: toLang });
}

/**
 * Track page view
 * @param {string} pagePath - Page path
 */
export function trackPageView(pagePath) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: pagePath });
}
