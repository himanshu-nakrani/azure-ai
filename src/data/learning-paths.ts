import { LearningPath } from "@/lib/types";

export const learningPaths: LearningPath[] = [
  {
    slug: "ship-ai",
    title: "Ship an AI feature",
    tagline: "From embeddings to production RAG in one arc",
    modules: ["azure-openai", "ai-search-rag", "api-management", "monitoring"],
  },
  {
    slug: "lock-it-down",
    title: "Lock it down",
    tagline: "Zero-trust networking and identity without outages",
    modules: ["entra-id-rbac", "key-vault-security", "hybrid-connectivity", "policy-cost"],
  },
  {
    slug: "scale-compute",
    title: "Scale compute",
    tagline: "VMs → PaaS → serverless — pick the right layer",
    modules: ["virtual-machines", "app-service", "azure-functions", "kubernetes"],
  },
  {
    slug: "data-layer",
    title: "Build the data layer",
    tagline: "SQL, Cosmos, cache, and storage that survive traffic spikes",
    modules: ["azure-sql", "cosmos-db", "postgresql-redis", "blob-storage"],
  },
];