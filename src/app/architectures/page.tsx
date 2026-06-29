import { architectures } from "@/data/architectures";
import { categories } from "@/data/categories";
import ArchitectureCard from "@/components/ArchitectureCard";

export const metadata = {
  title: "Architectures — Azure Academy",
  description: "Production-ready Azure architecture patterns",
};

export default function ArchitecturesPage() {
  const grouped = categories
    .map((cat) => ({
      category: cat,
      patterns: architectures.filter((a) => a.category === cat.slug),
    }))
    .filter((g) => g.patterns.length > 0);

  return (
    <div className="content py-12">
      <header className="arch-page-hero">
        <p className="section-label mb-3">Reference designs</p>
        <h1 className="hero-title">Patterns that survive production</h1>
        <p className="arch-page-sub">
          {architectures.length} architectures with live diagrams, design calls,
          and cost radar — not slide-deck fiction.
        </p>
      </header>

      {grouped.map(({ category, patterns }) => (
        <section key={category.slug} className="mb-14">
          <h2 className="explorer-cat-head mb-4">
            <span>{category.icon}</span>
            <span className="explorer-cat-title">{category.title}</span>
            <span className="meta-mono">{patterns.length}</span>
          </h2>
          <div className="arch-grid">
            {patterns.map((arch, i) => (
              <ArchitectureCard key={arch.slug} arch={arch} index={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}