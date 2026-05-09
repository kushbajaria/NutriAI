import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, ACCENT, GRADIENTS, BLUR, TYPE, FONT, RADIUS, SPACING, SHADOW } from '../constants/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(null); // null = follow system

  const mode = override || systemScheme || 'dark';
  const palette = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = useCallback(() => {
    setOverride(prev => {
      if (prev === null) return mode === 'dark' ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [mode]);

  const setThemeMode = useCallback((m) => {
    setOverride(m === 'system' ? null : m);
  }, []);

  const value = useMemo(() => ({
    mode,
    palette,
    accent: ACCENT,
    gradients: GRADIENTS,
    blur: BLUR,
    type: TYPE,
    font: FONT,
    radius: RADIUS,
    spacing: SPACING,
    shadow: SHADOW,
    toggleTheme,
    setThemeMode,
  }), [mode, palette, toggleTheme, setThemeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
