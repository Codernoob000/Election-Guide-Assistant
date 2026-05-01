import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    { key: 'chat', icon: '💬', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { key: 'timeline', icon: '📅', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
    { key: 'checklist', icon: '✅', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
    { key: 'multilingual', icon: '🌍', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  ];

  return (
    <main className="home" id="main-content">
      <section className="hero">
        <div className="hero__glow" />
        <div className="hero__content">
          <h1 className="hero__title">{t('home.hero.title')}</h1>
          <p className="hero__description">{t('home.hero.description')}</p>
          <div className="hero__actions">
            <Link to="/chat" className="btn btn--primary" id="hero-cta-btn">
              <span>💬</span> {t('home.hero.cta')}
            </Link>
            <Link to="/timeline" className="btn btn--outline" id="hero-secondary-btn">
              <span>📅</span> {t('home.hero.secondaryCta')}
            </Link>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
          <div className="hero__emoji-float">🗳️</div>
        </div>
      </section>

      <section className="features">
        <h2 className="features__title">{t('home.features.title')}</h2>
        <div className="features__grid">
          {features.map((f) => (
            <div className="feature-card" key={f.key}>
              <div className="feature-card__icon" style={{ background: f.gradient }}>
                {f.icon}
              </div>
              <h3 className="feature-card__title">{t(`home.features.${f.key}.title`)}</h3>
              <p className="feature-card__desc">{t(`home.features.${f.key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="powered-by">
        <p>{t('app.poweredBy')}</p>
      </section>
    </main>
  );
}
