"use client";

import { useEffect, useState } from "react";
import { ServiceCategory } from "@/lib/types";
import { getCategoryHook } from "@/data/category-hooks";
import { getCategoryProgress } from "@/lib/progress";
import ProgressBar from "@/components/ProgressBar";

interface CategoryHeroProps {
  category: ServiceCategory;
  moduleSlugs: string[];
}

export default function CategoryHero({ category, moduleSlugs }: CategoryHeroProps) {
  const [progressPercent, setProgressPercent] = useState(0);
  const hook = getCategoryHook(category.slug);

  useEffect(() => {
    setProgressPercent(getCategoryProgress(moduleSlugs));
  }, [moduleSlugs]);

  return (
    <header className="category-hero">
      <p className="section-label mb-3">
        {category.icon} {category.services.length} services · {moduleSlugs.length} modules
      </p>
      <h1 className="module-hero-title">{category.title}</h1>
      {hook ? (
        <div className="category-hook">
          <p className="category-hook-opener">{hook.opener}</p>
          <p className="category-hook-punch">{hook.punchline}</p>
        </div>
      ) : (
        <p className="module-hero-sub">{category.description}</p>
      )}
      <div className="service-chips service-chips-lg">
        {category.services.map((s) => (
          <span key={s} className="service-chip">{s}</span>
        ))}
      </div>
      {progressPercent > 0 && (
        <div className="category-progress">
          <ProgressBar percent={progressPercent} label="Your progress in this category" />
        </div>
      )}
    </header>
  );
}