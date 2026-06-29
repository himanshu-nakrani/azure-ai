import { notFound } from "next/navigation";
import Link from "next/link";
import { modules, getModule } from "@/data/modules";
import CodeBlock from "@/components/CodeBlock";
import QuizWidget from "@/components/QuizWidget";

export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) return { title: "Not Found" };
  return { title: `${mod.title} — Azure AI Academy`, description: mod.description };
}

function renderContent(content: string) {
  const paragraphs = content.split("\n\n");
  return paragraphs.map((para, i) => {
    if (para.startsWith("|")) {
      const rows = para.split("\n").filter((r) => !r.match(/^\|[-| ]+\|$/));
      const headers = rows[0]?.split("|").filter(Boolean).map((h) => h.trim());
      const body = rows.slice(1);
      return (
        <table key={i}>
          <thead>
            <tr>{headers?.map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((row, ri) => {
              const cells = row.split("|").filter(Boolean).map((c) => c.trim());
              return (
                <tr key={ri}>
                  {cells.map((c, ci) => (
                    <td key={ci}>
                      {c.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").split("<strong>").map((part, pi) => {
                        if (part.includes("</strong>")) {
                          const [bold, rest] = part.split("</strong>");
                          return <span key={pi}><strong>{bold}</strong>{rest}</span>;
                        }
                        return <span key={pi}>{part}</span>;
                      })}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    const html = para
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/(<li.*<\/li>\n?)+/g, '<ul class="mb-4 space-y-1">$&</ul>');

    return <p key={i} className="prose-content" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const modIndex = modules.findIndex((m) => m.slug === slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/learn"
        className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-muted)] no-underline hover:text-[var(--accent)]"
      >
        ← modules
      </Link>

      <header className="page-header mt-6">
        <p className="section-label mb-3">
          Module {String(modIndex + 1).padStart(2, "0")} · {mod.difficulty} · {mod.duration}
        </p>
        <h1>{mod.title}</h1>
        <p className="italic text-[var(--text-secondary)]">{mod.subtitle}</p>
        <p className="mt-3 font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)]">
          Exams: {mod.exams.join(", ")} · {mod.services.join(" · ")}
        </p>
      </header>

      <nav className="panel mb-12">
        <div className="panel-header">Contents</div>
        <div className="panel-body">
          <ol className="m-0 list-none space-y-2 p-0">
            {mod.sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-secondary)] no-underline hover:text-[var(--accent)]"
                >
                  {String(i + 1).padStart(2, "0")} {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="space-y-14">
        {mod.sections.map((section, i) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <h2 className="mb-5 font-[family-name:var(--font-newsreader)] text-xl font-medium text-[var(--text)]">
              <span className="mr-3 font-[family-name:var(--font-ibm-mono)] text-sm text-[var(--text-muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.title}
            </h2>

            <div className="prose-content mb-6">{renderContent(section.content)}</div>

            {section.keyPoints && (
              <div className="mb-6 border-l-2 border-[var(--accent)] pl-4">
                <p className="section-label mb-2">Takeaways</p>
                <ul className="space-y-1.5">
                  {section.keyPoints.map((point) => (
                    <li key={point} className="text-sm text-[var(--text-secondary)]">{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {section.warning && (
              <div className="mb-6 border border-[var(--warn)] bg-[var(--bg-code)] p-4">
                <p className="section-label mb-1 text-[var(--warn)]">Warning</p>
                <p className="text-sm text-[var(--text-secondary)]">{section.warning}</p>
              </div>
            )}

            {section.codeExample && (
              <div className="mb-6">
                <p className="section-label mb-2">Example</p>
                <CodeBlock
                  code={section.codeExample}
                  language={section.codeExample.trim().startsWith("{") ? "json" : "python"}
                />
              </div>
            )}
          </section>
        ))}
      </div>

      {mod.quiz && mod.quiz.length > 0 && (
        <QuizWidget
          question={mod.quiz[0].question}
          options={mod.quiz[0].options}
          answer={mod.quiz[0].answer}
          explanation={mod.quiz[0].explanation}
        />
      )}
    </div>
  );
}