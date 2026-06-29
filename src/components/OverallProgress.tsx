"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { modules } from "@/data/modules/index";
import { getOverallProgress } from "@/lib/progress";
import ProgressBar from "@/components/ProgressBar";

export default function OverallProgress() {
  const [stats, setStats] = useState({ visited: 0, completed: 0, percent: 0 });

  useEffect(() => {
    setStats(getOverallProgress(modules.map((m) => m.slug)));
  }, []);

  if (stats.visited === 0) return null;

  return (
    <div className="overall-progress">
      <div className="overall-progress-head">
        <span className="section-label">Your run</span>
        <Link href="/learn" className="meta-mono hover:text-[var(--accent)]">
          all modules →
        </Link>
      </div>
      <ProgressBar
        percent={stats.percent}
        label={`${stats.completed} of ${modules.length} cleared`}
      />
    </div>
  );
}