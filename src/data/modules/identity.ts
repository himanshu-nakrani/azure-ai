import { LearningModule } from "@/lib/types";

export const identityModules: LearningModule[] = [
  {
    slug: "entra-id-rbac",
    category: "identity-security",
    title: "Microsoft Entra ID & RBAC",
    subtitle: "Identity, roles, and access control across Azure resources",
    description:
      "Authentication and authorization foundation — Entra ID, RBAC roles, custom roles, and Managed Identity.",
    difficulty: "foundational",
    duration: "85 min",
    services: ["Microsoft Entra ID", "RBAC", "Managed Identity"],
    sections: [
      {
        id: "entra",
        title: "Entra ID Fundamentals",
        content: `**Microsoft Entra ID** (formerly Azure Active Directory) is the cloud identity and access management platform for Azure, Microsoft 365, and thousands of SaaS apps. Every Azure subscription is bound to exactly one Entra ID tenant — identity is the root of trust for all resource access.

**Core directory objects:**

| Object | Purpose | Typical use |
|---|---|---|
| **User** | Human identity | Employees, contractors — authenticate via password, FIDO2, or federated IdP |
| **Group** | Collection of users/devices/SPs | **Primary RBAC assignment target** — assign permissions to groups, not individuals |
| **Service Principal** | Identity for an application | CI/CD pipelines, automation scripts, registered apps |
| **Managed Identity** | Azure-managed service principal | App Service, Functions, VMs, AKS — no credentials in code |
| **Device** | Registered endpoint | Conditional Access device compliance checks |
| **Guest (B2B)** | External user invited to tenant | Partner access with your policies applied |

**Tenant fundamentals:**
- A **tenant** is an Entra ID directory instance (e.g., \`contoso.onmicrosoft.com\`)
- **Tenant ID** (GUID) is immutable — use it in automation, not the domain name
- **Default directory** vs **custom domain**: verify \`contoso.com\` for branded sign-in
- **Licenses** (P1, P2) unlock Conditional Access, PIM, Identity Protection — plan before production

**Authentication flows (know for AZ-104 / AZ-305):**

| Flow | Who signs in | Use case |
|---|---|---|
| **Authorization code** | User (interactive) | Web apps, SPAs with PKCE |
| **Client credentials** | App only (no user) | Daemon services, CI/CD, background jobs |
| **Device code** | User on secondary device | CLI tools, IoT headless devices |
| **On-behalf-of (OBO)** | App acts for signed-in user | API gateway calling downstream APIs with user context |
| **Managed Identity** | Azure resource | VM/App Service accessing Key Vault, Storage, SQL |

**Managed Identity types:**

| Type | Lifecycle | Sharing | Best for |
|---|---|---|---|
| **System-assigned** | Tied to one Azure resource; deleted with resource | Single resource | One app on one App Service / VM |
| **User-assigned** | Independent Azure resource | Assign to multiple resources | Shared identity across scale set, multiple apps |

**Federation & hybrid identity:**
- **Cloud-only**: Users authenticate directly against Entra ID
- **Federated (AD FS, Ping, etc.)**: On-prem AD validates credentials; Entra ID issues tokens
- **Password hash sync (PHS)**: Password hashes replicated to cloud; Entra ID validates locally — most common hybrid pattern
- **Pass-through authentication (PTA)**: Entra ID forwards auth to on-prem agent — no password in cloud

**Microsoft Entra ID vs Active Directory Domain Services:**
- Entra ID is **identity for cloud** — not a full LDAP replacement for legacy apps
- **Entra Domain Services** provides managed domain controllers for apps needing Kerberos/NTLM/LDAP
- Modern apps should use **OAuth 2.0 / OpenID Connect**, not legacy bind-and-search LDAP

**Production identity hygiene:**
1. **No shared accounts** — every human has a unique UPN
2. **Break-glass accounts** — 2+ cloud-only Global Admin accounts with FIDO2, excluded from CA policies, monitored via alerts
3. **Group-based access** — dynamic groups (e.g., "Department = Engineering") auto-maintain membership
4. **Guest lifecycle** — review B2B guests quarterly; use access packages (Entra ID Governance)`,
        codeExample: `# Register an app and create a service principal (Azure CLI)
az ad app create --display-name "my-cicd-pipeline" \\
  --sign-in-audience AzureADMyOrg

APP_ID=$(az ad app list --display-name "my-cicd-pipeline" --query "[0].appId" -o tsv)

az ad sp create --id $APP_ID

# Assign RBAC at resource group scope to the service principal
az role assignment create \\
  --assignee $APP_ID \\
  --role "Contributor" \\
  --scope /subscriptions/<sub-id>/resourceGroups/my-rg

# Enable system-assigned Managed Identity on App Service
az webapp identity assign \\
  --name my-app \\
  --resource-group my-rg`,
        keyPoints: [
          "Assign RBAC to groups, not individual users — simplifies onboarding/offboarding",
          "Managed Identity eliminates credential storage; prefer over service principal secrets",
          "Service principals with client secrets require rotation — use certificates or federated credentials for CI/CD",
          "Break-glass accounts must be cloud-only, MFA-protected, and excluded from lockout policies",
        ],
        warning:
          "Assigning Global Administrator to daily-use accounts is the most common catastrophic identity mistake. Use PIM for just-in-time elevation and keep permanent Global Admins to break-glass accounts only.",
      },
      {
        id: "rbac",
        title: "Azure RBAC",
        content: `**Azure Role-Based Access Control (RBAC)** authorizes *what* an authenticated identity can do on Azure resources. Authentication (who you are) happens in Entra ID; authorization (what you can do) happens via RBAC.

**Role assignment anatomy:**
Every assignment is **Security principal + Role definition + Scope**. Removing any element revokes access.

| Component | Examples |
|---|---|
| **Security principal** | User, group, service principal, managed identity |
| **Role definition** | Built-in (Reader) or custom (JSON permission set) |
| **Scope** | Management group, subscription, resource group, individual resource |

**Scope hierarchy & inheritance:**

\`\`\`
Tenant root (implicit)
  └── Management Group (e.g., Production)
        └── Subscription (e.g., prod-sub-001)
              └── Resource Group (e.g., rg-web-prod)
                    └── Resource (e.g., storage account)
\`\`\`

Assignments at a parent scope **inherit** to all children. A Reader at the subscription level can read every resource group and resource in that subscription. **Narrow scope = least privilege.**

**Built-in roles — know these for exams and production:**

| Role | Permissions | Grant access? | Production note |
|---|---|---|---|
| **Owner** | Full control + RBAC management | Yes | Avoid for daily ops — use Contributor + separate RBAC admin |
| **Contributor** | Full control, no RBAC | No | Common for dev teams; still very broad |
| **Reader** | Read metadata and data plane (where applicable) | No | Auditors, monitoring tools |
| **User Access Administrator** | Manage RBAC only | Yes | Delegate access management without resource modification |
| **Role Based Access Control Administrator** | Manage RBAC with constraints | Yes | Can prevent Owner self-assignment (newer role) |
| **Storage Blob Data Contributor** | Read/write/delete blobs | No | Data plane — separate from Storage Account Contributor (control plane) |
| **Storage Blob Data Reader** | Read blobs only | No | Analytics, read-only pipelines |
| **Key Vault Secrets User** | Read secrets | No | App Managed Identity pattern |
| **AcrPull** | Pull container images | No | AKS nodes, App Service containers |
| **Cognitive Services OpenAI User** | Invoke OpenAI models | No | AI workloads without account admin |

**Control plane vs data plane — critical distinction:**

| Plane | What it controls | Example roles |
|---|---|---|
| **Control plane** | Manage the resource itself | Contributor on Storage Account — can change firewall, delete account |
| **Data plane** | Access data within the resource | Storage Blob Data Contributor — can read/write blobs but not delete the account |

**Production pattern:** Give apps **data plane roles only** at the narrowest scope. A web app reading blobs needs \`Storage Blob Data Reader\` on one container — not Contributor on the storage account.

**Custom role definitions:**
Create when built-in roles are too broad. Defined in JSON with \`Actions\`, \`NotActions\`, \`DataActions\`, \`NotDataActions\`, and \`AssignableScopes\`.

| Property | Meaning |
|---|---|
| **Actions** | Control plane operations allowed (e.g., \`Microsoft.Compute/virtualMachines/read\`) |
| **NotActions** | Exceptions subtracted from Actions |
| **DataActions** | Data plane operations (e.g., \`Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read\`) |
| **AssignableScopes** | Where the role can be assigned — cannot assign broader than this |

**Deny assignments** (Azure Blueprints / explicit deny): Override RBAC allows. Rare but important — a Deny at MG level blocks even Owner. Use for regulatory guardrails.

**ABAC (Attribute-Based Access Control)** — preview:
Add **conditions** to role assignments (e.g., "Reader only if resource tag Environment=Dev"). Reduces role proliferation without custom roles for every scenario.

**RBAC troubleshooting checklist:**
1. **Who** — Check effective assignments: Portal → Resource → Access control (IAM) → Check access
2. **What role** — Control plane vs data plane role?
3. **Which scope** — Assignment at sibling RG does not apply
4. **Propagation delay** — RBAC changes can take **5–10 minutes** to propagate
5. **PIM activation** — Eligible assignment requires activation before permissions apply
6. **Guest user** — B2B guest may need explicit consent or cross-tenant settings`,
        codeExample: `// Bicep: Least-privilege role assignment for Managed Identity
param storageAccountName string
param managedIdentityPrincipalId string

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

resource blobReaderRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, managedIdentityPrincipalId, 'b7e15162-6a57-4e8c-9c4d-1b3c8e4a1f92')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1') // Storage Blob Data Reader
    principalId: managedIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// Custom role definition (JSON fragment)
{
  "Name": "Virtual Machine Operator",
  "AssignableScopes": ["/subscriptions/<sub-id>"],
  "Actions": [
    "Microsoft.Compute/virtualMachines/read",
    "Microsoft.Compute/virtualMachines/start/action",
    "Microsoft.Compute/virtualMachines/restart/action",
    "Microsoft.Compute/virtualMachines/powerOff/action"
  ],
  "NotActions": [],
  "DataActions": [],
  "NotDataActions": []
}`,
        keyPoints: [
          "Scope hierarchy: MG → subscription → RG → resource — assign at the narrowest workable scope",
          "Data plane roles (e.g., Storage Blob Data Contributor) do not grant control plane access",
          "RBAC propagation takes up to 10 minutes — wait before concluding a fix failed",
          "Custom roles when built-in roles expose too many Actions — test with 'effective permissions'",
        ],
        warning:
          "Granting Contributor or Owner at subscription scope to a service principal used in CI/CD gives it the ability to delete every resource in the subscription. Scope CI/CD identities to specific resource groups and use data plane roles where possible.",
      },
      {
        id: "managed-identity-pim",
        title: "Managed Identity, PIM & Conditional Access",
        content: `Production Azure identity architecture combines **Managed Identity** for workloads, **Privileged Identity Management (PIM)** for human admin access, and **Conditional Access** for sign-in policy enforcement.

**Managed Identity — implementation patterns:**

| Scenario | Identity type | RBAC assignment |
|---|---|---|
| Single App Service | System-assigned | Key Vault Secrets User on vault |
| AKS pod | Workload Identity (user-assigned) | Storage Blob Data Contributor on account |
| VMSS (10 identical VMs) | User-assigned (shared) | AcrPull on container registry |
| Azure DevOps → Azure | Federated credential (OIDC) | Contributor on target RG — no secret |
| GitHub Actions → Azure | Federated credential | Scoped to repo + branch |

**DefaultAzureCredential chain** (Azure SDK): Tries environment variables → Managed Identity → Azure CLI → VS Code. In Azure-hosted apps, Managed Identity is selected automatically when enabled.

**Workload Identity vs legacy Pod Identity (AKS):**
- **Workload Identity** (recommended): OIDC federation between AKS and Entra ID — no daemon on nodes
- Assign Kubernetes service account to a user-assigned Managed Identity
- Eliminates credential rotation and node-level identity agents

**Privileged Identity Management (PIM)** — requires Entra ID P2:
Transforms permanent privileged assignments into **eligible** (just-in-time) assignments.

| Feature | Benefit |
|---|---|
| **Eligible assignments** | Admin rights inactive until activated |
| **Activation requirements** | MFA, justification, ticket number, approval workflow |
| **Time-bound access** | Auto-expire after 1–8 hours (configurable) |
| **Access reviews** | Quarterly certification that assignments are still needed |
| **Audit trail** | Who activated Owner, when, why |

**Roles to protect with PIM:**
- Global Administrator, Privileged Role Administrator
- Owner, User Access Administrator at subscription/MG scope
- Any custom role with delete or RBAC-write permissions

**Conditional Access (CA)** — the Zero Trust policy engine:
Evaluates every sign-in against policies. If policies conflict, **all must be satisfied** (AND logic across policies, OR within a single policy).

**Common CA policies for Azure admins:**

| Policy | Settings | Purpose |
|---|---|---|
| **Require MFA for admins** | Target: Directory roles | Block password-only admin sign-in |
| **Require compliant device** | Target: All users, cloud apps: Azure Management | Block admin from personal laptop |
| **Block legacy authentication** | Client apps: Exchange ActiveSync, Other clients | Close SMTP/IMAP bypass |
| **Sign-in risk policy** | Identity Protection: medium+ risk → MFA | Respond to leaked credentials |
| **Named locations** | Trusted IPs for office; block unknown countries | Geo-fencing |

**CA + Azure CLI / automation:**
Service principals and Managed Identities are **not subject to Conditional Access** — CA applies to user sign-ins. Protect automation with scoped RBAC, not CA.

**Identity Governance additions:**
- **Access packages**: Self-service request + approval + expiration for group/RBAC membership
- **Entitlement management**: Time-limited access to resources for contractors
- **Lifecycle workflows**: Automate user onboarding (add to groups) and offboarding (remove all access)

**Exam & production synthesis:**
1. Humans → groups → RBAC at narrow scope + PIM for privileged roles
2. Workloads → Managed Identity → data plane RBAC only
3. CI/CD → federated credentials (no secrets) → scoped Contributor
4. Every sign-in → Conditional Access (MFA, compliant device, risk-based)`,
        codeExample: `from azure.identity import DefaultAzureCredential, ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from azure.storage.blob import BlobServiceClient

# DefaultAzureCredential — works locally (az login) and in Azure (Managed Identity)
credential = DefaultAzureCredential()

# Explicit Managed Identity (user-assigned)
# credential = ManagedIdentityCredential(client_id="<user-assigned-client-id>")

# Key Vault — data plane via RBAC (Key Vault Secrets User role)
kv_client = SecretClient(
    vault_url="https://my-vault.vault.azure.net",
    credential=credential
)
db_password = kv_client.get_secret("sql-admin-password").value

# Storage — data plane via RBAC (Storage Blob Data Contributor)
blob_service = BlobServiceClient(
    account_url="https://mystorageaccount.blob.core.windows.net",
    credential=credential
)
container = blob_service.get_container_client("uploads")
blobs = list(container.list_blobs())

# Azure CLI: PIM activation (eligible Owner on subscription)
# az rest --method POST --url "https://management.azure.com/providers/Microsoft.Authorization/roleAssignmentScheduleRequests?api-version=2020-10-01" \\
#   --body '{"properties":{"principalId":"<user-object-id>","roleDefinitionId":"<owner-role-id>","requestType":"SelfActivate","scope":"/subscriptions/<sub-id>","justification":"Emergency fix","scheduleInfo":{"startDateTime":"2026-06-30T00:00:00Z","expiration":{"type":"AfterDuration","duration":"PT2H"}}}}'`,
        keyPoints: [
          "DefaultAzureCredential auto-detects Managed Identity in Azure — no code changes between local and cloud",
          "PIM converts standing admin access to eligible + time-bound — requires Entra ID P2 license",
          "Conditional Access applies to user sign-ins, not service principals or Managed Identities",
          "Federated workload credentials (GitHub Actions, AKS Workload Identity) eliminate secret rotation",
        ],
        warning:
          "Enabling a Conditional Access policy in 'Report-only' mode first is critical. A misconfigured policy blocking all admins from Azure Portal can lock out your entire operations team — always maintain break-glass accounts excluded from CA policies.",
      },
    ],
    quiz: [
      {
        question: "An App Service needs to read secrets from Key Vault. What is the recommended identity and permission pattern?",
        options: [
          "Store the Key Vault client secret in App Service configuration",
          "Enable system-assigned Managed Identity and assign Key Vault Secrets User on the vault",
          "Assign Owner role on the subscription to the App Service",
          "Use a shared service principal with a password that never expires",
        ],
        answer: 1,
        explanation:
          "Managed Identity eliminates stored credentials. Key Vault Secrets User is a data plane role scoped to secret read — not control plane Owner.",
      },
      {
        question: "A user has Reader on a resource group. Can they read blob contents in a storage account in that RG?",
        options: [
          "Yes, Reader includes all data plane access",
          "No, they need a data plane role like Storage Blob Data Reader",
          "Yes, but only if they are in the Global Administrators group",
          "No, Reader only works at subscription scope",
        ],
        answer: 1,
        explanation:
          "Reader is a control plane role. Reading blob data requires a separate data plane role (Storage Blob Data Reader or Contributor).",
      },
      {
        question: "Which scope hierarchy order is correct for RBAC inheritance (broadest to narrowest)?",
        options: [
          "Resource → Resource Group → Subscription → Management Group",
          "Management Group → Subscription → Resource Group → Resource",
          "Subscription → Tenant → Resource Group → Resource",
          "Resource Group → Management Group → Subscription → Resource",
        ],
        answer: 1,
        explanation:
          "RBAC inherits from parent to child: Management Group → Subscription → Resource Group → Resource.",
      },
      {
        question: "What happens when a Conditional Access policy requires MFA for Azure Management and an admin signs in to the portal?",
        options: [
          "Managed Identities are prompted for MFA",
          "The user must satisfy MFA before accessing Azure Management cloud app",
          "Service principals bypass RBAC but not MFA",
          "MFA is only required for Global Administrators",
        ],
        answer: 1,
        explanation:
          "Conditional Access evaluates user sign-ins to cloud apps. Azure Management is a cloud app target. Managed Identities and service principals are not subject to CA policies.",
      },
    ],
  },
  {
    slug: "key-vault-security",
    category: "identity-security",
    title: "Key Vault & Network Security",
    subtitle: "Secrets management, Defender for Cloud, and zero-trust networking",
    description:
      "Secure secrets, keys, and certificates. Network hardening with Defender for Cloud recommendations.",
    difficulty: "intermediate",
    duration: "90 min",
    services: ["Key Vault", "Defender for Cloud", "Azure Firewall"],
    sections: [
      {
        id: "key-vault",
        title: "Azure Key Vault",
        content: `**Azure Key Vault** is a managed HSM-backed service for **secrets** (passwords, API keys, connection strings), **keys** (encryption, signing), and **certificates** (TLS, code signing). It is the standard secrets backend for Azure workloads.

**Object types:**

| Type | Examples | Typical consumers |
|---|---|---|
| **Secrets** | DB passwords, API keys, storage keys | App Service, Functions, AKS, CI/CD |
| **Keys** | RSA, EC, AES — encryption at rest, signing | Storage CMK, SQL TDE, client-side encryption |
| **Certificates** | TLS certs (auto-renew via DigiCert/GlobalSign integration) | App Gateway, App Service, API Management |

**Access control models:**

| Model | Status | How it works |
|---|---|---|
| **Vault access policy** | Legacy | Per-object permissions per identity (get/list/set/delete) — hard to audit at scale |
| **Azure RBAC** | **Recommended** | Standard RBAC roles: Key Vault Secrets User, Crypto Officer, Certificates Officer, Administrator |

**RBAC roles for Key Vault:**

| Role | Secrets | Keys | Certificates | Admin |
|---|---|---|---|---|
| **Key Vault Administrator** | Full | Full | Full | Full vault config |
| **Key Vault Secrets Officer** | CRUD | — | — | — |
| **Key Vault Secrets User** | Read | — | — | — |
| **Key Vault Crypto Officer** | — | CRUD | — | — |
| **Key Vault Crypto User** | — | Encrypt/decrypt/sign | — | — |
| **Key Vault Certificates Officer** | — | — | CRUD | — |
| **Key Vault Reader** | Metadata only | Metadata only | Metadata only | — |

**Production app pattern:** Assign \`Key Vault Secrets User\` to the app's Managed Identity at vault scope — nothing more.

**Soft delete & purge protection:**

| Feature | Default | Behavior |
|---|---|---|
| **Soft delete** | On (since 2020) | Deleted objects recoverable for **90 days** |
| **Purge protection** | Off (enable for prod) | Prevents permanent purge even by Owner — mandatory for compliance |

**Recovery scenarios:**
- Accidental delete → recover within 90-day retention window
- Ransomware attempt to purge secrets → purge protection blocks permanent deletion
- **Gotcha:** You cannot disable purge protection once enabled

**Key Vault references (App Service / Functions):**
Store a reference (\`@Microsoft.KeyVault(SecretUri=...)\`) in app settings instead of the secret value. The platform resolves it at runtime using Managed Identity — secret never appears in portal app settings UI as plaintext.

**Logging & monitoring:**
- Enable **Diagnostic settings** → Log Analytics: AuditEvent, AllMetrics
- Alert on: mass secret deletion, access from unexpected IPs, vault policy changes
- Integrate with **Microsoft Defender for Key Vault** for anomaly detection

**HSM-backed keys:**
- **Standard tier**: Software-protected keys
- **Premium tier**: Keys in HSM (FIPS 140-2 Level 2 validated)
- **Managed HSM** (separate service): FIPS 140-2 Level 3 — full key control, single-tenant HSM pools

**Rotation strategies:**
| Secret type | Rotation approach |
|---|---|
| **Manual secrets** | Set expiration date; alert 30 days before; automate with Functions + Event Grid |
| **Storage account keys** | Key Vault + rotation function regenerates keys on schedule |
| **TLS certificates** | Auto-renewal policy in Key Vault (issue 30 days before expiry) |
| **CMK for Storage/SQL** | Key Vault key version rotation — services support automatic version update |`,
        codeExample: `from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.keyvault.keys import KeyClient
from azure.keyvault.certificates import CertificateClient

credential = DefaultAzureCredential()
vault_url = "https://my-vault.vault.azure.net"

# Secrets — requires Key Vault Secrets User
secret_client = SecretClient(vault_url=vault_url, credential=credential)
db_conn = secret_client.get_secret("db-connection-string")
print(f"Secret version: {db_conn.properties.version}")

# Set secret with expiration (rotation reminder)
from datetime import datetime, timedelta, timezone
secret_client.set_secret(
    "api-key",
    "rotated-value-here",
    expires_on=datetime.now(timezone.utc) + timedelta(days=90)
)

# Keys — requires Key Vault Crypto User
key_client = KeyClient(vault_url=vault_url, credential=credential)
key = key_client.get_key("storage-cmk-key")

# Bicep: Key Vault with RBAC, soft delete, purge protection
// resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
//   name: 'my-vault'
//   location: resourceGroup().location
//   properties: {
//     sku: { family: 'A', name: 'standard' }
//     tenantId: subscription().tenantId
//     enableRbacAuthorization: true
//     enableSoftDelete: true
//     softDeleteRetentionInDays: 90
//     enablePurgeProtection: true
//     networkAcls: {
//       defaultAction: 'Deny'
//       bypass: 'AzureServices'
//       virtualNetworkRules: [{ id: subnetId }]
//     }
//   }
// }`,
        keyPoints: [
          "RBAC authorization model is recommended over legacy vault access policies",
          "Enable purge protection on all production vaults — irreversible once on",
          "Key Vault Secrets User for apps — never Key Vault Administrator for workloads",
          "Use Key Vault references in App Service so secrets never sit in app settings plaintext",
        ],
        warning:
          "Deleting a Key Vault without understanding soft-delete means the vault name remains reserved for 90 days and cannot be immediately reused. In production, disable purge capability only with governance approval and break-glass recovery documented.",
      },
      {
        id: "defender",
        title: "Defender for Cloud & Zero Trust",
        content: `**Microsoft Defender for Cloud** (formerly Azure Security Center) is a cloud-native CNAPP that provides a **Secure Score**, security recommendations, threat detection, and regulatory compliance dashboards across Azure, hybrid, and multi-cloud workloads.

**Defender plans (enable per resource type):**

| Plan | Protects | Key detections |
|---|---|---|
| **Defender for Servers** | VMs, ARC servers | Brute force, malware, fileless attacks, OS vulnerabilities |
| **Defender for App Service** | Web apps | Cryptomining, web shell injection |
| **Defender for Storage** | Blob, file, ADLS | Unusual access patterns, malware upload |
| **Defender for SQL** | Azure SQL, SQL on VM | SQL injection, brute force, vulnerability assessment |
| **Defender for Key Vault** | Key Vault | Unusual secret access, mass enumeration from suspicious IPs |
| **Defender for Containers** | AKS, ACR, hosts | Image vulnerabilities, runtime threats |
| **Defender CSPM** | Cloud posture | Attack path analysis, governance, agentless scanning |

**Secure Score mechanics:**
- Score = percentage of security controls implemented vs recommended
- Recommendations ranked by **impact on score** and **risk severity**
- Not a compliance certification — a prioritization tool for remediation backlogs
- **Attack path analysis** (CSPM): Maps how an attacker could traverse from internet exposure to crown-jewel data

**Workflow for production teams:**
1. Enable Defender plans on all production subscriptions
2. Connect **Log Analytics** workspace for centralized alerts
3. Triage **High/Critical** recommendations weekly
4. Assign remediation to resource owners via **workflow automation** or Defender for Cloud email
5. Track Secure Score trend month-over-month — regressions indicate drift

**Regulatory compliance dashboard:**
Built-in assessments for **CIS Azure Foundations**, **PCI-DSS 4.0**, **ISO 27001**, **SOC 2**, **NIST SP 800-53**, **HIPAA**. Each maps failed recommendations to control IDs — export for auditors.

**Zero Trust on Azure — three pillars applied:**

| Pillar | Azure implementation |
|---|---|
| **1. Verify explicitly** | Entra ID authentication + MFA + Conditional Access + device compliance |
| **2. Use least privilege** | RBAC at narrow scope + PIM for admin + JIT network access |
| **3. Assume breach** | Micro-segmentation (NSGs, ASGs), encryption (CMK, TLS), continuous monitoring (Defender, Sentinel) |

**Just-In-Time (JIT) VM access** (Defender for Servers):
- Lock down management ports (22, 3389, custom) by default via NSG
- Request time-bound port opening with MFA and approval
- Auto-close after expiry — eliminates always-open SSH/RDP attack surface

**Microsoft Sentinel integration:**
Defender alerts feed into Sentinel for correlation across identity (Entra ID), network (Firewall logs), and data (Key Vault audit). Build **analytics rules** for multi-stage attack detection.

**Common Defender recommendations for identity workloads:**

| Recommendation | Remediation |
|---|---|
| Key Vault without purge protection | Enable purge protection |
| Key Vault publicly accessible | Private Endpoint + disable public access |
| Management ports open to Internet | JIT access or Bastion |
| SQL without Entra ID auth | Configure Entra admin, disable SQL auth |
| No MFA for admin accounts | Conditional Access policy |

**Cost note:** Defender plans are per-resource billing (e.g., per server, per Key Vault). Budget for production — the cost of one breach exceeds Defender licensing.`,
        codeExample: `# Enable Defender for Key Vault on a subscription (Azure CLI)
az security pricing create \\
  --name KeyVaults \\
  --tier Standard

# List high-severity recommendations for Key Vault
az security assessment list \\
  --query "[?properties.resourceDetails.source=='KeyVault' && properties.status.code=='Unhealthy'].{name:displayName, severity:properties.metadata.severity, remediation:properties.metadata.remediationDescription}" \\
  -o table

# Enable JIT VM access rule via REST/Portal equivalent (Bicep fragment)
// resource jitPolicy 'Microsoft.Security/locations/jitPolicies@2015-01-01' = {
//   name: 'default'
//   properties: {
//     virtualMachines: [{
//       id: vmResourceId
//       ports: [
//         { number: 22, protocol: 'Tcp', allowedSourceAddressPrefix: '*', maxRequestAccessDuration: 'PT3H' }
//       ]
//     }]
//   }
// }

# Export Secure Score trend (Azure Resource Graph)
az graph query -q "securityresources | where type == 'microsoft.security/securescores' | project name, properties.score.current"`,
        keyPoints: [
          "Secure Score prioritizes remediation — focus on High/Critical identity and network findings first",
          "Defender for Key Vault detects anomalous secret access patterns and mass enumeration",
          "JIT VM access eliminates permanently open management ports on production VMs",
          "Zero Trust requires all three pillars — identity alone without network segmentation fails",
        ],
        warning:
          "Defender for Cloud generates many recommendations — do not blindly enable every auto-remediation. Policies like 'auto-provision Log Analytics agent' can restart VMs during business hours. Test remediation in non-production subscriptions first.",
      },
      {
        id: "network-hardening",
        title: "Key Vault Network Security & Private Endpoints",
        content: `Key Vault network hardening is essential for production — a vault with secrets is a **crown jewel**. Combine **network isolation**, **Private Endpoints**, and **firewall rules** so secrets are never reachable from the public internet.

**Key Vault network security layers:**

| Layer | Control | Effect |
|---|---|---|
| **Public network access** | Disable entirely | Vault unreachable from internet even with RBAC |
| **Firewall (IP rules)** | Allow specific IPs/CIDRs | DevOps agents, office egress IPs |
| **Virtual network rules** | Allow specific subnets | App Service integration subnet, AKS subnet |
| **Private Endpoint** | Private IP in your VNet | DNS resolves vault FQDN to 10.x.x.x |
| **RBAC** | Data plane authorization | Even on the network, must have Secrets User role |

**Recommended production architecture:**
1. **Disable public network access** on the vault
2. Deploy **Private Endpoint** in a dedicated \`snet-security\` or \`snet-data\` subnet
3. Link **Private DNS zone** \`privatelink.vaultcore.azure.net\` to the VNet
4. Assign \`Key Vault Secrets User\` to consumer Managed Identities
5. NSG on PE subnet: allow 443 inbound only from app subnets
6. Enable **Defender for Key Vault** for anomaly detection

**Private Endpoint DNS resolution:**

| DNS zone | When to use |
|---|---|
| \`privatelink.vaultcore.azure.net\` | Default for all Key Vaults |
| \`privatelink.vault.azure.net\` | Legacy — some docs reference this; verify your vault SKU |

Without Private DNS, apps resolve the vault public IP and connections fail when public access is disabled.

**Azure Firewall & Key Vault:**
If apps in spoke VNets access Key Vault via Private Endpoint in a hub:
- Private Endpoint in hub or spoke data subnet
- UDRs route \`privatelink\` traffic correctly (stays on VNet backbone)
- **Application rules** not needed for Private Endpoint traffic — it stays private
- Firewall **FQDN tags** apply only to outbound internet traffic, not Private Link

**Service endpoints vs Private Endpoints for Key Vault:**

| Factor | Service Endpoint | Private Endpoint |
|---|---|---|
| **Network path** | Traffic to Azure public IP over backbone | Private IP in your subnet |
| **Public access** | Can still be enabled | Designed for public access disabled |
| **On-prem access** | Via ExpressRoute/VPN to VNet | Via ExpressRoute/VPN to VNet |
| **Microsoft recommendation** | Legacy | **Preferred** |

**Trusted services bypass:**
\`AzureServices\` bypass allows specific Microsoft services (e.g., App Service with Key Vault reference + Managed Identity) to access the vault even when firewall is locked down. **Do not rely on this alone** — combine with RBAC and Private Endpoint.

**Azure Firewall — broader zero-trust networking:**

| Capability | Identity/security relevance |
|---|---|
| **FQDN filtering** | Control which external APIs workloads call with secrets |
| **Threat intelligence** | Block known malicious IPs exfiltrating stolen tokens |
| **IDPS** | Inspect traffic for credential theft patterns |
| **Forced tunneling** | All egress through inspection — secrets cannot phone home unchecked |
| **DNAT rules** | Publish services without exposing management ports |

**Hub-spoke pattern for secrets access:**

\`\`\`
[App Service in spoke] --MI+RBAC--> [PE: Key Vault in hub/data subnet]
       |                                      |
       +--- VNet integration subnet ---------> Private DNS zone
\`\`\`

**Troubleshooting Key Vault network failures:**

| Symptom | Likely cause |
|---|---|
| 403 Forbidden (public) | Public access disabled; no PE or firewall rule |
| DNS resolves to public IP | Private DNS zone not linked to app VNet |
| Timeout from App Service | VNet integration not routed to PE subnet |
| Works locally, fails in Azure | Local IP in firewall rule; Azure uses different egress |
| Managed Identity 403 | Missing RBAC role, not network issue — check role assignment |

**Disaster recovery for Key Vault:**
- **Vault name is globally unique** — document recovery procedures
- Soft-deleted vault recovery: \`az keyvault recover\`
- **Geo-redundancy**: Key Vault metadata is regional; plan backup of secret *values* in secondary region vault for DR (automation required — Azure does not auto-replicate secrets)`,
        codeExample: `# Create Private Endpoint for Key Vault (Azure CLI)
VAULT_ID=$(az keyvault show --name my-vault --query id -o tsv)
SUBNET_ID=$(az network vnet subnet show \\
  --vnet-name my-vnet --name snet-private-endpoints \\
  --resource-group my-rg --query id -o tsv)

az network private-endpoint create \\
  --name pe-keyvault \\
  --resource-group my-rg \\
  --vnet-name my-vnet \\
  --subnet snet-private-endpoints \\
  --private-connection-resource-id $VAULT_ID \\
  --group-id vault \\
  --connection-name kv-connection

# Private DNS zone + VNet link
az network private-dns zone create \\
  --resource-group my-rg \\
  --name privatelink.vaultcore.azure.net

az network private-dns link vnet create \\
  --resource-group my-rg \\
  --zone-name privatelink.vaultcore.azure.net \\
  --name kv-dns-link \\
  --virtual-network my-vnet \\
  --registration-enabled false

# Disable public access (final hardening step — do after PE validated)
az keyvault update --name my-vault --public-network-access Disabled

# Bicep: Private Endpoint + DNS zone group
// resource pe 'Microsoft.Network/privateEndpoints@2023-05-01' = {
//   name: 'pe-keyvault'
//   location: resourceGroup().location
//   properties: {
//     subnet: { id: subnetId }
//     privateLinkServiceConnections: [{
//       name: 'kv-conn'
//       properties: {
//         privateLinkServiceId: keyVault.id
//         groupIds: ['vault']
//       }
//     }]
//   }
// }`,
        keyPoints: [
          "Disable public network access and use Private Endpoint for production Key Vault",
          "Private DNS zone privatelink.vaultcore.azure.net is required for name resolution",
          "Network controls and RBAC are complementary — both must pass for access",
          "Validate PE connectivity from app subnets before disabling public access",
        ],
        warning:
          "Disabling Key Vault public network access before Private Endpoint DNS is working from every consumer (App Service, AKS, CI/CD agents) causes immediate secret retrieval failures and application outages. Always test with 'public access disabled' in a staging vault first.",
      },
    ],
    quiz: [
      {
        question: "Which Key Vault authorization model does Microsoft recommend for new vaults?",
        options: [
          "Vault access policies with per-secret permissions",
          "Azure RBAC with roles like Key Vault Secrets User",
          "Shared access signatures (SAS)",
          "Storage account access keys",
        ],
        answer: 1,
        explanation:
          "Azure RBAC is the recommended model. It integrates with standard role assignment, PIM, and access reviews at scale.",
      },
      {
        question: "What does enabling purge protection on a Key Vault prevent?",
        options: [
          "Soft delete of secrets",
          "Permanent deletion of secrets/vault during the retention period",
          "RBAC role assignments",
          "Private Endpoint connections",
        ],
        answer: 1,
        explanation:
          "Purge protection prevents permanent purge of soft-deleted objects and the vault itself until retention expires — even by subscription Owner.",
      },
      {
        question: "An App Service with Managed Identity cannot reach Key Vault after public access was disabled. The most likely missing component is:",
        options: [
          "Key Vault Administrator role on the vault",
          "Private Endpoint with Private DNS zone linked to the App Service VNet",
          "Enabling purge protection",
          "Upgrading to Key Vault Premium tier",
        ],
        answer: 1,
        explanation:
          "With public access disabled, apps need Private Endpoint connectivity and correct DNS resolution. RBAC (Secrets User) is also required but the question describes a network failure after disabling public access.",
      },
      {
        question: "Which Defender for Cloud capability provides time-bound opening of VM management ports?",
        options: [
          "Secure Score",
          "Just-In-Time (JIT) VM access",
          "Attack path analysis",
          "Regulatory compliance dashboard",
        ],
        answer: 1,
        explanation:
          "JIT VM access locks management ports by default and opens them only for a requested duration after approval/MFA.",
      },
    ],
  },
];