import type { Metadata } from "next";
import { Source_Sans_3, IBM_Plex_Mono, Newsreader } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Azure AI Academy",
  description:
    "Technical reference for AI engineers building on Azure — modules, architectures, and interactive tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${ibmMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] py-8">
          <div className="mx-auto max-w-3xl px-6">
            <p className="font-[family-name:var(--font-ibm-mono)] text-xs text-[var(--text-muted)]">
              Azure AI Academy — unofficial learning reference. Not affiliated with Microsoft.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}