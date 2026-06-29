import RAGPipelineViz from "@/components/RAGPipelineViz";
import TokenFlowViz from "@/components/TokenFlowViz";
import ServiceTopologyViz from "@/components/ServiceTopologyViz";

export const metadata = {
  title: "Tools — Azure AI Academy",
  description: "Interactive Azure AI visualizations and calculators",
};

export default function VisualizationsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="page-header">
        <p className="section-label mb-3">Interactive</p>
        <h1>Tools</h1>
        <p>
          Three utilities for building intuition — not demos with fake data.
          Adjust parameters, click through pipeline stages, inspect service
          connections.
        </p>
      </header>

      <div className="space-y-10">
        <RAGPipelineViz />
        <TokenFlowViz />
        <ServiceTopologyViz />
      </div>
    </div>
  );
}