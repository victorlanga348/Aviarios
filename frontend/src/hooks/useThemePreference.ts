import { useEffect, useState } from 'react';

export type ThemePreference = 'dark' | 'light';

const STORAGE_KEY = '@AviarioPro:theme';

const getStoredTheme = (): ThemePreference => {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  return storedTheme === 'light' ? 'light' : 'dark';
};

export function useThemePreference() {
  const [theme, setTheme] = useState<ThemePreference>(getStoredTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
