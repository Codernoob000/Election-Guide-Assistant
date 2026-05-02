import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';

/* ── jsdom compat ── */
Element.prototype.scrollIntoView = vi.fn();

/* ── MSW lifecycle ── */
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/* ── Service mocks (more reliable than MSW for import.meta.env gating) ── */
const mockSendMessageToGemini = vi.fn();
const mockTranslateText = vi.fn();

vi.mock('../../services/geminiService', () => ({
  sendMessageToGemini: (...args) => mockSendMessageToGemini(...args),
}));

vi.mock('../../services/translateService', () => ({
  translateText: (...args) => mockTranslateText(...args),
}));

vi.mock('dompurify', () => ({
  default: { sanitize: v => v },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const map = {
        'chat.title': 'ElectionBot Chat',
        'chat.placeholder': 'Ask about elections...',
        'chat.welcome': 'Welcome! Ask me about elections.',
        'chat.error': 'Sorry, something went wrong.',
        'chat.translatedBy': 'Translated by Google',
        'accessibility.chatInput': 'Chat input',
        'accessibility.sendMessage': 'Send message',
        'accessibility.newChat': 'New chat',
      };
      return map[key] || key;
    },
    i18n: { language: 'es', changeLanguage: vi.fn() },
  }),
}));

import ChatPage from '../../pages/ChatPage';

describe('Chat Flow Integration', () => {
  beforeEach(() => {
    mockSendMessageToGemini.mockReset();
    mockTranslateText.mockReset();
    mockSendMessageToGemini.mockResolvedValue({
      text: 'You can register to vote at vote.gov',
      isOffTopic: false,
    });
    mockTranslateText.mockResolvedValue({
      translatedText: 'Puedes registrarte para votar en vote.gov',
      detectedSourceLang: 'en',
    });
  });

  /* ── Scenario 1: Successful multilingual chat ── */
  describe('Scenario 1 — Successful multilingual chat', () => {
    it('renders Spanish translated response with translated badge', async () => {
      render(<ChatPage />);
      const input = screen.getByPlaceholderText('Ask about elections...');
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      await userEvent.type(input, 'How do I register to vote?');
      await userEvent.click(sendBtn);

      await waitFor(() => {
        expect(screen.getByText('Puedes registrarte para votar en vote.gov')).toBeInTheDocument();
      });

      expect(screen.getByText('Translated by Google')).toBeInTheDocument();

      // user msg + bot msg = 2
      const userMsg = screen.getByText('How do I register to vote?');
      const botMsg = screen.getByText('Puedes registrarte para votar en vote.gov');
      expect(userMsg).toBeInTheDocument();
      expect(botMsg).toBeInTheDocument();
    });

    it('calls gemini then translate in sequence', async () => {
      render(<ChatPage />);
      const input = screen.getByPlaceholderText('Ask about elections...');
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      await userEvent.type(input, 'Test question');
      await userEvent.click(sendBtn);

      await waitFor(() => {
        expect(mockSendMessageToGemini).toHaveBeenCalledTimes(1);
        expect(mockTranslateText).toHaveBeenCalledTimes(1);
      });
    });
  });

  /* ── Scenario 2: Input validation (rate limiting guard) ── */
  describe('Scenario 2 — Input validation', () => {
    it('empty input does not trigger API call', async () => {
      render(<ChatPage />);
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      // Send button should be disabled when input is empty
      expect(sendBtn).toBeDisabled();
      expect(mockSendMessageToGemini).not.toHaveBeenCalled();
    });

    it('input is disabled while loading', async () => {
      // Make gemini hang to simulate loading
      mockSendMessageToGemini.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve({ text: 'ok', isOffTopic: false }), 500))
      );

      render(<ChatPage />);
      const input = screen.getByPlaceholderText('Ask about elections...');
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      await userEvent.type(input, 'Test');
      await userEvent.click(sendBtn);

      // During loading, input should be disabled
      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });

  /* ── Scenario 3: Off-topic rejection ── */
  describe('Scenario 3 — Off-topic redirect', () => {
    it('displays redirect response as normal bot message', async () => {
      mockSendMessageToGemini.mockResolvedValueOnce({
        text: 'I can only help with election-related questions. Please ask about voting!',
        isOffTopic: false,
      });
      mockTranslateText.mockResolvedValueOnce({
        translatedText: 'Solo puedo ayudar con preguntas sobre elecciones.',
        detectedSourceLang: 'en',
      });

      render(<ChatPage />);
      const input = screen.getByPlaceholderText('Ask about elections...');
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      await userEvent.type(input, 'What is the weather?');
      await userEvent.click(sendBtn);

      await waitFor(() => {
        expect(
          screen.getByText('Solo puedo ayudar con preguntas sobre elecciones.')
        ).toBeInTheDocument();
      });

      // No error state shown
      expect(screen.queryByText('Sorry, something went wrong.')).not.toBeInTheDocument();
    });
  });

  /* ── Scenario 4: API failure recovery ── */
  describe('Scenario 4 — API failure recovery', () => {
    it('shows error message when Gemini throws', async () => {
      mockSendMessageToGemini.mockRejectedValueOnce(new Error('Network error'));

      render(<ChatPage />);
      const input = screen.getByPlaceholderText('Ask about elections...');
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      await userEvent.type(input, 'How do I vote?');
      await userEvent.click(sendBtn);

      await waitFor(() => {
        expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument();
      });
    });

    it('input re-enables after error so user can retry', async () => {
      mockSendMessageToGemini.mockRejectedValueOnce(new Error('Network error'));

      render(<ChatPage />);
      const input = screen.getByPlaceholderText('Ask about elections...');
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      await userEvent.type(input, 'How do I vote?');
      await userEvent.click(sendBtn);

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });

    it('user can submit again after a failure', async () => {
      mockSendMessageToGemini
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ text: 'Recovery response', isOffTopic: false });
      mockTranslateText.mockResolvedValueOnce({
        translatedText: 'Respuesta de recuperación',
        detectedSourceLang: 'en',
      });

      render(<ChatPage />);
      const input = screen.getByPlaceholderText('Ask about elections...');
      const sendBtn = screen.getByRole('button', { name: 'Send message' });

      // First attempt fails
      await userEvent.type(input, 'First attempt');
      await userEvent.click(sendBtn);
      await waitFor(() => {
        expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument();
      });

      // Second attempt succeeds
      await userEvent.type(input, 'Second attempt');
      await userEvent.click(sendBtn);
      await waitFor(() => {
        expect(screen.getByText('Respuesta de recuperación')).toBeInTheDocument();
      });
    });
  });
});
