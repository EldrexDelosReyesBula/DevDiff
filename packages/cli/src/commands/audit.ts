import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { loadConfig, NETWORK_ACCESS, SecurityAudit } from "@eldrex/core";

const PACKAGE_DISCLOSURES: Record<string, {
  name: string;
  description: string;
  socketScore: number;
  accesses: { fileSystem: string; shell: string; network: string };
  neverDoes: string[];
}> = {
  "@eldrex/core": {
    name: "@eldrex/core",
    description: "Core engine for DevDiff — intelligent, privacy-first changelog generation",
    socketScore: 75,
    accesses: {
      fileSystem: "Read git repos, write changelogs",
      shell: "Yes (git status, git diff, which ollama)",
      network: "Yes (Cloud AI, webhooks, notifications, default local only)"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Read files outside your project",
      "Access environment variables except configured API keys",
      "Execute arbitrary shell commands"
    ]
  },
  "@eldrex/personas": {
    name: "@eldrex/personas",
    description: "Code analysis personas for DevDiff — customize changelogs",
    socketScore: 74,
    accesses: {
      fileSystem: "No",
      shell: "No",
      network: "No"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Read files in your workspace",
      "Execute shell commands",
      "Make network calls"
    ]
  },
  "@eldrex/dashboard": {
    name: "@eldrex/dashboard",
    description: "Visual, offline-first dashboard for DevDiff changelog management",
    socketScore: 76,
    accesses: {
      fileSystem: "No",
      shell: "No",
      network: "No (Localhost only, connects to local gateway)"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Read files outside local browser storage",
      "Make external API calls"
    ]
  },
  "@eldrex/cli": {
    name: "@eldrex/cli",
    description: "Command-line interface for DevDiff — intelligent changelog generation",
    socketScore: 74,
    accesses: {
      fileSystem: "Read configurations, write local log cache",
      shell: "Yes (git operations, detect Ollama path)",
      network: "Yes (Version check registry, default local)"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Access files outside repository scope",
      "Share data with third parties"
    ]
  },
  "@eldrex/gateway": {
    name: "@eldrex/gateway",
    description: "Local event gateway and hook receiver for DevDiff",
    socketScore: 75,
    accesses: {
      fileSystem: "Read configurations",
      shell: "No",
      network: "Yes (Binds ports 3737/3740 for local webhooks)"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Expose unauthenticated connections",
      "Execute arbitrary scripts"
    ]
  },
  "@eldrex/vite": {
    name: "@eldrex/vite",
    description: "Vite plugin for DevDiff — automatically runs changelog generation on build",
    socketScore: 71,
    accesses: {
      fileSystem: "Read git config, write CHANGELOG.md",
      shell: "Yes (git diff HEAD~1 on build)",
      network: "No"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Make network calls",
      "Access environment variables"
    ]
  },
  "@eldrex/vscode": {
    name: "@eldrex/vscode",
    description: "Privacy-first, BYOAI inline changelog intelligence for VS Code",
    socketScore: 74,
    accesses: {
      fileSystem: "Read git repos, write changelogs",
      shell: "Yes (git status, git diff cached)",
      network: "No (connects via local gateway/core)"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Share data with third parties",
      "Execute arbitrary scripts"
    ]
  },
  "devdiff": {
    name: "devdiff",
    description: "Privacy-first, BYOAI inline changelog intelligence for VS Code (registered extension identifier)",
    socketScore: 76,
    accesses: {
      fileSystem: "Read git repos, write changelogs",
      shell: "Yes (git status, git diff cached)",
      network: "No"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Share data with third parties",
      "Execute arbitrary scripts"
    ]
  },
  "@eldrex/openclaw": {
    name: "@eldrex/openclaw",
    description: "OpenClaw AI agent integrations for DevDiff",
    socketScore: 73,
    accesses: {
      fileSystem: "Bound to git repository scope",
      shell: "No",
      network: "Yes (Exposes MCP endpoint on port 3739)"
    },
    neverDoes: [
      "Send telemetry or analytics",
      "Run arbitrary scripts on host machine",
      "Expose unauthenticated actions"
    ]
  }
};

export async function auditCommand(type?: string, options?: { package?: string }) {
  // Check if specific package audit is requested
  if (options?.package) {
    const pkgName = options.package;
    const pkg = PACKAGE_DISCLOSURES[pkgName];
    if (!pkg) {
      console.log(pc.red(`❌ Unknown package: ${pkgName}`));
      console.log(pc.yellow(`Supported packages: ${Object.keys(PACKAGE_DISCLOSURES).join(", ")}`));
      return;
    }

    console.log(pc.blue(`📊 Security & Privacy Disclosure for ${pc.bold(pkg.name)} (Socket Score: ${pkg.socketScore})`));
    console.log("-".repeat(80));
    console.log(`${pc.bold("Description:")} ${pkg.description}`);
    console.log("\n" + pc.bold("Resource Access Permissions:"));
    console.log(`- ${pc.bold("File System:")} ${pkg.accesses.fileSystem}`);
    console.log(`- ${pc.bold("Shell:")}       ${pkg.accesses.shell}`);
    console.log(`- ${pc.bold("Network:")}     ${pkg.accesses.network}`);
    console.log("\n" + pc.bold("Security Policy Guarantees:"));
    for (const rule of pkg.neverDoes) {
      console.log(`- ❌ NEVER ${rule}`);
    }
    console.log("-".repeat(80));

    // Show filtered shell logs if they apply
    if (pkgName === "@eldrex/core" || pkgName === "@eldrex/cli" || pkgName === "@eldrex/vscode" || pkgName === "devdiff" || pkgName === "@eldrex/vite") {
      const logs = await SecurityAudit.getLogs();
      if (logs.length > 0) {
        console.log(pc.green(`\n🛡️ Recent local shell operations for ${pkg.name}:`));
        console.log(`${pc.bold("TIMESTAMP".padEnd(25))} | ${pc.bold("COMMAND".padEnd(10))} | ${pc.bold("ARGUMENTS")}`);
        console.log("-".repeat(80));
        for (const log of logs) {
          const timeStr = new Date(log.timestamp).toLocaleString();
          const cmd = log.command || "";
          const argsStr = log.args ? log.args.join(" ") : "";
          console.log(`${timeStr.padEnd(25)} | ${cmd.padEnd(10)} | ${argsStr}`);
        }
      }
    }
    return;
  }

  // Handle specific subcommand types
  if (type === "network") {
    console.log(pc.blue("🌐 DevDiff Network Access Disclosures & Controls:"));
    console.log("=".repeat(80));
    for (const [key, value] of Object.entries(NETWORK_ACCESS)) {
      console.log(`${pc.bold(pc.green(`[${key}]`))}`);
      console.log(`${pc.bold("Description:")} ${(value as any).description}`);
      console.log(`${pc.bold("Trigger:")}     ${(value as any).trigger}`);
      console.log(`${pc.bold("Default:")}     ${(value as any).default}`);
      console.log(`${pc.bold("Disable:")}     ${(value as any).disable}`);
      if ((value as any).endpoints) {
        console.log(`${pc.bold("Endpoints:")}   ${(value as any).endpoints.join(", ")}`);
      }
      if ((value as any).ports) {
        console.log(`${pc.bold("Ports:")}       ${(value as any).ports.join(", ")}`);
      }
      console.log("-".repeat(80));
    }
    return;
  }

  if (type === "shell") {
    const logs = await SecurityAudit.getLogs();
    if (logs.length === 0) {
      console.log(pc.yellow("ℹ️ No shell access logs recorded yet."));
      return;
    }
    console.log(pc.green(`✅ Found ${logs.length} audited shell executions:\n`));
    console.log(`${pc.bold("TIMESTAMP".padEnd(25))} | ${pc.bold("COMMAND".padEnd(10))} | ${pc.bold("ARGUMENTS")}`);
    console.log("=".repeat(80));
    for (const log of logs) {
      const timeStr = new Date(log.timestamp).toLocaleString();
      const cmd = log.command || "";
      const argsStr = log.args ? log.args.join(" ") : "";
      console.log(`${timeStr.padEnd(25)} | ${cmd.padEnd(10)} | ${argsStr}`);
    }
    return;
  }

  // Default: AI calls audit log
  console.log(pc.blue("📊 Loading DevDiff AI call audit logs..."));
  const config = await loadConfig();
  const cachePath = path.resolve(process.cwd(), config.cache.path);

  try {
    const data = await fs.readFile(cachePath, "utf-8");
    const cache = JSON.parse(data);
    const entries = Object.keys(cache)
      .map((hash) => ({
        hash,
        ...cache[hash],
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    if (entries.length === 0) {
      console.log(pc.yellow("ℹ️ No AI calls recorded in the audit log yet."));
      return;
    }

    console.log(
      pc.green(`✅ Found ${entries.length} audited AI calls in cache:\n`),
    );

    console.log(
      `${pc.bold("TIMESTAMP".padEnd(25))} | ${pc.bold("PROVIDER".padEnd(12))} | ${pc.bold("MODEL".padEnd(15))} | ${pc.bold("SUMMARY")}`,
    );
    console.log("-".repeat(80));

    for (const entry of entries) {
      const timeStr = new Date(entry.timestamp).toLocaleString();
      const provider = entry.provider || "unknown";
      const model = entry.model || "unknown";
      const summary = entry.result?.summary
        ? entry.result.summary.substring(0, 45) + "..."
        : "N/A";

      console.log(
        `${timeStr.padEnd(25)} | ${provider.padEnd(12)} | ${model.padEnd(15)} | ${summary}`,
      );
    }
  } catch {
    console.log(
      pc.yellow(
        "ℹ️ No audit log file found (or it is empty). Run some generation commands first.",
      ),
    );
  }
}
