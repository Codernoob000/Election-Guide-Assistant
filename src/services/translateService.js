import { TRANSLATE_API_URL } from '../utils/constants';

/**
 * Google Translate API Service
 * Translates chat responses to the user's selected language.
 *
 * WARNING: VITE_ prefixed env vars are exposed in the client bundle.
 * In production, proxy translation calls through a backend to protect the API key.
 */

const TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
// We use the URL from constants.js for consistency and maintainability

/**
 * Translate text to a target language using Google Translate API.
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'hi', 'es')
 * @param {string} [sourceLang='en'] - Source language code
 * @returns {Promise<{translatedText: string, detectedSourceLang: string}>}
 */
export async function translateText(text, targetLang, sourceLang = 'en') {
  if (targetLang === sourceLang || targetLang === 'en') {
    return { translatedText: text, detectedSourceLang: sourceLang };
  }

  if (!TRANSLATE_API_KEY) {
    // If no key is provided, we return the original text to prevent app crash
    return { translatedText: text, detectedSourceLang: sourceLang };
  }

  try {
    const response = await fetch(`${TRANSLATE_API_URL}?key=${TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: sourceLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translation = data.data?.translations?.[0];

    return {
      translatedText: translation?.translatedText || text,
      detectedSourceLang: translation?.detectedSourceLanguage || sourceLang,
    };
  } catch (error) {
    // Wrap console error in dev check as per quality guidelines
    if (import.meta.env.DEV) {
      console.error('Translation error:', error); // eslint-disable-line no-console
    }
    /* Translation failed gracefully — return original text to maintain user experience */
    return { translatedText: text, detectedSourceLang: sourceLang };
  }
}
