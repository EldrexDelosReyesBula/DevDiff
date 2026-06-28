import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { execSync } from "child_process";

const DEFAULT_CONFIG_CONTENT = `// DevDiff Configuration
// Documentation: https://github.com/EldrexDelosReyesBula/devdiff

export default {
  ai: {
    providers: [
      {
        name: 'local-ollama',
        url: 'ollama://llama3.2:3b',
        priority: 1,
      },
      {
        name: 'cloud-gemini',
        url: 'gemini://gemini-1.5-flash',
        apiKey: process.env.GEMINI_API_KEY,
        priority: 2,
      }
    ],
    routing: {
      strategy: 'priority',
      localOnly: true,
    },
  },
  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'out/**',
    'pnpm-lock.yaml',
    'package-lock.json',
  ],
  cache: {
    enabled: true,
    path: '.devdiff/cache.json',
  },
  format: 'markdown',
}
`;

const PREPARE_COMMIT_MSG_HOOK = `#!/bin/sh
# DevDiff Git Hook
# Automatically append AI explanations to staged changes commit message
npx devdiff generate --commit-msg-file "$1"
`;

export async function initCommand(options: { force?: boolean }) {
  console.log(pc.blue("⚡ Initializing DevDiff..."));

  // 1. Check if git repo exists
  let gitDir = "";
  try {
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    gitDir = path.resolve(gitRoot, ".git");
  } catch {
    console.error(
      pc.red(
        "Error: Not a Git repository. Please initialize git first (git init).",
      ),
    );
    process.exit(1);
  }

  // 2. Create config file
  const configPath = path.resolve(process.cwd(), ".devdiff.config.js");
  let configExists = false;
  try {
    await fs.access(configPath);
    configExists = true;
  } catch {}

  if (configExists && !options.force) {
    console.log(
      pc.yellow(
        `ℹ️ Configuration file already exists at ${configPath}. Use --force to overwrite.`,
      ),
    );
  } else {
    await fs.writeFile(configPath, DEFAULT_CONFIG_CONTENT, "utf-8");
    console.log(pc.green(`✅ Created configuration file: .devdiff.config.js`));
  }

  // 3. Create ignore file (.devdiffignore)
  const ignorePath = path.resolve(process.cwd(), ".devdiffignore");
  let ignoreExists = false;
  try {
    await fs.access(ignorePath);
    ignoreExists = true;
  } catch {}

  if (!ignoreExists || options.force) {
    await fs.writeFile(ignorePath, `node_modules/\ndist/\n.turbo/\n`, "utf-8");
    console.log(pc.green(`✅ Created ignore file: .devdiffignore`));
  }

  // 4. Install Git prepare-commit-msg hook
  const hooksDir = path.resolve(gitDir, "hooks");
  await fs.mkdir(hooksDir, { recursive: true });

  const hookPath = path.resolve(hooksDir, "prepare-commit-msg");
  await fs.writeFile(hookPath, PREPARE_COMMIT_MSG_HOOK, "utf-8");

  try {
    // Make hook file executable (Unix/macOS/Linux)
    await fs.chmod(hookPath, "755");
  } catch {
    // Shrug on Windows, chmod is a noop or might fail, which is fine
  }

  console.log(pc.green(`✅ Installed Git commit message hook at: ${hookPath}`));
  console.log(pc.bold(pc.green("\n🎉 DevDiff is now fully configured!")));
  console.log(
    "Every time you run `git commit`, DevDiff will automatically prepare an AI-generated explanation.",
  );
}
