"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ContinueLearning from "@/components/ContinueLearning";

const links = [
  { href: "/services", label: "Services" },
  { href: "/learn", label: "Modules" },
  { href: "/architectures", label: "Architectures" },
  { href: "/tools", label: "Tools" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="content flex h-[3.75rem] items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[1.0625rem] font-medium tracking-[-0.02em] text-[var(--text)] no-underline"
        >
          Azure Academy
        </Link>

        <div className="hidden items-center gap-6 md:flex">
        <ContinueLearning />
        <nav className="flex items-center gap-8">
          {links.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-[0.875rem] no-underline transition-colors ${
                  active
                    ? "font-medium text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        </div>

        <button
          className="text-sm text-[var(--text-muted)] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--border-subtle)] px-6 py-4 md:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-[var(--text-secondary)] no-underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}