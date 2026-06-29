import { LearningModule } from "@/lib/types";
import { extendedModules } from "./extended-modules";

const coreModules: LearningModule[] = [
  {
    slug: "azure-openai",
    title: "Azure OpenAI & Generative AI",
    subtitle: "Deployments, RAG embeddings, DALL-E, multimodal, and fine-tuning",
    description:
      "AI-102/103 generative AI domain — model deployments, prompt engineering, image generation, multimodal models, and fine-tuning on Azure OpenAI.",
    difficulty: "foundational",
    duration: "90 min",
    services: ["Azure OpenAI", "Azure Key Vault", "Private Link"],
    exams: ["AI-901", "AI-102", "AI-103", "AI-300"],
    sections: [
      {
        id: "resource-model",
        title: "Resource & Deployment Model",
        content: `Azure OpenAI differs from the public OpenAI API: you deploy **models as named deployments** within an Azure OpenAI resource. Each deployment maps to a specific model version and has its own TPM/RPM quota.

- **Resource**: Top-level Azure resource in a region
- **Deployment**: Named endpoint — you reference deployments by name, not model ID
- **Quota**: Tokens-per-minute (TPM) and requests-per-minute (RPM) per model per region
- **Model retirement**: Azure deprecates model versions on a schedule — pin versions in production`,
        codeExample: `from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint="https://my-resource.openai.azure.com",
    api_key=os.environ["AZURE_OPENAI_KEY"],
    api_version="2024-10-21"
)

response = client.chat.completions.create(
    model="gpt-4o-deployment",
    messages=[{"role": "user", "content": "Explain vector embeddings"}],
    temperature=0.3,
    max_tokens=1024
)`,
        keyPoints: [
          "Deployment names are your API model parameter",
          "Quota is per-model, per-region",
          "Always set explicit api_version",
          "temperature=0 for deterministic pipelines",
        ],
      },
      {
        id: "embeddings",
        title: "Embeddings for RAG",
        content: `Azure OpenAI provides \`text-embedding-3-small\` (1536 dims) and \`text-embedding-3-large\` (3072 dims). Batch API processes embedding jobs at 50% discount.

Chunking strategy often matters more than embedding model choice. Aim for 512–1024 token chunks with 10–20% overlap.`,
        codeExample: `embeddings = client.embeddings.create(
    model="text-embedding-3-small",
    input=[chunk.text for chunk in document_chunks],
    dimensions=1536
)`,
        keyPoints: [
          "text-embedding-3-small is the default for RAG",
          "Batch embedding API cuts indexing costs in half",
          "Chunk size and overlap dominate retrieval quality",
        ],
      },
      {
        id: "prompt-engineering",
        title: "Prompt Engineering & Parameters",
        content: `**AI-102/103 tests prompt engineering directly:**

**Techniques:**
- **System prompts**: Set role, constraints, output format, and tone
- **Few-shot examples**: Include 2-3 input/output pairs in the prompt
- **Chain-of-thought**: Ask model to reason step-by-step before answering
- **Prompt templates**: Parameterized prompts with \`{{variable}}\` placeholders in Foundry
- **Model reflection**: Have model critique and revise its own output

**Parameters (know the effect of each):**
- \`temperature\` (0–2): 0 = deterministic, higher = creative
- \`top_p\`: Nucleus sampling — alternative to temperature
- \`max_tokens\`: Cap output length — always set in production
- \`frequency_penalty\` / \`presence_penalty\`: Reduce repetition
- \`stop\` sequences: Halt generation at specific tokens`,
        keyPoints: [
          "Few-shot examples in system prompt improve task accuracy",
          "Chain-of-thought for complex reasoning tasks",
          "Prompt templates with variables for reusable patterns",
          "Exam tests parameter effects — know temperature vs top_p",
        ],
      },
      {
        id: "dalle-multimodal",
        title: "DALL-E, Multimodal & Fine-Tuning",
        content: `**DALL-E 3** (image generation):
- Generate images from text prompts via Azure OpenAI
- Specify size (1024x1024, 1792x1024), quality (standard/hd), style (vivid/natural)
- Exam: know DALL-E is accessed through the same Azure OpenAI resource

**Multimodal models (GPT-4o):**
- Accept image + text in the same message
- Use cases: visual Q&A, document understanding, chart interpretation
- Pass images as base64 or URL in the content array

**Fine-tuning (AI-102/300):**
- Train on JSONL with prompt/completion pairs (minimum 10, recommended 50-100+)
- Supported on GPT-4o-mini and other eligible models
- Fine-tuned models don't support all features (e.g., some tool-calling)
- Evaluate fine-tuned vs base model before production rollout`,
        codeExample: `# DALL-E image generation
response = client.images.generate(
    model="dall-e-3",
    prompt="A technical architecture diagram of a RAG pipeline",
    size="1024x1024",
    quality="hd",
    n=1
)

# Multimodal — image + text
response = client.chat.completions.create(
    model="gpt-4o-deployment",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What does this chart show?"},
            {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
        ]
    }]
)`,
        keyPoints: [
          "DALL-E 3 accessed via same Azure OpenAI resource",
          "GPT-4o accepts image + text in content array",
          "Fine-tuning needs JSONL with 50-100+ quality examples",
          "Fine-tuned models may lack some base model features",
        ],
      },
      {
        id: "production",
        title: "Production Inference Patterns",
        content: `Implement exponential backoff on 429 responses. Stream all chat responses. Configure content filter severity thresholds. Use Private Link for regulated industries.`,
        codeExample: `from tenacity import retry, wait_exponential, retry_if_exception_type
from openai import RateLimitError

@retry(retry=retry_if_exception_type(RateLimitError),
       wait=wait_exponential(multiplier=1, min=2, max=60))
def chat_with_retry(messages):
    return client.chat.completions.create(
        model="gpt-4o-deployment", messages=messages, stream=True
    )`,
        keyPoints: [
          "Exponential backoff for 429 rate limit errors",
          "Stream responses — don't buffer full completions",
          "Content filters run on input AND output",
          "Private Link mandatory for regulated industries",
        ],
        warning: "Never expose API keys in client-side code. Use Managed Identity.",
      },
    ],
    quiz: [{
      question: "In Azure OpenAI, what do you pass as the 'model' parameter?",
      options: ["The OpenAI model name", "Your deployment name", "The model version", "The resource name"],
      answer: 1,
      explanation: "Azure OpenAI uses deployment names as the model parameter.",
    }],
  },
  {
    slug: "rag-pipeline",
    title: "RAG & Azure AI Search",
    subtitle: "Hybrid search, semantic ranking, indexers, and skillsets",
    description:
      "Knowledge mining domain for AI-102/103/300 — index design, hybrid retrieval, enrichment pipelines, and Knowledge Store projections.",
    difficulty: "intermediate",
    duration: "90 min",
    services: ["Azure AI Search", "Azure OpenAI", "Blob Storage"],
    exams: ["AI-102", "AI-103", "AI-300"],
    sections: [
      {
        id: "index-design",
        title: "Search Index Architecture",
        content: `Azure AI Search index schema: text fields (BM25), vector fields (HNSW), filterable fields, semantic configurations. HNSW parameters \`m\` and \`efConstruction\` affect recall.`,
        codeExample: `{
  "name": "rag-index",
  "fields": [
    {"name": "id", "type": "Edm.String", "key": true},
    {"name": "content", "type": "Edm.String", "searchable": true},
    {"name": "contentVector", "type": "Collection(Edm.Single)",
     "dimensions": 1536, "vectorSearchProfile": "default"}
  ]
}`,
        keyPoints: ["Vector + BM25 for hybrid", "Filterable tenantId for multi-tenant", "HNSW for approximate NN search"],
      },
      {
        id: "hybrid-search",
        title: "Hybrid Search & Semantic Ranking",
        content: `Hybrid = vector + BM25 fused with RRF. Semantic ranker reranks top 50 with a transformer (+100-200ms latency). Pre-filter with OData before vector search.`,
        codeExample: `results = search_client.search(
    search_text=query,
    vector_queries=[{"kind": "vector", "vector": embedding,
                     "fields": "contentVector", "k": 10}],
    query_type="semantic",
    semantic_configuration_name="default",
    top=5
)`,
        keyPoints: ["Hybrid = vector + BM25 + RRF", "Semantic ranker for precision", "Return top 3-5 chunks to LLM"],
      },
      {
        id: "indexers-skills",
        title: "Indexers, Skillsets & Knowledge Store",
        content: `**AI-102 exam tests the enrichment pipeline:**

**Indexer workflow:** Data source (Blob) → Indexer reads docs → Skillset enriches → Index stores results.

**Built-in skills:** OCRSkill, EntityRecognitionSkill, KeyPhraseExtractionSkill, ImageAnalysisSkill, LanguageDetectionSkill.

**Custom skills:** Azure Function HTTPS endpoint called during indexing. Receives enriched record, returns new fields.

**Knowledge Store projections:**
- **File**: Enriched images and normalized images to Blob
- **Object**: Full enriched documents as JSON in Blob
- **Table**: Flattened key-value pairs in Azure Table Storage

**Query syntax (exam tests):** Simple (\`search=\`), Lucene (\`search=*\`), full syntax with \`filter\`, \`orderby\`, \`facets\`, \`highlight\`, wildcards.`,
        keyPoints: [
          "Indexer automates source → skillset → index",
          "Custom skills are Azure Functions",
          "Knowledge Store: file, object, table projections",
          "Know query syntax: filter, facet, highlight, wildcard",
        ],
      },
      {
        id: "ingestion",
        title: "Document Ingestion Pipeline",
        content: `Blob → Document Intelligence (layout) → chunk (512-1024 tokens, 10-20% overlap) → embed → upsert to index. Use mergeOrUpload for incremental updates.`,
        keyPoints: ["Document Intelligence for PDF layout", "Header-based chunking", "mergeOrUpload for incremental updates"],
      },
    ],
  },
  {
    slug: "ai-foundry",
    title: "Microsoft Foundry Studio",
    subtitle: "Hubs, projects, prompt flow, and evaluation pipelines",
    description:
      "Foundry portal and SDK for building, testing, and deploying generative AI solutions — central to AI-901, AI-102, and AI-103.",
    difficulty: "intermediate",
    duration: "60 min",
    services: ["Microsoft Foundry", "Prompt Flow", "Azure OpenAI"],
    exams: ["AI-901", "AI-102", "AI-103"],
    sections: [
      {
        id: "hub-project",
        title: "Hub & Project Model",
        content: `Hub = shared infrastructure (OpenAI connections, model catalog, compute). Project = isolated workspace (experiments, evaluations, deployments). One Hub per environment; projects per app/team.`,
        keyPoints: ["Hub = shared, Project = isolated", "RBAC at both levels", "Connect services once at Hub level"],
      },
      {
        id: "prompt-flow",
        title: "Prompt Flow",
        content: `Visual DAG: LLM nodes, Python nodes, conditional branches, embedding nodes, search nodes. Export as Python for CI/CD. Deploy as managed online endpoints.`,
        keyPoints: ["Prompt Flow is a DAG, not templates", "Export for CI/CD", "Search node for inline RAG"],
      },
      {
        id: "evaluation",
        title: "Evaluation & Observability",
        content: `Built-in evaluators: groundedness, relevance, coherence, fluency, safety. Create golden datasets. Gate deployments on minimum scores. Trace in App Insights.`,
        keyPoints: ["Groundedness critical for RAG", "Golden datasets before iteration", "Gate deploys on eval thresholds"],
      },
    ],
  },
  {
    slug: "vector-databases",
    title: "Vector Storage on Azure",
    subtitle: "AI Search vs Cosmos DB vs PostgreSQL pgvector",
    description: "Vector store selection for RAG and agent workloads — tested in scenario-based exam questions.",
    difficulty: "advanced",
    duration: "40 min",
    services: ["Cosmos DB", "PostgreSQL", "AI Search"],
    exams: ["AI-102", "AI-103"],
    sections: [
      {
        id: "comparison",
        title: "Vector Store Decision Matrix",
        content: `RAG with full-text + vector → AI Search. Massive scale NoSQL → Cosmos DB DiskANN. Relational + vector → PostgreSQL pgvector.`,
        keyPoints: ["AI Search for hybrid search", "Cosmos for billion-scale", "PostgreSQL for relational + vector"],
      },
      {
        id: "cosmos-vectors",
        title: "Cosmos DB Vector Patterns",
        content: `Vectors as float32[] with DiskANN indexing. VectorDistance function with partition key filters for tenant isolation.`,
        codeExample: `SELECT TOP 10 c.id, c.content,
    VectorDistance(c.vector, @queryVector) AS score
FROM c WHERE c.tenantId = @tenantId
ORDER BY VectorDistance(c.vector, @queryVector)`,
        keyPoints: ["float32 arrays in documents", "Partition key filter before vector search", "DiskANN for extreme scale"],
      },
    ],
  },
  {
    slug: "security",
    title: "Security & Responsible AI",
    subtitle: "Managed Identity, content safety, prompt shields, and governance",
    description: "Security and responsible AI across all exams — authentication, content filters, blocklists, and governance frameworks.",
    difficulty: "advanced",
    duration: "60 min",
    services: ["Key Vault", "Private Link", "Content Safety"],
    exams: ["AI-102", "AI-103", "AI-300"],
    sections: [
      {
        id: "identity",
        title: "Identity & Network Security",
        content: `Managed Identity + RBAC (\`Cognitive Services OpenAI User\`). Disable public access. Private Endpoints in VNet. API Management for gateway auth and rate limiting.`,
        codeExample: `credential = DefaultAzureCredential()
token = credential.get_token("https://cognitiveservices.azure.com/.default")
client = AzureOpenAI(azure_endpoint=endpoint, azure_ad_token=token.token)`,
        keyPoints: ["Managed Identity over API keys", "Disable public network access", "Private Endpoints for VNet isolation"],
        warning: "API keys in env vars fail most exam security scenarios — answer Managed Identity.",
      },
      {
        id: "content-safety",
        title: "Content Safety, Filters & Governance",
        content: `**AI-102/103 responsible AI implementation:**

**Content Safety API:** Severity scores (0-6) for hate, violence, self-harm, sexual content. Configure per-category thresholds.

**Content filters in Azure OpenAI:** Input and output filtering. Custom blocklists for domain-specific terms.

**Prompt shields:** Detect jailbreak and prompt injection attempts in user input.

**Harm detection:** Block requests for dangerous content generation.

**Governance framework:** Trace logging, provenance metadata, approval workflows, human oversight for high-risk decisions.`,
        keyPoints: [
          "Content Safety severity 0-6 per category",
          "Prompt shields against jailbreak/injection",
          "Custom blocklists beyond default filters",
          "Governance = logging + oversight + approval workflows",
        ],
      },
    ],
  },
  {
    slug: "production-ops",
    title: "Production Operations & FinOps",
    subtitle: "Monitoring, cost optimization, and scaling",
    description: "Operational excellence for AI-102/103/300 — token budgeting, diagnostic settings, and cost management.",
    difficulty: "advanced",
    duration: "50 min",
    services: ["Azure Monitor", "App Insights", "Cost Management"],
    exams: ["AI-102", "AI-103", "AI-300"],
    sections: [
      {
        id: "monitoring",
        title: "Observability for AI Pipelines",
        content: `Track tokens/request, retrieval hit rate, latency decomposition, error rates by type. Diagnostic settings → Log Analytics. Alert at 80% quota utilization.`,
        keyPoints: ["Tokens per request = primary cost driver", "Alert at 80% quota", "Decompose retrieval vs inference latency"],
      },
      {
        id: "cost-optimization",
        title: "FinOps for LLM Workloads",
        content: `Model selection (4o-mini for 80% of tasks), semantic caching (30-60% savings), Batch API (50% off), PTU for high-volume. Tag resources for cost attribution.`,
        keyPoints: ["GPT-4o-mini as default", "Semantic caching highest ROI", "PTU above 60% sustained utilization"],
      },
    ],
  },
];

export const modules: LearningModule[] = [...extendedModules, ...coreModules];

export function getModule(slug: string): LearningModule | undefined {
  return modules.find((m) => m.slug === slug);
}