type Props = {
  hearted: boolean;
  onToggle: () => void;
  /** Visible text; omit for an icon-only button. */
  label?: string;
  className?: string;
};

export function HeartButton({ hearted, onToggle, label, className = '' }: Props) {
  return (
    <button
      className={`heart-btn${hearted ? ' on' : ''}${label ? ' with-label' : ''} ${className}`}
      aria-pressed={hearted}
      aria-label={label ? undefined : hearted ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => {
        // Don't also open/close a surrounding <details> row.
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <span className="heart-icon" aria-hidden="true">
        {hearted ? '♥' : '♡'}
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}
