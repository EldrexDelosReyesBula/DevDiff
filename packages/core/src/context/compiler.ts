import * as fs from "fs/promises";
import * as path from "path";
import { SecretScanner } from "../diff/secret-scanner";
import {
  ProjectContextScanner,
  formatContext,
  ScannedContext,
} from "./scanner";

/** Maximum characters to include in the injected context (~500 tokens). */
const MAX_CONTEXT_CHARS = 2000;

/** Path inside the repo where the user's context file lives. */
const CONTEXT_FILE_NAME = ".devdiff/context.md";

export interface LoadedContext {
  raw: string;
  source: "file" | "auto-scan" | "none";
  hadSecrets: boolean;
}

/**
 * Loads the project context from `.devdiff/context.md` if it exists,
 * or falls back to auto-scanning the project.
 *
 * Returns null if neither source yields content (empty project).
 */
export async function loadContext(
  repoPath: string,
): Promise<LoadedContext | null> {
  const contextFilePath = path.join(repoPath, CONTEXT_FILE_NAME);

  // Try to load user's handcrafted context file
  try {
    const raw = await fs.readFile(contextFilePath, "utf-8");
    if (raw.trim()) {
      const { redacted, hadSecrets } = sanitizeContext(raw);
      return { raw: redacted, source: "file", hadSecrets };
    }
  } catch {
    // File doesn't exist or unreadable — fall through to auto-scan
  }

  // Auto-scan
  try {
    const scanner = new ProjectContextScanner(repoPath);
    const ctx = await scanner.scan();
    const raw = formatContext(ctx);
    if (!raw.trim()) return null;
    const { redacted, hadSecrets } = sanitizeContext(raw);
    return { raw: redacted, source: "auto-scan", hadSecrets };
  } catch {
    return null;
  }
}

/**
 * Compiles a context string: applies secret redaction and trims to token budget.
 */
function sanitizeContext(raw: string): {
  redacted: string;
  hadSecrets: boolean;
} {
  const scanner = new SecretScanner();
  const findings = scanner.scan(raw);
  const hadSecrets = findings.length > 0;
  const redacted = hadSecrets ? scanner.redact(raw) : raw;

  // Trim to budget
  const trimmed =
    redacted.length > MAX_CONTEXT_CHARS
      ? redacted.substring(0, MAX_CONTEXT_CHARS) +
        "\n...(truncated for token budget)"
      : redacted;

  return { redacted: trimmed, hadSecrets };
}

/**
 * Injects project context into the system prompt.
 * The context is placed between the system instructions and the diff content.
 *
 * @param systemPrompt - The base SYSTEM_PROMPT string
 * @param context - Compiled context markdown
 * @returns Enhanced system prompt with context block
 */
export function injectContextIntoPrompt(
  systemPrompt: string,
  context: string,
): string {
  const contextBlock = [
    "",
    "=== PROJECT KNOWLEDGE BASE ===",
    "Use this to understand the project. Base all explanations on the diff AND this context.",
    "Do NOT fabricate modules, files, or identifiers not present in the diff.",
    "",
    context.trim(),
    "=== END PROJECT KNOWLEDGE BASE ===",
    "",
  ].join("\n");

  return systemPrompt + contextBlock;
}

/**
 * Generates and writes context to `.devdiff/context.md`.
 * Creates the `.devdiff/` directory if needed.
 */
export async function generateContextFile(repoPath: string): Promise<{
  filePath: string;
  context: ScannedContext;
  hadSecrets: boolean;
}> {
  const scanner = new ProjectContextScanner(repoPath);
  const context = await scanner.scan();
  const rawMarkdown = formatContext(context);

  const { redacted, hadSecrets } = sanitizeContext(rawMarkdown);

  const devdiffDir = path.join(repoPath, ".devdiff");
  await fs.mkdir(devdiffDir, { recursive: true });

  const filePath = path.join(devdiffDir, "context.md");
  await fs.writeFile(filePath, redacted, "utf-8");

  return { filePath, context, hadSecrets };
}

/**
 * Reads and validates the context file for secrets.
 * Returns a report suitable for `devdiff context validate`.
 */
export async function validateContextFile(repoPath: string): Promise<{
  exists: boolean;
  filePath: string;
  secrets: { type: string; name: string; severity: string }[];
  charCount: number;
  overBudget: boolean;
}> {
  const filePath = path.join(repoPath, CONTEXT_FILE_NAME);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const scanner = new SecretScanner();
    const findings = scanner.scan(raw);

    return {
      exists: true,
      filePath,
      secrets: findings,
      charCount: raw.length,
      overBudget: raw.length > MAX_CONTEXT_CHARS,
    };
  } catch {
    return {
      exists: false,
      filePath,
      secrets: [],
      charCount: 0,
      overBudget: false,
    };
  }
}
