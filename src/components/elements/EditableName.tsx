import { useRef, useState } from 'react';
import { MAX_NAME_LENGTH } from '../../lib/history';
import { Icon } from './Icon';

type Props = {
  value: string;
  onSave: (name: string) => void;
  /** Start in edit mode (e.g. right after hearting). */
  startEditing?: boolean;
  /** Called when editing ends, whether saved or cancelled. */
  onDone?: () => void;
  className?: string;
};

/** A name that turns into a text field when tapped. Enter/blur saves, Escape cancels. */
export function EditableName({ value, onSave, startEditing = false, onDone, className = '' }: Props) {
  const [editing, setEditing] = useState(startEditing);
  const [draft, setDraft] = useState(value);
  // Escape/submit unmount the input, which can fire a trailing blur; ignore it.
  const finished = useRef(false);

  const finish = (save: boolean) => {
    if (finished.current) return;
    finished.current = true;
    const name = draft.trim();
    if (save && name && name !== value) onSave(name);
    setEditing(false);
    onDone?.();
  };

  if (!editing) {
    return (
      <button
        className={`name-btn ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setDraft(value);
          finished.current = false;
          setEditing(true);
        }}
        aria-label={`Rename ${value}`}
      >
        <span className="name-text">{value}</span>
        <Icon name="pencil" size={15} className="name-pencil" />
      </button>
    );
  }

  return (
    <form
      className={`name-form ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        finish(true);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        className="name-input"
        value={draft}
        maxLength={MAX_NAME_LENGTH}
        autoFocus
        enterKeyHint="done"
        aria-label="Routine name"
        onFocus={(e) => e.target.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => finish(true)}
        onKeyDown={(e) => e.key === 'Escape' && finish(false)}
      />
      {/* Keep focus in the input on press so the tap submits rather than blurring first. */}
      <button type="submit" className="name-save" onMouseDown={(e) => e.preventDefault()}>
        Save
      </button>
    </form>
  );
}
