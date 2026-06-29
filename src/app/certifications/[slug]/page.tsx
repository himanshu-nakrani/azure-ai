import { notFound } from "next/navigation";
import Link from "next/link";
import { certifications, getCertification } from "@/data/certifications";
import { modules } from "@/data/modules";

export function generateStaticParams() {
  return certifications.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cert = getCertification(slug);
  if (!cert) return { title: "Not Found" };
  return {
    title: `${cert.examCode} Exam Prep — Azure AI Academy`,
    description: cert.description,
  };
}

export default async function CertificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cert = getCertification(slug);
  if (!cert) notFound();

  const studyModules = cert.moduleSlugs
    .map((s) => modules.find((m) => m.slug === s))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/certifications"
        className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
      >
        ← certifications
      </Link>

      <header className="page-header mt-6">
        <p className="section-label mb-3">
          {cert.examCode} · {cert.level} · {cert.duration} · pass {cert.passingScore}+
        </p>
        <h1>{cert.title}</h1>
        <p>{cert.description}</p>
        {cert.status === "retiring" && (
          <p className="mt-3 text-sm text-[var(--warn)]">
            Retires {cert.retirementDate}. Migrate study plan to AI-103.
          </p>
        )}
      </header>

      <section className="mb-12">
        <p className="section-label mb-4">Skills measured</p>
        {cert.skillAreas.map((area) => (
          <div key={area.name} className="mb-6">
            <div className="mb-2 flex items-baseline gap-3">
              <h2 className="text-sm font-medium text-[var(--text)]">
                {area.name}
              </h2>
              <span className="font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]">
                {area.weight}
              </span>
            </div>
            <ul className="space-y-1">
              {area.topics.map((topic) => (
                <li
                  key={topic}
                  className="border-l border-[var(--border-strong)] pl-3 text-sm text-[var(--text-secondary)]"
                >
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <p className="section-label mb-4">Recommended study order</p>
        {studyModules.map((mod, i) => (
          <Link
            key={mod!.slug}
            href={`/learn/${mod!.slug}`}
            className="index-row"
          >
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="title">{mod!.title}</div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {mod!.description}
              </p>
            </div>
            <span className="meta">{mod!.duration}</span>
          </Link>
        ))}
      </section>

      <section className="border-t border-[var(--border)] pt-8">
        <p className="section-label mb-3">Official resources</p>
        <div className="space-y-2">
          <a
            href={cert.studyGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-[var(--accent)]"
          >
            Microsoft study guide →
          </a>
          <a
            href={cert.certUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-[var(--accent)]"
          >
            Certification details →
          </a>
        </div>
      </section>
    </div>
  );
}