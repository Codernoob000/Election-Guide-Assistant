import { useState, useCallback, useRef } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { translateText } from '../services/translateService';
import DOMPurify from 'dompurify';

/**
 * Custom hook for managing chat state and interactions
 * @param {string} currentLang - Current language code
 * @returns {Object} Chat state and handlers
 */
export function useChat(currentLang) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationRef = useRef([]);

  const sanitizeInput = useCallback((input) => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }, []);

  const sendMessage = useCallback(async (rawText) => {
    const text = sanitizeInput(rawText.trim());
    if (!text) return;

    const userMessage = { id: Date.now(), role: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    conversationRef.current.push({ role: 'user', text });
    setIsLoading(true);

    try {
      const { text: responseText } = await sendMessageToGemini(text, conversationRef.current.slice(0, -1));

      let displayText = responseText;
      let wasTranslated = false;

      if (currentLang !== 'en' && responseText) {
        const { translatedText } = await translateText(responseText, currentLang, 'en');
        if (translatedText !== responseText) {
          displayText = translatedText;
          wasTranslated = true;
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: displayText,
        originalText: responseText,
        wasTranslated,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      conversationRef.current.push({ role: 'model', text: responseText });
    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: '',
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLang, sanitizeInput]);

  const clearChat = useCallback(() => {
    setMessages([]);
    conversationRef.current = [];
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
}
