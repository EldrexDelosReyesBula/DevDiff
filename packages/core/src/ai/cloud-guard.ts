import { loadConfig } from "../config/loader";

export class CloudGuard {
  /**
   * Check if cloud AI is explicitly configured
   * Environment variables alone are NOT sufficient
   */
  static async isExplicitlyConfigured(providerName: string): Promise<boolean> {
    try {
      const config = await loadConfig();
      const providers = config.ai?.providers || [];
      const match = providers.find(
        (p) =>
          p.name?.toLowerCase() === providerName.toLowerCase() ||
          p.url?.toLowerCase().includes(providerName.toLowerCase())
      ) as any;

      if (!match) return false;
      if (!match.explicitlyAdded) return false;
      if (match.disabled) return false;

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Warn if API keys are detected in environment but not explicitly configured via `devdiff auth add`
   */
  static warnIfKeysDetected(): string[] {
    const detected: string[] = [];

    if (process.env.OPENAI_API_KEY) detected.push("OpenAI");
    if (process.env.ANTHROPIC_API_KEY) detected.push("Anthropic");
    if (process.env.GROQ_API_KEY) detected.push("Groq");
    if (process.env.GEMINI_API_KEY) detected.push("Google Gemini");
    if (process.env.DEEPSEEK_API_KEY) detected.push("DeepSeek");

    if (detected.length > 0) {
      console.log("");
      console.log("ℹ️  Cloud API keys detected in environment:");
      for (const provider of detected) {
        console.log(`   • ${provider}`);
      }
      console.log("");
      console.log("   These keys are NOT being used by DevDiff.");
      console.log("   Cloud AI requires explicit setup:");
      console.log("   devdiff auth add <provider>");
      console.log("");
      console.log("   Your API keys are safe. Nothing is called without your consent.");
      console.log("");
    }

    return detected;
  }

  /**
   * Show setup instructions when cloud AI is requested but not explicitly configured
   */
  static showSetupInstructions(provider: string): string {
    const instructions: Record<string, string> = {
      openai: "devdiff auth add openai",
      anthropic: "devdiff auth add anthropic",
      groq: "devdiff auth add groq",
      gemini: "devdiff auth add gemini",
      deepseek: "devdiff auth add deepseek",
    };

    const cmd = instructions[provider.toLowerCase()] || `devdiff auth add ${provider}`;

    return [
      "",
      `☁️ ${provider} is not configured for use with DevDiff.`,
      "",
      "   To use cloud AI, explicitly set it up:",
      `   ${cmd}`,
      "",
      "   This ensures:",
      "   • You know when cloud AI is being used",
      "   • You control which provider is called",
      "   • Your API key is never used without your knowledge",
      "   • Costs are transparent and intentional",
      "",
    ].join("\n");
  }
}
