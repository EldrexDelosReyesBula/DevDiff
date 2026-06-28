export interface Persona {
  id: string;
  name: string;
  description: string;
  tone:
    "formal" | "casual" | "technical" | "executive" | "educational" | "robotic";
  verbosity: 1 | 2 | 3 | 4 | 5; // 1 = ultra-concise, 5 = exhaustive
  focus: string[]; // What to emphasize
  ignore: string[]; // What to omit
  format_preference: "paragraphs" | "bullets" | "tables" | "mixed";
  emoji_usage: boolean;
  jargon_level: "none" | "minimal" | "moderate" | "heavy";
  system_prompt: string;
}

export class PersonaEngine {
  /**
   * Generates the system prompt to instruct the AI based on the Persona properties.
   */
  static generateSystemPrompt(persona: Persona): string {
    const focusStr =
      persona.focus.length > 0 ? `Focus on: ${persona.focus.join(", ")}.` : "";
    const ignoreStr =
      persona.ignore.length > 0
        ? `Ignore or omit: ${persona.ignore.join(", ")}.`
        : "";

    return `${persona.system_prompt}
    
Guidelines for your response:
- Tone: ${persona.tone}
- Verbosity level: ${persona.verbosity}/5 (1 is ultra-concise/minimalist, 5 is extremely detailed and explanatory).
- Format preference: ${persona.format_preference}.
- Emojis: ${persona.emoji_usage ? "Use emojis where appropriate to make the text lively." : "DO NOT use emojis under any circumstance."}
- Technical Jargon: ${persona.jargon_level} level.
${focusStr}
${ignoreStr}
`;
  }

  /**
   * Post-processes the output to align it closer to the persona config (fallback filter).
   */
  static postProcess(output: string, persona: Persona): string {
    let result = output;

    // If emojis are disabled, clean them up
    if (!persona.emoji_usage) {
      // Basic emoji regex pattern to strip emojis
      result = result.replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        "",
      );
    }

    // Enforce verbosity constraint post-processing if necessary (e.g. ultra-concise max limits)
    if (persona.verbosity === 1) {
      const lines = result.split("\n");
      if (lines.length > 10) {
        // Just keeping it reasonably compact if it somehow exceeded
      }
    }

    return result.trim();
  }
}
