import { notFound } from "next/navigation";
import Link from "next/link";
import { architectures, getArchitecture } from "@/data/architectures";
import MermaidDiagram from "@/components/MermaidDiagram";

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
  return { title: `${arch.title} — Azure AI Academy`, description: arch.description };
}

export default async function ArchitecturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const arch = getArchitecture(slug);
  if (!arch) notFound();

  const archIndex = architectures.findIndex((a) => a.slug === slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/architectures"
        className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
      >
        ← architectures
      </Link>

      <header className="page-header mt-6">
        <p className="section-label mb-3">
          Pattern A{archIndex + 1} · {arch.complexity} complexity
        </p>
        <h1>{arch.title}</h1>
        <p>{arch.description}</p>
        <p className="mt-3 font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]">
          {arch.useCase}
        </p>
      </header>

      <section className="mb-12">
        <p className="section-label mb-3">Diagram</p>
        <MermaidDiagram chart={arch.mermaidDiagram} />
      </section>

      <div className="grid gap-10 sm:grid-cols-2">
        <section>
          <p className="section-label mb-3">Design notes</p>
          <ul className="space-y-3">
            {arch.considerations.map((c) => (
              <li key={c} className="border-l border-[var(--border-strong)] pl-3 text-sm text-[var(--text-secondary)]">
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="section-label mb-3">Cost drivers</p>
          <ul className="space-y-3">
            {arch.costDrivers.map((c) => (
              <li key={c} className="border-l border-[var(--border-strong)] pl-3 text-sm text-[var(--text-secondary)]">
                {c}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10 border-t border-[var(--border)] pt-8">
        <p className="section-label mb-3">Services</p>
        <p className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-muted)]">
          {arch.services.join(" · ")}
        </p>
      </section>
    </div>
  );
}