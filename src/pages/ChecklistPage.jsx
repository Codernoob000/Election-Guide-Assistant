import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CHECKLIST_ITEMS } from '../data/constants';
import './ChecklistPage.css';

const STORAGE_KEY = 'electionbot-checklist';

export default function ChecklistPage() {
  const { t } = useTranslation();

  const [checked, setChecked] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggleItem = useCallback((id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const resetChecklist = useCallback(() => {
    setChecked({});
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <main className="checklist-page" id="main-content">
      <div className="checklist-page__header">
        <h1 className="checklist-page__title">{t('checklist.title')}</h1>
        <p className="checklist-page__subtitle">{t('checklist.subtitle')}</p>
      </div>

      <div className="checklist-progress">
        <div className="checklist-progress__bar">
          <div
            className="checklist-progress__fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="checklist-progress__text">
          {t('checklist.progress', { completed: completedCount, total: totalCount })}
        </p>
      </div>

      <div className="checklist-items">
        {CHECKLIST_ITEMS.map((item) => (
          <label
            key={item.id}
            className={`checklist-item ${checked[item.id] ? 'checked' : ''}`}
            htmlFor={`checklist-${item.id}`}
          >
            <input
              type="checkbox"
              id={`checklist-${item.id}`}
              checked={!!checked[item.id]}
              onChange={() => toggleItem(item.id)}
              className="checklist-item__input"
            />
            <div className="checklist-item__checkbox">
              {checked[item.id] && <span>✓</span>}
            </div>
            <div className="checklist-item__icon">{item.icon}</div>
            <div className="checklist-item__content">
              <h3 className="checklist-item__title">
                {t(`checklist.items.${item.id}.title`)}
              </h3>
              <p className="checklist-item__desc">
                {t(`checklist.items.${item.id}.description`)}
              </p>
            </div>
          </label>
        ))}
      </div>

      {completedCount > 0 && (
        <button className="checklist-reset-btn" onClick={resetChecklist}>
          {t('checklist.resetBtn')}
        </button>
      )}
    </main>
  );
}
