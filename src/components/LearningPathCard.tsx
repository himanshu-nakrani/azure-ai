import Link from "next/link";
import { LearningPath } from "@/lib/types";
import { getModule } from "@/data/modules/index";

interface LearningPathCardProps {
  path: LearningPath;
}

export default function LearningPathCard({ path }: LearningPathCardProps) {
  const first = getModule(path.modules[0]);

  return (
    <Link href={`/learn/${path.modules[0]}`} className="path-card">
      <div className="path-card-header">
        <span className="path-card-label">Learning path</span>
        <span className="path-card-count meta-mono">
          {path.modules.length} modules
        </span>
      </div>
      <h3 className="path-card-title">{path.title}</h3>
      <p className="path-card-tagline">{path.tagline}</p>
      <div className="path-card-trail">
        {path.modules.map((slug, i) => {
          const mod = getModule(slug);
          return (
            <span key={slug} className="path-step">
              {i > 0 && <span className="path-step-line" />}
              <span className="path-step-dot" title={mod?.title} />
            </span>
          );
        })}
      </div>
      {first && (
        <span className="path-card-cta">
          Start with {first.title} →
        </span>
      )}
    </Link>
  );
}