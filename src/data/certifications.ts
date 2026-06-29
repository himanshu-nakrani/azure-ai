import { Certification } from "@/lib/types";

export const certifications: Certification[] = [
  {
    slug: "ai-901",
    examCode: "AI-901",
    title: "Microsoft Azure AI Fundamentals",
    level: "fundamentals",
    status: "active",
    duration: "45 min",
    passingScore: 700,
    description:
      "Entry-level exam covering responsible AI, workload identification, and hands-on Foundry implementations for chat, agents, speech, vision, and content extraction.",
    moduleSlugs: [
      "ai-fundamentals",
      "azure-openai",
      "ai-foundry",
      "document-intelligence",
      "computer-vision",
      "language-speech",
    ],
    skillAreas: [
      {
        name: "Identify AI concepts and capabilities",
        weight: "40–45%",
        topics: [
          "Responsible AI principles (fairness, safety, privacy, transparency)",
          "Generative AI model components and deployment options",
          "Workload scenarios: generative, agentic, text, speech, vision, extraction",
        ],
      },
      {
        name: "Implement AI solutions using Microsoft Foundry",
        weight: "55–60%",
        topics: [
          "Prompting, model deployment, chat clients, single-agent solutions",
          "Text analysis and Speech in Foundry Tools",
          "Multimodal vision and image generation",
          "Content Understanding for documents, images, audio, video",
        ],
      },
    ],
    studyGuideUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-901",
    certUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
  },
  {
    slug: "ai-102",
    examCode: "AI-102",
    title: "Designing and Implementing a Microsoft Azure AI Solution",
    level: "associate",
    status: "retiring",
    retirementDate: "June 30, 2026",
    duration: "100 min",
    passingScore: 700,
    description:
      "The legacy associate exam. Covers Foundry service planning, generative AI, agents, computer vision, NLP, and knowledge mining. Being replaced by AI-103.",
    moduleSlugs: [
      "plan-manage-foundry",
      "azure-openai",
      "ai-foundry",
      "agents",
      "computer-vision",
      "language-speech",
      "rag-pipeline",
      "document-intelligence",
      "security",
      "production-ops",
    ],
    skillAreas: [
      { name: "Plan and manage an Azure AI solution", weight: "20–25%", topics: ["Service selection", "Foundry deployment", "Monitoring, cost, auth", "Responsible AI governance"] },
      { name: "Implement generative AI solutions", weight: "15–20%", topics: ["Prompt flow", "RAG grounding", "Azure OpenAI", "Fine-tuning", "Prompt engineering"] },
      { name: "Implement an agentic solution", weight: "5–10%", topics: ["Foundry Agent Service", "Agent Framework", "Multi-agent orchestration"] },
      { name: "Implement computer vision solutions", weight: "10–15%", topics: ["Image analysis", "Custom Vision", "Video Indexer", "Spatial Analysis"] },
      { name: "Implement natural language processing solutions", weight: "15–20%", topics: ["Language analytics", "Speech", "CLU", "Custom QnA", "Translator"] },
      { name: "Implement knowledge mining and information extraction", weight: "15–20%", topics: ["AI Search", "Document Intelligence", "Content Understanding"] },
    ],
    studyGuideUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-102",
    certUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/",
  },
  {
    slug: "ai-103",
    examCode: "AI-103",
    title: "Developing AI Apps and Agents on Azure",
    level: "associate",
    status: "active",
    duration: "120 min",
    passingScore: 700,
    description:
      "The current associate exam for AI engineers. Heavier weight on generative AI, agents, and Foundry SDK development with Python. Successor to AI-102.",
    moduleSlugs: [
      "plan-manage-foundry",
      "azure-openai",
      "ai-foundry",
      "agents",
      "rag-pipeline",
      "computer-vision",
      "language-speech",
      "document-intelligence",
      "security",
      "production-ops",
    ],
    skillAreas: [
      { name: "Plan and manage an Azure AI solution", weight: "25–30%", topics: ["Foundry service/model selection", "Infrastructure and CI/CD", "Quotas, monitoring, security", "Responsible AI for agents"] },
      { name: "Implement generative AI and agentic solutions", weight: "30–35%", topics: ["RAG apps", "Agent tools and memory", "Multi-agent orchestration", "Observability and optimization"] },
      { name: "Implement computer vision solutions", weight: "10–15%", topics: ["Image/video generation", "Multimodal understanding", "Content Understanding vision pipelines"] },
      { name: "Implement text analysis solutions", weight: "10–15%", topics: ["Entity/sentiment extraction", "Speech for agents", "Translation"] },
      { name: "Implement information extraction solutions", weight: "10–15%", topics: ["Retrieval pipelines", "Semantic/hybrid search", "Document and multimodal extraction"] },
    ],
    studyGuideUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-103",
    certUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/",
  },
  {
    slug: "ai-300",
    examCode: "AI-300",
    title: "Operationalizing Machine Learning and Generative AI Solutions",
    level: "associate",
    status: "active",
    duration: "120 min",
    passingScore: 700,
    description:
      "MLOps + GenAIOps exam. Azure ML workspace management, model lifecycle, Foundry production deployments, evaluation pipelines, and RAG optimization.",
    moduleSlugs: [
      "azure-ml-mlops",
      "genaiops",
      "plan-manage-foundry",
      "rag-pipeline",
      "azure-openai",
      "production-ops",
      "security",
    ],
    skillAreas: [
      { name: "Design and implement MLOps infrastructure", weight: "15–20%", topics: ["AML workspace", "Datastores, compute, environments", "IaC with Bicep and GitHub Actions"] },
      { name: "Implement ML model lifecycle and operations", weight: "25–30%", topics: ["MLflow tracking", "AutoML", "Model registration", "Real-time/batch endpoints", "Drift monitoring"] },
      { name: "Design and implement GenAIOps infrastructure", weight: "20–25%", topics: ["Foundry environments", "Foundation model deployment", "PTU", "Prompt versioning in Git"] },
      { name: "Implement GenAI quality assurance and observability", weight: "10–15%", topics: ["Groundedness/relevance evals", "Safety evaluations", "Tracing and token analytics"] },
      { name: "Optimize GenAI systems and model performance", weight: "10–15%", topics: ["RAG tuning", "Hybrid search optimization", "Fine-tuning lifecycle"] },
    ],
    studyGuideUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-300",
    certUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/operationalizing-machine-learning-and-generative-ai-solutions/",
  },
];

export function getCertification(slug: string): Certification | undefined {
  return certifications.find((c) => c.slug === slug);
}

export function getModulesForExam(examCode: string): string[] {
  const cert = certifications.find((c) => c.examCode === examCode);
  return cert?.moduleSlugs ?? [];
}