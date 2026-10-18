import { useEffect, useState } from 'react';
import { cssVar, resolveTheme, type Theme, type ThemePref } from './themes';

/** Read by the pre-paint script in index.html so the first frame is already themed. */
export const THEME_CACHE_KEY = 'qs.themeVars';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const vars: Record<string, string> = {};
  for (const [role, value] of Object.entries(theme.colors)) vars[cssVar(role)] = value;
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.style.colorScheme = theme.scheme;
  root.dataset.scheme = theme.scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.statusBar);
  try {
    localStorage.setItem(
      THEME_CACHE_KEY,
      JSON.stringify({ vars, scheme: theme.scheme, statusBar: theme.statusBar }),
    );
  } catch {
    /* storage blocked */
  }
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

/** Applies the preferred theme (following the OS when "system") and returns it. */
export function useTheme(pref: ThemePref): Theme {
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  useEffect(() => {
    const q = darkQuery();
    const onChange = () => setSystemDark(q.matches);
    q.addEventListener('change', onChange);
    return () => q.removeEventListener('change', onChange);
  }, []);

  const theme = resolveTheme(pref, systemDark);
  useEffect(() => applyTheme(theme), [theme]);
  return theme;
}
