import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TIMELINE_STAGES } from '../data/constants';
import './TimelinePage.css';

/**
 * @description Interactive timeline showing key election stages
 * @returns {JSX.Element} TimelinePage component
 */
export default function TimelinePage() {
  const { t } = useTranslation();
  // State to track which timeline cards are expanded for more details
  const [expanded, setExpanded] = useState({});

  /**
   * @description Toggles the expanded state of a timeline item
   * @param {string} id - The unique ID of the timeline stage
   */
  const toggleExpand = id => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="timeline-page" id="main-content">
      <div className="timeline-page__header">
        <h1 className="timeline-page__title">{t('timeline.title')}</h1>
        <p className="timeline-page__subtitle">{t('timeline.subtitle')}</p>
      </div>

      <div className="timeline">
        {TIMELINE_STAGES.map((stage, index) => (
          <div key={stage.id} className={`timeline__item ${expanded[stage.id] ? 'expanded' : ''}`}>
            <div className="timeline__connector">
              <div className="timeline__dot" style={{ background: stage.color }}>
                <span className="timeline__dot-icon">{stage.icon}</span>
              </div>
              {/* Draw a connecting line between dots, with a gradient transition between colors */}
              {index < TIMELINE_STAGES.length - 1 && (
                <div
                  className="timeline__line"
                  style={{
                    background: `linear-gradient(${stage.color}, ${TIMELINE_STAGES[index + 1].color})`,
                  }}
                />
              )}
            </div>

            <div className="timeline__card">
              <div className="timeline__card-header">
                <div>
                  <span className="timeline__stage-num">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="timeline__card-title">{t(`timeline.stages.${stage.id}.title`)}</h3>
                  <span className="timeline__period" style={{ color: stage.color }}>
                    {t(`timeline.stages.${stage.id}.period`)}
                  </span>
                </div>
              </div>
              <p className="timeline__card-desc">{t(`timeline.stages.${stage.id}.description`)}</p>
              {expanded[stage.id] && (
                <div className="timeline__details">
                  <p>{t(`timeline.stages.${stage.id}.details`)}</p>
                </div>
              )}
              <button
                className="timeline__expand-btn"
                onClick={() => toggleExpand(stage.id)}
                style={{ color: stage.color }}
              >
                {expanded[stage.id] ? t('timeline.collapseBtn') : t('timeline.expandBtn')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
