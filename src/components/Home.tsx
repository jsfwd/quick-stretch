import { PRESETS } from '../data/presets';
import { buildRoutine, formatTime, newSeed, totalDurationSec, type RoutineSource } from '../lib/routine';
import type { Settings } from '../lib/storage';
import { formatWhen, renameHistory, toggleHeart, useHistory, type HistoryEntry } from '../lib/history';
import { EditableName } from './EditableName';
import { HeartButton } from './HeartButton';
import { resolveVoice, speak } from '../lib/audio';
import { useVoices } from '../lib/useVoices';
import { SessionControls } from './SessionControls';

const PREVIEW_LINE = 'Lymphatic hops. Bounce gently on the balls of your feet.';

type Props = {
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
  onPick: (source: RoutineSource) => void;
  onReplay: (entry: HistoryEntry) => void;
  onHistory: () => void;
};

export function Home({ settings, onSettings, onPick, onReplay, onHistory }: Props) {
  const history = useHistory();
  const favorites = history.filter((e) => e.hearted);
  const last = history[0];
  const voices = useVoices();
  const autoName = voices.length ? resolveVoice()?.name : undefined;
  const opts = { roundSec: settings.roundSec, count: settings.count };
  // Every routine of N moves has the same length, so any source gives the total.
  const sessionSec = totalDurationSec(buildRoutine({ kind: 'random', seed: 1 }, opts));

  return (
    <main className="screen home">
      <header className="home-header">
        <div>
          <h1>Quick Stretch</h1>
          <p className="muted">
            {last
              ? `${history.length} session${history.length === 1 ? '' : 's'} done · last ${formatWhen(last.completedAt).replace(/^(Today|Yesterday)/, (d) => d.toLowerCase())}`
              : 'Quick stretch breaks, one move at a time.'}
          </p>
        </div>
        <button className="history-link" onClick={onHistory}>
          History
        </button>
      </header>

      {favorites.length > 0 && (
        <details className="favorites">
          <summary>
            <span className="fav-heart" aria-hidden="true">
              ♥
            </span>
            <span className="fav-title">Favorites</span>
            <span className="fav-count">{favorites.length}</span>
            <span className="chevron" aria-hidden="true">
              ›
            </span>
          </summary>
          <ul className="fav-list">
            {favorites.map((e) => (
              <li key={e.id} className="fav-item">
                <div className="fav-text">
                  <EditableName value={e.name} onSave={(name) => renameHistory(e.id, name)} />
                  <span className="muted">
                    {e.stretches.length} stretches · {e.roundSec}s · {formatWhen(e.completedAt)}
                  </span>
                </div>
                <button className="play-btn" onClick={() => onReplay(e)} aria-label={`Start ${e.name}`}>
                  ▶
                </button>
                <HeartButton hearted onToggle={() => toggleHeart(e.id)} />
              </li>
            ))}
          </ul>
        </details>
      )}

      <h2 className="section-title">Your session</h2>
      <SessionControls value={opts} onChange={onSettings} />

      <button className="random-card" onClick={() => onPick({ kind: 'random', seed: newSeed() })}>
        <span className="random-emoji">🎲</span>
        <span>
          <strong>Random routine</strong>
          <span className="muted">
            {settings.count} stretches · {settings.roundSec}s each · {formatTime(sessionSec)}
          </span>
        </span>
      </button>

      <h2 className="section-title">Routines</h2>
      <ul className="preset-list">
        {PRESETS.map((p) => (
          <li key={p.id}>
            <button className="preset-card" onClick={() => onPick({ kind: 'preset', preset: p })}>
              <span className="preset-emoji">{p.emoji}</span>
              <span className="preset-text">
                <strong>{p.name}</strong>
                <span className="muted">{p.description}</span>
              </span>
              <span className="preset-time">{formatTime(sessionSec)}</span>
            </button>
          </li>
        ))}
      </ul>

      <h2 className="section-title">Settings</h2>
      <div className="settings">
        <label className="toggle">
          <span>Beeps</span>
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => onSettings({ sound: e.target.checked })}
          />
        </label>
        <label className="toggle">
          <span>Voice cues</span>
          <input
            type="checkbox"
            checked={settings.voice}
            onChange={(e) => onSettings({ voice: e.target.checked })}
          />
        </label>
        {voices.length > 0 && (
          <div className="voice-row">
            <label className="voice-label" htmlFor="voice-select">
              Voice
            </label>
            <select
              id="voice-select"
              className="voice-select"
              value={settings.voiceURI}
              onChange={(e) => {
                onSettings({ voiceURI: e.target.value });
                speak(PREVIEW_LINE, e.target.value);
              }}
            >
              <option value="">Automatic{autoName ? ` (${autoName})` : ''}</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} · {v.lang}
                </option>
              ))}
            </select>
            <button className="preview-btn" onClick={() => speak(PREVIEW_LINE, settings.voiceURI)}>
              ▶ Preview
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
