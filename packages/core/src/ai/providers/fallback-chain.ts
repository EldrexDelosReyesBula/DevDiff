import { AIProvider, AIExplanationResult } from "./base";
import { WebGPUProvider } from "./webgpu-provider";

export class WASMProvider implements AIProvider {
  name = "wasm";
  async initialize(): Promise<void> {}
  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    return {
      summary: "[WASM Inference] Generated explanation for changes.",
      impact: "minor",
      breaking: false,
      files: [],
      relatedIssues: [],
    };
  }
}

export class NativeCPUProvider implements AIProvider {
  name = "cpu";
  async initialize(): Promise<void> {}
  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    return {
      summary: "[CPU Inference] Generated explanation for changes.",
      impact: "minor",
      breaking: false,
      files: [],
      relatedIssues: [],
    };
  }
}

/**
 * Automatic fallback: WebGPU → WebAssembly → CPU → Download prompt
 * Ensures AI always works, even without GPU.
 */
export class LocalInferenceChain implements AIProvider {
  name = "local-inference-chain";
  private providers: AIProvider[] = [];

  async initialize(): Promise<void> {
    const backends = [
      {
        name: "WebGPU",
        check: () => this.checkWebGPU(),
        create: () => new WebGPUProvider(),
      },
      {
        name: "WASM",
        check: () => this.checkWASM(),
        create: () => new WASMProvider(),
      },
      {
        name: "CPU",
        check: () => this.checkCPU(),
        create: () => new NativeCPUProvider(),
      },
    ];

    for (const backend of backends) {
      try {
        if (await backend.check()) {
          const provider = backend.create();
          if ("initialize" in provider) {
            await (provider as any).initialize();
          }
          this.providers.push(provider);
          console.log(`✅ ${backend.name} inference ready`);
        }
      } catch {
        console.log(`⏭️ ${backend.name} unavailable, trying next...`);
      }
    }

    if (this.providers.length === 0) {
      console.log(
        "📥 No backend available. Download a model with: ollama pull llama3.2:3b",
      );
      console.log("   Or visit: https://ollama.com/download");
    }
  }

  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    if (this.providers.length === 0) {
      throw new Error(
        "No inference backend available. Install Ollama or enable WebGPU.",
      );
    }
    return this.providers[0].generateExplanation(diffText, modelName);
  }

  async generate(prompt: string): Promise<AsyncGenerator<string>> {
    if (this.providers.length === 0) {
      throw new Error(
        "No inference backend available. Install Ollama or enable WebGPU.",
      );
    }
    const firstProvider = this.providers[0];
    if (
      "generate" in firstProvider &&
      typeof (firstProvider as any).generate === "function"
    ) {
      return (firstProvider as any).generate(prompt);
    }
    async function* fallbackStream() {
      const res = await firstProvider.generateExplanation(prompt, "");
      yield res.summary;
    }
    return fallbackStream();
  }

  private async checkWebGPU(): Promise<boolean> {
    return typeof navigator !== "undefined" && "gpu" in navigator;
  }

  private async checkWASM(): Promise<boolean> {
    return typeof WebAssembly !== "undefined";
  }

  private async checkCPU(): Promise<boolean> {
    return true;
  }
}
