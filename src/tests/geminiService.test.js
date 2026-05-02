import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('geminiService', () => {
  let sendMessageToGemini;
  let mockFetch;

  beforeEach(async () => {
    vi.resetModules();
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';
    const mod = await import('../services/geminiService.js');
    sendMessageToGemini = mod.sendMessageToGemini;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete import.meta.env.VITE_GEMINI_API_KEY;
  });

  const mockSuccessResponse = (text = 'Test response') => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text }] } }]
      })
    });
  };

  // ── Core Paths ──
  describe('Core Paths', () => {
    it('returns text response from mocked API', async () => {
      mockSuccessResponse('Vote at your local precinct');
      const result = await sendMessageToGemini('How do I vote?');
      expect(result).toEqual({ text: 'Vote at your local precinct', isOffTopic: false });
    });

    it('passes conversation history in the request body', async () => {
      mockSuccessResponse();
      const history = [
        { role: 'user', text: 'Hello' },
        { role: 'model', text: 'Hi there' }
      ];
      await sendMessageToGemini('Follow up', history);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      // system prompt + model ack + 2 history + current = 5
      expect(body.contents).toHaveLength(5);
      expect(body.contents[2]).toEqual({ role: 'user', parts: [{ text: 'Hello' }] });
      expect(body.contents[3]).toEqual({ role: 'model', parts: [{ text: 'Hi there' }] });
    });

    it('uses the correct Gemini model endpoint', async () => {
      mockSuccessResponse();
      await sendMessageToGemini('test');
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('generativelanguage.googleapis.com');
      expect(url).toContain('gemini-flash-latest');
    });
  });

  // ── Edge Cases ──
  describe('Edge Cases', () => {
    it('empty string input does not throw', async () => {
      mockSuccessResponse();
      await expect(sendMessageToGemini('')).resolves.not.toThrow();
    });

    it('returns empty text when API returns empty candidates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ candidates: [] })
      });
      const result = await sendMessageToGemini('test');
      expect(result.text).toBe('');
    });

    it('throws when fetch encounters a network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(sendMessageToGemini('test')).rejects.toThrow('Network error');
    });

    it('throws user-friendly error on non-200 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
      });
      await expect(sendMessageToGemini('test')).rejects.toThrow('Rate limit exceeded');
    });

    it('throws generic error when non-200 has no error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('parse error'))
      });
      await expect(sendMessageToGemini('test')).rejects.toThrow('Gemini API error: 500');
    });

    it('throws when API key is not configured', async () => {
      vi.resetModules();
      delete import.meta.env.VITE_GEMINI_API_KEY;
      const mod = await import('../services/geminiService.js');
      await expect(mod.sendMessageToGemini('test')).rejects.toThrow('Gemini API key not configured');
    });
  });

  // ── Integration ──
  describe('Integration', () => {
    it('system prompt is always present as first message', async () => {
      mockSuccessResponse();
      await sendMessageToGemini('test');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.contents[0].role).toBe('user');
      expect(body.contents[0].parts[0].text).toContain('ElectionBot');
    });

    it('model acknowledgment is second message', async () => {
      mockSuccessResponse();
      await sendMessageToGemini('test');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.contents[1].role).toBe('model');
      expect(body.contents[1].parts[0].text).toContain('ElectionBot');
    });

    it('response extracted correctly from real API shape', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: 'Extracted text' }], role: 'model' },
            finishReason: 'STOP'
          }]
        })
      });
      const result = await sendMessageToGemini('test');
      expect(result.text).toBe('Extracted text');
      expect(result.isOffTopic).toBe(false);
    });

    it('growing conversation history maintained across calls', async () => {
      mockSuccessResponse('First response');
      await sendMessageToGemini('First question', []);

      mockSuccessResponse('Second response');
      const history = [
        { role: 'user', text: 'First question' },
        { role: 'model', text: 'First response' }
      ];
      await sendMessageToGemini('Second question', history);

      const secondBody = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(secondBody.contents).toHaveLength(5);
      expect(secondBody.contents[4].parts[0].text).toBe('Second question');
    });
  });
});
