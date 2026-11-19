export const THEMES = ['indigo', 'terracotta', 'olive'] as const;

export type ThemeName = (typeof THEMES)[number];

export interface ThemeDetails {
  label: string;
  background: string;
}

export const THEME_DETAILS: Record<ThemeName, ThemeDetails> = {
  indigo: { label: 'Indigó', background: '#14121b' },
  terracotta: { label: 'Terrakotta', background: '#14110e' },
  olive: { label: 'Olíva', background: '#12140f' },
};

const STORAGE_KEY = 'receptek-appearance';

export function isThemeName(value: string | null | undefined): value is ThemeName {
  return value === 'indigo' || value === 'terracotta' || value === 'olive';
}

function readStoredTheme(): ThemeName | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemeName(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function getInitialTheme(): ThemeName {
  const fromDom = document.documentElement.dataset.theme;
  return readStoredTheme() ?? (isThemeName(fromDom) ? fromDom : 'indigo');
}

export function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', THEME_DETAILS[theme].background);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private windows and blocked site data can refuse storage.
  }
}
