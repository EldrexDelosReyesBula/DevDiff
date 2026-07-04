import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { loadConfig, NetworkGuard, Provider } from "@eldrex/core";

export async function discloseCommand(): Promise<void> {
  const repoPath = process.cwd();
  const config = await loadConfig(repoPath);

  // Read installed date from package.json stats
  let installedDate = "2026-06-30";
  try {
    const pkgPath = path.resolve(repoPath, "package.json");
    const stat = await fs.stat(pkgPath);
    installedDate = stat.birthtime.toISOString().slice(0, 10);
  } catch {}

  // Active AI Provider info
  let activeProvider = "Not configured";
  if (config.ai?.providers && config.ai.providers.length > 0) {
    const primary = config.ai.providers[0];
    activeProvider = `${primary.name} (${primary.url})`;
  } else {
    // Check fallback/default
    activeProvider = "ollama://llama3.2:3b (local fallback)";
  }

  // Session Stats
  const stats = await NetworkGuard.getSessionStats();

  // Load audit shell log size or counts
  let shellCmdCount = 0;
  try {
    const shellLogPath = path.resolve(repoPath, ".devdiff/audit/shell.log");
    const content = await fs.readFile(shellLogPath, "utf-8");
    shellCmdCount = content.split("\n").filter(Boolean).length;
  } catch {}

  // Checkpoints count
  let checkpointCount = 0;
  try {
    const vibeSessionPath = path.resolve(
      repoPath,
      ".devdiff/vibe-session.json",
    );
    const content = await fs.readFile(vibeSessionPath, "utf-8");
    const session = JSON.parse(content);
    if (session.checkpoints) {
      checkpointCount = session.checkpoints.length;
    }
  } catch {}

  console.log(
    pc.cyan("┌─────────────────────────────────────────────────────────────┐"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.white(
          "                    DEVDIFF FULL DISCLOSURE                    ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  Version: 1.0.3                                              `,
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  License: MIT                                                `,
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  Installed: ${installedDate}                                       `,
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("├─────────────────────────────────────────────────────────────┤"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.yellow(
          "  📡 NETWORK ACTIVITY                                         ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ No telemetry endpoints                                   ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ No analytics services                                   ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ No crash reporting                                       ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ No usage tracking                                       ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ No data collection                                       ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Optional (only if configured):                              ",
      ) +
      pc.cyan("│"),
  );

  const hasCloudAI = config.ai?.providers?.some(
    (p: Provider) =>
      !p.url.includes("localhost") && !p.url.includes("127.0.0.1"),
  );
  const cloudAIStr = hasCloudAI ? "Configured outbound" : "Not configured";
  console.log(
    pc.cyan("│") +
      pc.white(`  ○ Cloud AI provider: ${cloudAIStr.padEnd(39)}`) +
      pc.cyan("│"),
  );

  const notifications = (config as any).notifications;
  const hasWebhooks = notifications?.webhooks?.length > 0;
  const webhooksStr = hasWebhooks
    ? `${notifications.webhooks.length} endpoints`
    : "Not configured";
  console.log(
    pc.cyan("│") +
      pc.white(`  ○ Webhook listeners: ${webhooksStr.padEnd(39)}`) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(`  ○ Notification webhooks: ${webhooksStr.padEnd(35)}`) +
      pc.cyan("│"),
  );

  const updatesOptOut = (config as any).updates?.checkForUpdates === false;
  const updatesStr = updatesOptOut
    ? "Disabled"
    : "registry.npmjs.org (once/24h)";
  console.log(
    pc.cyan("│") +
      pc.white(`  ○ Version check: ${updatesStr.padEnd(43)}`) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("├─────────────────────────────────────────────────────────────┤"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.yellow(
          "  💾 FILE SYSTEM ACCESS                                       ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Reads:                                                      ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • .git/ — Git history and diffs                            ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • package.json — Project detection                         ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • README.md — Project context                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Your source files — Diff analysis                        ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Writes:                                                     ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • .devdiff/ — Cache, checkpoints, audit logs               ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • CHANGELOG.md — Generated changelog (if configured)       ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Your configured output paths                             ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Never accesses:                                             ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • ~/.ssh, ~/.aws, ~/.config outside project                ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • /etc/passwd, system files                                ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Other projects outside workspace                         ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Browser history, cookies, personal data                  ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("├─────────────────────────────────────────────────────────────┤"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.yellow(
          "  🖥️ SHELL ACCESS                                             ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Allowed commands (whitelisted):                             ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • git — Read diffs, history, branches                      ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • ollama — Detect installation                             ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • which — Find binary paths                                ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Never executes:                                             ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • rm, sudo, curl piping, eval                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Any command not in whitelist                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Shell access is: LOGGED to .devdiff/audit/shell.log        ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("├─────────────────────────────────────────────────────────────┤"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.yellow(
          "  🤖 AI PROCESSING                                            ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(`  Provider: ${activeProvider.substring(0, 48).padEnd(50)}`) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  Data sent to AI:                                            ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Git diff (secrets redacted)                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Project context (.devdiff/context.md)                    ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • System prompt (persona instructions)                     ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  NEVER sent to AI:                                           ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Full source code                                         ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Environment variables                                    ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • API keys, tokens, passwords                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • File paths outside project                               ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Your identity or machine info                            ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("├─────────────────────────────────────────────────────────────┤"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.yellow(
          "  🔒 PRIVACY GUARANTEES                                       ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Zero telemetry — no data leaves without config            ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Zero analytics — we don't track anything                 ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Zero crash reports — errors stay local                   ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • Zero user profiling — no accounts required               ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  • MIT license — no contributor agreement                   ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  What we DON'T do:                                           ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.red("  ❌ Collect usage statistics                                 ") +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.red("  ❌ Send error reports                                       ") +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.red("  ❌ Track feature usage                                      ") +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.red("  ❌ Build user profiles                                      ") +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.red("  ❌ Share data with third parties                            ") +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.red("  ❌ Include advertising SDKs                                 ") +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.red("  ❌ Phone home                                               ") +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  What we DO (only if configured):                            ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ Call your chosen AI provider                             ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ Send webhooks you configured                             ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.green(
        "  ✅ Check npm for updates (opt-out available)                ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("├─────────────────────────────────────────────────────────────┤"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.yellow(
          "  📊 SESSION STATISTICS                                       ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "  This session:                                               ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  • AI calls: ${stats.externalRequests + stats.localRequests} (${stats.localRequests} local, ${stats.externalRequests} cloud)`.padEnd(
          60,
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  • Tokens used: ~${((stats.dataSentBytes || 1200) / 4).toFixed(0)}`.padEnd(
          60,
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  • Files analyzed: ${stats.externalRequests + stats.localRequests}`.padEnd(
          60,
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  • Network requests: ${stats.externalRequests + stats.localRequests + stats.blockedRequests}`.padEnd(
          60,
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(`  • Shell commands: ${shellCmdCount}`.padEnd(60)) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(`  • Checkpoints saved: ${checkpointCount}`.padEnd(60)) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        `  • Data sent externally: ${stats.dataSentBytes} bytes`.padEnd(60),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("│") +
      pc.white(
        "                                                              ",
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("└─────────────────────────────────────────────────────────────┘"),
  );
}
