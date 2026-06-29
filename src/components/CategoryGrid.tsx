import Link from "next/link";
import { categories } from "@/data/categories";
import { getModulesByCategory } from "@/data/modules/index";
import { getCategoryHook } from "@/data/category-hooks";

export default function CategoryGrid() {
  return (
    <>
      <header className="services-hero">
        <p className="section-label mb-3">Nine domains</p>
        <h1 className="hero-title">Where does it hurt?</h1>
        <p className="services-hero-sub">
          Pick the domain that matches your problem — each category opens with
          a scenario and a trail of modules to work through.
        </p>
      </header>

      <div className="category-grid">
        {categories.map((cat) => {
          const mods = getModulesByCategory(cat.slug);
          const hook = getCategoryHook(cat.slug);
          return (
            <Link key={cat.slug} href={`/services/${cat.slug}`} className="category-tile">
              <span className="category-tile-icon">{cat.icon}</span>
              <h2 className="category-tile-title">{cat.title}</h2>
              {hook && (
                <p className="category-tile-hook">{hook.opener}</p>
              )}
              <span className="category-tile-meta meta-mono">
                {mods.length} modules
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}