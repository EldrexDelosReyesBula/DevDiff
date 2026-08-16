export interface AIProvider {
  type: "ide-agent" | "ollama" | "cloud" | "none";
  name: string;
  cost: string;
  speed: string;
}

export class StudyBuddyAIRouter {
  /**
   * Smart AI selection for Study Buddy:
   * 1. IDE Agent (fastest, zero setup)
   * 2. Local Ollama (free, private)
   * 3. Cloud AI (explicit key required)
   */
  static getProvider(): AIProvider {
    // 1. Check if running inside IDE Agent context
    if (process.env.ANTIGRAVITY_IDE || process.env.VSCODE_PID) {
      return {
        type: "ide-agent",
        name: "IDE Agent",
        cost: "Uses IDE tokens",
        speed: "Fast",
      };
    }

    // 2. Check local Ollama
    if (process.env.OLLAMA_HOST || process.env.OLLAMA_MODEL) {
      return {
        type: "ollama",
        name: `Ollama (${process.env.OLLAMA_MODEL || "llama3"})`,
        cost: "Free (Local)",
        speed: "Medium",
      };
    }

    // 3. Check Cloud AI key
    if (
      process.env.OPENAI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.ANTHROPIC_API_KEY
    ) {
      const provider = process.env.GEMINI_API_KEY
        ? "Gemini"
        : process.env.OPENAI_API_KEY
          ? "OpenAI"
          : "Anthropic";
      return {
        type: "cloud",
        name: `Cloud AI (${provider})`,
        cost: "API Key",
        speed: "Fast",
      };
    }

    return {
      type: "none",
      name: "None",
      cost: "Setup required",
      speed: "N/A",
    };
  }
}
