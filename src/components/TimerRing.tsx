type Props = {
  remainingMs: number;
  durationMs: number;
  kind: 'ready' | 'work' | 'rest';
};

const R = 52;
const C = 2 * Math.PI * R;

export function TimerRing({ remainingMs, durationMs, kind }: Props) {
  const frac = durationMs > 0 ? remainingMs / durationMs : 0;
  const secs = Math.ceil(remainingMs / 1000);
  return (
    <svg viewBox="0 0 120 120" className={`timer-ring ${kind}`}>
      <circle cx="60" cy="60" r={R} className="ring-track" />
      <circle
        cx="60"
        cy="60"
        r={R}
        className="ring-progress"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - frac)}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="60" className="ring-text" dominantBaseline="central" textAnchor="middle">
        {secs}
      </text>
    </svg>
  );
}
