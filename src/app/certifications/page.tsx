import Link from "next/link";
import { certifications } from "@/data/certifications";
import { modules } from "@/data/modules";

export const metadata = {
  title: "Certifications — Azure AI Academy",
  description: "Exam prep roadmap for all Microsoft AI Engineer certifications",
};

export default function CertificationsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="page-header">
        <p className="section-label mb-3">Exam prep</p>
        <h1>Certification roadmap</h1>
        <p>
          Four credentials for the AI Engineer role on Microsoft Learn. This
          site maps every exam skill area to modules with code examples and
          knowledge checks. Passing score: 700 on all exams.
        </p>
      </header>

      <div className="mb-10 border border-[var(--warn)] bg-[var(--bg-code)] p-4 text-sm text-[var(--text-secondary)]">
        <span className="section-label text-[var(--warn)]">Note</span>
        <p className="mt-1">
          AI-102 retires June 30, 2026. If you haven&apos;t started, target
          AI-103 instead. AI-900 is replaced by AI-901 (updated April 2026).
        </p>
      </div>

      {certifications.map((cert) => {
        const coveredModules = cert.moduleSlugs
          .map((slug) => modules.find((m) => m.slug === slug))
          .filter(Boolean);

        return (
          <section key={cert.slug} className="mb-12">
            <div className="mb-4 flex flex-wrap items-baseline gap-3 border-b border-[var(--border)] pb-2">
              <Link
                href={`/certifications/${cert.slug}`}
                className="font-[family-name:var(--font-newsreader)] text-xl font-medium text-[var(--text)] no-underline hover:text-[var(--accent)]"
              >
                {cert.examCode}
              </Link>
              <span className="font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]">
                {cert.level} · {cert.duration}
              </span>
              {cert.status === "retiring" && (
                <span className="font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--warn)]">
                  retires {cert.retirementDate}
                </span>
              )}
            </div>

            <p className="mb-1 text-sm font-medium text-[var(--text)]">
              {cert.title}
            </p>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              {cert.description}
            </p>

            <p className="section-label mb-2">Skill areas</p>
            <div className="mb-4 space-y-2">
              {cert.skillAreas.map((area) => (
                <div
                  key={area.name}
                  className="flex gap-3 text-sm text-[var(--text-secondary)]"
                >
                  <span className="w-14 shrink-0 font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]">
                    {area.weight}
                  </span>
                  <span>{area.name}</span>
                </div>
              ))}
            </div>

            <p className="section-label mb-2">
              Study modules ({coveredModules.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {coveredModules.map((mod) => (
                <Link
                  key={mod!.slug}
                  href={`/learn/${mod!.slug}`}
                  className="border border-[var(--border)] px-2 py-1 font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)] no-underline hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {mod!.title}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}