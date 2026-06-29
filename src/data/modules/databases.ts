import { LearningModule } from "@/lib/types";

export const databaseModules: LearningModule[] = [
  {
    slug: "azure-sql",
    category: "databases",
    title: "Azure SQL Database",
    subtitle: "Managed SQL with tiers, elastic pools, and geo-replication",
    description:
      "Fully managed relational database. Service tiers, scaling, HA, and security for production SQL workloads.",
    difficulty: "foundational",
    duration: "95 min",
    services: ["Azure SQL Database", "SQL Managed Instance", "Elastic Pool"],
    sections: [
      {
        id: "tiers",
        title: "Service Tiers & Compute Models",
        content: `Azure SQL is Microsoft's **PaaS relational database** family. Choosing the right deployment model and tier drives cost, compatibility, and scale ceilings.

**Deployment options:**

| Option | Compatibility | Network | Best for |
|---|---|---|---|
| **Single database** | SQL Database feature set | Public or Private Endpoint | One app, one DB |
| **Elastic pool** | Same as single DB | Shared server | Multi-tenant SaaS, many small DBs |
| **SQL Managed Instance** | Near 100% SQL Server | VNet-native (private by default) | Lift-and-shift, linked servers, CLR |
| **SQL on VM** | 100% SQL Server | Full control | Custom extensions, legacy deps |

**Service tiers** (single DB / pooled):

| Tier | Storage model | HA | Read scale | Max scale | Sweet spot |
|---|---|---|---|---|---|
| **General Purpose** | Remote storage | 99.99% (zone optional) | No native replicas | 128 vCores, 4 TB | Most OLTP workloads |
| **Business Critical** | Local SSD | 99.995%, built-in secondary | Yes (free readable replica) | 128 vCores, 4 TB | Low latency, HA, read offload |
| **Hyperscale** | Distributed storage | 99.995% | Yes (named replicas) | 128 vCores, **100 TB** | Very large DBs, fast backup/restore |

**DTU vs vCore:**

| Model | Billing | Flexibility | When to choose |
|---|---|---|---|
| **DTU** | Bundled compute+IO+storage | Simple slider | Dev/test, predictable small apps |
| **vCore** | Separate compute, storage, license | Full control, HA options, MI parity | **Production** |

**Elastic pools** — share eDTUs/vCores across databases:
- Each DB has min/max resources; pool has total budget
- **Great for SaaS**: hundreds of tenant DBs with uncorrelated peak times
- **Poor fit**: one tenant monopolizes pool → set per-DB max limits
- Monitor **pool eDTU/vCore utilization** — over-provisioned pools waste money; under-provisioned cause throttling

**Hyperscale highlights:**
- Storage grows automatically to 100 TB — no upfront size pick
- **Fast backups** (file-snapshot based) and **point-in-time restore** independent of size
- **Named replicas** for read scale and reporting without loading primary

**Cost/performance tradeoffs:**
- **General Purpose** cheapest per vCore for moderate IO; latency higher than BC local SSD
- **Business Critical** ~3× compute cost vs GP but includes HA replica and read scale — often cheaper than GP + manual HA
- **Reserved capacity** (1–3 yr) saves 20–65% on compute for steady workloads`,
        keyPoints: [
          "Elastic pools for multi-tenant SaaS — set per-database max to prevent noisy neighbor",
          "vCore model for production; DTU for simple dev/test sizing",
          "Business Critical for low-latency OLTP with built-in readable secondary",
          "Hyperscale when database exceeds 4 TB or needs rapid backup/restore at scale",
        ],
        warning:
          "Elastic pools without per-database maximum limits allow one tenant to exhaust the entire pool and throttle all others.",
      },
      {
        id: "ha-security",
        title: "High Availability & Security",
        content: `Production Azure SQL requires deliberate **HA/DR topology** and **identity-first security** — not defaults left unchanged.

**High availability within a region:**

| Feature | Tier | Behavior |
|---|---|---|
| **Zone redundancy** | GP / BC / Hyperscale (optional) | Primary + standby in different AZs; automatic failover |
| **BC built-in replica** | Business Critical | Synchronous local SSD replica; sub-second failover |
| **Hyperscale secondaries** | Hyperscale | Named replicas, geo secondaries |

**Disaster recovery across regions:**

| Feature | RPO | Failover | DNS |
|---|---|---|---|
| **Active geo-replication** | ~5 sec (async) | Manual per database | Update connection strings |
| **Auto-failover groups** | ~5 sec | **Automatic** for group | **Automatic** listener DNS update |
| **Geo-restore** | Up to 1 hr | Manual restore to new DB | New endpoint |

**Auto-failover groups** (recommended for DR):
- Groups one or more databases + optional **managed instance** pair
- **Read-write listener** follows primary; **read-only listener** targets secondary
- Test failover quarterly — app must tolerate brief disconnect during DNS swap

**Security layers:**

| Control | Purpose |
|---|---|
| **Microsoft Entra authentication** | Eliminate SQL logins/passwords; MFA, conditional access |
| **Private Endpoint** | No public internet surface |
| **TDE** | Transparent encryption at rest (service-managed or CMK) |
| **Always Encrypted** | Client-side column encryption; keys never on server |
| **Dynamic Data Masking** | Obfuscate PII for non-privileged users |
| **Row-Level Security** | Tenant isolation in shared schema |
| **Microsoft Defender for SQL** | Vulnerability assessment, threat detection (SQL injection, brute force) |
| **Auditing** | Track logins and changes → Log Analytics / Storage |

**Network hardening pattern:**
1. Create Private Endpoint in data subnet
2. Disable public network access
3. Link Private DNS zone \`privatelink.database.windows.net\`
4. NSG allow only app subnet → SQL subnet on 1433
5. Entra-only admin — disable SQL authentication in production`,
        codeExample: `# Connection string with Entra ID (DefaultAzureCredential) — .NET
using Azure.Identity;
using Microsoft.Data.SqlClient;

var conn = new SqlConnection(
    "Server=tcp:myserver.database.windows.net,1433;" +
    "Database=mydb;Encrypt=True;TrustServerCertificate=False;");
conn.AccessToken = new DefaultAzureCredential()
    .GetTokenAsync(new TokenRequestContext(
        new[] { "https://database.windows.net/.default" }))
    .Result.Token;
await conn.OpenAsync();`,
        keyPoints: [
          "Auto-failover groups for DR with automatic DNS — test failover regularly",
          "Entra ID auth + Private Endpoint is the production security baseline",
          "Business Critical readable secondary offloads reporting without extra licensing",
          "Defender for SQL adds vulnerability scanning and real-time threat alerts",
        ],
        warning:
          "Disabling public access before Private Endpoint DNS is validated causes total application outage. Validate resolution from app subnets first.",
      },
      {
        id: "operations-performance",
        title: "Operations, Tuning & Cost Control",
        content: `Running Azure SQL in production means continuous **index/query tuning**, **capacity planning**, and **FinOps** discipline.

**Performance monitoring:**

| Tool | What it shows |
|---|---|
| **Query Store** | Regressed queries, plan forcing, top resource consumers |
| **DMVs** (sys.dm_*) | Waits, blocking, IO stats — same as SQL Server |
| **Intelligent Insights** | Automatic root-cause detection for spikes |
| **Azure SQL Analytics** | Fleet view across databases in Log Analytics |

**Common production patterns:**
- **Connection pooling** in app tier (PgBouncer equivalent is built into ADO.NET/ORM pools) — avoid opening per-request connections
- **Read-only routing** to BC secondary or geo replica for reporting
- **Partitioning / archive** old data to reduce working set and backup time
- **Hyperscale** for databases that outgrow 4 TB without painful migration

**Scaling operations:**

| Action | Downtime | Notes |
|---|---|---|
| Scale vCores up | Seconds–minutes | Brief connection drop |
| Scale vCores down | Minutes | May need wait for workload to idle |
| Change tier GP → BC | Minutes | Planned maintenance window |
| Enable zone redundancy | None (new allocations) | Apply during low traffic |

**Backup & retention:**
- **Automated backups**: Full weekly + differential every 12–24 hr + log every 5–10 min
- **PITR** retention: 1–35 days (configure per business RPO)
- **LTR** (Long-Term Retention): Weekly/monthly/yearly up to 10 years — compliance workloads
- **Backup storage cost** grows with retention and update frequency — tune LTR policies

**Cost optimization checklist:**
- Right-size with **Azure Advisor** and Query Store — oversized vCores is the #1 waste
- **Reserved capacity** for 24/7 production compute
- **Serverless** (GP only): auto-pause dev DBs; pay per second when active
- Elastic pool instead of N × single oversized DBs for SaaS
- Archive cold data to Blob + PolyBase/external tables where query frequency is low`,
        codeExample: `-- Find top CPU consumers (Query Store)
SELECT TOP 10
    q.query_id,
    CAST(qt.query_sql_text AS NVARCHAR(200)) AS sql_text,
    rs.avg_cpu_time / 1000.0 AS avg_cpu_ms,
    rs.count_executions
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
ORDER BY rs.avg_cpu_time DESC;`,
        keyPoints: [
          "Query Store is the first stop for production performance regressions",
          "Read-only routing to replicas protects primary OLTP from reporting load",
          "LTR and PITR retention directly drive backup storage cost — align with compliance needs",
          "Reserved capacity and right-sizing beat default oversized provisioning",
        ],
        warning:
          "Scaling down vCores during peak traffic causes throttling and timeouts. Use auto-scaling alerts or maintenance windows for downward changes.",
      },
    ],
    quiz: [
      {
        question: "Which feature provides automatic DNS update during regional failover for a group of databases?",
        options: [
          "Active geo-replication",
          "Auto-failover groups",
          "Geo-restore",
          "Zone redundancy",
        ],
        answer: 1,
        explanation:
          "Auto-failover groups include a read-write listener that automatically redirects to the new primary after failover.",
      },
      {
        question: "When should you choose Hyperscale tier over General Purpose?",
        options: [
          "Dev databases that auto-pause overnight",
          "Databases approaching or exceeding 4 TB with need for fast backup/restore",
          "Applications requiring linked servers to on-premises SQL",
          "Multi-tenant SaaS with 200 small databases",
        ],
        answer: 1,
        explanation:
          "Hyperscale supports up to 100 TB with distributed storage and file-snapshot backups designed for very large databases.",
      },
      {
        question: "What is the recommended authentication approach for production Azure SQL?",
        options: [
          "SQL login with password in connection string",
          "Microsoft Entra ID with Managed Identity",
          "Storage account key",
          "Shared access signature token",
        ],
        answer: 1,
        explanation:
          "Entra ID with Managed Identity eliminates password rotation, enables conditional access, and integrates with Azure RBAC.",
      },
    ],
  },
  {
    slug: "cosmos-db",
    category: "databases",
    title: "Azure Cosmos DB",
    subtitle: "Globally distributed NoSQL with tunable consistency",
    description:
      "Multi-model database with global distribution, partition key design, and consistency level selection.",
    difficulty: "intermediate",
    duration: "100 min",
    services: ["Cosmos DB", "NoSQL API", "MongoDB API", "Vector Search"],
    sections: [
      {
        id: "model-consistency",
        title: "Data Model & Consistency Levels",
        content: `Azure Cosmos DB is a **globally distributed, multi-model** database with single-digit millisecond reads and writes at any scale — when partition keys and RU provisioning are right.

**APIs** (choose based on app compatibility):

| API | Wire protocol | Migration path |
|---|---|---|
| **NoSQL** (native) | Cosmos SDK | Greenfield, best feature velocity |
| **MongoDB** | MongoDB 4.2+ compatible | Existing Mongo apps |
| **PostgreSQL** | Citus distributed PG | Relational + distribution |
| **Cassandra** | CQL | Wide-column Cassandra workloads |
| **Table** | Azure Tables SDK | Simple key-value entities |
| **Gremlin** | TinkerPop | Graph traversals |

**Consistency levels** (strongest → weakest, with latency/cost tradeoff):

| Level | Guarantee | Read RU cost | Global writes | Typical use |
|---|---|---|---|---|
| **Strong** | Linearizability | Highest | Highest latency | Financial ledger, inventory |
| **Bounded staleness** | Prefix + max lag (K,T) | High | Moderate | Geo-distributed with SLA on staleness |
| **Session** | Consistent within session | Default | Low | **Most apps** — user sees own writes |
| **Consistent prefix** | Ordered reads | Lower | Lower | Social feeds, timelines |
| **Eventual** | No ordering guarantee | Lowest | Lowest | Metrics, non-critical caches |

**Session consistency** is the default sweet spot: users read their own writes without paying Strong's global quorum latency.

**Request Units (RUs)** — the throughput currency:
- **1 RU** ≈ 1 KB point read (by id + partition key) per second
- Writes cost more RUs than reads (factor ~5–15× depending on indexing)
- **Provisioned throughput**: Fixed RU/s per container or database — predictable, SLA-backed
- **Serverless**: Pay per request — dev, bursty, unpredictable traffic (caps at 5,000 RU burst)
- **Autoscale**: Provisioned with 1–10× scale range — handles diurnal patterns without manual ops

**Cost/performance tradeoffs:**

| Model | Steady high traffic | Spiky / dev | Risk |
|---|---|---|---|
| Provisioned manual | Lowest $/RU at scale | Over-provision waste | Throttling if under-provisioned |
| Autoscale | Good for variable load | Higher minimum cost | Scales to max, not infinite |
| Serverless | Poor $/RU at scale | **Best for dev** | 5,000 RU ceiling per container |

**Global distribution:**
- Add **regions** with single click — Cosmos replicates data asynchronously (or synchronously with Strong)
- **Multi-region writes** (formerly multi-master): any region accepts writes; last-writer-wins conflict resolution
- **Regional failover**: Manual or automatic with **Service Managed failover** priority list`,
        keyPoints: [
          "Session consistency balances UX and performance for most applications",
          "Provisioned autoscale for production variable load; serverless for dev and spikes under 5K RU",
          "Point reads by id + partition key are cheapest — avoid cross-partition scans in hot paths",
          "Multi-region writes enable active-active but require conflict resolution design",
        ],
        warning:
          "Strong consistency on globally distributed accounts dramatically increases write latency and RU cost. Default to Session unless you have a proven linearizability requirement.",
      },
      {
        id: "partitioning",
        title: "Partition Key Design",
        content: `The **partition key** is the most important Cosmos DB design decision — it controls distribution, throughput ceiling per logical partition, and query efficiency. **It is immutable** after container creation.

**Logical vs physical partitions:**
- Cosmos hashes partition key values into **logical partitions** (max **20 GB** per logical partition)
- Logical partitions map to **physical partitions** (server-side storage units)
- Total RU/s splits across physical partitions — hot logical partitions cause **429 throttling**

**Good partition key characteristics:**
1. **High cardinality** — millions of distinct values
2. **Even distribution** — no single value dominates traffic
3. **Query alignment** — most queries filter on partition key

| Good keys | Why |
|---|---|
| \`tenantId\` | High cardinality in SaaS |
| \`userId\` | Even spread for user-scoped data |
| \`deviceId\` | IoT telemetry per device |
| **Synthetic**: \`tenantId#orderDate\` | Combine for write distribution |

| Bad keys | Problem |
|---|---|
| \`status\` (active/inactive) | Only 2 values → hot partitions |
| \`timestamp\` alone | Monotonic → all writes hit one partition |
| \`country\` (few values) | Skew if US dominates traffic |

**Hierarchical partition keys** (preview/GA): Multi-level keys (\`/tenantId\`, \`/userId\`) improve query flexibility while keeping distribution — use when single attribute is insufficient.

**Query rules for performance:**
- **Single-partition query** (equality on partition key): Scales with partition RU — efficient
- **Cross-partition query** (no partition key filter): Consumes RUs from **every** partition — expensive, higher latency
- Enable **partition key in SDK** for point reads: \`ReadItemAsync(id, partitionKey)\`

**Hot partition symptoms:**
- One logical partition >> 20 GB (split may lag)
- 429 errors with high \`x-ms-retry-after-ms\` on one key value
- Metrics: **Normalized RU Consumption** per partition key in diagnostic logs

**Vector search** (DiskANN index):
- Store embeddings as \`float32\` arrays in NoSQL API
- **Always filter by partition key** before vector search — cross-partition vector queries are costly
- Tune \`quantization\` and \`efSearch\` for recall vs. latency tradeoff`,
        codeExample: `// Efficient point read — include partition key
var response = await container.ReadItemAsync<Order>(
    id: "order-42",
    partitionKey: new PartitionKey("tenant-contoso"),
    cancellationToken: ct);

// Inefficient — cross-partition scan (avoid in hot path)
var query = container.GetItemQueryIterator<Order>(
    "SELECT * FROM c WHERE c.status = 'shipped'");`,
        keyPoints: [
          "Partition key is immutable — changing it requires full container migration",
          "High cardinality + even distribution prevents hot partitions and 429 throttling",
          "Single-partition queries scale; cross-partition queries burn RUs across all partitions",
          "Vector search must include partition key filter for production cost and latency",
        ],
        warning:
          "Changing partition key requires full data migration to a new container. Load-test partition key distribution with production-scale traffic before committing.",
      },
      {
        id: "production-ops",
        title: "Production Operations & RU Management",
        content: `Operating Cosmos DB at scale requires **RU budgeting**, **index policy tuning**, and **observability** — throttling is almost always a design or provisioning issue, not a service outage.

**RU provisioning strategies:**

| Pattern | Configuration | When |
|---|---|---|
| **Dedicated container RU** | RU/s on container | Predictable heavy container |
| **Shared database RU** | Pool across containers | Many small containers |
| **Autoscale** | 1,000–100,000 RU/s range | Diurnal traffic |
| **Burst handling** | Retry with exponential backoff | SDK default + jitter |

**429 throttling handling** (built into SDK):
- SDK retries automatically with backoff
- App should log 429 rate — sustained 429 means under-provisioned or hot partition
- **BulkExecutor** / bulk support for ingest — batches reduce overhead

**Indexing policy** — every indexed path costs write RUs:
\`\`\`json
{
  "indexingMode": "consistent",
  "includedPaths": [{ "path": "/tenantId/?" }, { "path": "/createdAt/?" }],
  "excludedPaths": [{ "path": "/*" }]
}
\`\`\`
- **Exclude** large blobs, embeddings metadata you never filter, write-only fields
- **Composite indexes** for multi-property ORDER BY and range queries
- **Spatial indexes** for geo queries

**Change Feed** — incremental processing:
- Ordered log of changes per partition
- Consumers: Azure Functions trigger, Spark, custom lease container
- Pattern: CQRS projection, search index sync, analytics lake ingest
- **Lease container** stores checkpoint per worker partition

**Backup & DR:**
- **Continuous backup** (7–30 day PITR) — default for new accounts
- **Periodic backup** — scheduled snapshots to storage
- **Analytical store** (columnar, auto-sync): Synapse Link for zero-ETL analytics on operational data

**Security production baseline:**
- **Private Endpoint** + disable public access
- **Entra ID RBAC** (Cosmos DB Built-in Data Contributor/Reader)
- **Customer-managed keys** for encryption at rest
- **IP firewall** as defense in depth (not substitute for Private Endpoint)

**Monitoring dashboard essentials:**
- Total Request Units consumed vs. provisioned
- 429 count by collection
- Server-side latency P99
- **Availability Zones** enabled for zone-redundant accounts in production regions`,
        codeExample: `# Terraform — autoscale container with partition key
resource "azurerm_cosmosdb_sql_container" "orders" {
  name                  = "orders"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.db.name
  database_name         = azurerm_cosmosdb_sql_database.db.name
  partition_key_paths   = ["/tenantId"]
  partition_key_version = 2

  autoscale_settings {
    max_throughput = 4000
  }
}`,
        keyPoints: [
          "Tune indexing policy — over-indexing inflates every write's RU cost",
          "Change Feed powers search sync, projections, and analytics without polling",
          "Autoscale handles variable load but has a floor cost at minimum RU",
          "429 errors signal under-provisioning or hot partitions — fix design before raising RU indefinitely",
        ],
        warning:
          "Raising RU limits on a bad partition key only delays failure. Fix key distribution before scaling RU into runaway cost.",
      },
    ],
    quiz: [
      {
        question: "Which consistency level is the default recommendation for most user-facing applications?",
        options: ["Strong", "Bounded staleness", "Session", "Eventual"],
        answer: 2,
        explanation:
          "Session consistency ensures users read their own writes without the global latency penalty of Strong consistency.",
      },
      {
        question: "What is the maximum size of a single logical partition in Cosmos DB?",
        options: ["2 GB", "10 GB", "20 GB", "Unlimited"],
        answer: 2,
        explanation:
          "Logical partitions have a 20 GB size limit. Poor partition key choice can create partitions that approach this limit and throttle.",
      },
      {
        question: "Which operation consumes the fewest RUs?",
        options: [
          "Cross-partition query with SELECT *",
          "Point read by id and partition key",
          "Upsert with full document indexing on all paths",
          "Vector search without partition key filter",
        ],
        answer: 1,
        explanation:
          "A point read by id + partition key targets a single item (~1 RU per KB) and avoids fan-out to all partitions.",
      },
    ],
  },
  {
    slug: "postgresql-redis",
    category: "databases",
    title: "PostgreSQL & Redis Cache",
    subtitle: "Flexible Server, pgvector, and caching patterns",
    description:
      "Open-source relational database on Azure and in-memory caching for performance.",
    difficulty: "intermediate",
    duration: "90 min",
    services: ["PostgreSQL Flexible Server", "Azure Cache for Redis"],
    sections: [
      {
        id: "postgresql",
        title: "Azure Database for PostgreSQL",
        content: `**Azure Database for PostgreSQL – Flexible Server** is the current production offering (Single Server is retired). It provides full PostgreSQL control with Azure-managed HA, backup, and security.

**Compute tiers:**

| Tier | vCPU / memory | Storage | Burst | Use case |
|---|---|---|---|---|
| **Burstable (B-series)** | 1–20 vCores | 32 GB–64 TB | CPU credits | Dev/test, light web |
| **General Purpose (D-series)** | 2–96 vCores | 32 GB–64 TB | No | Production OLTP |
| **Memory Optimized (E-series)** | 2–96 vCores | 32 GB–64 TB | No | Analytics, cache-heavy PG |

**High availability:**
- **Zone-redundant HA**: Standby in another AZ; automatic failover (~60–120 sec)
- **Same-zone HA**: Lower cost; survives node failure, not zone failure
- Test failover runbook — connection pools must retry on disconnect

**Scaling:**
- **Compute scale**: Vertical resize with brief restart (or failover to standby)
- **Storage**: Auto-grow optional; **cannot shrink** storage — start conservative, grow as needed
- **Read replicas**: Up to 15 async replicas; promote to standalone for DR or reporting
- **Logical replication** for selective table sync to external PostgreSQL

**pgvector for AI workloads:**
- Extension \`vector\` enables embedding storage and similarity search
- **HNSW index** (recommended): fast approximate nearest neighbor, tunable \`m\` and \`ef_construction\`
- **IVFFlat**: Lower memory, faster build; lower recall — good for very large static indexes
- Combine SQL filters + vector distance in one query — avoids separate vector DB for moderate scale

\`\`\`sql
CREATE EXTENSION vector;
CREATE TABLE documents (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  content text,
  embedding vector(1536)
);
CREATE INDEX ON documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
\`\`\`

**Security baseline:**
- **Entra ID authentication** (including Managed Identity for apps)
- **Private Endpoint** — disable public access in production
- **SSL enforced** — download DigiCert root CA for verified connections
- **PGAudit** extension for compliance auditing

**Backup & DR:**
- **PITR**: 7–35 days (configurable)
- **Geo-redundant backup storage**: Restore to another region after regional disaster
- **Long-term retention** via manual dumps to Blob if beyond 35 days`,
        codeExample: `# Connect with Entra ID token (Python + psycopg)
from azure.identity import DefaultAzureCredential
import psycopg

credential = DefaultAzureCredential()
token = credential.get_token(
    "https://ossrdbms-aad.database.windows.net/.default"
).token

conn = psycopg.connect(
    host="myserver.postgres.database.azure.com",
    dbname="mydb",
    user="my-app@mytenant.onmicrosoft.com",
    password=token,
    sslmode="require",
)`,
        keyPoints: [
          "Flexible Server General Purpose + zone-redundant HA for production OLTP",
          "pgvector HNSW indexes enable SQL + semantic search without a separate vector database",
          "Storage cannot shrink — enable auto-grow but avoid massively over-provisioning day one",
          "Read replicas offload reporting; promote replica for regional DR scenarios",
        ],
        warning:
          "Burstable B-series tiers exhaust CPU credits under sustained load and throttle production apps. Use General Purpose for any steady traffic.",
      },
      {
        id: "redis",
        title: "Azure Cache for Redis",
        content: `**Azure Cache for Redis** provides managed, in-memory data store for sub-millisecond latency — session state, caching, rate limiting, pub/sub, and **semantic caching** for LLM apps.

**Tiers** (production comparison):

| Tier | SLA | Replication | Cluster | VNet | Persistence | Max size |
|---|---|---|---|---|---|---|
| **Basic** | None | No | No | No | No | 1.2 GB | 
| **Standard** | 99.9% | Primary + replica | No | No | No | 120 GB |
| **Premium** | 99.9% | Yes | Yes (sharding) | **Yes** | RDB/AOF | 120 GB |
| **Enterprise** | 99.99% | Active geo-rep | Yes | Yes | Yes | 14 TB |

**Note**: Azure Cache for Redis is transitioning to **Azure Managed Redis** (Redis Enterprise) — new features (RedisJSON, RediSearch, active-active geo) live on Enterprise tier.

**Caching patterns:**

| Pattern | Flow | Consistency |
|---|---|---|
| **Cache-aside** | App reads cache → miss → DB → populate cache | App manages invalidation |
| **Read-through** | Cache library loads on miss | Simpler app code |
| **Write-through** | Write cache + DB synchronously | Stronger consistency, slower writes |
| **Write-behind** | Write cache, async flush to DB | Fast writes, data loss risk |

**Cache-aside** (most common):
1. \`GET key\` from Redis
2. On miss, query PostgreSQL
3. \`SET key value EX ttl\`
4. On DB update, **delete** cache key (not update — avoids race conditions)

**Production use cases:**
- **Session store**: Sticky sessions not required; any App Service instance reads same session
- **Rate limiting**: \`INCR\` + \`EXPIRE\` token bucket per user/IP
- **Pub/Sub**: Real-time notifications between microservices
- **Leaderboards**: Sorted sets (\`ZADD\`, \`ZRANGE\`)
- **Semantic cache**: Hash prompt embedding → cached LLM response; invalidate on model change

**Redis data sizing:**
- Plan **maxmemory-policy**: \`allkeys-lru\` for pure cache; \`volatile-lru\` when only some keys have TTL
- Monitor **used_memory**, **evicted_keys**, **cache hit ratio** — target >90% hit for effective caching
- **Premium clustering** shards data — keys must use hash tags \`{userId}:session\` for multi-key ops

**Security:**
- Premium+ **VNet injection** or Private Endpoint
- **Entra ID** for data plane (preview on newer offerings)
- TLS 1.2+ required; disable non-TLS port in production`,
        codeExample: `// Cache-aside with StackExchange.Redis (.NET)
var cached = await db.StringGetAsync($"product:{id}");
if (cached.IsNullOrEmpty) {
    var product = await postgres.GetProductAsync(id);
    await db.StringSetAsync(
        $"product:{id}",
        JsonSerializer.Serialize(product),
        TimeSpan.FromMinutes(15));
    return product;
}
return JsonSerializer.Deserialize<Product>(cached!);`,
        keyPoints: [
          "Cache-aside with explicit invalidation on DB writes is the safest default pattern",
          "Premium tier minimum for VNet integration, clustering, and persistence",
          "Monitor evictions and hit ratio — rising evictions mean undersized cache or wrong TTLs",
          "Use delete-on-update not update-in-place to avoid cache/DB race conditions",
        ],
        warning:
          "Caching without TTL or eviction policy fills memory and causes OOM rejects. Always set TTLs and configure maxmemory-policy.",
      },
      {
        id: "combined-architecture",
        title: "Combined Architecture & Performance",
        content: `PostgreSQL + Redis is a common **Azure production pair**: durable source of truth in Flexible Server, hot data in Redis. Designing the boundary correctly avoids stale reads and thundering herds.

**Reference architecture:**

\`\`\`
Client → App Service / AKS
           ├─ Redis (sessions, hot entities, rate limits)
           └─ PostgreSQL Flexible Server (authoritative data, pgvector search)
\`\`\`

**Thundering herd mitigation:**
- **Cache stampede**: On expiry, many requests hit DB simultaneously
- Fix: **probabilistic early expiration**, **mutex lock** (\`SET lock NX EX\`), or **prefetch** hot keys
- Example: \`SET lock:product:42 1 NX EX 5\` — only one thread reloads; others wait/retry

**PostgreSQL + Redis consistency patterns:**

| Strategy | Complexity | Staleness |
|---|---|---|
| TTL-only cache | Low | Up to TTL duration |
| Invalidate on write | Medium | Near-zero if all writes invalidate |
| Change Data Capture (Debezium/Logic Apps) | High | Seconds | 

**pgvector + Redis semantic cache:**
- PostgreSQL: authoritative embeddings + filtered vector search
- Redis: cache final LLM answers keyed by embedding hash or prompt hash
- On document update: invalidate SQL rows **and** purge related Redis semantic keys

**Connection management:**
- **PgBouncer** not built-in — use Flexible Server **built-in connection pooling** (PgBouncer-based, port 6432) for serverless/functions with many short connections
- Redis: single multiplexer connection per process (StackExchange.Redis pattern) — do not open per request

**Observability:**

| Metric | PostgreSQL | Redis |
|---|---|---|
| Saturation | CPU %, storage %, connections | used_memory, evicted_keys |
| Errors | deadlock count, failed connections | rejected_connections |
| Latency | Query Store / pg_stat_statements | cache latency P99 |

**Cost optimization:**
- Right-size PG compute with **Query Store** equivalents (\`pg_stat_statements\`)
- Redis **reserved capacity** for 24/7 Premium caches
- Use **Burstable PG** only for dev; **Standard C0/C1** Redis only for dev
- Colocate app, Redis, and PG in **same region** — cross-region cache hits add latency and egress cost

**DR considerations:**
- PostgreSQL: geo-redundant backup + read replica in secondary region; rehearse promote
- Redis Premium: **geo-replication** (secondary read-only); Enterprise **active geo-replication** for read/write both regions
- Cache is **rebuildable** — DR plan can cold-start Redis from PostgreSQL if RTO allows`,
        codeExample: `-- PostgreSQL: find slow queries (enable pg_stat_statements)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;`,
        keyPoints: [
          "Invalidate Redis keys on PostgreSQL writes — TTL alone allows stale reads after updates",
          "Use mutex or early expiration to prevent cache stampede on hot keys",
          "Flexible Server built-in pooling (port 6432) for apps opening many connections",
          "Colocate Redis and PostgreSQL in the same region to avoid latency and egress charges",
        ],
        warning:
          "Treating Redis as durable primary storage without persistence or without PostgreSQL backing leads to data loss on flush or failover. Redis is a cache, not the system of record.",
      },
    ],
    quiz: [
      {
        question: "Which PostgreSQL Flexible Server tier should run sustained production OLTP workloads?",
        options: ["Burstable B-series", "General Purpose D-series", "Basic Redis tier", "Single Server"],
        answer: 1,
        explanation:
          "General Purpose provides consistent CPU without burst credits. Burstable tiers throttle under sustained load.",
      },
      {
        question: "In cache-aside pattern, what should the app do when updating PostgreSQL?",
        options: [
          "Update the Redis key in place with new value",
          "Delete the Redis key and let next read repopulate",
          "Never touch Redis — rely on infinite TTL",
          "Flush entire Redis database",
        ],
        answer: 1,
        explanation:
          "Deleting the cache key on write avoids race conditions where concurrent reads write stale data back to cache.",
      },
      {
        question: "Which Redis tier is required for VNet integration in classic Azure Cache for Redis?",
        options: ["Basic", "Standard", "Premium", "Free"],
        answer: 2,
        explanation:
          "Premium tier supports VNet injection, clustering, and persistence — required for private network production deployments.",
      },
    ],
  },
];