import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/* ── mocks ── */
const mockSendMessageToGemini = vi.fn();
const mockTranslateText = vi.fn();

vi.mock('dompurify', () => ({ default: { sanitize: (v) => v } }));
vi.mock('../services/geminiService', () => ({
  sendMessageToGemini: (...a) => mockSendMessageToGemini(...a),
}));
vi.mock('../services/translateService', () => ({
  translateText: (...a) => mockTranslateText(...a),
}));

import { useChat } from '../hooks/useChat';

describe('useChat hook (ChatContext logic)', () => {
  beforeEach(() => {
    mockSendMessageToGemini.mockReset();
    mockTranslateText.mockReset();
    mockSendMessageToGemini.mockResolvedValue({ text: 'Bot reply', isOffTopic: false });
    mockTranslateText.mockResolvedValue({ translatedText: 'Respuesta', detectedSourceLang: 'en' });
  });

  /* ── Core Paths ── */
  describe('Core Paths', () => {
    it('initial state has empty messages and loading false', () => {
      const { result } = renderHook(() => useChat('en'));
      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('sendMessage adds user message with role and timestamp', async () => {
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('Hello'); });
      const userMsg = result.current.messages[0];
      expect(userMsg.role).toBe('user');
      expect(userMsg.text).toBe('Hello');
      expect(userMsg.timestamp).toBeInstanceOf(Date);
    });

    it('sendMessage adds bot response after user message', async () => {
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('Hi'); });
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[1].role).toBe('bot');
      expect(result.current.messages[1].text).toBe('Bot reply');
    });

    it('clearChat resets messages to empty array', async () => {
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('Hi'); });
      expect(result.current.messages.length).toBeGreaterThan(0);
      act(() => { result.current.clearChat(); });
      expect(result.current.messages).toEqual([]);
    });

    it('loading is false after sendMessage completes', async () => {
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('Hi'); });
      expect(result.current.isLoading).toBe(false);
    });
  });

  /* ── Edge Cases ── */
  describe('Edge Cases', () => {
    it('error message added when Gemini throws, loading resets', async () => {
      mockSendMessageToGemini.mockRejectedValueOnce(new Error('fail'));
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('Hi'); });
      const err = result.current.messages.find((m) => m.isError);
      expect(err).toBeTruthy();
      expect(err.role).toBe('bot');
      expect(result.current.isLoading).toBe(false);
    });

    it('empty / whitespace input is ignored', async () => {
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('   '); });
      expect(result.current.messages).toEqual([]);
      expect(mockSendMessageToGemini).not.toHaveBeenCalled();
    });

    it('bot message stores originalText from Gemini', async () => {
      const { result } = renderHook(() => useChat('es'));
      await act(async () => { await result.current.sendMessage('Hola'); });
      const bot = result.current.messages.find((m) => m.role === 'bot');
      expect(bot.originalText).toBe('Bot reply');
    });
  });

  /* ── Integration ── */
  describe('Integration', () => {
    it('calls geminiService with growing conversation history', async () => {
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('First'); });
      await act(async () => { await result.current.sendMessage('Second'); });
      const historyArg = mockSendMessageToGemini.mock.calls[1][1];
      expect(historyArg.length).toBeGreaterThan(0);
    });

    it('calls translateService when language is not en', async () => {
      const { result } = renderHook(() => useChat('es'));
      await act(async () => { await result.current.sendMessage('Hi'); });
      expect(mockTranslateText).toHaveBeenCalledWith('Bot reply', 'es', 'en');
    });

    it('does NOT call translateService when language is en', async () => {
      const { result } = renderHook(() => useChat('en'));
      await act(async () => { await result.current.sendMessage('Hi'); });
      expect(mockTranslateText).not.toHaveBeenCalled();
    });

    it('translated response has wasTranslated flag', async () => {
      const { result } = renderHook(() => useChat('es'));
      await act(async () => { await result.current.sendMessage('Hi'); });
      const bot = result.current.messages.find((m) => m.role === 'bot');
      expect(bot.wasTranslated).toBe(true);
      expect(bot.text).toBe('Respuesta');
    });
  });
});
