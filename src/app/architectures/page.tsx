import Link from "next/link";
import { architectures } from "@/data/architectures";

export const metadata = {
  title: "Architectures — Azure AI Academy",
  description: "Production-ready Azure AI architecture patterns",
};

export default function ArchitecturesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="page-header">
        <p className="section-label mb-3">Reference designs</p>
        <h1>Architecture patterns</h1>
        <p>
          Five production patterns with Mermaid diagrams, design notes, and cost
          drivers. Use these as starting points — not copy-paste blueprints.
        </p>
      </header>

      <div>
        {architectures.map((arch, i) => (
          <Link
            key={arch.slug}
            href={`/architectures/${arch.slug}`}
            className="index-row"
          >
            <span className="num">A{i + 1}</span>
            <div>
              <div className="title">{arch.title}</div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {arch.description}
              </p>
              <p className="mt-1 font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]">
                {arch.services.join(" · ")}
              </p>
            </div>
            <span className="meta">
              {arch.complexity}
              <br />
              {arch.services.length} svc
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}