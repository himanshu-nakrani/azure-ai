import { ModuleHook } from "@/lib/types";

export const moduleHooks: Record<string, ModuleHook> = {
  "virtual-machines": {
    setup: "Friday 4:47 PM. Production is crawling. CPU pegged at 100% — but you're on B-series burstable VMs and the credits just ran out.",
    challenge: "Pick the right VM series, disk tier, and HA layout before the next outage.",
  },
  "app-service": {
    setup: "Deploy succeeded. Users still see the old version. Someone swapped staging into production without checking slot-sticky settings.",
    challenge: "Ship with zero downtime and know when PaaS beats running your own VMs.",
  },
  "azure-functions": {
    setup: "A blob lands in storage. Three seconds later… nothing. Cold start? Dead letter queue? Wrong trigger binding?",
    challenge: "Wire event-driven compute that scales to zero without waking up at 3 AM.",
  },
  kubernetes: {
    setup: "kubectl get pods — CrashLoopBackOff. Again. Is it the image, the secret, the network policy, or Tuesday?",
    challenge: "Choose between AKS, Container Apps, and ACI without Kubernetes fatigue.",
  },
  "virtual-networks": {
    setup: "App can't reach SQL. NSG says allow. Route table says nope. Private Endpoint DNS resolves to… nothing.",
    challenge: "Design VNets that don't become a troubleshooting maze.",
  },
  "load-balancing": {
    setup: "Users in Tokyo wait 800ms. Users in Virginia fly. Same app, same code — wrong load balancer tier.",
    challenge: "Match L4 vs L7 vs global routing to where your traffic actually lives.",
  },
  "hybrid-connectivity": {
    setup: "You disabled public access on SQL. Brave. Nobody tested DNS from the app subnet first.",
    challenge: "Connect on-prem to Azure and lock down PaaS without self-inflicted outages.",
  },
  "blob-storage": {
    setup: "Finance opens the invoice: $47,000 for blob storage. Turns out nobody set lifecycle policies on the logging bucket.",
    challenge: "Pick tiers, redundancy, and access patterns that scale without surprise bills.",
  },
  "files-and-disks": {
    setup: "The legacy app needs an SMB share. The DBA needs sub-millisecond disk. Same project, different storage religion.",
    challenge: "Bridge lift-and-shift file shares with modern managed disks.",
  },
  "azure-sql": {
    setup: "Failover happened. DNS didn't. The readable secondary exists but the app still points at a dead primary.",
    challenge: "Run SQL on Azure with HA, security, and scaling that survives real DR drills.",
  },
  "cosmos-db": {
    setup: "429 throttling. One partition eating 80% of your RUs. The partition key? `status: active`.",
    challenge: "Design partition keys and consistency levels you won't regret at 2 AM.",
  },
  "postgresql-redis": {
    setup: "Cache hit rate: 12%. Database melting. Someone cached the entire user object graph with no TTL.",
    challenge: "Pair PostgreSQL + Redis without cache stampedes or vector-search regrets.",
  },
  "azure-openai": {
    setup: "The demo worked. Production hit 429 rate limits, leaked an API key in the browser, and hallucinated HR policy.",
    challenge: "Ship LLM inference with quotas, auth, and guardrails that legal won't hate.",
  },
  "ai-search-rag": {
    setup: "The chatbot confidently cites a document from 2019 that was deleted last month. Retrieval is broken, not the model.",
    challenge: "Build hybrid search + RAG that actually grounds answers in your data.",
  },
  "microsoft-foundry": {
    setup: "The agent looped 47 times, burned $200 in tokens, and never called the tool it needed.",
    challenge: "Use Foundry hubs, agents, and Prompt Flow without infinite loops or mystery bills.",
  },
  "azure-machine-learning": {
    setup: "Model accuracy dropped 12 points last week. Nobody noticed until customers did.",
    challenge: "Train, deploy, and monitor ML with MLOps that catches drift before users do.",
  },
  "entra-id-rbac": {
    setup: "Intern got Contributor on the production subscription. 'It was just for testing.'",
    challenge: "Lock down identity with RBAC, Managed Identity, and least privilege that scales.",
  },
  "key-vault-security": {
    setup: "Secrets in environment variables. Keys in git history. Vault deleted without purge protection.",
    challenge: "Centralize secrets and harden the perimeter without locking yourself out.",
  },
  "messaging-events": {
    setup: "Order placed. Charged twice. The handler wasn't idempotent and Event Grid delivered twice.",
    challenge: "Pick Service Bus vs Event Grid vs Event Hubs for the right async pattern.",
  },
  "api-management": {
    setup: "Partner API key leaked on GitHub. 2 million calls before anyone noticed. No rate limits.",
    challenge: "Gate APIs with policies, quotas, and auth that survive real abuse.",
  },
  monitoring: {
    setup: "Outage lasted 40 minutes. Alert fired 35 minutes in. The KQL query was wrong.",
    challenge: "See failures before users tweet about them.",
  },
  "cicd-iac": {
    setup: "Manual hotfix in the portal. Next Bicep deploy rolled it back. Production cried.",
    challenge: "Automate infra and deploys with pipelines that don't fight each other.",
  },
  "resource-manager": {
    setup: "47 subscriptions, no tags, three people named Owner, and a resource group called 'temp-do-not-delete'.",
    challenge: "Organize Azure at enterprise scale without chaos.",
  },
  "policy-cost": {
    setup: "CFO asks why dev spend equals production. Nobody tagged anything. Reservations? What reservations?",
    challenge: "Enforce guardrails and find money hiding in idle VMs.",
  },
};

export function getModuleHook(slug: string): ModuleHook | undefined {
  return moduleHooks[slug];
}