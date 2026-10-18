import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { pauseClock, remainingMs, resumeClock, startClock, type Clock } from './clock';

type Options = {
  durationMs: number;
  /** Changing this restarts the countdown from `durationMs`. */
  resetKey: string | number;
  paused: boolean;
  /** Called each time the whole-seconds-remaining value drops (e.g. 3, 2, 1). */
  onSecond?: (secLeft: number) => void;
  onDone: () => void;
};

export function useCountdown({ durationMs, resetKey, paused, onSecond, onDone }: Options) {
  const clock = useRef<Clock>(startClock(durationMs, performance.now()));
  const lastSec = useRef(Math.ceil(durationMs / 1000));
  const [left, setLeft] = useState(durationMs);
  const callbacks = useRef({ onSecond, onDone });
  callbacks.current = { onSecond, onDone };

  useLayoutEffect(() => {
    const now = performance.now();
    const c = startClock(durationMs, now);
    clock.current = paused ? pauseClock(c, now) : c;
    lastSec.current = Math.ceil(durationMs / 1000);
    setLeft(durationMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useLayoutEffect(() => {
    const now = performance.now();
    clock.current = paused ? pauseClock(clock.current, now) : resumeClock(clock.current, now);
  }, [paused]);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let finished = false;
    const tick = () => {
      const rem = remainingMs(clock.current, performance.now());
      setLeft(rem);
      const sec = Math.ceil(rem / 1000);
      if (sec < lastSec.current) {
        lastSec.current = sec;
        if (sec > 0) callbacks.current.onSecond?.(sec);
      }
      if (rem <= 0) {
        if (!finished) {
          finished = true;
          callbacks.current.onDone();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [resetKey, paused]);

  return left;
}
