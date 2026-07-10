import { useCallback, useState } from 'react';
import { applyTheme, getActiveTheme, type Theme } from '../lib/theme.ts';

interface UseThemeResult {
  theme: Theme;
  toggle: () => void;
}

/** Track the active theme and toggle between light and dark, persisting choice. */
export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<Theme>(getActiveTheme);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
