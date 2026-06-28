import {
  AIProvider,
  AIExplanationResult,
  SYSTEM_PROMPT,
  parseAIJSONResponse,
} from "./base";

export class OllamaProvider implements AIProvider {
  name = "ollama";
  private host: string;

  constructor(host = "http://localhost:11434") {
    this.host = host;
  }

  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    const url = `${this.host}/api/generate`;
    const prompt = `System Instructions:\n${SYSTEM_PROMPT}\n\nGit Diff:\n${diffText}`;

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
      });

      if (!response.ok) {
        throw new Error(
          `Ollama returned status ${response.status}: ${await response.text()}`,
        );
      }

      const data = (await response.json()) as { response: string };
      return parseAIJSONResponse(data.response);
    } catch (error) {
      console.error("Ollama execution error:", error);
      throw error;
    }
  }
}
