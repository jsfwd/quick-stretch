import { EXERCISES, EXERCISE_BY_ID, type Exercise, type Focus } from '../data/exercises';
import type { Preset } from '../data/presets';

export type Routine = {
  name: string;
  exercises: Exercise[];
};

export const READY_SEC = 5;
export const REST_SEC = 10;

export const ROUND_OPTIONS = [30, 45, 60] as const;
export type RoundSec = (typeof ROUND_OPTIONS)[number];
export const MIN_COUNT = 3;
export const MAX_COUNT = 10;
export const DEFAULT_COUNT = 5;

export type SessionOptions = { roundSec: RoundSec; count: number };

/** What a routine is built from; rebuilt whenever session options change. */
export type RoutineSource =
  | { kind: 'preset'; preset: Preset }
  | { kind: 'random'; seed: number }
  /** Replay of a hearted session: exact stretches and round length, ignoring session options. */
  | { kind: 'saved'; name: string; exerciseIds: string[]; roundSec: number };

export function clampCount(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_COUNT;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(n)));
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2_147_483_646) + 1;
}

/** Deterministic PRNG so a random routine stays the same while its options are tweaked. */
export function seededRandom(seed: number): () => number {
  let s = seed % 2_147_483_647 || 1;
  return () => {
    s = (s * 16807) % 2_147_483_647;
    return (s - 1) / 2_147_483_646;
  };
}

export function buildRoutine(source: RoutineSource, opts: SessionOptions): Routine {
  if (source.kind === 'saved') {
    return {
      name: source.name,
      exercises: source.exerciseIds
        .map((id) => EXERCISE_BY_ID[id])
        .filter(Boolean)
        .map((e) => ({ ...e, durationSec: source.roundSec })),
    };
  }
  const count = clampCount(opts.count);
  const base =
    source.kind === 'preset'
      ? { name: source.preset.name, exercises: fitPreset(source.preset, count) }
      : buildRandomRoutine(count, seededRandom(source.seed));
  return {
    ...base,
    exercises: base.exercises.map((e) => ({ ...e, durationSec: opts.roundSec })),
  };
}

/**
 * Resize a preset to `count` moves while keeping its theme: trimming drops
 * moves from the middle (the closer stays last); extending adds the exercises
 * that best match the preset's focus areas, just before the closer.
 */
export function fitPreset(preset: Preset, count: number): Exercise[] {
  const base = preset.exerciseIds.map((id) => EXERCISE_BY_ID[id]).filter(Boolean);
  if (base.length === 0) return [];
  const closer = base[base.length - 1];
  const body = base.slice(0, -1);

  if (count <= base.length) return [...body.slice(0, count - 1), closer];

  const weight = new Map<Focus, number>();
  for (const e of base) for (const f of e.focus) weight.set(f, (weight.get(f) ?? 0) + 1);
  const extras = EXERCISES.filter((e) => !base.includes(e))
    .map((e, i) => ({ e, i, score: e.focus.reduce((s, f) => s + (weight.get(f) ?? 0), 0) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, count - base.length)
    .map((x) => x.e);

  return [...body, ...extras, closer];
}

export function buildPreset(preset: Preset): Routine {
  return { name: preset.name, exercises: fitPreset(preset, preset.exerciseIds.length) };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` unique exercises: a gentle opener first, then favour
 * exercises whose primary focus hasn't been covered yet.
 */
export function buildRandomRoutine(count = DEFAULT_COUNT, rand: () => number = Math.random): Routine {
  const pool = shuffle(EXERCISES, rand);
  const opener = pool.find((e) => e.gentle) ?? pool[0];
  const picked: Exercise[] = [opener];
  const covered = new Set([opener.focus[0]]);
  let remaining = pool.filter((e) => e !== opener);

  while (picked.length < count && remaining.length > 0) {
    const next = remaining.find((e) => !covered.has(e.focus[0])) ?? remaining[0];
    picked.push(next);
    // Once every focus area is covered, start a fresh round of variety.
    if (remaining.every((e) => covered.has(e.focus[0]))) covered.clear();
    covered.add(next.focus[0]);
    remaining = remaining.filter((e) => e !== next);
  }

  return { name: 'Random Quick Routine', exercises: picked };
}

export function totalDurationSec(routine: Routine): number {
  return buildSteps(routine).reduce((s, step) => s + step.durationSec, 0);
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export type StepKind = 'ready' | 'work' | 'rest';
export type Step = { kind: StepKind; exIndex: number; durationSec: number };

/** ready → work → rest(next) → work → … → work */
export function buildSteps(routine: Routine): Step[] {
  const steps: Step[] = [];
  routine.exercises.forEach((ex, i) => {
    steps.push(
      i === 0
        ? { kind: 'ready', exIndex: 0, durationSec: READY_SEC }
        : { kind: 'rest', exIndex: i, durationSec: REST_SEC },
    );
    steps.push({ kind: 'work', exIndex: i, durationSec: ex.durationSec });
  });
  return steps;
}
