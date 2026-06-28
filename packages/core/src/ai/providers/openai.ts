import {
  AIProvider,
  AIExplanationResult,
  SYSTEM_PROMPT,
  parseAIJSONResponse,
} from "./base";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
  }

  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    const key = this.apiKey;
    if (!key) {
      throw new Error("OpenAI API Key is not configured.");
    }

    const url = "https://api.openai.com/v1/chat/completions";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Analyze this diff:\n${diffText}` },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API returned status ${response.status}: ${await response.text()}`,
        );
      }

      const data = (await response.json()) as {
        choices: { message: { content: string } }[];
      };
      const content = data.choices[0]?.message?.content || "";
      return parseAIJSONResponse(content);
    } catch (error) {
      console.error("OpenAI execution error:", error);
      throw error;
    }
  }
}
