import Link from "next/link";
import { modules } from "@/data/modules";
import { architectures } from "@/data/architectures";
import ModuleCard from "@/components/ModuleCard";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-16">
        <p className="section-label mb-4">Reference for AI engineers</p>
        <h1 className="font-[family-name:var(--font-newsreader)] text-[2.75rem] font-medium leading-[1.15] tracking-[-0.02em] text-[var(--text)] sm:text-5xl">
          Learn to ship AI systems on Azure
        </h1>
        <p className="mt-5 max-w-xl text-[var(--text-secondary)] leading-relaxed">
          14 modules aligned to AI-901, AI-102, AI-103, and AI-300 exam skills
          measured objectives. Computer vision, speech, agents, document
          extraction, MLOps, and GenAIOps — not just OpenAI chat wrappers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/certifications" className="btn-primary">
            Certification roadmap
          </Link>
          <Link href="/learn/ai-fundamentals" className="btn-secondary">
            Start AI-901 prep
          </Link>
        </div>
      </header>

      <section className="mb-16">
        <div className="mb-4 flex items-baseline justify-between border-b border-[var(--border)] pb-2">
          <h2 className="section-label">Exams covered</h2>
          <Link
            href="/certifications"
            className="font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
          >
            full roadmap →
          </Link>
        </div>
        <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
          {[
            { code: "AI-901", name: "AI Fundamentals", status: "active" },
            { code: "AI-102", name: "AI Engineer", status: "retiring Jun 2026" },
            { code: "AI-103", name: "AI Apps & Agents", status: "active" },
            { code: "AI-300", name: "MLOps / GenAIOps", status: "active" },
          ].map((exam) => (
            <Link
              key={exam.code}
              href={`/certifications/${exam.code.toLowerCase()}`}
              className="bg-[var(--bg-raised)] p-4 no-underline hover:bg-[var(--bg-code)]"
            >
              <span className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--accent)]">
                {exam.code}
              </span>
              <p className="mt-1 text-sm text-[var(--text)]">{exam.name}</p>
              <p className="mt-0.5 font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]">
                {exam.status}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <div className="mb-4 flex items-baseline justify-between border-b border-[var(--border)] pb-2">
          <h2 className="section-label">Modules</h2>
          <Link
            href="/learn"
            className="font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
          >
            all 6 →
          </Link>
        </div>
        {modules.map((m, i) => (
          <ModuleCard key={m.slug} module={m} index={i} />
        ))}
      </section>

      <section className="mb-16">
        <div className="mb-4 flex items-baseline justify-between border-b border-[var(--border)] pb-2">
          <h2 className="section-label">Architecture patterns</h2>
          <Link
            href="/architectures"
            className="font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
          >
            all 5 →
          </Link>
        </div>
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
                {arch.useCase}
              </p>
            </div>
            <span className="meta">{arch.complexity}</span>
          </Link>
        ))}
      </section>

      <section className="border-t border-[var(--border)] pt-10">
        <h2 className="section-label mb-3">Interactive tools</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Step through a RAG pipeline, map service dependencies, and estimate
          token costs across model tiers.
        </p>
        <Link href="/visualizations" className="btn-secondary">
          Open tools
        </Link>
      </section>
    </div>
  );
}