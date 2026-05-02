import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '../hooks/useChat';
import DOMPurify from 'dompurify';
import './ChatPage.css';

/**
 * @description Interactive chat interface for election queries
 * @returns {JSX.Element} ChatPage component
 */
export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const { messages, isLoading, sendMessage, clearChat } = useChat(i18n.language);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Pre-defined question chips for user convenience
  const quickChips = [
    'howToRegister',
    'whatIsElectoralCollege',
    'votingRights',
    'electionDay',
    'absenteeBallot',
    'primaryVsCaucus',
  ];

  // Auto-scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /**
   * @description Handles the chat form submission
   * @param {Event} e - Form submission event
   */
  const handleSubmit = e => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  /**
   * @description Handles clicking on a quick chip
   * @param {string} chipKey - The key for the translated chip text
   */
  const handleChipClick = chipKey => {
    const chipText = t(`chat.quickChips.${chipKey}`);
    sendMessage(chipText);
  };

  return (
    <main className="chat-page" id="main-content">
      <div className="chat-page__container">
        <div className="chat-page__header">
          <h1 className="chat-page__title">{t('chat.title')}</h1>
          {messages.length > 0 && (
            <button
              className="chat-page__clear-btn"
              onClick={clearChat}
              aria-label={t('accessibility.newChat')}
            >
              {t('accessibility.newChat')}
            </button>
          )}
        </div>

        <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome__icon">🗳️</div>
              <p className="chat-welcome__text">{t('chat.welcome')}</p>
              <div className="chat-chips">
                {quickChips.map(chip => (
                  <button
                    key={chip}
                    className="chat-chip"
                    onClick={() => handleChipClick(chip)}
                    disabled={isLoading}
                  >
                    {t(`chat.quickChips.${chip}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              <div className="chat-message__avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
              <div className="chat-message__content">
                {msg.isError ? (
                  <p className="chat-message__error">{t('chat.error')}</p>
                ) : (
                  <div
                    className="chat-message__text"
                    dangerouslySetInnerHTML={{
                      // We sanitize the HTML content to prevent XSS while allowing specific formatting tags
                      __html: DOMPurify.sanitize(msg.text.replace(/\n/g, '<br/>'), {
                        ALLOWED_TAGS: ['br', 'b', 'i', 'strong', 'em', 'p', 'ul', 'ol', 'li'],
                      }),
                    }}
                  />
                )}
                {msg.wasTranslated && (
                  <div className="chat-message__translated-badge">
                    <span className="translated-icon">🌐</span>
                    {t('chat.translatedBy')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message chat-message--bot">
              <div className="chat-message__avatar">🤖</div>
              <div className="chat-message__content">
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            aria-label={t('accessibility.chatInput')}
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            id="chat-send-btn"
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || isLoading}
            aria-label={t('accessibility.sendMessage')}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </main>
  );
}
