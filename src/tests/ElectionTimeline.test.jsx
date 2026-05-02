import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TIMELINE_STAGES } from '../data/constants';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

import TimelinePage from '../pages/TimelinePage';

describe('TimelinePage (ElectionTimeline)', () => {
  /* ── Core Paths ── */
  describe('Core Paths', () => {
    it('renders all 8 timeline stages', () => {
      render(<TimelinePage />);
      const expandBtns = screen.getAllByText('timeline.expandBtn');
      expect(expandBtns).toHaveLength(8);
    });

    it('each stage title is visible', () => {
      render(<TimelinePage />);
      TIMELINE_STAGES.forEach(stage => {
        expect(screen.getByText(`timeline.stages.${stage.id}.title`)).toBeInTheDocument();
      });
    });

    it('clicking expand button shows stage details', () => {
      render(<TimelinePage />);
      const firstExpandBtn = screen.getAllByText('timeline.expandBtn')[0];
      fireEvent.click(firstExpandBtn);
      const detailKey = `timeline.stages.${TIMELINE_STAGES[0].id}.details`;
      expect(screen.getByText(detailKey)).toBeInTheDocument();
    });

    it('clicking expanded stage collapses it', () => {
      render(<TimelinePage />);
      const firstExpandBtn = screen.getAllByText('timeline.expandBtn')[0];
      fireEvent.click(firstExpandBtn);
      const detailKey = `timeline.stages.${TIMELINE_STAGES[0].id}.details`;
      expect(screen.getByText(detailKey)).toBeInTheDocument();
      // Now click collapse button (same position, text changed)
      const collapseBtn = screen.getByText('timeline.collapseBtn');
      fireEvent.click(collapseBtn);
      expect(screen.queryByText(detailKey)).not.toBeInTheDocument();
    });
  });

  /* ── Edge Cases ── */
  describe('Edge Cases', () => {
    it('multiple stages can be expanded simultaneously', () => {
      render(<TimelinePage />);
      const expandBtns = screen.getAllByText('timeline.expandBtn');
      fireEvent.click(expandBtns[0]);
      fireEvent.click(expandBtns[1]);
      const detail0 = `timeline.stages.${TIMELINE_STAGES[0].id}.details`;
      const detail1 = `timeline.stages.${TIMELINE_STAGES[1].id}.details`;
      expect(screen.getByText(detail0)).toBeInTheDocument();
      expect(screen.getByText(detail1)).toBeInTheDocument();
    });

    it('each stage shows its period text', () => {
      render(<TimelinePage />);
      TIMELINE_STAGES.forEach(stage => {
        expect(screen.getByText(`timeline.stages.${stage.id}.period`)).toBeInTheDocument();
      });
    });

    it('each stage shows its description', () => {
      render(<TimelinePage />);
      TIMELINE_STAGES.forEach(stage => {
        expect(screen.getByText(`timeline.stages.${stage.id}.description`)).toBeInTheDocument();
      });
    });
  });

  /* ── Integration ── */
  describe('Integration', () => {
    it('exactly 8 stages are rendered from TIMELINE_STAGES data', () => {
      expect(TIMELINE_STAGES).toHaveLength(8);
      render(<TimelinePage />);
      const stageNumbers = ['01', '02', '03', '04', '05', '06', '07', '08'];
      stageNumbers.forEach(num => {
        expect(screen.getByText(num)).toBeInTheDocument();
      });
    });

    it('stage titles use i18n keys matching stage IDs', () => {
      render(<TimelinePage />);
      TIMELINE_STAGES.forEach(stage => {
        const expectedKey = `timeline.stages.${stage.id}.title`;
        expect(screen.getByText(expectedKey)).toBeInTheDocument();
      });
    });

    it('page has correct heading', () => {
      render(<TimelinePage />);
      expect(screen.getByText('timeline.title')).toBeInTheDocument();
    });
  });
});
