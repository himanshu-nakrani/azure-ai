import { LearningModule } from "@/lib/types";

export const computeModules: LearningModule[] = [
  {
    slug: "virtual-machines",
    category: "compute",
    title: "Azure Virtual Machines",
    subtitle: "IaaS compute, availability, and scaling patterns",
    description:
      "Deploy and manage VMs, availability sets, scale sets, and disk options. When to choose IaaS over PaaS.",
    difficulty: "foundational",
    duration: "72 min",
    services: ["Virtual Machines", "VM Scale Sets", "Managed Disks"],
    sections: [
      {
        id: "vm-basics",
        title: "VM Sizing & Images",
        content: `Azure VMs come in **series** optimized for different workloads. Choosing the wrong series is one of the most common cost and performance mistakes in production.

| Series | vCPU:RAM ratio | Use case | Production notes |
|---|---|---|---|
| **Dsv5/Ddv5** | Balanced | Web servers, app tiers, dev/test | Default choice for most workloads |
| **Fsv2** | High CPU | Batch processing, analytics, encoding | 2:1 vCPU:RAM — don't use for memory-heavy apps |
| **Esv5/Edv5** | High memory | SQL Server, SAP HANA, in-memory caches | Up to 672 GiB RAM on largest SKUs |
| **Msv2/Mmv2** | Very high memory | SAP S/4HANA, large in-memory DBs | Mission-critical; pair with zone redundancy |
| **N-series** | GPU-attached | ML training, rendering, CUDA workloads | NC (compute), ND (deep learning), NV (visualization) |
| **Bsv2** | Burstable | Low average CPU, occasional spikes | Credits accumulate when idle; exhaust under sustained load |
| **Lsv2** | Storage-optimized | NoSQL, log analytics, data warehousing | High local SSD throughput |

**Sizing decision framework:**
1. Profile the workload (CPU-bound, memory-bound, I/O-bound, GPU-bound)
2. Start with a mid-tier SKU in the right series — don't over-provision on day one
3. Enable **Azure Advisor** right-sizing recommendations after 7+ days of metrics
4. Use **Azure Compute Optimizer** for data-driven SKU recommendations across subscriptions
5. Reserve capacity with **Azure Reservations** (1- or 3-year) once sizing is stable — savings up to 72%

**Images & golden templates:**
- **Platform images**: Microsoft-maintained (Windows Server 2022, Ubuntu 22.04 LTS, RHEL 9). Patched regularly; good for quick starts
- **Azure Marketplace**: Third-party images (Fortinet, Citrix, SAP). Review publisher support and update cadence
- **Custom images**: Capture a configured VM or use **Azure Image Builder** (Packer-style pipelines) to bake security baselines, agents, and app dependencies
- **Azure Compute Gallery** (formerly Shared Image Gallery): Versioned, replicated images across regions and subscriptions. Use **replication regions** close to deployment targets

**Managed Disks:**

| Disk type | IOPS (P30) | Latency | Use case |
|---|---|---|---|
| **Premium SSD v2** | Up to 80,000 | Sub-ms | Production databases, latency-sensitive apps |
| **Premium SSD** | Up to 20,000 | Single-digit ms | General production workloads |
| **Standard SSD** | Up to 6,000 | Low ms | Web servers, lightly used apps |
| **Standard HDD** | Up to 2,000 | Higher ms | Backup targets, dev/test only |
| **Ultra Disk** | Up to 160,000 | Sub-ms, configurable | SAP HANA, top-tier SQL Server |
| **Ephemeral OS disk** | N/A (local NVMe) | Lowest | Stateless scale set instances — free, but data lost on stop/deallocate |

**Production disk guidance:**
- Enable **Azure Disk Encryption** or **encryption at host** for OS and data disks
- Use **zone-redundant storage (ZRS)** for disks when VMs are zone-redundant
- Attach data disks for databases — never run production DBs on the OS disk alone
- Set **host caching** to **ReadOnly** for data disks on read-heavy workloads; **None** for write-heavy databases`,
        codeExample: `# Create a VM with Premium SSD and zone placement (Azure CLI)
az vm create \\
  --resource-group rg-prod \\
  --name vm-web-01 \\
  --image Ubuntu2204 \\
  --size Standard_D4s_v5 \\
  --zone 1 \\
  --os-disk-size-gb 128 \\
  --storage-sku Premium_LRS \\
  --public-ip-address "" \\
  --nsg-rule SSH \\
  --assign-identity`,
        keyPoints: [
          "Match VM series to workload profile — D for general, E for memory, F for compute",
          "Azure Compute Gallery for versioned, multi-region golden images",
          "Premium SSD v2 or Ultra Disk for production I/O-intensive databases",
          "Use Azure Advisor and Reservations after sizing stabilizes",
        ],
        warning:
          "B-series burstable VMs throttle CPU when credits are exhausted. Never run sustained production workloads on B-series without monitoring CPU credit balance.",
      },
      {
        id: "availability",
        title: "High Availability & Scale Sets",
        content: `Azure offers multiple HA patterns. Choosing the wrong one is a common cause of downtime during platform maintenance or datacenter failures.

**Availability comparison:**

| Feature | Availability Set | Availability Zone | VM Scale Set (zonal) |
|---|---|---|---|
| **Fault isolation** | Rack-level (fault domains) | Datacenter-level | Zone + rack-level |
| **SLA** | 99.95% (2+ VMs) | 99.99% (zonal) | 99.99% (zonal deployment) |
| **Maintenance impact** | Update domains — grouped reboots | Zone-independent maintenance | Rolling upgrades across instances |
| **Best for** | Legacy apps (pre-2017 guidance) | Modern production workloads | Auto-scaling identical workloads |
| **Load balancer required** | Yes (for traffic distribution) | Yes | Built-in LB integration |

**Availability Sets** spread VMs across **fault domains** (independent power/network racks) and **update domains** (maintenance reboot groups). Minimum 2 fault domains and 2 update domains. Still relevant for services that don't support zones, but **Availability Zones are preferred** for new deployments.

**Availability Zones** place resources in physically separate datacenters within a region (Zone 1, 2, 3). Combine with **zone-redundant Load Balancer** or **Application Gateway** for frontend HA. For data tier, use zone-redundant storage and zone-aware database options.

**VM Scale Sets (VMSS)** manage a fleet of identical VMs with integrated autoscale:

- **Manual scale**: Fixed instance count
- **Custom autoscale**: Scale on CPU, memory, queue depth, or Application Insights metrics
- **Predictive autoscale** (ML-based): Forecasts load patterns and scales ahead of demand
- **Rolling upgrades**: Update image or model across instances with health probe validation
- **Overprovisioning**: Spin up extra instances during upgrades to maintain capacity
- **Spot instances in scale sets**: Mix Spot and regular VMs — Spot handles burst, regular handles baseline

**Autoscale rule design (production):**
- **Scale-out**: Trigger at 70% CPU for 5 minutes (avoid flapping with sufficient duration)
- **Scale-in**: Trigger at 30% CPU for 10 minutes (longer cooldown prevents premature removal)
- **Minimum instances**: Never scale below 2 in production (maintain HA)
- **Maximum instances**: Set a cost ceiling — autoscale can run away during misconfigured rules

**Spot VMs** use spare Azure capacity at up to 90% discount:
- Eviction policy: **Deallocate** (retain disks) or **Delete** (ephemeral)
- Eviction notice: 30 seconds when capacity is reclaimed
- **Spot priority**: Set max price or use capacity-only eviction
- Ideal for: batch jobs, CI/CD agents, dev/test, Kubernetes node pools, fault-tolerant workers
- Avoid for: stateful single-instance apps, real-time processing without checkpointing

**Azure Site Recovery (ASR)** replicates VMs to a secondary region for disaster recovery. RPO as low as 30 seconds with crash-consistent replication; test failover without impacting production.`,
        codeExample: `# VM Scale Set autoscale rule (ARM/Bicep excerpt)
resource autoscaleSettings 'Microsoft.Insights/autoscalesettings@2022-10-01' = {
  name: 'vmss-autoscale'
  properties: {
    profiles: [{
      rules: [
        {
          metricTrigger: {
            metricName: 'Percentage CPU'
            operator: 'GreaterThan'
            threshold: 70
            timeAggregation: 'Average'
            timeGrain: 'PT1M'
            timeWindow: 'PT5M'
          }
          scaleAction: { direction: 'Increase', type: 'ChangeCount', value: '2', cooldown: 'PT5M' }
        }
      ]
    }]
  }
}`,
        keyPoints: [
          "Availability Zones (99.99%) are the modern default over Availability Sets (99.95%)",
          "Scale Sets with min 2 instances + zone spread for production auto-scaling",
          "Autoscale cooldowns and longer scale-in windows prevent instance flapping",
          "Spot VMs for interruptible workloads — combine with regular VMs in scale sets",
        ],
      },
      {
        id: "vm-operations",
        title: "Operations, Security & Troubleshooting",
        content: `Running VMs in production requires disciplined operations beyond initial deployment.

**IaaS vs PaaS decision framework:**

| Factor | Choose VMs (IaaS) | Choose PaaS (App Service, Functions) |
|---|---|---|
| **OS control** | Need custom kernel, drivers, agents | Standard runtime is sufficient |
| **Legacy apps** | Lift-and-shift, no code changes | App can be containerized or refactored |
| **Licensing** | Bring your own SQL Server, Windows licenses (AHUB) | License included in service |
| **Patching burden** | You own OS and runtime patching | Platform manages patching |
| **Scaling speed** | Minutes (VM boot time) | Seconds (PaaS auto-scale) |
| **Compliance** | Full OS-level hardening control | Shared responsibility model |

**Security baseline (production checklist):**
- **Microsoft Entra ID + SSH keys** — disable password authentication on Linux; use **Azure AD SSH login** for RBAC-controlled access
- **Just-in-time (JIT) VM access** via Defender for Cloud — open RDP/SSH only on request, auto-close after timeout
- **Azure Bastion** for RDP/SSH over HTTPS — no public IPs on VMs
- **Managed identities** for Azure resource access — no credentials in code or cloud-init scripts
- **Azure Policy**: Enforce allowed VM SKUs, require encryption, deny public IPs
- **Backup**: Enable **Azure Backup** with daily snapshots and cross-region backup vault for ransomware resilience

**Azure Hybrid Benefit (AHUB):** Apply existing Windows Server or SQL Server licenses with Software Assurance to save up to 40% on VM compute. Must be enabled at deployment — track compliance via Azure Policy.

**Common troubleshooting scenarios:**

| Symptom | Likely cause | Resolution |
|---|---|---|
| VM won't start after resize | Disk doesn't support target SKU | Check disk compatibility; may need to detach and reattach |
| Intermittent RDP/SSH failures | NSG or JIT access expired | Verify NSG rules, Bastion config, and JIT policy |
| High disk latency | Wrong disk tier or uncached writes | Upgrade to Premium SSD v2; set host caching to None for DB |
| CPU at 100%, app slow | Under-sized SKU or noisy neighbor | Resize VM; check Advisor; move to dedicated host if needed |
| VM deallocated unexpectedly | Spot eviction or autoscale scale-in | Review eviction policy; check autoscale minimum instance count |
| Extension failed state | Custom script or agent conflict | Review extension logs in C:\\WindowsAzure\\Logs\\Plugins |

**Monitoring essentials:**
- Enable **Azure Monitor VM Insights** — maps process dependencies, tracks performance counters
- Alert on: CPU > 85% sustained, available memory < 10%, disk queue depth > 2, heartbeat missing
- Use **Boot diagnostics** and **serial console** for VMs that fail to boot — access without networking`,
        keyPoints: [
          "Use Bastion + JIT access instead of public RDP/SSH in production",
          "Azure Hybrid Benefit saves up to 40% with existing Windows/SQL licenses",
          "VM Insights and Boot Diagnostics are essential for production troubleshooting",
          "Choose PaaS unless you need OS-level control or lift-and-shift",
        ],
        warning:
          "Deallocated VMs still incur managed disk and IP address costs. Delete unused disks and public IPs — orphaned resources are a top Azure cost leak.",
      },
    ],
    quiz: [
      {
        question: "Which feature spreads VMs across physically separate datacenters?",
        options: ["Availability Sets", "Availability Zones", "Scale Sets", "Spot VMs"],
        answer: 1,
        explanation:
          "Availability Zones place VMs in separate datacenters within a region, providing 99.99% SLA. Availability Sets only spread across racks within one datacenter.",
      },
      {
        question: "Which disk type offers configurable IOPS and sub-millisecond latency for top-tier databases?",
        options: ["Standard SSD", "Premium SSD", "Ultra Disk", "Standard HDD"],
        answer: 2,
        explanation:
          "Ultra Disk provides independently configurable IOPS, throughput, and sub-millisecond latency. Premium SSD v2 also offers high performance but Ultra Disk is the top tier for SAP HANA and mission-critical SQL.",
      },
      {
        question: "What happens when a B-series burstable VM exhausts its CPU credits?",
        options: [
          "The VM is automatically resized to a D-series",
          "CPU performance is throttled to the baseline level",
          "The VM is evicted like a Spot instance",
          "Azure sends a scale-out alert to the autoscale rules",
        ],
        answer: 1,
        explanation:
          "B-series VMs accumulate CPU credits when below baseline utilization. When credits are exhausted, vCPU performance throttles to the baseline percentage — not the full vCPU count.",
      },
    ],
  },
  {
    slug: "app-service",
    category: "compute",
    title: "Azure App Service",
    subtitle: "PaaS web hosting with deployment slots and autoscale",
    description:
      "Host web apps, APIs, and background jobs without managing infrastructure. Deployment slots, scaling, and networking.",
    difficulty: "foundational",
    duration: "68 min",
    services: ["App Service", "App Service Plan", "Deployment Slots"],
    sections: [
      {
        id: "plans-tiers",
        title: "App Service Plans & Tiers",
        content: `An **App Service Plan** defines the compute resources (region, VM SKU, instance count) shared by all apps on that plan. The plan is the billing and scaling unit — not individual apps.

**Tier comparison:**

| Tier | Instances | Auto-scale | Deployment slots | VNet integration | Zone redundancy | Use case |
|---|---|---|---|---|---|---|
| **Free/Shared** | Shared | No | 0 | No | No | Hobby projects only |
| **Basic (B1-B3)** | 1-3 manual | No | 0 | No | No | Dev/test, low-traffic |
| **Standard (S1-S3)** | 1-10 | Yes | 5 | Yes (regional) | No | Production web apps |
| **Premium v3 (P0v3-P3v3)** | 1-30 | Yes | 20 | Yes | Yes | Production, high perf |
| **Premium v3 Memory-Optimized** | 1-20 | Yes | 20 | Yes | Yes | Memory-heavy workloads |
| **Isolated v2 (I1v2-I3v2)** | 1-100 | Yes | 20 | Yes (ASE) | Yes | Dedicated hardware, compliance |

**Production planning guidance:**
- **Separate plans for prod and non-prod** — a memory leak in staging can starve production on a shared plan
- **Right-size the plan SKU**: P1v3 (2 vCPU, 8 GiB) handles most web APIs; scale out before scaling up
- **Scale out > scale up**: 3x S1 instances provide better HA than 1x S3 — App Service load-balances automatically
- **Always On**: Required for WebJobs, timer triggers, and preventing idle shutdown (disabled on Free/Shared)
- **ARR affinity (sticky sessions)**: Enable only if app stores session state in-memory; prefer external session store (Redis)

**Compute on App Service:**
- Runs on **Azure VMs** managed by the platform — you never see the OS
- **Custom containers**: Deploy Docker images from ACR, Docker Hub, or private registries on Linux plans
- **Sidecar pattern** (Premium): Run companion containers alongside the main app (e.g., log shippers, proxies)
- **Nested virtualization** is not supported — you cannot run Docker-in-Docker

**Cost optimization:**
- Use **Azure Reservations** on Premium v3 plans for 1- or 3-year savings
- **Auto-scale rules**: Scale in during off-hours (nights, weekends) for non-24/7 workloads
- Downscale dev/test plans to Basic or Shared outside business hours with scheduled autoscale`,
        keyPoints: [
          "The App Service Plan is the billing unit — isolate prod and dev on separate plans",
          "Scale out (more instances) before scale up (bigger SKU) for HA and throughput",
          "Premium v3 minimum for zone redundancy, more slots, and production SLAs",
          "Always On is required for background processing and WebJobs",
        ],
        warning:
          "Apps on the same plan share CPU, memory, and network. A runaway staging deployment or load test can take down production if they share a plan.",
      },
      {
        id: "deployment",
        title: "Deployment Slots & CI/CD",
        content: `**Deployment slots** are live apps with unique hostnames (\`staging-myapp.azurewebsites.net\`) running on the same plan as production. They enable zero-downtime deployments and A/B testing.

**Slot swap mechanics:**
1. Deploy new code to the **staging** slot
2. Warm up and validate (smoke tests, integration tests)
3. **Swap** staging ↔ production — Azure switches hostnames and routing in seconds
4. Production now runs the new build; old build is in staging for instant rollback

**Slot-sticky settings** (critical for production):
- Mark app settings and connection strings as **deployment slot settings** so they stay with the slot during swap
- Production keeps its production database connection; staging keeps its staging database
- **Failing to mark DB connection strings as slot-sticky is the #1 cause of staging swaps hitting production databases**

**Deployment methods:**

| Method | Best for | Notes |
|---|---|---|
| **GitHub Actions / Azure DevOps** | Production CI/CD | OIDC federation — no stored secrets |
| **ZIP Deploy / Run From Package** | Fast, atomic deploys | Package mounted read-only — faster cold start |
| **Docker container** | Containerized apps | CI builds image → push to ACR → deploy |
| **Local Git / FTP** | Quick dev testing | Disable in production via IAM policies |
| **Slot auto-swap** | Continuous deployment | Auto-swaps after successful staging deploy |

**Run From Package** (\`WEBSITE_RUN_FROM_PACKAGE=1\`):
- Deploys a ZIP to Blob Storage or mounts directly — app runs from the package without extracting
- Atomic deployments — no partial file states during deploy
- Recommended for production Windows and Linux apps

**Networking for deployments:**
- **SCM/Kudu site** (\`myapp.scm.azurewebsites.net\`) handles deployments — restrict access via **access restrictions** in production
- **VNet integration**: Outbound traffic routes through your VNet (Standard tier+) — required for Private Endpoint database access
- **Private Endpoints**: Inbound traffic to the app without public internet exposure
- **Access restrictions**: IP allowlists, service endpoints, or Private Endpoint-only access`,
        codeExample: `# GitHub Actions — deploy to staging, then swap to production
- uses: azure/webapps-deploy@v3
  with:
    app-name: my-app
    slot-name: staging
    package: ./publish

- uses: azure/cli@v2
  with:
    inlineScript: |
      az webapp deployment slot swap \\
        --resource-group rg-prod \\
        --name my-app \\
        --slot staging \\
        --target-slot production`,
        keyPoints: [
          "Swap slots for zero-downtime deployments with instant rollback capability",
          "Mark database connection strings as slot-sticky before first swap",
          "Run From Package enables atomic, fast deployments in production",
          "Use OIDC federation in CI/CD pipelines — no stored publish profiles",
        ],
      },
      {
        id: "scaling-monitoring",
        title: "Scaling, Monitoring & Troubleshooting",
        content: `**Auto-scale rules** on App Service Plans adjust instance count based on metrics:

| Metric | Scale-out threshold | Scale-in threshold | Notes |
|---|---|---|---|
| **CPU Percentage** | > 70% for 10 min | < 30% for 15 min | Most common rule |
| **Memory Percentage** | > 80% for 10 min | < 40% for 15 min | Watch for memory leaks |
| **HTTP Queue Length** | > 100 per instance | < 50 per instance | Indicates request backlog |
| **Data Out** | Custom threshold | Custom threshold | Useful for bandwidth-heavy APIs |

**Auto-scale best practices:**
- Set **minimum instances to 2+** in production for HA
- Use **longer cooldown periods** on scale-in (15+ min) to avoid removing instances during traffic dips
- **Schedule-based rules**: Scale up before known peaks (Monday morning, product launches)
- Combine metric rules with schedules — metric handles unexpected spikes, schedule handles predictable patterns

**Health checks (production):**
- Configure **Health check path** (e.g., \`/health\`) — App Service removes unhealthy instances from the load balancer rotation
- Health check interval: every 2 minutes; unhealthy instance is replaced after 10 minutes of failures
- Return 200 with a lightweight response — don't hit the database on every health probe

**Monitoring & diagnostics:**

| Tool | What it captures | Production use |
|---|---|---|
| **Application Insights** | Requests, dependencies, exceptions, traces | APM — enable on every production app |
| **App Service logs** | HTTP logs, failed requests, detailed errors | Stream to Log Analytics for KQL analysis |
| **Live Metrics Stream** | Real-time requests, failures, performance | Active incident debugging |
| **Kudu / SCM console** | Process explorer, environment variables | Deep troubleshooting (restrict access in prod) |
| **Diagnostic settings** | Platform logs to Log Analytics / Storage | Required for audit and compliance |

**Common production issues:**

| Symptom | Likely cause | Fix |
|---|---|---|
| 503 Server Unavailable | All instances unhealthy or scaling | Check health probe path; verify app starts correctly |
| 502 Bad Gateway | App crash or slow startup | Check startup time; enable Always On; review container logs |
| App restarts periodically | Memory limit exceeded (OOM) | Scale up SKU or fix memory leak; check Premium v3 memory-optimized |
| Slow cold start after deploy | Package extraction or JIT compilation | Use Run From Package; enable warmup via Application Initialization |
| Cannot reach database | Missing VNet integration or DNS | Enable VNet integration; add Private DNS zone for Private Endpoints |
| Slot swap fails | App startup error in target slot | Check staging slot logs before swap; use auto-swap with health check |

**Custom domains & TLS:**
- **App Service Managed Certificates**: Free auto-renewed TLS certs for custom domains (Standard tier+)
- **TLS 1.2 minimum** enforced by default — disable older protocols
- **IP SSL vs SNI SSL**: SNI is free and supports multiple domains; IP SSL requires dedicated IP for legacy clients`,
        codeExample: `# Enable health check and Always On (Azure CLI)
az webapp config set \\
  --resource-group rg-prod \\
  --name my-app \\
  --generic-configurations '{"healthCheckPath": "/health"}'

az webapp config set \\
  --resource-group rg-prod \\
  --name my-app \\
  --always-on true`,
        keyPoints: [
          "Health check path removes unhealthy instances from rotation automatically",
          "Minimum 2 instances in production with metric + schedule autoscale rules",
          "Application Insights on every production app for APM and alerting",
          "Run From Package and Always On eliminate most cold-start and 502 issues",
        ],
        warning:
          "Auto-swap deploys to staging and automatically swaps to production. A broken build in staging goes directly to production — always run smoke tests before enabling auto-swap.",
      },
    ],
    quiz: [
      {
        question: "What is the minimum App Service tier for deployment slots and autoscale?",
        options: ["Free", "Basic", "Standard", "Premium v3"],
        answer: 2,
        explanation:
          "Standard tier provides 5 deployment slots, autoscale, daily backup, and VNet integration. Basic allows manual scale only (up to 3 instances) with no slots.",
      },
      {
        question: "Why must database connection strings be marked as 'deployment slot setting'?",
        options: [
          "To encrypt them with Key Vault references",
          "So they stay with the slot during swap and staging doesn't use the production database",
          "To enable connection pooling across instances",
          "To allow read replicas in the staging slot",
        ],
        answer: 1,
        explanation:
          "Slot-sticky settings remain bound to their slot during swap. Without this, staging inherits production connection strings after swap — a common cause of data corruption.",
      },
      {
        question: "Which deployment method provides atomic deployments with the fastest cold start?",
        options: ["FTP deploy", "Git push to local Git", "Run From Package (ZIP Deploy)", "Docker container pull"],
        answer: 2,
        explanation:
          "Run From Package (WEBSITE_RUN_FROM_PACKAGE=1) mounts the ZIP directly without extraction, providing atomic deploys and faster startup. The app reads files directly from the package.",
      },
    ],
  },
  {
    slug: "azure-functions",
    category: "compute",
    title: "Azure Functions",
    subtitle: "Event-driven serverless compute with triggers and bindings",
    description:
      "Serverless functions triggered by HTTP, queues, blobs, timers, and events. Consumption vs Premium vs Dedicated plans.",
    difficulty: "intermediate",
    duration: "78 min",
    services: ["Azure Functions", "Function App", "Durable Functions"],
    sections: [
      {
        id: "plans",
        title: "Hosting Plans",
        content: `The hosting plan determines scaling behavior, networking, cold starts, and cost model. Plan selection is the most impactful architecture decision for Functions.

**Plan comparison:**

| Plan | Scaling | Cold start | Max duration | VNet | Min instances | Cost model |
|---|---|---|---|---|---|---|
| **Consumption** | Event-driven, auto | 1-10+ seconds | 5 min (default) | No | 0 | Per execution + GB-seconds |
| **Flex Consumption** | Fast auto-scale | Sub-second (always-ready) | 30 min | Yes | 0-1000 (configurable) | Per execution + always-ready instances |
| **Premium (EP)** | Warm instances | None (pre-warmed) | Unlimited (unlimited plan) | Yes | 1+ (always ready) | Per vCPU/memory reserved |
| **Dedicated (App Service)** | Manual/auto on plan | None (always on) | Unlimited | Yes | Plan-defined | App Service Plan pricing |
| **Container Apps** | KEDA-based | Minimal | Unlimited | Yes | 0+ | Per vCPU/memory used |

**Decision framework:**

| Requirement | Recommended plan |
|---|---|
| Sporadic dev/test, cost-sensitive | Consumption |
| Production with VNet + Private Endpoints | Flex Consumption or Premium |
| Low-latency HTTP APIs (< 500ms p99) | Premium (pre-warmed) or Flex Consumption (always-ready) |
| Long-running functions (> 10 min) | Premium or Dedicated |
| Durable Functions orchestrations | Premium or Dedicated (avoid Consumption timeouts) |
| Predictable monthly cost at steady load | Dedicated (App Service Plan) |
| Event-driven with scale-to-zero | Consumption or Flex Consumption |

**Cold start anatomy (Consumption plan):**
1. **Allocation**: Azure finds or creates a worker (1-5s)
2. **Runtime startup**: Language worker and Functions host boot (1-3s)
3. **App initialization**: Your code loads dependencies (varies — .NET minimal, Node with large node_modules slow)
4. **Mitigations**: Minimize package size, use Premium plan, enable **always-ready instances** on Flex Consumption

**Flex Consumption** (recommended for new production serverless):
- Combines Consumption pay-per-execution with optional **always-ready instances** (eliminates cold start)
- **VNet integration** for Private Endpoint access to databases, storage, Key Vault
- Per-function scaling — high-traffic functions scale independently
- Instance sizes: 512 MB, 2048 MB, or 4096 MB memory per instance

**Concurrency & throttling (Consumption):**
- Default: 100 concurrent executions per instance (HTTP trigger)
- Service Bus trigger: controlled by \`maxConcurrentCalls\` in host.json
- **Dynamic concurrency** (preview): Auto-tunes based on HTTP response times and CPU
- Throttled requests return **429 Too Many Requests** — implement retry with exponential backoff`,
        codeExample: `// host.json — production tuning for Consumption plan
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": "api",
      "maxConcurrentRequests": 100,
      "maxOutstandingRequests": 200
    },
    "serviceBus": {
      "maxConcurrentCalls": 16,
      "prefetchCount": 0
    }
  },
  "functionTimeout": "00:05:00",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  }
}`,
        keyPoints: [
          "Flex Consumption is the recommended production serverless plan with VNet and always-ready instances",
          "Premium eliminates cold starts with pre-warmed instances — required for low-latency APIs",
          "Consumption cold starts range 1-10s — minimize dependency size and package footprint",
          "Durable Functions orchestrations need Premium or Dedicated to avoid 5-minute timeouts",
        ],
        warning:
          "Consumption plan has a default 5-minute execution timeout. Long-running orchestrations or batch jobs will be killed silently — use Premium or Dedicated for anything exceeding 5 minutes.",
      },
      {
        id: "triggers-bindings",
        title: "Triggers, Bindings & Durable Functions",
        content: `Azure Functions uses a **trigger** to start execution and **bindings** to connect to data sources declaratively — reducing boilerplate for Azure service integration.

**Common triggers:**

| Trigger | Event source | Scaling signal | Idempotency concern |
|---|---|---|---|
| **HTTP** | REST API calls | Request rate | Retry-safe design required |
| **Timer** | CRON expression | N/A (singleton) | Use lease blob for multi-instance |
| **Blob** | Storage blob created/changed | Blob count | Handle duplicate events |
| **Queue (Storage)** | Storage Queue message | Queue depth | At-least-once delivery — design idempotent |
| **Service Bus** | Queue or topic message | Message count | Peek-lock with completion/abandon |
| **Event Hub** | Stream events | Partition lag | Checkpoint-based — partition-scoped |
| **Event Grid** | Azure resource events | Event rate | Filter subscriptions to reduce noise |
| **Cosmos DB** | Change feed | Feed lag | Handle change feed duplicates |

**Bindings** (input/output):
- **Input binding**: Read data into the function (e.g., Blob input, Cosmos DB document)
- **Output binding**: Write data from the function (e.g., Queue output, Table storage)
- **Binding direction**: \`in\`, \`out\`, or \`inout\`
- Prefer bindings for simple I/O; use SDK clients directly for complex transactions or connection pooling

**Durable Functions** — workflow orchestration with state:

| Pattern | Description | Example |
|---|---|---|
| **Function chaining** | Sequential steps | Validate → Process → Notify |
| **Fan-out/fan-in** | Parallel tasks, aggregate results | Process 1000 files concurrently |
| **Async HTTP APIs** | Long-running with status endpoint | Export report, poll for completion |
| **Monitor** | Polling with backoff | Wait for external approval |
| **Human interaction** | Wait for human input (approval workflow) | Expense approval |
| **Eternal orchestration** | Loop with timer (periodic jobs) | Heartbeat monitoring |

**Durable Functions storage:**
- Requires **Azure Storage** (Tables, Queues, Blobs) or **MSSQL** as the task hub backend
- All orchestration state is persisted — instances survive function restarts
- **Orchestrator must be deterministic** — no random, DateTime.Now, or direct I/O in orchestrator; use activity functions instead

**Security for HTTP triggers:**

| Auth level | Behavior | Production use |
|---|---|---|
| **Anonymous** | No key required | Public APIs only — pair with APIM or Front Door |
| **Function** | Function key or host key required | Internal APIs, webhook receivers |
| **Admin** | Master key required | Administrative operations only |
| **Easy Auth** | Entra ID, Google, Facebook via App Service auth | User-facing APIs — preferred for production |

**Managed identity** (production best practice):
- Enable **system-assigned** or **user-assigned** managed identity on the Function App
- Access Storage, Key Vault, Service Bus, Cosmos DB without connection strings in app settings
- Combine with **Key Vault references** for any remaining secrets: \`@Microsoft.KeyVault(SecretUri=...)\``,
        codeExample: `import { app, HttpRequest, HttpResponseInit, output } from "@azure/functions";
import { ServiceBusClient } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";

// Output binding — writes to Service Bus queue
const serviceBusOutput = output.serviceBusQueue({
  queueName: "orders",
  connection: "ServiceBusConnection", // Use managed identity instead of connection string
});

app.http("processOrder", {
  methods: ["POST"],
  authLevel: "function",
  extraOutputs: [serviceBusOutput],
  handler: async (req: HttpRequest, context): Promise<HttpResponseInit> => {
    const order = await req.json();
    context.extraOutputs.set(serviceBusOutput, {
      orderId: order.id,
      status: "received",
      timestamp: new Date().toISOString(),
    });
    return { status: 202, jsonBody: { orderId: order.id, status: "accepted" } };
  },
});`,
        keyPoints: [
          "Design all queue/event handlers as idempotent — at-least-once delivery is guaranteed",
          "Durable Functions orchestrators must be deterministic — I/O goes in activity functions",
          "Use managed identities and Key Vault references — never store secrets in app settings",
          "authLevel: function for internal APIs; Easy Auth with Entra ID for user-facing endpoints",
        ],
      },
      {
        id: "functions-production",
        title: "Production Patterns & Troubleshooting",
        content: `Moving Functions from prototype to production requires attention to observability, resilience, and deployment hygiene.

**Observability stack:**

| Signal | Tool | Production action |
|---|---|---|
| **Requests & latency** | Application Insights | Alert on p95 > 2s, failure rate > 1% |
| **Dependencies** | App Insights auto-tracking | Identify slow SQL, HTTP, or Storage calls |
| **Live Metrics** | Real-time streaming | Active incident investigation |
| **Distributed tracing** | Correlation IDs across functions | Trace multi-function Durable workflows |
| **Custom metrics** | App Insights \`trackMetric\` | Business KPIs (orders processed, errors by type) |
| **Log Analytics (KQL)** | \`traces\`, \`exceptions\`, \`requests\` tables | Root cause analysis |

**Resilience patterns:**
- **Retry policies**: Configure in host.json for bindings; use Polly for SDK calls
- **Dead-letter queues**: Service Bus topics/queues with DLQ monitoring — alert on DLQ depth > 0
- **Circuit breaker**: Stop calling failing downstream services; return cached or degraded response
- **Poison message handling**: After max retries, move to DLQ and alert — don't infinite-loop
- **Idempotency keys**: Store processed message IDs in Table Storage or Redis to deduplicate

**Deployment strategies:**

| Strategy | Downtime | Rollback | Best for |
|---|---|---|---|
| **Zip deploy (run from package)** | Zero (with slot swap) | Redeploy previous ZIP | Production Functions on Premium/Dedicated |
| **Deployment slots** | Zero | Swap back | Premium and Dedicated plans |
| **Continuous deployment** | Brief cold start | Redeploy | Consumption (no slots available) |
| **Blue-green via Flex Consumption** | Zero | Traffic manager switch | Flex Consumption with multiple apps |

**CI/CD with GitHub Actions:**
- Build and test in pipeline before deploy
- Use **OIDC federation** for Azure login — no stored credentials
- Deploy to staging slot → integration tests → swap to production
- Store \`AzureWebJobsStorage\` and other settings as Key Vault references

**Common troubleshooting:**

| Symptom | Likely cause | Resolution |
|---|---|---|
| Function not triggering | Extension not registered or wrong connection | Verify host.json extensions; check connection strings / managed identity |
| 429 Too Many Requests | Concurrency limit hit on Consumption | Increase \`maxConcurrentRequests\`; scale to Premium |
| Silent function failures | Exception swallowed without logging | Wrap handler in try/catch; log to App Insights |
| Timer trigger fires multiple times | Multiple instances without singleton lock | Use \`UseMonitor = true\` (default) for distributed lock |
| Durable orchestration stuck | Activity function timeout or exception | Check Durable Task Hub in Storage Tables; review orchestration history |
| VNet connectivity failure | DNS resolution for Private Endpoints | Add Private DNS zones; enable \`WEBSITE_DNS_SERVER\` for custom DNS |
| High execution cost | Over-provisioned Premium instances | Right-size always-ready count; consider Flex Consumption per-function scaling |

**Performance optimization:**
- **.NET**: Use isolated worker model (.NET 8+) for better performance and DI support
- **Node.js**: Minimize \`node_modules\` size; use webpack/esbuild bundling
- **Python**: Use \`azure-functions-worker\` v2; avoid heavy imports at module level
- **Connection pooling**: Reuse HTTP and database clients across invocations (static/singleton pattern)`,
        codeExample: `# KQL — find failing functions in the last hour
requests
| where timestamp > ago(1h)
| where cloud_RoleName == "my-function-app"
| where success == false
| summarize failureCount = count() by name, resultCode
| order by failureCount desc`,
        keyPoints: [
          "Monitor dead-letter queue depth — alert on any message in DLQ",
          "Use deployment slots on Premium/Dedicated for zero-downtime deploys",
          "Singleton timer triggers with distributed lock prevent duplicate executions",
          "Reuse SDK clients across invocations — connection pooling reduces latency and resource exhaustion",
        ],
        warning:
          "Never store secrets in application settings as plain text. Use Key Vault references with managed identity. Secrets in app settings appear in portal, ARM templates, and deployment logs.",
      },
    ],
    quiz: [
      {
        question: "Which hosting plan eliminates cold starts with pre-warmed instances?",
        options: ["Consumption", "Flex Consumption", "Premium (EP)", "All plans eliminate cold starts"],
        answer: 2,
        explanation:
          "Premium plan maintains pre-warmed instances that are always ready. Flex Consumption offers optional always-ready instances. Standard Consumption scales to zero and cold-starts on new requests.",
      },
      {
        question: "What is the default execution timeout on the Consumption plan?",
        options: ["1 minute", "5 minutes", "10 minutes", "30 minutes"],
        answer: 1,
        explanation:
          "Consumption plan default functionTimeout is 5 minutes (configurable up to 10 minutes unverified). Premium and Dedicated support unlimited duration. Durable orchestrations on Consumption are limited by this timeout.",
      },
      {
        question: "Why must Durable Functions orchestrator code be deterministic?",
        options: [
          "Azure compiles orchestrators to native code for performance",
          "The runtime replays orchestrator history on every resume — non-deterministic code causes failures",
          "Deterministic code uses fewer execution units on Consumption plan",
          "Only deterministic functions can use managed identity",
        ],
        answer: 1,
        explanation:
          "Durable Functions replays the orchestrator's execution history to rebuild state after checkpoints. Non-deterministic operations (random, DateTime.Now, direct I/O) produce different results on replay, causing non-deterministic workflow failures.",
      },
    ],
  },
  {
    slug: "kubernetes",
    category: "compute",
    title: "AKS & Container Apps",
    subtitle: "Kubernetes orchestration and serverless containers",
    description:
      "Run containerized workloads on AKS or Container Apps. When to choose managed Kubernetes vs serverless containers.",
    difficulty: "advanced",
    duration: "88 min",
    services: ["AKS", "Container Apps", "Container Registry", "Container Instances"],
    sections: [
      {
        id: "aks",
        title: "Azure Kubernetes Service",
        content: `AKS manages the Kubernetes **control plane** (API server, etcd, scheduler, controller manager) at no charge — you pay only for worker **node pools**. This makes AKS the full-control option for containerized workloads.

**AKS architecture:**

| Component | Managed by Azure | Managed by you |
|---|---|---|
| **Control plane** | Yes (free) | Configure RBAC, API access |
| **System node pool** | You pay for nodes | Kubernetes system pods (CoreDNS, metrics-server) |
| **User node pools** | You pay for nodes | Application workloads |
| **Networking (CNI plugin)** | Azure provides options | Choose and configure |
| **Upgrades** | Orchestrated by Azure | Schedule and approve |
| **Add-ons** | Azure installs | Select and configure |

**Node pool design (production):**

| Pool type | Purpose | SKU guidance |
|---|---|---|
| **System pool** | CoreDNS, metrics-server, Azure add-ons | 2+ nodes, min 4 vCPU — don't run app pods here |
| **User pool (general)** | Application workloads | Match app requirements (D-series general, E-series memory) |
| **User pool (GPU)** | ML inference, CUDA workloads | NC-series with NVIDIA device plugin |
| **Spot node pool** | Fault-tolerant batch workloads | Taints: \`kubernetes.azure.com/scalesetpriority=spot:NoSchedule\` |

**Networking — critical decision:**

| Model | Pod networking | Max pods/node | Network policies | Use case |
|---|---|---|---|---|
| **Azure CNI (standard)** | Pods get VNet IPs | ~30 | Yes (Calico/Azure NPM) | Production — pods reachable from VNet |
| **Azure CNI Overlay** | Pods get overlay IPs | ~250 | Yes | Large clusters, IP conservation |
| **Azure CNI Pod Subnet** | Dedicated pod subnet | ~110 | Yes | When VNet IP exhaustion is a concern |
| **Kubenet** (legacy) | NAT via node IP | ~110 | Limited | Dev/test only — not recommended for production |

**Cluster autoscaler vs KEDA:**
- **Cluster autoscaler**: Adds/removes nodes based on pod scheduling failures or node utilization
- **KEDA** (Kubernetes Event-driven Autoscaling): Scales pod replicas based on external metrics (queue depth, HTTP rate, custom)
- Use both: KEDA scales pods → cluster autoscaler adds nodes to fit new pods

**Essential add-ons for production:**
- **Azure Monitor container insights** — metrics, logs, and Kubernetes events in Log Analytics
- **Azure Policy for Kubernetes** — enforce pod security, allowed images, resource limits
- **Azure Key Vault CSI driver** — mount secrets as volumes, no secrets in etcd
- **Workload Identity** — pods authenticate to Azure APIs via Entra ID (replaces deprecated pod-managed identity)
- **Defender for Containers** — vulnerability scanning, runtime threat detection
- **Application Gateway Ingress Controller (AGIC)** or **NGINX Ingress** — L7 routing and TLS termination

**Security hardening checklist:**
- Enable **Microsoft Entra ID integration** for Kubernetes RBAC — no local admin kubeconfig in production
- **Private cluster**: API server endpoint only accessible via VNet or ExpressRoute
- **Authorized IP ranges** if not fully private
- **Network policies** (Calico or Azure NPM) — default-deny between namespaces
- **Pod Security Standards** (restricted profile) via Azure Policy
- **Image pull from ACR** with managed identity — no registry credentials in cluster`,
        codeExample: `# AKS node pool with Spot instances and taints (Azure CLI)
az aks nodepool add \\
  --resource-group rg-prod \\
  --cluster-name aks-prod \\
  --name spotpool \\
  --priority Spot \\
  --eviction-policy Delete \\
  --spot-max-price -1 \\
  --node-count 3 \\
  --node-vm-size Standard_D4s_v5 \\
  --labels workload=batch \\
  --node-taints kubernetes.azure.com/scalesetpriority=spot:NoSchedule`,
        keyPoints: [
          "AKS control plane is free — you pay for system and user node pools only",
          "Azure CNI Overlay for production clusters needing large pod density",
          "Workload Identity replaces pod-managed identity for Azure resource access",
          "Separate system and user node pools — never schedule app pods on the system pool",
        ],
        warning:
          "Kubenet networking is legacy and lacks full network policy support. Do not use Kubenet for production — choose Azure CNI or CNI Overlay.",
      },
      {
        id: "container-apps",
        title: "Azure Container Apps",
        content: `**Azure Container Apps (ACA)** is a serverless container platform built on Kubernetes but abstracting cluster management. Ideal when you need containers without Kubernetes operational overhead.

**Container Apps vs AKS vs ACI:**

| Feature | Container Apps | AKS | Container Instances (ACI) |
|---|---|---|---|
| **Orchestration** | Managed (KEDA-based) | Full Kubernetes | None (single container) |
| **Scale to zero** | Yes | Yes (with KEDA + autoscaler) | No |
| **Kubernetes API** | No | Yes | No |
| **Multi-container pods** | Yes (sidecars) | Yes | No (container groups only) |
| **Dapr integration** | Built-in | Manual install | No |
| **Complex networking** | VNet injection | Full CNI control | Basic |
| **Operational burden** | Low | High | Minimal |
| **Best for** | Microservices, APIs, jobs | Enterprise K8s, complex apps | Burst jobs, CI build agents |

**Container Apps core concepts:**
- **Container Apps Environment**: Shared boundary (networking, logging, Dapr) for related apps — like a lightweight cluster
- **Container App**: One or more containers with scaling rules, ingress, and revisions
- **Revision**: Immutable snapshot of a Container App — enables traffic splitting and rollback
- **Ingress**: External or internal HTTP/TCP with automatic TLS

**KEDA-based autoscaling (built-in):**

| Scaler | Metric | Example use case |
|---|---|---|
| **HTTP** | Concurrent requests | API auto-scaling |
| **Azure Service Bus** | Queue message count | Event processing workers |
| **Azure Storage Queue** | Queue depth | Background job scaling |
| **CPU/Memory** | Resource utilization | General workload scaling |
| **Custom** | Any KEDA-supported scaler | Redis list length, PostgreSQL queries |

**Dapr integration (first-class):**
- **Service invocation**: Service-to-service calls with mTLS and discovery
- **State management**: Pluggable state stores (Redis, Cosmos DB, SQL)
- **Pub/Sub**: Event-driven messaging (Service Bus, Event Hubs, Redis)
- **Secrets**: Key Vault secret provider
- Enable per Container App — no separate Dapr control plane to manage

**Revision management & traffic splitting:**
- Deploy new revision with **0% traffic** → validate → gradually shift (10% → 50% → 100%)
- **Single revision mode**: Auto-replace (simpler, dev/test)
- **Multiple revision mode**: Blue-green and canary deployments in production

**When to choose Container Apps:**
- Microservices with independent scaling per service
- Event-driven workers (queue processors, scheduled jobs)
- APIs that need scale-to-zero during off-hours
- Teams without dedicated Kubernetes expertise
- Dapr-based microservice architectures

**When to choose AKS instead:**
- Need Kubernetes API, Helm charts, operators, or service mesh (Istio/Linkerd)
- Stateful workloads with complex storage orchestration (StatefulSets, operators)
- Multi-tenant clusters with namespace isolation and custom RBAC
- GPU workload scheduling with fine-grained control
- Existing Kubernetes manifests and CI/CD pipelines to reuse`,
        codeExample: `# Container App with HTTP scaling rule (Bicep excerpt)
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'order-api'
  properties: {
    configuration: {
      ingress: { external: true, targetPort: 8080 }
    }
    template: {
      scale: {
        minReplicas: 0
        maxReplicas: 30
        rules: [{
          name: 'http-scaling'
          http: { metadata: { concurrentRequests: '50' } }
        }]
      }
      containers: [{
        name: 'api'
        image: 'myacr.azurecr.io/order-api:v2.1'
        resources: { cpu: json('0.5'), memory: '1Gi' }
      }]
    }
  }
}`,
        keyPoints: [
          "Container Apps for serverless microservices with scale-to-zero and KEDA autoscaling",
          "Use revision traffic splitting for canary and blue-green deployments",
          "Built-in Dapr for service invocation, state, pub/sub without managing a mesh",
          "AKS when you need full Kubernetes API, operators, or complex stateful workloads",
        ],
      },
      {
        id: "k8s-operations",
        title: "Operations, GitOps & Troubleshooting",
        content: `Running containers in production — whether on AKS or Container Apps — requires operational discipline around deployments, observability, and incident response.

**Container image pipeline (production):**

| Stage | Tool | Best practice |
|---|---|---|
| **Build** | Docker / Buildpacks / ko | Multi-stage builds; non-root user; minimal base images (distroless, Alpine) |
| **Scan** | Defender for Containers, Trivy | Block images with critical CVEs in CI pipeline |
| **Store** | Azure Container Registry (ACR) | Geo-replication for multi-region; retention policies |
| **Deploy** | GitOps (Flux/ArgoCD) or CI/CD | Never push directly to production clusters |
| **Authenticate** | ACR attached to AKS/ACA with managed identity | No imagePullSecrets with passwords |

**GitOps with Flux on AKS:**
- Git repository is the single source of truth for cluster state
- Flux monitors the repo and reconciles drift automatically
- Pull-based deployment — cluster pulls changes (more secure than push-based CI/CD)
- Combine with **Azure DevOps** or **GitHub Actions** for image builds; Flux handles manifest deployment

**AKS upgrade strategy:**
- **Control plane**: Azure manages; you initiate upgrade to target Kubernetes version
- **Node pools**: Surge upgrade — creates new nodes, cordons old, drains pods, deletes old nodes
- **Supported versions**: N-4 minor versions; plan upgrades within the support window
- **Production pattern**: Upgrade dev cluster → staging → production with 2-week gap
- Pin critical workloads with **Pod Disruption Budgets** (PDB) to prevent downtime during drain

**Observability for containers:**

| Signal | AKS tool | Container Apps tool |
|---|---|---|
| **Metrics** | Azure Monitor container insights | Built-in metrics in portal |
| **Logs** | Container stdout/stderr → Log Analytics | Log Analytics integration |
| **Traces** | Application Insights + OpenTelemetry | Application Insights |
| **Events** | Kubernetes events in Log Analytics | Revision and scaling events |
| **Network** | Network observability (retina/Cilium) | Environment-level logging |

**Common AKS troubleshooting:**

| Symptom | Likely cause | Resolution |
|---|---|---|
| Pods stuck in Pending | Insufficient node capacity or taints | Check cluster autoscaler; verify node pool taints/tolerations |
| ImagePullBackOff | ACR auth failure or image doesn't exist | Verify ACR attachment and managed identity; check image tag |
| CrashLoopBackOff | App crash on startup | Check \`kubectl logs\` and previous container logs (\`--previous\`) |
| OOMKilled | Memory limit too low | Increase pod memory limit; investigate memory leaks |
| Node NotReady | VM issue or kubelet failure | Check node conditions; drain and replace node |
| DNS resolution failure | CoreDNS issue or VNet DNS | Verify CoreDNS pods; check custom DNS forwarder config |
| Slow deployments | Resource quotas or PDB blocking | Review ResourceQuota, LimitRange, and PDB settings |

**Cost optimization:**

| Strategy | AKS | Container Apps |
|---|---|---|
| **Scale to zero** | KEDA + cluster autoscaler | Built-in (minReplicas: 0) |
| **Spot nodes** | Spot node pools for batch | Not available — use AKS Spot pools for cost-sensitive batch |
| **Right-size requests/limits** | Set CPU/memory requests accurately | Choose appropriate vCPU/memory per container |
| **Reserved instances** | 1-3 year RI on node VMs | Consumption-based — no reservations |
| **Dev cluster shutdown** | Stop node pools nights/weekends | Scale to zero automatically |

**Disaster recovery:**
- **AKS**: Multi-region with Traffic Manager or Front Door; backup etcd is managed by Azure; export manifests to Git
- **ACR**: Geo-replication to secondary region
- **Container Apps**: Deploy to multiple environments/regions; use Front Door for global routing`,
        codeExample: `# Diagnose CrashLoopBackOff — check current and previous logs
kubectl logs pod/my-app-7d4f8b9c6-xk2pq -n production
kubectl logs pod/my-app-7d4f8b9c6-xk2pq -n production --previous

# Check pod events for scheduling failures
kubectl describe pod my-app-7d4f8b9c6-xk2pq -n production | grep -A5 Events`,
        keyPoints: [
          "GitOps (Flux/ArgoCD) with ACR and managed identity — no manual kubectl apply in production",
          "Pod Disruption Budgets protect workloads during node upgrades and drains",
          "Multi-stage Docker builds with CVE scanning before images reach production",
          "Container Apps for operational simplicity; AKS when you need full Kubernetes control",
        ],
        warning:
          "Running kubectl apply directly in production clusters causes configuration drift and untracked changes. Adopt GitOps so every cluster change is version-controlled and auditable.",
      },
    ],
    quiz: [
      {
        question: "Which AKS networking model is recommended for production with network policy support?",
        options: ["Kubenet", "Azure CNI Overlay", "Host networking", "Bridge networking"],
        answer: 1,
        explanation:
          "Azure CNI Overlay provides VNet integration, network policies (Calico/Azure NPM), and supports up to 250 pods per node. Kubenet is legacy with limited policy support.",
      },
      {
        question: "What is the key advantage of Azure Container Apps over AKS?",
        options: [
          "Full Kubernetes API access for Helm and operators",
          "No cluster management overhead with built-in scale-to-zero and KEDA autoscaling",
          "Support for StatefulSets and daemon sets",
          "GPU workload scheduling with fine-grained control",
        ],
        answer: 1,
        explanation:
          "Container Apps abstracts Kubernetes operations — no node pools, control plane, or upgrades to manage. It provides built-in scale-to-zero, KEDA autoscaling, and Dapr integration. AKS provides full Kubernetes API access.",
      },
      {
        question: "How should pods authenticate to Azure Key Vault in modern AKS deployments?",
        options: [
          "Store Key Vault client secret in a Kubernetes Secret",
          "Pod-managed identity (deprecated)",
          "Workload Identity with federated Entra ID credentials",
          "Mount the Key Vault connection string as an environment variable",
        ],
        answer: 2,
        explanation:
          "Workload Identity is the current recommended approach — pods use federated identity credentials to authenticate to Entra ID and access Key Vault. Pod-managed identity is deprecated; Kubernetes Secrets with client secrets are an anti-pattern.",
      },
    ],
  },
];