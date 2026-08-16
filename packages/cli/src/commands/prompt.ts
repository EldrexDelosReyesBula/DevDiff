import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import pc from "picocolors";
import { PromptGenerator } from "@eldrex/core";

export async function promptCommand(
  subcommand?: string,
  options: Record<string, any> = {},
): Promise<void> {
  const workspacePath = process.cwd();

  const generated = PromptGenerator.generate({
    workspacePath,
    persona: options.persona,
    format: options.format,
    since: options.since,
    includeContext: options["include-context"] !== false,
    includeSKILL: options["include-skill"] !== false,
    includeDiagrams: Boolean(options["include-diagrams"]),
    targetAI: options.target as any,
  });

  if (options.output) {
    const outputPath = path.resolve(workspacePath, options.output);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, generated.prompt, "utf-8");

    console.log(pc.green(`✅ Prompt saved to: ${outputPath}`));
    console.log(`   Target AI: ${pc.cyan(generated.targetAI.toUpperCase())}`);
    console.log(`   Estimated Tokens: ~${generated.estimatedTokens}`);
    return;
  }

  if (options.copy) {
    try {
      if (process.platform === "darwin") {
        execSync(`echo ${JSON.stringify(generated.prompt)} | pbcopy`);
      } else if (process.platform === "win32") {
        execSync(
          `powershell Set-Clipboard -Value ${JSON.stringify(generated.prompt)}`,
        );
      } else {
        execSync(
          `echo ${JSON.stringify(generated.prompt)} | xclip -selection clipboard`,
        );
      }
      console.log(pc.green("📋 Prompt copied to clipboard!"));
    } catch {
      console.log(pc.yellow("⚠️ Failed to copy automatically. Copying below:"));
      console.log(generated.copyReady);
      return;
    }

    console.log(`   Target AI: ${pc.cyan(generated.targetAI.toUpperCase())}`);
    console.log(`   Tokens: ~${generated.estimatedTokens}\n`);
    console.log(
      pc.gray(
        "Paste this into ChatGPT, Claude, Gemini, or any AI chat.\nWhen you receive the response, run:",
      ),
    );
    console.log(pc.bold(pc.cyan("   devdiff import changelog --paste\n")));
    return;
  }

  if (options.preview) {
    console.log(pc.cyan("🔍 Prompt Preview (First 500 chars)"));
    console.log(pc.gray("═══════════════════════════════════\n"));
    console.log(generated.preview);
    console.log(`\nTokens: ~${generated.estimatedTokens}`);
    return;
  }

  console.log(generated.copyReady);
}
