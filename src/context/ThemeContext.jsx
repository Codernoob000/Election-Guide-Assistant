import { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { THEME_STORAGE_KEY } from '../utils/constants';

/**
 * @description React Context for application-wide theme management
 */
export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

/**
 * @description Provider component that manages theme state and persists it to localStorage
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} ThemeProvider component
 */
export function ThemeProvider({ children }) {
  // Initialize theme from localStorage if available, otherwise default to 'dark'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved || 'dark';
  });

  // Apply theme to the document and save to localStorage whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /**
   * @description Toggles between 'light' and 'dark' themes
   */
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
