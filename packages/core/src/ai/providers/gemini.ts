import {
  AIProvider,
  AIExplanationResult,
  SYSTEM_PROMPT,
  parseAIJSONResponse,
} from "./base";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
  }

  async generateExplanation(
    diffText: string,
    modelName: string,
  ): Promise<AIExplanationResult> {
    const key = this.apiKey;
    if (!key) {
      throw new Error("Gemini API Key is not configured.");
    }

    // Default to a modern stable model if the user specifies simple gemini URL or fallback
    // e.g. 'gemini-1.5-flash'
    const model = modelName.includes("/") ? modelName : `models/${modelName}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${key}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Analyze this diff:\n${diffText}` }],
            },
          ],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Gemini API returned status ${response.status}: ${await response.text()}`,
        );
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return parseAIJSONResponse(text);
    } catch (error) {
      console.error("Gemini execution error:", error);
      throw error;
    }
  }
}
