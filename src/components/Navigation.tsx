"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/certifications", label: "Exams" },
  { href: "/learn", label: "Modules" },
  { href: "/architectures", label: "Architectures" },
  { href: "/visualizations", label: "Tools" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-newsreader)] text-base font-medium text-[var(--text)] no-underline"
        >
          Azure AI Academy
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm no-underline transition-colors ${
                  active
                    ? "text-[var(--text)] border-b border-[var(--accent)] pb-0.5"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-muted)] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--border)] px-6 py-3 md:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-[var(--text-secondary)] no-underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}