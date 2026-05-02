/**
 * Google Analytics Service
 * Tracks events using GA4 via gtag.
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * @description Initialize Google Analytics script and dataLayer
 * @returns {void}
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID) return;

  // Dynamically load the Google Analytics script
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
 * @description Track a custom event to GA4
 * @param {string} eventName - The name of the event to track
 * @param {Object} [params={}] - Additional event parameters
 * @returns {void}
 */
export function trackEvent(eventName, params = {}) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', eventName, params);
}

/**
 * @description Track when a user changes their interface language
 * @param {string} fromLang - Previous language code
 * @param {string} toLang - New language code
 * @returns {void}
 */
export function trackLanguageChange(fromLang, toLang) {
  trackEvent('language_change', { from: fromLang, to: toLang });
}

/**
 * @description Track a page view event
 * @param {string} pagePath - The URL path of the page viewed
 * @returns {void}
 */
export function trackPageView(pagePath) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: pagePath });
}
