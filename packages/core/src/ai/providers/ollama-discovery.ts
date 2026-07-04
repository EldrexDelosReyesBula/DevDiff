export interface OllamaModel {
  name: string;
  size: number; // bytes
  modified: string; // ISO date
  digest: string;
  family: string; // llama, qwen, codellama, mistral, gemma, phi
  parameterSize: string; // 3b, 7b, 8b, 13b, 34b, 70b
  quantization: string; // Q4_K_M, Q8_0, F16
}

export class OllamaModelDiscovery {
  /**
   * Query Ollama API for all installed models
   */
  static async discoverModels(): Promise<OllamaModel[]> {
    const ollamaUrls = this.getOllamaUrls();

    for (const url of ollamaUrls) {
      try {
        const response = await fetch(`${url}/api/tags`, {
          signal: AbortSignal.timeout(3000), // 3s timeout for quick failure
        });

        if (!response.ok) continue;

        const data = (await response.json()) as {
          models?: Array<{
            name: string;
            size: number;
            modified_at: string;
            digest: string;
          }>;
        };

        if (!data.models || data.models.length === 0) {
          return [];
        }

        return data.models.map((model) => ({
          name: model.name,
          size: model.size,
          modified: model.modified_at,
          digest: model.digest,
          family: this.detectModelFamily(model.name),
          parameterSize: this.detectParameterSize(model.name),
          quantization: this.detectQuantization(model.name),
        }));
      } catch {
        // Try next URL
        continue;
      }
    }

    return [];
  }

  /**
   * Detect which model family this belongs to
   */
  private static detectModelFamily(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("qwen")) return "qwen";
    if (lower.includes("codellama") || lower.includes("code-llama"))
      return "codellama";
    if (lower.includes("llama")) return "llama";
    if (lower.includes("mistral")) return "mistral";
    if (lower.includes("gemma")) return "gemma";
    if (lower.includes("phi")) return "phi";
    if (lower.includes("deepseek")) return "deepseek";
    if (lower.includes("mixtral")) return "mixtral";
    if (lower.includes("command-r")) return "command-r";
    return "unknown";
  }

  /**
   * Extract parameter size from model name
   */
  private static detectParameterSize(name: string): string {
    const match = name.match(/(\d+\.?\d*)b/i);
    return match ? match[1].toLowerCase() + "b" : "unknown";
  }

  /**
   * Detect quantization level
   */
  private static detectQuantization(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("q8_0")) return "Q8_0";
    if (lower.includes("q6_k")) return "Q6_K";
    if (lower.includes("q5_k_m")) return "Q5_K_M";
    if (lower.includes("q5_k_s")) return "Q5_K_S";
    if (lower.includes("q4_k_m")) return "Q4_K_M";
    if (lower.includes("q4_k_s")) return "Q4_K_S";
    if (lower.includes("q4_0")) return "Q4_0";
    if (lower.includes("f16")) return "F16";
    if (lower.includes("fp16")) return "FP16";
    return "unknown";
  }

  /**
   * Get all possible Ollama URLs to try
   */
  private static getOllamaUrls(): string[] {
    const urls: string[] = [];

    // Custom host from environment
    if (process.env.OLLAMA_HOST) {
      const customUrl = process.env.OLLAMA_HOST.startsWith("http")
        ? process.env.OLLAMA_HOST
        : `http://${process.env.OLLAMA_HOST}`;
      urls.push(customUrl);
    }

    // Default localhost
    urls.push("http://localhost:11434");
    urls.push("http://127.0.0.1:11434");

    return urls;
  }

  /**
   * Get the best model for code analysis from available models
   */
  static selectBestModel(
    models: OllamaModel[],
    preference?: string,
  ): OllamaModel | null {
    if (models.length === 0) return null;

    // If user has a preference and it exists, use it
    if (preference) {
      const preferred = models.find(
        (m) => m.name === preference || m.name.includes(preference),
      );
      if (preferred) return preferred;
    }

    // Scoring system for code analysis capability
    const scored = models.map((model) => ({
      model,
      score: this.calculateCodeScore(model),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.model || null;
  }

  /**
   * Score model for code analysis capability
   */
  private static calculateCodeScore(model: OllamaModel): number {
    let score = 0;

    // Code-specialized models score highest
    const codeSpecialized = ["codellama", "qwen", "deepseek"];
    if (codeSpecialized.includes(model.family)) {
      score += 30;
    }

    // Larger models generally better (up to a point)
    const paramSize = parseInt(model.parameterSize);
    if (paramSize >= 13) score += 25;
    else if (paramSize >= 7) score += 20;
    else if (paramSize >= 3) score += 10;

    // Higher quantization = better quality
    if (model.quantization.startsWith("Q8") || model.quantization === "F16")
      score += 15;
    else if (model.quantization.startsWith("Q6")) score += 10;
    else if (model.quantization.startsWith("Q5")) score += 8;
    else if (model.quantization.startsWith("Q4")) score += 5;

    // Prefer recently pulled (more likely maintained)
    const daysSincePull =
      (Date.now() - new Date(model.modified).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePull < 7) score += 5;

    return score;
  }
}
