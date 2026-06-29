"use client";

import { useState } from "react";

interface KeyPointDeckProps {
  points: string[];
}

export default function KeyPointDeck({ points }: KeyPointDeckProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(0);

  function toggle(i: number) {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="key-deck">
      <div className="key-deck-header">
        <span className="key-deck-label">Lock it in</span>
        <span className="meta-mono">
          {flipped.size}/{points.length} revealed
        </span>
      </div>
      <div className="key-deck-track">
        {points.map((point, i) => (
          <button
            key={i}
            type="button"
            className={`key-card ${flipped.has(i) ? "key-card-flipped" : ""} ${active === i ? "key-card-active" : ""}`}
            onClick={() => {
              setActive(i);
              toggle(i);
            }}
          >
            <span className="key-card-front">
              <span className="key-card-num">{i + 1}</span>
              <span className="key-card-prompt">Tap to reveal</span>
            </span>
            <span className="key-card-back">{point}</span>
          </button>
        ))}
      </div>
    </div>
  );
}