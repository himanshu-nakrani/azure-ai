import { LearningModule } from "@/lib/types";

export const governanceModules: LearningModule[] = [
  {
    slug: "resource-manager",
    category: "governance",
    title: "Resource Manager & Landing Zones",
    subtitle: "Subscriptions, resource groups, tags, and enterprise-scale design",
    description:
      "Organize Azure at enterprise scale. Management groups, subscriptions, resource groups, and the CAF landing zone model.",
    difficulty: "foundational",
    duration: "100 min",
    services: ["ARM", "Management Groups", "Resource Groups", "Tags"],
    sections: [
      {
        id: "hierarchy",
        title: "Resource Hierarchy & Management Groups",
        content: `**Azure Resource Manager (ARM)** is the deployment and management layer for all Azure resources. Understanding the hierarchy is essential for enterprise governance, cost allocation, and access control.

**The Azure resource hierarchy:**

\`\`\`
Tenant (Entra ID)
└── Management Group (root: Tenant Root Group)
    └── Management Group (e.g., "Contoso")
        ├── Management Group (e.g., "Platform")
        │   ├── Management Group (e.g., "Connectivity")
        │   └── Management Group (e.g., "Management")
        ├── Management Group (e.g., "Landing Zones")
        │   ├── Management Group (e.g., "Corp")
        │   └── Management Group (e.g., "Online")
        └── Management Group (e.g., "Sandbox")
            └── Management Group (e.g., "Decommissioned")
                └── Subscription
                    └── Resource Group
                        └── Resources
\`\`\`

**Management groups — policy and RBAC inheritance:**

| Capability | Detail |
|---|---|
| **Hierarchy depth** | Up to 6 levels (root + 5 child levels) |
| **Inheritance** | Policies and RBAC assigned at a parent MG apply to all descendants |
| **Subscription limit** | 10,000 subscriptions per tenant (soft limit) |
| **MG limit** | 10,000 management groups per tenant |

**Common enterprise management group structure (CAF-aligned):**

| Management group | Purpose | Typical subscriptions |
|---|---|---|
| **Platform** | Shared services operated by the platform team | Connectivity, Identity, Management |
| **Landing Zones** | Workload subscriptions for application teams | Corp (internal apps), Online (customer-facing) |
| **Sandbox** | Experimentation with relaxed policies | Individual developer sandboxes |
| **Decommissioned** | Retired subscriptions pending deletion | Deny-all policies applied |

**Subscriptions — the billing and access boundary:**

| Aspect | Detail |
|---|---|
| **Billing** | Each subscription generates its own invoice (or rolls up to MCA/EA enrollment) |
| **RBAC scope** | Role assignments at subscription level apply to all RGs and resources within |
| **Policy scope** | Policies assigned at subscription override nothing from parent MG — they add to inherited policies |
| **Quota** | Service quotas (VM cores, storage accounts) are per subscription per region |
| **Recommendation** | Use multiple subscriptions to isolate environments and teams, not one subscription for everything |

**Resource groups — the lifecycle and RBAC container:**

| Property | Detail |
|---|---|
| **Membership** | A resource belongs to exactly one RG (cannot move between RGs without redeployment for some types) |
| **Region** | RG has a location (metadata region), but resources inside can be in any region |
| **Deletion** | Deleting an RG deletes ALL contained resources — cascading delete |
| **Locks** | CanNotDelete and ReadOnly locks prevent accidental deletion or modification |
| **RBAC** | Assign roles at RG scope for team-level access control |

**Resource locks — prevent accidental deletion:**

| Lock type | Effect |
|---|---|
| **CanNotDelete** | Resources can be modified but not deleted. RG can be deleted only after removing the lock. |
| **ReadOnly** | Resources cannot be modified or deleted. Equivalent to read-only access for everyone. |

Apply CanNotDelete locks on production resource groups. Apply ReadOnly locks on compliance-critical resources (e.g., diagnostic settings, policy assignments).

**Tags — metadata for cost, automation, and compliance:**

| Tag key | Example values | Purpose |
|---|---|---|
| \`environment\` | dev, staging, prod | Cost allocation, policy targeting |
| \`costCenter\` | CC-1234 | Chargeback to business unit |
| \`owner\` | team-platform@contoso.com | Accountability and contact |
| \`application\` | order-processing | Group resources by workload |
| \`dataClassification\` | public, internal, confidential | Compliance and security policies |
| \`createdBy\` | iac-pipeline | Distinguish IaC-managed from portal-created |

**Tag inheritance (preview):**
Resource groups can propagate tags to child resources automatically. Combined with Azure Policy "Require tag" rules, this ensures consistent tagging without manual effort.`,
        codeExample: `// Bicep: Management group hierarchy + subscription placement
targetScope = 'tenant'

@description('Display name for the landing zone management group')
param landingZoneMgName string = 'Corp'

resource tenantRootMg 'Microsoft.Management/managementGroups@2021-04-01' existing = {
  name: 'Tenant Root Group'
}

resource landingZoneMg 'Microsoft.Management/managementGroups@2021-04-01' = {
  name: landingZoneMgName
  properties: {
    displayName: 'Corporate Landing Zones'
    details: {
      parent: {
        id: tenantRootMg.id
      }
    }
  }
}

// Move subscription into the landing zone management group
resource subAssociation 'Microsoft.Management/managementGroups/subscriptions@2021-04-01' = {
  name: subscription().subscriptionId
  scope: landingZoneMg
}`,
        keyPoints: [
          "Management groups inherit policies and RBAC down the hierarchy — design the tree before deploying workloads",
          "Subscriptions are the billing and quota boundary — use multiple subscriptions to isolate environments",
          "CanNotDelete locks on production resource groups prevent cascading accidental deletion",
          "Tags are critical for cost allocation — enforce with Azure Policy, not manual effort",
        ],
        warning:
          "Deleting a resource group deletes every resource inside it — databases, storage, VMs, everything. Always apply CanNotDelete locks on production RGs and require IaC or pipeline-based RG deletion with approval gates.",
      },
      {
        id: "landing-zones",
        title: "Landing Zones & CAF",
        content: `A **landing zone** is a pre-configured Azure environment built on the **Cloud Adoption Framework (CAF)** — Microsoft's prescriptive guidance for enterprise cloud adoption.

**CAF adoption methodology — five phases:**

| Phase | Focus | Key deliverables |
|---|---|---|
| **Strategy** | Business justification, cloud-first policy | Business case, migration motivation |
| **Plan** | Digital estate inventory, team skills | Adoption plan, landing zone design |
| **Ready** | Landing zone deployment, governance baseline | Platform LZ, identity integration |
| **Adopt** | Workload migration or innovation | Application landing zones |
| **Govern** | Policy, cost, security operations | Policy initiatives, FinOps, compliance |
| **Manage** | Day-2 operations, monitoring, backup | Monitor, backup, DR runbooks |
| **Secure** | Zero-trust, threat protection | Defender, Private Link, encryption |

**Landing zone types:**

| Type | Owner | Purpose | Components |
|---|---|---|---|
| **Platform landing zone** | Central platform/IAM team | Shared services for all workloads | Hub VNet, Firewall, DNS, Monitor, Identity |
| **Application landing zone** | Application/workload team | Isolated environment for a specific app | Spoke VNet, app resources, workload RBAC |
| **Sandbox landing zone** | Individual developers | Experimentation with guardrails | Minimal policies, auto-cleanup, spend caps |

**Platform landing zone — core components:**

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                  Platform Landing Zone                   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Connectivity │  │   Identity   │  │  Management   │  │
│  │              │  │              │  │               │  │
│  │ Hub VNet     │  │ Entra ID     │  │ Log Analytics │  │
│  │ Azure FW     │  │ PIM          │  │ Automation    │  │
│  │ VPN/ER GW    │  │ RBAC         │  │ Backup vault  │  │
│  │ Private DNS  │  │ Groups       │  │ Update Mgmt   │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Security   │  │  Governance  │  │     FinOps    │  │
│  │              │  │              │  │               │  │
│  │ Defender     │  │ Azure Policy │  │ Cost Mgmt     │  │
│  │ Key Vault    │  │ Blueprints   │  │ Budgets         │  │
│  │ Sentinel     │  │ Locks        │  │ Tagging policy  │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
\`\`\`

**Hub-spoke networking in landing zones:**
- **Hub VNet** (in Connectivity subscription): Azure Firewall, VPN/ExpressRoute Gateway, Bastion, Private DNS zones
- **Spoke VNets** (in Application subscriptions): Workload resources peered to the hub
- **IP plan**: Centralized IPAM — allocate CIDR blocks per subscription before deployment
- **DNS**: Private DNS zones in the hub, linked to all spoke VNets

**Azure Landing Zone Accelerator:**
Microsoft-maintained Bicep and Terraform templates that deploy a complete enterprise-ready platform landing zone. Modules include:

| Module | Deploys |
|---|---|
| **Management** | Log Analytics, Automation Account, AMPLS |
| **Connectivity** | Hub VNet, Azure Firewall, VPN/ER Gateway, DDoS |
| **Identity** | RBAC assignments, PIM configuration guidance |
| **Security** | Defender plans, Key Vault, diagnostic settings |
| **Governance** | Policy assignments (CIS, ISO, custom initiatives) |

**Subscription vending — automated LZ onboarding:**

\`\`\`
1. Application team submits request (ServiceNow / self-service portal)
2. Platform pipeline creates subscription under correct MG
3. Baseline Bicep deploys: VNet peering, RBAC, diagnostics, Defender, policies
4. Team gets Contributor on their resource groups
5. Subscription registered in Azure Resource Graph / CMDB
\`\`\`

**Design areas and responsible teams (RACI):**

| Design area | Platform team | Workload team |
|---|---|---|
| Management groups & subscriptions | Accountable | Informed |
| Networking (hub) | Accountable | Consumes |
| Networking (spoke) | Consulted | Accountable |
| Identity & RBAC | Accountable (platform roles) | Accountable (app roles) |
| Policy & compliance | Accountable | Complies |
| Monitoring & alerting | Accountable (platform) | Accountable (app-level) |
| Cost management | Accountable (budgets) | Accountable (optimization) |`,
        codeExample: `// Bicep: Application landing zone spoke VNet peered to platform hub
param hubVnetId string
param spokeVnetName string = 'vnet-app-spoke'
param spokeAddressPrefix string = '10.1.0.0/16'
param location string = resourceGroup().location

resource spokeVnet 'Microsoft.Network/virtualNetworks@2023-05-01' = {
  name: spokeVnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [ spokeAddressPrefix ]
    }
    subnets: [
      {
        name: 'snet-app'
        properties: { addressPrefix: '10.1.1.0/24' }
      }
      {
        name: 'snet-data'
        properties: { addressPrefix: '10.1.2.0/24' }
      }
    ]
  }
}

resource spokeToHubPeering 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2023-05-01' = {
  parent: spokeVnet
  name: 'spoke-to-hub'
  properties: {
    remoteVirtualNetwork: { id: hubVnetId }
    allowVirtualNetworkAccess: true
    allowForwardedTraffic: true
    useRemoteGateways: true
  }
}`,
        keyPoints: [
          "CAF provides the enterprise adoption roadmap — Strategy → Plan → Ready → Adopt → Govern",
          "Platform landing zones deliver shared services; application landing zones isolate workloads",
          "Hub-spoke networking with centralized firewall and DNS is the standard enterprise pattern",
          "Subscription vending automates onboarding with inherited policies and baseline infrastructure",
        ],
        warning:
          "Deploying workloads before the platform landing zone (hub VNet, DNS, monitoring, policies) is ready forces expensive retrofitting. Always establish the platform LZ first, then onboard application teams via subscription vending.",
      },
      {
        id: "rbac-tags-operations",
        title: "RBAC, Tag Governance & Day-2 Operations",
        content: `**Role-Based Access Control (RBAC)** determines who can do what on which resources. Combined with tags and operational policies, RBAC forms the access and accountability layer of your landing zone.

**Built-in roles — what to assign where:**

| Role | Permissions | Assign at |
|---|---|---|
| **Owner** | Full access + RBAC management | Avoid — use specific roles instead |
| **Contributor** | Create/manage resources, no RBAC | Resource group for workload teams |
| **Reader** | View resources, no modifications | Auditors, monitoring systems |
| **User Access Administrator** | Manage RBAC only | Platform team (PIM-eligible) |
| **Key Vault Secrets User** | Read secrets from Key Vault | Managed identities, pipeline identities |
| **AcrPull** | Pull container images | AKS kubelet identity, App Service |

**Custom roles — when built-in roles are too broad:**
Create custom roles scoped to specific \`actions\` and \`notActions\`:

\`\`\`json
{
  "Name": "App Service Operator",
  "Actions": [
    "Microsoft.Web/sites/Start/Action",
    "Microsoft.Web/sites/Stop/Action",
    "Microsoft.Web/sites/Restart/Action",
    "Microsoft.Web/sites/read",
    "Microsoft.Insights/metrics/read"
  ],
  "NotActions": [],
  "AssignableScopes": ["/subscriptions/<sub-id>"]
}
\`\`\`

**Privileged Identity Management (PIM):**
- **Just-in-time access**: Owner/Contributor roles are eligible, not permanent
- **Approval workflow**: Require manager approval for privileged role activation
- **Time-bound**: Activation expires after 1–8 hours
- **Audit trail**: Every activation logged in Entra ID audit logs

**PIM best practices:**

| Practice | Detail |
|---|---|
| **No permanent Owner** | Break-glass accounts only, stored offline |
| **Eligible vs Active** | Production Contributor should be eligible (requires activation) |
| **MFA on activation** | Require MFA for all privileged role activations |
| **Notification** | Alert security team when Owner role is activated |

**Tag governance with Azure Policy:**

| Policy effect | Tag rule | Behavior |
|---|---|---|
| **Deny** | Require \`environment\` tag on creation | Blocks resource creation without tag |
| **Modify** | Append \`costCenter\` from RG tag | Inherits tag from parent RG automatically |
| **Audit** | Require \`owner\` tag | Reports non-compliance without blocking |

**Tagging policy example (Bicep):**

\`\`\`bicep
// Deny resource creation without required tags
resource requireEnvTag 'Microsoft.Authorization/policyDefinitions@2021-06-01' = {
  name: 'require-environment-tag'
  properties: {
    policyType: 'Custom'
    mode: 'Indexed'
    displayName: 'Require environment tag on resources'
    policyRule: {
      if: {
        allOf: [
          { field: 'tags.environment', exists: false }
          { field: 'type', notIn: [ 'Microsoft.Resources/subscriptions/resourceGroups' ] }
        ]
      }
      then: { effect: 'deny' }
    }
  }
}
\`\`\`

**Azure Resource Graph — operational queries across the estate:**

\`\`\`kusto
// All VMs without monitoring agent across all subscriptions
Resources
| where type == 'microsoft.compute/virtualmachines'
| extend osType = tostring(properties.storageProfile.osDisk.osType)
| join kind=leftanti (
    Heartbeat
    | where TimeGenerated > ago(1d)
    | distinct Computer
) on $left.name == $right.Computer
| project name, resourceGroup, subscriptionId, osType

// Resource groups missing CanNotDelete lock
ResourceContainers
| where type == 'microsoft.resources/subscriptions/resourcegroups'
| join kind=leftanti (
    ResourceChanges
    | where properties.changeType == 'Create'
    | where properties.targetResourceType == 'Microsoft.Authorization/locks'
) on id
| project name, resourceGroup, subscriptionId
\`\`\`

**Day-2 operational checklist for landing zones:**

| Area | Task | Frequency |
|---|---|---|
| **Access review** | PIM eligible role review in Entra ID | Quarterly |
| **Tag compliance** | Run Resource Graph query for untagged resources | Weekly |
| **Policy compliance** | Review non-compliant resources in Policy dashboard | Weekly |
| **Cost review** | Cost analysis by tag (costCenter, environment) | Weekly |
| **Subscription hygiene** | Identify empty or unused subscriptions | Monthly |
| **Lock audit** | Verify CanNotDelete locks on production RGs | Monthly |
| **IPAM update** | Reconcile allocated vs deployed CIDR ranges | Quarterly |`,
        codeExample: `// Bicep: CanNotDelete lock + RBAC assignment for workload team
param teamPrincipalId string  // Entra ID group object ID
param rgName string

resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' existing = {
  name: rgName
}

resource deleteLock 'Microsoft.Authorization/locks@2020-05-01' = {
  scope: rg
  name: 'DoNotDelete'
  properties: {
    level: 'CanNotDelete'
    notes: 'Production resource group — contact platform team for deletion'
  }
}

resource teamContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: rg
  name: guid(rg.id, teamPrincipalId, 'b24988ac-6180-42a0-ab88-20f7382dd24c')
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c')
    principalId: teamPrincipalId
    principalType: 'Group'
  }
}`,
        keyPoints: [
          "Use PIM for just-in-time privileged access — no permanent Owner assignments in production",
          "Enforce tags with Azure Policy Deny/Modify effects, not manual processes",
          "Azure Resource Graph queries span all subscriptions for estate-wide compliance checks",
          "CanNotDelete locks and quarterly access reviews are day-2 operational essentials",
        ],
        warning:
          "Assigning Owner or User Access Administrator permanently to individual users creates standing privileged access. Use PIM eligible assignments with MFA, approval, and time limits. Reserve one break-glass account with permanent Owner, stored offline.",
      },
    ],
    quiz: [
      {
        question: "At which scope are Azure Policy assignments inherited by all child subscriptions?",
        options: ["Resource group", "Management group", "Individual resource", "Resource group lock"],
        answer: 1,
        explanation:
          "Policies assigned at a management group scope inherit down to all child management groups and subscriptions. This is the primary mechanism for enterprise-wide governance.",
      },
      {
        question: "What happens when you delete a resource group containing 15 resources?",
        options: [
          "Only empty resources are deleted; others remain",
          "All 15 resources are deleted in a cascading operation",
          "Azure prompts to move resources to another RG first",
          "Resources are soft-deleted and recoverable for 90 days",
        ],
        answer: 1,
        explanation:
          "Deleting a resource group triggers cascading deletion of all contained resources. CanNotDelete locks on the RG or individual resources prevent this.",
      },
      {
        question: "In the CAF landing zone model, who typically owns the platform landing zone?",
        options: [
          "Each application team independently",
          "A central platform/infrastructure team",
          "Microsoft via Azure managed services",
          "The finance department for cost tracking",
        ],
        answer: 1,
        explanation:
          "The platform landing zone (hub VNet, firewall, DNS, monitoring, identity) is owned and operated by a central platform team. Application teams consume these shared services via their application landing zones.",
      },
      {
        question: "Which RBAC approach is recommended for production Owner/Contributor access?",
        options: [
          "Permanent active assignment to individual user accounts",
          "PIM eligible assignment with just-in-time activation, MFA, and time limits",
          "Shared service account with Contributor on the subscription",
          "Guest accounts with Owner for external consultants",
        ],
        answer: 1,
        explanation:
          "Privileged Identity Management (PIM) provides just-in-time, time-bound activation of privileged roles with MFA and approval workflows — eliminating standing privileged access.",
      },
    ],
  },
  {
    slug: "policy-cost",
    category: "governance",
    title: "Azure Policy & Cost Management",
    subtitle: "Compliance guardrails, budgets, and FinOps practices",
    description:
      "Enforce organizational standards with policies. Track, allocate, and optimize cloud spending.",
    difficulty: "intermediate",
    duration: "105 min",
    services: ["Azure Policy", "Cost Management", "Budgets", "Advisor"],
    sections: [
      {
        id: "policy",
        title: "Azure Policy Deep Dive",
        content: `**Azure Policy** enforces organizational standards at scale. Unlike RBAC (who can do what), Policy controls **what** can be deployed and **how** resources must be configured.

**Policy components:**

| Component | Description | Example |
|---|---|---|
| **Policy definition** | A single rule about resource properties | "Allowed locations: eastus, westeurope" |
| **Initiative (policy set)** | Bundle of related policy definitions | CIS Microsoft Azure Foundations Benchmark |
| **Assignment** | Apply a definition or initiative to a scope | Assign CIS initiative to "Landing Zones" MG |
| **Exemption** | Exclude a specific resource or RG from a policy | Exempt legacy app RG from "require tag" policy |
| **Remediation task** | Fix existing non-compliant resources | Deploy diagnostic settings on existing VMs |

**Policy effects — what happens when a rule matches:**

| Effect | Behavior | Use case |
|---|---|---|
| **Audit** | Log non-compliance, allow the operation | Discovery phase — see violations without blocking |
| **AuditIfNotExists** | Audit if a related resource doesn't exist | "VM exists but no backup policy assigned" |
| **Deny** | Block the non-compliant operation | Prevent public IP creation, restrict regions |
| **Append** | Add a property to the resource | Append required tag value |
| **Modify** | Add/update/remove properties or tags during creation | Auto-apply tags from RG inheritance |
| **DeployIfNotExists** | Deploy a related resource if missing | Auto-deploy diagnostic settings, Defender extension |
| **Disabled** | Rule is recorded but not evaluated | Staged rollout of new policies |

**Recommended policy rollout strategy:**

\`\`\`
Phase 1: Audit effect → review compliance dashboard for 2–4 weeks
Phase 2: Deny effect on new resources → block non-compliant creation
Phase 3: DeployIfNotExists → remediate existing non-compliant resources
Phase 4: Modify → auto-correct tags and configurations on creation
\`\`\`

**Essential policies for every landing zone:**

| Policy | Effect | What it enforces |
|---|---|---|
| **Allowed locations** | Deny | Resources only in approved regions |
| **Require tag (environment)** | Deny | Every resource has environment tag |
| **Require tag (costCenter)** | Deny | Cost allocation metadata |
| **Deploy diagnostic settings** | DeployIfNotExists | All resources send logs to Log Analytics |
| **Enable Defender for Cloud** | DeployIfNotExists | Defender plan on all subscriptions |
| **Deny public IP on NICs** | Deny | No direct internet exposure |
| **Require Private Link** | Audit/Deny | PaaS services use Private Endpoints |
| **Allowed VM SKUs** | Deny | Prevent expensive VM sizes in dev/sandbox |
| **Inherit tag from RG** | Modify | Auto-propagate tags from resource group |

**Policy assignment with parameters (Bicep):**

\`\`\`bicep
targetScope = 'managementGroup'

param allowedLocations array = [ 'eastus', 'westeurope', 'australiaeast' ]

resource allowedLocationsAssignment 'Microsoft.Authorization/policyAssignments@2023-04-01' = {
  name: 'allowed-locations-assignment'
  properties: {
    policyDefinitionId: '/providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-bf8b01975c4c'
    displayName: 'Allowed locations for Contoso'
    parameters: {
      listOfAllowedLocations: { value: allowedLocations }
    }
  }
}
\`\`\`

**Compliance dashboard — monitoring policy adherence:**
- **Overview**: Compliance % per initiative across all assigned scopes
- **Non-compliant resources**: Drill down to specific resources and the violating policy
- **Remediation tasks**: Trigger DeployIfNotExists for existing resources
- **Resource Graph integration**: Query compliance state programmatically

\`\`\`kusto
// Find all non-compliant resources for a specific policy
PolicyResources
| where policyAssignmentId contains 'allowed-locations'
| where complianceState == 'NonCompliant'
| project resourceId, resourceType, complianceState, policyDefinitionAction
\`\`\`

**Exemptions — when policies cannot apply:**

| Exemption type | Duration | Use case |
|---|---|---|
| **Waiver** | Time-limited (max 2 years) | Legacy app cannot comply until migration |
| **Mitigated** | Time-limited | Alternative control in place (e.g., manual review) |

Always document exemption reason and expiry. Review exemptions quarterly — expired exemptions auto-reenable policy evaluation.`,
        codeExample: `// Bicep: Custom policy to deny public storage account access
resource denyPublicStorage 'Microsoft.Authorization/policyDefinitions@2021-06-01' = {
  name: 'deny-public-storage-access'
  properties: {
    policyType: 'Custom'
    mode: 'Indexed'
    displayName: 'Deny public blob access on storage accounts'
    description: 'Prevents storage accounts from allowing public blob access'
    policyRule: {
      if: {
        allOf: [
          { field: 'type', equals: 'Microsoft.Storage/storageAccounts' }
          {
            field: 'Microsoft.Storage/storageAccounts/blobServices/default.publicAccess'
            notEquals: 'None'
          }
        ]
      }
      then: { effect: 'deny' }
    }
  }
}

resource storagePolicyAssignment 'Microsoft.Authorization/policyAssignments@2023-04-01' = {
  name: 'deny-public-storage'
  properties: {
    policyDefinitionId: denyPublicStorage.id
    displayName: 'Deny public storage access in production'
    enforcementMode: 'Default'
  }
}`,
        keyPoints: [
          "Start with Audit effect to discover violations, then escalate to Deny for enforcement",
          "Initiatives bundle related policies — assign CIS or ISO benchmarks as a single unit",
          "DeployIfNotExists remediates existing resources; Modify auto-corrects on creation",
          "Review policy exemptions quarterly — expired exemptions reenable enforcement automatically",
        ],
        warning:
          "Applying Deny policies without an Audit discovery phase blocks legitimate deployments and creates urgent exemption requests. Always run Audit for 2–4 weeks first, remediate what you can, then switch to Deny.",
      },
      {
        id: "cost",
        title: "Cost Management & FinOps",
        content: `**FinOps** (Cloud Financial Operations) is the practice of bringing financial accountability to cloud spending. Azure Cost Management provides the tools; FinOps provides the process.

**The FinOps lifecycle:**

| Phase | Activities | Azure tools |
|---|---|---|
| **Inform** | Visibility, allocation, benchmarking | Cost analysis, Cost alerts, Exports |
| **Optimize** | Right-sizing, reservations, waste removal | Advisor, Reservation recommendations, Savings Plans |
| **Operate** | Budgets, policies, rate optimization | Budgets, Policy (allowed SKUs), MCA/EA pricing |

**Cost analysis — understanding your spend:**

| View | What it shows | Action |
|---|---|---|
| **By service** | Which Azure services cost the most | Identify top 5 cost drivers |
| **By resource group** | Spend per team/project | Chargeback and showback |
| **By tag (costCenter)** | Spend per business unit | Finance reporting |
| **By location** | Regional cost distribution | Data residency and egress costs |
| **Daily trend** | Spend velocity over time | Detect anomalies early |
| **Forecast** | Projected month-end spend | Proactive budget adjustments |

**Cost allocation requires tags — the FinOps foundation:**

\`\`\`
Without tags: "We spent $500K on Azure this month" (unhelpful)
With tags:    "Engineering spent $200K (40%), Marketing $150K (30%),
               Platform $100K (20%), Sandbox $50K (10%)"
\`\`\`

Enforce \`costCenter\`, \`environment\`, and \`owner\` tags via Azure Policy before workloads deploy. Untagged resources appear as "unallocated" — a growing unallocated percentage is a governance failure.

**Budgets — proactive spend control:**

| Setting | Recommendation |
|---|---|
| **Scope** | One budget per subscription (or per costCenter tag) |
| **Amount** | Base on 3-month rolling average + 10% growth |
| **Alert thresholds** | 50% (informational), 80% (warning), 100% (critical), 120% (forecast) |
| **Action group** | Email team lead at 80%, escalate to finance at 100% |
| **Filter by tag** | Separate budgets for dev vs prod using environment tag |

**Budget alerts do NOT stop spending** — they notify only. To block spend, use Azure Policy (deny expensive SKUs) or subscription spending limits (EA/MCA only).

**Cost optimization — Azure Advisor recommendations:**

| Recommendation type | Typical savings | Effort |
|---|---|---|
| **Right-size underutilized VMs** | 20–40% per VM | Low — resize in maintenance window |
| **Delete unattached disks** | $5–50/month per disk | Low — verify unattached, delete |
| **Delete unused Public IPs** | $3–5/month per IP | Low |
| **Reserved Instances / Savings Plans** | 20–65% on compute | Medium — analyze 30-day usage first |
| **Azure Hybrid Benefit** | Up to 40% on Windows/SQL VMs | Low — apply existing licenses |
| **Spot VMs for fault-tolerant workloads** | Up to 90% | Medium — handle eviction |
| **Storage tier optimization** | 50%+ on cold data | Low — move to Cool/Archive tier |

**Reserved Instances vs Savings Plans:**

| Factor | Reserved Instances | Savings Plans |
|---|---|---|
| **Commitment** | Specific VM family + region | Dollar amount per hour |
| **Flexibility** | Low — tied to specific SKU | High — applies to any compute |
| **Savings** | Up to 72% (3-year) | Up to 65% (3-year) |
| **Scope** | Single subscription or shared | Shared across tenant |
| **Recommendation** | Stable, predictable workloads | Mixed workloads, dev+prod |

**FinOps operational cadence:**

| Cadence | Activity | Participants |
|---|---|---|
| **Weekly** | Review cost dashboard, investigate anomalies | Engineering leads |
| **Monthly** | Chargeback report by costCenter tag | Finance + engineering |
| **Quarterly** | Right-sizing review, reservation analysis | Platform team + finance |
| **Annually** | Reserved Instance / Savings Plan renewal | Finance + procurement |`,
        codeExample: `// Bicep: Budget with multi-threshold alerts
param budgetAmount int = 10000
param contactEmail string = 'finops@contoso.com'
param startDate string = '2026-06-01'

resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: 'monthly-subscription-budget'
  scope: subscription()
  properties: {
    category: 'Cost'
    amount: budgetAmount
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: startDate
      endDate: '2027-05-31'
    }
    filter: {
      tags: {
        name: 'environment'
        operator: 'In'
        values: [ 'prod' ]
      }
    }
    notifications: {
      warning80: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 80
        contactEmails: [ contactEmail ]
        contactRoles: [ 'Owner', 'Contributor' ]
      }
      critical100: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        contactEmails: [ contactEmail, 'cfo@contoso.com' ]
      }
      forecast120: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 120
        thresholdType: 'Forecasted'
        contactEmails: [ contactEmail ]
      }
    }
  }
}`,
        keyPoints: [
          "Tags are the foundation of FinOps — enforce costCenter and environment tags with Azure Policy",
          "Budget alerts notify but do not block spending — combine with policy guardrails for hard limits",
          "Review Advisor recommendations monthly — unattached disks and idle VMs are common waste",
          "Savings Plans offer more flexibility than Reserved Instances for mixed workloads",
        ],
        warning:
          "Budget alerts are notifications only — they will not stop a runaway deployment or crypto-mining breach from spending your entire annual budget in days. Combine budgets with Azure Policy (deny expensive SKUs, allowed locations) and anomaly detection alerts in Cost Management.",
      },
      {
        id: "finops-advanced",
        title: "Advanced FinOps & Cost Governance at Scale",
        content: `**Enterprise FinOps** goes beyond dashboards and budgets. At scale, you need automated governance, cross-subscription visibility, and integration with financial systems.

**MCA/EA enrollment management:**

| Billing account type | Cost visibility | Optimization levers |
|---|---|---|
| **Microsoft Customer Agreement (MCA)** | Billing profiles, invoice sections | Reservations at billing profile scope |
| **Enterprise Agreement (EA)** | Departments, accounts, enrollment | EA pricing, commitment tiers |
| **CSP (Cloud Solution Provider)** | Partner-managed billing | Partner discounts, managed services |
| **Pay-as-you-go** | Per-subscription | No commitment discounts |

**Cross-subscription cost reporting with Resource Graph:**

\`\`\`kusto
// Top 10 most expensive resource types across the entire tenant
ResourceContainers
| where type == 'microsoft.resources/subscriptions'
| join kind=inner (
    Resources
    | extend sku = tostring(sku.name)
    | summarize ResourceCount = count() by type, sku
) on subscriptionId
| order by ResourceCount desc
| take 10
\`\`\`

**Cost Management exports — integrate with finance systems:**

| Export type | Format | Destination | Use case |
|---|---|---|---|
| **Daily cost export** | CSV | Storage account | Power BI dashboards, ERP integration |
| **Focus export** | FOCUS format (FinOps standard) | Storage account | Cross-cloud cost normalization |
| **Amortized vs actual** | CSV | Storage account | RI/Savings Plan chargeback |

Configure exports at the billing account scope to capture all subscriptions in one file. Use Managed Identity for authentication to the destination storage account.

**Automated cost governance with Azure Policy:**

| Policy | Effect | Savings mechanism |
|---|---|---|
| **Allowed VM SKUs** | Deny | Block NV-series GPUs in dev subscriptions |
| **Require auto-shutdown tag** | Audit | Identify VMs that should shut down nights/weekends |
| **Deny premium disk in dev** | Deny | Force Standard SSD in non-production |
| **Enforce storage lifecycle** | DeployIfNotExists | Auto-tier blobs to Cool/Archive after N days |
| **Require zone-redundant only in prod** | Deny | Prevent unnecessary ZRS costs in dev |

**Anomaly detection and cost alerts:**

| Alert type | Trigger | Response |
|---|---|---|
| **Cost anomaly** | Daily spend > 2x 7-day average | Investigate immediately — possible breach or misconfiguration |
| **Budget threshold** | 80% of monthly budget consumed | Review top resources, consider scaling down |
| **Reservation utilization** | RI utilization < 80% | Exchange or modify reservation |
| **Tag compliance** | > 10% unallocated spend | Enforce tagging policy, backfill tags |

**Showback vs chargeback:**

| Model | How it works | When to use |
|---|---|---|
| **Showback** | Report costs to teams without financial transfer | Early FinOps maturity — build awareness |
| **Chargeback** | Actual financial charge to business unit cost centers | Mature FinOps — teams own their spend |
| **Hybrid** | Showback for shared platform, chargeback for application subscriptions | Most enterprise landing zones |

**Unit economics — measure cost per business metric:**

\`\`\`
Cost per transaction = Monthly Azure spend / Monthly transactions
Cost per user       = Monthly Azure spend / Monthly active users
Cost per API call   = Monthly Azure spend / Monthly API requests
\`\`\`

Track unit economics monthly. If cost per transaction grows while transaction volume is flat, you have an efficiency problem — not just a total spend problem.

**FinOps maturity assessment:**

| Level | Characteristics |
|---|---|
| **Crawl** | Basic cost visibility, manual tagging, monthly reviews |
| **Walk** | Enforced tagging, budgets with alerts, quarterly right-sizing |
| **Run** | Automated policies, chargeback, unit economics, anomaly detection |
| **Fly** | Predictive forecasting, auto-scaling policies, continuous optimization |`,
        codeExample: `// Bicep: Cost Management export to storage for Power BI integration
param storageAccountId string
param storageContainerName string = 'cost-exports'

resource costExport 'Microsoft.CostManagement/exports@2023-11-01' = {
  name: 'daily-cost-export'
  scope: subscription()
  properties: {
    schedule: {
      status: 'Active'
      recurrence: 'Daily'
      recurrencePeriod: {
        from: '2026-06-01T00:00:00Z'
        to: '2027-05-31T00:00:00Z'
      }
    }
    format: 'Csv'
    deliveryInfo: {
      destination: {
        resourceId: storageAccountId
        container: storageContainerName
        rootFolderPath: 'cost-management'
      }
    }
    definition: {
      type: 'ActualCost'
      timeframe: 'MonthToDate'
      dataSet: {
        granularity: 'Daily'
      }
    }
    dataOverwriteBehavior: 'OverwritePreviousReport'
  }
}`,
        keyPoints: [
          "Cost Management exports feed Power BI and ERP systems for enterprise financial integration",
          "Anomaly detection catches runaway spend from breaches or misconfigurations faster than monthly reviews",
          "Unit economics (cost per transaction/user) reveal efficiency problems that total spend hides",
          "Combine Policy guardrails (allowed SKUs, disk types) with budgets for defense-in-depth cost control",
        ],
        warning:
          "Unallocated spend (resources without costCenter tags) typically grows to 15–30% of total Azure spend in untagged environments. If your unallocated percentage exceeds 5%, prioritize tag enforcement policies before any optimization effort — you cannot optimize what you cannot attribute.",
      },
    ],
    quiz: [
      {
        question: "What is the recommended first step when rolling out a new Azure Policy across the enterprise?",
        options: [
          "Assign with Deny effect immediately to enforce compliance",
          "Assign with Audit effect, review compliance for 2–4 weeks, then escalate to Deny",
          "Create exemptions for all existing resources first",
          "Deploy via Bicep in complete mode to overwrite existing policies",
        ],
        answer: 1,
        explanation:
          "Starting with Audit lets you discover the scope of non-compliance without blocking legitimate operations. After reviewing violations and remediating what you can, escalate to Deny for enforcement.",
      },
      {
        question: "Which policy effect automatically deploys a missing resource (e.g., diagnostic settings) on existing VMs?",
        options: ["Audit", "Deny", "Modify", "DeployIfNotExists"],
        answer: 3,
        explanation:
          "DeployIfNotExists evaluates whether a related resource exists (e.g., diagnostic setting) and deploys it if missing. This is the primary mechanism for remediating existing non-compliant resources.",
      },
      {
        question: "Budget alerts in Azure Cost Management will:",
        options: [
          "Automatically shut down resources when the budget is exceeded",
          "Notify configured contacts but not prevent further spending",
          "Deny new resource creation in the subscription",
          "Transfer excess costs to a backup subscription",
        ],
        answer: 1,
        explanation:
          "Budget alerts are notification-only. They inform configured contacts at threshold percentages but do not block deployments or stop running resources. Combine with Policy for hard guardrails.",
      },
      {
        question: "Your organization has 20% unallocated spend (resources without costCenter tags). What should you prioritize?",
        options: [
          "Purchase Reserved Instances to reduce total spend",
          "Enforce tagging policies and backfill tags on existing resources",
          "Delete all untagged resources immediately",
          "Switch from pay-as-you-go to Enterprise Agreement pricing",
        ],
        answer: 1,
        explanation:
          "You cannot optimize or chargeback spend you cannot attribute. Enforcing tags via Azure Policy (Deny on creation, Modify for inheritance) and backfilling existing resources is the prerequisite for all other FinOps activities.",
      },
    ],
  },
];