import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSteps, formatTime, type Routine } from '../../lib/routine';
import { useCountdown } from '../../lib/useCountdown';
import { beep, speak, stopSpeech } from '../../lib/audio';
import { useWakeLock } from '../../lib/wakeLock';
import type { Settings } from '../../lib/storage';
import { Figure } from '../figures/Figure';
import { Icon } from '../elements/Icon';
import { TimerRing } from '../routine/TimerRing';

type Props = {
  routine: Routine;
  settings: Settings;
  onExit: () => void;
  onFinish: (result: SessionResult) => void;
  /** Dev shortcut only: open on a later step. */
  initialStep?: number;
};

export type SessionResult = {
  /** Per exercise: did its timer run to the end (vs. skipped)? */
  completed: boolean[];
  /** Seconds actually spent in exercise steps, excluding pauses and skipped time. */
  activeSec: number;
};

/** Within this many seconds of a step starting, "back" goes to the previous move instead of restarting. */
const BACK_RESTART_GRACE_SEC = 3;

export function Player({ routine, settings, onExit, onFinish, initialStep = 0 }: Props) {
  const steps = useMemo(() => buildSteps(routine), [routine]);
  const [stepIdx, setStepIdx] = useState(initialStep);
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
  const label = paused ? 'Paused' : mirror ? 'Other side' : ex.sides ? 'First side' : 'Go';
  const skip = () => {
    leaveStep(durationMs - remaining);
    advance();
  };

  return (
    <main className={`screen player ${isBreak ? 'break' : 'work'}${paused ? ' is-paused' : ''}`}>
      <div className="player-top">
        <button className="icon-btn plain" onClick={exit} aria-label="End routine">
          <Icon name="x" />
        </button>
        <div className="progress-bars" aria-label={`Move ${step.exIndex + 1} of ${routine.exercises.length}`}>
          {routine.exercises.map((_, i) => (
            <span key={i} className={i < step.exIndex ? 'done' : i === step.exIndex && !isBreak ? 'now' : undefined} />
          ))}
        </div>
        <span className="player-total">{formatTime(totalLeftSec)}</span>
      </div>

      {isBreak ? (
        <>
          <h1 className="break-title">{step.kind === 'ready' ? 'Get ready' : 'Rest'}</h1>
          <p className="break-sub">
            {paused ? 'Paused' : step.kind === 'ready' ? 'Your routine starts in a moment.' : 'Shake it out and breathe.'}
          </p>
          <div className="breath" aria-hidden="true">
            <span />
          </div>
        </>
      ) : (
        <>
          <div className="phase-label">{label}</div>
          <div className="figure-wrap">
            <Figure name={ex.figure} paused={paused} mirror={mirror} className="figure" />
          </div>
          <h1 className="ex-name">{ex.name}</h1>
          <ul className="cues">
            {ex.cues.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      )}

      {settings.timerStyle === 'numbers' && <TimerNumbers remainingMs={remaining} durationMs={durationMs} />}

      {isBreak && (
        <div className="next-card">
          <Figure name={ex.figure} frame={99} thumb className="thumb" />
          <div className="next-text">
            <span className="next-label">
              Up next · {step.exIndex + 1} of {routine.exercises.length}
            </span>
            <strong>{ex.name}</strong>
            <span className="muted small">
              {ex.durationSec}s{ex.sides ? ' · both sides' : ''} · {ex.cues[0]}
            </span>
          </div>
        </div>
      )}

      <div className="controls">
        <button className="ctrl" onClick={goBack} aria-label="Back">
          <Icon name="skipBack" />
        </button>
        {settings.timerStyle === 'ring' ? (
          <TimerRing
            remainingMs={remaining}
            durationMs={durationMs}
            paused={paused}
            onToggle={() => setPaused((p) => !p)}
          />
        ) : (
          <button className="ctrl main" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume' : 'Pause'}>
            <Icon name={paused ? 'play' : 'pause'} filled={paused} size={26} />
          </button>
        )}
        <button className="ctrl" onClick={skip} aria-label="Skip">
          <Icon name="skipForward" />
        </button>
      </div>
    </main>
  );
}

function TimerNumbers({ remainingMs, durationMs }: { remainingMs: number; durationMs: number }) {
  const secs = Math.ceil(remainingMs / 1000);
  const elapsed = durationMs > 0 ? 1 - remainingMs / durationMs : 1;
  return (
    <div className="timer" role="timer" aria-label={`${secs} seconds left`}>
      <div className="timer-num">
        {String(secs).padStart(2, '0')}
        <small>sec</small>
      </div>
      <div className="track">
        <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, elapsed))})` }} />
      </div>
    </div>
  );
}
