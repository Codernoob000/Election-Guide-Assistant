import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { RTL_LANGUAGES, SUPPORTED_LANGUAGES } from './i18n';
import { initGA, trackPageView } from './services/analyticsService';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

import './i18n';

const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const ChecklistPage = lazy(() => import('./pages/ChecklistPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function LoadingFallback() {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner" />
      <span>Loading...</span>
    </div>
  );
}

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

function AppContent() {
  const { i18n, t } = useTranslation();

  /* Set HTML attributes on language change */
  useEffect(() => {
    const lang = i18n.language;
    const isRtl = RTL_LANGUAGES.includes(lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    const langMeta = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    if (langMeta) {
      document.documentElement.style.setProperty('--font-family-script', langMeta.font);
    }
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <PageTracker />
      <a href="#main-content" className="skip-link">
        {t('accessibility.skipToContent')}
      </a>
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/chat"
            element={
              <ErrorBoundary>
                <ChatPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/timeline"
            element={
              <ErrorBoundary>
                <TimelinePage />
              </ErrorBoundary>
            }
          />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
