export const categoryHooks: Record<string, { opener: string; punchline: string }> = {
  compute: {
    opener: "Your app needs to run somewhere.",
    punchline: "VMs, PaaS, serverless, or containers — each layer trades control for convenience.",
  },
  networking: {
    opener: "It worked on your laptop. Production can't reach the database.",
    punchline: "VNets, NSGs, load balancers, and Private Link — the plumbing nobody sees until it breaks.",
  },
  storage: {
    opener: "The bill arrived. Blob storage cost more than the app.",
    punchline: "Tiers, lifecycle policies, and access patterns determine whether storage saves or sinks you.",
  },
  databases: {
    opener: "One bad partition key. Forty thousand 429 errors.",
    punchline: "SQL, Cosmos, Postgres, Redis — pick the data model before the data picks you.",
  },
  "ai-ml": {
    opener: "The demo wowed leadership. Production got rate-limited and sued by its own chatbot.",
    punchline: "OpenAI, search, agents, and MLOps — ship intelligence with guardrails.",
  },
  "identity-security": {
    opener: "Someone pasted a connection string in Slack.",
    punchline: "Entra ID, RBAC, Key Vault, and zero trust — assume breach, verify everything.",
  },
  integration: {
    opener: "The order was charged twice. The event was delivered three times.",
    punchline: "Queues, events, streams, and API gateways — async done right is idempotent.",
  },
  devops: {
    opener: "Users noticed the outage before the alert fired.",
    punchline: "Monitor, trace, automate, and deploy without rolling back your hotfix.",
  },
  governance: {
    opener: "Forty-seven subscriptions. Zero tags. One person named Owner.",
    punchline: "Landing zones, policies, and FinOps — organize Azure before it organizes your budget for you.",
  },
};

export function getCategoryHook(slug: string) {
  return categoryHooks[slug];
}