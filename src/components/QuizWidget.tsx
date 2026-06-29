"use client";

import { useState } from "react";

interface QuizWidgetProps {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export default function QuizWidget({ question, options, answer, explanation }: QuizWidgetProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="panel mt-16">
      <div className="panel-header">Knowledge check</div>
      <div className="panel-body">
        <p className="mb-4 text-sm text-[var(--text)]">{question}</p>
        <div className="space-y-1">
          {options.map((opt, i) => {
            const picked = selected === i;
            const correct = i === answer;
            const done = selected !== null;

            let border = "var(--border)";
            if (done && picked && correct) border = "var(--ok)";
            if (done && picked && !correct) border = "var(--warn)";
            if (done && !picked && correct) border = "var(--ok)";

            return (
              <button
                key={i}
                onClick={() => selected === null && setSelected(i)}
                disabled={selected !== null}
                className="flex w-full items-start gap-3 border p-3 text-left text-sm transition-colors disabled:cursor-default"
                style={{ borderColor: border, background: picked ? "var(--bg-code)" : "transparent" }}
              >
                <span className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-muted)] pt-0.5">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[var(--text-secondary)]">{opt}</span>
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <p className="mt-4 border-t border-[var(--border)] pt-4 text-sm text-[var(--text-secondary)]">
            {explanation}
          </p>
        )}
      </div>
    </div>
  );
}