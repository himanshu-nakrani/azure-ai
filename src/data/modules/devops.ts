import { LearningModule } from "@/lib/types";

export const devopsModules: LearningModule[] = [
  {
    slug: "monitoring",
    category: "devops",
    title: "Azure Monitor & Application Insights",
    subtitle: "Metrics, logs, alerts, and distributed tracing",
    description:
      "Observe everything running on Azure. Metrics, log queries, alert rules, and application performance monitoring.",
    difficulty: "foundational",
    duration: "105 min",
    services: ["Azure Monitor", "Application Insights", "Log Analytics"],
    sections: [
      {
        id: "monitor-basics",
        title: "Metrics, Logs & Log Analytics",
        content: `**Azure Monitor** is the unified observability platform for Azure and hybrid workloads. It ingests two fundamentally different data types — each optimized for different questions.

**Metrics vs Logs — when to use which:**

| Data type | Structure | Retention (default) | Query language | Best for |
|---|---|---|---|---|
| **Metrics** | Numerical time-series | 93 days (extendable) | Metrics Explorer, PromQL (managed Prometheus) | Alerting, dashboards, capacity trends |
| **Logs** | Structured/semi-structured records | 30–730 days (workspace setting) | Kusto Query Language (KQL) | Root-cause analysis, correlation, audit |

**Log Analytics workspace architecture:**
- One workspace can collect logs from resources across **multiple subscriptions** (centralized monitoring)
- **Data collection rules (DCRs)** define what to collect and where to send it — the modern replacement for legacy diagnostic settings
- **Tables** store data by type: \`Heartbeat\`, \`Perf\`, \`AzureActivity\`, \`ContainerLog\`, custom tables via DCR transformations
- **Ingestion cost** is per GB ingested + retention beyond free tier. Use **Basic Logs** for high-volume, low-query data (30-day retention, reduced cost)

**Diagnostic settings — what to enable on every production resource:**

| Signal | Examples | Why it matters |
|---|---|---|
| **Platform metrics** | CPU, memory, disk IOPS | Real-time capacity alerting |
| **Resource logs** | AppServiceHTTPLogs, AuditLogs, NSG flow logs | Security and troubleshooting |
| **Activity logs** | Create/update/delete operations | Change auditing (also collected at subscription level) |

Route diagnostics to Log Analytics for queryability, or to Storage for long-term archival (cheaper, not queryable without re-ingestion).

**KQL fundamentals — operators you must know:**

| Operator | Purpose | Example |
|---|---|---|
| \`where\` | Filter rows | \`where Level == "Error"\` |
| \`project\` | Select columns | \`project TimeGenerated, Message\` |
| \`summarize\` | Aggregate | \`summarize count() by bin(TimeGenerated, 1h)\` |
| \`join\` | Correlate tables | Join requests with exceptions on operation_Id |
| \`render\` | Visualize | \`render timechart\` |
| \`parse\` / \`extract\` | Parse unstructured text | Extract JSON fields from log messages |
| \`make-series\` | Time-series gaps | Detect missing heartbeats |

**Production KQL patterns:**

\`\`\`kql
// Failed HTTP requests in the last hour, grouped by status code
requests
| where timestamp > ago(1h) and success == false
| summarize FailedCount = count(), AvgDuration = avg(duration) by resultCode, name
| order by FailedCount desc

// VMs that stopped sending heartbeats (likely down)
Heartbeat
| where TimeGenerated > ago(15m)
| summarize LastHeartbeat = max(TimeGenerated) by Computer, _ResourceId
| where LastHeartbeat < ago(5m)

// Top 10 noisy log sources consuming ingestion budget
Usage
| where TimeGenerated > ago(7d) and IsBillable == true
| summarize TotalGB = sum(Quantity) / 1000 by DataType, _ResourceId
| top 10 by TotalGB desc
\`\`\`

**Azure Monitor Agent (AMA)** replaces the legacy Log Analytics agent (MMA/OMS). Deploy via Azure Policy, VM extensions, or Arc-enabled servers. AMA uses DCRs for granular, per-machine collection — collect only what you need to control costs.`,
        codeExample: `// Bicep: Log Analytics workspace + diagnostic setting for a Web App
param workspaceName string
param appName string
param location string = resourceGroup().location

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: workspaceName
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 90
  }
}

resource webApp 'Microsoft.Web/sites@2022-09-01' existing = {
  name: appName
}

resource diagSetting 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  scope: webApp
  name: 'send-to-law'
  properties: {
    workspaceId: workspace.id
    logs: [
      { category: 'AppServiceHTTPLogs', enabled: true }
      { category: 'AppServiceConsoleLogs', enabled: true }
    ]
    metrics: [
      { category: 'AllMetrics', enabled: true }
    ]
  }
}`,
        keyPoints: [
          "Metrics for alerting and trends; logs for investigation and correlation",
          "Enable diagnostic settings on every production resource — Azure does not collect resource logs by default",
          "KQL summarize + join are the core skills for effective log analysis",
          "Use DCRs with Azure Monitor Agent for cost-controlled, granular collection",
        ],
        warning:
          "Log Analytics ingestion costs scale with volume. Enabling all log categories on high-traffic resources without sampling or filtering can produce surprise bills. Review the Usage table weekly and tune DCRs to exclude noisy categories.",
      },
      {
        id: "app-insights",
        title: "Application Insights & Distributed Tracing",
        content: `**Application Insights** is Azure's Application Performance Management (APM) service. It auto-instruments applications to collect telemetry without manual logging for standard operations.

**What App Insights collects automatically:**

| Telemetry type | Data captured | SDK required |
|---|---|---|
| **Requests** | HTTP calls, duration, response code, URL | Yes (or auto-instrumentation) |
| **Dependencies** | Outbound calls (SQL, HTTP APIs, Azure services) | Yes |
| **Exceptions** | Unhandled errors with stack traces | Yes |
| **Traces** | Custom log messages (\`ILogger\`, \`console.log\`) | Yes |
| **Custom events** | Business events (checkout, signup) | Manual instrumentation |
| **Page views** | Browser navigation (client-side JS SDK) | JS SDK |
| **Availability tests** | Synthetic monitoring from global locations | Portal configuration |

**Auto-instrumentation options (no code changes):**
- **Azure App Service**: Enable in portal → Application Insights blade
- **AKS**: OpenTelemetry Collector or Application Insights Kubernetes monitoring
- **.NET / Java / Node / Python**: Install the Application Insights SDK or use OpenTelemetry exporter

**Distributed tracing — how it works:**
Every incoming request gets an **operation_Id**. Each dependency call within that request shares the same operation_Id and gets a unique **id**. In the Application Map and End-to-end transaction view, you see the full call chain:

\`\`\`
Browser → API Gateway (45ms) → Order Service (120ms) → SQL Database (95ms)
                                              └── Payment API (200ms) ← bottleneck
\`\`\`

**W3C Trace Context** is the standard propagation format. Ensure all services in a microservice chain forward the \`traceparent\` header — broken propagation creates orphaned spans and incomplete traces.

**Smart Detection (ML-based, no config required):**
- Failure rate anomalies
- Response time degradation
- Dependency performance issues
- Trace severity ratio anomalies

Smart Detection alerts appear automatically in the portal. Review and tune sensitivity for production workloads.

**Sampling — critical for high-traffic apps:**
Adaptive sampling (default in .NET SDK) reduces telemetry volume while preserving statistically representative data. Without sampling, a 10K RPS app can generate terabytes of telemetry monthly.

| Sampling type | Behavior | When to use |
|---|---|---|
| **Adaptive** | Dynamically adjusts rate based on volume | Default for most production apps |
| **Fixed-rate** | Send exactly X% of telemetry | Predictable ingestion budgets |
| **Ingestion sampling** | Server-side sampling in App Insights | When SDK changes are not possible |

**KQL for App Insights investigation:**

\`\`\`kql
// End-to-end transaction by operation_Id
let opId = "abc123def456";
union requests, dependencies, exceptions, traces
| where operation_Id == opId
| order by timestamp asc

// Dependency failures in the last 24 hours
dependencies
| where timestamp > ago(24h) and success == false
| summarize FailureCount = count() by target, resultCode, type
| order by FailureCount desc

// P95 request latency by endpoint over the last 7 days
requests
| where timestamp > ago(7d)
| summarize P95 = percentile(duration, 95) by name, bin(timestamp, 1h)
| render timechart
\`\`\``,
        codeExample: `// .NET: Custom telemetry with correlation (preserves operation_Id)
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

public class OrderService
{
    private readonly TelemetryClient _telemetry;

    public async Task ProcessOrder(Order order)
    {
        using var operation = _telemetry.StartOperation<RequestTelemetry>("ProcessOrder");
        try
        {
            _telemetry.TrackEvent("OrderStarted", new Dictionary<string, string>
            {
                ["OrderId"] = order.Id,
                ["CustomerId"] = order.CustomerId
            });
            // ... business logic
        }
        catch (Exception ex)
        {
            _telemetry.TrackException(ex);
            throw;
        }
    }
}`,
        keyPoints: [
          "App Insights auto-tracks requests, dependencies, and exceptions with the SDK",
          "Distributed tracing requires trace context propagation across all services",
          "Enable adaptive sampling on high-traffic apps to control ingestion costs",
          "Use operation_Id to correlate requests, dependencies, and exceptions in KQL",
        ],
        warning:
          "Broken trace context propagation is the most common microservices observability failure. If Service B does not forward the traceparent header from Service A, you get disconnected spans and cannot see the full latency chain.",
      },
      {
        id: "alerting-workbooks",
        title: "Alerting, Action Groups & Workbooks",
        content: `**Alert rules** in Azure Monitor notify you when conditions are met — before users report problems.

**Alert rule types:**

| Type | Data source | Example condition | Latency |
|---|---|---|---|
| **Metric alerts** | Platform metrics | CPU > 80% for 5 min | 1–5 minutes |
| **Log alerts (scheduled query)** | Log Analytics KQL | Exceptions > 10 in 15 min | 5–15 minutes (query frequency) |
| **Activity log alerts** | Azure Activity Log | Delete resource group | Near real-time |
| **Smart Detection** | App Insights ML | Failure rate anomaly | Minutes |

**Metric alert best practices:**

| Practice | Detail |
|---|---|
| **Use dynamic thresholds** | ML-based baselines adapt to daily/weekly patterns — fewer false positives than static thresholds |
| **Set appropriate window** | "CPU > 80% for 5 minutes" avoids alerting on brief spikes |
| **Severity mapping** | Sev 0 = critical (page on-call), Sev 2 = warning (email), Sev 3 = informational |
| **Dimension splitting** | Alert per VM, not aggregate — "any VM CPU > 90%" not "average CPU > 90%" |

**Log alert KQL requirements:**
- Query must contain \`| where TimeGenerated > ago(X)\` or equivalent time filter
- Use \`summarize\` with \`count()\` or \`aggregation\`
- Set **metric measurement** column and threshold in the alert rule configuration
- Frequency + lookback window: e.g., run every 5 min, look back 15 min

\`\`\`kql
// Log alert: more than 5 failed requests in 15 minutes
requests
| where timestamp > ago(15m) and success == false
| summarize FailedCount = count() by bin(timestamp, 5m), cloud_RoleName
| where FailedCount > 5
\`\`\`

**Action groups** define who gets notified and how:

| Channel | Use case | Notes |
|---|---|---|
| **Email / SMS / Voice** | Human notification | SMS/voice have per-message costs |
| **Webhook** | Integrate with PagerDuty, Slack, Teams | POST JSON payload |
| **Logic App** | Complex workflows (ticket creation, escalation chains) | Most flexible |
| **ITSM connector** | ServiceNow, System Center | Enterprise incident management |
| **Automation runbook** | Auto-remediate (restart VM, scale out) | Use with caution in production |

**Alert processing rules** (suppression and action groups):
- **Suppression**: Silence alerts during planned maintenance windows
- **Scope**: Apply to specific resources or resource groups
- **Schedule**: Recurring maintenance windows (e.g., every Sunday 2–4 AM)

**Workbooks** are interactive, shareable dashboards combining metrics, logs, and text. Unlike static dashboards, workbooks support parameters (subscription picker, time range, resource selector).

**Production workbook patterns:**
- **Landing zone health**: Policy compliance %, Defender coverage, backup status across subscriptions
- **Application SLO dashboard**: Availability %, P95 latency, error budget burn rate
- **Cost anomaly**: Daily spend vs 7-day average by resource group
- **Incident triage**: Pre-built KQL queries for on-call engineers

**Azure Monitor integration with Grafana:**
- Managed Grafana in Azure connects natively to Log Analytics and Prometheus metrics
- Use Grafana for team-facing dashboards; workbooks for Azure-portal-native operational views`,
        codeExample: `// Bicep: Metric alert + action group for high CPU
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-platform-oncall'
  location: 'global'
  properties: {
    groupShortName: 'platoc'
    enabled: true
    emailReceivers: [
      {
        name: 'oncall-email'
        emailAddress: 'oncall@contoso.com'
        useCommonAlertSchema: true
      }
    ]
  }
}

resource cpuAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'alert-vm-cpu-high'
  location: 'global'
  properties: {
    description: 'VM CPU exceeded 85% for 10 minutes'
    severity: 2
    enabled: true
    scopes: [ vmResourceId ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT10M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'CpuThreshold'
          metricName: 'Percentage CPU'
          operator: 'GreaterThan'
          threshold: 85
          timeAggregation: 'Average'
        }
      ]
    }
    actions: [
      { actionGroupId: actionGroup.id }
    ]
  }
}`,
        keyPoints: [
          "Metric alerts for real-time infrastructure; log alerts for complex application conditions",
          "Dynamic thresholds reduce false positives compared to static CPU/memory cutoffs",
          "Action groups with Logic Apps enable auto-remediation and ticket creation",
          "Workbooks provide parameterized, shareable operational dashboards in the portal",
        ],
        warning:
          "Log alerts bill per query execution. A poorly scoped query running every 1 minute across a high-volume table can cost more than the resources it monitors. Start with 5–15 minute frequencies and tune.",
      },
    ],
    quiz: [
      {
        question: "You need to investigate why a specific user request was slow across 4 microservices. Which KQL approach is correct?",
        options: [
          "Query each service's logs separately by timestamp",
          "Filter all telemetry tables by the shared operation_Id",
          "Search the Heartbeat table for the user's IP address",
          "Use the Usage table to find the slowest service",
        ],
        answer: 1,
        explanation:
          "Distributed tracing assigns a shared operation_Id to all telemetry in a request chain. Union requests, dependencies, and traces filtered by operation_Id shows the full call path and latency breakdown.",
      },
      {
        question: "Which data type should you use for a 'CPU > 80% for 5 minutes' alert rule?",
        options: ["Log Analytics KQL query", "Platform metrics", "Activity log", "App Insights traces"],
        answer: 1,
        explanation:
          "Platform metrics are numerical time-series optimized for near-real-time alerting with low latency. Log alerts have higher evaluation latency and are better for complex conditions.",
      },
      {
        question: "What is the primary cost control mechanism for high-traffic Application Insights apps?",
        options: [
          "Disable exception tracking",
          "Adaptive sampling to reduce telemetry volume",
          "Use Basic Logs tier for requests table",
          "Set retention to 7 days",
        ],
        answer: 1,
        explanation:
          "Adaptive sampling dynamically reduces the percentage of telemetry sent while preserving statistically representative data. It is the recommended approach for high-RPS applications.",
      },
      {
        question: "Diagnostic settings on an Azure resource must be explicitly configured because:",
        options: [
          "Azure collects all logs by default but stores them for only 24 hours",
          "Platform metrics are collected automatically, but resource logs are not sent to Log Analytics without diagnostic settings",
          "Diagnostic settings are only needed for virtual machines",
          "Activity logs require diagnostic settings to be captured",
        ],
        answer: 1,
        explanation:
          "Azure automatically collects platform metrics for most resources, but resource-specific logs (e.g., AppServiceHTTPLogs, AuditLogs) require explicit diagnostic settings to route to Log Analytics, Storage, or Event Hubs.",
      },
    ],
  },
  {
    slug: "cicd-iac",
    category: "devops",
    title: "CI/CD & Infrastructure as Code",
    subtitle: "GitHub Actions, Azure DevOps, Bicep, and ARM templates",
    description:
      "Automate deployments and infrastructure provisioning with pipelines and declarative templates.",
    difficulty: "intermediate",
    duration: "110 min",
    services: ["GitHub Actions", "Azure DevOps", "Bicep", "ARM Templates"],
    sections: [
      {
        id: "bicep",
        title: "Bicep & ARM Templates",
        content: `**Bicep** is Azure's domain-specific language for declarative infrastructure. It compiles to ARM JSON and deploys through Azure Resource Manager — no separate state file (unlike Terraform).

**Bicep file structure:**

| Section | Purpose | Example |
|---|---|---|
| \`targetScope\` | Deployment scope | \`resourceGroup\`, \`subscription\`, \`managementGroup\`, \`tenant\` |
| \`param\` | Input values (required or with defaults) | \`param location string = resourceGroup().location\` |
| \`var\` | Computed values (not exposed at deploy time) | \`var storageName = 'st\${uniqueString(resourceGroup().id)}'\` |
| \`resource\` | Azure resources to deploy | \`resource app 'Microsoft.Web/sites@2022-09-01' = { ... }\` |
| \`module\` | Reusable Bicep files | \`module vnet './modules/vnet.bicep' = { ... }\` |
| \`output\` | Values returned after deployment | \`output appUrl string = app.properties.defaultHostName\` |
| \`existing\` | Reference resources deployed elsewhere | \`resource law '...' existing = { name: 'existing-workspace' }\` |

**Modules — the key to maintainable IaC:**
Split infrastructure into composable modules. A landing zone might have:

\`\`\`
infra/
├── main.bicep              # Orchestrator
├── modules/
│   ├── vnet.bicep          # Networking
│   ├── keyvault.bicep      # Secrets
│   ├── appservice.bicep    # Compute
│   └── monitoring.bicep    # Log Analytics + diagnostics
└── parameters/
    ├── dev.bicepparam
    └── prod.bicepparam
\`\`\`

**Module best practices:**

| Practice | Why |
|---|---|
| **Single responsibility** | One module per resource type or logical group |
| **Expose only needed outputs** | Prevents tight coupling between modules |
| **Use \`.bicepparam\` files** | Separate environment config from template logic |
| **Version modules via registry** | Azure Container Registry (ACR) hosts Bicep modules with versioning |
| **\`@secure()\` decorator on secrets** | Prevents secrets appearing in deployment logs |

**ARM deployment scopes:**

| Scope | Use case | \`targetScope\` value |
|---|---|---|
| **Resource group** | Most workloads (default) | \`'resourceGroup'\` |
| **Subscription** | Landing zones, policy, role assignments | \`'subscription'\` |
| **Management group** | Enterprise policy at scale | \`'managementGroup'\` |
| **Tenant** | Entra ID / Azure AD resources | \`'tenant'\` |

**What-if deployment — preview before apply:**
\`az deployment group what-if\` shows a color-coded diff: resources to create (green), modify (orange), delete (red). Run what-if in CI pipelines before production deployments to catch unintended deletions.

**State management:**
ARM tracks deployed resource state internally. Bicep/ARM uses **incremental deployment** by default — resources in the template are created/updated; resources not in the template are left untouched. Use **complete mode** only when you explicitly want to delete resources not in the template (dangerous in production).

**Bicep vs Terraform on Azure:**

| Factor | Bicep | Terraform |
|---|---|---|
| **State file** | None (ARM manages state) | Requires remote state backend |
| **Azure feature day-zero** | Yes — same release cycle as ARM | Depends on provider updates |
| **Multi-cloud** | Azure only | AWS, GCP, Azure, etc. |
| **Drift detection** | what-if + Azure Policy | \`terraform plan\` |
| **Community modules** | Growing (AVM — Azure Verified Modules) | Extensive Registry |`,
        codeExample: `// Bicep module pattern: App Service with diagnostics
@description('Name of the App Service')
param appName string

@description('App Service Plan resource ID')
param planId string

@secure()
param appInsightsConnectionString string

param location string = resourceGroup().location

resource app 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  properties: {
    serverFarmId: planId
    siteConfig: {
      appSettings: [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
      ]
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource diag 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  scope: app
  name: 'app-diagnostics'
  properties: {
    workspaceId: logAnalyticsId
    logs: [
      { category: 'AppServiceHTTPLogs', enabled: true }
    ]
  }
}

output appId string = app.id
output principalId string = app.identity.principalId`,
        keyPoints: [
          "Bicep compiles to ARM — no state file to manage, ARM tracks deployed resources",
          "Modules + .bicepparam files separate template logic from environment configuration",
          "Always run what-if before production deployments to catch unintended changes",
          "Incremental deployment mode is the safe default — complete mode deletes unlisted resources",
        ],
        warning:
          "Complete deployment mode will DELETE resources in the resource group that are not defined in the template. A typo in a module reference can destroy production databases. Always use incremental mode unless you have a specific, reviewed reason for complete mode.",
      },
      {
        id: "pipelines",
        title: "CI/CD Pipelines",
        content: `**CI/CD pipelines** automate the path from code commit to production deployment. Azure supports two primary platforms: **GitHub Actions** (for GitHub repos) and **Azure DevOps Pipelines** (for Azure DevOps repos or multi-SCM).

**Standard pipeline stages:**

\`\`\`
┌─────────┐   ┌─────────┐   ┌──────────────┐   ┌───────────┐   ┌────────────┐
│  Build  │ → │  Test   │ → │ Deploy Staging│ → │ Integration│ → │ Deploy Prod│
│ compile │   │ unit +  │   │  (auto)       │   │   tests    │   │ (approval) │
│ package │   │ lint    │   │               │   │            │   │            │
└─────────┘   └─────────┘   └──────────────┘   └───────────┘   └────────────┘
\`\`\`

**GitHub Actions for Azure — key concepts:**

| Concept | Detail |
|---|---|
| **Workflow** | YAML file in \`.github/workflows/\` triggered by push, PR, schedule, or manual |
| **Jobs** | Parallel or sequential units of work (build, deploy) |
| **Steps** | Individual tasks within a job (checkout, build, deploy) |
| **Environments** | Named deployment targets with protection rules (required reviewers, wait timer) |
| **OIDC federation** | Authenticate to Azure without stored secrets |

**OIDC federation — eliminate stored credentials:**

Traditional approach: store \`AZURE_CLIENT_SECRET\` in GitHub Secrets. Problem: secrets rotate, leak, and require manual management.

OIDC approach: GitHub Actions requests a short-lived token from Azure Entra ID using a **federated identity credential** on an App Registration or Managed Identity. No secret stored in GitHub.

\`\`\`yaml
# GitHub Actions: Azure login via OIDC (no client secret)
permissions:
  id-token: write   # Required for OIDC
  contents: read

steps:
  - uses: azure/login@v2
    with:
      client-id: \${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: \${{ secrets.AZURE_TENANT_ID }}
      subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
\`\`\`

**Azure DevOps Pipelines — enterprise features:**

| Feature | Benefit |
|---|---|
| **Multi-stage YAML** | Build → Staging → Production with explicit dependencies |
| **Environments** | Approval gates, deployment history, checks (e.g., Azure Policy) |
| **Variable groups** | Centralized secrets linked to Key Vault |
| **Template extends** | Reusable pipeline templates across repos |
| **Artifact feeds** | Internal NuGet/npm/PyPI package hosting |

**Deployment patterns for Azure services:**

| Pattern | Service | How |
|---|---|---|
| **Blue-green** | App Service | Deployment slots — swap staging ↔ production |
| **Canary** | AKS | Progressive traffic shift with service mesh or AGIC |
| **Rolling** | VMSS | Update domain-by-domain with health probes |
| **Immutable** | Container Apps | Deploy new revision, shift traffic percentage |
| **Infra pipeline** | All (Bicep) | Separate pipeline for infrastructure vs application |

**Pipeline security checklist:**

| Control | Implementation |
|---|---|
| **Branch protection** | Require PR reviews before merge to main |
| **OIDC over secrets** | Federated credentials for Azure authentication |
| **Environment gates** | Required approvers for production deployments |
| **Secret scanning** | GitHub Advanced Security or similar |
| **Least-privilege RBAC** | Pipeline identity gets only Contributor on target RG, not Owner on subscription |`,
        codeExample: `# GitHub Actions: Build + deploy Bicep to production with approval gate
name: Deploy Infrastructure

on:
  push:
    branches: [main]
    paths: ['infra/**']

jobs:
  what-if:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - run: |
          az deployment group what-if \\
            --resource-group rg-myapp-prod \\
            --template-file infra/main.bicep \\
            --parameters infra/parameters/prod.bicepparam

  deploy:
    needs: what-if
    runs-on: ubuntu-latest
    environment: production   # Requires approval in GitHub Environment settings
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - run: |
          az deployment group create \\
            --resource-group rg-myapp-prod \\
            --template-file infra/main.bicep \\
            --parameters infra/parameters/prod.bicepparam`,
        keyPoints: [
          "OIDC federation eliminates long-lived Azure credentials in GitHub Secrets",
          "Run what-if in CI before production Bicep deployments to preview changes",
          "GitHub Environments and Azure DevOps approval gates protect production",
          "Separate infrastructure pipelines from application pipelines for independent release cycles",
        ],
        warning:
          "Granting a pipeline identity Owner on a subscription is a common but dangerous practice. Use Contributor scoped to the target resource group, and separate identities for dev/staging/prod environments.",
      },
      {
        id: "deployment-strategies",
        title: "Deployment Strategies & IaC at Scale",
        content: `**Infrastructure at enterprise scale** requires patterns beyond single-resource-group deployments. Landing zones, policy guardrails, and automated testing prevent configuration drift.

**Azure Verified Modules (AVM):**
Microsoft-maintained Bicep/Terraform modules with enterprise-grade quality. Use AVM instead of writing raw Bicep for common resources (Key Vault, Storage, VNet, App Service). Published to the public Bicep registry: \`br/public:avm/res/<category>/<resource>:<version>\`.

\`\`\`bicep
module keyVault 'br/public:avm/res/key-vault/vault:0.9.0' = {
  name: 'kv-deployment'
  params: {
    name: 'kv-myapp-prod'
    enableRbacAuthorization: true
    secrets: [
      { name: 'sqlConnectionString', value: sqlConnString }
    ]
  }
}
\`\`\`

**Testing Bicep before deployment:**

| Tool | What it validates | When to run |
|---|---|---|
| \`az bicep build\` | Syntax and compilation to ARM JSON | Every commit (CI) |
| \`az deployment group what-if\` | Resource changes vs current state | Pre-deploy (CI) |
| **PSRule for Azure** | Best practices and compliance rules | CI pipeline |
| **Azure Policy** (DeployIfNotExists) | Runtime compliance after deployment | Continuous |

**PSRule example — catch insecure Storage accounts in CI:**
\`\`\`bash
# Install and run PSRule against compiled Bicep
az bicep build --file main.bicep --outfile main.json
pwsh -c "Invoke-PSRule -InputPath main.json -Module Az.Resources"
\`\`\`

**App Service deployment slots — blue-green for web apps:**

| Feature | Detail |
|---|---|
| **Staging slot** | Identical environment to production for pre-swap validation |
| **Warm-up** | \`WEBSITE_SWAP_WARMUP_PING_PATH\` — hit an endpoint before swap |
| **Auto-swap** | Automatically swap after staging slot passes health checks |
| **Sticky settings** | Slot-specific app settings (e.g., database connection strings) |
| **Rollback** | Swap back instantly — previous production is now staging |

**Deployment flow with slots:**
1. Deploy new version to **staging** slot
2. Run smoke tests against staging URL (\`myapp-staging.azurewebsites.net\`)
3. **Swap** staging ↔ production (zero-downtime, ~10 seconds)
4. Monitor production for 15 minutes
5. If issues: swap back (instant rollback)

**IaC for landing zones — subscription vending pattern:**
Automate the creation of new application subscriptions with pre-configured guardrails:

\`\`\`
Pipeline trigger (new project request)
  → Create subscription via MCA/EA API
  → Assign to management group (inherits policies)
  → Deploy baseline Bicep (VNet, RBAC, diagnostics, Defender)
  → Assign workload team Contributor on their RG
  → Register subscription in CMDB
\`\`\`

**Drift detection and remediation:**

| Approach | Mechanism |
|---|---|
| **Azure Policy (Modify/DeployIfNotExists)** | Automatically fix or deploy missing configurations |
| **Scheduled what-if** | Nightly pipeline compares template vs deployed state |
| **Resource Graph queries** | Find resources missing tags, diagnostics, or encryption |
| **Defender for Cloud recommendations** | Security posture drift from secure baseline |

**Resource Graph — find non-compliant resources:**

\`\`\`kusto
// Resources missing diagnostic settings
Resources
| where type !in~ ('Microsoft.Insights/diagnosticSettings')
| join kind=leftanti (
    ResourceContainers
    | where type == 'microsoft.resources/subscriptions'
) on subscriptionId
| summarize count() by type, resourceGroup
| order by count_ desc
\`\`\``,
        codeExample: `// Bicep: App Service with staging slot for blue-green deployment
param appName string
param location string = resourceGroup().location

resource plan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: '\${appName}-plan'
  location: location
  sku: { name: 'P1v3', tier: 'PremiumV3' }
}

resource app 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  properties: { serverFarmId: plan.id }
}

resource stagingSlot 'Microsoft.Web/sites/slots@2022-09-01' = {
  parent: app
  name: 'staging'
  location: location
  properties: { serverFarmId: plan.id }
}

// Sticky setting: production database connection string stays in production slot
resource stickySetting 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: app
  name: 'slotConfigNames'
  properties: {
    appSettingNames: [ 'DATABASE_CONNECTION_STRING' ]
  }
}`,
        keyPoints: [
          "Azure Verified Modules (AVM) provide enterprise-tested Bicep for common resources",
          "Run what-if + PSRule in CI to catch infrastructure issues before deployment",
          "App Service deployment slots enable zero-downtime blue-green deployments",
          "Subscription vending automates landing zone onboarding with inherited policies",
        ],
        warning:
          "Swapping App Service slots moves production traffic immediately. Always run smoke tests against the staging slot URL and configure warm-up ping paths before swapping. A bad swap with no warm-up can send traffic to a cold, failing instance.",
      },
    ],
    quiz: [
      {
        question: "What is the key difference between Bicep/ARM and Terraform regarding state management?",
        options: [
          "Bicep stores state in Azure Blob Storage",
          "ARM tracks deployed state internally — Bicep has no separate state file",
          "Terraform cannot deploy to Azure Resource Manager",
          "Bicep requires a remote state backend for team collaboration",
        ],
        answer: 1,
        explanation:
          "Azure Resource Manager maintains the deployed resource state. Bicep compiles to ARM JSON and deploys through ARM — there is no separate state file to manage, unlike Terraform's state backend.",
      },
      {
        question: "Why is OIDC federation preferred over storing AZURE_CLIENT_SECRET in GitHub Secrets?",
        options: [
          "OIDC is faster for deployments",
          "OIDC provides short-lived tokens with no long-lived secret to rotate or leak",
          "GitHub Secrets do not support Azure credentials",
          "OIDC is required for Bicep deployments",
        ],
        answer: 1,
        explanation:
          "OIDC federation exchanges a GitHub-issued token for a short-lived Azure access token via a federated identity credential. No client secret is stored, eliminating rotation burden and leak risk.",
      },
      {
        question: "You deploy a Bicep template in complete mode to a resource group that has 10 resources, but the template only defines 3. What happens?",
        options: [
          "Only the 3 defined resources are updated; the other 7 are untouched",
          "The 7 resources not in the template are deleted",
          "Azure returns an error and refuses to deploy",
          "All 10 resources are redeployed from scratch",
        ],
        answer: 1,
        explanation:
          "Complete deployment mode deletes resources in the target scope that are not defined in the template. Incremental mode (the default) leaves unlisted resources untouched.",
      },
      {
        question: "What is the recommended first step before deploying a Bicep template to production in a CI pipeline?",
        options: [
          "Deploy to a temporary resource group and delete it",
          "Run az deployment group what-if to preview changes",
          "Compile with az bicep build and commit the JSON",
          "Request a manual architecture review",
        ],
        answer: 1,
        explanation:
          "what-if shows a color-coded diff of resources to create, modify, or delete — catching unintended deletions before they reach production. It should run automatically in CI on every infrastructure change.",
      },
    ],
  },
];