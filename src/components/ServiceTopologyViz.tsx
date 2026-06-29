"use client";

import { useState } from "react";

interface ServiceNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "compute" | "ai" | "data" | "network" | "security";
  description: string;
}

const nodes: ServiceNode[] = [
  { id: "user", label: "Users", x: 50, y: 8, type: "network", description: "HTTPS via API Management." },
  { id: "apim", label: "API Mgmt", x: 50, y: 22, type: "network", description: "Rate limiting, auth, versioning." },
  { id: "app", label: "App Service", x: 50, y: 38, type: "compute", description: "Orchestration and streaming." },
  { id: "openai", label: "OpenAI", x: 20, y: 55, type: "ai", description: "GPT-4o + embeddings." },
  { id: "search", label: "AI Search", x: 50, y: 55, type: "ai", description: "Hybrid retrieval." },
  { id: "safety", label: "Safety", x: 80, y: 55, type: "security", description: "Content filtering." },
  { id: "blob", label: "Blob", x: 20, y: 75, type: "data", description: "Source documents." },
  { id: "cosmos", label: "Cosmos", x: 50, y: 75, type: "data", description: "Session state." },
  { id: "kv", label: "Key Vault", x: 80, y: 75, type: "security", description: "Secrets via MI." },
  { id: "insights", label: "Insights", x: 50, y: 92, type: "compute", description: "Token + latency tracing." },
];

const edges = [
  ["user", "apim"], ["apim", "app"], ["app", "openai"], ["app", "search"],
  ["app", "safety"], ["search", "blob"], ["app", "cosmos"], ["app", "kv"], ["app", "insights"],
] as const;

export default function ServiceTopologyViz() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const active = selected || hovered;
  const activeNode = nodes.find((n) => n.id === active);

  function connected(id: string): Set<string> {
    const set = new Set<string>();
    edges.forEach(([a, b]) => {
      if (a === id) set.add(b);
      if (b === id) set.add(a);
    });
    return set;
  }

  const conn = active ? connected(active) : new Set<string>();

  return (
    <div className="panel">
      <div className="panel-header">Service topology</div>
      <div className="panel-body">
        <div className="relative mx-auto max-w-md aspect-[5/4]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {edges.map(([from, to]) => {
              const a = nodes.find((n) => n.id === from)!;
              const b = nodes.find((n) => n.id === to)!;
              const lit = active && (from === active || to === active || (conn.has(from) && conn.has(to)));
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x} y1={a.y + 3} x2={b.x} y2={b.y - 3}
                  stroke={lit ? "var(--accent)" : "var(--border)"}
                  strokeWidth={lit ? 0.35 : 0.2}
                  className={lit ? "animate-flow" : ""}
                />
              );
            })}
            {nodes.map((node) => {
              const lit = active === node.id || conn.has(node.id);
              const dim = active && !lit;
              return (
                <g
                  key={node.id}
                  onClick={() => setSelected(selected === node.id ? null : node.id)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                  opacity={dim ? 0.25 : 1}
                >
                  <rect
                    x={node.x - 7} y={node.y - 3} width={14} height={6} rx={0}
                    fill={lit ? "var(--accent-soft)" : "var(--surface-muted)"}
                    stroke={lit ? "var(--accent)" : "var(--border)"}
                    strokeWidth={active === node.id ? 0.35 : 0.2}
                  />
                  <text x={node.x} y={node.y + 0.7} textAnchor="middle" fontSize={2.2}
                    fill={lit ? "var(--text)" : "var(--text-muted)"}
                    fontFamily="DM Mono, monospace"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          {activeNode
            ? activeNode.description
            : "Click a node to see its role and highlight connections."}
        </p>
      </div>
    </div>
  );
}