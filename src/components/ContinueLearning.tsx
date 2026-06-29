"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLastModule, getModuleProgress } from "@/lib/progress";
import { getModule } from "@/data/modules/index";
import ProgressRing from "@/components/ProgressRing";

export default function ContinueLearning() {
  const [slug, setSlug] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const last = getLastModule();
    if (!last) return;
    const mod = getModule(last);
    if (!mod) return;
    setSlug(last);
    setPercent(getModuleProgress(last)?.scrollPercent ?? 0);
  }, []);

  if (!slug) return null;
  const mod = getModule(slug);
  if (!mod) return null;

  return (
    <Link href={`/learn/${slug}`} className="continue-link">
      <ProgressRing percent={percent} size={28} stroke={2.5} />
      <span className="continue-text">
        <span className="continue-label">Continue</span>
        <span className="continue-title">{mod.title}</span>
      </span>
    </Link>
  );
}