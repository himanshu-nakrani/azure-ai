import { LearningModule } from "@/lib/types";

export const storageModules: LearningModule[] = [
  {
    slug: "blob-storage",
    category: "storage",
    title: "Azure Blob Storage",
    subtitle: "Object storage tiers, lifecycle management, and access patterns",
    description:
      "Store unstructured data at scale. Hot, cool, cold, and archive tiers with lifecycle policies and security.",
    difficulty: "foundational",
    duration: "90 min",
    services: ["Blob Storage", "Data Lake Gen2", "SAS Tokens"],
    sections: [
      {
        id: "tiers",
        title: "Storage Accounts & Access Tiers",
        content: `Azure Blob Storage is **object storage** for unstructured data — images, logs, backups, data lake files, and static assets. Understanding account types, tiers, and redundancy is the foundation of cost-effective production design.

**Storage account types:**

| Type | Backing | Blob types | Best for |
|---|---|---|---|
| **Standard** | HDD | Block, append, page | General workloads, archives, data lakes |
| **Premium** | SSD | Block blobs only | Low-latency, high transaction rate (IoT, interactive apps) |

**Performance tiers** (Standard accounts):
- **Standard**: Default — balanced cost and throughput
- **Premium**: Block blobs on SSD — up to 10× lower latency; no append/page blobs

**Access tiers** (per-blob, changeable via lifecycle or API):

| Tier | Storage cost | Access cost | Retrieval | Min retention | Rehydration |
|---|---|---|---|---|---|
| **Hot** | Highest | Lowest | Immediate | — | — |
| **Cool** | ~50% less | Higher | Immediate | 30 days | — |
| **Cold** | ~70% less | Higher still | Immediate | 90 days | — |
| **Archive** | ~90% less | Highest | Hours (high priority: ~1 hr) | 180 days | Required before read |

**Cost/performance tradeoff**: Hot wins when you read data frequently (>1×/month per object). Cool suits monthly access. Cold fits quarterly analytics. Archive is for compliance and long-term backup — never put data you'll need in an emergency without testing rehydration time.

**Redundancy options** (increasing cost and durability):

| SKU | Copies | Survives | Typical use |
|---|---|---|---|
| **LRS** | 3 in one DC | Rack failure | Dev/test, recreatable data |
| **ZRS** | 3 across zones | Zone failure | Production within one region |
| **GRS** | 6 (3+3 geo) | Region failure | DR with manual failover |
| **GZRS** | 6 (ZRS + geo) | Zone + region | Production critical data |
| **RA-GRS / RA-GZRS** | Same + read access to secondary | Region failure + read DR | Active read from secondary region |

**Production pattern**: Use **GZRS** or **RA-GZRS** for irreplaceable production blobs. Pair with **object replication** for active-active or compliance copies across regions.

**Data Lake Gen2** is Blob Storage with hierarchical namespace (HNS) enabled:
- POSIX-like folders and ACLs on paths
- Optimized for analytics (Spark, Synapse, Databricks)
- Same tiers and lifecycle rules apply
- Enable HNS at account creation — **cannot be toggled later**

**Blob types:**
- **Block blobs**: Files, images, documents (most common)
- **Append blobs**: Log streaming, audit trails
- **Page blobs**: VHDs for VMs (legacy — prefer Managed Disks)`,
        keyPoints: [
          "Hot for active data; Cool/Cold/Archive for aging — lifecycle policies automate transitions",
          "GZRS or RA-GZRS for production disaster recovery; LRS only for disposable data",
          "Data Lake Gen2 = Blob + hierarchical namespace — enable at creation, not later",
          "Archive tier requires rehydration — plan RTO before storing operational data there",
        ],
        warning:
          "Moving blobs to Archive without a tested rehydration runbook is a common DR failure. High-priority rehydration costs more and still takes up to an hour.",
      },
      {
        id: "access-security",
        title: "Access Control & Lifecycle",
        content: `Blob access in production should follow **zero-trust**: no public containers, no long-lived account keys in code, and scoped credentials for every consumer.

**Access methods** (strongest to weakest for production apps):

| Method | Scope | Rotation | Production use |
|---|---|---|---|
| **Managed Identity + RBAC** | Entra principal | Automatic | App-to-storage (preferred) |
| **User delegation SAS** | Time/scope limited | Per request | External clients, short-lived URLs |
| **Service SAS / Account SAS** | Key-derived | Manual | Legacy integrations only |
| **Storage account keys** | Full account | Manual | Break-glass; store in Key Vault |
| **Anonymous public** | Container/blob | N/A | Static assets only — avoid for sensitive data |

**RBAC roles** (Microsoft Entra ID):
- **Storage Blob Data Reader**: Read blobs and metadata
- **Storage Blob Data Contributor**: Read, write, delete blobs
- **Storage Blob Data Owner**: Full data plane + ACL management (Data Lake Gen2)

**SAS best practices:**
- Prefer **user delegation SAS** (signed with Entra, no account key)
- Restrict to specific container, blob prefix, IP range, and HTTPS-only
- Short expiry (minutes to hours, not days)
- Use **stored access policies** on containers for centralized revocation

**Lifecycle management** — automate tiering and deletion:

\`\`\`
Rule: logs/ prefix → Cool after 30 days → Archive after 90 days → Delete after 365 days
Rule: temp/ prefix → Delete after 7 days
Rule: base blob snapshots → Delete after 30 days
\`\`\`

**Typical savings**: 60–80% on aging blob data when Hot → Cool → Archive transitions match actual access patterns. Run **Azure Storage Analytics** or **Cost Management** reports to validate tier distribution quarterly.

**Security hardening checklist:**
- Disable **public blob access** at account level (Azure Policy: deny public containers)
- Enable **soft delete** for blobs (7–365 days) and containers
- Enable **versioning** for overwrite protection
- Enable **immutable storage** (WORM) for compliance — legal hold or time-based retention
- **Private Endpoint** + disable public network access
- **Customer-managed keys (CMK)** via Key Vault for regulated workloads

**Static website hosting**: Enable on storage account; content served from **$web** container. Pair with **Azure CDN** or **Front Door** for HTTPS, custom domain, and global edge caching. Do not expose the storage account key in client-side code — serve public read-only blobs or use SAS.`,
        codeExample: `# User-delegation SAS with Managed Identity (Python)
from datetime import datetime, timedelta, timezone
from azure.identity import DefaultAzureCredential
from azure.storage.blob import (
    BlobServiceClient,
    BlobSasPermissions,
    generate_blob_sas,
)

account_url = "https://myaccount.blob.core.windows.net"
credential = DefaultAzureCredential()
service = BlobServiceClient(account_url, credential=credential)

# Get user delegation key (valid up to 7 days)
start = datetime.now(timezone.utc)
expiry = start + timedelta(hours=1)
delegation_key = service.get_user_delegation_key(start, expiry)

sas = generate_blob_sas(
    account_name="myaccount",
    container_name="uploads",
    blob_name="reports/q1.pdf",
    user_delegation_key=delegation_key,
    permission=BlobSasPermissions(read=True),
    expiry=expiry,
    start=start,
)

url = f"{account_url}/uploads/reports/q1.pdf?{sas}"`,
        keyPoints: [
          "Managed Identity + RBAC is the default for app-to-storage; keys are break-glass only",
          "User delegation SAS avoids account keys and supports fine-grained, short-lived access",
          "Lifecycle policies save 60–80% when tier transitions match real access frequency",
          "Soft delete + versioning + Private Endpoint are baseline production controls",
        ],
        warning:
          "Leaving storage account keys in app settings or CI/CD logs grants full account access. Rotate keys after any exposure and migrate callers to Managed Identity.",
      },
      {
        id: "production-patterns",
        title: "Production Patterns & Performance",
        content: `Designing blob storage for scale means matching **access patterns**, **consistency needs**, and **egress costs** to the right APIs and architecture.

**Upload patterns:**

| Pattern | When to use | Tradeoff |
|---|---|---|
| **Single PUT** | Files < 256 MB | Simple; blocks on failure |
| **Block upload (staged blocks)** | Large files, resumable | Commit block list at end |
| **Put Block from URL** | Copy from external URL | Server-side; no client bandwidth |
| **AzCopy / SDK parallel upload** | TB-scale migrations | Tune concurrency per VM |

**Read patterns:**
- **CDN/Front Door** in front of public or SAS-backed blobs — cuts origin egress and latency
- **Geo-replication + RA-GRS** for read DR; **object replication** for active copies to second account
- **Batch small reads** — each REST call has overhead; zip bundles or larger blobs reduce transaction costs

**Concurrency & limits** (Standard account, approximate):
- ~20,000 requests/second per account (aggregate ingress/egress)
- Hot partition risk on single blob name with extreme concurrent writes — use **prefix sharding** (e.g., \`{guid}/file.json\`)

**Event-driven architecture:**
- **Event Grid** notifications on blob created/deleted → Functions, Logic Apps, Data Factory
- **Change feed** (ordered log of changes) → incremental ETL, audit pipelines
- Pair with **Service Bus** for at-least-once processing and dead-letter handling

**Data Lake Gen2 layout** (analytics):
\`\`\`
/raw/yyyy/MM/dd/          # immutable ingest
/bronze/                  # validated, typed
/silver/                  # cleansed, joined
/gold/                    # business aggregates
\`\`\`
Use **folder-level ACLs** with Entra groups; avoid one shared account key for all analysts.

**Monitoring:**
- **Metric**: Availability, success E2E latency, egress, transactions by API
- **Diagnostic settings** → Log Analytics: track 403/429, slow operations
- **Cost alerts** on unexpected egress (often the largest surprise bill)

**Disaster recovery:**
- **Object replication** (preview policies): async copy new blobs to secondary account
- **GRS/GZRS**: Microsoft-managed geo copy; failover is account-level decision
- Document RPO/RTO: replication lag vs. archive rehydration vs. rebuild from source`,
        codeExample: `# Event Grid trigger on new blob (Azure Functions)
import logging
import azure.functions as func

def main(event: func.EventGridEvent):
    data = event.get_json()
    blob_url = data["url"]
    logging.info("Processing blob: %s", blob_url)
    # Download, virus scan, index, or enqueue for pipeline`,
        keyPoints: [
          "Use block uploads and AzCopy for large files; single PUT only for small objects",
          "CDN/Front Door reduces egress cost and latency for frequently read blobs",
          "Event Grid + change feed enable event-driven and incremental analytics pipelines",
          "Monitor egress and transaction counts — they often exceed storage cost in active apps",
        ],
        warning:
          "Serving large files globally without a CDN can produce massive egress bills. Model egress in architecture reviews before go-live.",
      },
    ],
    quiz: [
      {
        question: "Which redundancy option protects against both zone failure within a region and regional disaster?",
        options: ["LRS", "ZRS", "GRS", "GZRS"],
        answer: 3,
        explanation:
          "GZRS combines zone-redundant storage (3 copies across zones) with geo-replication to a secondary region.",
      },
      {
        question: "What must happen before you can read a blob in the Archive tier?",
        options: [
          "Change access tier to Hot via lifecycle policy only",
          "Rehydrate the blob to Hot or Cool tier",
          "Enable RA-GRS on the storage account",
          "Create a user delegation SAS",
        ],
        answer: 1,
        explanation:
          "Archive blobs are offline. You must rehydrate to Hot or Cool before read access; this can take hours.",
      },
      {
        question: "Which access method is preferred for Azure apps authenticating to Blob Storage?",
        options: [
          "Storage account key in connection string",
          "Anonymous public read on the container",
          "Managed Identity with Storage Blob Data Contributor RBAC",
          "Account SAS with 1-year expiry",
        ],
        answer: 2,
        explanation:
          "Managed Identity eliminates secrets in code, supports RBAC least privilege, and rotates automatically via Entra ID.",
      },
    ],
  },
  {
    slug: "files-and-disks",
    category: "storage",
    title: "Azure Files & Managed Disks",
    subtitle: "SMB file shares, disk types, and snapshot strategies",
    description:
      "Shared file storage for lift-and-shift apps and managed block storage for VMs.",
    difficulty: "intermediate",
    duration: "85 min",
    services: ["Azure Files", "Managed Disks", "Azure NetApp Files"],
    sections: [
      {
        id: "azure-files",
        title: "Azure Files",
        content: `**Azure Files** provides fully managed **SMB**, **NFS**, or **REST** file shares in the cloud — the primary Azure service for lift-and-shift workloads that depend on traditional file semantics.

**Use cases:**

| Scenario | Why Azure Files |
|---|---|
| Lift-and-shift LOB apps | Apps expect UNC paths (\\\\server\\share) |
| Shared config / logs | Multiple VMs write to one share |
| Developer home directories | Central profiles without on-prem NAS |
| Container persistent volumes | AKS **Azure Files CSI driver** |
| Hybrid cache | **Azure File Sync** caches hot data on-prem |

**Performance tiers:**

| Tier | Protocol | Backing | IOPS (approx.) | Latency | Cost |
|---|---|---|---|---|---|
| **Premium** | SMB/NFS | SSD (provisioned) | Scales with share size | Sub-ms | Highest $/GB, predictable |
| **Transaction optimized** | SMB | HDD | High per TB | Higher | Lower $/GB, pay per transaction |
| **Hot / Cool** | SMB | HDD | Standard | Standard | Cool for infrequent access |

**Provisioned v1 vs pay-as-you-go v2** (Premium): v2 bills per GiB provisioned with burst credits; right-size provisioned capacity to avoid overpaying for unused IOPS headroom.

**Azure File Sync** (hybrid):
1. Install **Azure File Sync agent** on Windows Server
2. Register server with **Sync Group** → cloud share is authoritative
3. Hot data caches locally; cloud tiering frees on-prem disk
4. Multi-site sync via cloud hub — not direct server-to-server

**Authentication options:**

| Method | Requirement | Notes |
|---|---|---|
| Storage account key | None | Avoid in production |
| **SMB over QUIC** | Windows 11+ clients | No VPN for remote workers |
| **Entra Kerberos** | Entra Domain Services or AD DS | Domain-joined machines, ACLs on files |
| **Entra ID (OAuth)** | REST / SDK only | Linux automation without Kerberos |
| **Private Endpoint** | VNet | Required for production network isolation |

**Production sizing**: Premium shares scale IOPS with provisioned size (e.g., 100 GiB minimum for many Premium workloads). Load-test before migration — latency-sensitive apps may need **Azure NetApp Files** (see below) instead.`,
        keyPoints: [
          "Premium SSD-backed shares for low-latency production; transaction optimized for archival/logging",
          "Azure File Sync caches hot data on-prem with cloud as source of truth",
          "Entra Kerberos or Private Endpoint — avoid account keys for production SMB access",
          "AKS persistent volumes via Azure Files CSI when ReadWriteMany access is required",
        ],
        warning:
          "Mapping Azure Files over the public internet without VPN or SMB over QUIC exposes traffic and often violates compliance. Use Private Endpoint or hybrid sync.",
      },
      {
        id: "managed-disks",
        title: "Managed Disks & Snapshots",
        content: `**Azure Managed Disks** are block storage volumes for VMs — Microsoft handles the storage account, replication, and patching underneath.

**Disk types** (production comparison):

| Type | IOPS (max) | Throughput | Latency | Cost | Use case |
|---|---|---|---|---|---|
| **Standard HDD** | 500–2,000 | 60–500 MB/s | High | Lowest | Backup targets, dev |
| **Standard SSD** | 500–6,000 | 60–750 MB/s | Moderate | Low | Web servers, light DB |
| **Premium SSD v2** | 3,000–80,000 | Up to 1,200 MB/s | Low | $/IOPS tunable | Production DBs, right-sized IOPS |
| **Premium SSD (v1)** | 120–20,000 | 25–900 MB/s | Low | Tiered by size | Legacy sizing model |
| **Ultra Disk** | Up to 160,000 | Up to 4,000 MB/s | Sub-ms | Highest | SAP HANA, top-tier OLTP |

**Premium SSD v2** lets you provision IOPS and throughput **independently of disk size** — often cheaper than oversizing a v1 disk just to get IOPS.

**Redundancy:**
- **LRS** (default): 3 replicas in one DC
- **ZRS**: Zone-redundant — recommended for production VM OS/data disks in supported regions

**Snapshots:**
- **Full snapshot**: Independent point-in-time copy
- **Incremental snapshot**: Only changed blocks since last snapshot — **much lower storage cost** for backup chains
- Snapshots live in same region; copy to another region for DR
- **Snapshot consistency**: Use **Azure Backup** or app-level quiesce (SQL VSS) for crash-consistent vs application-consistent

**Disk roles:**
- **OS disk**: Boot volume; enable **Trusted Launch** + **Secure Boot** for integrity
- **Data disk**: Attach up to limits per VM SKU (often 64+ data disks)
- **Temporary disk**: Local SSD — **ephemeral**, lost on stop/deallocate; never store persistent data

**Encryption:**
- **SSE** with platform-managed keys (default) or **CMK** in Key Vault
- **Encryption at host**: Server-side on compute node — required for some compliance frameworks
- **Azure Disk Encryption** (ADE): OS-level Bitdmount/dm-crypt — legacy; prefer SSE + CMK for new designs

**Availability sets / zones**: Disks are pinned to the zone of the VM. For zone-redundant HA, deploy VMs with **ZRS disks** across **Availability Zones**.`,
        codeExample: `# Create incremental snapshot (Azure CLI)
az snapshot create \\
  --resource-group myRG \\
  --name dataDisk-snap-20250630 \\
  --source /subscriptions/.../disks/dataDisk01 \\
  --incremental true

# Restore: create new disk from snapshot
az disk create \\
  --resource-group myRG \\
  --name dataDisk01-restored \\
  --source dataDisk-snap-20250630`,
        keyPoints: [
          "Premium SSD v2 or Ultra for production databases — Standard SSD only for light workloads",
          "Incremental snapshots minimize backup storage cost; chain restores need the full chain",
          "ZRS managed disks + zone-spanning VMs for regional HA within a single region",
          "Temporary disk is ephemeral — use data disks or Azure Files for anything that must survive reboot",
        ],
        warning:
          "Crash-consistent snapshots of active databases can corrupt data on restore. Use Azure Backup with application consistency or native DB backup tools.",
      },
      {
        id: "netapp-shared-storage",
        title: "NetApp Files, Backup & Migration",
        content: `When Azure Files or Managed Disks are not enough, **Azure NetApp Files (ANF)** and disciplined **backup architecture** close the gap for enterprise file and block workloads.

**Azure NetApp Files** — enterprise NAS:
- **NFS v3/v4.1** and **SMB** with NetApp ONTAP semantics
- Sub-millisecond latency, 100k+ IOPS per volume
- **Snapshots**, clones, cross-region replication
- Use when: SAP, HPC, Epic healthcare, Oracle on NFS, heavy AKS ReadWriteMany

| Service | Latency | Protocol | Best for |
|---|---|---|---|
| Azure Files Premium | Low | SMB/NFS | General shared files, AKS |
| Azure NetApp Files | Lowest | NFS/SMB | Enterprise SAP, HPC, medical imaging |
| Managed Disks | Block | N/A (attached) | VM OS/data, databases |

**Azure Backup** for VMs:
- Policy-based daily/weekly backups with **instant restore** snapshots (1–5 days)
- Long-term **Recovery Services vault** retention (months/years)
- **Cross-region restore** when vault is GRS
- Application-aware backup for SQL Server, SAP HANA (Premium tier)

**Azure Files backup**: File share snapshots via Recovery Services vault — no agent on clients.

**Migration tooling:**

| Tool | Source → Target |
|---|---|
| **AzCopy** | On-prem/object → Blob/Files |
| **Storage Migration Service** | Windows Server shares → Azure Files |
| **Azure Migrate** | VM discovery, sizing, disk assessment |
| **Movere** (legacy) | Inventory for migration planning |

**Cost optimization:**
- **Reserved capacity** for Premium Files and disk throughput commitments
- Delete orphaned snapshots and unattached disks monthly (Advisor flags these)
- Right-size Premium v2 IOPS — provision only what benchmarks prove you need
- Use **Cool tier Azure Files** for audit archives accessed rarely

**High-availability patterns:**
- **SQL Server FCI** on VMs: shared Premium File share or ANF for witness/cluster storage
- **AKS**: Premium Files or ANF for RWX volumes; Managed Disks (Premium SSD v2) for RWO
- **Stretch cluster**: ANF cross-region replication or application-level async replication`,
        keyPoints: [
          "Azure NetApp Files for sub-ms NFS/SMB when Azure Files Premium is insufficient",
          "Azure Backup provides application-consistent VM backup — prefer over manual snapshots alone",
          "Delete unattached disks and stale snapshots — common hidden cost drivers",
          "Reserved capacity and right-sized Premium SSD v2 IOPS reduce steady-state spend",
        ],
        warning:
          "Unattached managed disks and forgotten incremental snapshot chains silently accumulate cost. Automate monthly cleanup with Azure Policy or Cost Management workbooks.",
      },
    ],
    quiz: [
      {
        question: "Which disk type lets you provision IOPS independently of disk size?",
        options: ["Standard HDD", "Standard SSD", "Premium SSD v2", "Temporary disk"],
        answer: 2,
        explanation:
          "Premium SSD v2 decouples capacity, IOPS, and throughput provisioning — unlike v1 where larger disks grant more IOPS.",
      },
      {
        question: "What is the primary benefit of incremental disk snapshots over full snapshots?",
        options: [
          "Faster VM boot time",
          "Lower storage cost by capturing only changed blocks",
          "Automatic cross-region replication",
          "Application-consistent backup without agents",
        ],
        answer: 1,
        explanation:
          "Incremental snapshots store only blocks changed since the prior snapshot, dramatically reducing backup storage for frequent snapshots.",
      },
      {
        question: "When is Azure NetApp Files typically chosen over Azure Files Premium?",
        options: [
          "Static website hosting",
          "Dev/test shares with rare access",
          "SAP or HPC workloads needing sub-millisecond NFS latency",
          "Blob object storage for images",
        ],
        answer: 2,
        explanation:
          "ANF delivers ONTAP-class performance (sub-ms latency, very high IOPS) for demanding enterprise NFS/SMB workloads like SAP and HPC.",
      },
    ],
  },
];