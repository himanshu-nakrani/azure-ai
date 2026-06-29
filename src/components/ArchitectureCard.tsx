import Link from "next/link";
import { ArchitecturePattern } from "@/lib/types";

const complexityColors = {
  low: "foundational",
  medium: "intermediate",
  high: "advanced",
} as const;

interface ArchitectureCardProps {
  arch: ArchitecturePattern;
  index: number;
}

export default function ArchitectureCard({ arch, index }: ArchitectureCardProps) {
  return (
    <Link href={`/architectures/${arch.slug}`} className="arch-card">
      <div className="arch-card-top">
        <span className="arch-card-num">A{index + 1}</span>
        <span className={`difficulty-badge difficulty-${complexityColors[arch.complexity]}`}>
          {arch.complexity}
        </span>
      </div>
      <h3 className="arch-card-title">{arch.title}</h3>
      <p className="arch-card-use">{arch.useCase}</p>
      <div className="arch-card-services">
        {arch.services.slice(0, 4).map((s) => (
          <span key={s} className="service-chip">{s}</span>
        ))}
        {arch.services.length > 4 && (
          <span className="service-chip">+{arch.services.length - 4}</span>
        )}
      </div>
      <span className="arch-card-cta">Explore pattern →</span>
    </Link>
  );
}