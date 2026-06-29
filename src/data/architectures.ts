import { ArchitecturePattern } from "@/lib/types";

export const architectures: ArchitecturePattern[] = [
  {
    slug: "enterprise-rag",
    title: "Enterprise RAG Pipeline",
    description:
      "Production-grade retrieval-augmented generation with hybrid search, semantic ranking, and content safety filters.",
    useCase: "Internal knowledge base chatbot for enterprise documentation",
    complexity: "medium",
    services: [
      "Azure OpenAI",
      "AI Search",
      "Blob Storage",
      "Document Intelligence",
      "Content Safety",
      "API Management",
    ],
    mermaidDiagram: `graph TB
    subgraph Users
        U[Enterprise Users]
    end

    subgraph "API Layer"
        APIM[API Management<br/>Rate Limiting + Auth]
    end

    subgraph "Application Layer"
        APP[App Service / Container App]
        CS[Content Safety<br/>Input Filter]
    end

    subgraph "Retrieval Pipeline"
        AOAI_E[Azure OpenAI<br/>Embedding Model]
        SEARCH[AI Search<br/>Hybrid + Semantic]
        BLOB[Blob Storage<br/>Document Store]
        DI[Document Intelligence<br/>PDF/Layout Parser]
    end

    subgraph "Generation"
        AOAI_G[Azure OpenAI<br/>GPT-4o Deployment]
        CS_OUT[Content Safety<br/>Output Filter]
    end

    subgraph "Observability"
        AI[Application Insights]
        LA[Log Analytics]
    end

    U -->|HTTPS| APIM
    APIM --> APP
    APP --> CS
    CS --> AOAI_E
    AOAI_E -->|Query Vector| SEARCH
    SEARCH -->|Top-K Chunks| APP
    BLOB --> DI
    DI -->|Chunks + Embeddings| SEARCH
    APP --> AOAI_G
    AOAI_G --> CS_OUT
    CS_OUT --> APP
    APP -->|Stream Response| APIM
    APIM --> U
    APP -.-> AI
    AI -.-> LA`,
    considerations: [
      "Pre-filter AI Search by tenantId for multi-tenant isolation",
      "Cache embeddings for frequently asked questions",
      "Use semantic ranker only if latency budget allows >200ms",
      "Document Intelligence layout model for table-heavy PDFs",
    ],
    costDrivers: [
      "GPT-4o tokens (input + output) — typically 60-70% of total cost",
      "Embedding API calls during ingestion — one-time per document",
      "AI Search SU tier — scales with index size and QPS",
      "Document Intelligence pages processed during ingestion",
    ],
  },
  {
    slug: "multi-agent",
    title: "Multi-Agent Orchestration",
    description:
      "Supervisor agent routing tasks to specialized sub-agents with tool access, running on Azure AI Foundry prompt flows.",
    useCase: "AI copilot with research, coding, and data analysis capabilities",
    complexity: "high",
    services: [
      "AI Foundry",
      "Azure OpenAI",
      "Azure Functions",
      "Cosmos DB",
      "AI Search",
    ],
    mermaidDiagram: `graph TB
    subgraph "User Interface"
        UI[Web App / Teams Bot]
    end

    subgraph "Orchestration - AI Foundry"
        SUP[Supervisor Agent<br/>Prompt Flow]
        RA[Research Agent<br/>RAG + Web Search]
        CA[Code Agent<br/>Code Interpreter]
        DA[Data Agent<br/>SQL + Analytics]
    end

    subgraph "Tools & Data"
        SEARCH[AI Search<br/>Knowledge Base]
        FUNC[Azure Functions<br/>Tool Endpoints]
        COSMOS[Cosmos DB<br/>Session State]
        SQL[Azure SQL<br/>Structured Data]
    end

    subgraph "Models"
        GPT4[Azure OpenAI GPT-4o]
        MINI[Azure OpenAI GPT-4o-mini]
    end

    UI --> SUP
    SUP -->|Route: Research| RA
    SUP -->|Route: Code| CA
    SUP -->|Route: Data| DA
    RA --> SEARCH
    RA --> GPT4
    CA --> FUNC
    CA --> MINI
    DA --> SQL
    DA --> GPT4
    SUP --> COSMOS
    RA --> COSMOS
    CA --> COSMOS
    DA --> COSMOS`,
    considerations: [
      "Supervisor uses GPT-4o for routing accuracy; sub-agents can use mini",
      "Store conversation state in Cosmos DB with TTL for session cleanup",
      "Each agent should have constrained tool access (least privilege)",
      "Implement max iteration limits to prevent runaway agent loops",
    ],
    costDrivers: [
      "Multiple LLM calls per user request (supervisor + sub-agent)",
      "GPT-4o for supervisor routing on every turn",
      "Function invocations for tool calls",
      "Cosmos DB RUs for session state reads/writes",
    ],
  },
  {
    slug: "secure-private",
    title: "Zero-Trust AI Architecture",
    description:
      "Fully private AI deployment with VNet isolation, Private Link, Managed Identity, and no public endpoints.",
    useCase: "Regulated industries (healthcare, finance, government) requiring data residency",
    complexity: "high",
    services: [
      "Private Link",
      "Key Vault",
      "VNet",
      "Azure OpenAI",
      "App Service",
      "Private DNS",
    ],
    mermaidDiagram: `graph TB
    subgraph "On-Premises / Corporate Network"
        VPN[ExpressRoute / VPN Gateway]
        USERS[Corporate Users]
    end

    subgraph "Azure VNet - 10.0.0.0/16"
        subgraph "App Subnet - 10.0.1.0/24"
            APP[App Service<br/>VNet Integrated]
            MI[Managed Identity]
        end

        subgraph "Private Endpoints Subnet - 10.0.2.0/24"
            PE_OPENAI[PE: Azure OpenAI]
            PE_KV[PE: Key Vault]
            PE_SEARCH[PE: AI Search]
            PE_STORAGE[PE: Blob Storage]
        end

        subgraph "DNS"
            PDNS[Private DNS Zones<br/>privatelink.openai.azure.com]
        end
    end

    subgraph "PaaS Services - No Public Access"
        OPENAI[Azure OpenAI<br/>Public: Disabled]
        KV[Key Vault<br/>Public: Disabled]
        SEARCH_S[AI Search<br/>Public: Disabled]
        STORAGE[Blob Storage<br/>Public: Disabled]
    end

    USERS --> VPN
    VPN --> APP
    APP --> MI
    MI -->|RBAC Auth| PE_OPENAI
    MI -->|RBAC Auth| PE_KV
    APP --> PE_OPENAI
    APP --> PE_SEARCH
    APP --> PE_STORAGE
    PE_OPENAI --> OPENAI
    PE_KV --> KV
    PE_SEARCH --> SEARCH_S
    PE_STORAGE --> STORAGE
    PDNS -.-> PE_OPENAI
    PDNS -.-> PE_KV`,
    considerations: [
      "Disable public network access on ALL AI-related resources",
      "Use Private DNS zones for automatic name resolution",
      "Managed Identity eliminates secrets — Key Vault only for third-party keys",
      "App Service must be VNet-integrated with route all traffic enabled",
      "Test DNS resolution from App Service before deploying",
    ],
    costDrivers: [
      "Private Endpoint charges (~$7.30/endpoint/month × 4)",
      "VPN/ExpressRoute for on-premises connectivity",
      "Standard App Service plan with VNet integration",
      "Identical OpenAI token costs — networking adds fixed overhead",
    ],
  },
  {
    slug: "realtime-voice",
    title: "Real-Time Voice AI",
    description:
      "Low-latency voice assistant using Azure OpenAI Realtime API with speech-to-text and text-to-speech integration.",
    useCase: "Voice-enabled customer support agent with knowledge base access",
    complexity: "medium",
    services: [
      "Azure OpenAI Realtime",
      "Speech Services",
      "AI Search",
      "Web PubSub",
    ],
    mermaidDiagram: `graph LR
    subgraph "Client"
        MIC[Microphone]
        SPK[Speaker]
        WS[WebSocket Client]
    end

    subgraph "Real-Time Pipeline"
        WPS[Web PubSub<br/>WebSocket Gateway]
        RT[Azure OpenAI<br/>Realtime API]
        RAG[AI Search<br/>Quick Retrieval]
    end

    subgraph "Fallback"
        STT[Speech-to-Text<br/>Whisper/Batch]
        TTS[Text-to-Speech<br/>Neural Voices]
        GPT[Azure OpenAI<br/>GPT-4o Chat]
    end

    MIC -->|Audio Stream| WS
    WS <-->|WebSocket| WPS
    WPS <-->|Audio + Text| RT
    RT -->|Tool Call: Search| RAG
    RAG -->|Context| RT
    RT -->|Audio Response| WPS
    WPS --> SPK

    WS -.->|Fallback Path| STT
    STT -.-> GPT
    GPT -.-> TTS
    TTS -.-> SPK`,
    considerations: [
      "Realtime API requires WebSocket — use Web PubSub or direct WS",
      "Keep RAG retrieval under 200ms for natural conversation flow",
      "Implement fallback to batch STT→LLM→TTS if Realtime unavailable",
      "Audio buffering adds latency — target <500ms end-to-end",
    ],
    costDrivers: [
      "Realtime API audio tokens (priced differently from text tokens)",
      "Web PubSub message units for concurrent connections",
      "AI Search queries per conversation turn",
      "Speech Services if using fallback path",
    ],
  },
  {
    slug: "mlops-pipeline",
    title: "MLOps for Fine-Tuned Models",
    description:
      "End-to-end pipeline for fine-tuning, evaluating, and deploying custom models on Azure with CI/CD gates.",
    useCase: "Domain-specific model fine-tuning for legal/medical/technical domains",
    complexity: "high",
    services: [
      "Azure ML",
      "Azure OpenAI",
      "AI Foundry",
      "Container Registry",
      "Monitor",
    ],
    mermaidDiagram: `graph TB
    subgraph "Data Preparation"
        DATA[Training Dataset<br/>JSONL Format]
        VAL[Validation Dataset]
        BLOB[Blob Storage]
    end

    subgraph "Training - AI Foundry"
        FT[Fine-Tuning Job<br/>GPT-4o-mini]
        EVAL[Automated Evaluation<br/>Groundedness + Accuracy]
    end

    subgraph "CI/CD Pipeline"
        GH[GitHub Actions]
        GATE{Eval Score<br/>> Threshold?}
        DEPLOY[Deploy New Model Version]
        ROLLBACK[Auto Rollback]
    end

    subgraph "Serving"
        AOAI[Azure OpenAI<br/>Fine-Tuned Deployment]
        APIM[API Management<br/>Version Routing]
        MON[Azure Monitor<br/>Quality Dashboard]
    end

    DATA --> BLOB
    VAL --> BLOB
    BLOB --> FT
    FT --> EVAL
    EVAL --> GH
    GH --> GATE
    GATE -->|Pass| DEPLOY
    GATE -->|Fail| ROLLBACK
    DEPLOY --> AOAI
    AOAI --> APIM
    APIM --> MON`,
    considerations: [
      "Minimum 10 training examples, recommended 50-100+ for quality",
      "Hold out 20% validation set — never evaluate on training data",
      "A/B test fine-tuned vs base model before full rollout",
      "Fine-tuned models on Azure OpenAI don't support all features (e.g., tools)",
    ],
    costDrivers: [
      "Fine-tuning training cost (per token trained)",
      "Hosting fine-tuned model deployment (same as base model)",
      "Evaluation runs in AI Foundry",
      "Multiple training iterations during development",
    ],
  },
];

export function getArchitecture(slug: string): ArchitecturePattern | undefined {
  return architectures.find((a) => a.slug === slug);
}