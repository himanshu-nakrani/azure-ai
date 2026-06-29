import { LearningModule } from "@/lib/types";
import { computeModules } from "./compute";
import { networkingModules } from "./networking";
import { storageModules } from "./storage";
import { databaseModules } from "./databases";
import { aiMlModules } from "./ai-ml";
import { identityModules } from "./identity";
import { integrationModules } from "./integration";
import { devopsModules } from "./devops";
import { governanceModules } from "./governance";

export const modules: LearningModule[] = [
  ...computeModules,
  ...networkingModules,
  ...storageModules,
  ...databaseModules,
  ...aiMlModules,
  ...identityModules,
  ...integrationModules,
  ...devopsModules,
  ...governanceModules,
];

export function getModule(slug: string): LearningModule | undefined {
  return modules.find((m) => m.slug === slug);
}

export function getModulesByCategory(category: string): LearningModule[] {
  return modules.filter((m) => m.category === category);
}