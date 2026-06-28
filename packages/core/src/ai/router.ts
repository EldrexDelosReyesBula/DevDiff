import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";
import { DevDiffConfig } from "../config/schema";
import { AIExplanationResult, AIProvider } from "./providers/base";
import { OllamaProvider } from "./providers/ollama";
import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";
import { AnthropicProvider } from "./providers/anthropic";
import { ExplanationCache } from "./cache";
import { VibeCoderGuardian } from "../resilience/vibe-coder-guardian";

export interface ModelTier {
  name: string;
  provider: string;
  maxContextTokens: number;
  maxOutputTokens: number;
  costPer1kInput: number; // USD, 0 for local
  costPer1kOutput: number; // USD, 0 for local
  latencyMs: number; // Expected latency
  capabilities: {
    codeAnalysis: number; // 0-1 score
    securityAudit: number; // 0-1 score
    refactoringDetection: number;
    multiFileAnalysis: number;
    structuredOutput: number;
  };
}

export interface RoutingDecision {
  model: string;
  reason: string;
  estimatedTokens: number;
  estimatedCost: number;
  estimatedLatency: number;
  willTruncate: boolean;
  fallbackChain: string[];
}

export interface DiffStats {
  fileCount: number;
  totalChanges: number;
  maxASTDepth: number;
  hasBreakingChanges: boolean;
  estimatedTokens: number;
}

export interface AnalysisRequirements {
  estimatedTokens: number;
  requiresCodeAnalysis: boolean;
  requiresSecurityAudit: boolean;
  requiresMultiFile: boolean;
  requiresStructuredOutput: boolean;
  minimumCapabilityScore: number;
  complexityScore: number;
}

export class AIRouter {
  private config: DevDiffConfig;
  private cache: ExplanationCache;
  private providers: Record<string, AIProvider> = {};
  private models: Record<string, ModelTier> = {
    "ollama://llama3.2:3b": {
      name: "Llama 3.2 3B",
      provider: "ollama",
      maxContextTokens: 128000,
      maxOutputTokens: 8192,
      costPer1kInput: 0,
      costPer1kOutput: 0,
      latencyMs: 500,
      capabilities: {
        codeAnalysis: 0.6,
        securityAudit: 0.4,
        refactoringDetection: 0.5,
        multiFileAnalysis: 0.3,
        structuredOutput: 0.7,
      },
    },
    "ollama://llama3.1:8b": {
      name: "Llama 3.1 8B",
      provider: "ollama",
      maxContextTokens: 128000,
      maxOutputTokens: 8192,
      costPer1kInput: 0,
      costPer1kOutput: 0,
      latencyMs: 1200,
      capabilities: {
        codeAnalysis: 0.8,
        securityAudit: 0.7,
        refactoringDetection: 0.75,
        multiFileAnalysis: 0.7,
        structuredOutput: 0.8,
      },
    },
    "ollama://codellama:13b": {
      name: "CodeLlama 13B",
      provider: "ollama",
      maxContextTokens: 16384,
      maxOutputTokens: 4096,
      costPer1kInput: 0,
      costPer1kOutput: 0,
      latencyMs: 3000,
      capabilities: {
        codeAnalysis: 0.9,
        securityAudit: 0.85,
        refactoringDetection: 0.9,
        multiFileAnalysis: 0.6,
        structuredOutput: 0.75,
      },
    },
    "openai://gpt-4o-mini": {
      name: "GPT-4o Mini",
      provider: "openai",
      maxContextTokens: 128000,
      maxOutputTokens: 16384,
      costPer1kInput: 0.00015,
      costPer1kOutput: 0.0006,
      latencyMs: 800,
      capabilities: {
        codeAnalysis: 0.85,
        securityAudit: 0.8,
        refactoringDetection: 0.85,
        multiFileAnalysis: 0.9,
        structuredOutput: 0.95,
      },
    },
    "openai://gpt-4o": {
      name: "GPT-4o",
      provider: "openai",
      maxContextTokens: 128000,
      maxOutputTokens: 16384,
      costPer1kInput: 0.0025,
      costPer1kOutput: 0.01,
      latencyMs: 1500,
      capabilities: {
        codeAnalysis: 0.95,
        securityAudit: 0.95,
        refactoringDetection: 0.95,
        multiFileAnalysis: 0.95,
        structuredOutput: 0.98,
      },
    },
  };

  constructor(config: DevDiffConfig) {
    this.config = config;
    this.cache = new ExplanationCache(config.cache.enabled, config.cache.path);

    // Initialize providers
    this.providers["ollama"] = new OllamaProvider();
    this.providers["openai"] = new OpenAIProvider();
    this.providers["gemini"] = new GeminiProvider();
    this.providers["anthropic"] = new AnthropicProvider();
  }

  private parseUrl(url: string): { providerType: string; modelName: string } {
    const match = url.match(/^([^:]+):\/\/(.+)$/);
    if (!match) {
      return { providerType: "ollama", modelName: url };
    }
    return {
      providerType: match[1].toLowerCase(),
      modelName: match[2],
    };
  }

  /**
   * Route a change analysis to the optimal model based on context constraints
   */
  route(depth: string, stats: DiffStats): RoutingDecision {
    const requirements = this.assessRequirements(depth, stats);

    // Build candidate list meeting requirements
    const candidates = Object.entries(this.models)
      .filter(([_, model]) =>
        this.meetsMinimumRequirements(model, requirements),
      )
      .sort(
        (a, b) =>
          this.scoreModel(b[1], requirements) -
          this.scoreModel(a[1], requirements),
      );

    if (candidates.length === 0) {
      // Fallback: use best available with truncation warning
      const best = Object.entries(this.models).sort(
        (a, b) => b[1].maxContextTokens - a[1].maxContextTokens,
      )[0];

      return {
        model: best[0],
        reason:
          "No model meets requirements. Using largest context window with truncation.",
        estimatedTokens: stats.estimatedTokens,
        estimatedCost: this.estimateCost(best[0], stats.estimatedTokens),
        estimatedLatency: best[1].latencyMs,
        willTruncate: true,
        fallbackChain: [],
      };
    }

    const selected = candidates[0];

    return {
      model: selected[0],
      reason: this.explainRouting(selected[1], requirements),
      estimatedTokens: stats.estimatedTokens,
      estimatedCost: this.estimateCost(selected[0], stats.estimatedTokens),
      estimatedLatency: selected[1].latencyMs,
      willTruncate: stats.estimatedTokens > selected[1].maxContextTokens * 0.8,
      fallbackChain: candidates.slice(1, 4).map((c) => c[0]),
    };
  }

  private meetsMinimumRequirements(
    model: ModelTier,
    req: AnalysisRequirements,
  ): boolean {
    // Basic filter on capabilities
    if (
      req.requiresSecurityAudit &&
      model.capabilities.securityAudit < req.minimumCapabilityScore
    ) {
      return false;
    }
    if (
      req.requiresMultiFile &&
      model.capabilities.multiFileAnalysis < req.minimumCapabilityScore
    ) {
      return false;
    }
    return true;
  }

  private assessRequirements(
    depth: string,
    stats: DiffStats,
  ): AnalysisRequirements {
    const depthMultipliers: Record<string, number> = {
      minimal: 0.3,
      standard: 0.5,
      deep: 0.8,
      exhaustive: 1.0,
    };

    const multiplier = depthMultipliers[depth] || 0.5;

    return {
      estimatedTokens: stats.estimatedTokens,
      requiresCodeAnalysis: true,
      requiresSecurityAudit: stats.hasBreakingChanges,
      requiresMultiFile: stats.fileCount > 5,
      requiresStructuredOutput: true,
      minimumCapabilityScore: 0.3 + multiplier * 0.5,
      complexityScore: this.calculateComplexity(stats),
    };
  }

  private calculateComplexity(stats: DiffStats): number {
    let score = 0;
    score += Math.min(stats.fileCount / 20, 1) * 0.3;
    score += Math.min(stats.totalChanges / 500, 1) * 0.3;
    score += Math.min(stats.maxASTDepth / 10, 1) * 0.2;
    if (stats.hasBreakingChanges) score += 0.2;
    return Math.min(score, 1.0);
  }

  private scoreModel(model: ModelTier, req: AnalysisRequirements): number {
    let score = 0;

    if (req.estimatedTokens <= model.maxContextTokens * 0.8) {
      score += 0.3;
    } else if (req.estimatedTokens <= model.maxContextTokens) {
      score += 0.1;
    }

    score += model.capabilities.codeAnalysis * 0.25;
    if (req.requiresSecurityAudit) {
      score += model.capabilities.securityAudit * 0.2;
    }
    if (req.requiresMultiFile) {
      score += model.capabilities.multiFileAnalysis * 0.15;
    }
    if (req.requiresStructuredOutput) {
      score += model.capabilities.structuredOutput * 0.1;
    }

    // Cost penalty (prefer local)
    if (model.costPer1kInput > 0) {
      score -= 0.15;
    }

    if (req.complexityScore > 0.7 && model.latencyMs > 2000) {
      score -= 0.1;
    }

    return score;
  }

  private explainRouting(model: ModelTier, req: AnalysisRequirements): string {
    const reasons: string[] = [];
    if (model.costPer1kInput === 0) reasons.push("local/free");
    if (model.capabilities.codeAnalysis >= 0.9)
      reasons.push("high code analysis capability");
    if (req.requiresSecurityAudit && model.capabilities.securityAudit >= 0.8) {
      reasons.push("security audit capable");
    }
    if (req.estimatedTokens > 8000 && model.maxContextTokens >= 128000) {
      reasons.push("large context window");
    }
    return `Selected ${model.name}: ${reasons.join(", ")}`;
  }

  private estimateCost(modelKey: string, estimatedTokens: number): number {
    const model = this.models[modelKey];
    if (!model) return 0;
    return (
      (estimatedTokens / 1000) * model.costPer1kInput +
      ((estimatedTokens * 0.3) / 1000) * model.costPer1kOutput
    );
  }

  async getExplanation(
    diffText: string,
    options?: { dryRun?: boolean; depth?: string },
  ): Promise<AIExplanationResult> {
    if (options?.dryRun) {
      return {
        summary:
          "[DRY RUN] Would call AI to generate explanation for this diff.",
        impact: "none",
        breaking: false,
        files: [],
        relatedIssues: [],
      };
    }

    // Check cache
    const cached = await this.cache.get(diffText);
    if (cached) {
      return cached.result;
    }

    // Context-aware routing decision
    const charCount = diffText.length;
    const estimatedTokens = Math.ceil(charCount / 4);
    const fileLines = diffText.split("\n");
    const totalChanges = fileLines.filter(
      (l) => l.startsWith("+") || l.startsWith("-"),
    ).length;

    const stats: DiffStats = {
      fileCount: (diffText.match(/^diff --git /gm) || []).length || 1,
      totalChanges,
      maxASTDepth: 5,
      hasBreakingChanges:
        diffText.includes("breaking") || diffText.includes("BREAKING CHANGE"),
      estimatedTokens,
    };

    const decision = this.route(options?.depth || "standard", stats);
    console.log(
      `[Intelligent Router] Decision: ${decision.model} - ${decision.reason}`,
    );

    // Extract provider name and model name
    const { providerType, modelName } = this.parseUrl(decision.model);
    const provider = this.providers[providerType];

    if (!provider) {
      // Fallback to configured providers if not mapped
      throw new Error(`Unsupported routed provider type: ${providerType}`);
    }

    // Apply API key if present in configuration for this provider
    const matchedConfig = this.config.ai.providers.find((p) =>
      p.url.startsWith(providerType),
    );
    if (matchedConfig?.apiKey) {
      if (providerType === "openai") {
        this.providers["openai"] = new OpenAIProvider(matchedConfig.apiKey);
      } else if (providerType === "gemini") {
        this.providers["gemini"] = new GeminiProvider(matchedConfig.apiKey);
      } else if (providerType === "anthropic") {
        this.providers["anthropic"] = new AnthropicProvider(
          matchedConfig.apiKey,
        );
      }
    }

    let sessionActive = false;
    let guardian: VibeCoderGuardian | null = null;
    let checkpoint: any = null;

    try {
      const sessionPath = path.resolve(
        process.cwd(),
        ".devdiff/vibe-session.json",
      );
      await fs.access(sessionPath);
      sessionActive = true;
    } catch {}

    if (sessionActive) {
      try {
        guardian = new VibeCoderGuardian();
        await guardian.loadSession();

        let modifiedFiles: string[] = [];
        try {
          const stdout = execSync("git status --porcelain", {
            stdio: ["ignore", "pipe", "ignore"],
          }).toString();
          modifiedFiles = stdout
            .split("\n")
            .map((line) => line.slice(3).trim())
            .filter(Boolean);
        } catch {}

        checkpoint = await guardian.preAICheckpoint({
          files: modifiedFiles,
          model: decision.model,
          prompt: diffText,
        });
        await guardian.saveSession();
      } catch (gErr) {
        console.warn("VibeCoderGuardian failed to create checkpoint:", gErr);
      }
    }

    try {
      const result = await provider.generateExplanation(diffText, modelName);

      if (guardian) {
        guardian.recordAICall(decision.model, true);
        await guardian.saveSession();
      }

      // Save to cache
      await this.cache.set(diffText, {
        result,
        provider: providerType,
        model: modelName,
      });

      return result;
    } catch (err: any) {
      if (guardian && checkpoint) {
        guardian.recordAICall(decision.model, false);
        const recovery = await guardian.handleFailure({
          error: err,
          model: decision.model,
          checkpointId: checkpoint.id,
          attempt: 1,
        });
        await guardian.saveSession();

        if (recovery.status === "retrying" && recovery.nextModel) {
          try {
            const fb = this.parseUrl(recovery.nextModel);
            const fbProvider =
              this.providers[fb.providerType] || this.providers["ollama"];
            const result = await fbProvider.generateExplanation(
              diffText,
              fb.modelName,
            );

            guardian.recordAICall(recovery.nextModel, true);
            await guardian.saveSession();

            return result;
          } catch (retryErr: any) {
            const finalRecovery = await guardian.handleFailure({
              error: retryErr,
              model: recovery.nextModel,
              checkpointId: checkpoint.id,
              attempt: 3,
            });
            await guardian.saveSession();
            throw new Error(finalRecovery.message);
          }
        } else {
          throw new Error(recovery.message);
        }
      }

      console.warn(
        `Routed AI provider ${decision.model} failed. Falling back to chain: ${decision.fallbackChain.join(", ")}`,
      );

      for (const fallbackModel of decision.fallbackChain) {
        try {
          const fb = this.parseUrl(fallbackModel);
          const fbProvider = this.providers[fb.providerType];
          if (fbProvider) {
            const result = await fbProvider.generateExplanation(
              diffText,
              fb.modelName,
            );
            return result;
          }
        } catch {
          // Continue to next fallback
        }
      }
      throw err;
    }
  }
}
