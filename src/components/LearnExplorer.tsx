"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";
import { modules, getModulesByCategory } from "@/data/modules/index";
import { learningPaths } from "@/data/learning-paths";
import ModuleCard from "@/components/ModuleCard";
import { getOverallProgress } from "@/lib/progress";

const difficulties = ["all", "foundational", "intermediate", "advanced"] as const;

export default function LearnExplorer() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("all");
  const [activePath, setActivePath] = useState<string | null>(null);

  const allSlugs = modules.map((m) => m.slug);
  const [overall, setOverall] = useState({ visited: 0, completed: 0, percent: 0 });

  useEffect(() => {
    setOverall(getOverallProgress(allSlugs));
  }, [allSlugs]);

  const filtered = useMemo(() => {
    let list = modules;
    if (activePath) {
      const path = learningPaths.find((p) => p.slug === activePath);
      if (path) {
        const set = new Set(path.modules);
        list = list.filter((m) => set.has(m.slug));
      }
    }
    if (difficulty !== "all") {
      list = list.filter((m) => m.difficulty === difficulty);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.services.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list;
  }, [query, difficulty, activePath]);

  const grouped = categories
    .map((cat) => ({
      cat,
      mods: filtered.filter((m) => m.category === cat.slug),
    }))
    .filter((g) => g.mods.length > 0);

  return (
    <>
      <header className="learn-explorer-hero">
        <p className="section-label mb-3">Your playbook</p>
        <h1 className="hero-title">{modules.length} modules</h1>
        <p className="learn-explorer-sub">
          Scenario hooks, tap-to-reveal beats, and quick-fire rounds.
          {overall.visited > 0 && (
            <span className="learn-progress-pill">
              {overall.completed}/{modules.length} cleared · {overall.percent}%
            </span>
          )}
        </p>
      </header>

      <div className="explorer-controls">
        <input
          type="search"
          placeholder="Search services, topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="explorer-search"
        />
        <div className="explorer-filters">
          {difficulties.map((d) => (
            <button
              key={d}
              type="button"
              className={`filter-chip ${difficulty === d ? "filter-chip-active" : ""}`}
              onClick={() => setDifficulty(d)}
            >
              {d === "all" ? "All levels" : d}
            </button>
          ))}
        </div>
      </div>

      <div className="path-filter-row">
        <span className="meta-mono">Path filter</span>
        <button
          type="button"
          className={`filter-chip ${activePath === null ? "filter-chip-active" : ""}`}
          onClick={() => setActivePath(null)}
        >
          All
        </button>
        {learningPaths.map((p) => (
          <button
            key={p.slug}
            type="button"
            className={`filter-chip ${activePath === p.slug ? "filter-chip-active" : ""}`}
            onClick={() => setActivePath(p.slug)}
          >
            {p.title}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="explorer-empty">No modules match — try a different filter.</p>
      ) : activePath || query ? (
        <section className="mb-12">
          {filtered.map((m, i) => (
            <ModuleCard key={m.slug} module={m} index={i} />
          ))}
        </section>
      ) : (
        grouped.map(({ cat, mods }) => (
          <section key={cat.slug} className="mb-12">
            <Link
              href={`/services/${cat.slug}`}
              className="explorer-cat-head"
            >
              <span>{cat.icon}</span>
              <span className="explorer-cat-title">{cat.title}</span>
              <span className="meta-mono">{mods.length}</span>
            </Link>
            {mods.map((m, i) => (
              <ModuleCard key={m.slug} module={m} index={i} />
            ))}
          </section>
        ))
      )}
    </>
  );
}