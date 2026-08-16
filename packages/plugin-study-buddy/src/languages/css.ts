import { ExplanationLevel } from "../levels";
import { CodeExplanation, ExplanationSection } from "./universal";

export interface CSSProperty {
  property: string;
  value: string;
  line: string;
}

export interface CSSSelector {
  selector: string;
  type: string;
}

export class CSSExplainer {
  explain(params: {
    code: string;
    level: ExplanationLevel;
    filePath: string;
  }): CodeExplanation {
    const properties = this.extractProperties(params.code);
    const selectors = this.extractSelectors(params.code);

    const sections: ExplanationSection[] = [];

    // ── What this stylesheet does ──
    sections.push({
      title: "What This Stylesheet Does",
      content: this.explainPurpose(params.filePath, selectors),
      importance: "essential",
    });

    // ── Selectors explained ──
    if (selectors.length > 0) {
      sections.push({
        title: "Selectors Explained",
        content: this.explainSelectors(selectors),
        importance: "essential",
      });
    }

    // ── Properties explained in plain English ──
    if (properties.length > 0) {
      sections.push({
        title: "Properties Explained",
        content: this.explainProperties(properties),
        importance: "important",
      });
    }

    // ── Layout strategy ──
    if (this.detectLayout(properties)) {
      sections.push({
        title: "Layout Strategy",
        content: this.explainLayout(properties),
        importance: "important",
      });
    }

    return {
      language: "CSS",
      level: params.level,
      summary: `CSS stylesheet with ${selectors.length} selector(s) and ${properties.length} declaration(s).`,
      sections,
      keyTakeaways: this.generateTakeaways(selectors, properties),
      suggestedNextLevel: params.level === "beginner" ? "student" : undefined,
      relatedConcepts: ["CSS Box Model", "Specificity", "Responsive Design", "Flexbox & Grid"],
    };
  }

  private extractProperties(code: string): CSSProperty[] {
    const properties: CSSProperty[] = [];
    const lines = code.split("\n");

    for (const line of lines) {
      const match = line.match(/^\s*([a-z-]+)\s*:\s*(.+?);?\s*$/);
      if (match) {
        properties.push({
          property: match[1],
          value: match[2].trim(),
          line: line.trim(),
        });
      }
    }

    return properties;
  }

  private extractSelectors(code: string): CSSSelector[] {
    const selectors: CSSSelector[] = [];
    const lines = code.split("\n");

    for (const line of lines) {
      const match = line.match(/^([.#@]?[a-zA-Z0-9-_\s,.[\]>+~:#*()"']+)\s*\{/);
      if (match) {
        selectors.push({
          selector: match[1].trim(),
          type: this.classifySelector(match[1].trim()),
        });
      }
    }

    return selectors;
  }

  private classifySelector(selector: string): string {
    if (selector.startsWith(".")) return "class";
    if (selector.startsWith("#")) return "id";
    if (selector.startsWith("@")) return "at-rule";
    if (selector.includes(":")) return "pseudo-class";
    return "element";
  }

  private explainSelectors(selectors: CSSSelector[]): string {
    const explanations: Record<string, string> = {
      class: "Targets elements with a specific class (`.class-name`) — reusable across elements",
      id: "Targets a unique element (`#id-name`) — single element per page",
      element: "Targets all HTML elements of a type (`div`, `p`, `h1`)",
      "at-rule": "Directive controlling media queries or keyframe animations (`@media`)",
      "pseudo-class": "Targets elements in specific interaction states (`:hover`, `:focus`)",
    };

    return selectors
      .map((s) => `- **\`${s.selector}\`** — ${explanations[s.type] || "CSS selector"}`)
      .join("\n");
  }

  private explainProperties(properties: CSSProperty[]): string {
    const commonExplanations: Record<string, string> = {
      color: "Sets text color",
      "background-color": "Sets container background color",
      "font-size": "Controls text font size",
      margin: "Adds spacing OUTSIDE the element border",
      padding: "Adds spacing INSIDE the element between border and content",
      border: "Adds a boundary border around the element",
      display: "Controls layout model (flex, grid, block, inline)",
      "justify-content": "Aligns items along main axis in flex/grid container",
      "align-items": "Aligns items along cross axis in flex/grid container",
      gap: "Adds spacing between flex or grid items",
      "border-radius": "Rounds container corners",
      "box-shadow": "Applies shadow drop effect",
    };

    return properties
      .map((p) => {
        const desc = commonExplanations[p.property] || `Sets the ${p.property} style attribute`;
        return `- **\`${p.property}: ${p.value}\`** — ${desc}`;
      })
      .join("\n");
  }

  private detectLayout(properties: CSSProperty[]): boolean {
    return properties.some((p) => ["display", "flex", "grid", "position"].includes(p.property));
  }

  private explainLayout(properties: CSSProperty[]): string {
    const displayProp = properties.find((p) => p.property === "display");
    if (displayProp?.value.includes("flex")) {
      return "Uses **Flexbox** — a one-dimensional layout system ideal for aligning items in rows or columns.";
    }
    if (displayProp?.value.includes("grid")) {
      return "Uses **CSS Grid** — a two-dimensional layout system ideal for row & column web layouts.";
    }
    return "Applies custom positioning and layout constraints.";
  }

  private explainPurpose(filePath: string, selectors: CSSSelector[]): string {
    return `Styles ${selectors.length} selector target(s) in \`${filePath}\`.`;
  }

  private generateTakeaways(selectors: CSSSelector[], properties: CSSProperty[]): string[] {
    const takeaways: string[] = [];
    if (selectors.some((s) => s.type === "class")) takeaways.push("Class selectors enable reusable styles.");
    if (properties.some((p) => p.property === "display" && p.value.includes("flex"))) takeaways.push("Flexbox arranges items dynamically.");
    if (takeaways.length === 0) takeaways.push("CSS rules define element presentation.");
    return takeaways;
  }
}
