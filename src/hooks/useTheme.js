import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

/**
 * @description Custom hook to access the theme context
 * @returns {Object} Theme state and toggle function: { theme, toggleTheme }
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
