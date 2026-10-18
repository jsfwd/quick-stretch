/**
 * Theme registry. Every colour in the app comes from one of these roles, so a
 * new theme is one object added to THEMES — TypeScript rejects a theme that
 * leaves a role out, and themes.test.ts checks contrast for every theme.
 */
export type ColorRole =
  | 'bg' // page background
  | 'surface' // thumbnails, inputs, quiet fills
  | 'text'
  | 'muted' // secondary text and icons
  | 'line' // hairline dividers and borders
  | 'accent' // primary buttons, progress, heart, active state
  | 'onAccent' // text/icons drawn on the accent
  | 'accentSoft' // rest/get-ready screen tint, soft highlights
  | 'figure' // stick figures
  | 'danger';

export type Theme = {
  id: string;
  name: string;
  scheme: 'light' | 'dark';
  /** Browser/iOS status bar colour. */
  statusBar: string;
  colors: Record<ColorRole, string>;
};

export const THEMES: Theme[] = [
  {
    id: 'paper',
    name: 'Paper',
    scheme: 'light',
    statusBar: '#ffffff',
    colors: {
      bg: '#ffffff',
      surface: '#f4f4f2',
      text: '#121212',
      muted: '#6c6c66',
      line: '#e7e7e3',
      accent: '#3f6f52',
      onAccent: '#ffffff',
      accentSoft: '#e9f0eb',
      figure: '#121212',
      danger: '#c2410c',
    },
  },
  {
    id: 'ink',
    name: 'Ink',
    scheme: 'dark',
    statusBar: '#0e0e0e',
    colors: {
      bg: '#0e0e0e',
      surface: '#1a1a19',
      text: '#f1f1ee',
      muted: '#8e8e88',
      line: '#262625',
      accent: '#93c2a2',
      onAccent: '#0e0e0e',
      accentSoft: '#131c16',
      figure: '#f1f1ee',
      danger: '#fb923c',
    },
  },
];

export const THEME_BY_ID: Record<string, Theme> = Object.fromEntries(THEMES.map((t) => [t.id, t]));

/** Used when the preference is "system". */
export const DEFAULT_LIGHT = 'paper';
export const DEFAULT_DARK = 'ink';

export type ThemePref = 'system' | string;

export function resolveTheme(pref: ThemePref, systemDark: boolean): Theme {
  if (pref !== 'system' && THEME_BY_ID[pref]) return THEME_BY_ID[pref];
  return THEME_BY_ID[systemDark ? DEFAULT_DARK : DEFAULT_LIGHT];
}

/** camelCase role → CSS custom property, e.g. onAccent → --on-accent. */
export const cssVar = (role: string) => `--${role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
