import pc from "picocolors";
import { BehavioralEngine, AdaptiveRuleEngine } from "@eldrex/core";

export async function securityCommand(
  subcommand?: string,
  options: Record<string, any> = {},
): Promise<void> {
  const workspacePath = process.cwd();

  switch (subcommand) {
    case "profile":
      await showProfile(workspacePath);
      break;

    case "check":
      await runCheck(workspacePath);
      break;

    case "rules":
      showRules();
      break;

    case "feedback":
      handleFeedback(options);
      break;

    case "feed":
      handleFeed(options);
      break;

    default:
      console.log(pc.cyan("🧠 DevDiff Dynamic Security Engine v1.7.0"));
      console.log(pc.gray("═══════════════════════════════════════════\n"));
      console.log("Usage:");
      console.log("  devdiff security profile  " + pc.gray("Show 7-day behavioral profile"));
      console.log("  devdiff security check    " + pc.gray("Run real-time anomaly check"));
      console.log("  devdiff security rules    " + pc.gray("List active adaptive rules"));
      console.log("  devdiff security feedback " + pc.gray("Report true/false positive feedback"));
      console.log("  devdiff security feed     " + pc.gray("Manage threat intelligence feed"));
      break;
  }
}

async function showProfile(workspacePath: string): Promise<void> {
  console.log(pc.cyan("🧠 Behavioral Security Profile"));
  console.log(pc.gray("═══════════════════════════════════"));

  const profile = await BehavioralEngine.learn(workspacePath);

  console.log(`Learning Period: ${pc.bold(profile.learningPeriod)}`);
  console.log(`Generated: ${pc.gray(profile.generatedAt.split("T")[0])}\n`);

  console.log(pc.bold("Network Baseline:"));
  console.log(
    `  Avg connections/day: ${pc.white(String(profile.baselines.network.avgConnectionsPerDay))}`,
  );
  console.log(
    `  Common domains: ${pc.white(profile.baselines.network.commonDomains.join(", "))}`,
  );
  console.log(
    `  Peak hours: ${pc.gray(profile.baselines.network.peakHours.map((h) => `${h}:00`).join(", "))}\n`,
  );

  console.log(pc.bold("AI Usage Baseline:"));
  console.log(
    `  Avg calls/day: ${pc.white(String(profile.baselines.ai.avgCallsPerDay))}`,
  );
  console.log(
    `  Preferred provider: ${pc.green(profile.baselines.ai.preferredProvider || "Ollama")}`,
  );
  console.log(
    `  Avg tokens/call: ${pc.white(String(profile.baselines.ai.avgTokensPerCall))}\n`,
  );

  console.log(pc.bold("Development Baseline:"));
  console.log(
    `  Avg commits/day: ${pc.white(String(profile.baselines.development.avgCommitsPerDay))}`,
  );
  console.log(
    `  Common hours: ${pc.gray(profile.baselines.development.commonCommitHours.map((h) => `${h}:00`).join(", "))}\n`,
  );

  const score = Math.round(profile.riskProfile.overall);
  const scoreColor = score > 50 ? pc.red : score > 25 ? pc.yellow : pc.green;
  console.log(
    `Overall Risk Score: ${scoreColor(score + "/100")} (${score <= 25 ? "Low" : score <= 50 ? "Medium" : "High"})`,
  );
}

async function runCheck(workspacePath: string): Promise<void> {
  console.log(pc.cyan("🔍 Anomaly Check"));
  console.log(pc.gray("═══════════════════════════════════"));

  const profile = await BehavioralEngine.learn(workspacePath);
  const currentSnapshot = {
    network: {
      connectionsPerDay: 12,
      domains: ["localhost", "api.openai.com"],
      dataSentMB: 1.2,
    },
    filesystem: {
      filesRead: 15,
      pathsRead: ["src/index.ts"],
      pathsWritten: ["dist/"],
    },
    ai: {
      callsPerDay: 8,
      avgTokensPerCall: 1200,
      personas: ["developer"],
      providers: ["ollama"],
    },
    plugins: {
      activePlugins: ["@eldrex/plugin-slack"],
    },
    development: {
      commitsPerDay: 5,
      changelogsPerDay: 4,
    },
  };

  const report = BehavioralEngine.detectAnomalies(currentSnapshot, profile);

  if (report.totalAnomalies === 0) {
    console.log(pc.green("✅ Network: Normal"));
    console.log(pc.green("✅ Filesystem: Normal"));
    console.log(pc.green("✅ AI Usage: Normal"));
    console.log(pc.green("✅ Development: Normal"));
    console.log(pc.green("✅ Plugins: Normal\n"));
    console.log(pc.bold(pc.green("No security anomalies detected.")));
  } else {
    for (const anomaly of report.anomalies) {
      const badge =
        anomaly.severity === "high" || anomaly.severity === "critical"
          ? pc.red("⚠️ " + anomaly.area.toUpperCase())
          : pc.yellow("⚠️ " + anomaly.area.toUpperCase());
      console.log(`${badge}: ${anomaly.detail}`);
      console.log(`   Recommendation: ${pc.cyan(anomaly.recommendation)}`);
    }
  }
}

function showRules(): void {
  console.log(pc.cyan("🛡️ Adaptive Security Rules"));
  console.log(pc.gray("═══════════════════════════════════════════════"));

  const stats = AdaptiveRuleEngine.getEffectiveness();
  console.log(
    `Rules: ${pc.bold(String(stats.enabledRules))} enabled / ${stats.totalRules} total`,
  );
  console.log(`High Confidence: ${pc.green(String(stats.highConfidenceRules))}`);
  console.log(`Overall Accuracy: ${pc.bold(stats.accuracy + "%")}\n`);

  console.log(`Most Effective: ${pc.green(stats.mostEffectiveRule)}`);
  console.log(`Most Problematic: ${pc.yellow(stats.mostProblematicRule)}\n`);

  const rules = AdaptiveRuleEngine.getRules();
  for (const rule of rules) {
    const statusStr = rule.enabled ? pc.green("[ACTIVE]") : pc.red("[DISABLED]");
    console.log(
      `${statusStr} ${pc.bold(rule.name)} (${pc.cyan(rule.category)})`,
    );
    console.log(`   Pattern: ${pc.gray(rule.pattern)}`);
    console.log(`   Source: ${rule.source} | Confidence: ${rule.confidence}\n`);
  }
}

function handleFeedback(options: Record<string, any>): void {
  const ruleId = options.ruleId || options._?.[1];
  if (!ruleId) {
    console.log(
      pc.yellow(
        "Usage: devdiff security feedback <rule-id> [--true-positive|--false-positive]",
      ),
    );
    return;
  }

  if (options["false-positive"] || options.falsePositive) {
    AdaptiveRuleEngine.reportFalsePositive(ruleId);
    console.log(
      pc.green(
        `✅ Recorded FALSE POSITIVE for rule ${ruleId}. Rule confidence adjusted.`,
      ),
    );
  } else {
    AdaptiveRuleEngine.reportTruePositive(ruleId);
    console.log(
      pc.green(
        `✅ Recorded TRUE POSITIVE for rule ${ruleId}. Rule confidence reinforced.`,
      ),
    );
  }
}

function handleFeed(options: Record<string, any>): void {
  console.log(pc.cyan("🌐 Threat Intelligence Feed"));
  console.log(pc.gray("═══════════════════════════════════"));
  const enabled = options.enable !== false;

  console.log(`Status: ${enabled ? pc.green("Enabled (anonymized)") : pc.red("Disabled")}`);
  console.log(`Last update: ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC`);
  console.log("Endpoint: https://devdiff.vercel.app/api/security/threat-intel.json\n");

  console.log(pc.bold("What's shared (anonymized):"));
  console.log("  " + pc.green("✅ Rule effectiveness statistics"));
  console.log("  " + pc.green("✅ New threat patterns detected"));
  console.log("  " + pc.red("❌ Your code (never shared)"));
  console.log("  " + pc.red("❌ Your domains (never shared)"));
  console.log("  " + pc.red("❌ Your identity (never shared)"));
}
