import { modules } from "@/data/modules";
import ModuleCard from "@/components/ModuleCard";

export const metadata = {
  title: "Modules — Azure AI Academy",
  description: "Structured learning paths for AI engineers on Azure",
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="page-header">
        <p className="section-label mb-3">Syllabus</p>
        <h1>Modules</h1>
        <p>
          Fourteen modules mapped to AI-901, AI-102, AI-103, and AI-300 skills
          measured objectives. Code examples, exam traps, and knowledge checks
          in every module.
        </p>
      </header>

      <div>
        {modules.map((m, i) => (
          <ModuleCard key={m.slug} module={m} index={i} />
        ))}
      </div>
    </div>
  );
}