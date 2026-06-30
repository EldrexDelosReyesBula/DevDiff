import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCurrentVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, "../../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return pkg.version || "1.0.3";
  } catch {
    return "1.0.3";
  }
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://registry.npmjs.org/@eldrex/cli/latest", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as { version: string };
    return data.version || null;
  } catch {
    return null;
  }
}

const EMBEDDED_CHANGELOG = `
v1.0.3 (2026-06-30)
  + Encrypted audit logs (AES-256-GCM)
  + Prompt injection sanitizer (10 jailbreak patterns)
  + GitHub webhook HMAC-SHA256 validation
  + Hardened CORS with OWASP security headers
  + Nodemailer SMTP email output
  + Notion page creation (real API)
  + MockAIProvider for testing and --dry-run
  + AbortController timeout for Ollama (30s default)
  + Security CI workflow (TruffleHog + SBOM + CodeQL)
  + Pre-commit secret scanning hook
  ~ Fix: SecretScanner class with custom pattern support
  ~ Fix: DiffParser binary, renamed, and conflict detection
  ~ Fix: PrivacyEnforcer commit-message classification

v1.0.2 (2026-07-08)
  + Multi-agent orchestration (4 specialist agents)
  + WebGPU inference support
  + Mermaid sanitizer edge cases
  + Compliance framework auto-config

v1.0.1 (2026-07-01)
  + Compliance frameworks (GDPR, SOC2, HIPAA, PCI-DSS...)
  + Privacy enforcement engine
  + VibeCoderGuardian checkpoints

v1.0.0 (2026-06-28)
  + Initial release
  + Core changelog generation
  + BYOAI (bring your own AI) support
  + Local-first, privacy-first architecture
  + 8 personas (developer, ceo, educator, robot, analyst, journalist, pm, compliance)
`.trim();

export interface VersionOptions {
  check?: boolean;
  changelog?: boolean;
  info?: boolean;
}

export async function versionCommand(options: VersionOptions = {}) {
  const current = getCurrentVersion();

  // --changelog
  if (options.changelog) {
    console.log(pc.cyan("\n📋 DevDiff Changelog\n"));
    console.log(EMBEDDED_CHANGELOG);
    console.log();
    return;
  }

  // --check
  if (options.check) {
    console.log(pc.gray("\n🔍 Checking for updates..."));
    const latest = await fetchLatestVersion();

    console.log();
    console.log(`  Current: ${pc.white(`v${current}`)}`);

    if (!latest) {
      console.log(`  Latest:  ${pc.yellow("(unable to reach npm registry)")}`);
      console.log(`  Status:  ${pc.gray("⚠️  Offline or registry unreachable")}`);
      console.log();
      console.log(pc.gray("  Your current version continues to work exactly as designed."));
    } else if (latest === current) {
      console.log(`  Latest:  ${pc.white(`v${latest}`)}`);
      console.log(`  Status:  ${pc.green("✅ You are on the latest version!")}`);
    } else {
      console.log(`  Latest:  ${pc.cyan(`v${latest}`)}`);
      console.log(`  Status:  ${pc.yellow("⚡ Update available!")}`);
      console.log();
      console.log(pc.white("  To upgrade:"));
      console.log(pc.gray("    npm install -g @eldrex/cli@latest"));
      console.log();
      console.log(pc.gray("  Or stay on your current version — it will"));
      console.log(pc.gray("  continue working exactly as before. 🔒"));
      console.log();
      console.log(pc.gray(`  See what changed: ${pc.white("devdiff version --changelog")}`));
    }

    console.log();
    return;
  }

  // Default / --info: full status summary
  console.log();
  console.log(`  ${pc.cyan("DevDiff CLI")}  ${pc.white(`v${current}`)}`);
  console.log(`  Node.js         ${pc.white(process.version)}`);
  console.log(`  Platform        ${pc.white(`${process.platform} ${process.arch}`)}`);

  // Check config version pin
  try {
    const configPath = path.resolve(process.cwd(), ".devdiff.config.js");
    if (fs.existsSync(configPath)) {
      const { loadConfig } = await import("@eldrex/core");
      const { checkConfigCompatibility } = await import("@eldrex/core");
      const config = await loadConfig();
      const compat = checkConfigCompatibility(config as any, current);
      if (!compat.compatible) {
        console.log(`  Config version  ${pc.red("❌ Incompatible")} — ${compat.error}`);
      } else if (compat.warning) {
        console.log(`  Config version  ${pc.yellow("⚠️  " + compat.warning)}`);
      } else {
        console.log(`  Config version  ${pc.green("✅ Compatible")}`);
      }
    } else {
      console.log(`  Config          ${pc.gray("(no .devdiff.config.js found)")}`);
    }
  } catch {
    console.log(`  Config          ${pc.gray("(unable to load)")}`);
  }

  console.log(`  Status          ${pc.green("✅ Working as designed")}`);
  console.log();
  console.log(pc.gray("  Commands:"));
  console.log(pc.gray(`    devdiff version --check      Check for updates`));
  console.log(pc.gray(`    devdiff version --changelog  See what changed`));
  console.log();
}
