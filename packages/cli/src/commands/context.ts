import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import {
  generateContextFile,
  loadContext,
  validateContextFile,
} from "@eldrex/core";

export type ContextAction = "generate" | "show" | "validate" | "edit";

export async function contextCommand(action: ContextAction): Promise<void> {
  const repoPath = process.cwd();

  switch (action) {
    case "generate":
      await handleGenerate(repoPath);
      break;
    case "show":
      await handleShow(repoPath);
      break;
    case "validate":
      await handleValidate(repoPath);
      break;
    case "edit":
      await handleEdit(repoPath);
      break;
    default:
      console.log(pc.red(`❌ Unknown context action: "${action}"`));
      console.log("");
      console.log("Available actions:");
      console.log(
        "  devdiff context generate  — auto-generate .devdiff/context.md",
      );
      console.log(
        "  devdiff context show      — print the current project context",
      );
      console.log(
        "  devdiff context validate  — check context file for secrets",
      );
      console.log("  devdiff context edit      — open context file in $EDITOR");
  }
}

async function handleGenerate(repoPath: string): Promise<void> {
  console.log(pc.blue("🔍 Scanning project..."));
  console.log("");

  try {
    const { filePath, context, hadSecrets } =
      await generateContextFile(repoPath);

    console.log(pc.green("✅ Project context generated!"));
    console.log("");
    console.log(`   File: ${pc.cyan(filePath)}`);
    console.log("");

    // Print a summary
    if (context.projectName) {
      console.log(`   ${pc.bold("Project:")} ${context.projectName}`);
    }
    if (context.purpose) {
      const excerpt =
        context.purpose.length > 80
          ? context.purpose.substring(0, 80) + "..."
          : context.purpose;
      console.log(`   ${pc.bold("Purpose:")} ${excerpt}`);
    }
    if (context.techStack.length > 0) {
      console.log(
        `   ${pc.bold("Tech stack:")} ${context.techStack.slice(0, 4).join(", ")}`,
      );
    }
    if (context.architecture.length > 0) {
      console.log(
        `   ${pc.bold("Directories:")} ${context.architecture.length} mapped`,
      );
    }

    if (hadSecrets) {
      console.log("");
      console.log(
        pc.yellow("⚠️  Secrets were detected and redacted from the context."),
      );
      console.log(pc.yellow("   Review .devdiff/context.md before sharing."));
    }

    console.log("");
    console.log(
      pc.dim("   💡 Edit .devdiff/context.md to add domain knowledge,"),
    );
    console.log(pc.dim("      naming conventions, or architecture notes."));
    console.log(pc.dim("      Run: devdiff context edit"));
    console.log("");
    console.log(
      pc.dim(
        "   Context is now injected automatically into every devdiff generate.",
      ),
    );
  } catch (error: any) {
    console.error(pc.red(`❌ Failed to generate context: ${error.message}`));
    process.exit(1);
  }
}

async function handleShow(repoPath: string): Promise<void> {
  try {
    const loaded = await loadContext(repoPath);

    if (!loaded) {
      console.log(pc.yellow("ℹ️  No project context found."));
      console.log("");
      console.log("   Run: devdiff context generate");
      console.log(
        "   This will auto-scan your project and create .devdiff/context.md",
      );
      return;
    }

    const sourceLabel =
      loaded.source === "file"
        ? pc.green("📄 .devdiff/context.md")
        : pc.blue("🔍 Auto-scanned (no context.md found)");

    console.log(pc.bold(`Source: ${sourceLabel}`));
    if (loaded.hadSecrets) {
      console.log(pc.yellow("⚠️  Secrets were redacted from this context."));
    }
    console.log("");
    console.log(pc.cyan("--- Project Context ---"));
    console.log(loaded.raw);
    console.log(pc.cyan("-----------------------"));
    console.log("");
    console.log(
      pc.dim(
        `Character count: ${loaded.raw.length} (~${Math.ceil(loaded.raw.length / 4)} tokens)`,
      ),
    );
  } catch (error: any) {
    console.error(pc.red(`❌ Failed to load context: ${error.message}`));
    process.exit(1);
  }
}

async function handleValidate(repoPath: string): Promise<void> {
  const report = await validateContextFile(repoPath);

  if (!report.exists) {
    console.log(pc.yellow("ℹ️  No .devdiff/context.md found."));
    console.log("");
    console.log("   Run: devdiff context generate");
    return;
  }

  console.log(pc.bold("Validating .devdiff/context.md..."));
  console.log("");
  console.log(`   File: ${pc.cyan(report.filePath)}`);
  console.log(
    `   Size: ${report.charCount} characters (~${Math.ceil(report.charCount / 4)} tokens)`,
  );

  if (report.overBudget) {
    console.log(
      pc.yellow(
        `   ⚠️  Over token budget (${report.charCount} chars > 2000 limit — will be trimmed automatically)`,
      ),
    );
  } else {
    console.log(pc.green(`   ✅ Within token budget`));
  }

  console.log("");

  if (report.secrets.length === 0) {
    console.log(pc.green("✅ No secrets detected."));
    console.log("");
    console.log("   Context is safe to use with cloud AI providers.");
  } else {
    console.log(pc.red(`❌ ${report.secrets.length} secret(s) detected:`));
    console.log("");
    for (const secret of report.secrets) {
      const icon =
        secret.severity === "critical"
          ? "🔴"
          : secret.severity === "high"
            ? "🟠"
            : "🟡";
      console.log(
        `   ${icon} [${secret.severity.toUpperCase()}] ${secret.name}`,
      );
    }
    console.log("");
    console.log(
      pc.yellow(
        "   DevDiff will automatically redact these before sending to AI.",
      ),
    );
    console.log(
      pc.yellow(
        "   But you should remove them from your context file manually.",
      ),
    );
    console.log("");
    console.log("   Edit: devdiff context edit");
  }
}

async function handleEdit(repoPath: string): Promise<void> {
  const contextFilePath = path.join(repoPath, ".devdiff", "context.md");

  // Check if file exists, offer to generate if not
  try {
    await fs.access(contextFilePath);
  } catch {
    console.log(pc.yellow("ℹ️  .devdiff/context.md doesn't exist yet."));
    console.log("");
    console.log("   Generating it first...");
    await handleGenerate(repoPath);
  }

  const editor = process.env.EDITOR || process.env.VISUAL || null;

  if (editor) {
    console.log(pc.blue(`   Opening in $EDITOR (${editor})...`));
    const { execSync } = await import("child_process");
    try {
      execSync(`${editor} "${contextFilePath}"`, { stdio: "inherit" });
    } catch {
      // Editor may have exited normally (vim returns 0, others may vary)
    }
  } else {
    console.log(pc.yellow("ℹ️  No $EDITOR environment variable set."));
    console.log("");
    console.log("   Open this file manually:");
    console.log(`   ${pc.cyan(contextFilePath)}`);
    console.log("");
    console.log("   Or set $EDITOR in your shell profile:");
    console.log('   export EDITOR="code"      # VS Code');
    console.log('   export EDITOR="nano"      # Nano');
    console.log('   export EDITOR="vim"       # Vim');
  }
}
