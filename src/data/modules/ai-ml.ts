import { LearningModule } from "@/lib/types";

export const aiMlModules: LearningModule[] = [
  {
    slug: "azure-openai",
    category: "ai-ml",
    title: "Azure OpenAI Service",
    subtitle: "GPT deployments, embeddings, and production inference",
    description:
      "Deploy and consume large language models on Azure with enterprise security, quota management, and streaming.",
    difficulty: "intermediate",
    duration: "90 min",
    services: ["Azure OpenAI", "Content Safety"],
    sections: [
      {
        id: "deployments",
        title: "Deployments & Quota Management",
        content: `Azure OpenAI exposes models as **named deployments** inside an Azure OpenAI resource. Your application always references the **deployment name** in API calls — never the raw model ID (e.g., \`gpt-4o\`). This indirection lets you swap models behind a stable name and run multiple deployments of the same model with different capacity.

**Quota model**: Capacity is measured in **TPM** (tokens per minute) and **RPM** (requests per minute), allocated **per model, per region, per subscription**. Deployments consume quota from this pool. A single deployment cannot exceed available quota for that model in the region.

| Quota dimension | What it limits | Tuning lever |
|---|---|---|
| **TPM** | Total tokens processed per minute | Increase deployment capacity or request quota |
| **RPM** | Concurrent request count | Batch smaller prompts; use streaming |
| **Regional capacity** | Model availability by geography | Deploy in multiple regions for failover |

**Requesting quota increases**: Azure Portal → your OpenAI resource → **Quotas** → select model → **Request quota increase**. Provide use case, expected TPM/RPM, and timeline. Enterprise agreements often get faster approval. Plan ahead — GPT-4 class models can take days.

**Deployment sizing workflow**:
1. Estimate peak TPM: (avg input tokens + avg output tokens) × requests/minute
2. Add 30–50% headroom for burst traffic
3. Create deployment with allocated TPM
4. Monitor 429 responses and adjust capacity or implement client-side throttling

**API versioning**: Pin \`api_version\` in production (e.g., \`2024-10-21\`). Preview versions change without notice. Test upgrades in a staging resource before rolling forward.`,
        codeExample: `from openai import AzureOpenAI
import time
from openai import RateLimitError

client = AzureOpenAI(
    azure_endpoint="https://my-openai.openai.azure.com/",
    api_key=os.environ["AZURE_OPENAI_KEY"],  # Prefer DefaultAzureCredential in prod
    api_version="2024-10-21",
    max_retries=0,  # Handle backoff yourself for observability
)

def chat_with_backoff(messages: list, deployment: str, max_retries: int = 5):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model=deployment,  # deployment name, NOT model ID
                messages=messages,
                temperature=0,
                max_tokens=1024,
                stream=True,
            )
        except RateLimitError:
            wait = min(2 ** attempt + random.uniform(0, 1), 60)
            time.sleep(wait)
    raise RuntimeError("Quota exhausted after retries")

# Stream tokens to the client for responsive chat UIs
stream = chat_with_backoff(
    [{"role": "user", "content": "Summarize our refund policy."}],
    deployment="gpt-4o-prod",
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`,
        keyPoints: [
          "Deployment name = model parameter in every API call",
          "TPM/RPM quotas are per-model, per-region — plan capacity early",
          "Pin api_version and test upgrades in staging first",
          "Stream responses to improve perceived latency in chat UIs",
        ],
        warning:
          "Undersized TPM quota causes 429 storms that cascade through your app. Monitor quota utilization weekly and request increases before launch spikes — not after outages.",
      },
      {
        id: "prompt-engineering",
        title: "Prompt Engineering & Structured Output",
        content: `Production LLM apps succeed or fail on **prompt design**, not model choice alone. Treat prompts as versioned artifacts — store them in source control, A/B test changes, and evaluate with held-out datasets.

**System prompt anatomy**:
1. **Role & scope** — who the model is and what it must not do
2. **Grounding rules** — cite sources, say "I don't know" when context is insufficient
3. **Output format** — JSON schema, markdown sections, or bullet constraints
4. **Few-shot examples** — 2–5 representative input/output pairs for edge cases

| Technique | When to use | Trade-off |
|---|---|---|
| **Zero-shot** | Simple, well-defined tasks | Lowest token cost; less consistent |
| **Few-shot** | Format-sensitive or domain-specific output | Higher input tokens |
| **Chain-of-thought** | Multi-step reasoning, math, logic | Slower; disable for latency-critical paths |
| **JSON mode / structured outputs** | Downstream parsing, tool calls | Requires schema validation on your side |

**Temperature guidance**: Use \`temperature=0\` for deterministic extraction, classification, and RAG answers. Use 0.3–0.7 for creative drafting. Never rely on temperature alone for safety — combine with Content Safety filters and output validation.

**Token budgeting**: Reserve output tokens explicitly with \`max_tokens\`. For RAG, allocate ~70% of context window to retrieved chunks and ~30% to conversation history. Truncate oldest turns first when context fills.

**Structured output pattern**: Request JSON, parse with Pydantic, retry once on validation failure with the error message appended to the prompt.`,
        codeExample: `from pydantic import BaseModel, Field
from openai import AzureOpenAI

client = AzureOpenAI(azure_endpoint=endpoint, api_key=key, api_version="2024-10-21")

class TicketClassification(BaseModel):
    category: str = Field(description="billing | technical | account")
    urgency: str = Field(description="low | medium | high")
    summary: str = Field(max_length=120)

response = client.beta.chat.completions.parse(
    model="gpt-4o-deployment",
    messages=[
        {"role": "system", "content": (
            "Classify support tickets. Output only valid JSON matching the schema. "
            "If ambiguous, set urgency to medium."
        )},
        {"role": "user", "content": "I was charged twice for my subscription this month."},
    ],
    response_format=TicketClassification,
    temperature=0,
)
result: TicketClassification = response.choices[0].message.parsed
print(result.category, result.urgency)  # billing high`,
        keyPoints: [
          "Version prompts in source control; evaluate changes before deploy",
          "temperature=0 for extraction and RAG; higher only for creative tasks",
          "Structured outputs + Pydantic validation prevent silent parse failures",
          "Budget context window: retrieved chunks first, trim old chat history",
        ],
      },
      {
        id: "embeddings-rag",
        title: "Embeddings & RAG Foundations",
        content: `Retrieval-Augmented Generation (RAG) grounds LLM answers in your private data. Azure OpenAI **embedding deployments** convert text into dense vectors for similarity search.

**Model selection**:

| Model | Dimensions | Best for |
|---|---|---|
| **text-embedding-3-small** | 1536 (default) | Cost-effective RAG at scale |
| **text-embedding-3-large** | 3072 | Higher retrieval precision, 2× cost |
| **text-embedding-ada-002** | 1536 | Legacy; migrate to 3-small |

**Chunking strategy** (often matters more than embedding model):
1. Split on semantic boundaries (headings, paragraphs) before fixed token windows
2. Target **512–1024 tokens** per chunk with **10–20% overlap**
3. Prepend document title and section heading to each chunk for context
4. Store metadata: \`source\`, \`page\`, \`lastModified\`, \`tenantId\`

**Indexing cost optimization**: Use the **Batch API** for offline embedding jobs — ~50% cheaper than real-time. Submit JSONL files, poll for completion, write vectors to AI Search or your vector DB.

**RAG retrieval flow**:
1. Embed user query with the same model used at index time
2. Hybrid search: vector similarity + keyword (BM25) via AI Search
3. Re-rank top 50 candidates with semantic ranker → send top 3–5 to LLM
4. Instruct model to answer only from provided context; cite chunk IDs`,
        codeExample: `from openai import AzureOpenAI

client = AzureOpenAI(azure_endpoint=endpoint, api_key=key, api_version="2024-10-21")

def embed_texts(texts: list[str], deployment: str = "text-embedding-3-small") -> list[list[float]]:
    # Batch up to 2048 inputs per request; stay under TPM limits
    response = client.embeddings.create(model=deployment, input=texts)
    return [item.embedding for item in response.data]

chunks = [
    "Refund Policy: Full refund within 30 days of purchase.",
    "Refund Policy: Pro-rated refund after 30 days with manager approval.",
]
vectors = embed_texts(chunks)

# Batch API for large corpora (50% discount)
batch_file = client.files.create(file=open("chunks.jsonl", "rb"), purpose="batch")
batch_job = client.batches.create(
    input_file_id=batch_file.id,
    endpoint="/v1/embeddings",
    completion_window="24h",
)`,
        keyPoints: [
          "text-embedding-3-small is the default for cost-effective RAG",
          "Chunk at 512–1024 tokens with overlap; prepend headings for context",
          "Batch API cuts embedding cost ~50% for offline indexing",
          "Always embed queries with the same model/version used at index time",
        ],
      },
      {
        id: "production",
        title: "Production Security & Reliability",
        content: `Shipping Azure OpenAI to production requires defense-in-depth beyond the API call itself.

**Authentication hierarchy** (prefer top to bottom):
1. **Managed Identity** + Azure RBAC (\`Cognitive Services OpenAI User\`)
2. **Entra ID service principal** with certificate (not client secret)
3. **API keys** — rotate quarterly; never in client-side code or repos

**Network isolation**: Enable **Private Link** so traffic never traverses the public internet. Pair with VNet integration on App Service / AKS. Disable public network access on the OpenAI resource.

**Content Safety**: Apply filters on **input and output** for hate, violence, sexual content, and self-harm. Configure severity thresholds per category. Log blocked requests for review — do not silently drop without audit trail.

**Reliability patterns**:
- Exponential backoff with jitter on 429 and 503
- Circuit breaker when error rate exceeds threshold
- Regional failover: secondary OpenAI resource in paired region
- Cache identical prompts (Redis) for FAQ-style queries — watch for stale answers

**Observability**: Log prompt hash (not raw text if PII), token usage, latency p50/p95, and finish reason. Azure Monitor + Application Insights provide built-in metrics for the OpenAI resource.`,
        codeExample: `from azure.identity import DefaultAzureCredential
from openai import AzureOpenAI

# Managed Identity — no API keys in code or Key Vault rotation burden
credential = DefaultAzureCredential()
token = credential.get_token("https://cognitiveservices.azure.com/.default")

client = AzureOpenAI(
    azure_endpoint="https://my-openai.privatelink.openai.azure.com/",
    azure_ad_token=token.token,
    api_version="2024-10-21",
)

response = client.chat.completions.create(
    model="gpt-4o-prod",
    messages=[{"role": "user", "content": "Hello"}],
    extra_headers={"x-ms-client-request-id": correlation_id},  # trace requests
)`,
        keyPoints: [
          "Managed Identity + RBAC replaces API keys in production",
          "Private Link + disabled public access for regulated workloads",
          "Content Safety on input and output; log blocked requests",
          "Backoff on 429s, circuit breakers, and regional failover for HA",
        ],
        warning:
          "Never expose API keys in client-side code, mobile apps, or browser JavaScript. A leaked key drains your entire TPM quota within minutes and cannot be revoked granularly per application.",
      },
    ],
    quiz: [
      {
        question:
          "In Azure OpenAI API calls, what value should you pass to the `model` parameter?",
        options: [
          "The raw model ID (e.g., gpt-4o)",
          "The deployment name you created in Azure",
          "The Azure resource name",
          "The API version string",
        ],
        answer: 1,
        explanation:
          "Azure OpenAI uses deployment names as the model parameter. This lets you swap underlying models without changing application code.",
      },
      {
        question:
          "Your app receives frequent HTTP 429 errors during peak hours. What is the first corrective action?",
        options: [
          "Switch to a larger model deployment",
          "Increase TPM quota or deployment capacity for that model/region",
          "Disable Content Safety filters",
          "Lower max_tokens to 1",
        ],
        answer: 1,
        explanation:
          "429 indicates rate limiting against your TPM/RPM quota. Increase allocated capacity or request a quota increase before tuning application logic.",
      },
    ],
  },
  {
    slug: "ai-search-rag",
    category: "ai-ml",
    title: "AI Search & RAG Pipelines",
    subtitle: "Hybrid search, semantic ranking, and knowledge mining",
    description:
      "Build retrieval-augmented generation with vector search, BM25, semantic ranker, and enrichment skillsets.",
    difficulty: "intermediate",
    duration: "100 min",
    services: ["AI Search", "Document Intelligence", "Blob Storage"],
    sections: [
      {
        id: "index-design",
        title: "Index Design & Vector Search",
        content: `Azure AI Search indexes are the retrieval engine for most Azure RAG architectures. A well-designed index balances **recall** (find relevant docs), **precision** (rank them correctly), and **latency** (sub-200ms queries).

**Core field types**:

| Field attribute | Purpose | Example |
|---|---|---|
| **searchable** | Full-text BM25 matching | \`content\`, \`title\` |
| **filterable** | Pre-filter before vector search | \`tenantId\`, \`department\` |
| **facetable** | Aggregations in search UI | \`category\`, \`docType\` |
| **retrievable** | Returned in results | all display fields |
| **Collection(Edm.Single)** | Vector field for HNSW | \`contentVector\` |

**Vector configuration**: Use **HNSW** algorithm with \`m=4\`, \`efConstruction=400\`, \`efSearch=500\` as a starting point. Higher \`efSearch\` improves recall at query time but increases latency. Match vector dimensions to your embedding model (1536 for text-embedding-3-small).

**Multi-tenant isolation**: Add a **filterable** \`tenantId\` field. Always apply \`filter="tenantId eq 'abc'"\` in queries — never rely on post-query filtering. Pre-filtering before vector search is faster and prevents data leakage.

**Scoring profiles**: Boost recent documents with \`freshness\` functions or prioritize titles with \`magnitude\` / \`tag\` boosts. Combine with semantic ranker for best results.`,
        codeExample: `from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchableField, SearchField,
    VectorSearch, HnswAlgorithmConfiguration, VectorSearchProfile,
)
from azure.core.credentials import AzureKeyCredential

index = SearchIndex(
    name="rag-index",
    fields=[
        SimpleField(name="id", type="Edm.String", key=True),
        SimpleField(name="tenantId", type="Edm.String", filterable=True),
        SearchableField(name="title", type="Edm.String"),
        SearchableField(name="content", type="Edm.String"),
        SearchField(
            name="contentVector",
            type="Collection(Edm.Single)",
            searchable=True,
            vector_search_dimensions=1536,
            vector_search_profile_name="hnsw-profile",
        ),
    ],
    vector_search=VectorSearch(
        algorithms=[HnswAlgorithmConfiguration(name="hnsw", kind="hnsw")],
        profiles=[VectorSearchProfile(name="hnsw-profile", algorithm_configuration_name="hnsw")],
    ),
)
SearchIndexClient(endpoint, AzureKeyCredential(admin_key)).create_or_update_index(index)`,
        keyPoints: [
          "Filterable tenantId with pre-filter on every query — never post-filter",
          "HNSW vectors: match dimensions to embedding model (1536 for 3-small)",
          "searchable text fields for BM25; vector fields for semantic similarity",
          "Scoring profiles boost freshness and title relevance atop base rank",
        ],
      },
      {
        id: "hybrid-search",
        title: "Hybrid Search & Semantic Ranking",
        content: `Pure vector search misses exact keyword matches (SKUs, error codes, legal citations). Pure BM25 misses paraphrases. **Hybrid search** combines both and merges rankings with **Reciprocal Rank Fusion (RRF)**.

**Hybrid query anatomy**:
1. \`search_text\` — BM25 keyword query (user's natural language)
2. \`vector_queries\` — embedding of the same query against \`contentVector\`
3. \`query_type="semantic"\` — activates semantic ranker on top 50 candidates
4. Return **top 3–5** chunks to the LLM (more adds noise and tokens)

**Tuning hybrid search**:

| Symptom | Likely cause | Fix |
|---|---|---|
| Misses exact codes/SKUs | Vector-dominant results | Increase keyword weight; add searchable \`keywords\` field |
| Misses paraphrases | BM25-dominant results | Verify embedding model consistency; increase k in vector query |
| Slow queries | High k or efSearch | Reduce vector \`k\` to 10; lower efSearch; add filters |
| Irrelevant top results | Weak chunking | Improve chunk boundaries; enable semantic ranker |

**Semantic ranker**: Re-scores the top 50 results using a Microsoft-hosted transformer model. Requires **Basic tier or higher**. Adds ~50–100ms latency but significantly improves precision for natural language queries.

**Step-by-step hybrid tuning**:
1. Establish baseline with 20–50 labeled question–document pairs
2. Run hybrid + semantic; record MRR@5 and nDCG
3. Adjust vector \`k\` (5, 10, 20) and chunk count sent to LLM
4. Add scoring profile for document freshness if content is time-sensitive
5. Re-evaluate after any embedding model or chunking change`,
        codeExample: `from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

search_client = SearchClient(endpoint, "rag-index", AzureKeyCredential(query_key))

def hybrid_search(query: str, query_vector: list[float], tenant_id: str, top: int = 5):
    return search_client.search(
        search_text=query,
        vector_queries=[{
            "kind": "vector",
            "vector": query_vector,
            "fields": "contentVector",
            "k": 10,
        }],
        query_type="semantic",
        semantic_configuration_name="default",
        filter=f"tenantId eq '{tenant_id}'",
        select=["id", "title", "content", "source"],
        top=top,
    )

results = hybrid_search(
    "What is the refund window for enterprise plans?",
    query_vector=embed(query),
    tenant_id="contoso",
)
context_chunks = [doc["content"] for doc in results]`,
        keyPoints: [
          "Hybrid = BM25 + vector + RRF; neither alone is sufficient for RAG",
          "Semantic ranker re-scores top 50 — requires Basic+ tier",
          "Send only top 3–5 chunks to the LLM to reduce noise and cost",
          "Evaluate with labeled Q&A pairs; tune k and chunk count systematically",
        ],
        warning:
          "Semantic ranker and vector search at scale can spike costs on Basic+ SKUs. Monitor search unit (SU) consumption and set index quotas; a misconfigured indexer reprocessing millions of blobs is a common surprise bill.",
      },
      {
        id: "enrichment",
        title: "Indexers, Skillsets & Knowledge Mining",
        content: `AI Search **indexers** automate the ingest pipeline: data source → enrichment → index. This is an **index-time** pipeline — enrichment runs when documents are indexed, not at query time.

**Pipeline components**:
1. **Data source** — Blob Storage, SQL, Cosmos DB, SharePoint
2. **Indexer** — schedules and tracks document processing
3. **Skillset** — enrichment steps chained together
4. **Index** — final searchable destination
5. **Knowledge Store** (optional) — project enriched data to Blob/Table for analytics

**Built-in skills**: OCR (Document Intelligence), entity recognition, key phrase extraction, language detection, text splitting.

**Custom skills**: Azure Functions (HTTP trigger) that accept enriched documents and return transformed records. Use for proprietary classification, custom embedding calls, or PII redaction.

**Indexer best practices**:
- Use **high-watermark** change detection on Blob \`lastModified\`
- Schedule incremental runs (hourly/daily) instead of full reindex
- Map base64-encoded images through OCR skill before text merge
- Set \`batchSize\` and \`maxFailedItems\` to control blast radius on bad documents

**Document cracking**: Indexers extract text from PDF, Office, HTML automatically. For complex layouts (tables, forms), route through **Document Intelligence** custom skill first — raw PDF extraction loses table structure.`,
        codeExample: `from azure.search.documents.indexes.models import (
    SearchIndexer, SearchIndexerDataSourceConnection,
    SearchIndexerSkillset, OcrSkill, MergeSkill,
)

skillset = SearchIndexerSkillset(
    name="rag-skillset",
    skills=[
        OcrSkill(
            context="/document/normalized_images/*",
            default_language_code="en",
            inputs=[{"name": "image", "source": "/document/normalized_images/*"}],
            outputs=[{"name": "text", "target_name": "ocrText"}],
        ),
        MergeSkill(
            context="/document",
            inputs=[
                {"name": "text", "source": "/document/content"},
                {"name": "itemsToInsert", "source": "/document/normalized_images/*/ocrText"},
            ],
            outputs=[{"name": "mergedText", "target_name": "merged_content"}],
        ),
        # Custom skill: call Azure Function to generate embeddings
    ],
    cognitive_services_account={"description": "doc-intel", "key": cs_key},
)`,
        keyPoints: [
          "Indexers run at index time; query path stays fast and predictable",
          "Custom skills are Azure Functions — embed, classify, or redact PII",
          "Incremental indexing with change detection avoids full reprocessing",
          "Document Intelligence for complex PDFs; built-in cracking loses tables",
        ],
      },
      {
        id: "rag-pipeline",
        title: "End-to-End RAG Pipeline",
        content: `A production RAG system chains ingestion, retrieval, generation, and evaluation into a repeatable pipeline.

**Architecture (step-by-step)**:

| Step | Service | Action |
|---|---|---|
| 1. Ingest | Blob Storage | Land raw PDFs, HTML, DOCX with metadata |
| 2. Extract | Document Intelligence | Layout-aware text + table extraction |
| 3. Chunk | Custom Function / code | Split into 512–1024 token chunks with overlap |
| 4. Embed | Azure OpenAI | Batch-embed chunks; store vectors |
| 5. Index | AI Search | Push documents + vectors; configure semantic ranker |
| 6. Query | App + AI Search | Hybrid search with tenant filter |
| 7. Generate | Azure OpenAI | Grounded answer with citation instructions |
| 8. Evaluate | Prompt Flow / custom | Measure groundedness, relevance, latency |

**Prompt template for grounded answers**:
\`\`\`
System: Answer ONLY using the provided context. Cite chunk IDs in brackets.
If the context is insufficient, say "I don't have that information."
Context: {retrieved_chunks}
Question: {user_query}
\`\`\`

**Failure modes to test**:
- Empty retrieval (no matching docs) → model must refuse, not hallucinate
- Contradictory chunks → instruct model to note conflict
- Stale content → freshness boost + \`lastModified\` in metadata
- Cross-tenant leakage → integration test every filter path

**CI/CD for RAG**: Version indexes with alias swap (\`rag-index-v2\` → alias \`rag-index\`). Run evaluation suite before alias cutover. Keep rollback to prior index one command away.`,
        codeExample: `def rag_answer(query: str, tenant_id: str) -> dict:
    # 1. Embed query
    q_vector = embed([query])[0]

    # 2. Hybrid retrieve
    docs = list(hybrid_search(query, q_vector, tenant_id, top=5))
    if not docs:
        return {"answer": "I don't have that information.", "sources": []}

    # 3. Build grounded prompt
    context = "\\n---\\n".join(
        f"[{d['id']}] {d['title']}\\n{d['content']}" for d in docs
    )
    messages = [
        {"role": "system", "content": (
            "Answer ONLY from context. Cite chunk IDs in brackets. "
            "If insufficient, say you don't know."
        )},
        {"role": "user", "content": f"Context:\\n{context}\\n\\nQuestion: {query}"},
    ]

    # 4. Generate
    response = aoai_client.chat.completions.create(
        model="gpt-4o-deployment", messages=messages, temperature=0,
    )
    return {
        "answer": response.choices[0].message.content,
        "sources": [{"id": d["id"], "title": d["title"]} for d in docs],
    }`,
        keyPoints: [
          "Pipeline: ingest → extract → chunk → embed → index → retrieve → generate",
          "Instruct LLM to refuse when retrieval is empty — test this explicitly",
          "Index aliases enable zero-downtime index version swaps",
          "Evaluate groundedness before every index or prompt change",
        ],
      },
    ],
    quiz: [
      {
        question:
          "Why should you apply a tenantId filter in the AI Search query rather than filtering results in application code?",
        options: [
          "Application-level filtering is faster",
          "Pre-filtering at the index prevents cross-tenant data leakage and improves performance",
          "AI Search does not return filterable fields",
          "Semantic ranker requires filterable fields",
        ],
        answer: 1,
        explanation:
          "Pre-filtering before vector and text search ensures tenants never see each other's documents and reduces the candidate set early in the query pipeline.",
      },
      {
        question:
          "What does the semantic ranker do in a hybrid search query?",
        options: [
          "Generates embeddings at query time",
          "Re-ranks the top 50 candidates using a transformer model for better precision",
          "Replaces BM25 keyword search entirely",
          "Compresses vectors to reduce index size",
        ],
        answer: 1,
        explanation:
          "Semantic ranker re-scores the top 50 results from hybrid search using a Microsoft-hosted model, significantly improving relevance for natural language queries.",
      },
    ],
  },
  {
    slug: "microsoft-foundry",
    category: "ai-ml",
    title: "Microsoft Foundry",
    subtitle: "Hubs, projects, agents, and prompt flows",
    description:
      "Unified AI development studio for building, evaluating, and deploying generative AI and agent solutions.",
    difficulty: "intermediate",
    duration: "95 min",
    services: ["Microsoft Foundry", "Prompt Flow", "Agent Service"],
    sections: [
      {
        id: "studio",
        title: "Hub, Project & Model Catalog",
        content: `Microsoft Foundry (Azure AI Foundry) is the unified control plane for building, evaluating, and deploying generative AI solutions. It replaces the fragmented experience of separate OpenAI Studio, ML Studio, and AI Search portals.

**Hierarchy**:

| Resource | Scope | Shared assets |
|---|---|---|
| **Hub** | Organization / environment | Connections, compute, policies, private endpoints |
| **Project** | Team / workload | Experiments, datasets, deployments, evaluations |
| **Connection** | Hub-level credential | Azure OpenAI, AI Search, Blob, Cosmos DB |

**One Hub per environment** (dev, staging, prod). Projects isolate experiments within a Hub — a marketing chatbot project should not share deployment quotas with a fraud-detection agent.

**Model catalog**: Browse and deploy models from OpenAI (GPT-4o, o-series), Meta (Llama), Mistral, Cohere, and Microsoft Research. Deployments provisioned through the catalog inherit Hub networking and identity policies. **Model-as-a-Service (MaaS)** endpoints require no infrastructure management — pay per token.

**Connections management**: Store Azure OpenAI, AI Search, and Storage credentials once at the Hub. Projects reference connections by name — rotating a key updates all dependent flows.

**Governance**: Apply RBAC at Hub scope (\`Azure AI Developer\`, \`Azure AI Owner\`). Enable diagnostic logs to Log Analytics. Use Managed VNet for outbound isolation when flows call external APIs.`,
        keyPoints: [
          "Hub = shared infra; Project = isolated workspace per workload",
          "Model catalog centralizes OpenAI, open-source, and partner models",
          "Connections are Hub-scoped — rotate credentials in one place",
          "One Hub per environment; separate projects for team isolation",
        ],
      },
      {
        id: "agents",
        title: "Agent Patterns & Agent Service",
        content: `An **agent** is an LLM with a goal, tools, memory, and a reasoning loop. Microsoft Foundry Agent Service hosts agents with managed orchestration, thread state, and tool routing.

**Core agent loop**:
1. Receive user message + thread history
2. LLM plans next action (respond or call tool)
3. Execute tool (search, code, API call)
4. Append tool result to thread
5. Repeat until goal met or max iterations reached

**Common agent patterns**:

| Pattern | Tools | Use case |
|---|---|---|
| **RAG agent** | AI Search, file retrieval | Q&A over enterprise knowledge |
| **Action agent** | REST APIs, Logic Apps | Book meetings, create tickets |
| **Code agent** | Python interpreter, shell | Data analysis, file transforms |
| **Multi-agent** | Agent-to-agent messaging | Research → draft → review pipelines |

**Guardrails for production agents**:
- **Max iterations** (5–10) — prevents runaway tool loops and cost explosions
- **Tool allowlists** — explicit enumeration of permitted actions
- **Human-in-the-loop** — confirm destructive operations before execution
- **Token budget per thread** — truncate history or summarize old turns
- **Groundedness checks** — evaluate answers against retrieved context before returning

**Agent Service vs. DIY**: Managed service handles thread persistence, tool auth, and scaling. Build custom loops only when you need exotic orchestration (dynamic agent spawning, custom memory stores).`,
        codeExample: `from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://my-hub.services.ai.azure.com/api/projects/my-project",
    credential=DefaultAzureCredential(),
)

agent = project.agents.create_agent(
    model="gpt-4o-deployment",
    name="support-agent",
    instructions=(
        "You are a support agent. Search the knowledge base before answering. "
        "If no relevant docs exist, escalate to a human. Max 3 tool calls per turn."
    ),
    tools=[
        {"type": "azure_ai_search", "azure_ai_search": {
            "connection_id": "search-conn", "index_name": "rag-index",
        }},
        {"type": "function", "function": {
            "name": "create_ticket",
            "description": "Create a support ticket",
            "parameters": {"type": "object", "properties": {
                "title": {"type": "string"}, "priority": {"type": "string"},
            }},
        }},
    ],
)

thread = project.agents.create_thread()
project.agents.create_message(thread_id=thread.id, role="user", content="My invoice is wrong.")
run = project.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)`,
        keyPoints: [
          "Agents = LLM + tools + memory + loop; always set max iterations",
          "RAG, action, code, and multi-agent are the four core patterns",
          "Tool allowlists and human-in-the-loop for destructive actions",
          "Agent Service manages threads, auth, and scaling — prefer over DIY",
        ],
        warning:
          "Unbounded agent loops can burn thousands of tokens in minutes. Set max_iterations, per-thread token budgets, and cost alerts on the backing OpenAI deployment before exposing agents to end users.",
      },
      {
        id: "prompt-flows",
        title: "Prompt Flow & Deterministic DAGs",
        content: `**Prompt Flow** models AI workflows as directed acyclic graphs (DAGs) — each node is a step (LLM call, Python code, search lookup, conditional branch). Unlike free-form agents, flows are **deterministic and testable**.

**Node types**:

| Node | Purpose |
|---|---|
| **LLM** | Chat completion with templated prompts |
| **Python** | Data transforms, validation, custom logic |
| **AI Search** | Hybrid retrieval step |
| **Conditional** | Branch on classification result |
| **Aggregate** | Merge parallel branch outputs |

**When to choose Flow vs. Agent**:
- **Prompt Flow** — regulated outputs, fixed steps, compliance audit trail, CI/CD promotion
- **Agent** — exploratory tasks, dynamic tool selection, conversational flexibility

**Development workflow**:
1. Prototype in Visual Studio Code with Prompt Flow extension
2. Parameterize prompts with \`{{input}}\` template variables
3. Add evaluation node with golden dataset (50+ examples)
4. Export as runnable Python package
5. Deploy to Managed Online Endpoint or integrate in App Service

**CI/CD integration**: Export flow as \`flow.dag.yaml\` + Python tools. Pipeline stages: lint → unit test nodes → evaluate on holdout → deploy to staging endpoint → promote to prod.`,
        codeExample: `# flow.dag.yaml (simplified)
# inputs:
#   question: string
# outputs:
#   answer: string
# nodes:
#   - name: embed_query
#     type: python
#     source: embed.py
#     inputs: { query: \${inputs.question} }
#   - name: retrieve
#     type: python
#     source: search.py
#     inputs: { vector: \${embed_query.output} }
#   - name: generate
#     type: llm
#     inputs:
#       deployment_name: gpt-4o-deployment
#       prompt: |
#         Context: \${retrieve.output}
#         Question: \${inputs.question}
#     outputs: { answer: \${generate.output} }

# Run locally for testing
# pf run create --flow . --data eval.jsonl --stream`,
        keyPoints: [
          "Prompt Flow = deterministic DAG; agents = dynamic tool loops",
          "Use flows for auditable, testable pipelines with fixed steps",
          "Export as Python for CI/CD — evaluate before every promotion",
          "Parameterize prompts; version flow YAML in source control",
        ],
      },
      {
        id: "evaluation",
        title: "Evaluation, Safety & Deployment",
        content: `Shipping AI from Foundry requires systematic evaluation — not just "it looks good."

**Built-in evaluators**:

| Metric | Measures | Threshold guidance |
|---|---|---|
| **Groundedness** | Answer supported by context | > 0.8 for production RAG |
| **Relevance** | Response addresses the question | > 0.85 |
| **Coherence** | Logical flow and readability | > 0.8 |
| **Fluency** | Grammar and natural language | > 0.9 |
| **PII detection** | Personal data in outputs | Zero tolerance |

**Evaluation workflow**:
1. Curate golden dataset (100+ Q&A pairs with expected sources)
2. Run batch evaluation against current flow/agent version
3. Compare metrics to baseline — block deploy if groundedness drops > 5%
4. Add adversarial cases: prompt injection, empty context, off-topic queries
5. Log evaluation runs for audit trail

**Deployment options**:
- **Managed compute** — Foundry hosts the endpoint; simplest path
- **Export to App Service / AKS** — full control over scaling and networking
- **API wrapper** — expose flow as REST with Entra ID auth

**Safety**: Enable content filters on all model deployments. Add input sanitization node in flows to strip injection patterns. Red-team with OWASP LLM Top 10 scenarios before production launch.`,
        keyPoints: [
          "Evaluate groundedness, relevance, and PII before every deploy",
          "Golden dataset of 100+ pairs; block deploy on metric regression",
          "Adversarial testing: injection, empty context, off-topic queries",
          "Content filters + input sanitization on every production endpoint",
        ],
      },
    ],
    quiz: [
      {
        question:
          "When should you choose Prompt Flow over a Foundry Agent?",
        options: [
          "When the task requires dynamic, unpredictable tool selection",
          "When you need a deterministic, auditable pipeline with fixed steps",
          "When you want the lowest possible latency",
          "When you do not have access to Azure OpenAI",
        ],
        answer: 1,
        explanation:
          "Prompt Flow excels at deterministic, testable DAGs with fixed steps — ideal for regulated or compliance-sensitive workflows. Agents suit dynamic tool selection.",
      },
      {
        question:
          "What is the most critical guardrail to prevent runaway agent costs?",
        options: [
          "Using temperature=0",
          "Setting max iterations on the agent loop",
          "Enabling semantic ranker",
          "Using text-embedding-3-large",
        ],
        answer: 1,
        explanation:
          "Max iterations caps the number of LLM ↔ tool cycles, preventing infinite loops that consume unbounded tokens and API calls.",
      },
    ],
  },
  {
    slug: "azure-machine-learning",
    category: "ai-ml",
    title: "Azure Machine Learning",
    subtitle: "Training, MLOps, and model deployment",
    description:
      "End-to-end ML platform — experiment tracking, AutoML, pipelines, and managed endpoints.",
    difficulty: "advanced",
    duration: "120 min",
    services: ["Azure ML", "MLflow", "AutoML"],
    sections: [
      {
        id: "workspace",
        title: "Workspace, Experiments & AutoML",
        content: `Azure Machine Learning (Azure ML) is the enterprise MLOps platform for the full model lifecycle: data → train → register → deploy → monitor → retrain.

**Workspace components**:

| Asset | Purpose |
|---|---|
| **Datastores** | Credential-abstracted access to Blob, ADLS, SQL |
| **Compute targets** | Clusters (AmlCompute), instance (dev box), attached (Databricks) |
| **Environments** | Docker images with Python deps — reproducible runs |
| **Components** | Reusable pipeline steps with typed inputs/outputs |
| **Datasets** | Registered data references with versioning |

**MLflow integration**: Every training run logs parameters, metrics, and artifacts automatically. Use \`mlflow.azureml.autolog()\` for sklearn/PyTorch/TensorFlow. Compare runs in Azure ML Studio or query via MLflow API. Promote the best run to a **registered model**.

**AutoML**: Define task (classification, regression, forecasting), dataset, and target metric. AutoML explores algorithms (XGBoost, LightGBM, deep neural nets), featurization, and hyperparameters. Use for rapid baselines — then hand-tune the winning pipeline.

**Experiment tracking best practices**:
- Log **data hash** with every run for reproducibility
- Tag runs: \`git_commit\`, \`data_version\`, \`author\`
- Store conda/pip dependencies in Environment, not on the cluster
- Use nested runs for hyperparameter sweeps`,
        codeExample: `from azure.ai.ml import MLClient, command, Input, Output
from azure.ai.ml.entities import Environment, AmlCompute
from azure.identity import DefaultAzureCredential

ml_client = MLClient(
    DefaultAzureCredential(),
    subscription_id="...",
    resource_group_name="ml-rg",
    workspace_name="ml-workspace",
)

# Define reusable environment
env = Environment(
    name="sklearn-env",
    conda_file="conda.yaml",
    image="mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu20.04:latest",
)

# Submit training job
job = command(
    code="./src",
    command="python train.py --data \${{inputs.training_data}}",
    inputs={"training_data": Input(type="uri_folder", path="azureml:iris-data:1")},
    outputs={"model": Output(type="uri_folder")},
    environment=env,
    compute="cpu-cluster",
    experiment_name="iris-classification",
    display_name="rf-baseline",
)
returned_job = ml_client.jobs.create_or_update(job)
print(f"Job submitted: {returned_job.studio_url}")`,
        keyPoints: [
          "Workspace assets: datastores, compute, environments, components",
          "MLflow autologs params/metrics/artifacts — tag git commit and data version",
          "AutoML for rapid baselines; hand-tune the winning pipeline",
          "Environments ensure reproducible runs across compute targets",
        ],
      },
      {
        id: "mlops-pipelines",
        title: "MLOps Pipelines & CI/CD",
        content: `Production ML requires **automated pipelines** — not one-off notebook runs. Azure ML Pipelines orchestrate multi-step workflows with dependency tracking, caching, and retry.

**Pipeline step types**:
1. **Command jobs** — run a script on compute (train, evaluate, preprocess)
2. **Parallel jobs** — fan-out hyperparameter sweeps
3. **Pipeline jobs** — chain steps with input/output wiring

**MLOps CI/CD stages**:

| Stage | Trigger | Actions |
|---|---|---|
| **CI — Train** | PR or scheduled | Lint, unit test, train on sample data, log metrics |
| **CI — Evaluate** | Train completes | Compare metrics to champion model; gate on accuracy/F1 |
| **CD — Register** | Eval passes | Register model with version tag \`staging\` |
| **CD — Deploy** | Manual approval | Deploy to staging endpoint → smoke test → prod |
| **Monitor** | Continuous | Data drift, latency, error rate → trigger retrain |

**Step-by-step pipeline build**:
1. Convert notebook cells into \`train.py\`, \`evaluate.py\`, \`score.py\`
2. Define Components for each script with typed inputs/outputs
3. Wire Components into a Pipeline with \`@pipeline\` decorator
4. Schedule pipeline (weekly retrain) or trigger via Azure DevOps
5. Register output model; deploy via blue-green endpoint swap

**Component caching**: Identical inputs skip re-execution — critical for expensive preprocessing. Change a component version to invalidate cache deliberately.`,
        codeExample: `from azure.ai.ml.dsl import pipeline
from azure.ai.ml import command, Input, Output

# Reusable components
preprocess_comp = command(
    name="preprocess",
    code="./components/preprocess",
    command="python run.py --input \${{inputs.raw}} --output \${{outputs.cleaned}}",
    inputs={"raw": Input(type="uri_folder")},
    outputs={"cleaned": Output(type="uri_folder")},
    environment="sklearn-env@latest",
)

train_comp = command(
    name="train",
    code="./components/train",
    command="python run.py --data \${{inputs.data}} --model \${{outputs.model}}",
    inputs={"data": Input(type="uri_folder")},
    outputs={"model": Output(type="uri_folder")},
    environment="sklearn-env@latest",
)

@pipeline(default_compute="cpu-cluster")
def mlops_pipeline(raw_data):
    preprocess_step = preprocess_comp(raw=raw_data)
    train_step = train_comp(data=preprocess_step.outputs.cleaned)
    return {"model": train_step.outputs.model}

pipeline_job = mlops_pipeline(raw_data=Input(path="azureml:raw-data:2"))
ml_client.jobs.create_or_update(pipeline_job, experiment_name="mlops-pipeline")`,
        keyPoints: [
          "Pipelines chain train → evaluate → register with dependency tracking",
          "CI gates on metric regression; CD promotes via staging endpoint",
          "Component caching skips unchanged steps — version to invalidate",
          "Convert notebooks to scripts before productionizing",
        ],
        warning:
          "Leaving AmlCompute clusters running 24/7 is the #1 ML cost leak. Enable auto-scaling with min_nodes=0, set idle shutdown to 30 minutes, and use spot instances for fault-tolerant training jobs.",
      },
      {
        id: "deployment",
        title: "Model Deployment & Endpoints",
        content: `Azure ML supports two primary deployment models for scoring.

**Online endpoints (real-time)**:
- Single managed HTTPS endpoint with **blue-green** traffic splitting
- Deploy multiple model versions; route 10% traffic to challenger
- Auto-scaling based on request rate and CPU/GPU utilization
- Latency target: < 100ms for tabular models, < 2s for deep learning

**Batch endpoints (async)**:
- Score large datasets on schedule or event trigger
- Input: file path in Blob/ADLS → Output: scored parquet/CSV
- Cost-efficient for millions of rows; no idle compute cost
- Parallelize across cluster nodes automatically

**Deployment workflow**:
1. Register model in workspace model registry with version and tags
2. Create environment with scoring script (\`score.py\`) and dependencies
3. Deploy to managed online endpoint (blue deployment)
4. Run smoke tests; shift 100% traffic from old (green) to new (blue)
5. Archive previous version after monitoring window

**Scoring script contract**:
\`\`\`python
def init():
    global model
    model = joblib.load(os.path.join(os.getenv("AZUREML_MODEL_DIR"), "model.pkl"))

def run(raw_data):
    data = json.loads(raw_data)
    predictions = model.predict(proba=data["features"])
    return {"predictions": predictions.tolist()}
\`\`\``,
        codeExample: `from azure.ai.ml.entities import (
    ManagedOnlineEndpoint, ManagedOnlineDeployment, CodeConfiguration,
    BatchEndpoint, BatchDeployment, Model, Environment,
)

# Real-time online endpoint with blue-green
endpoint = ManagedOnlineEndpoint(name="churn-predictor", auth_mode="key")
ml_client.online_endpoints.begin_create_or_update(endpoint).result()

deployment = ManagedOnlineDeployment(
    name="blue",
    endpoint_name="churn-predictor",
    model=Model(path="azureml:churn-model:3"),
    environment=Environment(name="scoring-env@latest"),
    code_configuration=CodeConfiguration(code="./scoring", scoring_script="score.py"),
    instance_type="Standard_DS3_v2",
    instance_count=2,
)
ml_client.online_deployments.begin_create_or_update(deployment).result()

# Route 100% traffic to new deployment
endpoint.traffic = {"blue": 100}
ml_client.online_endpoints.begin_create_or_update(endpoint).result()`,
        keyPoints: [
          "Online endpoints for real-time; batch endpoints for bulk async scoring",
          "Blue-green traffic splitting for safe progressive rollout",
          "Register models with versions; scoring script follows init/run contract",
          "Auto-scale online endpoints; batch scales across cluster nodes",
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring, Drift & Retraining",
        content: `Deployed models degrade as production data shifts from training distributions. Azure ML monitoring closes the loop.

**What to monitor**:

| Signal | Detection | Response |
|---|---|---|
| **Data drift** | Feature distribution shift (PSI, KS test) | Alert → investigate → retrain |
| **Prediction drift** | Output distribution change | Check upstream data pipeline |
| **Data quality** | Missing values, schema violations | Block scoring; fix pipeline |
| **Operational** | Latency p95, error rate, throughput | Scale compute; rollback deployment |

**Azure ML Model Monitor** (preview): Configure baseline dataset (training data) and target dataset (production scoring inputs). Schedule daily drift calculations. Integrate alerts with Azure Monitor Action Groups → PagerDuty / Teams.

**Retraining trigger pipeline**:
1. Monitor detects drift above threshold (e.g., PSI > 0.2)
2. Event Grid fires retraining pipeline
3. Pipeline pulls latest labeled data from datastore
4. Train → evaluate → compare to champion
5. If metric improves, register new version and deploy to staging
6. Progressive rollout after staging validation

**Responsible AI**: Run fairness assessments across demographic groups before deployment. Log explanations (SHAP) for regulated industries. Document model cards with intended use, limitations, and training data provenance.`,
        codeExample: `from azure.ai.ml.entities import DataDriftMonitor, MonitorTarget, MonitorSignal

monitor = DataDriftMonitor(
    compute="cpu-cluster",
    frequency="1d",
    window_size="7d",
    signals=[
        MonitorSignal(
            signal_type="data_drift",
            baseline_data_input=Input(path="azureml:training-data:1"),
            target_data_input=Input(path="azureml:production-scoring:latest"),
            features=["age", "income", "tenure_months"],
            metric_thresholds={"population_stability_index": 0.2},
        ),
    ],
)
# Alert → Event Grid → retraining pipeline
# ml_client.schedules.begin_create_or_update(retrain_schedule)`,
        keyPoints: [
          "Monitor data drift, prediction drift, and operational metrics daily",
          "PSI > 0.2 on key features is a common retraining trigger",
          "Event Grid chains drift alerts to automated retraining pipelines",
          "Fairness assessments and model cards before production deploy",
        ],
        warning:
          "Deploying a model without drift monitoring means silent accuracy decay — business decisions degrade weeks before anyone notices. Always configure a baseline and alert threshold at deploy time, not after incidents.",
      },
    ],
    quiz: [
      {
        question:
          "What is the recommended deployment pattern for safely rolling out a new model version to production?",
        options: [
          "Delete the old endpoint and create a new one",
          "Blue-green deployment with traffic splitting on a managed online endpoint",
          "Deploy directly to production and monitor for 24 hours",
          "Use batch endpoints for all production scoring",
        ],
        answer: 1,
        explanation:
          "Blue-green deployments on managed online endpoints let you route traffic gradually (e.g., 10% → 100%) and roll back instantly if the new version underperforms.",
      },
      {
        question:
          "Which Azure ML feature skips re-execution of unchanged pipeline steps?",
        options: [
          "MLflow autolog",
          "Component caching based on identical inputs",
          "AutoML ensemble selection",
          "Batch endpoint parallelization",
        ],
        answer: 1,
        explanation:
          "Azure ML Pipeline component caching detects when inputs haven't changed and reuses previous step outputs, saving time and compute on expensive preprocessing.",
      },
    ],
  },
];