import { useCallback, useState } from 'react';
import { clampCount, DEFAULT_COUNT, ROUND_OPTIONS, type RoundSec } from './routine';
import { THEME_BY_ID, type ThemePref } from '../theme/themes';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage blocked */
  }
}

export type Settings = {
  sound: boolean;
  voice: boolean;
  /** Chosen speech voice; empty means pick automatically. */
  voiceURI: string;
  /** Seconds per exercise. */
  roundSec: RoundSec;
  /** Exercises per session. */
  count: number;
  /** 'system' follows the device; otherwise a theme id. */
  theme: ThemePref;
};
const SETTINGS_KEY = 'qs.settings';
const DEFAULT_SETTINGS: Settings = {
  sound: true,
  voice: true,
  voiceURI: '',
  roundSec: 60,
  count: DEFAULT_COUNT,
  theme: 'system',
};

function sanitize(s: Settings): Settings {
  return {
    ...s,
    roundSec: ROUND_OPTIONS.includes(s.roundSec) ? s.roundSec : DEFAULT_SETTINGS.roundSec,
    count: clampCount(Number(s.count)),
    theme: s.theme === 'system' || THEME_BY_ID[s.theme] ? s.theme : 'system',
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => sanitize(read(SETTINGS_KEY, DEFAULT_SETTINGS)));
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = sanitize({ ...prev, ...patch });
      write(SETTINGS_KEY, next);
      return next;
    });
  }, []);
  return [settings, update] as const;
}
