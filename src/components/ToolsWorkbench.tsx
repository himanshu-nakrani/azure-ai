"use client";

import { useState } from "react";
import Link from "next/link";
import RAGPipelineViz from "@/components/RAGPipelineViz";
import TokenFlowViz from "@/components/TokenFlowViz";
import ServiceTopologyViz from "@/components/ServiceTopologyViz";
import ServicePicker from "@/components/ServicePicker";

const tools = [
  {
    id: "picker",
    label: "Service picker",
    tag: "Challenge",
    blurb: "Real scenarios — pick the Azure service that actually fits.",
    related: "messaging-events",
  },
  {
    id: "rag",
    label: "RAG pipeline",
    tag: "Simulate",
    blurb: "Step through retrieval-augmented generation end to end.",
    related: "ai-search-rag",
  },
  {
    id: "cost",
    label: "Token estimator",
    tag: "Calculate",
    blurb: "Model monthly OpenAI spend from traffic assumptions.",
    related: "azure-openai",
  },
  {
    id: "topology",
    label: "Service map",
    tag: "Explore",
    blurb: "Click nodes to trace dependencies in a production AI stack.",
    related: "kubernetes",
  },
] as const;

export default function ToolsWorkbench() {
  const [active, setActive] = useState<(typeof tools)[number]["id"]>("picker");

  return (
    <>
      <header className="tools-hero">
        <p className="section-label mb-3">Hands-on</p>
        <h1 className="hero-title">Break things safely</h1>
        <p className="tools-hero-sub">
          Simulators and challenges — tweak inputs, run sequences, and test
          whether you&apos;d pick the right service under pressure.
        </p>
      </header>

      <div className="tool-tabs">
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tool-tab ${active === t.id ? "tool-tab-active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            <span className="tool-tab-label">{t.label}</span>
            <span className="tool-tab-tag">{t.tag}</span>
          </button>
        ))}
      </div>

      <div className="tool-stage">
        {tools.map((t) => (
          <div key={t.id} className={active === t.id ? "tool-panel-active" : "tool-panel-hidden"}>
            <div className="tool-intro">
              <p>{t.blurb}</p>
              <Link href={`/learn/${t.related}`} className="tool-related-link">
                Related module →
              </Link>
            </div>
            {t.id === "picker" && <ServicePicker />}
            {t.id === "rag" && <RAGPipelineViz />}
            {t.id === "cost" && <TokenFlowViz />}
            {t.id === "topology" && <ServiceTopologyViz />}
          </div>
        ))}
      </div>
    </>
  );
}