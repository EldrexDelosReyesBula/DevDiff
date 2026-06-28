import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import { loadConfig } from "@eldrex/core";

export async function auditCommand() {
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
