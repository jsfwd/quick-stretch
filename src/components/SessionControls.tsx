import { useEffect, useState } from 'react';
import { clampCount, MAX_COUNT, MIN_COUNT, ROUND_OPTIONS, type SessionOptions } from '../lib/routine';

type Props = {
  value: SessionOptions;
  onChange: (patch: Partial<SessionOptions>) => void;
};

export function SessionControls({ value, onChange }: Props) {
  // Keep a text draft so the field can be briefly empty while typing.
  const [draft, setDraft] = useState(String(value.count));
  useEffect(() => setDraft(String(value.count)), [value.count]);

  const commit = (text: string) => {
    const n = clampCount(parseInt(text, 10));
    setDraft(String(n));
    if (n !== value.count) onChange({ count: n });
  };

  return (
    <div className="session-controls">
      <div className="session-row">
        <span className="session-label">Time per stretch</span>
        <div className="segmented" role="radiogroup" aria-label="Time per stretch">
          {ROUND_OPTIONS.map((sec) => (
            <button
              key={sec}
              role="radio"
              aria-checked={value.roundSec === sec}
              className={value.roundSec === sec ? 'seg active' : 'seg'}
              onClick={() => onChange({ roundSec: sec })}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      <div className="session-row">
        <label className="session-label" htmlFor="count-input">
          Stretches
          <span className="session-hint">
            {MIN_COUNT}–{MAX_COUNT}
          </span>
        </label>
        <div className="stepper">
          <button
            aria-label="Fewer stretches"
            disabled={value.count <= MIN_COUNT}
            onClick={() => onChange({ count: clampCount(value.count - 1) })}
          >
            −
          </button>
          <input
            id="count-input"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = parseInt(e.target.value, 10);
              if (n >= MIN_COUNT && n <= MAX_COUNT) onChange({ count: n });
            }}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          />
          <button
            aria-label="More stretches"
            disabled={value.count >= MAX_COUNT}
            onClick={() => onChange({ count: clampCount(value.count + 1) })}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
