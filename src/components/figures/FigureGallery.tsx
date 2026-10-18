import { FIGURES } from './defs';
import { Figure } from './Figure';

/** Dev-only page (#gallery) showing every keyframe of every figure. */
export function FigureGallery() {
  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      {Object.entries(FIGURES).map(([name, def]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <code style={{ width: 110, fontSize: 12 }}>{name}</code>
          {def.poses.map((_, i) => (
            <Figure key={i} name={name} frame={i} className="gallery-fig" />
          ))}
          <Figure name={name} className="gallery-fig" />
        </div>
      ))}
    </div>
  );
}
