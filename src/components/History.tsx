import { useState } from 'react';
import {
  deleteHistory,
  formatDuration,
  formatWhen,
  renameHistory,
  toggleHeart,
  useHistory,
  type HistoryEntry,
} from '../lib/history';
import { EditableName } from './EditableName';
import { HeartButton } from './HeartButton';
import { Icon } from './Icon';

type Props = {
  onBack: () => void;
  onReplay: (entry: HistoryEntry) => void;
};

export function History({ onBack, onReplay }: Props) {
  const history = useHistory();
  const totalSec = history.reduce((s, e) => s + e.durationSec, 0);

  return (
    <main className="screen history">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" />
        </button>
        <span className="topbar-meta">
          {history.length} session{history.length === 1 ? '' : 's'}
        </span>
      </div>
      <h1 className="page-title">History</h1>

      {history.length === 0 ? (
        <p className="empty muted">No sessions yet. Finish a routine and it will show up here.</p>
      ) : (
        <>
          <p className="muted history-total">{formatDuration(totalSec)} of stretching in total</p>
          <ul className="history-list">
            {history.map((e) => (
              <HistoryItem key={e.id} entry={e} onReplay={() => onReplay(e)} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

function HistoryItem({ entry, onReplay }: { entry: HistoryEntry; onReplay: () => void }) {
  const done = entry.stretches.filter((s) => s.completed).length;
  const [renaming, setRenaming] = useState(false);
  return (
    <li>
      <details className="history-item">
        <summary>
          <span className="history-main">
            <strong>{entry.name}</strong>
            <span className="muted small">{formatWhen(entry.completedAt)}</span>
            <span className="muted small">
              {formatDuration(entry.durationSec)} · {done}/{entry.stretches.length} stretches · {entry.roundSec}s
            </span>
          </span>
          <HeartButton hearted={entry.hearted} onToggle={() => toggleHeart(entry.id)} />
        </summary>
        {renaming && (
          <div className="history-rename">
            <EditableName
              value={entry.name}
              startEditing
              onSave={(name) => renameHistory(entry.id, name)}
              onDone={() => setRenaming(false)}
            />
          </div>
        )}
        <ol className="history-stretches">
          {entry.stretches.map((s, i) => (
            <li key={`${s.id}-${i}`} className={s.completed ? undefined : 'skipped'}>
              <span className="done-mark">{s.completed ? <Icon name="check" size={18} /> : '–'}</span>
              {s.name}
              {!s.completed && <span className="skip-tag">skipped</span>}
            </li>
          ))}
        </ol>
        <div className="history-actions">
          <button className="link-btn" onClick={() => setRenaming(true)}>
            Rename
          </button>
          <button
            className="link-btn danger"
            onClick={() => window.confirm('Delete this session from history?') && deleteHistory(entry.id)}
          >
            Delete
          </button>
          <button className="btn primary small" onClick={onReplay}>
            Do this again
          </button>
        </div>
      </details>
    </li>
  );
}
