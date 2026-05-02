import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('translateService', () => {
  let translateText;
  let mockFetch;

  beforeEach(async () => {
    vi.resetModules();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY = 'test-translate-key';
    const mod = await import('../services/translateService.js');
    translateText = mod.translateText;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  });

  const mockTranslateResponse = (translatedText, detectedLang = 'en') => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: { translations: [{ translatedText, detectedSourceLanguage: detectedLang }] }
      })
    });
  };

  // ── Core Paths ──
  describe('Core Paths', () => {
    it('translates text to Spanish via API', async () => {
      mockTranslateResponse('Hola mundo');
      const result = await translateText('Hello world', 'es');
      expect(result.translatedText).toBe('Hola mundo');
    });

    it('returns original text without API call when target is en', async () => {
      const result = await translateText('Hello world', 'en');
      expect(result.translatedText).toBe('Hello world');
      expect(result.detectedSourceLang).toBe('en');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('correctly parses API response structure', async () => {
      mockTranslateResponse('Bonjour', 'en');
      const result = await translateText('Hello', 'fr');
      expect(result).toEqual({ translatedText: 'Bonjour', detectedSourceLang: 'en' });
    });
  });

  // ── Edge Cases ──
  describe('Edge Cases', () => {
    it('returns empty string for empty input when target is en', async () => {
      const result = await translateText('', 'en');
      expect(result.translatedText).toBe('');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns original text when target equals source language', async () => {
      const result = await translateText('Hello', 'en', 'en');
      expect(result.translatedText).toBe('Hello');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('falls back to original text on 403 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: { message: 'Forbidden' } })
      });
      const result = await translateText('Hello', 'es');
      expect(result.translatedText).toBe('Hello');
    });

    it('falls back to original text when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await translateText('Hello', 'es');
      expect(result.translatedText).toBe('Hello');
    });

    it('falls back to original text on malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ unexpected: 'structure' })
      });
      const result = await translateText('Hello', 'es');
      expect(result.translatedText).toBe('Hello');
    });

    it('falls back to original text when API key is missing', async () => {
      vi.resetModules();
      delete import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
      const mod = await import('../services/translateService.js');
      const result = await mod.translateText('Hello', 'es');
      expect(result.translatedText).toBe('Hello');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ── Integration ──
  describe('Integration', () => {
    it('never calls fetch when target language is en', async () => {
      await translateText('Any text here', 'en');
      await translateText('Another text', 'en', 'fr');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns translatedText value from successful response', async () => {
      mockTranslateResponse('Puedes registrarte en vote.gov');
      const result = await translateText('You can register at vote.gov', 'es');
      expect(result.translatedText).toBe('Puedes registrarte en vote.gov');
    });

    it('sends correct request body to translation API', async () => {
      mockTranslateResponse('Hola');
      await translateText('Hello', 'es', 'en');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('translation.googleapis.com');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ q: 'Hello', target: 'es', source: 'en', format: 'text' });
    });
  });
});
