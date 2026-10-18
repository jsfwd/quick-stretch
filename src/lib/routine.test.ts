import { describe, expect, it } from 'vitest';
import { EXERCISES, EXERCISE_BY_ID } from '../data/exercises';
import { PRESETS } from '../data/presets';
import { FIGURES } from '../components/figures/defs';
import {
  buildPreset,
  buildRandomRoutine,
  buildRoutine,
  buildSteps,
  clampCount,
  fitPreset,
  formatTime,
  totalDurationSec,
} from './routine';

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe('buildRandomRoutine', () => {
  it('returns 5 unique exercises starting with a gentle one', () => {
    for (let s = 1; s <= 50; s++) {
      const r = buildRandomRoutine(5, seeded(s));
      expect(r.exercises).toHaveLength(5);
      expect(new Set(r.exercises.map((e) => e.id)).size).toBe(5);
      expect(r.exercises[0].gentle).toBe(true);
    }
  });

  it('lands near 5 minutes', () => {
    const sec = totalDurationSec(buildRandomRoutine(5, seeded(7)));
    expect(sec).toBeGreaterThanOrEqual(300);
    expect(sec).toBeLessThanOrEqual(360);
  });
});

describe('buildRoutine', () => {
  it('honours count 3–10 and round length for random routines', () => {
    for (let count = 3; count <= 10; count++) {
      for (const roundSec of [30, 45, 60] as const) {
        const r = buildRoutine({ kind: 'random', seed: count * 31 }, { count, roundSec });
        expect(r.exercises).toHaveLength(count);
        expect(new Set(r.exercises.map((e) => e.id)).size).toBe(count);
        expect(r.exercises.every((e) => e.durationSec === roundSec)).toBe(true);
        expect(r.exercises[0].gentle).toBe(true);
      }
    }
  });

  it('is stable for the same seed so tweaking options does not reshuffle', () => {
    const a = buildRoutine({ kind: 'random', seed: 42 }, { count: 5, roundSec: 60 });
    const b = buildRoutine({ kind: 'random', seed: 42 }, { count: 5, roundSec: 30 });
    expect(b.exercises.map((e) => e.id)).toEqual(a.exercises.map((e) => e.id));
  });

  it('5 × 60s is about 5¾ minutes; 3 × 30s is under 2½', () => {
    expect(totalDurationSec(buildRoutine({ kind: 'preset', preset: PRESETS[0] }, { count: 5, roundSec: 60 }))).toBe(345);
    expect(totalDurationSec(buildRoutine({ kind: 'preset', preset: PRESETS[0] }, { count: 3, roundSec: 30 }))).toBe(115);
  });
});

describe('fitPreset', () => {
  it('trims from the middle and keeps the closer', () => {
    for (const p of PRESETS) {
      const ex = fitPreset(p, 3);
      expect(ex.map((e) => e.id)).toEqual([p.exerciseIds[0], p.exerciseIds[1], p.exerciseIds.at(-1)]);
    }
  });

  it('extends with unique on-theme moves and keeps the closer last', () => {
    for (const p of PRESETS) {
      const ex = fitPreset(p, 10);
      expect(ex).toHaveLength(10);
      expect(new Set(ex.map((e) => e.id)).size).toBe(10);
      expect(ex.at(-1)!.id).toBe(p.exerciseIds.at(-1));
      const themes = new Set(p.exerciseIds.flatMap((id) => EXERCISE_BY_ID[id].focus));
      for (const e of ex) expect(e.focus.some((f) => themes.has(f)), e.id).toBe(true);
    }
  });
});

describe('clampCount', () => {
  it('clamps to 3–10 and falls back to 5 for junk', () => {
    expect(clampCount(1)).toBe(3);
    expect(clampCount(99)).toBe(10);
    expect(clampCount(7.4)).toBe(7);
    expect(clampCount(NaN)).toBe(5);
  });
});

describe('data integrity', () => {
  it('presets reference real exercises', () => {
    for (const p of PRESETS) {
      for (const id of p.exerciseIds) expect(EXERCISE_BY_ID[id], `${p.id} → ${id}`).toBeDefined();
      expect(buildPreset(p).exercises).toHaveLength(p.exerciseIds.length);
    }
  });

  it('every exercise has a figure', () => {
    for (const e of EXERCISES) expect(FIGURES[e.figure], e.id).toBeDefined();
  });
});

describe('buildSteps', () => {
  it('ready → work → (rest → work)*', () => {
    const steps = buildSteps(buildPreset(PRESETS[0]));
    expect(steps.map((s) => s.kind)).toEqual([
      'ready', 'work', 'rest', 'work', 'rest', 'work', 'rest', 'work', 'rest', 'work',
    ]);
    expect(steps[2].exIndex).toBe(1);
  });
});

describe('formatTime', () => {
  it('formats m:ss and rounds up partial seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(59.2)).toBe('1:00');
    expect(formatTime(345)).toBe('5:45');
  });
});
