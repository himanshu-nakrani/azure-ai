"use client";

import { useState, useMemo } from "react";

const models = [
  { name: "GPT-4o", inputCost: 2.5, outputCost: 10.0 },
  { name: "GPT-4o-mini", inputCost: 0.15, outputCost: 0.6 },
  { name: "GPT-4.1", inputCost: 2.0, outputCost: 8.0 },
  { name: "o3-mini", inputCost: 1.1, outputCost: 4.4 },
];

export default function TokenFlowViz() {
  const [requestsPerDay, setRequestsPerDay] = useState(10000);
  const [avgInputTokens, setAvgInputTokens] = useState(2000);
  const [avgOutputTokens, setAvgOutputTokens] = useState(500);
  const [selectedModel, setSelectedModel] = useState(0);

  const costs = useMemo(() => {
    const model = models[selectedModel];
    const dailyInput =
      (requestsPerDay * avgInputTokens * model.inputCost) / 1_000_000;
    const dailyOutput =
      (requestsPerDay * avgOutputTokens * model.outputCost) / 1_000_000;
    const dailyTotal = dailyInput + dailyOutput;
    return {
      daily: dailyTotal,
      monthly: dailyTotal * 30,
      inputPct: (dailyInput / dailyTotal) * 100,
    };
  }, [requestsPerDay, avgInputTokens, avgOutputTokens, selectedModel]);

  const comparison = useMemo(() => {
    return models.map((m) => {
      const daily =
        (requestsPerDay * avgInputTokens * m.inputCost) / 1_000_000 +
        (requestsPerDay * avgOutputTokens * m.outputCost) / 1_000_000;
      return { name: m.name, monthly: daily * 30 };
    });
  }, [requestsPerDay, avgInputTokens, avgOutputTokens]);

  const maxMonthly = Math.max(...comparison.map((c) => c.monthly));

  return (
    <div className="panel">
      <div className="panel-header">Token cost estimator</div>
      <div className="panel-body space-y-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <Slider label="Requests/day" value={requestsPerDay} min={100} max={100000} step={100} format={(v) => v.toLocaleString()} onChange={setRequestsPerDay} />
          <Slider label="Input tokens" value={avgInputTokens} min={100} max={8000} step={100} format={(v) => v.toLocaleString()} onChange={setAvgInputTokens} />
          <Slider label="Output tokens" value={avgOutputTokens} min={50} max={4000} step={50} format={(v) => v.toLocaleString()} onChange={setAvgOutputTokens} />
        </div>

        <div className="flex flex-wrap gap-2">
          {models.map((m, i) => (
            <button
              key={m.name}
              onClick={() => setSelectedModel(i)}
              className={`rounded-[var(--radius-sm)] px-3 py-1 font-mono text-xs border transition-colors ${
                selectedModel === i
                  ? "border-[var(--accent)] text-[var(--text)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Daily" value={`$${costs.daily.toFixed(2)}`} />
          <Stat label="Monthly" value={`$${costs.monthly.toFixed(0)}`} highlight />
          <Stat label="Input share" value={`${costs.inputPct.toFixed(0)}%`} />
        </div>

        <div>
          <p className="section-label mb-3">Model comparison (monthly)</p>
          <div className="space-y-2">
            {comparison.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-24 meta-mono">
                  {c.name}
                </span>
                <div className="relative h-5 flex-1 rounded-[var(--radius-sm)] bg-[var(--surface-muted)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-[var(--radius-sm)] bg-[var(--accent-soft)]"
                    style={{ width: `${(c.monthly / maxMonthly) * 100}%` }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[0.625rem] text-[var(--text-secondary)]">
                    ${c.monthly.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <label className="meta-mono">{label}</label>
        <span className="font-mono text-[0.625rem] text-[var(--text)]">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[var(--radius-sm)] bg-[var(--surface-muted)] p-4 ${highlight ? "sm:col-span-1" : ""}`}>
      <p className="meta-mono">{label}</p>
      <p className={`mt-1 font-display text-xl ${highlight ? "text-[var(--accent)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}