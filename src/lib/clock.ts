/**
 * Pausable countdown clock based on absolute timestamps, so it stays correct
 * even when the browser throttles timers or the app is backgrounded.
 */
export type Clock = { running: boolean; endAt: number; remainingMs: number };

export function startClock(durationMs: number, now: number): Clock {
  return { running: true, endAt: now + durationMs, remainingMs: durationMs };
}

export function pauseClock(c: Clock, now: number): Clock {
  if (!c.running) return c;
  return { running: false, endAt: 0, remainingMs: Math.max(0, c.endAt - now) };
}

export function resumeClock(c: Clock, now: number): Clock {
  if (c.running) return c;
  return { running: true, endAt: now + c.remainingMs, remainingMs: c.remainingMs };
}

export function remainingMs(c: Clock, now: number): number {
  return c.running ? Math.max(0, c.endAt - now) : c.remainingMs;
}
