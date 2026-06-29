"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    id: "query",
    label: "Query",
    description: "Request hits API Management — auth, rate limits, logging.",
    services: ["API Management"],
  },
  {
    id: "embed",
    label: "Embed",
    description: "Query vectorized with text-embedding-3-small (1536 dims).",
    services: ["Azure OpenAI"],
  },
  {
    id: "search",
    label: "Retrieve",
    description: "Hybrid vector + BM25 search, fused with RRF, semantic rerank.",
    services: ["AI Search"],
  },
  {
    id: "context",
    label: "Assemble",
    description: "Top 3–5 chunks injected into prompt with source metadata.",
    services: ["App Service"],
  },
  {
    id: "generate",
    label: "Generate",
    description: "GPT-4o completion streamed back via SSE.",
    services: ["Azure OpenAI"],
  },
  {
    id: "filter",
    label: "Filter",
    description: "Output scanned by Content Safety before delivery.",
    services: ["Content Safety"],
  },
];

export default function RAGPipelineViz() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  function play() {
    setPlaying(true);
    setActive(0);
    let step = 0;
    const id = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(id);
        setPlaying(false);
        return;
      }
      setActive(step);
    }, 1200);
  }

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <span>RAG pipeline</span>
        <button
          onClick={play}
          disabled={playing}
          className="font-mono text-[0.625rem] text-[var(--accent)] disabled:opacity-40"
        >
          {playing ? "running…" : "run sequence"}
        </button>
      </div>
      <div className="panel-body">
        <div className="mb-6 flex gap-0 border-b border-[var(--border-subtle)]">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className={`flex-1 border-b-2 px-1 pb-3 text-center transition-colors ${
                i === active
                  ? "border-[var(--accent)] text-[var(--text)]"
                  : i < active
                    ? "border-[var(--border)] text-[var(--text-secondary)]"
                    : "border-transparent text-[var(--text-muted)]"
              }`}
            >
              <span className="block font-mono text-[0.625rem]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-1 block text-xs">{s.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {steps[active].description}
            </p>
            <p className="mt-3 meta-mono">
              {steps[active].services.join(" → ")}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}