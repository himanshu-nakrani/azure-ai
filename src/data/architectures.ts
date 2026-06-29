import { ArchitecturePattern } from "@/lib/types";

export const architectures: ArchitecturePattern[] = [
  {
    slug: "three-tier-web",
    category: "compute",
    title: "Three-Tier Web Application",
    description:
      "Classic three-tier web application pattern separating presentation, business logic, and data layers across dedicated App Service instances. Application Gateway with WAF terminates TLS at the edge and routes traffic to web and API tiers, while Azure SQL handles transactional data and Blob Storage serves static assets and user uploads. This pattern is well-suited for line-of-business applications that need predictable scaling, familiar deployment workflows, and strong integration with Microsoft identity and monitoring services.",
    useCase: "Enterprise web applications with relational data",
    complexity: "low",
    services: ["App Service", "Azure SQL", "Blob Storage", "Application Gateway"],
    mermaidDiagram: `graph TB
    Users[Users / Browsers] --> DNS[Azure DNS / Custom Domain]
    DNS --> AGW[Application Gateway + WAF]
    AGW -->|HTTPS| Web[App Service - Web Tier]
    AGW -->|/api/*| API[App Service - API Tier]
    Web -->|REST calls| API
    API -->|Private Endpoint| SQL[(Azure SQL - Primary)]
    SQL -.->|Geo-redundant backup| SQLBak[(Automated Backups)]
    API -->|Managed Identity| Blob[Blob Storage - Assets & Uploads]
    Web --> CDN[Azure CDN - Static Assets]
    CDN --> Blob
    Web --> AI[Application Insights]
    API --> AI
    API --> KV[Key Vault - Secrets]
    subgraph Monitoring [Observability]
        AI
        LA[Log Analytics Workspace]
    end
    AI --> LA`,
    considerations: [
      "Use deployment slots (staging → production swap) for zero-downtime releases and smoke testing before cutover",
      "Enable auto-scale rules on the App Service plan based on CPU, memory, and HTTP queue length thresholds",
      "Place Azure SQL behind a Private Endpoint in production; disable public network access entirely",
      "Configure connection pooling (e.g., ADO.NET pool or PgBouncer equivalent) to avoid exhausting SQL connection limits under load",
      "Store session state in Redis Cache or SQL rather than in-memory to support multi-instance web tier scaling",
      "Enable Azure SQL automated backups with point-in-time restore and test restore procedures quarterly",
      "Apply WAF managed rule sets on Application Gateway and tune custom rules for application-specific threats",
      "Use Managed Identity for App Service → SQL, Blob, and Key Vault access; eliminate connection strings from app settings",
    ],
    costDrivers: [
      "App Service plan SKU and instance count — Premium v3 tiers cost more but support slots, auto-scale, and VNet integration",
      "Azure SQL Database tier and DTU/vCore allocation — Business Critical adds read replicas and higher IOPS",
      "Application Gateway fixed hourly cost plus per-GB data processing charges",
      "Blob Storage volume and access tier — Hot for frequent access, Cool/Archive for infrequently used uploads",
      "Application Insights ingestion volume — sampling and daily cap help control telemetry costs",
      "Private Endpoint charges per endpoint and per-GB data processed through the endpoint",
    ],
  },
  {
    slug: "microservices-aks",
    category: "compute",
    title: "Microservices on AKS",
    description:
      "Cloud-native microservices architecture running containerized workloads on Azure Kubernetes Service with independent scaling, deployment, and failure domains per service. Azure Front Door provides global load balancing and WAF protection, while an ingress controller routes traffic to service pods backed by Cosmos DB, Redis, and Service Bus for async communication. Container Insights and distributed tracing give operators visibility into cross-service latency, pod health, and cluster resource utilization at production scale.",
    useCase: "Cloud-native applications requiring independent service scaling",
    complexity: "high",
    services: ["AKS", "Container Registry", "Service Bus", "Cosmos DB", "Front Door"],
    mermaidDiagram: `graph TB
    Users[Users / API Clients] --> FD[Azure Front Door + WAF]
    FD --> Ingress[NGINX Ingress Controller]
    Ingress -->|/orders| SvcA[Service A - Orders Pod]
    Ingress -->|/catalog| SvcB[Service B - Catalog Pod]
    Ingress -->|/users| SvcC[Service C - Users Pod]
    SvcA --> SB[Service Bus - Topics & Queues]
    SvcB --> SB
    SB --> SvcD[Service D - Notification Worker]
    SvcB --> Cosmos[(Cosmos DB - NoSQL)]
    SvcA --> Redis[(Azure Cache for Redis)]
    SvcC --> SQL[(Azure SQL - User Profiles)]
    subgraph AKS Cluster
        Ingress
        SvcA
        SvcB
        SvcC
        SvcD
    end
    ACR[Azure Container Registry] -.->|Pull images| AKS
    AKS -.-> AI[Container Insights / Azure Monitor]
    AKS -.-> KV[Key Vault - CSI Driver]`,
    considerations: [
      "Use Azure Workload Identity (or legacy pod-managed identity) for pod-level access to Key Vault, Storage, and Service Bus without secrets in manifests",
      "Configure liveness, readiness, and startup probes on every deployment; set resource requests and limits to prevent noisy-neighbor issues",
      "Implement circuit breakers and retries with exponential backoff for inter-service HTTP calls; prefer async messaging for non-critical paths",
      "Enable Container Insights and Application Insights for distributed tracing across service boundaries with correlation IDs",
      "Use Horizontal Pod Autoscaler (HPA) and Cluster Autoscaler together; define Pod Disruption Budgets for rolling updates",
      "Scan container images in ACR with Defender for Containers; enforce image signing and admission policies via Azure Policy",
      "Deploy across availability zones with node pool spread; use Azure CNI overlay or Cilium for advanced network policies",
      "Plan cluster upgrades on a regular cadence; test workload compatibility in a staging cluster before production node pool upgrades",
    ],
    costDrivers: [
      "AKS node pool VM sizes, instance count, and availability zone redundancy — GPU or memory-optimized SKUs increase cost significantly",
      "Cosmos DB provisioned RU/s or serverless mode — multi-region writes and dedicated throughput per container add expense",
      "Azure Front Door Premium routing rules, origin groups, and per-GB egress from edge to origin",
      "Service Bus Premium messaging units for high-throughput or VNet-integrated workloads",
      "Azure Cache for Redis tier and shard count — Premium required for clustering and persistence",
      "Container Registry storage and geo-replication; data egress from ACR to clusters in other regions",
    ],
  },
  {
    slug: "hub-spoke-network",
    category: "networking",
    title: "Hub-Spoke Network Topology",
    description:
      "Enterprise network segmentation model with a centralized hub VNet hosting shared security and connectivity services, and isolated spoke VNets for individual workloads or environments. Azure Firewall inspects east-west and north-south traffic, VPN Gateway connects on-premises networks, and Private DNS zones in the hub resolve PaaS private endpoints across all spokes. This topology enforces consistent security policy, simplifies compliance auditing, and prevents direct spoke-to-spoke communication that could bypass inspection.",
    useCase: "Enterprise network segmentation with centralized security",
    complexity: "high",
    services: ["Virtual Network", "Azure Firewall", "VPN Gateway", "Private DNS", "Bastion"],
    mermaidDiagram: `graph TB
    OnPrem[On-Premises DC] --> ER[ExpressRoute / VPN Gateway]
    ER --> Hub[Hub VNet - 10.0.0.0/16]
    subgraph HubVNet [Hub VNet - Shared Services]
        FW[Azure Firewall - Hub]
        Bastion[Azure Bastion]
        DNS[Private DNS Zones]
        GW[VPN / ER Gateway Subnet]
    end
    Hub -->|VNet Peering| Spoke1[Spoke VNet - Production 10.1.0.0/16]
    Hub -->|VNet Peering| Spoke2[Spoke VNet - Development 10.2.0.0/16]
    Hub -->|VNet Peering| Spoke3[Spoke VNet - DMZ 10.3.0.0/16]
    Spoke1 --> App1[App Service - VNet Integrated]
    Spoke1 --> SQL1[(Azure SQL + Private Endpoint)]
    Spoke2 --> AKS1[AKS Cluster - Dev]
    Spoke3 --> AGW[Application Gateway - Public Ingress]
    AGW --> FW
    Users[Internet Users] --> AGW
    Admin[Administrators] --> Bastion
    Bastion --> VM1[Jumpbox VM - Spoke1]`,
    considerations: [
      "Route all inter-spoke traffic through Azure Firewall in the hub using user-defined routes (UDRs); disable default peering bypass for transitive routing",
      "Peer hub to every spoke but never peer spoke-to-spoke directly — this preserves centralized inspection and simplifies route management",
      "Centralize Private DNS zones in the hub and link them to all spoke VNets so private endpoint FQDNs resolve consistently",
      "Use Azure Firewall application and network rules with FQDN tags; log all denied flows to Log Analytics for threat hunting",
      "Segment environments (prod, dev, DMZ) into separate spokes with distinct address spaces to avoid IP overlap and simplify RBAC",
      "Deploy Azure Bastion in the hub for secure RDP/SSH access; eliminate public IPs on management VMs in spokes",
      "Plan IP address space carefully — hub-and-spoke does not easily accommodate overlapping CIDR blocks without NAT or re-addressing",
      "Integrate with Azure Policy to enforce required subnets, deny public IPs on NICs, and audit peering configurations continuously",
    ],
    costDrivers: [
      "Azure Firewall hourly deployment cost plus per-GB data processing — Premium SKU adds TLS inspection charges",
      "VPN Gateway or ExpressRoute circuit monthly fees — ExpressRoute provides higher bandwidth but higher fixed cost",
      "VNet peering ingress/egress data transfer charges between hub and spokes, especially for high-volume east-west traffic",
      "Azure Bastion Standard vs. Basic hourly cost and additional charges for concurrent sessions",
      "Private DNS zone hosting per zone plus query volume; minimal cost unless managing hundreds of zones",
      "Public IP addresses assigned to Application Gateway, Firewall, Bastion, and VPN Gateway endpoints",
    ],
  },
  {
    slug: "event-driven",
    category: "integration",
    title: "Event-Driven Architecture",
    description:
      "Loosely coupled, asynchronous architecture where producers emit events and consumers react independently through Event Grid and Service Bus messaging layers. Azure Functions provide serverless compute for event handlers with automatic scaling, while Cosmos DB and Blob Storage persist processed state and raw payloads. This pattern excels at decoupling services, absorbing traffic spikes, and building resilient pipelines where downstream failures do not cascade to upstream producers.",
    useCase: "Order processing, IoT telemetry, real-time data pipelines",
    complexity: "medium",
    services: ["Event Grid", "Service Bus", "Azure Functions", "Cosmos DB", "Blob Storage"],
    mermaidDiagram: `graph LR
    subgraph Producers [Event Sources]
        BlobUp[Blob Upload]
        API[API - Order Placed]
        IoT[IoT Hub Telemetry]
    end
    BlobUp -->|Storage Event| EG[Event Grid - System Topic]
    API -->|Custom Event| EG2[Event Grid - Custom Topic]
    IoT -->|Device Events| EG2
    EG --> Func1[Function - Ingest & Validate]
    EG2 --> Func1
    Func1 -->|Enqueue| SBQ[Service Bus - Queue]
    Func1 -->|Publish| SBT[Service Bus - Topic]
    SBT --> Func2[Function - Notify Customer]
    SBT --> Func3[Function - Update Inventory]
    SBQ --> Func4[Function - Retry / DLQ Handler]
    Func1 --> Cosmos[(Cosmos DB - Event Store)]
    Func1 --> Blob[Blob Storage - Raw Payloads]
    Func2 --> Email[SendGrid / Logic Apps]
    subgraph Observability [Monitoring]
        AI[Application Insights]
        LA[Log Analytics]
    end
    Func1 --> AI
    Func2 --> AI`,
    considerations: [
      "Configure dead-letter queues (DLQ) on Service Bus subscriptions and monitor DLQ depth with alerts — replay messages after fixing root cause",
      "Design all event handlers to be idempotent; Event Grid and Service Bus may deliver the same message more than once",
      "Use Event Grid for Azure resource events (Blob created, resource provisioned) and Service Bus for business-domain events requiring ordering or sessions",
      "Set appropriate message TTL and max delivery counts on Service Bus queues to prevent poison messages from blocking processing",
      "Implement correlation IDs across the event chain for end-to-end tracing in Application Insights",
      "Use Service Bus sessions or partitioned queues when strict ordering is required for a single entity (e.g., per-order event sequence)",
      "Deploy Functions on a Premium plan or with minimum instances for latency-sensitive handlers; Consumption plan cold starts may be unacceptable",
      "Apply exponential backoff retry policies in Function bindings and complement with a scheduled DLQ reprocessor Function",
    ],
    costDrivers: [
      "Azure Functions execution count, execution time, and memory allocation — Premium plan adds baseline cost for always-ready instances",
      "Service Bus messaging operations (send/receive) and tier — Premium required for larger messages, sessions, and VNet integration",
      "Event Grid event operations — first 100K operations/month free; custom topics scale linearly with publish volume",
      "Cosmos DB RU consumption driven by write-heavy event store patterns; consider TTL on processed events to reduce storage",
      "Blob Storage for raw event payloads — lifecycle policies to Cool/Archive tier reduce long-term retention costs",
      "Application Insights data ingestion from high-volume Function telemetry — configure sampling for noisy handlers",
    ],
  },
  {
    slug: "enterprise-rag",
    category: "ai-ml",
    title: "Enterprise RAG Pipeline",
    description:
      "Production-grade retrieval-augmented generation pipeline that grounds LLM responses in enterprise documents via hybrid vector and keyword search in AI Search. Document Intelligence extracts structured text from PDFs and Office files, Content Safety filters harmful inputs and outputs, and API Management governs rate limits, authentication, and usage analytics. Private Endpoints on all AI services ensure data never traverses the public internet, meeting enterprise security and compliance requirements.",
    useCase: "Internal knowledge base chatbot for enterprise documentation",
    complexity: "medium",
    services: ["Azure OpenAI", "AI Search", "Blob Storage", "API Management", "Content Safety"],
    mermaidDiagram: `graph TB
    Users[Internal Users] --> APIM[API Management - OAuth / Rate Limit]
    APIM --> App[App Service - RAG Orchestrator]
    App -->|Embed query| OpenAI[Azure OpenAI - Embeddings]
    App -->|Generate answer| OpenAI2[Azure OpenAI - GPT-4o]
    App -->|Hybrid search| Search[AI Search - Vector + BM25]
    App --> Safety[Content Safety - Input/Output Filter]
    subgraph Ingestion Pipeline [Document Ingestion]
        Blob[Blob Storage - Source Docs] -->|Blob trigger| Func[Azure Function - Indexer]
        Func --> DI[Document Intelligence - OCR & Layout]
        DI --> Chunk[Chunking & Metadata Enrichment]
        Chunk -->|Embed chunks| OpenAI
        Chunk -->|Upsert vectors| Search
    end
    App --> Redis[(Redis Cache - Query Embeddings)]
    App --> KV[Key Vault - API Keys via MI]
    App --> AI[Application Insights - Token Usage]
    subgraph Private Networking [Private Endpoints]
        OpenAI
        OpenAI2
        Search
        DI
    end`,
    considerations: [
      "Pre-filter AI Search results by tenantId, department, or document ACL metadata to enforce document-level authorization in multi-tenant deployments",
      "Cache frequent query embeddings in Redis to avoid redundant OpenAI embedding API calls for popular questions",
      "Deploy Private Endpoints on Azure OpenAI, AI Search, Document Intelligence, and Blob Storage; disable public network access",
      "Implement chunking strategies tuned to document type — legal contracts need larger overlap; FAQs can use smaller chunks",
      "Run Content Safety on both user prompts and model responses; block or redact categories per organizational policy",
      "Track token usage per user and department via APIM policies and Application Insights for chargeback and budget alerts",
      "Version your search index schema and maintain a blue-green reindexing pipeline for zero-downtime content updates",
      "Evaluate hybrid search (vector + keyword) over pure vector search for domains with exact-match terminology like SKUs or regulation numbers",
    ],
    costDrivers: [
      "Azure OpenAI token consumption for embeddings and chat completions — GPT-4o output tokens cost significantly more than embedding tokens",
      "AI Search service unit (SU) tier and replica count — semantic ranker and vector search require Standard tier or above",
      "Document Intelligence pages processed during ingestion — Read vs. Layout models have different per-page pricing",
      "Blob Storage for source documents and intermediate extraction artifacts; grows with corpus size",
      "API Management unit tier — Developer for testing, Standard/Premium for production SLAs and VNet integration",
      "Redis Cache tier for embedding cache — Basic may suffice for low traffic; Standard for persistence and SLA",
    ],
  },
  {
    slug: "zero-trust",
    category: "identity-security",
    title: "Zero-Trust Architecture",
    description:
      "Security architecture that eliminates implicit trust based on network location, requiring explicit verification for every access request regardless of origin. All PaaS services are accessed exclusively through Private Link endpoints, Managed Identity replaces stored credentials, and Entra ID Conditional Access enforces device compliance and MFA for human users. Azure Firewall and Defender for Cloud provide network segmentation, threat detection, and just-in-time administrative access across the estate.",
    useCase: "Regulated industries requiring data residency and network isolation",
    complexity: "high",
    services: ["Private Link", "Entra ID", "Key Vault", "Azure Firewall", "Defender for Cloud"],
    mermaidDiagram: `graph TB
    Users[Corporate Users] --> CA[Entra ID - Conditional Access]
    CA -->|MFA + Compliant Device| VPN[VPN / ExpressRoute]
    VPN --> FW[Azure Firewall - Egress & Ingress Control]
    FW --> App[App Service - VNet Integrated]
    subgraph Identity Layer [Identity & Secrets]
        MI[Managed Identity - System Assigned]
        KV[Key Vault - Secrets & Certs]
        RBAC[Entra ID RBAC Roles]
    end
    App -->|MI + RBAC| PE1[Private Endpoint - SQL]
    App -->|MI + RBAC| PE2[Private Endpoint - Key Vault]
    App -->|MI + RBAC| PE3[Private Endpoint - Storage]
    App -->|MI + RBAC| PE4[Private Endpoint - OpenAI]
    PE1 --> SQL[(Azure SQL - Public Access Disabled)]
    PE2 --> KV
    PE3 --> Storage[Blob Storage - Public Access Disabled]
    PE4 --> OpenAI[Azure OpenAI]
    subgraph Security Operations [Threat Detection]
        DFC[Defender for Cloud - CSPM]
        DLP[Defender for Storage - Malware Scan]
        JIT[Defender JIT - VM Access]
    end
    FW --> DFC
    Storage --> DLP
    Admin[Administrators] --> JIT
    JIT --> VM[Management VM]`,
    considerations: [
      "Disable public network access on ALL PaaS resources — SQL, Storage, Key Vault, OpenAI, AI Search; verify with Azure Policy audits",
      "Enforce Entra ID Conditional Access: require MFA, compliant devices, and named locations for all user access to applications",
      "Use Managed Identity for all service-to-service authentication; rotate no secrets in application configuration or connection strings",
      "Apply least-privilege RBAC at resource group and individual resource scope; avoid subscription-wide Owner assignments",
      "Enable Defender for Cloud Secure Score monitoring and remediate critical recommendations within defined SLA windows",
      "Configure just-in-time (JIT) VM access via Defender for Cloud instead of permanent open management ports",
      "Log all Key Vault access, Firewall deny events, and Entra ID sign-ins to a centralized Log Analytics workspace with retention policies",
      "Conduct regular penetration testing and attack path analysis using Defender for Cloud's attack path recommendations",
    ],
    costDrivers: [
      "Private Endpoint hourly charges per service instance plus per-GB data processing — each PE on SQL, Storage, KV, and AI adds fixed cost",
      "Azure Firewall Standard or Premium deployment and traffic processing fees for all north-south and east-west flows",
      "ExpressRoute circuit monthly port fee and data transfer — higher bandwidth circuits cost substantially more than VPN Gateway",
      "Defender for Cloud plan subscriptions per resource type (Servers, Storage, SQL, Containers) — bundled plans reduce per-resource cost",
      "Key Vault operations pricing per 10K transactions — high-frequency secret rotation increases transaction volume",
      "Log Analytics ingestion and retention for security logs — firewall and Entra ID logs are high-volume; plan retention tiers carefully",
    ],
  },
  {
    slug: "data-lake-analytics",
    category: "storage",
    title: "Data Lake & Analytics",
    description:
      "Centralized data platform implementing the medallion architecture to ingest raw data, refine it through processing pipelines, and serve curated datasets for analytics and BI. Event Hubs captures high-volume streaming data from IoT devices and applications, Data Lake Gen2 stores bronze/silver/gold layers with hierarchical namespace and ACLs, and Synapse or Databricks executes transformation jobs at scale. Power BI connects to the gold layer for self-service reporting, completing an end-to-end modern data warehouse pattern on Azure.",
    useCase: "Centralized data platform for batch and streaming analytics",
    complexity: "high",
    services: ["Data Lake Gen2", "Event Hubs", "Synapse Analytics", "Databricks"],
    mermaidDiagram: `graph LR
    subgraph Sources [Data Sources]
        IoT[IoT Devices]
        Apps[Application Logs]
        DBs[SQL / ERP Databases]
        APIs[External APIs]
    end
    IoT --> EH[Event Hubs - Streaming Ingest]
    Apps --> EH
    DBs -->|ADF Copy| ADF[Azure Data Factory - Batch Ingest]
    APIs --> ADF
    EH -->|Stream Analytics / Spark| ADLS[Data Lake Gen2 - Bronze / Raw]
    ADF --> ADLS
    ADLS -->|Synapse Pipelines / Databricks Jobs| Process[Synapse / Databricks - Silver / Cleansed]
    Process --> ADLS2[Data Lake Gen2 - Silver Layer]
    ADLS2 -->|Aggregation & Modeling| Process2[Synapse Serverless / Databricks - Gold / Curated]
    Process2 --> ADLS3[Data Lake Gen2 - Gold Layer]
    ADLS3 --> BI[Power BI - Direct Lake / Import]
    ADLS3 --> ML[Azure ML - Feature Store]
    subgraph Governance [Data Governance]
        Purview[Microsoft Purview - Catalog & Lineage]
        Policy[Storage Lifecycle Policies]
    end
    ADLS --> Purview
    ADLS --> Policy`,
    considerations: [
      "Implement medallion architecture strictly: bronze (immutable raw), silver (cleansed and deduplicated), gold (business-level aggregates)",
      "Partition data by date (and optionally region or product) in Delta/Parquet format for efficient partition pruning in Synapse and Databricks queries",
      "Apply lifecycle management policies on the bronze layer — move to Cool after 30 days, Archive after 365 days to control storage costs",
      "Use Unity Catalog or Purview to register datasets, track lineage, and classify sensitive columns (PII, PCI) for compliance",
      "Size Event Hubs throughput units or use Kafka-compatible dedicated clusters based on peak ingress rate and retention requirements",
      "Separate dev/test/prod data lake accounts with RBAC and ACLs; never run experimental Databricks jobs against production gold tables",
      "Enable soft delete and versioning on Data Lake accounts to protect against accidental deletion of critical datasets",
      "Define SLAs for pipeline freshness and implement monitoring alerts when bronze-to-gold latency exceeds business thresholds",
    ],
    costDrivers: [
      "Event Hubs throughput units or processing units — dedicated clusters for Kafka workloads carry higher fixed monthly cost",
      "Data Lake Gen2 storage volume across bronze/silver/gold tiers — Hot vs. Cool vs. Archive pricing differs significantly at TB scale",
      "Synapse Analytics dedicated SQL pool DWU hours and serverless SQL per-TB scanned charges",
      "Databricks DBU consumption based on cluster size, job duration, and premium vs. standard tier runtimes",
      "Azure Data Factory pipeline activity runs and self-hosted integration runtime VMs for on-premises sources",
      "Power BI Premium capacity or per-user licensing for Direct Lake connections to large gold-layer datasets",
    ],
  },
  {
    slug: "multi-region-dr",
    category: "governance",
    title: "Multi-Region Disaster Recovery",
    description:
      "Active-passive disaster recovery architecture spanning two Azure regions with automated DNS failover via Traffic Manager and geo-replicated data stores for recovery point objectives under 15 minutes. The primary region handles all production traffic while the secondary region maintains warm-standby App Service instances and read-accessible database replicas ready for promotion during regional failure. Infrastructure-as-code pipelines deploy identically to both regions, ensuring failover does not depend on manual configuration drift remediation.",
    useCase: "Business-critical applications requiring RTO < 1 hour",
    complexity: "high",
    services: ["Traffic Manager", "Front Door", "Azure SQL", "Cosmos DB", "Blob Storage GRS"],
    mermaidDiagram: `graph TB
    Users[Global Users] --> TM[Traffic Manager - Priority Routing]
    TM -->|Priority 1 - Active| FD1[Front Door - Region 1]
    TM -.->|Priority 2 - Failover| FD2[Front Door - Region 2]
    subgraph Region1 [Region 1 - Primary / Active]
        FD1 --> App1[App Service - Production]
        App1 --> SQL[(Azure SQL - Primary)]
        App1 --> Cosmos1[(Cosmos DB - Write Region)]
        App1 --> Blob1[Blob Storage - LRS/GRS]
    end
    subgraph Region2 [Region 2 - Secondary / Passive]
        FD2 --> App2[App Service - Warm Standby]
        App2 --> SQL2[(SQL - Geo Replica / Read-Only)]
        App2 --> Cosmos2[(Cosmos DB - Read Region)]
        App2 --> Blob2[Blob Storage - RA-GRS Secondary]
    end
    SQL -.->|Auto-failover Group| SQL2
    Cosmos1 -.->|Multi-region writes| Cosmos2
    Blob1 -.->|Geo-replication| Blob2
    subgraph DR Operations [DR Readiness]
        BCP[Quarterly Failover Drills]
        IaC[Bicep / Terraform - Region Agnostic]
        Monitor[Azure Monitor - Health Probes]
    end
    TM --> Monitor
    BCP --> TM`,
    considerations: [
      "Conduct documented failover drills quarterly — validate RTO/RPO targets, DNS propagation time, and application behavior on the passive region",
      "Configure Azure SQL auto-failover groups with a readable secondary in the DR region; test forced failover impact on in-flight transactions",
      "Keep all deployment automation region-agnostic using Bicep/Terraform parameters for location, SKUs, and naming conventions",
      "Use Traffic Manager priority routing with automated endpoint health probes; set appropriate probe intervals and tolerated failures",
      "Replicate Cosmos DB to the DR region with multi-region writes if the application requires sub-second RPO for NoSQL data",
      "Store application secrets and configuration in Key Vault with backup/recovery procedures; replicate critical secrets to the DR region vault",
      "Define a clear failover runbook including communication plan, decision authority, and criteria for failback after primary region recovery",
      "Monitor replication lag on SQL geo-replicas and Cosmos DB — alert when lag exceeds RPO thresholds before an actual disaster",
    ],
    costDrivers: [
      "Duplicate App Service plans and instances in the passive region — warm standby costs nearly as much as active unless scaled down between drills",
      "Azure SQL geo-replication licensing — secondary replica compute and storage billed separately from primary",
      "Cosmos DB multi-region write RU/s — each additional write region doubles effective RU provisioning cost",
      "Blob Storage GRS/RA-GRS premium over LRS — geo-replication adds ~2x storage cost plus egress on failover reads",
      "Geo-replication and cross-region data transfer charges for continuous sync between primary and secondary regions",
      "Traffic Manager DNS queries and Front Door origin health probes — low per-unit cost but scale with global user base",
    ],
  },
];

export function getArchitecture(slug: string): ArchitecturePattern | undefined {
  return architectures.find((a) => a.slug === slug);
}