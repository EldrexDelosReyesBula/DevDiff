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

export class OllamaProvider implements AIProvider {
  name = "ollama";
  private host: string;
  private timeoutMs: number;

  constructor(host = "http://localhost:11434", timeoutMs = 30_000) {
    this.host = host;
    this.timeoutMs = timeoutMs;
  }

  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    const url = `${this.host}/api/generate`;
    const prompt = `System Instructions:\n${SYSTEM_PROMPT}\n\nGit Diff:\n${diffText}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

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
      return parseAIJSONResponse(data.response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new OllamaNotAvailableError(
          `Ollama request timed out after ${this.timeoutMs}ms`,
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
}
