import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { CompletenessValidator } from "../output/completeness-validator";
import { OutputQualityGate } from "../output/quality-gate";

export interface ImportResult {
  success: boolean;
  error?: string;
  issues?: string[];
  outputPath?: string;
  lines?: number;
  characters?: number;
  preview?: string;
}

export class ImportEngine {
  /**
   * Import a changelog from an AI response
   */
  static async import(params: {
    content: string;
    format?: "markdown" | "json";
    outputPath?: string;
    prepend?: boolean;
    validate?: boolean;
    workspacePath?: string;
  }): Promise<ImportResult> {
    const format = params.format || "markdown";
    const workspacePath = params.workspacePath || process.cwd();

    // Clean the AI response
    let cleaned = params.content;

    // Remove common AI preambles
    cleaned = cleaned.replace(
      /^(Here|Sure|Certainly|Of course|Absolutely)[.!].*?\n\n/i,
      "",
    );
    cleaned = cleaned.replace(/^(I'll|Let me|I can|I will).*?\n\n/i, "");

    // Remove common AI postscripts
    cleaned = cleaned.replace(
      /\n\n*(Let me know|I hope|Feel free|If you need|Hope this).*$/i,
      "",
    );

    // Extract markdown if wrapped in code block
    if (format === "markdown") {
      const markdownMatch = cleaned.match(
        /```(?:markdown|md)?\s*\n([\s\S]*?)\n```/,
      );
      if (markdownMatch) {
        cleaned = markdownMatch[1];
      }
    }

    // Extract JSON if wrapped
    if (format === "json") {
      const jsonMatch = cleaned.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        cleaned = jsonMatch[1];
      }
    }

    cleaned = cleaned.trim();

    if (!cleaned) {
      return {
        success: false,
        error: "Content is empty or unparseable",
      };
    }

    // Validate
    if (params.validate !== false) {
      const validation = CompletenessValidator.validate(cleaned);

      if (!validation.complete) {
        return {
          success: false,
          error: "Imported changelog appears incomplete",
          issues: validation.issues,
          preview: cleaned.slice(0, 200),
        };
      }

      // Run through quality gate
      const quality = await OutputQualityGate.process(cleaned, {
        fallbackToTemplate: false,
      });

      if (!quality.accepted) {
        return {
          success: false,
          error: quality.reason || "Quality check failed",
          preview: cleaned.slice(0, 200),
        };
      }

      cleaned = quality.output || cleaned;
    }

    // Save
    const outputPath = path.resolve(
      workspacePath,
      params.outputPath || "CHANGELOG.md",
    );

    try {
      if (params.prepend && fs.existsSync(outputPath)) {
        const existing = fs.readFileSync(outputPath, "utf-8");
        const header = existing.match(/^#.*?\n\n/)?.[0] || "# Changelog\n\n";
        const rest = existing.replace(/^#.*?\n\n/, "");
        fs.writeFileSync(outputPath, header + cleaned + "\n\n" + rest, "utf-8");
      } else {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(outputPath, cleaned, "utf-8");
      }
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to write file: ${err.message}`,
        preview: cleaned.slice(0, 200),
      };
    }

    return {
      success: true,
      outputPath,
      lines: cleaned.split("\n").length,
      characters: cleaned.length,
      preview: cleaned.slice(0, 200),
    };
  }

  /**
   * Import from clipboard
   */
  static async importFromClipboard(params: {
    format?: "markdown" | "json";
    outputPath?: string;
    prepend?: boolean;
    validate?: boolean;
    workspacePath?: string;
  }): Promise<ImportResult> {
    const clipboard = await this.readClipboard();

    if (!clipboard || clipboard.trim().length === 0) {
      return {
        success: false,
        error: "Clipboard is empty or unreadable",
      };
    }

    return this.import({
      content: clipboard,
      ...params,
    });
  }

  private static async readClipboard(): Promise<string> {
    try {
      if (process.platform === "darwin") {
        return execSync("pbpaste", { encoding: "utf-8" });
      }
      if (process.platform === "win32") {
        return execSync("powershell Get-Clipboard", { encoding: "utf-8" });
      }
      if (process.platform === "linux") {
        return execSync("xclip -o", { encoding: "utf-8" });
      }
    } catch {}

    return "";
  }
}
