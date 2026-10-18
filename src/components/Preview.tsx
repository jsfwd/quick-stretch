import { formatTime, totalDurationSec, type Routine } from '../lib/routine';
import { unlockAudio } from '../lib/audio';
import type { Settings } from '../lib/storage';
import { Figure } from './figures/Figure';
import { SessionControls } from './SessionControls';

type Props = {
  routine: Routine;
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  onBack: () => void;
  onStart: () => void;
  onShuffle?: () => void;
  /** Replaying a saved session: show its fixed setup instead of the editable controls. */
  locked?: boolean;
};

export function Preview({ routine, settings, onSettings, onBack, onStart, onShuffle, locked }: Props) {
  return (
    <main className="screen preview">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <span className="topbar-title">{routine.name}</span>
        <span className="topbar-meta">{formatTime(totalDurationSec(routine))}</span>
      </div>

      <div className="preview-session">
        {locked ? (
          <p className="saved-note">
            <span aria-hidden="true">♥</span> Favorite · {routine.exercises.length} stretches ·{' '}
            {routine.exercises[0]?.durationSec}s each
          </p>
        ) : (
          <SessionControls value={{ roundSec: settings.roundSec, count: settings.count }} onChange={onSettings} />
        )}
      </div>

      <ol className="ex-list">
        {routine.exercises.map((ex) => (
          <li key={ex.id} className="ex-row">
            <Figure name={ex.figure} frame={99} className="ex-thumb" />
            <span className="ex-row-text">
              <strong>{ex.name}</strong>
              <span className="muted">
                {ex.durationSec}s{ex.sides ? ' · both sides' : ''}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="preview-actions">
        {onShuffle && (
          <button className="btn secondary" onClick={onShuffle}>
            🎲 Shuffle
          </button>
        )}
        <button
          className="btn primary"
          onClick={() => {
            unlockAudio(); // must happen inside the tap for iOS
            onStart();
          }}
        >
          Start
        </button>
      </div>
    </main>
  );
}
