export interface ChangeItem {
  type: "added" | "changed" | "fixed" | "removed" | "security";
  description: string;
  files: string[];
}

export interface NaturalChangelogData {
  changes: ChangeItem[];
}

export class NaturalChangelogGenerator {
  private static readonly BANNED_PHRASES = [
    "appears to",
    "seems to",
    "could potentially",
    "might be",
    "possibly",
    "it is possible that",
    "this change appears",
    "this seems",
    "this could",
    "this might",
    "this may",
    "it looks like",
    "one could argue",
    "presumably",
    "supposedly",
    "allegedly",
  ];

  private static readonly AI_SOUNDING_PATTERNS = [
    { pattern: /This change appears to (.+)/gi, replacement: "$1" },
    { pattern: /It seems that (.+)/gi, replacement: "$1" },
    { pattern: /This could potentially (.+)/gi, replacement: "$1" },
    { pattern: /The developer appears to have (.+)/gi, replacement: "$1" },
    { pattern: /This commit appears to (.+)/gi, replacement: "$1" },
    { pattern: /This modification seems to (.+)/gi, replacement: "$1" },
    { pattern: /It looks like (.+) has been/gi, replacement: "$1 was" },
    { pattern: /There appears to be a (.+)/gi, replacement: "Added $1" },
  ];

  /**
   * Clean AI-sounding hedging language from changelog text
   */
  static sanitize(changelog: string): string {
    let cleaned = changelog;

    for (const phrase of this.BANNED_PHRASES) {
      const regex = new RegExp(phrase, "gi");
      cleaned = cleaned.replace(regex, "");
    }

    for (const { pattern, replacement } of this.AI_SOUNDING_PATTERNS) {
      cleaned = cleaned.replace(pattern, replacement);
    }

    cleaned = cleaned.replace(/\b(?:perhaps|maybe|possibly|potentially|likely)\b/gi, "");
    cleaned = cleaned.replace(
      /\b(?:I think|I believe|in my analysis|based on the diff|from the changes)\b/gi,
      ""
    );

    cleaned = cleaned.replace(/  +/g, " ");
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

    return cleaned.trim();
  }

  /**
   * Format changelog in developer-owned style
   */
  static formatAsDeveloper(data: NaturalChangelogData): string {
    const lines: string[] = [];
    const date = new Date().toISOString().slice(0, 10);

    lines.push(`## ${date}`);
    lines.push("");

    const sections: Array<{ type: ChangeItem["type"]; title: string }> = [
      { type: "added", title: "Added" },
      { type: "changed", title: "Changed" },
      { type: "fixed", title: "Fixed" },
      { type: "removed", title: "Removed" },
      { type: "security", title: "Security" },
    ];

    for (const section of sections) {
      const items = data.changes.filter((c) => c.type === section.type);
      if (items.length === 0) continue;

      lines.push(`### ${section.title}`);
      lines.push("");
      for (const change of items) {
        const fileList = change.files.map((f) => `\`${f}\``).join(", ");
        lines.push(fileList ? `- ${change.description} (${fileList})` : `- ${change.description}`);
      }
      lines.push("");
    }

    return lines.join("\n").trim();
  }
}
