import * as fs from "fs";
import * as path from "path";
import { SkillLoader } from "@eldrex/core";

export async function skillGenerateCommand(options: {
  update?: boolean;
  path?: string;
}): Promise<void> {
  const targetDir = options.path
    ? path.resolve(process.cwd(), options.path)
    : process.cwd();
  const filePath = path.join(targetDir, "SKILL.md");

  console.log("🔍 Analyzing codebase for SKILL.md generation...");

  if (fs.existsSync(filePath) && !options.update) {
    console.log("⚠️  SKILL.md already exists in project root.");
    console.log("   Use --update to overwrite or update existing SKILL.md.");
    return;
  }

  const generated = SkillLoader.generate(targetDir);
  fs.writeFileSync(filePath, generated, "utf-8");

  console.log(
    "✅ Generated SKILL.md with project capabilities and AI instructions.",
  );
  console.log(`📄 Saved to: ${filePath}`);
}

export async function skillValidateCommand(options: {
  path?: string;
}): Promise<void> {
  const targetDir = options.path
    ? path.resolve(process.cwd(), options.path)
    : process.cwd();
  const skill = SkillLoader.load(targetDir);

  if (!skill) {
    console.log("❌ No SKILL.md found in project root or .devdiff/ directory.");
    console.log("   Run: devdiff skill generate");
    process.exit(1);
  }

  const result = SkillLoader.validate(skill.raw);

  if (result.valid) {
    console.log("✅ SKILL.md is valid and ready for AI agents.");
  } else {
    console.log("❌ SKILL.md validation failed:");
    for (const error of result.errors) {
      console.log(`   • ${error}`);
    }
    process.exit(1);
  }
}

export async function skillPreviewCommand(options: {
  agent?: string;
  path?: string;
}): Promise<void> {
  const targetDir = options.path
    ? path.resolve(process.cwd(), options.path)
    : process.cwd();
  const skill = SkillLoader.load(targetDir);

  if (!skill) {
    console.log("❌ No SKILL.md found in project root or .devdiff/ directory.");
    return;
  }

  console.log(`🤖 Agent Preview [${options.agent || "all"}]:\n`);
  console.log(skill.raw);
}

export async function skillCommand(
  subcommand?: string,
  options: Record<string, any> = {},
): Promise<void> {
  switch (subcommand) {
    case "generate":
      return skillGenerateCommand(options);
    case "preview":
      return skillPreviewCommand(options);
    case "validate":
    default:
      return skillValidateCommand(options);
  }
}
