import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockChangeLanguage = vi.fn();
let currentLanguage = 'en';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
    i18n: {
      get language() {
        return currentLanguage;
      },
      changeLanguage: code => {
        currentLanguage = code;
        mockChangeLanguage(code);
      },
    },
  }),
}));

const mockTrackLanguageChange = vi.fn();
vi.mock('../services/analyticsService', () => ({
  trackLanguageChange: (...a) => mockTrackLanguageChange(...a),
}));

vi.mock('../i18n', () => ({
  SUPPORTED_LANGUAGES: [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '\u{1F1FA}\u{1F1F8}',
      dir: 'ltr',
      font: 'Inter',
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: '\u0939\u093F\u0902\u0926\u0940',
      flag: '\u{1F1EE}\u{1F1F3}',
      dir: 'ltr',
      font: 'Noto Sans Devanagari',
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Espa\u00F1ol',
      flag: '\u{1F1EA}\u{1F1F8}',
      dir: 'ltr',
      font: 'Inter',
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Fran\u00E7ais',
      flag: '\u{1F1EB}\u{1F1F7}',
      dir: 'ltr',
      font: 'Inter',
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629',
      flag: '\u{1F1F8}\u{1F1E6}',
      dir: 'rtl',
      font: 'Noto Sans Arabic',
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: '\u09AC\u09BE\u0982\u09B2\u09BE',
      flag: '\u{1F1E7}\u{1F1E9}',
      dir: 'ltr',
      font: 'Noto Sans Bengali',
    },
    {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Portugu\u00EAs',
      flag: '\u{1F1E7}\u{1F1F7}',
      dir: 'ltr',
      font: 'Inter',
    },
    {
      code: 'zh',
      name: 'Mandarin',
      nativeName: '\u4E2D\u6587',
      flag: '\u{1F1E8}\u{1F1F3}',
      dir: 'ltr',
      font: 'Noto Sans SC',
    },
  ],
  RTL_LANGUAGES: ['ar'],
}));

import LanguageSelector from '../components/LanguageSelector';

const openDropdown = () => {
  const trigger = screen.getByRole('button', { name: /accessibility\.languageSelector/i });
  fireEvent.click(trigger);
};

describe('LanguageSelector', () => {
  beforeEach(() => {
    currentLanguage = 'en';
    mockChangeLanguage.mockClear();
    mockTrackLanguageChange.mockClear();
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
  });

  /* ── Core Paths ── */
  describe('Core Paths', () => {
    it('renders all 8 supported languages in the dropdown', () => {
      render(<LanguageSelector />);
      openDropdown();
      expect(screen.getAllByRole('option')).toHaveLength(8);
    });

    it('selecting es calls i18n.changeLanguage with es', () => {
      render(<LanguageSelector />);
      openDropdown();
      fireEvent.click(screen.getByText('Spanish'));
      expect(mockChangeLanguage).toHaveBeenCalledWith('es');
    });

    it('selecting ar sets document dir to rtl', () => {
      render(<LanguageSelector />);
      openDropdown();
      fireEvent.click(screen.getByText('Arabic'));
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    });

    it('selecting en from ar restores dir to ltr', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      currentLanguage = 'ar';
      render(<LanguageSelector />);
      openDropdown();
      fireEvent.click(screen.getAllByText('English')[0]);
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    });
  });

  /* ── Edge Cases ── */
  describe('Edge Cases', () => {
    it('dropdown closes after selecting a language', () => {
      render(<LanguageSelector />);
      openDropdown();
      expect(screen.getAllByRole('option').length).toBe(8);
      fireEvent.click(screen.getByText('French'));
      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });

    it('clicking backdrop closes the dropdown', () => {
      render(<LanguageSelector />);
      openDropdown();
      expect(screen.getAllByRole('option').length).toBe(8);
      const backdrop = document.querySelector('.language-selector__backdrop');
      fireEvent.click(backdrop);
      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });

    it('sets lang attribute on document element', () => {
      render(<LanguageSelector />);
      openDropdown();
      fireEvent.click(screen.getByText('Spanish'));
      expect(document.documentElement.getAttribute('lang')).toBe('es');
    });

    it('sets CSS custom property for font family', () => {
      render(<LanguageSelector />);
      openDropdown();
      fireEvent.click(screen.getByText('Hindi'));
      const fontProp = document.documentElement.style.getPropertyValue('--font-family-script');
      expect(fontProp).toBe('Noto Sans Devanagari');
    });
  });

  /* ── Integration ── */
  describe('Integration', () => {
    it('language change fires analytics event with from and to params', () => {
      render(<LanguageSelector />);
      openDropdown();
      fireEvent.click(screen.getByText('Spanish'));
      expect(mockTrackLanguageChange).toHaveBeenCalledWith('en', 'es');
    });

    it('trigger button shows current language native name', () => {
      render(<LanguageSelector />);
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('active language shows checkmark in dropdown', () => {
      render(<LanguageSelector />);
      openDropdown();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });
});
