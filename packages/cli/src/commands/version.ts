import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import pc from "picocolors";
import { SemverDetector, ChangelogGenerator, ParsedDiff, FileChangeInfo } from "@eldrex/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, "../../package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      return pkg.version || "1.5.0";
    }
  } catch {
    return "1.5.0";
  }
  return "1.5.0";
}

export async function versionBumpCommand(options: {
  type?: "major" | "minor" | "patch" | "auto";
  dryRun?: boolean;
  changelog?: boolean;
  tag?: boolean;
  push?: boolean;
  monorepo?: boolean;
  package?: string;
} = {}) {
  const currentVersion = getVersion();
  console.log(`${pc.cyan("[lucide:box]")} Current version: ${pc.bold("v" + currentVersion)}`);

  const diff = getStagedDiff();
  const detection = SemverDetector.detect(diff, currentVersion);
  const bumpType = options.type === "auto" || !options.type ? detection.type : options.type;

  if (bumpType === "none") {
    console.log(`${pc.gray("[lucide:info]")} No changes detected. Version unchanged.`);
    return;
  }

  const newVersion = SemverDetector.bumpVersion(currentVersion, bumpType);

  console.log(`\n${pc.cyan("[lucide:clipboard-list]")} ${pc.bold("DevDiff Version Bump Plan:")}`);
  console.log(pc.gray("──────────────────────────────────────────────"));
  console.log(`   Type: ${pc.white(bumpType.toUpperCase())}`);
  console.log(`   From: ${pc.gray("v" + currentVersion)}`);
  console.log(`   To:   ${pc.green("v" + newVersion)}\n`);

  if (detection.reasons.length > 0) {
    console.log(`${pc.bold("Reasons:")}`);
    detection.reasons.forEach((r) => {
      console.log(`   • ${pc.white(r.description)}`);
    });
    console.log("");
  }

  if (options.dryRun) {
    console.log(`${pc.yellow("[lucide:search]")} Dry run — no changes made.`);
    return;
  }

  console.log(`${pc.green("[lucide:arrow-up-circle]")} Bumping version to v${newVersion}...`);

  bumpRootPackage(newVersion);
  console.log(`   ${pc.green("[lucide:check]")} package.json updated`);

  if (options.changelog !== false) {
    console.log(`${pc.cyan("[lucide:file-text]")} Generating CHANGELOG.md...`);
    const entry = await ChangelogGenerator.generate(diff, {
      version: newVersion,
      previousVersion: currentVersion,
      outputPath: "CHANGELOG.md",
      prepend: true,
      dryRun: false,
    });
    console.log(`   ${pc.green("[lucide:check]")} CHANGELOG.md updated`);
  }

  if (options.tag !== false) {
    try {
      execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: "ignore" });
      console.log(`   ${pc.green("[lucide:check]")} Tag v${newVersion} created`);
    } catch (e) {
      console.log(`   ${pc.yellow("[lucide:alert-triangle]")} Git tag skipped or already exists`);
    }
  }

  if (options.push) {
    try {
      execSync("git push && git push --tags", { stdio: "ignore" });
      console.log(`   ${pc.green("[lucide:check]")} Pushed to remote repository`);
    } catch (e) {
      console.log(`   ${pc.yellow("[lucide:alert-triangle]")} Remote push failed`);
    }
  }

  console.log(`\n${pc.green("[lucide:check-circle]")} ${pc.bold("Release complete! v" + newVersion + " ready.")}\n`);
}

export async function releaseCommand(options: any = {}) {
  return versionBumpCommand({
    type: options.type || "auto",
    dryRun: options.dryRun,
    changelog: true,
    tag: true,
    push: options.push !== false,
  });
}

function getStagedDiff(): ParsedDiff {
  try {
    const output = execSync("git diff --cached --name-only", { encoding: "utf-8" }).trim();
    const files: FileChangeInfo[] = output
      .split("\n")
      .filter(Boolean)
      .map((filePath) => ({
        path: filePath,
        status: "modified",
      }));
    return { files };
  } catch (e) {
    return { files: [] };
  }
}

function bumpRootPackage(newVersion: string): void {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  }
}

export async function versionCommand(subcommand: string = "status", options: any = {}) {
  if (subcommand === "bump") {
    return versionBumpCommand(options);
  }
  const current = getVersion();
  console.log(`${pc.cyan("[lucide:tag]")} ${pc.bold("DevDiff CLI Version:")} v${current}`);
}
