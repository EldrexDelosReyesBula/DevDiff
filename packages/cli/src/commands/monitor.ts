import * as fs from "fs";
import * as path from "path";
import pc from "picocolors";
import { NetworkLogEntry } from "@eldrex/core";

export async function monitorCommand(): Promise<void> {
  const repoPath = process.cwd();
  const logPath = path.resolve(repoPath, ".devdiff/audit/network.log");

  console.clear();
  console.log(
    pc.cyan("┌─────────────────────────────────────────────────────────────┐"),
  );
  console.log(
    pc.cyan("│") +
      pc.bold(
        pc.white(
          "  DEVDIFF NETWORK MONITOR — Press Ctrl+C to stop              ",
        ),
      ) +
      pc.cyan("│"),
  );
  console.log(
    pc.cyan("├─────────────────────────────────────────────────────────────┘"),
  );
  console.log("");

  // Ensure the directory and file exist
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, "", "utf-8");
    }
  } catch (err) {
    console.error(pc.red(`❌ Failed to initialize monitor log file: ${err}`));
    return;
  }

  let filePosition = fs.statSync(logPath).size;

  // Let's print existing logs (last 5 entries)
  try {
    const raw = fs.readFileSync(logPath, "utf-8");
    const lines = raw.split("\n").filter(Boolean);
    const lastLines = lines.slice(-5);
    for (const line of lastLines) {
      printEntry(JSON.parse(line));
    }
  } catch {}

  const watcher = fs.watch(logPath, (event) => {
    if (event === "change") {
      try {
        const stats = fs.statSync(logPath);
        if (stats.size < filePosition) {
          // Log rotated or cleared
          filePosition = 0;
        }

        if (stats.size > filePosition) {
          const stream = fs.createReadStream(logPath, {
            start: filePosition,
            end: stats.size,
            encoding: "utf-8",
          });

          let chunk = "";
          stream.on("data", (data) => {
            chunk += data;
          });

          stream.on("end", () => {
            filePosition = stats.size;
            const lines = chunk.split("\n").filter(Boolean);
            for (const line of lines) {
              try {
                printEntry(JSON.parse(line));
              } catch {}
            }
          });
        }
      } catch {}
    }
  });

  // Keep process alive and clean up on exit
  process.on("SIGINT", () => {
    watcher.close();
    console.log("\n" + pc.cyan("Monitor stopped."));
    process.exit(0);
  });
}

function printEntry(entry: NetworkLogEntry): void {
  const dateStr = new Date(entry.timestamp).toLocaleTimeString();
  const allowedStatus = entry.allowed
    ? pc.green("→ ALLOWED")
    : pc.red("⚠️ ATTEMPT BLOCKED");
  const method =
    entry.url.includes("tags") || entry.url.includes("latest") ? "GET" : "POST";

  console.log(`  [${pc.gray(dateStr)}] ${method} ${pc.white(entry.domain)}`);
  console.log(
    `             ${allowedStatus} (${entry.category.toUpperCase()})`,
  );

  if (entry.reason) {
    console.log(`             ${pc.yellow(entry.reason)}`);
  }
  console.log("");
}
