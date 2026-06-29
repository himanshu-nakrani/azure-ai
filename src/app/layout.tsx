import type { Metadata } from "next";
import { Source_Sans_3, DM_Mono, Fraunces } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Azure Academy",
  description:
    "Complete learning reference for every major Azure service — compute, networking, storage, databases, AI, security, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${dmMono.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-[var(--border-subtle)] py-10">
          <div className="content">
            <p className="text-sm text-[var(--text-muted)]">
              Azure Academy — unofficial reference. Not affiliated with Microsoft.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}