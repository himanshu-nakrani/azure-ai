export interface LearningSection {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  keyPoints?: string[];
  warning?: string;
}

export interface LearningModule {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "foundational" | "intermediate" | "advanced";
  duration: string;
  services: string[];
  exams: string[];
  sections: LearningSection[];
  quiz?: { question: string; options: string[]; answer: number; explanation: string }[];
}

export interface ExamSkillArea {
  name: string;
  weight: string;
  topics: string[];
}

export interface Certification {
  slug: string;
  examCode: string;
  title: string;
  level: "fundamentals" | "associate";
  status: "active" | "retiring";
  retirementDate?: string;
  duration: string;
  passingScore: number;
  description: string;
  moduleSlugs: string[];
  skillAreas: ExamSkillArea[];
  studyGuideUrl: string;
  certUrl: string;
}

export interface ArchitecturePattern {
  slug: string;
  title: string;
  description: string;
  useCase: string;
  complexity: "low" | "medium" | "high";
  services: string[];
  mermaidDiagram: string;
  considerations: string[];
  costDrivers: string[];
}

export interface VizNode {
  id: string;
  label: string;
  type: "service" | "data" | "compute" | "network" | "user";
  x: number;
  y: number;
  description: string;
}

export interface VizEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}