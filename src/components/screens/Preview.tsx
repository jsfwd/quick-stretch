import { formatTime, totalDurationSec, type Routine } from '../../lib/routine';
import { unlockAudio } from '../../lib/audio';
import type { Settings } from '../../lib/storage';
import { Figure } from '../figures/Figure';
import { Icon } from '../elements/Icon';
import { SessionControls } from '../routine/SessionControls';

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
          <Icon name="back" />
        </button>
        <span className="topbar-meta">{formatTime(totalDurationSec(routine))}</span>
      </div>
      <h1 className="page-title">{routine.name}</h1>

      <div className="preview-session">
        {locked ? (
          <p className="saved-note">
            <Icon name="heart" filled size={18} className="accent-icon" />
            Favorite · {routine.exercises.length} stretches · {routine.exercises[0]?.durationSec}s each
          </p>
        ) : (
          <SessionControls value={{ roundSec: settings.roundSec, count: settings.count }} onChange={onSettings} />
        )}
      </div>

      <ol className="row-list ex-list">
        {routine.exercises.map((ex, i) => (
          <li key={ex.id} className="row">
            <span className="row-index">{i + 1}</span>
            <Figure name={ex.figure} frame={99} thumb className="thumb" />
            <span className="row-text">
              <strong>{ex.name}</strong>
              <span className="muted small">{ex.cues[0]}</span>
            </span>
            <span className="row-meta">
              {ex.durationSec}s{ex.sides ? ' · 2 sides' : ''}
            </span>
          </li>
        ))}
      </ol>

      <div className="preview-actions">
        {onShuffle && (
          <button className="btn secondary" onClick={onShuffle}>
            <Icon name="shuffle" size={20} />
            Shuffle
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
