import {
  AIProvider,
  AIExplanationResult,
  SYSTEM_PROMPT,
  parseAIJSONResponse,
} from "./base";

export class OllamaNotAvailableError extends Error {
  platform: string;
  originalError: any;
  constructor(message: string, details: { platform: string; error: any }) {
    super(message);
    this.name = "OllamaNotAvailableError";
    this.platform = details.platform;
    this.originalError = details.error;
  }
}

/**
 * Dynamic Timeout Calculator
 *
 * Timeout scales with:
 * - Number of files
 * - Total diff size
 * - Model size (smaller models need more time)
 * - Historical performance of this model
 */
export class DynamicTimeout {
  private static BASE_TIMEOUT_MS = 15000; // 15 seconds base
  private static PER_FILE_MS = 2000; // +2 seconds per file
  private static PER_1K_TOKENS_MS = 5000; // +5 seconds per 1K tokens
  private static MAX_TIMEOUT_MS = 300000; // 5 minutes absolute max
  private static MIN_TIMEOUT_MS = 10000; // 10 seconds minimum

  /**
   * Calculate appropriate timeout for this request
   */
  static calculate(params: {
    fileCount: number;
    estimatedTokens: number;
    modelSize: string; // "3b", "7b", "13b", "70b"
    historicalAvgMs?: number; // Previous performance
  }): number {
    let timeout = this.BASE_TIMEOUT_MS;

    // Add time per file
    timeout += params.fileCount * this.PER_FILE_MS;

    // Add time per 1K tokens
    const tokenThousands = params.estimatedTokens / 1000;
    timeout += tokenThousands * this.PER_1K_TOKENS_MS;

    // Smaller models need MORE time (slower processing)
    const modelSizeGB = parseFloat(params.modelSize) || 3;
    if (modelSizeGB <= 3) {
      timeout *= 1.5; // 50% more time for small models
    } else if (modelSizeGB <= 7) {
      timeout *= 1.2; // 20% more time for medium models
    }
    // Large models (13b+) use base timeout

    // Use historical average if available (with 50% buffer)
    if (params.historicalAvgMs) {
      timeout = Math.max(timeout, params.historicalAvgMs * 1.5);
    }

    // Clamp to limits
    timeout = Math.max(
      this.MIN_TIMEOUT_MS,
      Math.min(this.MAX_TIMEOUT_MS, timeout),
    );

    return Math.round(timeout);
  }

  /**
   * Calculate for fallback model (extra time since it's second attempt)
   */
  static calculateForFallback(params: {
    fileCount: number;
    estimatedTokens: number;
    modelSize: string;
    attemptNumber: number;
  }): number {
    const base = this.calculate(params);

    // Each fallback attempt gets 50% more time
    const multiplier = 1 + params.attemptNumber * 0.5;

    return Math.round(base * multiplier);
  }
}

export class OllamaProvider implements AIProvider {
  name = "ollama";
  private host: string;
  private timeoutMs?: number;
  private performanceHistory: Map<string, number[]> = new Map();

  constructor(host = "http://localhost:11434", timeoutMs?: number) {
    this.host = host;
    this.timeoutMs = timeoutMs;
  }

  async generateExplanation(
    diffText: string,
    modelName: string,
    systemPrompt?: string,
    attemptNumber?: number,
  ): Promise<AIExplanationResult> {
    const url = `${this.host}/api/generate`;
    const prompt = `System Instructions:\n${systemPrompt || SYSTEM_PROMPT}\n\nGit Diff:\n${diffText}`;

    const startTime = Date.now();
    const fileCount = (diffText.match(/^diff --git /gm) || []).length || 1;
    const estimatedTokens = this.estimateTokens(diffText);
    const modelSize = this.detectModelSize(modelName);
    const historicalAvgMs = this.getHistoricalAverage(modelName);

    let timeoutMs = this.timeoutMs;
    if (timeoutMs === undefined) {
      timeoutMs =
        attemptNumber && attemptNumber > 1
          ? DynamicTimeout.calculateForFallback({
              fileCount,
              estimatedTokens,
              modelSize,
              attemptNumber: attemptNumber - 1,
            })
          : DynamicTimeout.calculate({
              fileCount,
              estimatedTokens,
              modelSize,
              historicalAvgMs,
            });
    }

    console.log(
      `⏱️ Dynamic timeout: ${(timeoutMs / 1000).toFixed(0)}s for ${fileCount} files (~${estimatedTokens} tokens)`,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.2,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Ollama returned status ${response.status}: ${await response.text()}`,
        );
      }

      const data = (await response.json()) as { response: string };
      const elapsed = Date.now() - startTime;

      this.recordPerformance(modelName, elapsed);
      console.log(
        `✅ Ollama response: ${elapsed}ms (timeout was ${timeoutMs}ms)`,
      );

      return parseAIJSONResponse(data.response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;

      if (
        error.name === "AbortError" ||
        error.name === "TimeoutError" ||
        error.message.includes("timed out")
      ) {
        console.log(
          `⏱️ Ollama timed out after ${elapsed}ms (timeout was ${timeoutMs}ms)`,
        );
        console.log(
          `   Tip: ${fileCount} files may be too many for model ${modelName}`,
        );
        console.log(
          `   Consider: devdiff generate --depth minimal (for faster results)`,
        );
        console.log(`   Or split into smaller commits`);

        throw new OllamaNotAvailableError(
          `Ollama request timed out after ${timeoutMs}ms`,
          { platform: process.platform, error },
        );
      }

      console.log("");
      console.log("❌ Cannot connect to Ollama");
      console.log("");
      console.log(
        "   DevDiff uses Ollama for local AI. It needs to be running.",
      );
      console.log("");

      if (process.platform === "win32") {
        console.log("   Windows:");
        console.log(
          "   1. Download Ollama from: https://ollama.com/download/windows",
        );
        console.log("   2. Install and run the Ollama app");
        console.log("   3. Open PowerShell and run: ollama pull llama3.2:3b");
        console.log("   4. Verify it works: ollama list");
        console.log("   5. Try again: devdiff generate");
      } else if (process.platform === "darwin") {
        console.log("   macOS:");
        console.log("   1. brew install ollama");
        console.log("   2. ollama serve");
        console.log("   3. ollama pull llama3.2:3b");
      } else {
        console.log("   Linux:");
        console.log("   1. curl -fsSL https://ollama.com/install.sh | sh");
        console.log("   2. ollama serve");
        console.log("   3. ollama pull llama3.2:3b");
      }

      console.log("");
      console.log("   💡 No Ollama? You can use:");
      console.log("   • Dry run mode: devdiff generate --dry-run");
      console.log("   • Cloud AI: Set OPENAI_API_KEY in .env");
      console.log("   • WebGPU: Open dashboard at http://localhost:3737");
      console.log("");
      console.log("   Error details:", error.message);
      console.log("");

      throw new OllamaNotAvailableError(
        "Ollama is not running. Install from https://ollama.com",
        { platform: process.platform, error },
      );
    }
  }

  /**
   * Estimate token count (fast approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Detect model parameter size from name
   */
  private detectModelSize(modelName: string): string {
    const match = modelName.match(/(\d+\.?\d*)b/i);
    return match ? match[1] + "b" : "3b";
  }

  /**
   * Get historical average response time
   */
  private getHistoricalAverage(modelName: string): number | undefined {
    const history = this.performanceHistory.get(modelName);
    if (!history || history.length === 0) return undefined;
    return history.reduce((sum, t) => sum + t, 0) / history.length;
  }

  /**
   * Record performance for future timeout calculations
   */
  private recordPerformance(modelName: string, elapsedMs: number): void {
    const history = this.performanceHistory.get(modelName) || [];
    history.push(elapsedMs);
    if (history.length > 20) history.shift();
    this.performanceHistory.set(modelName, history);
  }
}
