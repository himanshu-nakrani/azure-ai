import { LearningModule } from "@/lib/types";

export const extendedModules: LearningModule[] = [
  {
    slug: "ai-fundamentals",
    title: "AI Fundamentals & Responsible AI",
    subtitle: "AI-901: concepts, workloads, and the Microsoft Foundry portfolio",
    description:
      "Foundational knowledge for AI-901 — responsible AI principles, workload identification, model selection, and when to use each Foundry service.",
    difficulty: "foundational",
    duration: "90 min",
    services: ["Microsoft Foundry", "Content Safety", "Azure OpenAI"],
    exams: ["AI-901"],
    sections: [
      {
        id: "responsible-ai",
        title: "Responsible AI Principles",
        content: `Microsoft's responsible AI framework has six pillars tested heavily on AI-901 and woven through all associate exams:

| Principle | What it means on Azure | Exam focus |
|---|---|---|
| **Fairness** | Models must not discriminate against protected groups. Test with diverse datasets. | Bias detection, representative training data |
| **Reliability & Safety** | Systems behave as intended under expected and edge conditions. Fail gracefully. | Content filters, harm detection, fallback paths |
| **Privacy & Security** | PII is detected, redacted, and never logged in plaintext. Data stays in-region. | PII detection, Private Link, Managed Identity |
| **Inclusiveness** | Solutions work for people with disabilities and diverse languages. | Speech, translation, alt-text generation |
| **Transparency** | Users know they're interacting with AI. Limitations are documented. | Disclaimers, citation of sources in RAG |
| **Accountability** | Humans oversee high-risk decisions. Audit trails exist. | Trace logging, approval workflows for agents |

**Exam trap**: Responsible AI is not just Content Safety filters — it includes governance frameworks, human-in-the-loop oversight, and transparency requirements.`,
        keyPoints: [
          "Six pillars: fairness, reliability, privacy, inclusiveness, transparency, accountability",
          "Content Safety is one tool — not the entire responsible AI strategy",
          "RAG systems need source citations for transparency",
          "Agents require tool-access controls and oversight modes",
        ],
      },
      {
        id: "workloads",
        title: "Identifying AI Workloads",
        content: `Know which Azure service handles each workload — this is the core AI-901 service-selection skill:

**Generative AI**: Azure OpenAI / Foundry Models — text/code/image generation, summarization, chat, RAG.

**Agentic AI**: Microsoft Foundry Agent Service + Agent Framework — autonomous workflows with tool calling, memory, multi-step reasoning.

**Text Analysis**: Azure AI Language in Foundry Tools — entity recognition, key phrases, sentiment, PII detection, language detection.

**Speech**: Azure AI Speech in Foundry Tools — speech-to-text, text-to-speech, SSML, custom speech models, intent recognition.

**Computer Vision**: Azure Vision in Foundry Tools — image tagging, object detection, OCR, spatial analysis. Custom Vision for domain-specific classification/detection.

**Information Extraction**: Azure AI Search (indexing + enrichment), Document Intelligence (structured forms), Content Understanding (multimodal extraction from docs/images/audio/video).

**Machine Learning**: Azure Machine Learning — traditional ML model training, AutoML, MLOps (AI-300 territory).`,
        keyPoints: [
          "Generative ≠ Agentic: agents have tools, memory, and autonomous loops",
          "Document Intelligence for structured forms; Content Understanding for multimodal",
          "Custom Vision when prebuilt models aren't accurate enough",
          "AI Search is the knowledge mining backbone for RAG",
        ],
      },
      {
        id: "model-selection",
        title: "Model Components & Deployment Options",
        content: `AI-901 and all associate exams test model selection and configuration:

**Model types:**
- **LLMs** (GPT-4o, GPT-4.1): Complex reasoning, code generation, multi-turn chat
- **Small language models** (Phi-4): Edge deployment, low latency, cost-sensitive tasks
- **Multimodal models** (GPT-4o): Text + image input, visual question answering
- **Embedding models** (text-embedding-3-small): Vector representations for search/RAG
- **Image generation** (DALL-E 3 in Azure OpenAI): Text-to-image
- **Speech models**: Transcription, synthesis, custom voice

**Deployment options:**
- **Serverless API**: Pay-per-token, no infrastructure management (most Foundry models)
- **Provisioned Throughput Units (PTU)**: Reserved capacity for predictable high-volume workloads
- **Managed compute**: Deploy open-source models on dedicated GPU clusters in Foundry
- **Containers**: Run models on-premises or at edge via Azure Container Instances

**Key parameters:**
- \`temperature\` (0–2): Randomness. Use 0 for deterministic, 0.7+ for creative
- \`top_p\`: Nucleus sampling alternative to temperature
- \`max_tokens\`: Cap output length — always set this in production
- \`frequency_penalty\` / \`presence_penalty\`: Reduce repetition`,
        keyPoints: [
          "PTU for high-volume production; serverless for variable/dev workloads",
          "Multimodal models accept image + text in the same prompt",
          "Always set max_tokens to control cost and response length",
          "Small models (Phi) for edge and latency-sensitive scenarios",
        ],
      },
    ],
    quiz: [
      {
        question: "Which principle ensures users know they are interacting with an AI system?",
        options: ["Fairness", "Reliability", "Transparency", "Inclusiveness"],
        answer: 2,
        explanation: "Transparency requires that AI systems disclose their nature and limitations to users.",
      },
    ],
  },
  {
    slug: "plan-manage-foundry",
    title: "Plan & Manage Microsoft Foundry",
    subtitle: "AI-102/103/300: service selection, deployment, monitoring, and security",
    description:
      "The highest-weighted topic across associate exams — choosing Foundry services, deploying resources, CI/CD integration, cost management, and authentication.",
    difficulty: "intermediate",
    duration: "75 min",
    services: ["Microsoft Foundry", "Azure Monitor", "API Management", "Container Instances"],
    exams: ["AI-102", "AI-103", "AI-300"],
    sections: [
      {
        id: "service-selection",
        title: "Selecting Foundry Services",
        content: `Exam questions present a scenario and ask which service to use. Decision matrix:

| Scenario | Service | Why not the others |
|---|---|---|
| Chatbot grounded in company docs | AI Search + Azure OpenAI | Language analytics can't retrieve documents |
| Classify support tickets by urgency | Azure AI Language (custom text classification) | OpenAI is overkill and less controllable |
| Detect defects on manufacturing line | Custom Vision (object detection) | Prebuilt Vision lacks domain specificity |
| Extract fields from invoices | Document Intelligence (prebuilt-invoice) | Manual OCR misses table structure |
| Real-time meeting transcription | Azure Speech (batch or real-time STT) | Language service doesn't handle audio |
| Multi-agent research workflow | Foundry Agent Service + Agent Framework | Single prompt flow can't orchestrate agents |
| Monitor model token usage | Azure Monitor + Foundry diagnostics | App Insights alone lacks AI-specific metrics |
| Image generation from text | Azure OpenAI (DALL-E) or Foundry image models | Vision analyzes; it doesn't generate |

**Foundry Tools** is the umbrella term for prebuilt cognitive services (Vision, Speech, Language, Document Intelligence, Content Understanding) integrated into the Foundry portal.`,
        keyPoints: [
          "Read scenario keywords: 'classify', 'extract', 'transcribe', 'generate', 'search'",
          "Custom Vision requires labeled training data; prebuilt Vision works out of the box",
          "Agent Service for autonomous multi-step; prompt flow for deterministic DAGs",
          "Foundry Tools = cognitive services accessed through the Foundry portal",
        ],
      },
      {
        id: "deployment",
        title: "Deploying Foundry Resources",
        content: `**Resource creation workflow (exam hands-on pattern):**
1. Create an Azure AI Services multi-service resource OR individual service resources
2. Create a Foundry Hub (shared infrastructure for the team)
3. Create a Foundry Project within the Hub (isolated workspace)
4. Connect Azure OpenAI, AI Search, Storage, and other services to the Hub
5. Deploy models (choose model version, set deployment name, allocate capacity)
6. Configure default endpoints and API versions

**CI/CD integration:**
- Export prompt flows as Python code for GitHub Actions pipelines
- Use Azure DevOps or GitHub Actions to deploy model endpoints
- Infrastructure as Code: Bicep templates for Foundry resources, AI Search, OpenAI
- Container deployment: package custom models in Docker for ACI or AKS

**Container deployment** (AI-102 specific): Some Foundry services support Docker containers for on-premises or disconnected environments. You download the container image, provide API key and endpoint configuration, and run locally.`,
        codeExample: `# Bicep snippet — Azure OpenAI resource
resource openai 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: 'my-openai'
  location: location
  kind: 'OpenAI'
  sku: { name: 'S0' }
  properties: {
    customSubDomainName: 'my-openai'
    publicNetworkAccess: 'Disabled'
  }
}`,
        keyPoints: [
          "Hub = shared connections; Project = isolated experiments",
          "Disable public network access for production resources",
          "Bicep/ARM for reproducible infrastructure (AI-300)",
          "Pin API versions in CI/CD for reproducible deployments",
        ],
      },
      {
        id: "monitor-secure",
        title: "Monitor, Manage Cost & Secure",
        content: `**Monitoring (exam favorites):**
- Diagnostic settings → Log Analytics for all AI resources
- Track: token consumption, request latency, error rates (429, 400), content filter blocks
- AI Search: query volume, index size, indexer failures, skillset execution errors
- Set alerts at 80% quota utilization before hitting rate limits

**Cost management:**
- Tag resources with environment, project, cost-center
- Set budgets and alerts in Cost Management
- Use GPT-4o-mini for dev/test; reserve GPT-4o for production quality paths
- PTU vs pay-as-you-go: PTU wins above ~60% sustained utilization
- Batch API for offline embedding and completion jobs (50% discount)

**Authentication (know this cold):**
- **Managed Identity** + RBAC roles: \`Cognitive Services OpenAI User\`, \`Cognitive Services User\`
- **Key-based auth**: API keys stored in Key Vault — rotate regularly
- **Entra ID (Azure AD)**: Token-based auth via \`DefaultAzureCredential\`
- **Private Endpoints**: Disable public access, route through VNet
- **Never** embed API keys in client-side code or source control`,
        codeExample: `from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

credential = DefaultAzureCredential()
client = AIProjectClient(
    endpoint="https://my-hub.services.ai.azure.com/api/projects/my-project",
    credential=credential
)`,
        keyPoints: [
          "Managed Identity eliminates API key management — preferred for production",
          "Diagnostic settings must be explicitly enabled (not on by default)",
          "RBAC role 'Cognitive Services OpenAI User' for inference access",
          "Cost Management budgets prevent surprise token bills",
        ],
        warning: "Exam scenarios often show API keys in code — the correct answer is always Managed Identity or Key Vault.",
      },
    ],
    quiz: [
      {
        question: "A company needs to deploy AI services with no public internet exposure. What do you configure?",
        options: [
          "API keys in environment variables",
          "Private Endpoints with public network access disabled",
          "A higher service tier",
          "Content Safety filters",
        ],
        answer: 1,
        explanation: "Private Endpoints route traffic through the VNet. Combined with disabled public access, no traffic traverses the public internet.",
      },
    ],
  },
  {
    slug: "agents",
    title: "AI Agents & Orchestration",
    subtitle: "AI-102/103: Foundry Agent Service, Agent Framework, and multi-agent workflows",
    description:
      "Build, test, and deploy agents with tool calling, memory, multi-agent orchestration, and safety guardrails — 30-35% of AI-103.",
    difficulty: "advanced",
    duration: "80 min",
    services: ["Foundry Agent Service", "Agent Framework", "AI Search", "Azure Functions"],
    exams: ["AI-102", "AI-103"],
    sections: [
      {
        id: "agent-concepts",
        title: "Agent Roles & Architecture",
        content: `An **agent** is an LLM with tools, memory, and a goal loop — not just a chatbot.

**Components:**
- **Role/goal**: System prompt defining the agent's purpose and constraints
- **Tools**: Functions the agent can call (search, APIs, code execution, database queries)
- **Memory**: Conversation history + long-term knowledge store
- **Orchestrator**: Routes tasks between agents in multi-agent systems

**Foundry Agent Service** (managed): Create agents in the Foundry portal or SDK. Built-in tool integration with AI Search, Azure Functions, Code Interpreter. Handles deployment and scaling.

**Microsoft Agent Framework** (code-first): Python SDK for complex multi-agent workflows — supervisor patterns, handoff between agents, human-in-the-loop approval gates.

**Multi-agent patterns (AI-103):**
- **Supervisor**: One agent routes to specialist sub-agents (research, code, data)
- **Sequential**: Agents pass output to the next in a pipeline
- **Parallel**: Multiple agents work simultaneously, results merged
- **Autonomous**: Agent loops until goal met — requires max-iteration limits and safety guardrails`,
        keyPoints: [
          "Agents = LLM + tools + memory + goal loop",
          "Always set max iteration limits on autonomous agents",
          "Supervisor pattern: GPT-4o routes, sub-agents can use cheaper models",
          "Tool schemas must be precisely defined — exam tests JSON schema format",
        ],
      },
      {
        id: "building-agents",
        title: "Building & Deploying Agents",
        content: `**Agent creation workflow:**
1. Define agent role, instructions, and available tools
2. Configure tool connections (AI Search index, Function endpoints, OpenAPI specs)
3. Set up conversation memory (Cosmos DB, in-memory, or Foundry-managed)
4. Test in Foundry playground with evaluation metrics
5. Deploy as endpoint; integrate via SDK into application

**Tool integration types:**
- **AI Search**: Agent queries knowledge base for RAG
- **Azure Functions**: Custom business logic, API calls
- **Code Interpreter**: Execute Python for data analysis
- **OpenAPI**: Connect to any REST API with a spec
- **Bing Grounding**: Web search for current information`,
        codeExample: `from azure.ai.agents import AgentsClient
from azure.ai.agents.models import Agent, ToolSet

agents_client = AgentsClient(endpoint=endpoint, credential=credential)

agent = agents_client.create_agent(
    model="gpt-4o-deployment",
    name="support-agent",
    instructions="Answer support questions using the knowledge base.",
    tools=ToolSet(
        azure_ai_search=[{
            "connection_id": search_connection_id,
            "index_name": "support-kb",
            "query_type": "semantic"
        }]
    )
)

thread = agents_client.create_thread()
agents_client.create_message(thread_id=thread.id, role="user",
    content="How do I reset my password?")
run = agents_client.create_run(thread_id=thread.id, agent_id=agent.id)`,
        keyPoints: [
          "create_agent → create_thread → create_message → create_run",
          "Tools are defined in ToolSet with connection IDs to Foundry resources",
          "Semantic query type on AI Search tool improves retrieval quality",
          "Evaluate agents for groundedness before production deployment",
        ],
      },
      {
        id: "multi-agent",
        title: "Multi-Agent Orchestration & Safety",
        content: `**AI-103 multi-agent requirements:**
- Implement orchestrated solutions with supervisor routing
- Build autonomous workflows with safeguards and approval flow controls
- Integrate monitoring: trace agent decisions, tool calls, token usage
- Govern with oversight modes: human approval before high-risk actions

**Safety for agents (exam-critical):**
- **Tool-access controls**: Each agent gets minimum necessary tools (least privilege)
- **Prompt shields**: Detect jailbreak attempts in user input
- **Harm detection**: Block requests for dangerous content
- **Approval workflows**: Human reviews before executing financial/legal actions
- **Trace logging**: Every tool call, decision, and LLM response logged for audit
- **Oversight modes**: Agent proposes actions; human approves before execution`,
        keyPoints: [
          "Least-privilege tool access per agent",
          "Prompt shields defend against jailbreak/injection attacks",
          "Approval workflows required for high-risk autonomous actions",
          "Trace logging enables debugging and compliance auditing",
        ],
        warning: "Autonomous agents without max-iteration limits and approval gates are a common exam wrong-answer trap.",
      },
    ],
    quiz: [
      {
        question: "What distinguishes an agent from a standard chatbot?",
        options: [
          "Agents use larger models",
          "Agents can call tools, maintain memory, and loop toward goals",
          "Agents only work in the Foundry portal",
          "Agents don't need system prompts",
        ],
        answer: 1,
        explanation: "Agents extend chatbots with tool calling, memory, and autonomous goal-directed loops.",
      },
    ],
  },
  {
    slug: "computer-vision",
    title: "Computer Vision Solutions",
    subtitle: "AI-102/103: image analysis, Custom Vision, video, and multimodal generation",
    description:
      "Analyze images, train custom models, process video, and build multimodal understanding workflows tested across associate exams.",
    difficulty: "intermediate",
    duration: "70 min",
    services: ["Azure Vision", "Custom Vision", "Video Indexer", "Content Understanding"],
    exams: ["AI-102", "AI-103", "AI-901"],
    sections: [
      {
        id: "image-analysis",
        title: "Image Analysis with Azure Vision",
        content: `**Azure Vision in Foundry Tools** provides prebuilt image analysis:

**Visual features (select in API request):**
- **Tags**: General object/scene labels with confidence scores
- **Objects**: Object detection with bounding boxes
- **Description**: Natural language caption of the image
- **Faces**: Face detection (not recognition — no identity)
- **Adult/racy/gore**: Content moderation classification
- **Color**: Dominant colors and accent color
- **Image types**: Clip art vs. line drawing vs. photo
- **Smart Crop**: Generate thumbnail with focal region

**OCR capabilities:**
- **Read API**: Extract printed and handwritten text from images
- Supports 25+ languages for printed text
- Returns bounding boxes per word/line for layout reconstruction

**Spatial Analysis** (video): Detect people presence and movement in camera feeds. Use cases: occupancy counting, social distancing, queue management. Runs on edge devices or cloud.`,
        codeExample: `from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures

client = ImageAnalysisClient(endpoint=endpoint, credential=credential)
result = client.analyze(
    image_url="https://example.com/photo.jpg",
    visual_features=[
        VisualFeatures.TAGS,
        VisualFeatures.OBJECTS,
        VisualFeatures.READ,
        VisualFeatures.CAPTION,
    ]
)
for obj in result.objects.list:
    print(f"{obj.tags[0].name}: {obj.bounding_box}")`,
        keyPoints: [
          "Select only needed VisualFeatures — each adds latency and cost",
          "Read API handles both printed and handwritten text",
          "Spatial Analysis works on video streams, not static images",
          "Face detection ≠ face recognition (no identity matching)",
        ],
      },
      {
        id: "custom-vision",
        title: "Custom Vision Models",
        content: `When prebuilt models lack accuracy for your domain, use **Custom Vision**:

**Classification vs. Object Detection:**
- **Classification**: Assigns labels to entire images ("defective" vs "normal")
- **Object Detection**: Finds and labels objects with bounding boxes within images

**Workflow:**
1. Create a Custom Vision project (classification or detection)
2. Upload and **label** images (tag each image or draw bounding boxes)
3. **Train** the model (Quick Build for prototyping, Advanced for production)
4. **Evaluate** per-tag precision, recall, and AP (average precision)
5. **Publish** with a prediction endpoint
6. **Consume** via REST API or SDK with prediction key

**Minimum data**: 50 images per tag for reasonable accuracy. More diverse images = better generalization.

**Code-first training** (AI-102): Use the Custom Vision SDK to automate upload, train, and publish programmatically.`,
        codeExample: `from azure.cognitiveservices.vision.customvision.prediction import (
    CustomVisionPredictionClient
)

predictor = CustomVisionPredictionClient(endpoint, PredictionCredentials(prediction_key))
result = predictor.classify_image(project_id, published_name, image_bytes)

for prediction in result.predictions:
    print(f"{prediction.tag_name}: {prediction.probability:.2%}")`,
        keyPoints: [
          "Classification = whole image label; Detection = bounding boxes",
          "Need 50+ labeled images per tag minimum",
          "Evaluate precision/recall per tag before publishing",
          "Published name is the model version identifier for the endpoint",
        ],
      },
      {
        id: "video-multimodal",
        title: "Video Analysis & Multimodal Generation",
        content: `**Azure AI Video Indexer**: Extract insights from video and live streams:
- Transcript with speaker identification
- Face detection and celebrity recognition
- Scene detection and keyframe extraction
- Topic inference and keyword extraction
- Sentiment analysis on spoken content
- OCR on text appearing in video frames

**AI-103 multimodal generation:**
- Generate images from text prompts (DALL-E, Foundry image models)
- Generate videos from text + reference media
- Image editing: inpainting, mask-based edits, prompt-driven modifications
- Multimodal understanding: caption images, visual Q&A, alt-text for accessibility
- Content Understanding for visual characteristic extraction

**Responsible AI for visual content:**
- Filter unsafe/disallowed visual content
- Detect indirect prompt injection via embedded text in images
- Apply watermarks, flag prohibited symbols, enforce brand guidelines`,
        keyPoints: [
          "Video Indexer provides transcript, faces, topics, and OCR from video",
          "AI-103 adds image/video generation and editing workflows",
          "Multimodal models accept image + text in the same API call",
          "Scan generated images for embedded prompt injection attacks",
        ],
      },
    ],
    quiz: [
      {
        question: "When should you use Custom Vision instead of prebuilt Azure Vision?",
        options: [
          "For general object detection in any domain",
          "When you need domain-specific classification with labeled training data",
          "For OCR extraction",
          "For video analysis",
        ],
        answer: 1,
        explanation: "Custom Vision trains on your labeled images for domain-specific accuracy that prebuilt models can't achieve.",
      },
    ],
  },
  {
    slug: "language-speech",
    title: "Language & Speech Solutions",
    subtitle: "AI-102/103: text analytics, CLU, QnA, Translator, and Speech services",
    description:
      "NLP and speech workloads — entity extraction, sentiment, custom language understanding, question answering, translation, and SSML.",
    difficulty: "intermediate",
    duration: "80 min",
    services: ["Azure AI Language", "Azure AI Speech", "Azure Translator"],
    exams: ["AI-102", "AI-103", "AI-901"],
    sections: [
      {
        id: "text-analytics",
        title: "Text Analysis & Language Detection",
        content: `**Azure AI Language in Foundry Tools** provides:

**Prebuilt text analytics:**
- **Entity recognition**: People, places, organizations, dates, quantities
- **Key phrase extraction**: Main talking points from text
- **Sentiment analysis**: Positive/negative/neutral with confidence scores (sentence and document level)
- **Language detection**: Identifies language with ISO 639-1 codes
- **PII detection**: Finds and redacts personally identifiable information (SSN, email, phone, credit card)
- **Entity linking**: Resolves entities to Wikipedia/knowledge base IDs

**Custom text classification**: Train a model to categorize documents into your own labels (support ticket routing, spam detection).

**Custom NER (Named Entity Recognition)**: Train models to find domain-specific entities (medical terms, product SKUs).

**Exam tip**: PII detection runs BEFORE sending text to LLMs — this is a responsible AI pattern tested on every exam.`,
        codeExample: `from azure.ai.textanalytics import TextAnalyticsClient

client = TextAnalyticsClient(endpoint, AzureKeyCredential(key))
docs = ["Microsoft was founded by Bill Gates in Albuquerque."]

# Entity recognition
entities = client.recognize_entities(docs)
# PII detection
pii = client.recognize_pii_entities(docs)
# Sentiment
sentiment = client.analyze_sentiment(docs)`,
        keyPoints: [
          "PII detection before LLM calls — exam tests this sequence",
          "Sentiment works at sentence and document level",
          "Custom classification requires labeled training documents",
          "Entity linking resolves to knowledge base IDs (not just string matching)",
        ],
      },
      {
        id: "clu-qna",
        title: "Conversational Language Understanding & QnA",
        content: `**Conversational Language Understanding (CLU)** — the successor to LUIS:

**Components:**
- **Intents**: What the user wants to do (BookFlight, CheckWeather)
- **Entities**: Parameters extracted from utterances (destination, date)
- **Utterances**: Example phrases for each intent (minimum 5-10 per intent)

**Workflow:** Define intents/entities → add utterances → train → evaluate → deploy to a prediction endpoint → consume from app.

**Custom Question Answering** (replaces QnA Maker):
- Create a knowledge base with question-answer pairs
- Import sources: URLs, PDFs, DOCX, Excel
- **Multi-turn conversations**: Follow-up questions with context
- **Chit-chat**: Prebuilt casual conversation responses
- **Alternate phrasing**: Multiple ways to ask the same question
- **Multi-language**: Single KB supports multiple languages
- Export/import knowledge bases between environments`,
        keyPoints: [
          "CLU replaced LUIS — know intents, entities, utterances",
          "Question Answering supports multi-turn with active learning",
          "Import PDFs/URLs to bootstrap knowledge bases quickly",
          "Evaluate model before deploying — check precision per intent",
        ],
      },
      {
        id: "speech",
        title: "Speech Services & SSML",
        content: `**Azure AI Speech in Foundry Tools:**

**Speech-to-Text (STT):**
- Real-time transcription from microphone or stream
- Batch transcription for audio files (async, supports diarization)
- Custom speech models: train on domain vocabulary and acoustic conditions

**Text-to-Speech (TTS):**
- Neural voices in 400+ voices across 140+ languages
- **SSML (Speech Synthesis Markup Language)**: Control pronunciation, pitch, rate, pauses, emphasis
- Custom neural voice: clone a voice from training data (limited access)

**Intent and keyword recognition**: Detect voice commands without full NLU pipeline.

**Speech translation**: Real-time speech-to-speech and speech-to-text translation.

**SSML example (exam knowledge):**
\`\`\`xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody rate="-10%" pitch="+5%">
      Welcome to <emphasis level="strong">Azure AI</emphasis> Academy.
    </prosody>
    <break time="500ms"/>
  </voice>
</speak>
\`\`\``,
        codeExample: `import azure.cognitiveservices.speech as speechsdk

speech_config = speechsdk.SpeechConfig(subscription=key, region=region)
speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
synthesizer = speechsdk.SpeechSynthesizer(speech_config)

result = synthesizer.speak_ssml_async(ssml_string).get()`,
        keyPoints: [
          "SSML controls pronunciation, pitch, rate, pauses — exam tests SSML tags",
          "Custom speech models improve accuracy for domain vocabulary",
          "Batch transcription for files; real-time for live audio",
          "Speech translation works speech-to-speech across languages",
        ],
      },
    ],
    quiz: [
      {
        question: "Which service should you use to detect and redact SSNs and credit card numbers in text?",
        options: ["Azure OpenAI", "Azure AI Language PII detection", "Content Safety", "AI Search"],
        answer: 1,
        explanation: "Azure AI Language has dedicated PII detection that identifies and can redact specific entity types like SSNs and credit cards.",
      },
    ],
  },
  {
    slug: "document-intelligence",
    title: "Document Intelligence & Content Understanding",
    subtitle: "AI-102/103: form extraction, custom models, and multimodal content understanding",
    description:
      "Extract structured data from documents, train custom models, and use Content Understanding for multimodal ingestion pipelines.",
    difficulty: "intermediate",
    duration: "70 min",
    services: ["Document Intelligence", "Content Understanding", "AI Search"],
    exams: ["AI-102", "AI-103", "AI-901"],
    sections: [
      {
        id: "doc-intel",
        title: "Azure Document Intelligence",
        content: `**Prebuilt models** (no training required):
- **prebuilt-invoice**: Vendor, customer, line items, totals, dates
- **prebuilt-receipt**: Merchant, items, tax, total
- **prebuilt-idDocument**: Passports, driver's licenses, ID cards
- **prebuilt-businessCard**: Contact name, phone, email, company
- **prebuilt-layout**: Text, tables, selection marks, paragraphs with positions
- **prebuilt-read**: OCR-only text extraction

**Custom models:**
- **Custom extraction**: Label fields in sample documents → train → extract from new docs
- **Custom classification**: Route documents to the right extraction model
- **Composed models**: Combine multiple custom models behind one endpoint

**Workflow:** Upload sample docs → label fields in Document Intelligence Studio → train → evaluate field accuracy → publish → analyze new documents via API.`,
        codeExample: `from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.ai.documentintelligence.models import AnalyzeDocumentRequest

client = DocumentIntelligenceClient(endpoint, AzureKeyCredential(key))
poller = client.begin_analyze_document(
    "prebuilt-invoice",
    AnalyzeDocumentRequest(url_source="https://example.com/invoice.pdf")
)
result = poller.result()
for doc in result.documents:
    print(f"Vendor: {doc.fields['VendorName'].value_string}")
    print(f"Total: {doc.fields['InvoiceTotal'].value_currency.amount}")`,
        keyPoints: [
          "prebuilt-layout for tables/structure; prebuilt-read for OCR only",
          "Custom models need 5+ labeled samples (50+ recommended)",
          "Composed models route document types to specialized extractors",
          "Layout model preserves table structure — critical for financial docs",
        ],
      },
      {
        id: "content-understanding",
        title: "Content Understanding in Foundry Tools",
        content: `**Content Understanding** (AI-103 focus) handles multimodal extraction beyond traditional documents:

**Capabilities:**
- **OCR pipeline**: Extract text from images and documents
- **Summarize and classify**: Generate summaries, detect document type/category
- **Entity/table/image extraction**: Pull structured data from complex layouts
- **Audio processing**: Transcribe and extract information from audio files
- **Video processing**: Analyze video segments for content and context
- **Pro-mode pipelines**: Advanced multi-step analysis with higher accuracy

**Integration with agents and RAG:**
- Content Understanding produces clean markdown/structured output
- Feed directly into AI Search index for RAG grounding
- Connect as an agent tool for on-demand document analysis
- Produces provenance metadata for responsible AI auditing

**vs. Document Intelligence:**
- Document Intelligence: structured forms, invoices, receipts, IDs
- Content Understanding: multimodal (images, audio, video), summarization, classification, agent-ready output`,
        keyPoints: [
          "Content Understanding handles images, audio, video — not just PDFs",
          "Output formatted for direct RAG ingestion (markdown/structured)",
          "Pro-mode pipelines for higher accuracy on complex documents",
          "Use as agent tool for on-demand multimodal analysis",
        ],
      },
      {
        id: "search-enrichment",
        title: "AI Search Enrichment Pipeline",
        content: `**Knowledge mining** combines AI Search with cognitive skills:

**Components:**
- **Data source**: Blob storage, SQL, Cosmos DB, SharePoint
- **Skillset**: Pipeline of enrichment skills (OCR, entity extraction, image analysis, custom skills)
- **Indexer**: Automated pipeline that reads source → applies skillset → writes to index
- **Index**: Searchable fields including enriched content and vectors

**Built-in skills:**
- OCRSkill, EntityRecognitionSkill, KeyPhraseExtractionSkill
- ImageAnalysisSkill, SentimentAnalysisSkill, LanguageDetectionSkill
- DocumentExtractionSkill (pulls content from PDFs/Office docs)

**Custom skills**: Azure Function or Web API that processes documents and returns enriched fields. Deploy as an HTTPS endpoint; AI Search calls it during indexing.

**Knowledge Store**: Project enriched data to Blob (files), Table (structured), or Object (JSON) storage for downstream analytics.`,
        codeExample: `# Custom skill definition in skillset
{
  "type": "CustomSkill",
  "name": "classify-document",
  "description": "Classify document type",
  "uri": "https://my-function.azurewebsites.net/api/classify",
  "httpMethod": "POST",
  "inputs": [{"name": "text", "source": "/document/content"}],
  "outputs": [{"name": "category", "targetName": "docCategory"}]
}`,
        keyPoints: [
          "Indexer = automated source → skillset → index pipeline",
          "Custom skills are Azure Functions called during indexing",
          "Knowledge Store projects enriched data to Blob/Table/Object storage",
          "Skillset enrichment happens at index time, not query time",
        ],
      },
    ],
    quiz: [
      {
        question: "What is the minimum recommended number of labeled samples for a custom Document Intelligence model?",
        options: ["1", "5 (50+ recommended)", "1000", "No training data needed"],
        answer: 1,
        explanation: "Custom models require at least 5 labeled samples, but 50+ is recommended for production-quality accuracy.",
      },
    ],
  },
  {
    slug: "azure-ml-mlops",
    title: "Azure ML & MLOps",
    subtitle: "AI-300: workspace management, training pipelines, and model deployment",
    description:
      "Azure Machine Learning workspace, MLflow tracking, AutoML, model registration, endpoint deployment, and drift monitoring.",
    difficulty: "advanced",
    duration: "90 min",
    services: ["Azure Machine Learning", "MLflow", "GitHub Actions", "Bicep"],
    exams: ["AI-300"],
    sections: [
      {
        id: "workspace",
        title: "ML Workspace & Assets",
        content: `**Azure ML Workspace** is the top-level container for all ML assets:

**Core resources:**
- **Datastores**: Connections to Blob, ADLS, SQL, Snowflake
- **Compute targets**: Compute instances (dev), compute clusters (training), inference clusters
- **Data assets**: Registered datasets with version tracking
- **Environments**: Docker images defining training/inference dependencies
- **Components**: Reusable pipeline steps (like functions)
- **Registries**: Share assets across workspaces in an organization

**Identity & access:**
- RBAC roles: Data Scientist, ML Engineer, Compute Operator
- Managed Identity for datastore access (no keys in notebooks)
- Network isolation: private endpoints for workspace and compute

**IaC with Bicep (AI-300):**
Deploy workspaces, compute, and datastores via Bicep templates. Integrate with GitHub Actions for automated provisioning. Restrict network access to approved VNets.`,
        keyPoints: [
          "Workspace contains datastores, compute, environments, components",
          "Registries share assets across workspaces",
          "Bicep + GitHub Actions for IaC deployment (AI-300)",
          "Managed Identity for datastore access in production",
        ],
      },
      {
        id: "training",
        title: "Model Training & Experiment Tracking",
        content: `**MLflow integration** (built into Azure ML):
- Track experiments: parameters, metrics, artifacts
- Log models with signature and input example
- Compare runs across experiments in the studio

**Automated ML (AutoML):**
- Automatically tries algorithms and hyperparameters
- Supports: classification, regression, forecasting, NLP, computer vision
- Outputs best model with explainability metrics

**Training pipelines:**
- Chain components into reproducible DAGs
- Schedule recurring training on new data
- Distributed training for large/deep learning models

**Hyperparameter tuning**: Bayesian sampling or grid search across parameter space. Azure ML runs parallel trials on compute cluster.`,
        codeExample: `import mlflow
from azure.ai.ml import MLClient

ml_client = MLClient(credential, subscription_id, resource_group, workspace)

with mlflow.start_run(run_name="experiment-1"):
    mlflow.log_param("learning_rate", 0.01)
    mlflow.log_metric("accuracy", 0.95)
    mlflow.sklearn.log_model(model, "model")`,
        keyPoints: [
          "MLflow is the standard experiment tracker in Azure ML",
          "AutoML for rapid baseline models across task types",
          "Training pipelines chain components for reproducibility",
          "Hyperparameter tuning runs parallel trials automatically",
        ],
      },
      {
        id: "deployment-ml",
        title: "Model Deployment & Monitoring",
        content: `**Deployment options:**
- **Managed online endpoints**: Real-time inference with auto-scaling
- **Batch endpoints**: Score large datasets asynchronously
- **Azure Container Instances / AKS**: Custom deployment targets

**Model registration:**
- Register MLflow models in the workspace model registry
- Version models: staging → production promotion
- Package feature specifications with model artifacts
- Evaluate with responsible AI dashboard before promotion

**Production monitoring:**
- **Data drift detection**: Compare input distribution over time
- **Model performance**: Track accuracy, latency, error rates
- **Retraining triggers**: Alert when drift exceeds threshold → trigger pipeline
- **Progressive rollout**: Route 10% traffic to new model, compare, then full rollout
- **Safe rollback**: Revert to previous model version if metrics degrade`,
        keyPoints: [
          "Online endpoints for real-time; batch for async scoring",
          "Model registry with version promotion (staging → production)",
          "Data drift detection triggers retraining alerts",
          "Progressive rollout with safe rollback for production deployments",
        ],
      },
    ],
    quiz: [
      {
        question: "Which Azure ML feature automatically tries multiple algorithms and hyperparameters?",
        options: ["MLflow", "Automated ML (AutoML)", "Batch endpoints", "Model registry"],
        answer: 1,
        explanation: "AutoML automates algorithm selection and hyperparameter tuning across many trials.",
      },
    ],
  },
  {
    slug: "genaiops",
    title: "GenAIOps & RAG Optimization",
    subtitle: "AI-300: production GenAI infrastructure, evaluation, and performance tuning",
    description:
      "Deploy foundation models at scale, version prompts in Git, run evaluation pipelines, optimize RAG, and manage fine-tuning lifecycles.",
    difficulty: "advanced",
    duration: "80 min",
    services: ["Microsoft Foundry", "Azure ML", "GitHub Actions", "Azure Monitor"],
    exams: ["AI-300"],
    sections: [
      {
        id: "genai-infra",
        title: "GenAIOps Infrastructure",
        content: `**Foundry production environment setup (AI-300):**
- Create Hub + Project with production RBAC and network isolation
- Deploy foundation models: serverless API vs managed compute vs PTU
- Model versioning: deploy v2 alongside v1, route traffic gradually
- Bicep templates for reproducible Foundry resource provisioning

**Prompt versioning with Git:**
- Store prompts in Git repositories with semantic versioning
- Create prompt variants (A/B testing different system prompts)
- Compare performance metrics across prompt versions
- CI/CD: prompt changes trigger evaluation pipeline before deployment

**PTU (Provisioned Throughput Units):**
- Reserve model capacity for predictable latency at high volume
- Cost-effective when sustained utilization exceeds ~60%
- Deploy alongside pay-as-you-go for burst capacity`,
        keyPoints: [
          "Prompt versioning in Git — treat prompts as code",
          "PTU for sustained high-volume; serverless for variable load",
          "Model versioning with side-by-side deployment and traffic routing",
          "Bicep for IaC of all Foundry production resources",
        ],
      },
      {
        id: "evaluation",
        title: "Evaluation & Observability",
        content: `**Built-in evaluators (Foundry):**
- **Groundedness**: Is the response supported by retrieved context?
- **Relevance**: Does the answer address the question?
- **Coherence**: Is the response logically structured?
- **Fluency**: Grammar and readability
- **Safety**: Harmful content detection
- **Custom evaluators**: Python functions for domain-specific metrics

**Automated evaluation workflow:**
1. Create golden test dataset (question, expected answer, context)
2. Run batch evaluation against prompt flow or agent
3. Gate deployment on minimum scores (e.g., groundedness > 0.8)
4. Continuous evaluation in production on sampled requests

**Observability:**
- Token analytics: input/output tokens per request, cost attribution
- Latency breakdown: retrieval time vs inference time vs post-processing
- Safety signals: content filter blocks, prompt shield triggers
- Tracing: full request path through RAG pipeline or agent tool calls`,
        keyPoints: [
          "Groundedness is the critical metric for RAG systems",
          "Gate production deploys on evaluation thresholds",
          "Token analytics for cost attribution per feature/user",
          "Tracing decomposes latency across pipeline stages",
        ],
      },
      {
        id: "rag-optimization",
        title: "RAG & Fine-Tuning Optimization",
        content: `**RAG performance tuning (AI-300):**
- **Chunk size**: Test 256, 512, 1024 tokens — measure retrieval recall
- **Overlap**: 10-20% overlap between chunks prevents context loss at boundaries
- **Similarity threshold**: Filter low-relevance results before sending to LLM
- **Embedding model selection**: Compare 3-small vs 3-large on your data
- **Hybrid search**: Combine vector + BM25 — test with/without semantic ranker
- **A/B testing**: Compare RAG configurations on held-out query set

**Fine-tuning lifecycle:**
1. Prepare training data (JSONL: prompt/completion pairs, 50-100+ examples)
2. Submit fine-tuning job in Foundry
3. Evaluate fine-tuned vs base model on validation set
4. Register model version in registry
5. Deploy with progressive rollout
6. Monitor for quality regression; rollback if needed

**Synthetic data**: Generate training examples from existing documents using LLMs. Human-review before using for fine-tuning.`,
        codeExample: `# RAG evaluation with Foundry SDK
from azure.ai.evaluation import evaluate

result = evaluate(
    data=test_dataset,
    evaluators={
        "groundedness": GroundednessEvaluator(),
        "relevance": RelevanceEvaluator(),
        "coherence": CoherenceEvaluator(),
    },
    azure_ai_project=project_scope
)
print(f"Groundedness: {result['groundedness_score']}")`,
        keyPoints: [
          "Benchmark chunk size and overlap on YOUR data — no universal optimum",
          "A/B test hybrid search with and without semantic ranker",
          "Fine-tuning needs 50-100+ quality examples minimum",
          "Synthetic data generation speeds training data creation — review for quality",
        ],
      },
    ],
    quiz: [
      {
        question: "Which evaluation metric is most critical for RAG systems?",
        options: ["Fluency", "Groundedness", "Coherence", "Safety"],
        answer: 1,
        explanation: "Groundedness measures whether responses are supported by retrieved context — the core quality concern for RAG.",
      },
    ],
  },
];