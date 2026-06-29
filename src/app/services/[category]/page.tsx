import { notFound } from "next/navigation";
import Link from "next/link";
import { categories, getCategory } from "@/data/categories";
import { getModulesByCategory } from "@/data/modules/index";
import ModuleCard from "@/components/ModuleCard";
import CategoryHero from "@/components/CategoryHero";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Not Found" };
  return { title: `${cat.title} — Azure Academy`, description: cat.description };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const mods = getModulesByCategory(category);
  const moduleSlugs = mods.map((m) => m.slug);

  return (
    <div className="content py-12">
      <Link href="/services" className="back-link">
        ← all domains
      </Link>

      <CategoryHero category={cat} moduleSlugs={moduleSlugs} />

      <div className="mt-8">
        {mods.map((m, i) => (
          <ModuleCard key={m.slug} module={m} index={i} />
        ))}
      </div>
    </div>
  );
}