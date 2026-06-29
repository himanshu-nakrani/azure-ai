import { notFound } from "next/navigation";
import Link from "next/link";
import { architectures, getArchitecture } from "@/data/architectures";
import { getCategory } from "@/data/categories";
import MermaidDiagram from "@/components/MermaidDiagram";
import ArchitectureInsights from "@/components/ArchitectureInsights";

export function generateStaticParams() {
  return architectures.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const arch = getArchitecture(slug);
  if (!arch) return { title: "Not Found" };
  return { title: `${arch.title} — Azure Academy`, description: arch.description };
}

export default async function ArchitecturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const arch = getArchitecture(slug);
  if (!arch) notFound();

  const cat = getCategory(arch.category);

  return (
    <div className="content py-12">
      <Link href="/architectures" className="back-link">
        ← architectures
      </Link>

      <header className="module-hero mt-6">
        <div className="module-hero-meta">
          <span className={`difficulty-badge difficulty-${arch.complexity === "low" ? "foundational" : arch.complexity === "medium" ? "intermediate" : "advanced"}`}>
            {arch.complexity} complexity
          </span>
          <span className="meta-mono">{cat?.icon} {cat?.title}</span>
        </div>
        <h1 className="module-hero-title">{arch.title}</h1>
        <p className="module-hero-sub">{arch.description}</p>
        <p className="scenario-hook-challenge mt-4">
          <span className="scenario-hook-arrow">→</span>
          {arch.useCase}
        </p>
      </header>

      <section className="mb-12">
        <p className="section-label mb-3">Live diagram — click through the flow</p>
        <MermaidDiagram chart={arch.mermaidDiagram} />
      </section>

      <ArchitectureInsights
        considerations={arch.considerations}
        costDrivers={arch.costDrivers}
        services={arch.services}
      />
    </div>
  );
}