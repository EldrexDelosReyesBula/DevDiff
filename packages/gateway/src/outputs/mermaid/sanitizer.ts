/**
 * Mermaid node ID sanitizer.
 *
 * Rules enforced:
 * - Node IDs: alphanumeric, underscores only (no hyphens, no spaces)
 * - Node labels: wrapped in double quotes, special chars escaped
 * - Reserved words: prefixed with underscore
 * - Maximum length: 50 chars for IDs
 */

const MERMAID_RESERVED = [
  "graph",
  "subgraph",
  "end",
  "style",
  "classDef",
  "class",
  "click",
  "direction",
  "TB",
  "BT",
  "LR",
  "RL",
  "TD",
];

const NODE_ID_PATTERN = /^[a-zA-Z0-9_]+$/;

export class MermaidSanitizer {
  /**
   * Convert any string to a safe Mermaid node ID
   */
  static toNodeId(input: string): string {
    // Step 1: Replace common separators with underscore
    let id = input
      .replace(/[@\/\\\-\.\s]/g, "_")
      .replace(/[^\w]/g, "") // Remove anything not word char
      .replace(/_+/g, "_") // Collapse multiple underscores
      .replace(/^_|_$/g, ""); // Trim leading/trailing underscores

    // Step 2: Ensure it starts with a letter (Mermaid requirement)
    if (/^\d/.test(id)) {
      id = "n_" + id;
    }

    // Step 3: Handle reserved words
    if (MERMAID_RESERVED.includes(id.toLowerCase())) {
      id = "_" + id;
    }

    // Step 4: Truncate and add hash for uniqueness
    if (id.length > 50) {
      const hash = this.djb2(input).toString(36).slice(0, 6);
      id = id.slice(0, 43) + "_" + hash;
    }

    // Step 5: Fallback for empty/unusable strings
    if (!id || !NODE_ID_PATTERN.test(id)) {
      id = "node_" + this.djb2(input).toString(36);
    }

    return id;
  }

  /**
   * Safe label wrapping
   */
  static toLabel(input: string, maxLength: number = 60): string {
    // Escape double quotes and backslashes
    let label = input
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, " ")
      .replace(/\r/g, "");

    // Truncate with ellipsis
    if (label.length > maxLength) {
      label = label.slice(0, maxLength - 3) + "...";
    }

    return `"${label}"`;
  }

  /**
   * Generate a complete safe Mermaid node declaration
   */
  static node(input: string, label?: string, shape?: string): string {
    const id = this.toNodeId(input);
    const displayLabel = label || input;

    switch (shape) {
      case "rounded":
        return `${id}(${this.toLabel(displayLabel)})`;
      case "stadium":
        return `${id}([${this.toLabel(displayLabel)}])`;
      case "subroutine":
        return `${id}[[${this.toLabel(displayLabel)}]]`;
      case "cylinder":
        return `${id}[(${this.toLabel(displayLabel)})]`;
      case "circle":
        return `${id}((${this.toLabel(displayLabel)}))`;
      case "asymmetric":
        return `${id}>${this.toLabel(displayLabel)}]`;
      case "rhombus":
        return `${id}{${this.toLabel(displayLabel)}}`;
      case "hexagon":
        return `${id}{{${this.toLabel(displayLabel)}}}`;
      case "parallelogram":
        return `${id}[/${this.toLabel(displayLabel)}/]`;
      case "parallelogram-alt":
        return `${id}[\\${this.toLabel(displayLabel)}\\]`;
      case "trapezoid":
        return `${id}[/${this.toLabel(displayLabel)}\\]`;
      case "trapezoid-alt":
        return `${id}[\\${this.toLabel(displayLabel)}/]`;
      case "double-circle":
        return `${id}(((${this.toLabel(displayLabel)})))`;
      default:
        return `${id}[${this.toLabel(displayLabel)}]`;
    }
  }

  /**
   * Safe edge with optional label
   */
  static edge(
    from: string,
    to: string,
    type: "arrow" | "open" | "dotted" | "thick" = "arrow",
    label?: string,
  ): string {
    const fromId = this.toNodeId(from);
    const toId = this.toNodeId(to);
    const edgeLabel = label ? `|${this.toLabel(label)}|` : "";

    const arrows: Record<string, string> = {
      arrow: "-->",
      open: "---",
      dotted: "-.->",
      thick: "==>",
    };

    return `${fromId} ${edgeLabel}${arrows[type]} ${toId}`;
  }

  /**
   * Validate entire diagram before output
   */
  static validate(diagram: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for unclosed brackets
    const openBrackets = (diagram.match(/\[/g) || []).length;
    const closeBrackets = (diagram.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push(
        `Bracket mismatch: ${openBrackets} open, ${closeBrackets} close`,
      );
    }

    // Check for unclosed quotes
    const quotes = diagram.match(/"/g) || [];
    if (quotes.length % 2 !== 0) {
      errors.push("Unclosed double quotes");
    }

    // Check for common syntax errors
    if (/->x/.test(diagram) && !/sequenceDiagram/.test(diagram)) {
      errors.push("Sequence diagram arrows used outside sequenceDiagram");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Deterministic hash for unique ID generation
   */
  private static djb2(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
