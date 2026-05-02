import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';

/* ── Global mocks ── */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('../hooks/useChat', () => ({
  useChat: () => ({
    messages: [
      { id: 1, role: 'user', text: 'Hello', timestamp: new Date() },
      { id: 2, role: 'bot', text: 'Hi there', timestamp: new Date() },
    ],
    isLoading: false,
    sendMessage: vi.fn(),
    clearChat: vi.fn(),
  }),
}));

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

vi.mock('../services/analyticsService', () => ({
  trackLanguageChange: vi.fn(),
  initGA: vi.fn(),
  trackPageView: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock('../i18n', () => ({
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr', font: 'Inter' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', dir: 'ltr', font: 'Noto Sans Devanagari' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr', font: 'Inter' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr', font: 'Inter' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl', font: 'Noto Sans Arabic' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr', font: 'Noto Sans Bengali' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr', font: 'Inter' },
    { code: 'zh', name: 'Mandarin', nativeName: '中文', flag: '🇨🇳', dir: 'ltr', font: 'Noto Sans SC' },
  ],
  RTL_LANGUAGES: ['ar'],
  default: {},
}));

vi.mock('dompurify', () => ({
  default: { sanitize: (v) => v },
}));

import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';
import TimelinePage from '../pages/TimelinePage';
import ChecklistPage from '../pages/ChecklistPage';
import AboutPage from '../pages/AboutPage';
import Navbar from '../components/Navbar';
import LanguageSelector from '../components/LanguageSelector';

/* helper: render with router */
const renderWithRouter = (ui, route = '/') =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);

/* axe helper – disable document-level rules that don't apply to component tests */
const AXE_OPTS = {
  rules: {
    'html-has-lang': { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    region: { enabled: false },
    'color-contrast': { enabled: false },
    'heading-order': { enabled: false }, // app uses h1→h3 by design
  },
};

describe('Accessibility', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // jsdom doesn't implement scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  /* ── h1 per page ── */
  describe('Each page has exactly one h1', () => {
    const pages = [
      { name: 'Home', Component: HomePage, needsRouter: true },
      { name: 'Chat', Component: ChatPage, needsRouter: false },
      { name: 'Timeline', Component: TimelinePage, needsRouter: false },
      { name: 'Checklist', Component: ChecklistPage, needsRouter: false },
      { name: 'About', Component: AboutPage, needsRouter: false },
    ];

    pages.forEach(({ name, Component, needsRouter }) => {
      it(`${name} page has exactly one h1`, () => {
        if (needsRouter) {
          renderWithRouter(<Component />);
        } else {
          render(<Component />);
        }
        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings).toHaveLength(1);
      });
    });
  });

  /* ── ARIA attributes ── */
  describe('ARIA attributes', () => {
    it('ChatPage message container has aria-live="polite"', () => {
      render(<ChatPage />);
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).not.toBeNull();
    });

    it('LanguageSelector trigger has aria-label', () => {
      render(<LanguageSelector />);
      const trigger = screen.getByRole('button', { name: /accessibility\.languageSelector/i });
      expect(trigger).toHaveAttribute('aria-label');
    });

    it('LanguageSelector trigger has aria-expanded', () => {
      render(<LanguageSelector />);
      const trigger = screen.getByRole('button', { name: /accessibility\.languageSelector/i });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('LanguageSelector trigger has aria-haspopup', () => {
      render(<LanguageSelector />);
      const trigger = screen.getByRole('button', { name: /accessibility\.languageSelector/i });
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('Navbar has role="navigation"', () => {
      renderWithRouter(<Navbar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('Navbar navigation has aria-label', () => {
      renderWithRouter(<Navbar />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });
  });

  /* ── Checklist labels ── */
  describe('Checklist accessibility', () => {
    it('every checkbox has an associated label element', () => {
      render(<ChecklistPage />);
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((cb) => {
        expect(cb.id).toBeTruthy();
        const label = document.querySelector(`label[for="${cb.id}"]`);
        expect(label).not.toBeNull();
      });
    });
  });

  /* ── axe automated checks ── */
  describe('axe-core automated checks', () => {
    const pages = [
      { name: 'Home', Component: HomePage, needsRouter: true },
      { name: 'Chat', Component: ChatPage, needsRouter: false },
      { name: 'Timeline', Component: TimelinePage, needsRouter: false },
      { name: 'Checklist', Component: ChecklistPage, needsRouter: false },
      { name: 'About', Component: AboutPage, needsRouter: false },
    ];

    pages.forEach(({ name, Component, needsRouter }) => {
      it(`${name} page has no axe violations`, async () => {
        const { container } = needsRouter
          ? renderWithRouter(<Component />)
          : render(<Component />);
        const results = await axe.run(container, AXE_OPTS);
        expect(results.violations).toHaveLength(0);
      });
    });
  });
});
