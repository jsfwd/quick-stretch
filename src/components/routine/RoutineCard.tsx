import type { Preset } from '../../data/presets';
import { buildRoutine, formatTime, totalDurationSec, type SessionOptions } from '../../lib/routine';
import { Figure } from '../figures/Figure';

/** How many poses fit in the strip before it collapses to "+N". */
const MAX_POSES = 7;

type Props = {
  preset: Preset;
  opts: SessionOptions;
  onPick: () => void;
};

/** A routine shown as its sequence of poses on one shared floor line. */
export function RoutineCard({ preset, opts, onPick }: Props) {
  const routine = buildRoutine({ kind: 'preset', preset }, opts);
  const shown = routine.exercises.slice(0, MAX_POSES);
  const extra = routine.exercises.length - shown.length;

  return (
    <button
      className="routine-card"
      onClick={onPick}
      aria-label={`${preset.name}: ${routine.exercises.map((e) => e.name).join(', ')}`}
    >
      <span className="routine-head">
        <span className="routine-name">{preset.name}</span>
        <span className="routine-meta">
          {routine.exercises.length} stretches · {formatTime(totalDurationSec(routine))}
        </span>
      </span>
      <span className="routine-desc">{preset.description}</span>
      <span className="pose-strip" aria-hidden="true">
        {shown.map((e, i) => (
          <Figure key={`${e.id}-${i}`} name={e.figure} frame={99} thumb className="pose" />
        ))}
        {extra > 0 && <span className="pose-more">+{extra}</span>}
      </span>
    </button>
  );
}
