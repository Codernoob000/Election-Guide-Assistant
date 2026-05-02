import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CHECKLIST_ITEMS } from '../data/constants';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, params) => (params ? `${key}|${JSON.stringify(params)}` : key),
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

import ChecklistPage from '../pages/ChecklistPage';

describe('ChecklistPage (VoterChecklist)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  /* ── Core Paths ── */
  describe('Core Paths', () => {
    it('renders all 8 checklist items', () => {
      render(<ChecklistPage />);
      CHECKLIST_ITEMS.forEach((item) => {
        expect(screen.getByText(`checklist.items.${item.id}.title`)).toBeInTheDocument();
      });
    });

    it('clicking unchecked item marks it checked', () => {
      render(<ChecklistPage />);
      const firstCheckbox = screen.getByRole('checkbox', { name: /checklist\.items\.registration/i });
      expect(firstCheckbox.checked).toBe(false);
      fireEvent.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(true);
    });

    it('clicking checked item unchecks it', () => {
      render(<ChecklistPage />);
      const firstCheckbox = screen.getByRole('checkbox', { name: /checklist\.items\.registration/i });
      fireEvent.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(true);
      fireEvent.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(false);
    });

    it('progress text updates when items are checked', () => {
      render(<ChecklistPage />);
      expect(screen.getByText(/\"completed\":0/)).toBeInTheDocument();
      const firstCheckbox = screen.getByRole('checkbox', { name: /checklist\.items\.registration/i });
      fireEvent.click(firstCheckbox);
      expect(screen.getByText(/\"completed\":1/)).toBeInTheDocument();
    });

    it('reset button appears when at least one item is checked', () => {
      render(<ChecklistPage />);
      expect(screen.queryByText('checklist.resetBtn')).not.toBeInTheDocument();
      const firstCheckbox = screen.getByRole('checkbox', { name: /checklist\.items\.registration/i });
      fireEvent.click(firstCheckbox);
      expect(screen.getByText('checklist.resetBtn')).toBeInTheDocument();
    });
  });

  /* ── Edge Cases ── */
  describe('Edge Cases', () => {
    it('saves checked state to sessionStorage', () => {
      render(<ChecklistPage />);
      const firstCheckbox = screen.getByRole('checkbox', { name: /checklist\.items\.registration/i });
      fireEvent.click(firstCheckbox);
      const stored = JSON.parse(sessionStorage.getItem('electionbot-checklist'));
      expect(stored.registration).toBe(true);
    });

    it('loads checked state from sessionStorage on mount', () => {
      sessionStorage.setItem('electionbot-checklist', JSON.stringify({ registration: true, id: true }));
      render(<ChecklistPage />);
      const regCheckbox = screen.getByRole('checkbox', { name: /checklist\.items\.registration/i });
      expect(regCheckbox.checked).toBe(true);
    });

    it('reset button clears all checked items', () => {
      render(<ChecklistPage />);
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((cb) => fireEvent.click(cb));
      const resetBtn = screen.getByText('checklist.resetBtn');
      fireEvent.click(resetBtn);
      checkboxes.forEach((cb) => expect(cb.checked).toBe(false));
    });
  });

  /* ── Integration ── */
  describe('Integration', () => {
    it('item labels use i18n translation keys', () => {
      render(<ChecklistPage />);
      CHECKLIST_ITEMS.forEach((item) => {
        expect(screen.getByText(`checklist.items.${item.id}.title`)).toBeInTheDocument();
        expect(screen.getByText(`checklist.items.${item.id}.description`)).toBeInTheDocument();
      });
    });

    it('progress shows total matching CHECKLIST_ITEMS length', () => {
      render(<ChecklistPage />);
      expect(screen.getByText(new RegExp(`"total":${CHECKLIST_ITEMS.length}`))).toBeInTheDocument();
    });

    it('page has correct heading', () => {
      render(<ChecklistPage />);
      expect(screen.getByText('checklist.title')).toBeInTheDocument();
    });
  });
});
