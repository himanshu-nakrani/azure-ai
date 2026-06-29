import { LearningModule } from "@/lib/types";

export const integrationModules: LearningModule[] = [
  {
    slug: "messaging-events",
    category: "integration",
    title: "Service Bus, Event Grid & Event Hubs",
    subtitle: "Queues, topics, event routing, and stream ingestion",
    description:
      "Choose the right messaging service. Service Bus for reliable queues, Event Grid for reactive events, Event Hubs for streaming.",
    difficulty: "intermediate",
    duration: "105 min",
    services: ["Service Bus", "Event Grid", "Event Hubs"],
    sections: [
      {
        id: "comparison",
        title: "Choosing a Messaging Service",
        content: `Azure offers three distinct messaging services. They are **not interchangeable** — picking the wrong one leads to cost overruns, lost messages, or architecture rewrites.

**Core pattern comparison:**

| Service | Pattern | Throughput | Retention | Delivery | Use case |
|---|---|---|---|---|---|
| **Service Bus** | Queue / Topic (pub-sub) | Moderate (thousands/sec) | Until consumed or TTL | At-least-once (exactly-once with sessions) | Order processing, task queues, workflow orchestration |
| **Event Grid** | Event routing (push) | Very high (millions/sec) | Retry then drop / dead-letter | At-least-once | React to Azure resource changes, domain events |
| **Event Hubs** | Stream ingestion (log) | Millions/sec | Configurable (1–90 days) | At-least-once | Telemetry, log streaming, IoT device ingress |

**Decision framework — ask these questions:**

| Question | If yes → | If no → |
|---|---|---|
| Do consumers need to **compete** for messages (work queue)? | Service Bus Queue | Event Hubs or Event Grid |
| Is this a **reaction** to something that happened (event notification)? | Event Grid | Service Bus or Event Hubs |
| Is this a **continuous stream** of data (telemetry, logs, IoT)? | Event Hubs | Service Bus or Event Grid |
| Do you need **FIFO ordering** per entity? | Service Bus with sessions | Event Hubs (partition ordering only) |
| Do you need **transactional** send/receive? | Service Bus | Neither Event Grid nor Event Hubs |
| Is the producer an **Azure resource** (Blob, ARM, AAD)? | Event Grid system topics | Custom topic or Service Bus |

**Service Bus tiers:**

| Tier | Queues | Topics | VNet | Messaging units | Best for |
|---|---|---|---|---|---|
| **Basic** | Yes | No | No | Shared | Dev/test, simple queues |
| **Standard** | Yes | Yes | No | Shared | Most production pub-sub |
| **Premium** | Yes | Yes | Yes (private endpoint) | Dedicated, predictable | Low latency, compliance, high throughput |

**Event Grid topic types:**

| Type | Source | Example events |
|---|---|---|
| **System topics** | Azure resources (auto-managed) | BlobCreated, VM deallocated, Key Vault secret expired |
| **Custom topics** | Your application | OrderPlaced, UserRegistered, PaymentFailed |
| **Partner topics** | SaaS partners (e.g., Auth0, Box) | Third-party lifecycle events |
| **Event Domains** | Multi-tenant event routing | SaaS platform routing events per tenant |

**Event Hubs key concepts:**

| Concept | Purpose |
|---|---|
| **Partitions** | Parallelism unit — ordering guaranteed within a partition, not across |
| **Consumer groups** | Independent read positions on the same stream (like Kafka consumer groups) |
| **Capture** | Auto-archive to Blob/ADLS in Avro format for batch analytics |
| **Kafka surface** | Native Kafka protocol endpoint — migrate Kafka apps without code changes |

**Common anti-patterns:**
- Using Event Hubs as a task queue (no competing consumer semantics, no dead-letter per message)
- Using Service Bus for fire-and-forget Azure resource notifications (Event Grid is cheaper and simpler)
- Using Event Grid for high-volume telemetry (no stream retention, no replay)
- Putting all messages in one Service Bus queue without sessions when strict ordering is required`,
        keyPoints: [
          "Service Bus for reliable work queues and pub-sub with transactions",
          "Event Grid for reactive event routing — especially Azure resource changes",
          "Event Hubs for high-throughput streaming with replay and Capture",
          "Premium Service Bus when you need VNet isolation and predictable latency",
        ],
        warning:
          "Choosing Event Hubs for a work-queue pattern forces you to build competing-consumer logic yourself. Service Bus queues provide locking, visibility timeout, and dead-lettering natively.",
      },
      {
        id: "patterns",
        title: "Messaging Patterns",
        content: `Production messaging requires deliberate patterns for reliability, ordering, and failure handling — not just "send and hope."

**Service Bus patterns:**

| Pattern | How it works | When to use |
|---|---|---|
| **Competing consumers** | Multiple workers read from one queue; Service Bus locks message during processing | Horizontal scale-out of order processors |
| **Publish-subscribe** | Topic + multiple subscriptions with independent filters | Notify billing, shipping, and analytics from one OrderPlaced event |
| **Sessions** | Messages grouped by SessionId; FIFO within session | Per-customer or per-order ordering |
| **Scheduled delivery** | \`ScheduledEnqueueTimeUtc\` delays message visibility | Retry with backoff, timed reminders |
| **Duplicate detection** | \`MessageId\` dedup window (up to 10 min) | Idempotent producers that may resend |
| **Dead-letter queue** | Messages exceeding \`MaxDeliveryCount\` or failing validation | Poison message isolation and investigation |

**Dead-letter queue operations (production checklist):**
1. **Monitor DLQ depth** — alert when count > 0 (DLQ messages are silent failures)
2. **Inspect** via Service Bus Explorer, portal, or \`ReceiveAndDelete\` from DLQ sub-queue
3. **Fix root cause** (schema change, downstream outage, bad data)
4. **Resubmit** corrected messages to main queue via \`SendMessageAsync\` with new MessageId
5. **Never auto-reprocess DLQ in a loop** without fixing the cause — infinite DLQ cycling

**Event Grid patterns:**

| Pattern | Configuration | Benefit |
|---|---|---|
| **Event filtering** | \`includedEventTypes\`, \`subjectBeginsWith\`, \`subjectEndsWith\`, advanced filters | Subscribers only receive relevant events |
| **Fan-out** | Multiple subscriptions on one topic (Functions, Logic Apps, Webhooks, Service Bus) | Decouple producers from N consumers |
| **Event-driven workflows** | Event Grid → Service Bus queue → worker | Buffer bursts; add retry semantics to reactive events |
| **CloudEvents schema** | Standard envelope for interoperability | Consistent metadata across custom and system events |
| **Dead-letter** | Storage account for undeliverable events after 30 retry attempts | Capture events that failed all delivery attempts |

**Event Hubs patterns:**

| Pattern | Implementation | Use case |
|---|---|---|
| **Partition key strategy** | Hash deviceId/customerId → partition | Per-entity ordering within partition |
| **Capture to data lake** | Auto-write Avro files to Blob/ADLS | Cold path analytics with Spark/Synapse |
| **Stream processing** | Event Hubs → Stream Analytics / Spark Structured Streaming | Real-time aggregations, alerting |
| **Checkpointing** | Store offset per consumer group (Blob storage for Functions/Spark) | Resume after failure without reprocessing entire stream |
| **Auto-inflate** | Automatically scale throughput units under load | Handle traffic spikes without manual intervention |

**Cross-service integration (common architectures):**

| Architecture | Flow | Why |
|---|---|---|
| **Event Grid → Service Bus** | Resource event buffered in queue for reliable processing | Decouple reactive trigger from long-running work |
| **Event Hubs → Functions** | Event Hub trigger with checkpointing | Serverless stream processing |
| **Service Bus → Functions** | Queue/topic trigger with auto-complete off for manual settlement | Controlled retry and DLQ on failure |
| **Event Hubs Capture → Synapse** | Batch analytics on archived Avro | Cost-effective historical analysis |

**Retry and idempotency guidance:**
- All three services deliver **at-least-once** — consumers must be **idempotent**
- Use natural keys (orderId, eventId) for deduplication in your data store
- Service Bus: set \`MaxDeliveryCount\` (default 10) and handle \`AbandonMessage\` for transient failures
- Event Grid: configure exponential retry policy; use dead-letter storage for unrecoverable delivery failures
- Event Hubs: checkpoint only after successful processing — premature checkpoint loses data on crash`,
        codeExample: `# Service Bus queue trigger — Python Azure Functions v2
import azure.functions as func
import json
import logging

app = func.FunctionApp()

@app.service_bus_queue_trigger(
    arg_name="msg",
    queue_name="orders",
    connection="ServiceBusConnection"
)
def process_order(msg: func.ServiceBusMessage):
    order = json.loads(msg.get_body().decode("utf-8"))
    logging.info(f"Processing order {order['orderId']}")
    # Idempotent: upsert by orderId, don't blind insert
    # Raise on transient failure → message abandoned → retry
    # Raise on poison data → let MaxDeliveryCount exhaust → DLQ

# Event Grid trigger — react to blob upload
@app.event_grid_trigger(arg_name="event")
def on_blob_created(event: func.EventGridEvent):
    data = event.get_json()
    logging.info(f"Blob created: {data['url']}")
    # Trigger downstream pipeline (resize image, virus scan, index)

# Event Hubs trigger with cardinality — one function per partition
@app.event_hub_message_trigger(
    arg_name="events",
    event_hub_name="telemetry",
    connection="EventHubConnection",
    consumer_group="analytics",
    cardinality=func.Cardinality.MANY
)
def process_telemetry(events: list[func.EventHubEvent]):
    for event in events:
        telemetry = json.loads(event.get_body().decode("utf-8"))
        # Aggregate, alert, or forward to Time Series Insights`,
        keyPoints: [
          "DLQ for failed messages — always monitor and alert on depth > 0",
          "Event Grid filters reduce noise and downstream cost",
          "Event Hubs Capture for stream archival to data lake",
          "All services are at-least-once — design idempotent consumers",
        ],
        warning:
          "Auto-completing Service Bus messages before processing finishes causes silent data loss on crash. Disable auto-complete and call complete() only after successful processing.",
      },
      {
        id: "operations",
        title: "Operations, Security & Production",
        content: `Running messaging infrastructure in production requires monitoring, security hardening, and capacity planning — the services are reliable, but misconfiguration is common.

**Monitoring essentials:**

| Service | Key metrics | Alert thresholds |
|---|---|---|
| **Service Bus** | Active messages, dead-lettered messages, server errors, throttled requests | DLQ count > 0; throttled requests > 0 sustained |
| **Event Grid** | Publish success/fail, delivery success/fail, dead-lettered events | Delivery fail rate > 1%; dead-letter count increasing |
| **Event Hubs** | Incoming messages, throttled requests, capture backlog, consumer lag | Throttled requests; consumer lag growing unbounded |

**Diagnostic settings (send to Log Analytics):**
- Service Bus: \`OperationalLogs\`, \`VNetAndIPFilteringLogs\`, \`RuntimeAuditLogs\` (Premium)
- Event Grid: delivery and publish failure logs
- Event Hubs: \`ArchiveLogs\`, \`OperationalLogs\`, \`KafkaCoordinatorLogs\`, \`KafkaUserErrorLogs\`

**Security hardening:**

| Control | Service Bus | Event Grid | Event Hubs |
|---|---|---|---|
| **Private Endpoint** | Premium tier | Custom/partner topics | All tiers |
| **Managed identity auth** | Sender/receiver via RBAC | Event delivery to Azure resources | Data plane via RBAC |
| **Disable SAS keys** | Prefer RBAC in production | N/A for system topics | Prefer RBAC; rotate SAS |
| **IP firewall** | Premium | Topic-level | Namespace-level |
| **TLS 1.2+** | Enforced | Enforced | Enforced |

**RBAC roles (data plane):**

| Role | Service Bus | Event Hubs |
|---|---|---|
| **Sender** | Send to queue/topic | Send events |
| **Receiver** | Receive from queue/subscription | N/A (use consumer role) |
| **Data Owner** | Full data access | Full data access |
| **Event Hubs Data Receiver** | N/A | Read from consumer group |

**Capacity planning:**

| Service | Scaling lever | Production tip |
|---|---|---|
| **Service Bus Premium** | Messaging Units (1–16) | Start with 1 MU; scale based on CPU/memory metrics |
| **Event Hubs** | Throughput Units (TUs) or Processing Units (PUs on dedicated) | 1 TU = 1 MB/s ingress, 2 MB/s egress; partition count is fixed at creation |
| **Event Grid** | Automatic | Pay per operation; no capacity planning needed |

**Event Hubs partition sizing:**
- Partitions are **immutable** after creation — you cannot add or remove later
- Rule of thumb: target **1–2 MB/s per partition** for balanced throughput
- More partitions = more parallelism but less per-partition ordering granularity
- Consumer count per group ≤ partition count (extra consumers sit idle)

**Disaster recovery:**

| Service | DR option | Notes |
|---|---|---|
| **Service Bus Premium** | Geo-disaster recovery (paired namespaces, alias) | Metadata sync; failover is manual or scripted |
| **Event Hubs** | Geo-disaster recovery (paired namespaces, alias) | Consumer group offsets not synced — plan replay |
| **Event Grid** | Multi-region custom topics + Front Door | No built-in geo-DR; design active-active or active-passive |

**Cost optimization:**
- Service Bus: Standard for most workloads; Premium only when VNet/latency requires it
- Event Grid: $0.60 per million operations — filtering reduces downstream Function invocations (bigger savings)
- Event Hubs: Capture to cool/archive Blob tier; right-size TU count; dedicated clusters only at extreme scale
- Use **Basic** Service Bus only for dev — no topics means you cannot evolve to pub-sub without migration`,
        codeExample: `# Service Bus — manual message settlement (reliable processing)
from azure.servicebus import ServiceBusClient, ServiceBusReceiveMode

CONNECTION_STR = "Endpoint=sb://..."
QUEUE_NAME = "orders"

with ServiceBusClient.from_connection_string(CONNECTION_STR) as client:
    receiver = client.get_queue_receiver(
        queue_name=QUEUE_NAME,
        receive_mode=ServiceBusReceiveMode.PEEK_LOCK,
        max_wait_time=30
    )
    with receiver:
        for msg in receiver:
            try:
                process(msg)
                receiver.complete_message(msg)      # Success
            except TransientError:
                receiver.abandon_message(msg)       # Retry (increments delivery count)
            except PoisonError:
                receiver.dead_letter_message(       # Move to DLQ immediately
                    msg,
                    reason="InvalidSchema",
                    error_description=str(e)
                )

# Bicep — Event Hubs Capture to Data Lake
resource eventHub 'Microsoft.EventHub/namespaces/eventhubs@2024-01-01' = {
  name: 'telemetry'
  parent: namespace
  properties: {
    messageRetentionInDays: 7
    partitionCount: 32
    captureDescription: {
      enabled: true
      encoding: 'Avro'
      intervalInSeconds: 300
      sizeLimitInBytes: 314572800
      destination: {
        name: 'EventHubArchive.AzureBlockBlob'
        properties: {
          storageAccountResourceId: storage.id
          blobContainer: 'eventhub-capture'
          archiveNameFormat: '{Namespace}/{EventHub}/{PartitionId}/{Year}/{Month}/{Day}/{Hour}/{Minute}/{Second}'
        }
      }
    }
  }
}`,
        keyPoints: [
          "Alert on DLQ depth and throttled requests — silent failures are the #1 production issue",
          "Private Endpoints + managed identity replaces SAS keys in production",
          "Event Hubs partition count is fixed at creation — plan for peak throughput upfront",
          "Geo-DR for Service Bus and Event Hubs uses paired namespaces with manual/scripted failover",
        ],
        warning:
          "Event Hubs partition count cannot be changed after namespace creation. Under-provisioning partitions limits throughput ceiling; over-provisioning increases cost without benefit if consumer count is low.",
      },
    ],
    quiz: [
      {
        question: "Which Azure service should you use for a work-queue pattern where multiple workers compete for tasks?",
        options: [
          "Event Hubs",
          "Event Grid",
          "Service Bus Queue",
          "Event Hubs Capture",
        ],
        answer: 2,
        explanation:
          "Service Bus queues provide competing consumer semantics with message locking, visibility timeout, and dead-letter queues. Event Hubs is for streaming; Event Grid is for event routing.",
      },
      {
        question: "A message fails processing 10 times on a Service Bus queue (MaxDeliveryCount = 10). What happens?",
        options: [
          "It is permanently deleted",
          "It is moved to the dead-letter sub-queue",
          "It is automatically retried forever",
          "It is forwarded to Event Grid",
        ],
        answer: 1,
        explanation:
          "When delivery count exceeds MaxDeliveryCount, Service Bus moves the message to the dead-letter sub-queue for investigation and manual resubmission.",
      },
      {
        question: "You need to react when a new blob is uploaded to Azure Storage. Which is the simplest approach?",
        options: [
          "Poll the storage account every minute with a timer Function",
          "Event Grid system topic for Microsoft.Storage.BlobCreated",
          "Service Bus queue on the storage account",
          "Event Hubs with Capture enabled",
        ],
        answer: 1,
        explanation:
          "Event Grid system topics natively publish BlobCreated events from Azure Storage. No polling, no custom code on the storage side.",
      },
      {
        question: "What is guaranteed about message ordering in Event Hubs?",
        options: [
          "Global ordering across all partitions",
          "Ordering within a single partition only",
          "FIFO ordering across all consumer groups",
          "Exactly-once delivery with ordering",
        ],
        answer: 1,
        explanation:
          "Event Hubs guarantees ordering within a partition. Across partitions there is no ordering guarantee. Delivery is at-least-once, not exactly-once.",
      },
    ],
  },
  {
    slug: "api-management",
    category: "integration",
    title: "API Management",
    subtitle: "API gateway, policies, and developer portal",
    description:
      "Expose, secure, and monetize APIs with rate limiting, authentication, transformation, and caching.",
    difficulty: "intermediate",
    duration: "95 min",
    services: ["API Management", "Developer Portal"],
    sections: [
      {
        id: "gateway",
        title: "Gateway & Policies",
        content: `**Azure API Management (APIM)** is the front door for your APIs — handling authentication, rate limiting, transformation, caching, and observability before traffic reaches backends.

**APIM tiers — choose based on scale, networking, and ops model:**

| Tier | Model | Scale | VNet | Self-hosted gateway | Best for |
|---|---|---|---|---|---|
| **Consumption** | Serverless | Auto | External only | No | Microservices, sporadic traffic, per-call billing |
| **Developer** | Dedicated (single unit) | Low | No | Yes (dev/test) | Evaluation, learning — **not for production** |
| **Basic** | Dedicated | Moderate | No | No | Small production, no VNet |
| **Standard** | Dedicated | High | No | No | Production APIs without VNet injection |
| **Premium** | Multi-region | Very high | Internal + External | Yes | Enterprise production, multi-region, VNet |
| **Isolated** | App Service Environment | High | Full ASE isolation | No | Regulatory isolation requirements |

**APIM architecture components:**

| Component | Role |
|---|---|
| **Gateway** | Data plane — receives API requests, executes policies, forwards to backend |
| **Management plane** | Azure portal / ARM / CI/CD — configure APIs, policies, products |
| **Developer portal** | External-facing docs, try-it console, subscription management |
| **Self-hosted gateway** | Run gateway container on-premises, other clouds, or K8s for hybrid |

**Policy pipeline — execution order matters:**

\`\`\`
Request  →  [Inbound policies]  →  [Backend]  →  [Outbound policies]  →  Response
                    ↓ (on error)
              [On-error policies]
\`\`\`

| Section | Common policies | Purpose |
|---|---|---|
| **Inbound** | \`rate-limit\`, \`quota\`, \`validate-jwt\`, \`cors\`, \`set-header\`, \`rewrite-uri\`, \`cache-lookup\` | Auth, throttling, request transformation |
| **Backend** | \`forward-request\`, \`set-backend-service\`, \`circuit-breaker\` | Route to correct backend, resilience |
| **Outbound** | \`cache-store\`, \`set-header\`, \`find-and-replace\`, \`json-to-xml\` | Response transformation, caching |
| **On-error** | \`return-response\`, \`set-status\`, \`log-to-eventhub\` | Custom error responses, don't leak internals |

**Policy scopes (narrowest wins for conflicts):**

| Scope | Applied to | Example |
|---|---|---|
| **Global** | All APIs in APIM instance | CORS, correlation-id, logging |
| **Product** | All APIs in a product | Rate limit per subscription tier |
| **API** | Single API | JWT validation for this API |
| **Operation** | Single endpoint (GET /orders) | Cache lookup for read-only endpoint |

**Essential inbound policies for production:**

| Policy | What it does | Production note |
|---|---|---|
| \`validate-jwt\` | Verify Entra ID / Auth0 / custom JWT | Always validate on external-facing APIs |
| \`rate-limit-by-key\` | Limit calls per subscription key or IP | Prefer over \`rate-limit\` (which is per-gateway instance) |
| \`quota-by-key\` | Total calls per period (day/month) | Monetization and abuse prevention |
| \`ip-filter\` | Allow/deny IP ranges | Defense in depth alongside auth |
| \`cors\` | Browser cross-origin rules | Required for SPA frontends |
| \`set-backend-service\` | Route to different backend URL | Multi-region, blue-green, canary |

**Backend integration patterns:**

| Pattern | Configuration | Use case |
|---|---|---|
| **Single backend** | Default service URL on API | Simple REST API |
| **Multiple backends** | \`set-backend-service\` policy per operation | Microservices routing through one facade |
| **Load-balanced** | Backend pool with \`round-robin\` or \`weighted\` | HA across multiple App Services / VMs |
| **Circuit breaker** | \`circuit-breaker\` policy on backend | Prevent cascade failures to unhealthy backends |
| **Mock** | \`return-response\` in inbound | Stub responses for dev/test or degraded mode |`,
        codeExample: `<!-- Rate limiting + JWT validation — inbound policy -->
<policies>
  <inbound>
    <base />
    <!-- Validate Entra ID token -->
    <validate-jwt header-name="Authorization"
                  failed-validation-httpcode="401"
                  require-scheme="Bearer">
      <openid-config url="https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid-configuration" />
      <audiences>
        <audience>api://my-api-app-id</audience>
      </audiences>
      <issuers>
        <issuer>https://login.microsoftonline.com/{tenant-id}/v2.0</issuer>
      </issuers>
    </validate-jwt>
    <!-- Per-subscription rate limit (works across scaled gateway instances) -->
    <rate-limit-by-key calls="100" renewal-period="60"
                       counter-key="@(context.Subscription.Id)" />
    <!-- Rewrite backend path -->
    <rewrite-uri template="/api/v2/{path}" />
    <set-header name="X-Forwarded-By" exists-action="override">
      <value>APIM</value>
    </set-header>
  </inbound>
  <backend>
    <forward-request timeout="30" />
  </backend>
  <outbound>
    <base />
    <!-- Cache GET responses for 5 minutes -->
    <cache-store duration="300" />
    <set-header name="X-Cache" exists-action="override">
      <value>@(context.Variables.GetValueOrDefault<string>("cache-hit", "miss"))</value>
    </set-header>
  </outbound>
  <on-error>
    <base />
    <return-response>
      <set-status code="500" reason="Internal Server Error" />
      <set-body>@{
        return new JObject(
          new JProperty("error", "An unexpected error occurred"),
          new JProperty("correlationId", context.RequestId)
        ).ToString();
      }</set-body>
    </return-response>
  </on-error>
</policies>`,
        keyPoints: [
          "Policies execute in order: inbound → backend → outbound; on-error on failure",
          "rate-limit-by-key and quota-by-key use subscription ID — works across scaled instances",
          "validate-jwt for Entra ID is the production auth baseline for external APIs",
          "Policy scope hierarchy: global < product < API < operation (most specific wins)",
        ],
        warning:
          "Using rate-limit instead of rate-limit-by-key only limits per gateway instance. In multi-instance Premium deployments, effective rate limit is N × configured value.",
      },
      {
        id: "products",
        title: "Products, Subscriptions & Portal",
        content: `APIM's **product and subscription model** controls who can access which APIs, with what quotas, and through which keys.

**Core entities and relationships:**

\`\`\`
Product (e.g., "Starter", "Enterprise")
  ├── APIs (grouped for external consumption)
  ├── Policies (product-scoped rate limits, quotas)
  └── Subscriptions (developer access grants)
        ├── Subscription key (primary + secondary)
        ├── State (active, suspended, expired, submitted, rejected)
        └── Associated user / application
\`\`\`

**Product types:**

| Type | Visibility | Approval | Use case |
|---|---|---|---|
| **Protected** | Visible in portal, requires subscription | Optional admin approval | Public API products (free tier, paid tier) |
| **Public** | Visible, auto-approved subscription | No approval needed | Open APIs, developer onboarding |
| **Private** | Hidden from portal | Admin-managed only | Internal teams, B2B partners |

**Subscription lifecycle:**

| State | API access | Transition |
|---|---|---|
| **Submitted** | No | User requests access → admin approves |
| **Active** | Yes | Normal operation |
| **Suspended** | No | Admin pauses (billing dispute, abuse) |
| **Expired** | No | Past expiration date |
| **Rejected** | No | Admin denies request |

**Quota vs rate limit — understand the difference:**

| Control | Scope | Resets | Purpose |
|---|---|---|---|
| **Rate limit** | Calls per second/minute | Rolling window | Burst protection, SLA enforcement |
| **Quota** | Total calls per period | Calendar period (day/month) | Monetization tiers, usage caps |

Example tier design:
- **Free product**: 100 calls/minute rate limit, 10,000 calls/month quota
- **Pro product**: 1,000 calls/minute, 1,000,000 calls/month
- **Enterprise product**: Custom rate, unlimited quota, IP allowlist

**Developer portal:**

| Feature | Default | Customization |
|---|---|---|
| **API documentation** | Auto-generated from OpenAPI specs | Add descriptions, code samples, guides |
| **Try-it console** | Interactive API testing with subscription key | Pre-fill auth, hide internal APIs |
| **Sign-up / sign-in** | Built-in user management | Entra ID, AAD B2C, or custom OAuth |
| **Branding** | APIM default theme | Full CSS/HTML customization (v2 portal) |
| **Self-service subscriptions** | Users subscribe to products | Approval workflows for protected products |

**Developer portal deployment models:**

| Model | How | When |
|---|---|---|
| **Managed** | Hosted by Azure APIM | Default, lowest ops overhead |
| **Self-hosted** | Deploy portal code to App Service / Static Web Apps | Custom domain, full control, air-gapped |
| **CI/CD** | Extract → customize → publish via Azure Pipelines | Team workflow with version control |

**Self-hosted gateway (hybrid APIM):**

| Aspect | Detail |
|---|---|
| **What it is** | Containerized APIM gateway running outside Azure |
| **Management** | Still controlled from Azure APIM management plane |
| **Use cases** | On-premises APIs, multi-cloud, data residency, edge deployment |
| **Requirements** | Premium or Developer tier; outbound HTTPS to Azure management endpoint |
| **Deployment** | Docker, Kubernetes (Helm chart), auto-scaling with HPA |

**API versioning strategies in APIM:**

| Strategy | Implementation | Tradeoff |
|---|---|---|
| **URL path** | \`/v1/orders\`, \`/v2/orders\` as separate APIs or operations | Explicit, easy to route |
| **Query parameter** | \`?api-version=2024-01\` via \`set-query-parameter\` | Clean URLs, harder to cache |
| **Header** | \`api-version: 2\` via \`set-header\` | Common in enterprise, invisible in URL |
| **Separate products** | v1 in "Legacy" product, v2 in "Current" product | Different quotas per version |`,
        codeExample: `<!-- Product-scoped quota and rate limit policy -->
<policies>
  <inbound>
    <base />
    <!-- 5000 calls per month per subscription -->
    <quota-by-key calls="5000" renewal-period="2629800"
                  counter-key="@(context.Subscription.Id)" />
    <!-- 200 calls per minute burst protection -->
    <rate-limit-by-key calls="200" renewal-period="60"
                       counter-key="@(context.Subscription.Id)" />
    <!-- Require subscription key in header -->
    <check-header name="Ocp-Apim-Subscription-Key" failed-check-httpcode="401"
                  failed-check-error-message="Subscription key required" />
  </inbound>
</policies>

# Azure CLI — create product, add API, create subscription
az apim product create --resource-group rg-apim --service-name my-apim \\
  --product-id starter --product-name "Starter Plan" \\
  --description "Free tier for developers" --subscription-required true \\
  --approval-required false --subscriptions-limit 1 --state published

az apim product api add --resource-group rg-apim --service-name my-apim \\
  --product-id starter --api-id orders-api

az apim subscription create --resource-group rg-apim --service-name my-apim \\
  --sid starter-sub-001 --product-id starter --display-name "Dev Team Alpha"`,
        keyPoints: [
          "Products bundle APIs with access policies for external consumers",
          "Subscriptions provide API keys with per-key rate limits and quotas",
          "rate-limit-by-key + quota-by-key at product scope enforces tiered monetization",
          "Self-hosted gateway for hybrid scenarios — APIs on-premises, management in Azure",
        ],
        warning:
          "Publishing a product without rate-limit-by-key or quota-by-key exposes backends to unbounded traffic. Always set limits before making products public.",
      },
      {
        id: "security-observability",
        title: "Security, Observability & CI/CD",
        content: `Production APIM deployments require defense-in-depth security, end-to-end observability, and infrastructure-as-code workflows.

**Security layers:**

| Layer | Control | Implementation |
|---|---|---|
| **Transport** | TLS 1.2+ | Enforced by default on gateway |
| **Authentication** | JWT / OAuth 2.0 | \`validate-jwt\`, \`validate-azure-ad-token\`, \`oauth2\` |
| **Authorization** | Subscription keys + RBAC | Keys for external devs; RBAC for management plane |
| **Network** | VNet injection, Private Endpoint | Premium tier — gateway in your VNet |
| **Secrets** | Named Values + Key Vault | Reference Key Vault secrets in policies via Managed Identity |
| **Threat protection** | Bot protection, IP filtering | \`ip-filter\`, \`rate-limit-by-key\`, Front Door WAF in front |

**Authentication patterns:**

| Pattern | Policy | Best for |
|---|---|---|
| **Entra ID (Azure AD)** | \`validate-jwt\` with OpenID config | Enterprise APIs, first-party apps |
| **Entra External ID / B2C** | \`validate-jwt\` with B2C policy URL | Consumer-facing APIs |
| **Subscription key only** | \`check-header\` for \`Ocp-Apim-Subscription-Key\` | Simple developer access (not user-level auth) |
| **Certificate auth** | \`validate-client-certificate\` | mTLS for B2B partners |
| **Managed identity to backend** | \`authentication-managed-identity\` | APIM → App Service / Function without stored secrets |

**Named Values and Key Vault integration:**

| Type | Storage | Rotation |
|---|---|---|
| **Plain** | APIM Named Value (encrypted at rest) | Manual update in portal/ARM |
| **Key Vault reference** | Secret stored in Key Vault, referenced by APIM | Automatic pick-up on secret rotation (with refresh) |

Use Key Vault references for: backend API keys, JWT signing keys, third-party service credentials.

**Observability stack:**

| Signal | Source | Destination |
|---|---|---|
| **Request/response logs** | APIM diagnostic settings | Log Analytics, Event Hubs, Storage |
| **Metrics** | Built-in (duration, capacity, requests) | Azure Monitor, dashboards |
| **Application Insights** | \`application-insights\` logger policy | End-to-end tracing with backend |
| **Event Hub logging** | \`log-to-eventhub\` policy | Real-time streaming analytics |

**Key metrics to alert on:**

| Metric | Threshold | Action |
|---|---|---|
| **Capacity** | > 80% sustained | Scale up APIM units or add regions |
| **Duration** | p99 > SLA target | Investigate backend latency or policy overhead |
| **Failed requests** | > 1% of total | Check backend health, auth failures |
| **Unauthorized requests** | Spike | Possible attack or expired keys |

**CI/CD with APIM:**

| Approach | Tooling | Workflow |
|---|---|---|
| **ARM/Bicep** | Native Azure IaC | Deploy full APIM instance or incremental changes |
| **APIM DevOps Resource Kit** | Extractor + Creator + Publisher | Extract from dev → PR review → publish to staging/prod |
| **Terraform** | azurerm_api_management resources | Team standard if already on Terraform |
| **GitOps** | Extract APIs/policies to Git; pipeline deploys | Version-controlled policy changes with approval gates |

**Recommended CI/CD pipeline:**
1. Developers modify APIs/policies in **dev** APIM instance
2. **Extractor** pulls configuration to Git repository
3. PR review with diff of policy XML and OpenAPI specs
4. **Publisher** deploys to staging APIM on merge to main
5. Integration tests validate policies (rate limits, JWT, routing)
6. Manual or gated promotion to production APIM

**Multi-region and DR:**

| Feature | Tier | Behavior |
|---|---|---|
| **Multi-region gateway** | Premium | Deploy gateway units in multiple Azure regions |
| **Traffic Manager / Front Door** | External | Route to nearest healthy APIM region |
| **Backup/restore** | All tiers | \`az apim backup\` / \`az apim restore\` for disaster recovery |
| **Availability zones** | Premium | Zone-redundant gateway within a region |

**Production checklist:**
- [ ] JWT validation on all external APIs
- [ ] rate-limit-by-key and quota-by-key on every product
- [ ] Named Values reference Key Vault (no plaintext secrets in policies)
- [ ] Diagnostic settings → Log Analytics with 90+ day retention
- [ ] Application Insights integration for distributed tracing
- [ ] On-error policies return generic messages (no stack traces)
- [ ] CI/CD pipeline for policy changes (no manual portal edits in prod)
- [ ] Multi-region or backup/restore tested for DR`,
        codeExample: `<!-- Managed identity authentication to backend App Service -->
<policies>
  <inbound>
    <base />
    <authentication-managed-identity resource="https://management.azure.com/" />
  </inbound>
  <backend>
    <forward-request />
  </backend>
</policies>

<!-- Log to Application Insights for distributed tracing -->
<policies>
  <inbound>
    <base />
    <set-header name="x-ms-request-id" exists-action="skip">
      <value>@(context.RequestId.ToString())</value>
    </set-header>
  </inbound>
  <outbound>
    <base />
    <trace source="apim" severity="information">
      <message>@("Response: " + context.Response.StatusCode.ToString())</message>
      <metadata name="api" value="@(context.Api.Name)" />
      <metadata name="operation" value="@(context.Operation.Name)" />
      <metadata name="duration" value="@(context.Elapsed.ToString())" />
    </trace>
  </outbound>
</policies>

# Bicep — APIM diagnostic settings to Log Analytics
resource apimDiagnostics 'Microsoft.ApiManagement/service/diagnostics@2023-03-01-preview' = {
  parent: apim
  name: 'applicationinsights'
  properties: {
    loggerId: appInsightsLogger.id
    sampling: {
      samplingType: 'fixed'
      percentage: 100
    }
    frontend: {
      request: { headers: ['Authorization', 'Content-Type'] }
      response: { headers: ['Content-Type'] }
    }
    backend: {
      request: { headers: ['Authorization'] }
      response: { headers: ['Content-Type'] }
    }
  }
}`,
        keyPoints: [
          "validate-jwt + rate-limit-by-key + quota-by-key is the production security baseline",
          "Key Vault-backed Named Values eliminate plaintext secrets in policy XML",
          "APIM DevOps Resource Kit enables Git-based policy review and staged deployment",
          "Alert on capacity > 80% — APIM throttles requests when capacity is exhausted",
        ],
        warning:
          "Editing policies directly in the production portal bypasses review and version control. A malformed policy XML can break all APIs on the instance. Use CI/CD with PR review for production changes.",
      },
    ],
    quiz: [
      {
        question: "Which rate limiting policy works correctly when APIM gateway is scaled to multiple instances?",
        options: [
          "rate-limit",
          "rate-limit-by-key",
          "ip-filter",
          "quota (without -by-key)",
        ],
        answer: 1,
        explanation:
          "rate-limit-by-key uses a shared counter keyed by subscription ID (or custom key), so limits are enforced across all gateway instances. rate-limit only applies per instance.",
      },
      {
        question: "In which policy section would you place a validate-jwt policy?",
        options: ["Backend", "Outbound", "Inbound", "On-error"],
        answer: 2,
        explanation:
          "JWT validation happens on the inbound request before it reaches the backend. Inbound policies handle authentication, rate limiting, and request transformation.",
      },
      {
        question: "What is the narrowest (most specific) policy scope in APIM?",
        options: ["Global", "Product", "API", "Operation"],
        answer: 3,
        explanation:
          "Policy scopes from broadest to narrowest: Global → Product → API → Operation. Operation-level policies apply to a single endpoint and override broader scopes.",
      },
      {
        question: "Which APIM tier is required for VNet injection of the gateway?",
        options: ["Consumption", "Basic", "Standard", "Premium"],
        answer: 3,
        explanation:
          "VNet injection (internal and external) is available on the Premium tier. Consumption supports VNet only in external mode. Basic and Standard have no VNet support.",
      },
    ],
  },
];