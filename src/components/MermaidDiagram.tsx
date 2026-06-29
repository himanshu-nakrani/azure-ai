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
            primaryColor: "#f3f2ef",
            primaryTextColor: "#1a1a18",
            primaryBorderColor: "#e6e4df",
            lineColor: "#8a8a85",
            secondaryColor: "#ffffff",
            tertiaryColor: "#f9f8f6",
            background: "#ffffff",
            mainBkg: "#f3f2ef",
            nodeBorder: "#e6e4df",
            clusterBkg: "#f9f8f6",
            clusterBorder: "#eeece8",
            titleColor: "#5a5a56",
            edgeLabelBackground: "#ffffff",
            fontFamily: "Source Sans 3, sans-serif",
            fontSize: "13px",
          },
          flowchart: { curve: "basis", padding: 16 },
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
      <div className="callout-warn text-sm text-[var(--warn)]">
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