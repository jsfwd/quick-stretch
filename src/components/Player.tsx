import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSteps, formatTime, type Routine } from '../lib/routine';
import { useCountdown } from '../lib/useCountdown';
import { beep, speak, stopSpeech } from '../lib/audio';
import { useWakeLock } from '../lib/wakeLock';
import type { Settings } from '../lib/storage';
import { Figure } from './figures/Figure';
import { TimerRing } from './TimerRing';

type Props = {
  routine: Routine;
  settings: Settings;
  onExit: () => void;
  onFinish: (result: SessionResult) => void;
};

export type SessionResult = {
  /** Per exercise: did its timer run to the end (vs. skipped)? */
  completed: boolean[];
  /** Seconds actually spent in exercise steps, excluding pauses and skipped time. */
  activeSec: number;
};

/** Within this many seconds of a step starting, "back" goes to the previous move instead of restarting. */
const BACK_RESTART_GRACE_SEC = 3;

export function Player({ routine, settings, onExit, onFinish }: Props) {
  const steps = useMemo(() => buildSteps(routine), [routine]);
  const [stepIdx, setStepIdx] = useState(0);
  const [restartNonce, setRestartNonce] = useState(0);
  const [paused, setPaused] = useState(false);

  const step = steps[stepIdx];
  const ex = routine.exercises[step.exIndex];
  const durationMs = step.durationSec * 1000;
  const halfSec = ex.sides && step.kind === 'work' ? Math.floor(step.durationSec / 2) : null;
  const resetKey = `${stepIdx}:${restartNonce}`;
  const completed = useRef<boolean[]>(routine.exercises.map(() => false));
  const activeMs = useRef(0);

  useWakeLock(true);

  const say = useCallback(
    (text: string) => settings.voice && speak(text, settings.voiceURI),
    [settings.voice, settings.voiceURI],
  );
  const tone = useCallback(
    (freq: number, ms: number) => settings.sound && beep(freq, ms),
    [settings.sound],
  );

  /** Credit time spent in the current step before leaving it. */
  const leaveStep = (spentMs: number) => {
    if (step.kind === 'work') activeMs.current += Math.max(0, spentMs);
  };

  const advance = useCallback(() => {
    if (stepIdx >= steps.length - 1) {
      onFinish({ completed: completed.current, activeSec: Math.round(activeMs.current / 1000) });
      return;
    }
    setStepIdx((i) => i + 1);
  }, [stepIdx, steps.length, onFinish]);

  const remaining = useCountdown({
    durationMs,
    resetKey,
    paused,
    onSecond: (sec) => {
      if (sec <= 3) tone(660, 120);
      if (halfSec !== null && sec === halfSec) {
        tone(990, 200);
        say('Switch sides');
      }
    },
    onDone: () => {
      tone(step.kind === 'work' ? 1320 : 990, 320);
      leaveStep(durationMs);
      if (step.kind === 'work') completed.current[step.exIndex] = true;
      advance();
    },
  });

  // Announce each step as it begins.
  useEffect(() => {
    if (step.kind === 'ready') say(`Get ready. First up, ${ex.name}.`);
    else if (step.kind === 'rest') say(`Rest. Next up, ${ex.name}.`);
    else say(`${ex.name}. ${ex.cues[0]}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => stopSpeech, []);

  const elapsedSec = (durationMs - remaining) / 1000;

  const goBack = () => {
    leaveStep(durationMs - remaining);
    if (elapsedSec > BACK_RESTART_GRACE_SEC) {
      setRestartNonce((n) => n + 1);
      return;
    }
    let j = stepIdx - 1;
    while (j >= 0 && steps[j].kind === 'rest') j--;
    if (j < 0) setRestartNonce((n) => n + 1);
    else setStepIdx(j);
  };

  const exit = () => {
    setPaused(true);
    if (window.confirm('End this routine?')) {
      stopSpeech();
      onExit();
    } else {
      setPaused(false);
    }
  };

  const totalLeftSec =
    remaining / 1000 + steps.slice(stepIdx + 1).reduce((s, st) => s + st.durationSec, 0);
  const mirror = halfSec !== null && remaining <= halfSec * 1000;

  const isBreak = step.kind !== 'work';
  const label = mirror ? 'Other side' : ex.sides ? 'First side' : 'Go';

  return (
    <main className={`screen player ${step.kind}`}>
      <div className="topbar">
        <button className="icon-btn" onClick={exit} aria-label="End routine">
          ✕
        </button>
        <div className="progress-dots" aria-label={`Move ${step.exIndex + 1} of ${routine.exercises.length}`}>
          {routine.exercises.map((_, i) => (
            <span
              key={i}
              className={i < step.exIndex ? 'dot done' : i === step.exIndex ? 'dot current' : 'dot'}
            />
          ))}
        </div>
        <span className="topbar-meta">{formatTime(totalLeftSec)}</span>
      </div>

      {isBreak ? (
        <>
          <div className="break-hero">
            <div className={`break-pulse${paused ? ' paused' : ''}`} aria-hidden="true" />
            <h1 className="break-title">{step.kind === 'ready' ? 'Get ready' : 'Rest'}</h1>
            <p className="break-sub">
              {step.kind === 'ready' ? 'Your routine starts in a moment' : 'Shake it out and breathe'}
            </p>
          </div>

          <div className="next-card">
            <span className="next-label">Up next</span>
            <div className="next-body">
              <Figure name={ex.figure} frame={99} className="next-thumb" />
              <div className="next-text">
                <strong>{ex.name}</strong>
                <span className="muted">
                  {ex.durationSec}s{ex.sides ? ' · both sides' : ''} · {step.exIndex + 1} of{' '}
                  {routine.exercises.length}
                </span>
                <span className="next-cue">{ex.cues[0]}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="phase-label">{label}</div>

          <div className="figure-wrap">
            <Figure name={ex.figure} paused={paused} mirror={mirror} className="figure" />
          </div>

          <div className="ex-info">
            <h1 className="ex-name">
              {ex.name}
              <span className="ex-count">
                {step.exIndex + 1}/{routine.exercises.length}
              </span>
            </h1>
            <ul className="cues">
              {ex.cues.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="controls">
        <button className="ctrl-btn" onClick={goBack} aria-label="Back">
          ⏮
        </button>
        <button className="ring-btn" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume' : 'Pause'}>
          <TimerRing remainingMs={remaining} durationMs={durationMs} kind={step.kind} />
          <span className="ring-state">{paused ? '▶ Resume' : 'Tap to pause'}</span>
        </button>
        <button
          className="ctrl-btn"
          onClick={() => {
            leaveStep(durationMs - remaining);
            advance();
          }}
          aria-label="Skip"
        >
          ⏭
        </button>
      </div>
    </main>
  );
}
