"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LearningModule } from "@/lib/types";
import { getModuleHook } from "@/data/module-hooks";
import { getModuleProgress } from "@/lib/progress";
import ProgressRing from "@/components/ProgressRing";

interface ModuleCardProps {
  module: LearningModule;
  index: number;
}

export default function ModuleCard({ module, index }: ModuleCardProps) {
  const hook = module.hook ?? getModuleHook(module.slug);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const p = getModuleProgress(module.slug);
    if (p) {
      setPercent(p.quizComplete ? 100 : p.scrollPercent);
    }
  }, [module.slug]);

  return (
    <Link href={`/learn/${module.slug}`} className="module-card">
      <div className="module-card-left">
        {percent > 0 ? (
          <ProgressRing percent={percent} size={28} stroke={2.5} />
        ) : (
          <span className="module-card-num">{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <div className="module-card-body">
        <div className="module-card-top">
          <h3 className="module-card-title">{module.title}</h3>
          <span className={`difficulty-badge difficulty-${module.difficulty}`}>
            {module.difficulty}
          </span>
        </div>
        {hook ? (
          <p className="module-card-hook">{hook.setup}</p>
        ) : (
          <p className="module-card-desc">{module.description}</p>
        )}
      </div>
      <span className="module-card-meta meta-mono">{module.duration}</span>
    </Link>
  );
}