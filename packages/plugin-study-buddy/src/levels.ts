export type ExplanationLevel =
  "beginner" | "student" | "developer" | "senior" | "architect";

export interface LevelConfig {
  name: string;
  description: string;
  targetAudience: string;
  promptModifier: string;
}

export const EXPLANATION_LEVELS: Record<ExplanationLevel, LevelConfig> = {
  beginner: {
    name: "Beginner",
    description: "Line-by-line breakdown with plain-English analogies",
    targetAudience: "New to programming",
    promptModifier:
      "Explain in simple terms using everyday analogies. Avoid jargon without explaining it first. Break down line by line.",
  },
  student: {
    name: "Student",
    description:
      "Focus on fundamentals, patterns, and computer science concepts",
    targetAudience: "Computer Science students and bootcamp learners",
    promptModifier:
      "Focus on core CS concepts, algorithm design, data structures, and fundamental patterns.",
  },
  developer: {
    name: "Developer",
    description: "Clear technical summary, API usage, and code flow",
    targetAudience: "Mid-level software engineers",
    promptModifier:
      "Provide a concise technical walkthrough focusing on control flow, data mutations, and public API interfaces.",
  },
  senior: {
    name: "Senior",
    description: "Edge cases, efficiency, memory management, and concurrency",
    targetAudience: "Senior engineers and tech leads",
    promptModifier:
      "Focus on runtime complexity, memory allocations, concurrency safety, edge cases, and performance tradeoffs.",
  },
  architect: {
    name: "Architect",
    description:
      "System design, coupling, extensibility, and domain boundaries",
    targetAudience: "Staff/Principal engineers and System Architects",
    promptModifier:
      "Focus on module boundaries, coupling, architectural patterns, state isolation, and long-term maintainability.",
  },
};
