import { notFound } from "next/navigation";
import { modules, getModule } from "@/data/modules/index";
import { getCategory } from "@/data/categories";
import { getModuleHook } from "@/data/module-hooks";
import ModuleReader from "@/components/ModuleReader";

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
  return { title: `${mod.title} — Azure Academy`, description: mod.description };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const cat = getCategory(mod.category);
  const catMods = modules.filter((m) => m.category === mod.category);
  const modIndex = catMods.findIndex((m) => m.slug === slug);
  const hook = mod.hook ?? getModuleHook(slug);
  const next = modIndex < catMods.length - 1 ? catMods[modIndex + 1] : undefined;

  return (
    <div className="content module-page py-12">
      <ModuleReader
        mod={mod}
        hook={hook}
        categoryTitle={cat?.title}
        nextSlug={next?.slug}
        nextTitle={next?.title}
      />
    </div>
  );
}