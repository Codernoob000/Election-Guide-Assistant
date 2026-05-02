import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES } from '../i18n';
import { trackLanguageChange } from '../services/analyticsService';
import './LanguageSelector.css';

/**
 * @description Component for selecting application language with RTL support
 * @param {Object} props - Component props
 * @param {string} [props.className] - Optional CSS class
 * @returns {JSX.Element} Language selector UI
 */
export default function LanguageSelector({ className }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang =
    SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = useCallback(
    langCode => {
      const prevLang = i18n.language;
      i18n.changeLanguage(langCode);

      const isRtl = RTL_LANGUAGES.includes(langCode);
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', langCode);

      const langMeta = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
      if (langMeta) {
        // Set the script-specific font family to ensure correct character rendering
        // e.g., Noto Sans Arabic for Arabic text
        document.documentElement.style.setProperty('--font-family-script', langMeta.font);
      }

      trackLanguageChange(prevLang, langCode);
      setIsOpen(false);
    },
    [i18n]
  );

  return (
    <div className={`language-selector ${className || ''}`}>
      <button
        id="language-selector-btn"
        className="language-selector__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('accessibility.languageSelector')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="language-selector__flag">{currentLang.flag}</span>
        <span className="language-selector__name">{currentLang.nativeName}</span>
        <span className={`language-selector__arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <>
          <button
            className="language-selector__backdrop"
            onClick={() => setIsOpen(false)}
            aria-label={t('accessibility.closeMenu')}
            type="button"
          />
          <ul
            className="language-selector__dropdown"
            role="listbox"
            aria-label={t('language.select')}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <li key={lang.code} role="option" aria-selected={lang.code === i18n.language}>
                <button
                  className={`language-selector__option ${lang.code === i18n.language ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="language-selector__option-flag">{lang.flag}</span>
                  <span className="language-selector__option-native">{lang.nativeName}</span>
                  <span className="language-selector__option-name">{lang.name}</span>
                  {lang.code === i18n.language && (
                    <span className="language-selector__check">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

LanguageSelector.propTypes = {
  className: PropTypes.string,
};
