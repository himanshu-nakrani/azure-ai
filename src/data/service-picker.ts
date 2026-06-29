export interface PickerScenario {
  id: string;
  prompt: string;
  context: string;
  options: { label: string; service: string; correct: boolean; why: string }[];
  moduleSlug: string;
}

export const pickerScenarios: PickerScenario[] = [
  {
    id: "async-order",
    prompt: "Process orders reliably — messages must not be lost, and failed jobs need a retry path.",
    context: "E-commerce checkout backend",
    options: [
      { label: "Event Grid", service: "Event Grid", correct: false, why: "Event Grid routes events but doesn't guarantee long-lived queue semantics for business workflows." },
      { label: "Service Bus", service: "Service Bus", correct: true, why: "Queues with peek-lock, dead-letter queues, and sessions — built for reliable async processing." },
      { label: "Event Hubs", service: "Event Hubs", correct: false, why: "Event Hubs is for high-throughput streaming ingestion, not transactional order queues." },
      { label: "Blob Storage", service: "Blob Storage", correct: false, why: "Blob triggers work for file events, not guaranteed message delivery between services." },
    ],
    moduleSlug: "messaging-events",
  },
  {
    id: "global-web",
    prompt: "Global web app needs CDN, WAF, and path-based routing to regional backends.",
    context: "SaaS with users in US, EU, and APAC",
    options: [
      { label: "Traffic Manager", service: "Traffic Manager", correct: false, why: "DNS-only routing — no CDN, WAF, or HTTP path routing." },
      { label: "Load Balancer", service: "Load Balancer", correct: false, why: "L4 only — no SSL termination, URL routing, or WAF." },
      { label: "Front Door", service: "Front Door", correct: true, why: "Global L7 with CDN, WAF, and path-based routing to regional origins." },
      { label: "Application Gateway", service: "Application Gateway", correct: false, why: "Regional L7 — great in one region, not global anycast." },
    ],
    moduleSlug: "load-balancing",
  },
  {
    id: "rag-search",
    prompt: "Chatbot must answer from internal PDFs with hybrid keyword + vector retrieval.",
    context: "Enterprise knowledge base",
    options: [
      { label: "Cosmos DB alone", service: "Cosmos DB", correct: false, why: "Cosmos can store vectors but lacks BM25, semantic ranker, and enrichment pipelines out of the box." },
      { label: "AI Search", service: "AI Search", correct: true, why: "Hybrid search, semantic ranking, indexers, and skillsets — purpose-built for RAG retrieval." },
      { label: "Blob Storage", service: "Blob Storage", correct: false, why: "Storage holds files; it doesn't search or rank document chunks." },
      { label: "Azure SQL", service: "Azure SQL", correct: false, why: "SQL full-text search isn't designed for vector + semantic RAG at scale." },
    ],
    moduleSlug: "ai-search-rag",
  },
  {
    id: "secrets",
    prompt: "App needs connection strings and API keys — no secrets in code or config files.",
    context: "Production microservice on App Service",
    options: [
      { label: "App Settings (plain)", service: "App Settings", correct: false, why: "App settings are visible in portal and deployment configs — not a secrets vault." },
      { label: "Key Vault + MI", service: "Key Vault", correct: true, why: "Centralized secrets with Managed Identity — apps never store credentials in code." },
      { label: "Environment variables in CI", service: "CI Variables", correct: false, why: "Still credentials in pipelines — rotation and audit are painful." },
      { label: "Encrypted config file in repo", service: "Config file", correct: false, why: "Keys in git history are a breach waiting to happen." },
    ],
    moduleSlug: "key-vault-security",
  },
  {
    id: "serverless-spike",
    prompt: "Run code on blob uploads, scale to zero, pay per execution — occasional traffic spikes.",
    context: "Image thumbnail generator",
    options: [
      { label: "VM Scale Set", service: "VM Scale Set", correct: false, why: "Always-on VMs — you pay even when no images arrive." },
      { label: "AKS", service: "AKS", correct: false, why: "Kubernetes overhead for a simple event handler is overkill." },
      { label: "Azure Functions", service: "Azure Functions", correct: true, why: "Blob trigger, consumption plan, scale to zero — ideal for sporadic event processing." },
      { label: "App Service always-on", service: "App Service", correct: false, why: "Always-on PaaS — works but you pay for idle time." },
    ],
    moduleSlug: "azure-functions",
  },
];