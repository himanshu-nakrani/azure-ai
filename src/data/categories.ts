import { ServiceCategory } from "@/lib/types";

export const categories: ServiceCategory[] = [
  {
    slug: "compute",
    title: "Compute",
    description:
      "Virtual machines, containers, serverless functions, and Kubernetes — how to run workloads on Azure.",
    icon: "▣",
    services: ["Virtual Machines", "App Service", "Azure Functions", "AKS", "Container Apps", "Batch"],
  },
  {
    slug: "networking",
    title: "Networking",
    description:
      "Virtual networks, load balancing, hybrid connectivity, DNS, and traffic management across regions.",
    icon: "◎",
    services: ["Virtual Network", "Load Balancer", "Application Gateway", "Front Door", "VPN Gateway", "Private Link"],
  },
  {
    slug: "storage",
    title: "Storage",
    description:
      "Object, file, queue, and table storage plus managed disks and data lake patterns.",
    icon: "▤",
    services: ["Blob Storage", "Azure Files", "Queue Storage", "Table Storage", "Data Lake Gen2", "Managed Disks"],
  },
  {
    slug: "databases",
    title: "Databases",
    description:
      "Relational, NoSQL, cache, and globally distributed database services with HA and scaling patterns.",
    icon: "▥",
    services: ["Azure SQL", "Cosmos DB", "PostgreSQL", "MySQL", "Azure Cache for Redis"],
  },
  {
    slug: "ai-ml",
    title: "AI & Machine Learning",
    description:
      "OpenAI, AI Search, Microsoft Foundry, cognitive services, and Azure Machine Learning pipelines.",
    icon: "◈",
    services: ["Azure OpenAI", "AI Search", "Microsoft Foundry", "Azure ML", "Document Intelligence"],
  },
  {
    slug: "identity-security",
    title: "Identity & Security",
    description:
      "Entra ID, RBAC, Key Vault, network security, and zero-trust patterns for Azure workloads.",
    icon: "◉",
    services: ["Microsoft Entra ID", "Key Vault", "Defender for Cloud", "Managed Identity", "Private Link"],
  },
  {
    slug: "integration",
    title: "Integration & Messaging",
    description:
      "Event-driven architectures with Service Bus, Event Grid, Event Hubs, API Management, and Logic Apps.",
    icon: "⇄",
    services: ["Service Bus", "Event Grid", "Event Hubs", "API Management", "Logic Apps"],
  },
  {
    slug: "devops",
    title: "DevOps & Observability",
    description:
      "CI/CD pipelines, infrastructure as code, monitoring, logging, and alerting for production systems.",
    icon: "◐",
    services: ["Azure Monitor", "Application Insights", "Log Analytics", "Azure DevOps", "GitHub Actions"],
  },
  {
    slug: "governance",
    title: "Governance & Management",
    description:
      "Subscriptions, resource groups, policies, landing zones, cost management, and enterprise-scale organization.",
    icon: "▦",
    services: ["Azure Policy", "Management Groups", "Cost Management", "ARM/Bicep", "Landing Zones"],
  },
];

export function getCategory(slug: string): ServiceCategory | undefined {
  return categories.find((c) => c.slug === slug);
}