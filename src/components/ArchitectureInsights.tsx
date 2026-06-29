"use client";

import { useState } from "react";

interface ArchitectureInsightsProps {
  considerations: string[];
  costDrivers: string[];
  services: string[];
}

const tabs = [
  { id: "design", label: "Design calls" },
  { id: "cost", label: "Cost radar" },
  { id: "stack", label: "Stack" },
] as const;

export default function ArchitectureInsights({
  considerations,
  costDrivers,
  services,
}: ArchitectureInsightsProps) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("design");
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const items = tab === "design" ? considerations : tab === "cost" ? costDrivers : services;

  return (
    <div className="arch-insights">
      <div className="arch-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`arch-tab ${tab === t.id ? "arch-tab-active" : ""}`}
            onClick={() => {
              setTab(t.id);
              setRevealed(new Set());
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="arch-tab-panel">
        {tab === "stack" ? (
          <div className="service-chips service-chips-lg">
            {services.map((s) => (
              <span key={s} className="service-chip">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <ul className="insight-deck">
            {items.map((item, i) => (
              <li key={item}>
                <button
                  type="button"
                  className={`insight-card ${revealed.has(i) ? "insight-card-open" : ""}`}
                  onClick={() => toggle(i)}
                >
                  <span className="insight-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="insight-text">{item}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {tab !== "stack" && (
          <p className="insight-hint meta-mono">Tap cards to mark as reviewed</p>
        )}
      </div>
    </div>
  );
}