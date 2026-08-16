import {
  NetworkGuardV2,
  NetworkConfig,
  PluginAuditor,
  DisclosureReport,
} from "@eldrex/core";
import * as fs from "fs";

export async function networkWatchCommand(): Promise<void> {
  console.log(`📡 Network Monitor — Press Ctrl+C to stop`);
  console.log(`══════════════════════════════════════════════════════\n`);

  const logs = NetworkGuardV2.getAuditLogs(process.cwd());
  const recent = logs.slice(-5);

  for (const log of recent) {
    const status = log.allowed ? "✅ ALLOWED" : "❌ BLOCKED";
    console.log(
      `[${log.timestamp.slice(11, 19)}] ${status} — ${log.domain}:${log.port}`,
    );
    if (log.plugin) console.log(`           Plugin: ${log.plugin}`);
    if (log.purpose) console.log(`           Purpose: ${log.purpose}`);
    console.log(`           Reason: ${log.reason}\n`);
  }

  console.log(`──────────────────────────────────────────────────────────────`);
  console.log(`Session Summary (Total logged: ${logs.length} connections)`);
}

export async function networkHistoryCommand(options: {
  since?: string;
  plugin?: string;
  domain?: string;
}): Promise<void> {
  let logs = NetworkGuardV2.getAuditLogs(process.cwd());

  if (options.plugin) {
    logs = logs.filter((l) => l.plugin === options.plugin);
  }
  if (options.domain) {
    logs = logs.filter((l) => l.domain.includes(options.domain!));
  }

  console.log(`📡 Network History (${logs.length} records):\n`);
  for (const log of logs) {
    const status = log.allowed ? "ALLOW" : "BLOCK";
    console.log(
      `  • [${log.timestamp.slice(0, 19)}] [${status}] ${log.domain} (${log.reason})`,
    );
  }
}

export async function networkBlockCommand(
  target: string,
  options: { category?: boolean },
): Promise<void> {
  const config = NetworkConfig.load(process.cwd());

  if (options.category) {
    if (!config.blockedCategories.includes(target)) {
      config.blockedCategories.push(target);
    }
    console.log(`🚫 Blocked network category: "${target}"`);
  } else {
    if (!config.blockedDomains.includes(target)) {
      config.blockedDomains.push(target);
    }
    config.allowedDomains = config.allowedDomains.filter((d) => d !== target);
    console.log(`🚫 Blocked domain: "${target}"`);
  }

  NetworkConfig.save(config, process.cwd());
}

export async function networkUnblockCommand(domain: string): Promise<void> {
  const config = NetworkConfig.load(process.cwd());
  config.blockedDomains = config.blockedDomains.filter((d) => d !== domain);
  NetworkConfig.save(config, process.cwd());

  console.log(`✅ Unblocked domain: "${domain}"`);
}

export async function networkAllowCommand(domain: string): Promise<void> {
  const config = NetworkConfig.load(process.cwd());
  if (!config.allowedDomains.includes(domain)) {
    config.allowedDomains.push(domain);
  }
  config.blockedDomains = config.blockedDomains.filter((d) => d !== domain);
  NetworkConfig.save(config, process.cwd());

  console.log(`✅ Added domain to allowlist: "${domain}"`);
}

export async function networkDisallowCommand(domain: string): Promise<void> {
  const config = NetworkConfig.load(process.cwd());
  config.allowedDomains = config.allowedDomains.filter((d) => d !== domain);
  NetworkConfig.save(config, process.cwd());

  console.log(`🚫 Removed domain from allowlist: "${domain}"`);
}

export async function networkBlockedCommand(): Promise<void> {
  const config = NetworkConfig.load(process.cwd());
  console.log(`🚫 Blocked Domains (${config.blockedDomains.length}):`);
  for (const d of config.blockedDomains) {
    console.log(`  • ❌ ${d}`);
  }
  console.log(
    `\n🚫 Blocked Categories: ${config.blockedCategories.join(", ")}`,
  );
  console.log(
    `🔒 Total Built-in Blocked Domains: ${NetworkGuardV2.getBlockedDomainCount()}`,
  );
}

export async function networkAllowedCommand(): Promise<void> {
  const config = NetworkConfig.load(process.cwd());
  console.log(`✅ Allowed Domains (${config.allowedDomains.length}):`);
  for (const d of config.allowedDomains) {
    console.log(`  • ✅ ${d}`);
  }
}

export async function networkExportCommand(options: {
  format?: "json" | "markdown";
  output?: string;
}): Promise<void> {
  const data = await DisclosureReport.generate(process.cwd());
  const format = options.format || "markdown";
  const outputPath =
    options.output ||
    (format === "json" ? "network-report.json" : "NETWORK_REPORT.md");

  const content =
    format === "json"
      ? JSON.stringify(data, null, 2)
      : DisclosureReport.formatMarkdown(data);
  fs.writeFileSync(outputPath, content, "utf-8");

  console.log(`📄 Network report exported to: ${outputPath}`);
}

export async function networkAuditCommand(): Promise<void> {
  const data = await DisclosureReport.generate(process.cwd());

  console.log(`\n🔒 Network Security Audit`);
  console.log(`══════════════════════════════════════════════════════\n`);
  console.log(`Summary:`);
  console.log(`  Total connections: ${data.networkSummary.totalConnections}`);
  console.log(`  Allowed:           ${data.networkSummary.allowed}`);
  console.log(`  Blocked:           ${data.networkSummary.blocked}`);
  console.log(`  Unique domains:    ${data.networkSummary.uniqueDomains}\n`);
  console.log(`Privacy Guarantees:`);
  for (const p of data.privacyGuarantees) {
    console.log(`  ✅ ${p}`);
  }
  console.log("");
}

export async function pluginAuditCommand(pluginName: string): Promise<void> {
  const audit = await PluginAuditor.auditPlugin(pluginName, process.cwd());

  console.log(`\n🔍 Plugin Audit: ${audit.pluginName} v${audit.version}`);
  console.log(`══════════════════════════════════════════════════════\n`);
  console.log(
    `Verdict: ${audit.verdict === "passed" ? "✅ PASSED" : "⚠️ SUSPICIOUS"}\n`,
  );
  console.log(`Declared Network Permissions:`);
  for (const d of audit.declared.network) {
    console.log(`  • 🌐 ${d}`);
  }
  console.log(`\nActual Network Activity:`);
  for (const a of audit.actual.network) {
    console.log(
      `  • ${a.allowed ? "✅" : "❌"} ${a.domain} (${a.count} requests)`,
    );
  }
  if (audit.issues.length > 0) {
    console.log(`\nIssues Found:`);
    for (const issue of audit.issues) {
      console.log(`  • ⚠️ ${issue}`);
    }
  }
  console.log("");
}

export async function discloseCommand(): Promise<void> {
  const data = await DisclosureReport.generate(process.cwd());
  console.log(DisclosureReport.formatMarkdown(data));
}
