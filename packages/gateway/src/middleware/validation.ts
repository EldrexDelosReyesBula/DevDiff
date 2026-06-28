import { z } from "zod";

export const DevDiffEventSchema = z.object({
  id: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  source: z.enum(["git", "webhook", "api", "schedule", "manual"]),
  gateway_version: z.string().optional(),
  repository: z.object({
    url: z.string().url().optional(),
    path: z.string(),
    branch: z.string().default("main"),
  }),
  change_range: z
    .object({
      from: z.string(),
      to: z.string(),
      commit_count: z.number().optional(),
      file_count: z.number().optional(),
    })
    .optional(),
  config: z
    .object({
      persona: z.string().default("developer"),
      formats: z.array(z.string()).default(["markdown"]),
      depth: z
        .enum(["minimal", "standard", "deep", "exhaustive"])
        .default("standard"),
      language: z.string().default("en"),
      ai_routing: z.enum(["local", "cloud", "auto"]).optional(),
    })
    .optional(),
  outputs: z
    .array(
      z.object({
        type: z.string(),
        destination: z.string(),
        config: z.record(z.any()).optional(),
      }),
    )
    .optional(),
});

export const CustomPersonaConfigSchema = z.object({
  id: z.string(),
  extends: z.string().optional(),
  name: z.string().optional(),
  tone: z
    .enum([
      "formal",
      "casual",
      "technical",
      "executive",
      "educational",
      "robotic",
    ])
    .optional(),
  verbosity: z.number().min(1).max(5).optional(),
  focus: z.array(z.string()).optional(),
  ignore: z.array(z.string()).optional(),
  format_preference: z
    .enum(["paragraphs", "bullets", "tables", "mixed"])
    .optional(),
  emoji_usage: z.boolean().optional(),
  jargon_level: z.enum(["none", "minimal", "moderate", "heavy"]).optional(),
  system_prompt: z.string().optional(),
});

export class ValidationMiddleware {
  /**
   * Helper to parse and validate incoming body data.
   */
  static validate<T>(
    schema: z.Schema<T>,
    data: unknown,
  ): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      errors: result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`,
      ),
    };
  }
}
