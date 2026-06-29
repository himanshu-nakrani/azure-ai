export interface LearningSection {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  keyPoints?: string[];
  warning?: string;
}

export interface ServiceCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
  services: string[];
}

export interface ModuleHook {
  setup: string;
  challenge: string;
}

export interface LearningModule {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "foundational" | "intermediate" | "advanced";
  duration: string;
  services: string[];
  hook?: ModuleHook;
  sections: LearningSection[];
  quiz?: { question: string; options: string[]; answer: number; explanation: string }[];
}

export interface LearningPath {
  slug: string;
  title: string;
  tagline: string;
  modules: string[];
}

export interface ArchitecturePattern {
  slug: string;
  category: string;
  title: string;
  description: string;
  useCase: string;
  complexity: "low" | "medium" | "high";
  services: string[];
  mermaidDiagram: string;
  considerations: string[];
  costDrivers: string[];
}