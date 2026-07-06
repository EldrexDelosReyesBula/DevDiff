import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { loadConfig } from "@eldrex/core";

async function updateAgenticConfigText(updates: Record<string, any>) {
  const configPath = path.resolve(process.cwd(), ".devdiff.config.js");
  let content = "";
  try {
    content = await fs.readFile(configPath, "utf-8");
  } catch {
    content = `export default {\n};\n`;
  }

  const agenticRegex = /agentic:\s*\{([^}]+)\}/;
  if (agenticRegex.test(content)) {
    let blockContent = "";
    if (updates.enabled === false) {
      blockContent = `enabled: false`;
    } else {
      blockContent =
        `enabled: true,\n    ` +
        Object.entries(updates)
          .filter(([k]) => k !== "enabled")
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
          .join(",\n    ");
    }
    content = content.replace(
      agenticRegex,
      `agentic: {\n    ${blockContent}\n  }`,
    );
  } else {
    const lastBraceIdx = content.lastIndexOf("}");
    if (lastBraceIdx !== -1) {
      let blockContent = "";
      if (updates.enabled === false) {
        blockContent = `enabled: false`;
      } else {
        blockContent =
          `enabled: true,\n    ` +
          Object.entries(updates)
            .filter(([k]) => k !== "enabled")
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join(",\n    ");
      }
      const firstBraceIdx = content.indexOf("{");
      const middle = content.substring(firstBraceIdx + 1, lastBraceIdx).trim();
      const prefixComma = middle.length > 0 ? "," : "";
      const insert = `${prefixComma}\n  agentic: {\n    ${blockContent}\n  }\n`;
      content =
        content.substring(0, lastBraceIdx) +
        insert +
        content.substring(lastBraceIdx);
    }
  }

  await fs.writeFile(configPath, content, "utf-8");
}

export async function agenticCommand(
  action: string,
  options: { autoStart?: boolean; agent?: string },
) {
  const config = await loadConfig();
  const agenticConfig = (config as any).agentic || {};

  if (action === "status") {
    console.log(pc.blue("\n🕵️ DevDiff Agentic Workspace Status:"));
    const enabled = agenticConfig.enabled !== false;
    const autoStart = agenticConfig.autoStart !== false;
    const allowed = agenticConfig.allowedAgents || [];

    console.log(
      `- Agentic Mode:       ${enabled ? pc.green("ENABLED") : pc.red("DISABLED")}`,
    );
    console.log(
      `- Auto-Start:         ${autoStart ? pc.green("ENABLED") : pc.red("DISABLED")}`,
    );
    console.log(
      `- Allowed AI Agents:  ${allowed.length > 0 ? allowed.join(", ") : pc.cyan("All allowed")}`,
    );
    console.log(
      `- Notification Mode:  ${pc.cyan(agenticConfig.notificationMode || "minimal")}`,
    );
    console.log(
      `- Max Analyses/Hour:  ${pc.cyan(agenticConfig.maxAutoAnalysesPerHour || 20)}`,
    );
    console.log("");
    return;
  }

  if (action === "disable") {
    if (options.autoStart) {
      await updateAgenticConfigText({ ...agenticConfig, autoStart: false });
      console.log(pc.green("✅ Disabled auto-start for agentic mode."));
    } else if (options.agent) {
      const allowed = agenticConfig.allowedAgents || [];
      const updatedAllowed = allowed.filter(
        (a: string) => a.toLowerCase() !== options.agent?.toLowerCase(),
      );
      await updateAgenticConfigText({
        ...agenticConfig,
        allowedAgents: updatedAllowed,
      });
      console.log(
        pc.green(`✅ Disabled agentic mode for agent: "${options.agent}".`),
      );
    } else {
      await updateAgenticConfigText({ enabled: false });
      console.log(pc.green("✅ Agentic mode disabled completely."));
    }
    return;
  }

  if (action === "enable") {
    await updateAgenticConfigText({
      enabled: true,
      autoStart: true,
      autoAnalyzeOnCommit: false,
      notificationMode: "minimal",
      allowedAgents: [],
      maxAutoAnalysesPerHour: 20,
    });
    console.log(pc.green("✅ Agentic mode enabled successfully."));
    return;
  }

  console.log(
    pc.red(`❌ Unknown action: "${action}". Use enable, disable, or status.`),
  );
}
