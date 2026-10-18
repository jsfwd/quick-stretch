import { useState } from 'react';
import { formatDuration, formatWhen, renameHistory, toggleHeart, type HistoryEntry } from '../lib/history';
import { EditableName } from './EditableName';
import { HeartButton } from './HeartButton';

type Props = { entry: HistoryEntry; onAgain: () => void; onHome: () => void };

export function Done({ entry, onAgain, onHome }: Props) {
  const done = entry.stretches.filter((s) => s.completed).length;
  // Bumped each time the user hearts here, so the name field opens ready to type.
  const [heartedAt, setHeartedAt] = useState(0);
  return (
    <main className="screen done">
      <div className="done-hero">
        <div className="done-emoji">🎉</div>
        <h1>Nice work!</h1>
        <p className="muted">
          {entry.name} · {formatWhen(entry.completedAt)}
        </p>
        <p className="muted">
          {formatDuration(entry.durationSec)} active · {done} of {entry.stretches.length} stretches ·{' '}
          {entry.roundSec}s each
        </p>
        <HeartButton
          hearted={entry.hearted}
          onToggle={() => {
            if (!entry.hearted) setHeartedAt(Date.now());
            toggleHeart(entry.id);
          }}
          label={entry.hearted ? 'Saved to favorites' : 'Save to favorites'}
          className="done-heart"
        />
        {entry.hearted && (
          <div className="name-card">
            <span className="name-card-label">Name this routine</span>
            <EditableName
              key={heartedAt}
              value={entry.name}
              startEditing={heartedAt > 0}
              onSave={(name) => renameHistory(entry.id, name)}
            />
          </div>
        )}
      </div>
      <ul className="done-list">
        {entry.stretches.map((s, i) => (
          <li key={`${s.id}-${i}`} className={s.completed ? undefined : 'skipped'}>
            <span className="done-mark">{s.completed ? '✓' : '–'}</span> {s.name}
            {!s.completed && <span className="skip-tag">skipped</span>}
          </li>
        ))}
      </ul>
      <div className="preview-actions">
        <button className="btn secondary" onClick={onHome}>
          Home
        </button>
        <button className="btn primary" onClick={onAgain}>
          Go again
        </button>
      </div>
    </main>
  );
}
