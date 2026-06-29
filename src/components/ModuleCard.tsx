import Link from "next/link";
import { LearningModule } from "@/lib/types";

interface ModuleCardProps {
  module: LearningModule;
  index: number;
}

export default function ModuleCard({ module, index }: ModuleCardProps) {
  return (
    <Link href={`/learn/${module.slug}`} className="index-row">
      <span className="num">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <div className="title">{module.title}</div>
        <p className="mt-1 text-sm text-[var(--text-secondary)] leading-snug">
          {module.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {module.services.slice(0, 4).map((s) => (
            <span
              key={s}
              className="font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <span className="meta">
        {module.exams.join(", ")}
        <br />
        {module.duration}
      </span>
    </Link>
  );
}