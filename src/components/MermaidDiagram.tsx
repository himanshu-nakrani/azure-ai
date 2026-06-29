"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#161614",
            primaryTextColor: "#e8e6e1",
            primaryBorderColor: "#3d3d38",
            lineColor: "#6b6962",
            secondaryColor: "#1a1a18",
            tertiaryColor: "#0e0e0d",
            background: "#161614",
            mainBkg: "#161614",
            nodeBorder: "#3d3d38",
            clusterBkg: "#0e0e0d",
            clusterBorder: "#2a2a26",
            titleColor: "#9c9a93",
            edgeLabelBackground: "#161614",
            fontFamily: "Source Sans 3, sans-serif",
            fontSize: "13px",
          },
          flowchart: { curve: "linear", padding: 12 },
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="border border-[var(--warn)] bg-[var(--bg-code)] p-4 text-sm text-[var(--warn)]">
        Diagram error: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`diagram-container panel overflow-x-auto ${className}`}
    >
      <div className="panel-body" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}