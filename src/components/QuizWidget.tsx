"use client";

import { useState } from "react";
import { markQuizComplete } from "@/lib/progress";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface QuizWidgetProps {
  questions: QuizQuestion[];
  moduleSlug?: string;
}

export default function QuizWidget({ questions, moduleSlug }: QuizWidgetProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const quiz = questions[current];
  const isLast = current === questions.length - 1;

  function handlePick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === quiz.answer;
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);

    if (isLast) {
      setFinished(true);
      if (moduleSlug) {
        markQuizComplete(moduleSlug, newScore, questions.length);
      }
    }
  }

  function handleNext() {
    setCurrent((c) => c + 1);
    setSelected(null);
  }

  return (
    <div className="panel mt-16 quiz-panel">
      <div className="panel-header flex items-center justify-between">
        <span>Quick fire</span>
        <span className="meta-mono">
          {finished
            ? `final score ${score}/${questions.length}`
            : questions.length > 1
              ? `round ${current + 1} of ${questions.length}`
              : "1 round"}
        </span>
      </div>
      <div className="panel-body">
        {!finished ? (
          <>
            <p className="mb-5 text-[0.9375rem] leading-relaxed text-[var(--text)]">
              {quiz.question}
            </p>
            <div className="space-y-2">
              {quiz.options.map((opt, i) => {
                const picked = selected === i;
                const correct = i === quiz.answer;
                const done = selected !== null;

                let ring = "transparent";
                let bg = "transparent";
                if (done && correct) {
                  ring = "var(--ok)";
                  bg = "#f0fdf4";
                }
                if (done && picked && !correct) {
                  ring = "var(--warn)";
                  bg = "var(--warn-bg)";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePick(i)}
                    disabled={selected !== null}
                    className="flex w-full items-start gap-3 rounded-[var(--radius-sm)] border p-3.5 text-left text-sm transition-colors disabled:cursor-default"
                    style={{
                      borderColor:
                        done && (correct || picked) ? ring : "var(--border-subtle)",
                      background: bg,
                      opacity: done && !picked && !correct ? 0.55 : 1,
                    }}
                  >
                    <span className="text-xs font-medium text-[var(--text-muted)] pt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="leading-relaxed text-[var(--text-secondary)]">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
                <p
                  className={`quiz-verdict ${selected === quiz.answer ? "quiz-verdict-ok" : "quiz-verdict-miss"}`}
                >
                  {selected === quiz.answer ? "Nailed it." : "Not quite — here's why:"}
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {quiz.explanation}
                </p>
                {!isLast && (
                  <button
                    onClick={handleNext}
                    className="btn-secondary mt-4 text-xs"
                  >
                    Next round →
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="quiz-complete">
            <p className="quiz-complete-score">
              {score === questions.length
                ? "Perfect run."
                : score >= questions.length / 2
                  ? "Solid — review the misses."
                  : "Worth another pass."}
            </p>
            <p className="quiz-complete-detail meta-mono">
              {score}/{questions.length} correct
            </p>
          </div>
        )}
      </div>
    </div>
  );
}