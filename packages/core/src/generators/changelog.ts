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
import { loadContext } from "../context/compiler";
import { verifyExplanation } from "../verification/accuracy-check";
import { DeepContextIndexer } from "../context/deep-indexer";
import { AccuracyGuard } from "../verification/pre-generation-check";
import { PluginManager } from "../plugins/manager";

export interface GenerateOptions {
  diffText: string;
  repoPath?: string;
  dryRun?: boolean;
  format?: "markdown" | "json" | "html";
  skipVerification?: boolean;
  persona?: string;
  timeoutMs?: number;
}

export interface GenerateResult {
  rawResult: AIExplanationResult;
  formattedOutput: string;
  format: "markdown" | "json" | "html";
  contextUsed?: boolean;
  verification?: {
    valid: boolean;
    issues: string[];
    confidence: number;
  };
}

export async function generateChangelog(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const repoPath = options.repoPath || process.cwd();
  const config = await loadConfig(repoPath);

  // Load plugins!
  const pluginManager = new PluginManager(repoPath);
  try {
    await pluginManager.loadPlugins();
  } catch {}

  const parserResult = diffParser.parse(options.diffText);

  // Run beforeAnalysis hook!
  let processedDiff = parserResult;
  try {
    processedDiff = await pluginManager.runBeforeAnalysis(parserResult, {});
  } catch {}

  if (options.dryRun) {
    const chosenFormat = options.format || config.format;
    const emptyResult: AIExplanationResult = {
      summary: "[DRY RUN] Would call AI to generate explanation for this diff.",
      impact: "none",
      breaking: false,
      files: [],
      relatedIssues: [],
    };
    return {
      rawResult: emptyResult,
      formattedOutput: formatOutput(emptyResult, chosenFormat),
      format: chosenFormat,
      contextUsed: false,
    };
  }

  if (processedDiff.files.length === 0) {
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
      contextUsed: false,
    };
  }

  // Load project context (silently — no error if missing)
  const loadedContext = await loadContext(repoPath);

  if (loadedContext?.hadSecrets) {
    console.warn(
      "⚠️  DevDiff detected and redacted secrets in your .devdiff/context.md before sending to AI.",
    );
  }

  // Load deep context (first-run dynamic indexing if missing)
  let deepContextData: any = null;
  const deepContextPath = path.join(
    repoPath,
    ".devdiff/context/deep-context.json",
  );
  try {
    const rawDeep = await fs.readFile(deepContextPath, "utf-8");
    deepContextData = JSON.parse(rawDeep);
  } catch {
    try {
      deepContextData = await DeepContextIndexer.index(repoPath);
    } catch (e) {
      // Ignore indexing failures
    }
  }

  let finalContextString = "";
  if (loadedContext?.raw) {
    finalContextString += loadedContext.raw;
  }
  if (deepContextData) {
    const deepPrompt = DeepContextIndexer.toPromptContext(deepContextData);
    finalContextString = finalContextString
      ? `${finalContextString}\n\n${deepPrompt}`
      : deepPrompt;
  }

  // Process files to build a clean context for the AI
  const processedFiles: string[] = [];

  for (const fileDiff of processedDiff.files) {
    const oldPath = fileDiff.oldPath;
    const newPath = fileDiff.newPath;

    // Skip ignored files based on config.exclude glob matches
    const isIgnored = config.exclude.some((pattern) => {
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
      const fullPath = path.resolve(repoPath, newPath);
      try {
        fileContent = await fs.readFile(fullPath, "utf-8");
      } catch {
        // Fallback: we don't have the full file content, just use the diff chunks
      }
    }

    // Find changed lines in this file
    const fileChanges = processedDiff.changes.filter((c) => c.line);
    const changedLines = fileChanges.map((c) => c.line);

    let contextCode = "";
    if (fileContent && newPath) {
      contextCode = trimAST(newPath, fileContent, changedLines);
    } else {
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

  // Accuracy Guard Pre-Check
  if (!options.dryRun && deepContextData) {
    try {
      const preCheck = AccuracyGuard.preCheck(processedDiff, deepContextData);
      if (preCheck.warnings.length > 0) {
        console.warn("\n⚠️  Pre-analysis notes:");
        for (const w of preCheck.warnings) {
          console.warn(`   • ${w}`);
        }
        console.warn(
          `   • Confidence: ${preCheck.confidence > 0.7 ? "High" : preCheck.confidence > 0.4 ? "Moderate" : "Low"}`,
        );
      }
    } catch {}
  }

  // Run AI router — project context is passed for injection into the prompt
  const router = new AIRouter(config);
  const explanation = await router.getExplanation(diffContext, {
    dryRun: options.dryRun,
    projectContext: finalContextString || undefined,
    personaId: options.persona,
    timeoutMs: options.timeoutMs,
  });

  // Post-generation verification (warn-only by default)
  let verificationSummary: GenerateResult["verification"] | undefined;
  if (!options.dryRun && !options.skipVerification) {
    let verResult = verifyExplanation(explanation, processedDiff);

    // Supplement with AccuracyGuard postCheck
    if (deepContextData) {
      try {
        const postCheck = AccuracyGuard.postCheck(
          explanation.summary +
            "\n" +
            (explanation.files || []).map((f) => f.explanation).join("\n"),
          processedDiff,
          deepContextData,
        );

        if (postCheck.flags.length > 0) {
          console.warn("");
          for (const flag of postCheck.flags) {
            console.warn(`⚠️  Accuracy check: ${flag}`);
          }
          console.warn(`\n${postCheck.recommendation}`);
        }

        verResult = {
          valid: postCheck.passed,
          issues: postCheck.flags.map((f: string) => ({
            type: "identifier-not-in-diff",
            message: f,
            severity: "warning",
          })),
          confidence: postCheck.confidence,
          checkedFiles: verResult.checkedFiles,
          checkedIdentifiers: verResult.checkedIdentifiers,
        };
      } catch {}
    } else {
      // Surface standard file-reference warnings to the console
      const warnings = verResult.issues.filter((i) => i.severity === "warning");
      if (warnings.length > 0) {
        console.warn("");
        for (const w of warnings) {
          console.warn(`⚠️  Accuracy check: ${w.message}`);
        }
      }

      if (verResult.confidence < 0.5) {
        console.warn(
          `⚠️  AI confidence: ${(verResult.confidence * 100).toFixed(0)}% — explanation may contain inaccuracies, review recommended.`,
        );
      }
    }

    verificationSummary = {
      valid: verResult.valid,
      issues: verResult.issues.map((i) => i.message),
      confidence: verResult.confidence,
    };
  }

  // Apply persona post-processing if specified
  if (options.persona) {
    const { PersonaRegistry, PersonaEngine } = await import("@eldrex/personas");
    const personaObj = PersonaRegistry.get(options.persona);
    if (personaObj) {
      explanation.summary = PersonaEngine.postProcess(explanation.summary, personaObj);
      if (explanation.files) {
        for (const f of explanation.files) {
          f.explanation = PersonaEngine.postProcess(f.explanation, personaObj);
        }
      }
    }
  }

  // Format the output
  const chosenFormat = options.format || config.format;
  let formattedOutput = formatOutput(explanation, chosenFormat);

  let finalResult = {
    rawResult: explanation,
    formattedOutput,
    format: chosenFormat,
    contextUsed: loadedContext !== null,
    verification: verificationSummary,
  };

  // Run afterAnalysis hook!
  try {
    const afterResult = await pluginManager.runAfterAnalysis({
      summary: finalResult.rawResult.summary,
      impact: finalResult.rawResult.impact,
      breaking: finalResult.rawResult.breaking,
      files: finalResult.rawResult.files,
      relatedIssues: finalResult.rawResult.relatedIssues,
      formattedOutput: finalResult.formattedOutput,
    });
    if (afterResult && afterResult.formattedOutput) {
      finalResult.formattedOutput = afterResult.formattedOutput;
    }
  } catch {}

  // Run onAIComplete hook!
  try {
    await pluginManager.runOnAIComplete({
      summary: finalResult.rawResult.summary,
      provider: router.getActualFallbackChain()[0] || "unknown",
      model: "unknown",
    });
  } catch {}

  return finalResult;
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
