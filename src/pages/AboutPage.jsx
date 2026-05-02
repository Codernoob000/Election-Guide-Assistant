import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import './AboutPage.css';

/**
 * @description About page detailing the project mission and technology stack
 * @returns {JSX.Element} AboutPage component
 */
export default function AboutPage() {
  const { t } = useTranslation();

  // List of third-party services and APIs used in the project
  const services = [
    { icon: '🤖', name: 'Gemini AI', descKey: 'about.services.gemini' },
    { icon: '🌐', name: 'Google Translate API', descKey: 'about.services.translate' },
    { icon: '🔤', name: 'Google Fonts', descKey: 'about.services.fonts' },
    { icon: '📊', name: 'Google Analytics GA4', descKey: 'about.services.analytics' },
    { icon: '☁️', name: 'Google Cloud Run', descKey: 'about.services.cloudRun' },
    { icon: '🏗️', name: 'Google Cloud Build', descKey: 'about.services.cloudBuild' },
  ];

  return (
    <main className="about-page" id="main-content">
      <div className="about-page__header">
        <h1 className="about-page__title">{t('about.title')}</h1>
      </div>

      <div className="about-sections">
        <section className="about-section">
          <div className="about-section__icon">🎯</div>
          <h2>{t('about.mission.title')}</h2>
          <p>{t('about.mission.description')}</p>
        </section>

        <section className="about-section">
          <div className="about-section__icon">⚡</div>
          <h2>{t('about.technology.title')}</h2>
          <p>{t('about.technology.description')}</p>
        </section>

        <section className="about-section">
          <div className="about-section__icon">🌍</div>
          <h2>{t('about.languages.title')}</h2>
          <p>{t('about.languages.description')}</p>
          <div className="about-languages-grid">
            {SUPPORTED_LANGUAGES.map(lang => (
              <div key={lang.code} className="about-language-badge">
                <span className="about-language-badge__flag">{lang.flag}</span>
                <span className="about-language-badge__name">{lang.nativeName}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section about-section--services">
          <div className="about-section__icon">🔧</div>
          <h2>{t('about.services.title')}</h2>
          <div className="about-services-grid">
            {services.map(svc => (
              <div className="about-service" key={svc.descKey}>
                <span className="about-service__icon">{svc.icon}</span>
                <strong>{svc.name}</strong>
                <span>{t(svc.descKey)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Non-partisan and informational disclaimer */}
      <div className="about-disclaimer">
        <p>{t('about.disclaimer')}</p>
      </div>
    </main>
  );
}
