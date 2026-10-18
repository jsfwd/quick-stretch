import { describe, expect, it } from 'vitest';
import { pauseClock, remainingMs, resumeClock, startClock } from './clock';

describe('clock', () => {
  it('counts down from absolute timestamps', () => {
    const c = startClock(60_000, 1000);
    expect(remainingMs(c, 1000)).toBe(60_000);
    expect(remainingMs(c, 31_000)).toBe(30_000);
    expect(remainingMs(c, 999_999)).toBe(0);
  });

  it('freezes while paused and resumes where it left off', () => {
    let c = startClock(60_000, 0);
    c = pauseClock(c, 10_000);
    expect(remainingMs(c, 50_000)).toBe(50_000);
    c = resumeClock(c, 100_000);
    expect(remainingMs(c, 120_000)).toBe(30_000);
  });

  it('pause/resume are idempotent', () => {
    const c = startClock(5000, 0);
    expect(resumeClock(c, 100)).toBe(c);
    const p = pauseClock(c, 1000);
    expect(pauseClock(p, 3000)).toBe(p);
  });
});
