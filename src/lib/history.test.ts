import { describe, expect, it } from 'vitest';
import { addHistory, deleteHistory, getHistory, renameHistory, savedSource, toggleHeart } from './history';
import { buildRoutine } from './routine';

const sample = (name: string) => ({
  name,
  durationSec: 120,
  roundSec: 30,
  stretches: [
    { id: 'arm-circles', name: 'Arm Circles', completed: true },
    { id: 'neck-tilt', name: 'Neck Side Tilt', completed: false },
    { id: 'cat-cow', name: 'Cat–Cow', completed: true },
  ],
});

describe('history', () => {
  it('adds newest first, toggles hearts and deletes', () => {
    const a = addHistory(sample('A'));
    const b = addHistory(sample('B'));
    expect(a.hearted).toBe(false);
    expect(b.completedAt).toBeGreaterThanOrEqual(a.completedAt);
    expect(getHistory().map((e) => e.name)).toEqual(['B', 'A']);
    toggleHeart(a.id);
    expect(getHistory().find((e) => e.id === a.id)!.hearted).toBe(true);
    toggleHeart(a.id);
    expect(getHistory().find((e) => e.id === a.id)!.hearted).toBe(false);
    deleteHistory(b.id);
    expect(getHistory().map((e) => e.name)).toEqual(['A']);
  });

  it('keeps hearted sessions when pruning old ones', () => {
    const fav = addHistory(sample('Fav'));
    toggleHeart(fav.id);
    let last = fav;
    for (let i = 0; i < 210; i++) last = addHistory(sample(`S${i}`));
    // savedSource round-trips through the routine builder exactly.
    const routine = buildRoutine(savedSource({ ...fav, hearted: true }), { roundSec: 60, count: 9 });
    expect(routine.exercises.map((e) => e.id)).toEqual(['arm-circles', 'neck-tilt', 'cat-cow']);
    expect(routine.exercises.every((e) => e.durationSec === 30)).toBe(true);
    expect(last.name).toBe('S209');
    const all = getHistory();
    expect(all.filter((e) => !e.hearted)).toHaveLength(200);
    expect(all.some((e) => e.id === fav.id && e.hearted)).toBe(true);
    expect(all[0].name).toBe('S209');
  });

  it('renames, trimming whitespace and ignoring blank names', () => {
    const e = addHistory(sample('Random Quick Routine'));
    renameHistory(e.id, '  Morning wobble  ');
    expect(getHistory().find((x) => x.id === e.id)!.name).toBe('Morning wobble');
    renameHistory(e.id, '   ');
    expect(getHistory().find((x) => x.id === e.id)!.name).toBe('Morning wobble');
    renameHistory(e.id, 'x'.repeat(60));
    expect(getHistory().find((x) => x.id === e.id)!.name).toHaveLength(40);
  });
});
