"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LearningModule, ModuleHook } from "@/lib/types";
import RichContent from "@/components/RichContent";
import KeyPointDeck from "@/components/KeyPointDeck";
import CodeBlock from "@/components/CodeBlock";
import QuizWidget from "@/components/QuizWidget";
import ScenarioHook from "@/components/ScenarioHook";
import { markModuleVisited, updateModuleScroll } from "@/lib/progress";

interface ModuleReaderProps {
  mod: LearningModule;
  hook?: ModuleHook;
  categoryTitle?: string;
  nextSlug?: string;
  nextTitle?: string;
}

export default function ModuleReader({
  mod,
  hook,
  categoryTitle,
  nextSlug,
  nextTitle,
}: ModuleReaderProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cleared, setCleared] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    markModuleVisited(mod.slug, 0);
  }, [mod.slug]);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(pct);
      updateModuleScroll(mod.slug, Math.round(pct));
      if (pct >= 88) setCleared(true);

      const offset = 120;
      let current = 0;
      sectionRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= offset) current = i;
      });
      setActiveSection(current);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [mod.slug]);

  return (
    <>
      <div className="read-progress" style={{ width: `${progress}%` }} />

      <div className="module-hero">
        <Link href={`/services/${mod.category}`} className="back-link">
          ← {categoryTitle ?? mod.category}
        </Link>
        <div className="module-hero-meta">
          <span className={`difficulty-badge difficulty-${mod.difficulty}`}>
            {mod.difficulty}
          </span>
          <span className="meta-mono">{mod.duration}</span>
        </div>
        <h1 className="module-hero-title">{mod.title}</h1>
        <p className="module-hero-sub">{mod.subtitle}</p>
        <div className="service-chips">
          {mod.services.map((s) => (
            <span key={s} className="service-chip">
              {s}
            </span>
          ))}
        </div>
      </div>

      {hook && <ScenarioHook hook={hook} />}

      <nav className="section-rail" aria-label="Module sections">
        {mod.sections.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`section-rail-item ${activeSection === i ? "section-rail-active" : ""} ${activeSection > i ? "section-rail-done" : ""}`}
            onClick={() => setActiveSection(i)}
          >
            <span className="section-rail-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="section-rail-title">{s.title}</span>
          </a>
        ))}
      </nav>

      <div className="module-sections">
        {mod.sections.map((section, i) => (
          <article
            key={section.id}
            id={section.id}
            ref={(el) => { sectionRefs.current[i] = el; }}
            className="module-beat scroll-mt-24"
          >
            <header className="beat-header">
              <span className="beat-index">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="beat-title">{section.title}</h2>
            </header>

            <RichContent content={section.content} collapsedAfter={4} />

            {section.warning && (
              <div className="pitfall-card">
                <span className="pitfall-icon">!</span>
                <div>
                  <p className="pitfall-label">Production pitfall</p>
                  <p className="pitfall-text">{section.warning}</p>
                </div>
              </div>
            )}

            {section.codeExample && (
              <details className="code-reveal">
                <summary className="code-reveal-trigger">
                  <span>See it in code</span>
                  <span className="code-reveal-hint meta-mono">expand</span>
                </summary>
                <div className="code-reveal-body">
                  <CodeBlock
                    code={section.codeExample}
                    language={
                      section.codeExample.trim().startsWith("{") ||
                      section.codeExample.trim().startsWith("[")
                        ? "json"
                        : section.codeExample.includes("resource ") ||
                            section.codeExample.includes("param ")
                          ? "bicep"
                          : "python"
                    }
                  />
                </div>
              </details>
            )}

            {section.keyPoints && section.keyPoints.length > 0 && (
              <KeyPointDeck points={section.keyPoints} />
            )}
          </article>
        ))}
      </div>

      {cleared && !mod.quiz?.length && (
        <div className="module-cleared">
          <span className="module-cleared-icon">✓</span>
          <p>Beat cleared — you made it through.</p>
        </div>
      )}

      {mod.quiz && mod.quiz.length > 0 && (
        <QuizWidget questions={mod.quiz} moduleSlug={mod.slug} />
      )}

      {nextSlug && nextTitle && (
        <Link href={`/learn/${nextSlug}`} className="next-module-card">
          <span className="next-module-label">Up next</span>
          <span className="next-module-title">{nextTitle}</span>
          <span className="next-module-arrow">→</span>
        </Link>
      )}
    </>
  );
}