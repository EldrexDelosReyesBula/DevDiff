import * as fs from "fs/promises";
import * as path from "path";
import { loadConfig } from "../config/loader";
import { diffParser } from "../diff/parser";
import { trimAST } from "../diff/ast-trimmer";
import { redactSecrets } from "../diff/secret-scanner";
import { AIRouter } from "../ai/router";
import { formatMarkdown } from "./markdown";
import { formatJSON } from "./json";
import { formatHTML } from "./html";
import { AIExplanationResult } from "../ai/providers/base";

export interface GenerateOptions {
  diffText: string;
  repoPath?: string;
  dryRun?: boolean;
  format?: "markdown" | "json" | "html";
}

export interface GenerateResult {
  rawResult: AIExplanationResult;
  formattedOutput: string;
  format: "markdown" | "json" | "html";
}

export async function generateChangelog(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const config = await loadConfig(options.repoPath);
  const parserResult = diffParser.parse(options.diffText);

  if (parserResult.files.length === 0) {
    const emptyResult: AIExplanationResult = {
      summary: "No changes detected.",
      impact: "none",
      breaking: false,
      files: [],
      relatedIssues: [],
    };
    const chosenFormat = options.format || config.format;
    return {
      rawResult: emptyResult,
      formattedOutput: formatOutput(emptyResult, chosenFormat),
      format: chosenFormat,
    };
  }

  // Process files to build a clean context for the AI
  const processedFiles: string[] = [];

  for (const fileDiff of parserResult.files) {
    const oldPath = fileDiff.oldPath;
    const newPath = fileDiff.newPath;

    // Skip ignored files based on config.exclude glob matches (we can do basic suffix or path check)
    const isIgnored = config.exclude.some((pattern) => {
      // Simple glob/include checks
      const cleanPattern = pattern.replace(/\*\*/g, "").replace(/\*/g, "");
      return (
        (newPath && newPath.includes(cleanPattern)) ||
        (oldPath && oldPath.includes(cleanPattern))
      );
    });

    if (isIgnored) {
      continue;
    }

    if (fileDiff.isDeleted) {
      processedFiles.push(`File Deleted: ${oldPath}`);
      continue;
    }

    if (fileDiff.isNew) {
      processedFiles.push(`File Created: ${newPath}`);
    }

    // Try AST trimming if newPath is available and exists on disk
    let fileContent = "";
    if (newPath) {
      const fullPath = path.resolve(options.repoPath || ".", newPath);
      try {
        fileContent = await fs.readFile(fullPath, "utf-8");
      } catch {
        // Fallback: we don't have the full file content, just use the diff chunks
      }
    }

    // Find changed lines in this file
    const fileChanges = parserResult.changes.filter((c) => c.line);
    const changedLines = fileChanges.map((c) => c.line);

    let contextCode = "";
    if (fileContent && newPath) {
      contextCode = trimAST(newPath, fileContent, changedLines);
    } else {
      // If we can't read the file, combine diff chunk contents
      contextCode = fileDiff.hunks
        .map((h) => h.lines.map((l) => l.content).join("\n"))
        .join("\n");
    }

    // Redact sensitive keys/tokens from code context
    const redactedCode = redactSecrets(contextCode);

    processedFiles.push(`--- File: ${newPath || oldPath} ---\n${redactedCode}`);
  }

  // Join all file contexts together
  const diffContext = processedFiles.join("\n\n");

  // Run AI router
  const router = new AIRouter(config);
  const explanation = await router.getExplanation(diffContext, {
    dryRun: options.dryRun,
  });

  // Format the output
  const chosenFormat = options.format || config.format;
  const formattedOutput = formatOutput(explanation, chosenFormat);

  return {
    rawResult: explanation,
    formattedOutput,
    format: chosenFormat,
  };
}

function formatOutput(
  result: AIExplanationResult,
  format: "markdown" | "json" | "html",
): string {
  switch (format) {
    case "json":
      return formatJSON(result);
    case "html":
      return formatHTML(result);
    case "markdown":
    default:
      return formatMarkdown(result);
  }
}
