import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode } from '../types';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';
import { loadTheme, saveTheme } from '../utils/storage';

interface ThemeContextType {
  themeMode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  colors: typeof LIGHT_COLORS;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initTheme() {
      const savedTheme = await loadTheme();
      if (savedTheme) {
        setThemeModeState(savedTheme);
      }
      setIsLoading(false);
    }
    initTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await saveTheme(mode);
  };

  const effectiveTheme =
    themeMode === 'auto' ? (systemColorScheme ?? 'light') : themeMode;

  const isDark = effectiveTheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  if (isLoading) {
    return null; // Or a loading spinner, but usually handled by app _layout
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        effectiveTheme,
        colors,
        isDark,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
