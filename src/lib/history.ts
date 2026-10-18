import { useSyncExternalStore } from 'react';
import type { RoutineSource } from './routine';

export type HistoryStretch = {
  id: string;
  name: string;
  /** False if the stretch was skipped before its timer finished. */
  completed: boolean;
};

export type HistoryEntry = {
  id: string;
  completedAt: number;
  name: string;
  /** Time actually spent moving (excludes pauses and skipped time), in seconds. */
  durationSec: number;
  roundSec: number;
  stretches: HistoryStretch[];
  hearted: boolean;
};

const KEY = 'qs.history';
/** Keep the newest N un-hearted entries; hearted ones are never dropped. */
const MAX_UNHEARTED = 200;

let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function load(): HistoryEntry[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function save(next: HistoryEntry[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked — keep in memory for this visit */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current sessions, newest first (non-reactive). */
export const getHistory = load;

/** All sessions, newest first. */
export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, load, () => []);
}

export function addHistory(entry: Omit<HistoryEntry, 'id' | 'completedAt' | 'hearted'>): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    completedAt: Date.now(),
    hearted: false,
  };
  let unhearted = 0;
  const next = [full, ...load()].filter((e) => e.hearted || ++unhearted <= MAX_UNHEARTED);
  save(next);
  return full;
}

export function toggleHeart(id: string) {
  save(load().map((e) => (e.id === id ? { ...e, hearted: !e.hearted } : e)));
}

export const MAX_NAME_LENGTH = 40;

export function renameHistory(id: string, name: string) {
  const clean = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!clean) return;
  save(load().map((e) => (e.id === id ? { ...e, name: clean } : e)));
}

export function deleteHistory(id: string) {
  save(load().filter((e) => e.id !== id));
}

export function formatWhen(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  const sameYear = d.getFullYear() === today.getFullYear();
  const date = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
  return `${date}, ${time}`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m} min${s ? ` ${s}s` : ''}` : `${s}s`;
}

/** Rebuild the exact routine from a past session (same stretches and round length). */
export function savedSource(entry: HistoryEntry): RoutineSource {
  return {
    kind: 'saved',
    name: entry.name,
    exerciseIds: entry.stretches.map((s) => s.id),
    roundSec: entry.roundSec,
  };
}
