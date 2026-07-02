import { useState } from 'react';
import './StarRating.css';

/**
 * Interactive or read-only star rating.
 *
 * @param {number} value - Current rating (1-5)
 * @param {function} onChange - Called with new value (interactive mode)
 * @param {number} size - Star size in pixels (default 24)
 * @param {boolean} readOnly - If true, just displays
 */
export default function StarRating({ value = 0, onChange, size = 24, readOnly = false }) {
  const [hovered, setHovered] = useState(null);

  const displayValue = hovered ?? value;

  return (
    <div
      className={`star-rating ${readOnly ? 'read-only' : ''}`}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star ${star <= displayValue ? 'filled' : ''}`}
          style={{ fontSize: size }}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </div>
  );
}