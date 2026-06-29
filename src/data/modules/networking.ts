import { LearningModule } from "@/lib/types";

export const networkingModules: LearningModule[] = [
  {
    slug: "virtual-networks",
    category: "networking",
    title: "Virtual Networks & NSGs",
    subtitle: "VNet design, subnets, peering, and network security groups",
    description:
      "Foundation of Azure networking — address spaces, subnets, NSG rules, route tables, and VNet peering.",
    difficulty: "foundational",
    duration: "110 min",
    services: ["Virtual Network", "NSG", "Route Tables", "VNet Peering"],
    sections: [
      {
        id: "vnet-design",
        title: "VNet Architecture",
        content: `A **Virtual Network (VNet)** is your private network boundary in Azure. Every resource that needs private IP connectivity — VMs, App Service (VNet integration), Private Endpoints, AKS nodes — lives inside a VNet or connects to one.

**IP address planning (do this first):**

| Planning area | Production guidance |
|---|---|
| **Address space** | Use RFC 1918 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16). Document every VNet CIDR in a central IPAM spreadsheet before deploying anything. |
| **Overlap avoidance** | Must not overlap on-premises, partner VPNs, other clouds, or future acquisitions. Overlap blocks peering and forces NAT workarounds. |
| **Growth headroom** | Size subnets larger than today's needs. Adding a new VNet is easy; expanding an existing address space after workloads are deployed is painful. |
| **Regional strategy** | One VNet per region per environment (e.g., prod-eastus, prod-westeurope) is common. Hub-spoke centralizes shared services. |

**Subnet design patterns:**

| Subnet type | Naming requirement | Minimum size | Typical workloads |
|---|---|---|---|
| **Application** | Any name | /24 or larger | App servers, AKS nodes, App Service integration |
| **Data** | Any name | /24 or larger | Databases, Private Endpoints for PaaS |
| **GatewaySubnet** | Must be exactly \`GatewaySubnet\` | /27 (larger for multi-tunnel VPN) | VPN Gateway, ExpressRoute Gateway |
| **AzureBastionSubnet** | Must be exactly \`AzureBastionSubnet\` | /26 minimum | Azure Bastion host |
| **AzureFirewallSubnet** | Must be exactly \`AzureFirewallSubnet\` | /26 | Azure Firewall |
| **Delegated** | Any name | Service-specific | App Service, Container Instances, PostgreSQL Flexible Server |

**Service Endpoints vs Private Endpoints — decision framework:**

| Factor | Service Endpoints | Private Endpoints |
|---|---|---|
| **Traffic path** | Routes to PaaS public IP over Azure backbone | PaaS gets a private IP in your subnet |
| **Data exfiltration protection** | Limited — can restrict to specific VNets | Strong — resource only reachable via private IP |
| **DNS** | Public DNS unchanged | Requires Private DNS Zone |
| **Cost** | Free | Per-endpoint hourly charge + data processing |
| **Microsoft recommendation** | Legacy pattern | **Preferred** for production zero-trust |

**Hub-spoke topology** is the standard enterprise pattern:
- **Hub VNet**: Azure Firewall, VPN/ER Gateway, Bastion, shared DNS, monitoring
- **Spoke VNets**: Workload isolation per team, app, or environment
- **Peering**: Hub ↔ each spoke (bidirectional). Spoke-to-spoke traffic routes through the hub firewall for inspection and transitive connectivity.

**Production gotchas:**
- Subnet delegation locks the subnet to a specific service — you cannot deploy VMs into a delegated subnet meant for PostgreSQL Flexible Server.
- Azure reserves 5 IPs per subnet (first 4 + last 1). A /24 gives you 251 usable addresses, not 256.
- VNet peering is **non-transitive**: if Spoke A peers to Hub and Spoke B peers to Hub, Spoke A cannot reach Spoke B unless the hub provides routing (Azure Firewall, NVA, or route server).`,
        keyPoints: [
          "Document all CIDR ranges in IPAM before any deployment — overlap is expensive to fix",
          "Private Endpoints are the preferred PaaS connectivity pattern for production",
          "Hub-spoke with Azure Firewall enables transitive routing and centralized security",
          "Reserved subnet names (GatewaySubnet, AzureBastionSubnet) are enforced by Azure",
        ],
        warning:
          "Deploying workloads before finalizing IP addressing is the #1 cause of costly VNet redesigns. Changing a VNet address space after peering, VPN, or Private Endpoints exist requires migration downtime.",
      },
      {
        id: "nsg",
        title: "Network Security Groups",
        content: `**NSGs** filter traffic at Layer 4 (protocol, source/destination IP, port). They are stateful — if inbound traffic is allowed, the return outbound traffic is automatically permitted.

**Where to apply NSGs:**

| Attachment point | Scope | Best for |
|---|---|---|
| **Subnet** | All NICs in the subnet | Baseline rules for a tier (e.g., deny all inbound from Internet on data subnet) |
| **NIC** | Single VM or NIC | Per-VM exceptions without affecting neighbors |
| **Both** | Combined evaluation | Defense in depth — subnet baseline + NIC-specific rules |

When both subnet and NIC NSGs apply, **each NSG is evaluated independently**. Traffic must pass both. Effective rules in the portal show the combined result.

**Rule evaluation order:**
1. Rules are evaluated by **priority number** (lowest number = highest precedence)
2. First matching rule wins — processing stops
3. Default rules (priorities 65000–65500) cannot be deleted:
   - Allow VNet inbound/outbound
   - Allow Azure Load Balancer inbound
   - Deny all inbound from Internet
   - Deny all outbound to Internet

**Rule design best practices:**

| Practice | Why |
|---|---|
| **Deny by default, allow explicitly** | Aligns with zero-trust; start with no inbound from Internet on app/data subnets |
| **Use ASGs over IP lists** | VMs can be added/removed from ASGs without changing rules |
| **Keep priority gaps** (100, 200, 300) | Room to insert rules later without renumbering everything |
| **Separate inbound/outbound rules** | Outbound rules are often forgotten — exfiltration risk |
| **Enable NSG flow logs** | Required for troubleshooting "why can't X reach Y?" |

**Application Security Groups (ASGs):**
Group VMs by role (web-tier, api-tier, data-tier) instead of by IP address. NSG rules reference ASGs as source or destination. When you scale out VMs, assign the ASG on the NIC — rules apply automatically.

**NSG + Azure Firewall:**
NSGs operate at L4 within a VNet. Azure Firewall adds L3–L7 inspection, FQDN filtering, threat intelligence, and centralized logging. In hub-spoke, NSGs on spokes enforce micro-segmentation; the firewall in the hub enforces egress and inter-spoke policy.

**Troubleshooting checklist:**
1. Check **Effective security rules** on the NIC in the portal
2. Verify NSG flow logs in Traffic Analytics — is traffic reaching the NSG?
3. Confirm the rule priority — a Deny at priority 100 overrides an Allow at priority 200
4. Check for overlapping subnet + NIC NSGs both denying
5. Remember: NSGs do not filter traffic between VMs on the same subnet by default (same-subnet traffic bypasses NSG unless you have specific configurations)`,
        codeExample: `// NSG rule with Application Security Groups (ARM/Bicep JSON fragment)
{
  "name": "Allow-HTTPS-Inbound",
  "properties": {
    "priority": 100,
    "direction": "Inbound",
    "access": "Allow",
    "protocol": "Tcp",
    "sourcePortRange": "*",
    "destinationPortRange": "443",
    "sourceAddressPrefix": "Internet",
    "destinationApplicationSecurityGroups": [
      { "id": "/subscriptions/.../applicationSecurityGroups/web-tier-asg" }
    ]
  }
}

// Deny all inbound from Internet on data subnet (defense in depth)
{
  "name": "Deny-Internet-Inbound",
  "properties": {
    "priority": 4096,
    "direction": "Inbound",
    "access": "Deny",
    "protocol": "*",
    "sourcePortRange": "*",
    "destinationPortRange": "*",
    "sourceAddressPrefix": "Internet",
    "destinationAddressPrefix": "*"
  }
}`,
        keyPoints: [
          "Subnet and NIC NSGs are both evaluated — traffic must pass each independently",
          "Lower priority number = higher precedence; first match wins",
          "ASGs decouple security rules from IP addresses — essential for auto-scaling tiers",
          "NSG flow logs + Traffic Analytics are mandatory for production troubleshooting",
        ],
        warning:
          "A Deny rule at a lower priority number (e.g., 100) silently overrides an Allow rule at a higher number (e.g., 200). Always leave gaps between priority numbers and test with NSG flow logs before production cutover.",
      },
      {
        id: "route-tables-peering",
        title: "Route Tables & VNet Peering",
        content: `**User-Defined Routes (UDRs)** override Azure's default system routes. Attach a **Route Table** to a subnet to control where traffic is sent.

**Azure default system routes (every subnet):**

| Destination | Next hop | Notes |
|---|---|---|
| VNet address space | Virtual network | Local VNet traffic |
| 0.0.0.0/0 (Internet) | Internet (or firewall if configured) | Default egress |
| Azure services (Storage, SQL tags) | Virtual network service endpoint or Internet | Depends on service endpoint config |

**Common UDR patterns:**

| Pattern | Route | Next hop | Use case |
|---|---|---|---|
| **Forced tunneling** | 0.0.0.0/0 | Virtual appliance (firewall IP) | All egress through inspection |
| **Spoke → Hub** | 0.0.0.0/0 | Azure Firewall private IP in hub | Centralized egress from spokes |
| **NVA routing** | Specific CIDRs | Virtual appliance | Legacy third-party firewall |
| **BGP-learned** | On-prem prefixes | VPN/ER Gateway | Hybrid connectivity (automatic) |

**Route table gotcha:** UDRs apply to **subnet**, not individual NICs. Every resource in the subnet inherits the routes. Plan subnet boundaries around routing needs.

**VNet Peering** connects two VNets so resources communicate as if on the same network (private IP, no gateway required for peering itself).

| Peering type | Scope | Gateway transit |
|---|---|---|
| **Regional peering** | Same region | Supported — spoke can use hub's gateway |
| **Global peering** | Cross-region | Supported with gateway transit |
| **Peering to remote VNet** | Created on both sides | Both sides must be configured |

**Peering settings to configure:**

| Setting | Recommendation |
|---|---|
| **Allow forwarded traffic** | Enable on hub when spokes send traffic through hub firewall |
| **Allow gateway transit** | Enable on hub peering — lets spokes use hub VPN/ER gateway |
| **Use remote gateway** | Enable on spoke peering — spoke routes on-prem traffic via hub gateway |
| **Allow virtual network access** | Enable (default) — required for basic peering connectivity |

**Transitive routing problem:** Peering alone does not provide spoke-to-spoke connectivity. Solutions:
1. **Azure Firewall** in hub with peering + UDRs on spokes pointing 0.0.0.0/0 and inter-spoke CIDRs to firewall
2. **Azure Route Server** with NVAs for dynamic BGP route exchange
3. **Mesh peering** (every spoke peers to every other spoke — does not scale past ~10 spokes)

**VNet Peering limits:** Non-transitive by design. Max 500 peerings per VNet (soft limit, can increase). Bandwidth up to 10 Gbps+ depending on VM resources. No bandwidth charge for intra-region peering; egress charges apply for cross-region global peering data transfer.

**Troubleshooting peering connectivity:**
1. Verify peering status is **Connected** on **both** sides
2. Check NSGs are not blocking traffic between peered address spaces (default allows VNet inbound, but custom Deny rules break this)
3. Confirm UDRs on the source subnet route traffic to the correct next hop
4. Use **Network Watcher → Connection troubleshoot** for hop-by-hop analysis
5. For global peering, confirm both VNets have non-overlapping address spaces`,
        codeExample: `// Bicep: Hub-spoke peering with route table forcing traffic through firewall
param hubVnetName string
param spokeVnetName string
param firewallPrivateIp string = '10.0.1.4'

resource hubVnet 'Microsoft.Network/virtualNetworks@2023-05-01' existing = {
  name: hubVnetName
}

resource spokeVnet 'Microsoft.Network/virtualNetworks@2023-05-01' existing = {
  name: spokeVnetName
}

resource hubToSpokePeering 'Microsoft.Network/virtualNetworks/virtualNetworkPeerings@2023-05-01' = {
  parent: hubVnet
  name: 'hub-to-spoke'
  properties: {
    remoteVirtualNetwork: { id: spokeVnet.id }
    allowVirtualNetworkAccess: true
    allowForwardedTraffic: true
    allowGatewayTransit: true
  }
}

resource spokeRouteTable 'Microsoft.Network/routeTables@2023-05-01' = {
  name: 'spoke-udr'
  location: resourceGroup().location
  properties: {
    routes: [
      {
        name: 'default-via-firewall'
        properties: {
          addressPrefix: '0.0.0.0/0'
          nextHopType: 'VirtualAppliance'
          nextHopIpAddress: firewallPrivateIp
        }
      }
    ]
  }
}`,
        keyPoints: [
          "UDRs on subnets override system routes — forced tunneling sends all egress through firewall",
          "Peering must be configured on both sides and show Connected status",
          "Gateway transit lets spokes use the hub VPN/ER gateway without deploying their own",
          "Use Network Watcher Connection troubleshoot for peering and routing failures",
        ],
        warning:
          "Enabling 'Use remote gateway' on a spoke prevents that spoke from deploying its own VPN Gateway. Plan gateway topology before peering — this setting cannot coexist with a local gateway.",
      },
    ],
    quiz: [
      {
        question: "Which connectivity method gives an Azure PaaS resource a private IP address inside your VNet?",
        options: ["Service Endpoint", "Private Endpoint", "VNet Peering", "Service Endpoint Policy"],
        answer: 1,
        explanation:
          "Private Endpoints assign a private IP from your subnet to the PaaS resource. Service Endpoints route to the PaaS public endpoint over the Azure backbone but do not assign a private IP.",
      },
      {
        question: "Two spoke VNets both peer to a hub VNet but not to each other. Can Spoke A reach Spoke B directly?",
        options: [
          "Yes, peering is automatically transitive",
          "No, unless the hub provides routing (firewall/NVA/UDRs)",
          "Yes, but only within the same availability zone",
          "No, peering only works within the same resource group",
        ],
        answer: 1,
        explanation:
          "VNet peering is non-transitive. Spoke-to-spoke traffic requires a hub firewall, route server, or direct spoke-to-spoke peering.",
      },
      {
        question: "An NSG has an Allow rule at priority 200 and a Deny rule at priority 100 for the same traffic. What happens?",
        options: [
          "The Allow rule wins because Allow takes precedence",
          "Both rules apply and traffic is load-balanced",
          "The Deny rule wins because lower priority number = higher precedence",
          "Azure merges the rules and allows partial traffic",
        ],
        answer: 2,
        explanation:
          "NSG rules are evaluated by priority number — lowest number wins. A Deny at priority 100 is evaluated before an Allow at priority 200, so traffic is denied.",
      },
      {
        question: "What is the minimum recommended size for AzureBastionSubnet?",
        options: ["/28", "/27", "/26", "/24"],
        answer: 2,
        explanation:
          "AzureBastionSubnet requires a minimum of /26. GatewaySubnet requires a minimum of /27.",
      },
    ],
  },
  {
    slug: "load-balancing",
    category: "networking",
    title: "Load Balancing & Traffic Management",
    subtitle: "Load Balancer, Application Gateway, and Front Door",
    description:
      "Distribute traffic across resources at Layer 4 and Layer 7. Global routing, WAF, and SSL termination.",
    difficulty: "intermediate",
    duration: "100 min",
    services: ["Load Balancer", "Application Gateway", "Front Door", "Traffic Manager"],
    sections: [
      {
        id: "lb-vs-agw",
        title: "Load Balancer vs Application Gateway",
        content: `Azure offers multiple load balancing services at different OSI layers. Choosing the wrong one means missing features you need or paying for complexity you don't.

**Feature comparison:**

| Feature | Azure Load Balancer | Application Gateway |
|---|---|---|
| **OSI layer** | L4 (TCP/UDP) | L7 (HTTP/HTTPS) |
| **Protocols** | TCP, UDP, SCTP | HTTP, HTTPS, HTTP/2, WebSocket |
| **SSL/TLS termination** | No (pass-through) | Yes — offload TLS from backends |
| **URL/path routing** | No | Yes — route /api/* to pool A, /static/* to pool B |
| **Host-based routing** | No | Yes — api.contoso.com vs www.contoso.com |
| **WAF** | No | Yes (WAF_v2 SKU only) |
| **Session affinity** | 5-tuple (default), 2-tuple, 3-tuple hash | Cookie-based affinity |
| **Backend targets** | VMs, VMSS, IP addresses | VMs, VMSS, App Service, containers, FQDNs |
| **Health probes** | TCP, HTTP, HTTPS | HTTP, HTTPS (per-backend settings) |
| **SKU** | Standard (production), Gateway (cross-region) | Standard_v2, WAF_v2 |
| **Scaling** | Up to 1000 instances per pool | Autoscale (min 0–100+ instances) |
| **Static IP** | Frontend gets static public or private IP | Public IP or private frontend (internal AGW) |

**When to choose which:**

| Scenario | Service |
|---|---|
| Non-HTTP traffic (SQL, custom TCP, gaming UDP) | Load Balancer |
| Internal HA for microservices (gRPC over TCP) | Internal Load Balancer |
| Public web app with URL routing and SSL termination | Application Gateway |
| Web app needing OWASP WAF protection | Application Gateway WAF_v2 |
| Cross-region L4 load balancing | Cross-region Load Balancer (Global tier) |

**Load Balancer types:**

| Type | Frontend | Use case |
|---|---|---|
| **Public LB** | Public IP or IP prefix | Internet-facing services |
| **Internal LB** | Private IP in VNet | Internal service HA (e.g., internal API behind ILB) |
| **Gateway Load Balancer** | Private IP | Insert third-party NVAs (firewalls, IDS) in traffic flow |
| **Cross-region LB** | Static public IP (anycast-like) | Multi-region L4 with health-based failover |

**Outbound connectivity:** Standard Load Balancer uses **Outbound Rules** or **default outbound SNAT** (limited to 1024 ports per frontend IP). Production apps with high outbound connection counts need explicit Outbound Rules with multiple frontend IPs or NAT Gateway.

**Application Gateway v2 highlights:**
- Zone-redundant by default (deployed across 2+ zones)
- Autoscaling — no manual instance count management
- **Backend pools** can point to App Service, external FQDNs, or IP addresses
- **Rewrite rules** — modify HTTP headers, URLs at the gateway
- **Private frontend** — internal Application Gateway for hub-spoke ingress without public IP

**Health probe troubleshooting:**

| Symptom | Common cause |
|---|---|
| All backends unhealthy | Probe path/port mismatch; NSG blocking probe traffic from AzureLoadBalancer tag |
| Intermittent unhealthy | Probe timeout too aggressive; backend slow to respond |
| LB not distributing traffic | Single healthy backend; session affinity pinning all traffic to one instance |`,
        codeExample: `// Bicep: Standard Load Balancer with HTTP health probe
resource lb 'Microsoft.Network/loadBalancers@2023-05-01' = {
  name: 'web-lb'
  location: location
  sku: { name: 'Standard' }
  properties: {
    frontendIPConfigurations: [
      {
        name: 'public-fe'
        properties: {
          publicIPAddress: { id: publicIp.id }
        }
      }
    ]
    probes: [
      {
        name: 'http-probe'
        properties: {
          protocol: 'Http'
          port: 80
          requestPath: '/health'
          intervalInSeconds: 5
          numberOfProbes: 2
        }
      }
    ]
    loadBalancingRules: [
      {
        name: 'https-rule'
        properties: {
          frontendIPConfiguration: { id: resourceId('Microsoft.Network/loadBalancers/frontendIPConfigurations', 'web-lb', 'public-fe') }
          backendAddressPool: { id: resourceId('Microsoft.Network/loadBalancers/backendAddressPools', 'web-lb', 'web-pool') }
          probe: { id: resourceId('Microsoft.Network/loadBalancers/probes', 'web-lb', 'http-probe') }
          protocol: 'Tcp'
          frontendPort: 443
          backendPort: 443
        }
      }
    ]
  }
}`,
        keyPoints: [
          "Load Balancer for L4 (TCP/UDP); Application Gateway for L7 (HTTP/HTTPS) features",
          "WAF is only available on Application Gateway WAF_v2 — not on Load Balancer",
          "NSGs must allow traffic from AzureLoadBalancer tag for health probes to succeed",
          "Plan outbound SNAT — default 1024 ports per frontend IP causes exhaustion at scale",
        ],
        warning:
          "Health probes originate from Azure infrastructure (tag: AzureLoadBalancer). If your NSG denies inbound from this tag, all backends show as unhealthy and no traffic is distributed.",
      },
      {
        id: "front-door",
        title: "Azure Front Door & Traffic Manager",
        content: `**Azure Front Door** (Standard/Premium) is a global L7 reverse proxy and CDN at Azure edge PoPs. It terminates client connections at the nearest edge and routes to regional backends over the Microsoft backbone.

**Front Door capabilities:**

| Capability | Standard | Premium |
|---|---|---|
| **Global L7 load balancing** | Yes | Yes |
| **SSL termination & managed certs** | Yes | Yes |
| **Path-based routing** | Yes | Yes |
| **Caching (CDN)** | Yes | Yes |
| **WAF** | Optional add-on | Integrated (WAF policy) |
| **Private Link to origins** | No | Yes — origins not exposed to public internet |
| **Private endpoint ingress** | No | Yes |

**Front Door routing flow:**
1. Client DNS resolves to Front Door anycast IP
2. TLS terminates at nearest edge PoP
3. Front Door evaluates routing rules (path, headers, geo)
4. Request forwarded to best origin (priority, weight, latency, health)
5. Response optionally cached at edge

**Traffic Manager** is DNS-based global routing — it does **not** proxy traffic. It returns different backend IP addresses based on routing method. The client connects directly to the regional endpoint.

| Routing method | Behavior | Use case |
|---|---|---|
| **Priority** | Always route to highest-priority healthy endpoint | Active-passive DR failover |
| **Weighted** | Distribute by weight ratios | Canary releases, gradual migration |
| **Performance** | Route to lowest-latency endpoint | Global user base |
| **Geographic** | Route based on user's DNS resolver location | Data residency, compliance |
| **Subnet** | Route based on source IP CIDR | Hybrid — on-prem users to specific region |
| **Multi-value** | Return multiple healthy IPs | Increased availability |

**Decision framework — which global service?**

| Requirement | Front Door | Traffic Manager |
|---|---|---|
| SSL termination at edge | Yes | No — client connects to origin |
| WAF at edge | Yes | No |
| CDN caching | Yes | No |
| DNS-only failover (no proxy) | Overkill | Perfect fit |
| Non-HTTP protocols | No | Yes (any IP-based endpoint) |
| Origin not exposed to internet | Premium Private Link origins | No — clients connect directly |

**Enterprise pattern: Front Door + regional Application Gateway**
- **Front Door** handles global routing, WAF, CDN, DDoS at edge
- **Application Gateway** (per region) handles regional L7 routing, internal backends, WAF for regional traffic
- Traffic Manager can sit in front as a DNS failover layer for non-HTTP endpoints (e.g., failover between regional SQL listeners)

**Front Door vs CDN:** Front Door Standard/Premium replaced the classic Front Door + CDN split. Use caching rules within Front Door for static content. Enable compression and query string caching policies per route.

**Troubleshooting:**
- **502/503 from Front Door**: Origin unhealthy or origin not accepting Front Door's Host header — configure custom domain on origin or use origin host header override
- **Traffic Manager not failing over**: DNS TTL caching — clients hold stale records. Lower TTL before planned failover (minimum 30 seconds)
- **SSL errors**: Certificate mismatch between Front Door custom domain and origin — use Front Door managed certs or upload matching certs`,
        keyPoints: [
          "Front Door proxies traffic at L7; Traffic Manager only influences DNS resolution",
          "Front Door Premium adds Private Link origins — backends never exposed publicly",
          "Combine Front Door (global) + App Gateway (regional) for enterprise web architectures",
          "Traffic Manager supports non-HTTP endpoints; Front Door is HTTP/HTTPS only",
        ],
        warning:
          "Traffic Manager does not health-check at the data plane — it uses HTTP/HTTPS/TCP probes but clients connect directly to origins. A 'healthy' Traffic Manager endpoint can still serve errors if the origin application is broken but the probe path returns 200.",
      },
      {
        id: "architecture-patterns",
        title: "Production Architecture Patterns",
        content: `Real production deployments combine multiple load balancing services. Understanding how they layer prevents double-termination, broken probes, and SNAT exhaustion.

**Pattern 1: Internet → Front Door → App Gateway → VMs**

| Hop | Component | Responsibility |
|---|---|---|
| 1 | Front Door | Global routing, edge WAF, CDN, SSL offload |
| 2 | Application Gateway | Regional URL routing, backend SSL re-encrypt, regional WAF |
| 3 | VMs / VMSS | Application logic |

Use when: Multi-region web app with centralized WAF and regional traffic management.

**Pattern 2: Internet → Load Balancer → VMs (L4 pass-through)**

| Hop | Component | Responsibility |
|---|---|---|
| 1 | Public Load Balancer | Distribute TCP/UDP, preserve client IP (with floating IP or preserve SNAT) |
| 2 | VMs | Handle SSL and HTTP directly |

Use when: Non-HTTP services, TLS pass-through required, maximum performance (no double proxy).

**Pattern 3: Internal microservices → Internal Load Balancer**

| Hop | Component | Responsibility |
|---|---|---|
| 1 | Internal LB | HA for internal APIs (private frontend IP) |
| 2 | AKS services or VMs | gRPC, custom TCP services |

Use when: Service-to-service communication within VNet needs HA without public exposure.

**Pattern 4: Active-passive DR with Traffic Manager + regional stacks**

| Component | Role |
|---|---|
| Traffic Manager (Priority) | DNS failover to secondary region |
| Regional LB/AGW per region | Full stack duplicated in each region |
| Azure SQL failover group / Cosmos multi-region | Data layer failover |

**SNAT port exhaustion — the silent production killer:**

Standard Load Balancer default outbound provides ~1024 SNAT ports per frontend IP per backend VM. High-connection workloads (API gateways calling many external services, crawling, message processing) exhaust ports.

| Solution | How |
|---|---|
| **NAT Gateway** | 64,000 SNAT ports per public IP; attach to subnet (recommended) |
| **Outbound Rules** | Explicit control over SNAT with multiple frontend IPs |
| **Multiple frontend IPs** | Multiply available ports per VM |

**Session affinity considerations:**

| Service | Affinity method | When to use |
|---|---|---|
| Load Balancer | Hash-based (5-tuple) | Stateful TCP where same client must hit same backend |
| Application Gateway | Cookie-based | Web sessions not yet externalized to Redis/SQL |
| Front Door | Cookie-based | Global session stickiness (prefer external session store instead) |

**Production checklist before go-live:**
1. Health probe paths return 200 from every backend
2. NSGs allow AzureLoadBalancer source tag on probe ports
3. SNAT: NAT Gateway attached to backend subnets for outbound-heavy workloads
4. SSL: Certificate chain complete on all termination points
5. Front Door origin host header matches what the backend expects
6. Load test through the full chain — not just direct-to-backend`,
        codeExample: `// Bicep: NAT Gateway for SNAT port exhaustion prevention
resource natGateway 'Microsoft.Network/natGateways@2023-05-01' = {
  name: 'prod-nat-gw'
  location: location
  sku: { name: 'Standard' }
  properties: {
    publicIpAddresses: [
      { id: natPublicIp.id }
    ]
  }
}

resource backendSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-05-01' = {
  parent: vnet
  name: 'app-subnet'
  properties: {
    addressPrefix: '10.0.1.0/24'
    natGateway: { id: natGateway.id }
    defaultOutboundAccess: false  // Force outbound through NAT Gateway
  }
}`,
        keyPoints: [
          "Layer Front Door (global) → App Gateway (regional) → backends for enterprise web apps",
          "NAT Gateway provides 64K SNAT ports per IP — attach to subnets with high outbound connections",
          "Test health probes and NSG rules together — probe failures are the top LB outage cause",
          "Avoid double SSL termination unless intentional — configure re-encrypt between tiers",
        ],
        warning:
          "Default outbound access via Load Balancer SNAT is being deprecated. Explicitly attach NAT Gateway or Outbound Rules and set defaultOutboundAccess to false on subnets to avoid surprise connectivity loss.",
      },
    ],
    quiz: [
      {
        question: "Which service provides URL path-based routing (/api → pool A)?",
        options: ["Azure Load Balancer", "Traffic Manager", "Application Gateway", "NAT Gateway"],
        answer: 2,
        explanation:
          "Application Gateway operates at L7 and supports path-based, host-based, and multi-site routing. Load Balancer operates at L4 only.",
      },
      {
        question: "What is the primary difference between Front Door and Traffic Manager?",
        options: [
          "Front Door is regional; Traffic Manager is global",
          "Front Door proxies traffic; Traffic Manager only controls DNS resolution",
          "Traffic Manager includes WAF; Front Door does not",
          "Front Door only supports TCP; Traffic Manager supports HTTP",
        ],
        answer: 1,
        explanation:
          "Front Door is a reverse proxy at Azure edge PoPs. Traffic Manager returns DNS answers pointing clients directly to backend IPs — no traffic passes through Traffic Manager.",
      },
      {
        question: "Backends show unhealthy on a Standard Load Balancer. NSG on the subnet denies all inbound. What is the likely fix?",
        options: [
          "Increase probe interval",
          "Add an Allow rule for source AzureLoadBalancer tag",
          "Switch to Basic SKU",
          "Disable health probes",
        ],
        answer: 1,
        explanation:
          "Load Balancer health probes originate from the AzureLoadBalancer service tag. NSGs must allow inbound from this tag on the probe port.",
      },
      {
        question: "A VM makes thousands of outbound connections and experiences SNAT port exhaustion. Best solution?",
        options: [
          "Add more backend pool members",
          "Switch to Application Gateway",
          "Attach a NAT Gateway to the subnet",
          "Enable session affinity",
        ],
        answer: 2,
        explanation:
          "NAT Gateway provides 64,000 SNAT ports per public IP (vs ~1024 with default LB outbound). Attach it to the subnet for high-connection outbound workloads.",
      },
    ],
  },
  {
    slug: "hybrid-connectivity",
    category: "networking",
    title: "Hybrid Connectivity & Private Link",
    subtitle: "VPN, ExpressRoute, and private PaaS access",
    description:
      "Connect on-premises to Azure. Private Endpoints for secure PaaS access without public internet.",
    difficulty: "advanced",
    duration: "110 min",
    services: ["VPN Gateway", "ExpressRoute", "Private Link", "Private DNS"],
    sections: [
      {
        id: "vpn-er",
        title: "VPN Gateway & ExpressRoute",
        content: `Hybrid connectivity links on-premises networks to Azure VNets. The choice between VPN and ExpressRoute affects bandwidth, latency, SLA, and operational complexity.

**Site-to-Site VPN Gateway:**

| Attribute | Detail |
|---|---|
| **Throughput** | Up to 10 Gbps (VpnGw5AZ), typical 650 Mbps–1.25 Gbps per tunnel |
| **Encryption** | IPsec/IKE over public internet |
| **Setup time** | Hours to days |
| **SLA** | 99.95% (with active-active gateways) |
| **Cost** | Gateway hourly charge + egress data transfer |
| **Best for** | Dev/test, backup path, small offices, rapid prototyping |

**ExpressRoute:**

| Attribute | Detail |
|---|---|
| **Throughput** | 50 Mbps to 10 Gbps (100 Gbps via Direct) |
| **Path** | Private dedicated connection via connectivity provider (or ExpressRoute Direct) |
| **Setup time** | Weeks to months (provider provisioning) |
| **SLA** | 99.95% (Standard), 99.99% (Premium with zone-redundant) |
| **Latency** | Predictable, no internet congestion |
| **Best for** | Production hybrid, large data transfer, compliance requirements |

**ExpressRoute peering types:**

| Peering | Routes to | Use case |
|---|---|---|
| **Private peering** | Azure VNets via ER Gateway | VM-to-on-prem, Private Endpoint access from on-prem |
| **Microsoft peering** | Microsoft 365, Azure PaaS public IPs | Office 365, Dynamics, Azure services without Private Endpoints |
| **Public peering** | Deprecated | Migrate to Microsoft peering |

**Decision framework:**

| Factor | Choose VPN | Choose ExpressRoute |
|---|---|---|
| Bandwidth > 1 Gbps sustained | | Yes |
| Predictable latency required | | Yes |
| Budget-constrained / dev-test | Yes | |
| Need connectivity this week | Yes | |
| Compliance requires private path | | Yes |
| Transferring TB+ data regularly | | Yes (lower per-GB cost at scale) |

**High-availability patterns:**

| Pattern | Configuration |
|---|---|
| **Active-active VPN** | Two VPN gateways with two tunnels each; BGP for dynamic routing |
| **Zone-redundant gateway** | Gateway spans availability zones (recommended for production) |
| **ExpressRoute + VPN coexistence** | ExpressRoute primary, VPN backup — configure BGP preference so VPN routes have higher AS-path (lower priority) |
| **Dual ExpressRoute circuits** | Two circuits from different providers for provider-level redundancy |
| **ExpressRoute Global Reach** | Connect on-premises sites through Azure backbone without hairpinning through your datacenter |

**BGP is essential for production:**
- Azure VPN and ExpressRoute use BGP to exchange routes dynamically
- On-premises advertises local prefixes; Azure advertises VNet prefixes
- Configure **route filters** on ExpressRoute to prevent route leaks
- Use **connection weight** and **AS-path** to control primary/backup path preference

**Gateway subnet requirements:**
- Dedicated \`GatewaySubnet\` — cannot be used for anything else
- Minimum /27 for most deployments; /26 for zone-redundant or high-throughput
- No NSG or route table on GatewaySubnet (Azure manages routing)

**Troubleshooting VPN/ER connectivity:**
1. Verify BGP sessions are **Connected** — no BGP = no routes = no connectivity
2. Check effective routes on a VM NIC — is the on-prem prefix present?
3. Confirm on-prem firewall allows IPsec (UDP 500, 4500, ESP) or ExpressRoute VLAN
4. For asymmetric routing issues, ensure return traffic uses the same path
5. Use **VPN Gateway packet captures** and **Network Watcher** for tunnel diagnostics`,
        codeExample: `// Bicep: Zone-redundant VPN Gateway in GatewaySubnet
param gatewaySubnetId string
param vpnClientAddressPool string = '172.16.0.0/24'

resource vpnGateway 'Microsoft.Network/virtualNetworkGateways@2023-05-01' = {
  name: 'hub-vpn-gw'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'default'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          subnet: { id: gatewaySubnetId }
          publicIPAddress: { id: gwPublicIp1.id }
        }
      }
      {
        name: 'activeActive'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          subnet: { id: gatewaySubnetId }
          publicIPAddress: { id: gwPublicIp2.id }
        }
      }
    ]
    gatewayType: 'Vpn'
    vpnType: 'RouteBased'
    activeActive: true
    enableBgp: true
    sku: {
      name: 'VpnGw2AZ'
      tier: 'VpnGw2AZ'
    }
    bgpSettings: {
      asn: 65515
    }
  }
}`,
        keyPoints: [
          "ExpressRoute for production hybrid — private path, predictable bandwidth and latency",
          "Always enable BGP for dynamic route exchange in production VPN/ER deployments",
          "ExpressRoute + VPN coexistence provides automatic failover with BGP path preference",
          "Never attach NSGs or UDRs to GatewaySubnet — it breaks gateway functionality",
        ],
        warning:
          "Deploying a VPN Gateway or ExpressRoute Gateway is a long-running operation (30–45 minutes) and the GatewaySubnet cannot be resized easily after creation. Size the GatewaySubnet to /26 and choose the correct SKU upfront.",
      },
      {
        id: "private-link",
        title: "Private Endpoints & Private DNS",
        content: `**Azure Private Link** provides private connectivity to Azure PaaS services via **Private Endpoints** — a network interface with a private IP in your subnet assigned to the PaaS resource.

**Why Private Link over Service Endpoints or public access:**

| Approach | Traffic path | Public exposure | DNS complexity |
|---|---|---|---|
| **Public endpoint** | Internet → PaaS public IP | Yes — resource has public IP | Simple (public DNS) |
| **Service Endpoint** | VNet → Azure backbone → PaaS public IP | PaaS still has public IP | Simple (public DNS) |
| **Private Endpoint** | VNet → private IP in your subnet | No public IP needed on PaaS | Requires Private DNS Zone |

**Private Endpoint deployment pattern (production order):**

| Step | Action | Why this order |
|---|---|---|
| 1 | Create Private DNS Zone (e.g., \`privatelink.blob.core.windows.net\`) | DNS must be ready before testing |
| 2 | Link DNS zone to VNet (and on-prem DNS if hybrid) | Enables name resolution for VNet resources |
| 3 | Create Private Endpoint in target subnet | Assigns private IP to PaaS resource |
| 4 | Approve Private Endpoint connection (if manual approval enabled) | PaaS owner must accept the connection |
| 5 | Verify DNS resolution from a test VM: \`nslookup storageaccount.blob.core.windows.net\` | Must return 10.x.x.x, not public IP |
| 6 | Test connectivity (port-specific: 443 for Storage, 1433 for SQL) | Confirm end-to-end before lockdown |
| 7 | **Disable public network access** on the PaaS resource | Zero-trust — only after steps 5–6 pass |

**Private DNS Zone naming:** Each Azure service has a well-known Private Link DNS zone name:

| Service | Private DNS Zone |
|---|---|
| Storage (Blob) | privatelink.blob.core.windows.net |
| SQL Database | privatelink.database.windows.net |
| Key Vault | privatelink.vaultcore.azure.net |
| Cosmos DB | privatelink.documents.azure.com |
| Azure OpenAI | privatelink.openai.azure.com |
| Cognitive Search | privatelink.search.windows.net |

**DNS architecture for hybrid (on-prem accessing Private Endpoints):**

| Component | Role |
|---|---|
| **Private DNS Zone** in Azure | Resolves PaaS names to private IPs for VNet resources |
| **Azure DNS Private Resolver** | Conditional forwarding between Azure and on-prem DNS |
| **On-prem DNS conditional forwarder** | Forward \`privatelink.*\` queries to Azure DNS resolver inbound endpoint |
| **Hosts file (dev only)** | Temporary — never use in production |

**Network policies on Private Endpoint subnet:**
- Set \`privateEndpointNetworkPolicies\` to **Disabled** (required for Private Endpoints)
- Set \`privateLinkServiceNetworkPolicies\` to **Disabled** if hosting Private Link Services

**Private Endpoint across subscriptions:** The PaaS resource and Private Endpoint can be in different subscriptions. Requires RBAC (Network Contributor on subnet, appropriate role on PaaS resource) and possibly manual connection approval.

**Supported services:** 100+ Azure services support Private Link including Storage, SQL, Cosmos DB, Key Vault, Service Bus, Event Hubs, Azure ML, Azure OpenAI, AI Search, App Configuration, and more.

**Troubleshooting Private Endpoint connectivity:**

| Symptom | Likely cause | Fix |
|---|---|---|
| DNS resolves to public IP | Missing or unlinked Private DNS Zone | Create zone, link to VNet, verify A record |
| DNS resolves correctly but connection timeout | NSG blocking port 443/1433 on subnet | Add Allow rule for source VNet/on-prem CIDR |
| Works from VNet but not on-prem | On-prem DNS not forwarding to Azure | Configure conditional forwarder + DNS Private Resolver |
| 403 Forbidden on Storage | Public access disabled but using wrong auth | Use correct identity; verify RBAC on storage account |`,
        codeExample: `// Bicep: Storage Private Endpoint with Private DNS Zone Group
resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: 'privatelink.blob.core.windows.net'
  location: 'global'
}

resource dnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: 'link-to-vnet'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnet.id }
    registrationEnabled: false
  }
}

resource storagePrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  name: 'pe-storage'
  location: location
  properties: {
    subnet: { id: subnet.id }
    privateLinkServiceConnections: [
      {
        name: 'storage-connection'
        properties: {
          privateLinkServiceId: storageAccount.id
          groupIds: ['blob']
        }
      }
    ]
  }
}

resource dnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2023-05-01' = {
  parent: storagePrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'blob-dns'
        properties: {
          privateDnsZoneId: privateDnsZone.id
        }
      }
    ]
  }
}`,
        keyPoints: [
          "Always create and link Private DNS Zones BEFORE disabling public network access",
          "DNS must resolve PaaS hostnames to 10.x.x.x private IPs — test with nslookup from a VNet VM",
          "Use Azure DNS Private Resolver for hybrid DNS — forward privatelink.* zones between on-prem and Azure",
          "Disable privateEndpointNetworkPolicies on subnets hosting Private Endpoints",
        ],
        warning:
          "Disabling public network access before Private DNS is configured is the #1 cause of Private Link outages. Always verify DNS resolution and connectivity from a test VM before locking down public access.",
      },
      {
        id: "hybrid-dns-troubleshooting",
        title: "Hybrid DNS & Operational Troubleshooting",
        content: `Private Link and hybrid connectivity failures are almost always DNS or routing problems. This section covers end-to-end DNS architecture and systematic troubleshooting.

**Azure DNS Private Resolver architecture:**

| Endpoint | Direction | Purpose |
|---|---|---|
| **Inbound endpoint** | On-prem → Azure | On-prem DNS servers forward queries to this IP |
| **Outbound endpoint** | Azure → On-prem | Azure VNets resolve on-prem hostnames via conditional forwarding rules |

**Production DNS flow (on-prem VM accessing Azure SQL via Private Endpoint):**

1. On-prem VM queries \`mydb.database.windows.net\`
2. On-prem DNS conditional forwarder sends \`privatelink.database.windows.net\` to Azure DNS Private Resolver inbound IP
3. Azure Private DNS Zone returns 10.1.2.4 (Private Endpoint IP)
4. On-prem VM sends TCP 1433 to 10.1.2.4
5. Traffic routes via ExpressRoute/VPN to Azure VNet
6. NSG on Private Endpoint subnet allows inbound from on-prem CIDR
7. Connection succeeds to SQL via Private Endpoint

**Centralized Private DNS Zone strategy:**

| Approach | Pros | Cons |
|---|---|---|
| **Single DNS zone per service in hub subscription** | Centralized management, consistent records | Cross-subscription linking required |
| **DNS zone per spoke** | Team autonomy | Duplicate zones, record sync challenges |
| **Auto-registration via zone group on PE** | Automatic A record creation | Only works within linked VNets |

**Best practice:** Deploy Private DNS Zones in the hub subscription. Link to all spoke VNets. Use Private Endpoint DNS zone groups for automatic A record registration.

**Network Watcher tools for hybrid troubleshooting:**

| Tool | Use |
|---|---|
| **Connection troubleshoot** | Test TCP connectivity between VM and endpoint with latency and hop info |
| **Next hop** | Verify UDRs route traffic to VPN/ER gateway, not Internet |
| **Effective routes** | See all routes applied to a NIC (system + BGP + UDR) |
| **VPN troubleshoot** | Diagnose VPN gateway connectivity and tunnel status |
| **Packet capture** | Capture traffic on VM NIC for deep analysis |
| **NSG flow logs** | Confirm traffic is reaching or being blocked at NSG |

**Systematic troubleshooting workflow:**

| Step | Check | Command / Tool |
|---|---|---|
| 1 | DNS resolution | \`nslookup <hostname>\` — must return private IP |
| 2 | Routing | Effective routes on source NIC — prefix routed via ER/VPN gateway |
| 3 | NSG | NSG flow logs — is traffic allowed on required port? |
| 4 | Firewall | Azure Firewall application/network rules if traffic passes through hub |
| 5 | PaaS firewall | Service-specific firewall (e.g., SQL firewall rules, Storage network rules) |
| 6 | Private Endpoint status | Portal → Private Endpoint → connection state Approved |
| 7 | End-to-end test | Connection troubleshoot from source VM to destination IP:port |

**Common cross-premises Private Endpoint mistakes:**

| Mistake | Impact | Prevention |
|---|---|---|
| Public access disabled before DNS works | Total service outage | Test DNS + connectivity first |
| On-prem DNS not forwarding privatelink zones | Resolves to public IP, connection fails after lockdown | Configure conditional forwarders day one |
| NSG on PE subnet blocks on-prem CIDR | Timeout connecting to private IP | Allow inbound from on-prem and VNet CIDRs |
| UDR sends PaaS traffic to Internet | Traffic bypasses Private Endpoint | Use service tags or specific routes |
| Missing DNS zone group on PE | Manual A records get stale when PE is recreated | Always use DNS zone groups |

**ExpressRoute + Private Endpoint together:**
Private peering carries traffic to Private Endpoint IPs in your VNets. Ensure:
- On-prem DNS resolves via Private DNS Zone (through DNS Private Resolver)
- BGP advertises VNet prefixes to on-prem (automatic with ER Gateway)
- No asymmetric routing between ExpressRoute and VPN backup paths`,
        codeExample: `// Verify DNS resolution and connectivity from an Azure VM (bash)
# Step 1: DNS must return private IP
nslookup mystorageaccount.blob.core.windows.net
# Expected: Address: 10.1.2.5 (NOT a public 20.x or 52.x address)

# Step 2: Test TCP connectivity to Private Endpoint
nc -zv 10.1.2.5 443 -w 5

# Step 3: Test actual service access
curl -I https://mystorageaccount.blob.core.windows.net/container/blob \\
  --resolve mystorageaccount.blob.core.windows.net:443:10.1.2.5

# Step 4: Check effective routes (Azure CLI)
az network nic show-effective-route-table \\
  --resource-group myRG --name myVM-nic --output table`,
        keyPoints: [
          "Hybrid Private Link requires Azure DNS Private Resolver for on-prem ↔ Azure DNS forwarding",
          "Troubleshoot in order: DNS → routing → NSG → firewall → PaaS network rules",
          "Use Private Endpoint DNS zone groups for automatic A record management",
          "Network Watcher Connection troubleshoot validates end-to-end TCP connectivity",
        ],
        warning:
          "Stale manual DNS A records survive Private Endpoint recreation with a different IP. Use DNS zone groups on every Private Endpoint to prevent silent DNS drift after redeployment.",
      },
    ],
    quiz: [
      {
        question: "Which ExpressRoute peering type connects to Azure VNets?",
        options: ["Microsoft peering", "Public peering", "Private peering", "Global peering"],
        answer: 2,
        explanation:
          "Private peering connects your on-premises network to Azure VNets. Microsoft peering connects to Microsoft 365 and Azure PaaS public endpoints.",
      },
      {
        question: "You disabled public network access on a storage account. Apps now cannot connect. DNS returns a public IP. What is missing?",
        options: [
          "Service Endpoint on the subnet",
          "Private DNS Zone linked to the VNet",
          "ExpressRoute circuit",
          "NAT Gateway on the subnet",
        ],
        answer: 1,
        explanation:
          "Without a Private DNS Zone (and VNet link), hostnames resolve to the public IP. After disabling public access, connections to the public IP fail. The Private DNS Zone resolves names to the Private Endpoint IP.",
      },
      {
        question: "What should NOT be configured on the GatewaySubnet?",
        options: [
          "VPN Gateway resource",
          "ExpressRoute Gateway resource",
          "NSG and custom route table",
          "Zone-redundant gateway deployment",
        ],
        answer: 2,
        explanation:
          "NSGs and UDRs on GatewaySubnet break VPN/ExpressRoute Gateway functionality. Azure manages routing on this subnet automatically.",
      },
      {
        question: "ExpressRoute is primary and VPN is backup. How do you ensure traffic prefers ExpressRoute?",
        options: [
          "Disable BGP on the VPN gateway",
          "Set a higher BGP connection weight on the ExpressRoute path",
          "Delete VPN routes from the routing table",
          "Use Traffic Manager in front of both paths",
        ],
        answer: 1,
        explanation:
          "BGP path selection uses connection weight and AS-path length. Configure ExpressRoute with a lower connection weight (higher preference) so it is preferred over the VPN backup path.",
      },
      {
        question: "On-prem users need to resolve privatelink.blob.core.windows.net to private IPs. Which Azure service facilitates this?",
        options: [
          "Azure Traffic Manager",
          "Azure DNS Private Resolver",
          "Azure Front Door",
          "NAT Gateway",
        ],
        answer: 1,
        explanation:
          "Azure DNS Private Resolver provides inbound endpoints for on-prem DNS to forward queries to Azure Private DNS Zones, returning private IP addresses for Private Link hostnames.",
      },
    ],
  },
];