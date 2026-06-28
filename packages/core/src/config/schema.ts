import { z } from "zod";

export const ProviderSchema = z.object({
  name: z.string(),
  url: z.string(), // e.g. 'ollama://llama3.2:3b', 'openai://gpt-4o-mini'
  apiKey: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
  priority: z.number().int().nonnegative().default(1),
  maxDailyCost: z.number().nonnegative().optional(),
});

export const RoutingSchema = z.object({
  strategy: z.enum(["priority", "cost-aware", "latency"]).default("priority"),
  complexityThreshold: z.number().min(0).max(1).default(0.6),
  localOnly: z.boolean().default(false),
});

export const ConfigSchema = z.object({
  ai: z
    .object({
      providers: z.array(ProviderSchema).default([]),
      routing: RoutingSchema.default({}),
    })
    .default({}),
  exclude: z
    .array(z.string())
    .default([
      "node_modules/**",
      "dist/**",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ]),
  cache: z
    .object({
      enabled: z.boolean().default(true),
      path: z.string().default(".devdiff/cache.json"),
    })
    .default({}),
  format: z.enum(["markdown", "json", "html"]).default("markdown"),
});

export type Provider = z.infer<typeof ProviderSchema>;
export type Routing = z.infer<typeof RoutingSchema>;
export type DevDiffConfig = z.infer<typeof ConfigSchema>;
