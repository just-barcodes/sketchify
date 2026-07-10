export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/** The theme the inline bootstrap placed on `<html>` (defaults to light). */
export function getActiveTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Apply a theme to the document and remember the choice. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore storage failures (e.g. private browsing) */
  }
}
