import { PRESETS } from '../../data/presets';
import { buildRoutine, formatTime, newSeed, totalDurationSec, type RoutineSource } from '../../lib/routine';
import type { Settings } from '../../lib/storage';
import { formatWhen, renameHistory, toggleHeart, useHistory, type HistoryEntry } from '../../lib/history';
import { DEFAULT_DARK, DEFAULT_LIGHT, type Theme } from '../../theme/themes';
import { EditableName } from '../elements/EditableName';
import { HeartButton } from '../elements/HeartButton';
import { Icon } from '../elements/Icon';
import { SessionControls } from '../routine/SessionControls';
import { RoutineCard } from '../routine/RoutineCard';

type Props = {
  settings: Settings;
  theme: Theme;
  onSettings: (patch: Partial<Settings>) => void;
  onPick: (source: RoutineSource) => void;
  onReplay: (entry: HistoryEntry) => void;
  onHistory: () => void;
  onOpenSettings: () => void;
};

export function Home({ settings, theme, onSettings, onPick, onReplay, onHistory, onOpenSettings }: Props) {
  const history = useHistory();
  const favorites = history.filter((e) => e.hearted);
  const last = history[0];
  const opts = { roundSec: settings.roundSec, count: settings.count };
  // Every routine of N moves has the same length, so any source gives the total.
  const sessionSec = totalDurationSec(buildRoutine({ kind: 'random', seed: 1 }, opts));
  const isDark = theme.scheme === 'dark';

  return (
    <main className="screen home">
      <header className="home-header">
        <h1 className="brand">
          Quick
          <br />
          Stretch
        </h1>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => onSettings({ theme: isDark ? DEFAULT_LIGHT : DEFAULT_DARK })}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name={isDark ? 'sun' : 'moon'} />
          </button>
          <button className="icon-btn" onClick={onHistory} aria-label="History">
            <Icon name="history" />
          </button>
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
            <Icon name="settings" />
          </button>
        </div>
      </header>
      <p className="home-meta">
        {last
          ? `${history.length} session${history.length === 1 ? '' : 's'} · last ${formatWhen(last.completedAt).replace(/^(Today|Yesterday)/, (d) => d.toLowerCase())}`
          : 'Quick stretch breaks, one move at a time.'}
      </p>

      <SessionControls value={opts} onChange={onSettings} />

      <button className="cta" onClick={() => onPick({ kind: 'random', seed: newSeed() })}>
        <Icon name="shuffle" />
        <span className="cta-label">Random routine</span>
        <span className="cta-meta">{formatTime(sessionSec)}</span>
      </button>

      {favorites.length > 0 && (
        <details className="favorites">
          <summary>
            <Icon name="heart" filled className="accent-icon" />
            <span className="fav-title">Favorites</span>
            <span className="fav-count">{favorites.length}</span>
            <Icon name="chevron" size={18} className="chevron" />
          </summary>
          <ul className="fav-list">
            {favorites.map((e) => (
              <li key={e.id} className="fav-item">
                <div className="fav-text">
                  <EditableName value={e.name} onSave={(name) => renameHistory(e.id, name)} />
                  <span className="muted small">
                    {e.stretches.length} stretches · {e.roundSec}s · {formatWhen(e.completedAt)}
                  </span>
                </div>
                <button className="play-btn" onClick={() => onReplay(e)} aria-label={`Start ${e.name}`}>
                  <Icon name="play" filled size={16} />
                </button>
                <HeartButton hearted onToggle={() => toggleHeart(e.id)} />
              </li>
            ))}
          </ul>
        </details>
      )}

      <h2 className="section-title">Routines</h2>
      <ul className="routine-list">
        {PRESETS.map((p) => (
          <li key={p.id}>
            <RoutineCard preset={p} opts={opts} onPick={() => onPick({ kind: 'preset', preset: p })} />
          </li>
        ))}
      </ul>

    </main>
  );
}
