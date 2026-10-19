import { Icon } from '../elements/Icon';

type Props = {
  remainingMs: number;
  durationMs: number;
  paused: boolean;
  onToggle: () => void;
};

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

/** Countdown ring with the seconds inside; the whole ring is the pause/resume button. */
export function TimerRing({ remainingMs, durationMs, paused, onToggle }: Props) {
  const secs = Math.ceil(remainingMs / 1000);
  const left = durationMs > 0 ? Math.min(1, Math.max(0, remainingMs / durationMs)) : 0;

  return (
    <button
      className={`timer-ring${paused ? ' paused' : ''}`}
      onClick={onToggle}
      aria-label={paused ? `Resume, ${secs} seconds left` : `Pause, ${secs} seconds left`}
    >
      <span className="ring-wrap">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={R} className="ring-track" />
          <circle
            cx="60"
            cy="60"
            r={R}
            className="ring-progress"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - left)}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <span className="ring-num">{secs}</span>
      </span>
      <span className="ring-hint">
        {paused ? (
          <>
            <Icon name="play" filled size={12} /> Tap to resume
          </>
        ) : (
          'Tap to pause'
        )}
      </span>
    </button>
  );
}
