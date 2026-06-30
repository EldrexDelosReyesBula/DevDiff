#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";
import { TEMPLATES } from "./templates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHelp() {
  console.log();
  console.log(
    `  ${pc.cyan("create-devdiff-app")} ${pc.white("<project-name>")} ${pc.gray("[options]")}`,
  );
  console.log();
  console.log(`  ${pc.gray("Options:")}`);
  console.log(
    `    ${pc.white("--template <name>")}   Template to use (default: minimal)`,
  );
  console.log(
    `    ${pc.white("--list")}              List all available templates`,
  );
  console.log(`    ${pc.white("--help")}              Show this help message`);
  console.log();
  console.log(`  ${pc.gray("Available templates:")}`);
  for (const tpl of Object.values(TEMPLATES)) {
    console.log(
      `    ${pc.white(tpl.id.padEnd(26))} ${pc.gray(tpl.description)}`,
    );
  }
  console.log();
}

function printTemplateList() {
  console.log();
  console.log(pc.cyan("  Available DevDiff Templates\n"));
  for (const tpl of Object.values(TEMPLATES)) {
    console.log(`  ${pc.white("●")} ${pc.white(tpl.name)}`);
    console.log(`    ${pc.gray("ID:")} ${pc.cyan(tpl.id)}`);
    console.log(`    ${pc.gray(tpl.description)}`);
    console.log(
      `    ${pc.gray("Includes:")} ${tpl.includes.slice(0, 3).join(", ")}${tpl.includes.length > 3 ? " …" : ""}`,
    );
    console.log();
  }
}

function writeFiles(
  targetDir: string,
  files: Record<string, string>,
  projectName: string,
) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(targetDir, relativePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    const rendered = content.replaceAll("{{PROJECT_NAME}}", projectName);
    fs.writeFileSync(fullPath, rendered, "utf-8");
    console.log(`  ${pc.green("+")} ${relativePath}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("--list")) {
    printTemplateList();
    process.exit(0);
  }

  // Parse project name and template
  const projectName = args.find((a) => !a.startsWith("--")) || "";
  const templateFlagIdx = args.findIndex((a) => a === "--template");
  const templateId =
    templateFlagIdx !== -1 ? args[templateFlagIdx + 1] : "minimal";

  if (!projectName) {
    console.error(pc.red("\n  ❌ Missing project name.\n"));
    console.error(
      `  Usage: ${pc.white("create-devdiff-app")} ${pc.cyan("<project-name>")}\n`,
    );
    process.exit(1);
  }

  const template = TEMPLATES[templateId];
  if (!template) {
    console.error(pc.red(`\n  ❌ Unknown template: "${templateId}"\n`));
    console.error(`  Available: ${Object.keys(TEMPLATES).join(", ")}\n`);
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(pc.red(`\n  ❌ Directory already exists: ${targetDir}\n`));
    process.exit(1);
  }

  // ── Banner ────────────────────────────────────────────────────────────────
  console.log();
  console.log(
    `  ${pc.bold(pc.cyan("⚡ DevDiff App Bootstrapper"))} ${pc.gray("v1.0.3")}`,
  );
  console.log(`  ${pc.gray("═".repeat(50))}`);
  console.log(`  Project:  ${pc.white(projectName)}`);
  console.log(
    `  Template: ${pc.green(template.name)} (${pc.cyan(template.id)})`,
  );
  console.log();
  console.log(`  ${pc.gray("Includes:")}`);
  for (const item of template.includes) {
    console.log(`    ${pc.green("✔")} ${pc.white(item)}`);
  }
  console.log(`  ${pc.gray("═".repeat(50))}`);
  console.log();

  // ── Write files ───────────────────────────────────────────────────────────
  console.log(`  ${pc.bold(pc.cyan("Writing template files:"))}`);
  fs.mkdirSync(targetDir, { recursive: true });
  writeFiles(targetDir, template.files, projectName);

  // ── Next steps ────────────────────────────────────────────────────────────
  console.log();
  console.log(
    `  ${pc.bold(pc.green("🎉 Project bootstrapped successfully!"))}`,
  );
  console.log();
  console.log(`  ${pc.white("Next steps:")}`);
  console.log(`    ${pc.cyan(`cd ${projectName}`)}`);
  console.log(`    ${pc.cyan("npm install")}`);
  console.log(`    ${pc.cyan("npm run dev")}`);
  console.log();

  if (templateId === "ci-integration") {
    console.log(`  ${pc.bold(pc.yellow("⚡ CI/CD configuration tip:"))}`);
    console.log(
      pc.gray("    1. Add OPENAI_API_KEY to your GitHub/GitLab secrets"),
    );
    console.log(
      pc.gray(
        "    2. Or update .devdiff.config.js to use local Ollama offline.\n",
      ),
    );
  }

  console.log(
    `  ${pc.gray("Documentation: https://github.com/EldrexDelosReyesBula/devdiff")}`,
  );
  console.log();
}

main().catch((err) => {
  console.error(pc.red(`\n  Error: ${err.message}\n`));
  process.exit(1);
});
