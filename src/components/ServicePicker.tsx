"use client";

import { useState } from "react";
import Link from "next/link";
import { pickerScenarios } from "@/data/service-picker";

export default function ServicePicker() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const scenario = pickerScenarios[index];

  function choose(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (scenario.options[i].correct) setScore((s) => s + 1);
    setRound((r) => r + 1);
  }

  function next() {
    setPicked(null);
    setIndex((i) => (i + 1) % pickerScenarios.length);
  }

  return (
    <div className="panel service-picker">
      <div className="panel-header flex items-center justify-between">
        <span>Pick the right service</span>
        <span className="meta-mono">
          {score}/{round} correct · case {index + 1}/{pickerScenarios.length}
        </span>
      </div>
      <div className="panel-body">
        <p className="picker-context meta-mono">{scenario.context}</p>
        <p className="picker-prompt">{scenario.prompt}</p>
        <div className="picker-options">
          {scenario.options.map((opt, i) => {
            const done = picked !== null;
            const isPicked = picked === i;
            const showCorrect = done && opt.correct;
            const showWrong = done && isPicked && !opt.correct;

            return (
              <button
                key={opt.label}
                type="button"
                disabled={done}
                className={`picker-option ${showCorrect ? "picker-option-correct" : ""} ${showWrong ? "picker-option-wrong" : ""}`}
                onClick={() => choose(i)}
              >
                <span className="picker-option-label">{opt.label}</span>
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="picker-result">
            <p className={`quiz-verdict ${scenario.options[picked].correct ? "quiz-verdict-ok" : "quiz-verdict-miss"}`}>
              {scenario.options[picked].correct ? "Right call." : "Not this time."}
            </p>
            <p className="picker-why">{scenario.options[picked].why}</p>
            <div className="picker-actions">
              <button type="button" className="btn-secondary text-xs" onClick={next}>
                Next case →
              </button>
              <Link href={`/learn/${scenario.moduleSlug}`} className="meta-mono hover:text-[var(--accent)]">
                Deep dive module →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}