import * as fs from "fs/promises";
import * as path from "path";
import { generateChangelog } from "./generators/changelog";
import { ShellSandbox } from "./security/shell-sandbox";
import { loadConfig } from "./config/loader";
import { MVPDetector } from "./mvp/detector";
import { MVPStorage, MVPEntry } from "./mvp/storage";
import { IDEGuardian } from "./performance/ide-guardian";
import { diffParser } from "./diff/parser";
import { AIRouter } from "./ai/router";
import { PluginManager } from "./plugins/manager";
import { PersonaRegistry } from "@eldrex/personas";
import { AIDetector, AIDetectionResult } from "./onboarding/ai-detector";
import { ConversationalQA } from "./qa/conversational-qa";
import {
  ProgressiveExplainer,
  ExplanationLevel,
} from "./explain/progressive-explainer";
import { UniversalProjectDetector } from "./detection/universal-detector";

function getSeverityScore(sev: string): number {
  switch (sev.toLowerCase()) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    case "critical":
      return 4;
    default:
      return 2;
  }
}

export interface DevDiffEngineOptions {
  workspacePath?: string;
  silent?: boolean;
  useLocalAI?: boolean;
  localModel?: string;
  skillDocument?: any;
  projectContext?: any;
}

/**
 * DevDiffEngine — Main programmatic orchestrator for diff analysis,
 * changelog generation, security audits, and codebase intelligence.
 */
export class DevDiffEngine {
  private workspacePath: string;
  private silent: boolean;
  private useLocalAI?: boolean;
  private localModel?: string;
  private skillDocument?: any;
  private projectContext?: any;

  constructor(options?: DevDiffEngineOptions) {
    this.workspacePath = options?.workspacePath || process.cwd();
    this.silent = options?.silent || false;
    this.useLocalAI = options?.useLocalAI;
    this.localModel = options?.localModel;
    this.skillDocument = options?.skillDocument;
    this.projectContext = options?.projectContext;
  }

  /**
   * Initializes the engine and loads local workspace configuration.
   */
  async initialize(): Promise<void> {
    try {
      await loadConfig(this.workspacePath);
    } catch {}
  }

  /**
   * Retrieves staged git diff metadata for the current workspace.
   */
  async getStagedDiff(): Promise<{ files: Array<{ path: string }> }> {
    const files = await this.getStagedFiles();
    return { files };
  }

  /**
   * Proactively detects available local and cloud AI providers.
   */
  async detectAIProviders(): Promise<AIDetectionResult> {
    return AIDetector.detectAll();
  }

  /**
   * Ask natural-language codebase exploration questions.
   */
  async ask(options: { question: string }): Promise<string> {
    try {
      const qa = new ConversationalQA(this.workspacePath);
      const res = await qa.ask(options.question);
      return res.answer;
    } catch (err: any) {
      return `Q&A failed: ${err.message}`;
    }
  }

  /**
   * Explains code snippets using progressive depth levels (beginner, student, developer, senior, architect).
   */
  async explainCode(options: {
    code: string;
    filePath?: string;
    level?: string;
  }): Promise<string> {
    try {
      if (options.level && options.level !== "auto") {
        const validLevels: ExplanationLevel[] = [
          "beginner",
          "student",
          "developer",
          "senior",
          "architect",
        ];
        const targetLevel: ExplanationLevel = validLevels.includes(
          options.level as ExplanationLevel,
        )
          ? (options.level as ExplanationLevel)
          : "developer";
        const explanation = await ProgressiveExplainer.explain({
          code: options.code,
          filePath: options.filePath || "snippet",
          level: targetLevel,
          projectContext: {},
        });
        return (
          `# 🎓 ${explanation.level.toUpperCase()} Explanation: ${path.basename(options.filePath || "Code Snippet")}\n\n${explanation.summary}\n\n` +
          explanation.sections
            .map((s) => `### ${s.title}\n${s.content}`)
            .join("\n\n") +
          (explanation.keyTakeaways.length > 0
            ? `\n\n### 💡 Key Takeaways\n${explanation.keyTakeaways.map((k) => `• ${k}`).join("\n")}`
            : "")
        );
      }
      const config = await loadConfig(this.workspacePath);
      const router = new AIRouter(config);
      const prompt = `Please explain the following code snippet concisely and clearly:\n\nFile: ${options.filePath || "snippet"}\n\`\`\`\n${options.code}\n\`\`\``;
      const res = await router.getExplanation(prompt, { depth: "standard" });
      return res.summary;
    } catch (err: any) {
      return `Failed to explain code: ${err.message}`;
    }
  }

  /**
   * Generates a structural onboarding overview and newcomer tour of the repository.
   */
  async generateOnboarding(): Promise<string> {
    try {
      const detection = UniversalProjectDetector.detect(this.workspacePath);
      const entryPoints =
        detection.entryPoints.length > 0
          ? detection.entryPoints.join(", ")
          : "Main directory";
      return (
        `# 🚀 Codebase Onboarding Tour: ${path.basename(this.workspacePath)}\n\n` +
        `• **Project Type:** ${detection.type.toUpperCase()}\n` +
        `• **Primary Language:** ${detection.primaryLanguage}\n` +
        `• **Total Files Scanned:** ${detection.totalFiles}\n` +
        `• **Suggested Entry Points:** ${entryPoints}\n\n` +
        `## 🎯 Next Steps\n` +
        `1. Make a change in any file\n` +
        `2. Stage changes with \`git add\`\n` +
        `3. Press **Ctrl+Shift+G** to generate an automated changelog!\n`
      );
    } catch (err: any) {
      return `Failed to generate onboarding tour: ${err.message}`;
    }
  }

  private async execGit(args: string[]): Promise<string> {
    try {
      return await ShellSandbox.exec("git", args, { cwd: this.workspacePath });
    } catch (err: any) {
      if (
        err.message &&
        (err.message.includes("Not a git repository") ||
          err.message.includes("not a git repository"))
      ) {
        return "";
      }
      throw err;
    }
  }

  async getStagedFiles(): Promise<Array<{ path: string }>> {
    try {
      const stdout = await this.execGit(["diff", "--cached", "--name-only"]);
      return stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((filePath) => ({ path: filePath }));
    } catch {
      return [];
    }
  }

  private async getDiffForSince(since: string): Promise<string> {
    if (!since || since === "staged") {
      const staged = await this.execGit(["diff", "--cached"]);
      if (staged.trim()) return staged;
      return await this.execGit(["diff"]);
    }

    if (since.includes("..") || since.includes("~")) {
      return await this.execGit(["diff", since]);
    }

    // Check if it's a natural time range, e.g. "24h" or "7d"
    const match = since.match(/^(\d+)([hdw])$/);
    if (match) {
      const num = match[1];
      const unit =
        match[2] === "h" ? "hours" : match[2] === "d" ? "days" : "weeks";
      try {
        const timeDiff = await this.execGit([
          "diff",
          `HEAD@{${num} ${unit} ago}`,
        ]);
        if (timeDiff.trim()) return timeDiff;
      } catch {}
      try {
        return await this.execGit(["diff", "HEAD~1"]);
      } catch {
        return await this.execGit(["diff"]);
      }
    }

    // Default fallback
    return await this.execGit(["diff", since]);
  }

  private parseGitRange(since: string): string {
    if (!since) return "HEAD";
    if (since.includes("..") || since.includes("~")) return since;
    const match = since.match(/^(\d+)([hdw])$/);
    if (match) {
      const num = match[1];
      const unit =
        match[2] === "h" ? "hours" : match[2] === "d" ? "days" : "weeks";
      return `HEAD@{${num} ${unit} ago}..HEAD`;
    }
    return "HEAD";
  }

  async analyze(options: {
    staged?: boolean;
    since?: string;
    persona?: string;
    format?: string;
    includeDiagrams?: boolean;
  }): Promise<{ summary: string }> {
    try {
      let diffText = "";
      if (options.since) {
        diffText = await this.getDiffForSince(options.since);
      } else {
        const diffArg = options.staged ? ["--cached"] : [];
        diffText = await this.execGit(["diff", ...diffArg]);
      }

      // Check format override for diagrams
      if (options.format === "mermaid" || options.includeDiagrams) {
        const diagram = await this.generateDiagram({
          type: "architecture",
          since: options.since || "24h",
        });
        return { summary: diagram };
      }

      const config = await loadConfig(this.workspacePath);
      if (MVPDetector.shouldUseMVP(diffText, config)) {
        const parsedDiff = diffParser.parse(diffText);
        const template = MVPDetector.buildTemplateSummary(parsedDiff);
        const id = await MVPStorage.generateId(this.workspacePath);
        const entry: MVPEntry = {
          id,
          timestamp: new Date().toISOString(),
          status: "queued",
          change_range: {
            from: "HEAD",
            to: "staged",
            commits: 1,
            files: parsedDiff.files.length,
            additions: template.additions,
            deletions: template.deletions,
          },
          template_summary: `MVP Mode triggered: ${template.filesCount} files changed (${template.additions} additions, ${template.deletions} deletions).`,
          diff_snapshot: Buffer.from(diffText).toString("base64"),
          retry_count: 0,
          max_retries: 3,
        };
        await MVPStorage.saveMVP(this.workspacePath, entry);

        return {
          summary:
            `[MVP Mode Triggered - Saved as ${id}]\n` +
            `• Files changed: ${template.filesCount}\n` +
            `• Additions: ${template.additions} | Deletions: ${template.deletions}\n` +
            `• Directories affected: ${template.directoriesCount}\n` +
            `• Largest change: ${template.largestChangeFile}\n` +
            `• Status: Queued for AI (Run 'devdiff mvp process' to process)`,
        };
      }

      const result = await IDEGuardian.processSafely(async () => {
        return generateChangelog({
          diffText,
          repoPath: this.workspacePath,
          format:
            options.format === "json" || options.format === "html"
              ? options.format
              : "markdown",
          persona: options.persona,
        });
      });

      return {
        summary: result.formattedOutput,
      };
    } catch (error: any) {
      return {
        summary: `Analysis failed: ${error.message}`,
      };
    }
  }

  async generateChangelog(options?: {
    since?: string;
    persona?: string;
    format?: "markdown" | "json" | "html";
  }): Promise<string> {
    try {
      let diffText = "";
      if (options?.since) {
        diffText = await this.getDiffForSince(options.since);
      } else {
        diffText = await this.execGit(["diff", "--cached"]);
        if (!diffText.trim()) {
          diffText = await this.execGit(["diff"]);
        }
      }

      const config = await loadConfig(this.workspacePath);
      if (MVPDetector.shouldUseMVP(diffText, config)) {
        const parsedDiff = diffParser.parse(diffText);
        const template = MVPDetector.buildTemplateSummary(parsedDiff);
        const id = await MVPStorage.generateId(this.workspacePath);
        const entry: MVPEntry = {
          id,
          timestamp: new Date().toISOString(),
          status: "queued",
          change_range: {
            from: "HEAD",
            to: "staged",
            commits: 1,
            files: parsedDiff.files.length,
            additions: template.additions,
            deletions: template.deletions,
          },
          template_summary: `MVP Mode triggered: ${template.filesCount} files changed (${template.additions} additions, ${template.deletions} deletions).`,
          diff_snapshot: Buffer.from(diffText).toString("base64"),
          retry_count: 0,
          max_retries: 3,
        };
        await MVPStorage.saveMVP(this.workspacePath, entry);

        return (
          `[MVP Mode Triggered - Saved as ${id}]\n` +
          `• Files changed: ${template.filesCount}\n` +
          `• Additions: ${template.additions} | Deletions: ${template.deletions}\n` +
          `• Directories affected: ${template.directoriesCount}\n` +
          `• Largest change: ${template.largestChangeFile}\n` +
          `• Status: Queued for AI (Run 'devdiff mvp process' to process)`
        );
      }

      const result = await IDEGuardian.processSafely(async () => {
        return generateChangelog({
          diffText,
          repoPath: this.workspacePath,
          format: options?.format || "markdown",
          persona: options?.persona,
        });
      });

      return result.formattedOutput;
    } catch (error: any) {
      return `Failed to generate changelog: ${error.message}`;
    }
  }

  async securityScan(options?: {
    since?: string;
    threshold?: string;
  }): Promise<any> {
    try {
      const diffText = await this.getDiffForSince(options?.since || "staged");
      if (!diffText.trim()) {
        return { vulnerabilities: [] };
      }

      const config = await loadConfig(this.workspacePath);
      const router = new AIRouter(config);

      const securityPrompt = `You are a senior security engineer. Analyze the following git diff for security vulnerabilities, memory safety issues, secrets leaks, dependency vulnerabilities, and privilege escalations.
You must respond with a JSON object matching this schema:
{
  "summary": "Overall security assessment summary.",
  "impact": "none",
  "breaking": false,
  "files": [
    {
      "path": "path/to/file.ts",
      "explanation": "[SEVERITY] Title: Description. Remediation: Remediation steps."
    }
  ],
  "relatedIssues": []
}

Severity must be one of: low, medium, high, critical.
Only report findings that are actually present in the diff.`;

      const explanation = await router.getExplanation(
        diffText.substring(0, 12000),
        {
          depth: "deep",
          projectContext: securityPrompt,
        },
      );

      const vulnerabilities: any[] = [];
      const thresholdScore = getSeverityScore(options?.threshold || "0.8");

      for (const f of explanation.files || []) {
        const regex =
          /^\[(low|medium|high|critical)\]\s*([^:]+):\s*([^.]+)\.\s*Remediation:\s*(.+)$/i;
        const match = f.explanation.match(regex);
        if (match) {
          const severity = match[1].toLowerCase();
          const title = match[2].trim();
          const description = match[3].trim();
          const remediation = match[4].trim();

          if (getSeverityScore(severity) >= thresholdScore) {
            vulnerabilities.push({
              severity,
              file: f.path,
              title,
              description,
              remediation,
            });
          }
        } else {
          const lowerExp = f.explanation.toLowerCase();
          let severity = "medium";
          if (lowerExp.includes("critical")) severity = "critical";
          else if (lowerExp.includes("high")) severity = "high";
          else if (lowerExp.includes("low")) severity = "low";

          if (getSeverityScore(severity) >= thresholdScore) {
            vulnerabilities.push({
              severity,
              file: f.path,
              title: "Security Warning",
              description: f.explanation,
              remediation:
                "Review the code change for potential security concerns.",
            });
          }
        }
      }

      return { vulnerabilities };
    } catch (err: any) {
      return {
        vulnerabilities: [
          {
            severity: "high",
            file: "git-diff",
            title: "Scan Failed",
            description: err.message,
            remediation: "Check AI provider config.",
          },
        ],
      };
    }
  }

  async explainFile(options: {
    filePath: string;
    level?: string;
    commitSha?: string;
  }): Promise<string> {
    try {
      let diffText = "";
      if (options.commitSha) {
        diffText = await this.execGit([
          "diff",
          `${options.commitSha}~1..${options.commitSha}`,
          "--",
          options.filePath,
        ]);
      } else {
        diffText = await this.execGit(["diff", "HEAD", "--", options.filePath]);
        if (!diffText.trim()) {
          diffText = await this.execGit(["diff", "--", options.filePath]);
        }
      }

      if (!diffText.trim()) {
        const fullPath = path.resolve(this.workspacePath, options.filePath);
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const config = await loadConfig(this.workspacePath);
          const router = new AIRouter(config);
          const explanation = await router.getExplanation(
            `Please explain what this file does:\n\nFile Path: ${options.filePath}\n\nContent:\n${content.substring(0, 8000)}`,
            { depth: "standard" },
          );
          return explanation.summary;
        } catch {
          return `No recent changes found for file ${options.filePath}, and could not read file content from disk.`;
        }
      }

      const config = await loadConfig(this.workspacePath);
      const router = new AIRouter(config);
      const explanation = await router.getExplanation(diffText, {
        depth: "standard",
      });
      return explanation.summary;
    } catch (err: any) {
      return `Failed to explain file: ${err.message}`;
    }
  }

  async complianceCheck(options: {
    framework: string;
    since: string;
  }): Promise<any> {
    try {
      const diffText = await this.getDiffForSince(options.since);
      if (!diffText.trim()) {
        return { framework: options.framework, compliant: true, findings: [] };
      }

      const config = await loadConfig(this.workspacePath);
      const router = new AIRouter(config);

      const compliancePrompt = `You are a compliance auditor. Focus on regulatory and compliance implications for "${options.framework}" framework.
Review the following git diff for violations or risks.
You must respond with a JSON object matching this schema:
{
  "summary": "Compliance summary.",
  "impact": "none",
  "breaking": false,
  "files": [
    {
      "path": "Rule name or file",
      "explanation": "[STATUS] Rule: Description."
    }
  ],
  "relatedIssues": []
}

STATUS must be one of: passed, failed, warning.
Only report findings that are actually present in the diff.`;

      const explanation = await router.getExplanation(
        diffText.substring(0, 12000),
        {
          depth: "deep",
          projectContext: compliancePrompt,
        },
      );

      const findings: any[] = [];
      let compliant = true;

      for (const f of explanation.files || []) {
        const regex = /^\[(passed|failed|warning)\]\s*([^:]+):\s*(.+)$/i;
        const match = f.explanation.match(regex);
        if (match) {
          const status = match[1].toLowerCase();
          const rule = match[2].trim();
          const description = match[3].trim();

          if (status === "failed") {
            compliant = false;
          }

          findings.push({
            rule,
            status,
            description,
          });
        } else {
          findings.push({
            rule: f.path,
            status: "warning",
            description: f.explanation,
          });
        }
      }

      return {
        framework: options.framework,
        compliant,
        findings,
      };
    } catch (err: any) {
      return {
        framework: options.framework,
        compliant: false,
        findings: [
          { rule: "Audit", status: "failed", description: err.message },
        ],
      };
    }
  }

  async generateDiagram(options?: {
    type?: string;
    since?: string;
  }): Promise<string> {
    try {
      const diffText = await this.getDiffForSince(options?.since || "staged");
      if (!diffText.trim()) {
        return "No changes detected to visualize.";
      }

      const config = await loadConfig(this.workspacePath);
      const router = new AIRouter(config);

      const diagramType = options?.type || "architecture";
      const systemPrompt = `You are an AI that generates Mermaid.js diagrams from git diffs.
Generate a diagram of type "${diagramType}" representing the changes, files, or flow.
Do not include any commentary. Return ONLY the raw Mermaid.js code enclosed in \`\`\`mermaid ... \`\`\` code block.`;

      const explanation = await router.getExplanation(
        `Generate a ${diagramType} Mermaid.js diagram for this diff:\n${diffText.substring(0, 12000)}`,
        { depth: "standard", projectContext: systemPrompt },
      );

      const match = explanation.summary.match(/```mermaid([\s\S]*?)```/);
      if (match) {
        return match[1].trim();
      }
      return explanation.summary.trim();
    } catch (err: any) {
      return `Failed to generate diagram: ${err.message}`;
    }
  }

  async getProjectContext(): Promise<string> {
    try {
      const { loadContext } = await import("./context/compiler");
      const loaded = await loadContext(this.workspacePath);
      return loaded ? loaded.raw : "No project context available.";
    } catch {
      return "No project context available.";
    }
  }

  async findRelatedChanges(options: {
    identifier: string;
    since: string;
  }): Promise<any[]> {
    try {
      const range = this.parseGitRange(options.since);
      const stdout = await this.execGit([
        "log",
        range,
        `-S${options.identifier}`,
        `--pretty=format:%h|%an|%ar|%s`,
      ]);

      return stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split("|");
          return {
            sha: parts[0] || "unknown",
            author: parts[1] || "unknown",
            date: parts[2] || "unknown",
            message: parts.slice(3).join("|") || "unknown",
          };
        });
    } catch {
      return [];
    }
  }

  async explainChange(options: {
    file: string;
    context?: string;
  }): Promise<string> {
    return this.explainFile({ filePath: options.file });
  }

  async chat(options: { prompt: string; context: string }): Promise<string> {
    try {
      const config = await loadConfig(this.workspacePath);
      const router = new AIRouter(config);
      const explanation = await router.getExplanation(options.prompt, {
        depth: "standard",
        projectContext: options.context,
      });
      return explanation.summary;
    } catch (err: any) {
      return `Chat failed: ${err.message}`;
    }
  }

  async getStatus(): Promise<any> {
    let sessionActive = false;
    try {
      await fs.access(
        path.resolve(this.workspacePath, ".devdiff/vibe-session.json"),
      );
      sessionActive = true;
    } catch {}

    let providerInfo = "Unknown";
    try {
      const config = await loadConfig(this.workspacePath);
      const router = new AIRouter(config);
      const provider = await router.getBestProvider();
      providerInfo = provider.name;
    } catch (e: any) {
      providerInfo = `Unavailable: ${e.message}`;
    }

    let stagedCount = 0;
    let unstagedCount = 0;
    try {
      const staged = await this.getStagedFiles();
      stagedCount = staged.length;

      const unstaged = await this.execGit(["diff", "--name-only"]);
      unstagedCount = unstaged.split("\n").filter(Boolean).length;
    } catch {}

    return {
      sessionActive,
      providerInfo,
      stagedCount,
      unstagedCount,
      workspacePath: this.workspacePath,
    };
  }
}
