import Link from "next/link";
import { categories } from "@/data/categories";
import { modules, getModulesByCategory } from "@/data/modules/index";
import { architectures } from "@/data/architectures";
import { learningPaths } from "@/data/learning-paths";
import LearningPathCard from "@/components/LearningPathCard";
import OverallProgress from "@/components/OverallProgress";

export default function Home() {
  return (
    <div className="content py-16">
      <header className="home-hero">
        <p className="section-label mb-4">Not another doc site</p>
        <h1 className="hero-title">
          Azure breaks in production.<br />
          Learn how before it does.
        </h1>
        <p className="home-hero-sub">
          Scenario-driven modules, interactive checkpoints, and tools that
          simulate real pipelines — {modules.length} beats across{" "}
          {categories.length} domains.
        </p>
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-num">{modules.length}</span>
            <span className="home-stat-label">modules</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">{architectures.length}</span>
            <span className="home-stat-label">architectures</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">3</span>
            <span className="home-stat-label">live tools</span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/learn/azure-openai" className="btn-primary">
            Jump into AI
          </Link>
          <Link href="/tools" className="btn-secondary">
            Play with tools
          </Link>
        </div>
      </header>

      <OverallProgress />

      <section className="mb-16 mt-12">
        <div className="section-head">
          <h2 className="section-label">Pick a path</h2>
        </div>
        <div className="path-grid">
          {learningPaths.map((path) => (
            <LearningPathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="section-head">
          <h2 className="section-label">Service categories</h2>
          <Link href="/services" className="meta-mono no-underline hover:text-[var(--accent)]">
            all {categories.length} →
          </Link>
        </div>
        {categories.map((cat) => {
          const count = getModulesByCategory(cat.slug).length;
          return (
            <Link
              key={cat.slug}
              href={`/services/${cat.slug}`}
              className="index-row"
            >
              <span className="num">{cat.icon}</span>
              <div>
                <div className="title">{cat.title}</div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {cat.description}
                </p>
              </div>
              <span className="meta">{count} modules</span>
            </Link>
          );
        })}
      </section>

      <section className="mb-16">
        <div className="section-head">
          <h2 className="section-label">Architecture patterns</h2>
          <Link href="/architectures" className="meta-mono no-underline hover:text-[var(--accent)]">
            explore →
          </Link>
        </div>
        {architectures.slice(0, 4).map((arch, i) => (
          <Link
            key={arch.slug}
            href={`/architectures/${arch.slug}`}
            className="index-row"
          >
            <span className="num">A{i + 1}</span>
            <div>
              <div className="title">{arch.title}</div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {arch.useCase}
              </p>
            </div>
            <span className="meta">{arch.complexity}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}