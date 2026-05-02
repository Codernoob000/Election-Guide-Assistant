import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import { useTheme } from '../hooks/useTheme';
import './Navbar.css';

/**
 * @description Application navigation bar with theme and language toggles
 * @returns {JSX.Element} Navbar component
 */
export default function Navbar() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/chat', label: t('nav.chat') },
    { to: '/timeline', label: t('nav.timeline') },
    { to: '/checklist', label: t('nav.checklist') },
    { to: '/about', label: t('nav.about') },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo">🗳️</span>
          <span className="navbar__title">{t('app.title')}</span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          <LanguageSelector />
          <button
            id="theme-toggle-btn"
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label={t('accessibility.themeToggle')}
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {/* Toggle between sun and moon icons based on current theme */}
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className="navbar__mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t('accessibility.closeMenu') : t('accessibility.openMenu')}
          >
            <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {};
