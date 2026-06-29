const STORAGE_KEY = "azure-academy-progress";

export interface ModuleProgress {
  visitedAt: number;
  scrollPercent: number;
  quizComplete: boolean;
  quizScore: number;
  quizTotal: number;
}

export interface ProgressState {
  lastModule?: string;
  modules: Record<string, ModuleProgress>;
}

function read(): ProgressState {
  if (typeof window === "undefined") return { modules: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { modules: {} };
    return JSON.parse(raw) as ProgressState;
  } catch {
    return { modules: {} };
  }
}

function write(state: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markModuleVisited(slug: string, scrollPercent = 0) {
  const state = read();
  const existing = state.modules[slug];
  state.modules[slug] = {
    visitedAt: Date.now(),
    scrollPercent: Math.max(existing?.scrollPercent ?? 0, scrollPercent),
    quizComplete: existing?.quizComplete ?? false,
    quizScore: existing?.quizScore ?? 0,
    quizTotal: existing?.quizTotal ?? 0,
  };
  state.lastModule = slug;
  write(state);
}

export function updateModuleScroll(slug: string, scrollPercent: number) {
  const state = read();
  const existing = state.modules[slug];
  if (!existing) {
    markModuleVisited(slug, scrollPercent);
    return;
  }
  state.modules[slug] = {
    ...existing,
    scrollPercent: Math.max(existing.scrollPercent, scrollPercent),
  };
  write(state);
}

export function markQuizComplete(slug: string, score: number, total: number) {
  const state = read();
  const existing = state.modules[slug];
  state.modules[slug] = {
    visitedAt: existing?.visitedAt ?? Date.now(),
    scrollPercent: Math.max(existing?.scrollPercent ?? 0, 80),
    quizComplete: score === total,
    quizScore: score,
    quizTotal: total,
  };
  state.lastModule = slug;
  write(state);
}

export function getModuleProgress(slug: string): ModuleProgress | undefined {
  return read().modules[slug];
}

export function getLastModule(): string | undefined {
  return read().lastModule;
}

export function getOverallProgress(moduleSlugs: string[]): {
  visited: number;
  completed: number;
  percent: number;
} {
  const state = read();
  const visited = moduleSlugs.filter((s) => state.modules[s]).length;
  const completed = moduleSlugs.filter(
    (s) => state.modules[s]?.quizComplete || (state.modules[s]?.scrollPercent ?? 0) >= 90
  ).length;
  const percent = moduleSlugs.length
    ? Math.round((completed / moduleSlugs.length) * 100)
    : 0;
  return { visited, completed, percent };
}

export function getCategoryProgress(categorySlugs: string[]): number {
  const state = read();
  if (!categorySlugs.length) return 0;
  const sum = categorySlugs.reduce(
    (acc, slug) => acc + (state.modules[slug]?.scrollPercent ?? 0),
    0
  );
  return Math.round(sum / categorySlugs.length);
}