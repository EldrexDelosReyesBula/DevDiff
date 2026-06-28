import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";
import express from "express";
import cors from "cors";
import { exec } from "child_process";
import { loadConfig, generateChangelog } from "@eldrex/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function reportCommand(options: { port?: string }) {
  const port = parseInt(options.port || "4200", 10);
  const config = await loadConfig();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Serve static web dashboard
  // CLI dist is at packages/cli/dist. dashboard dist is at packages/web-dashboard/dist
  const dashboardPath = path.resolve(__dirname, "../../web-dashboard/dist");

  try {
    await fs.access(dashboardPath);
    app.use(express.static(dashboardPath));
  } catch {
    console.warn(
      pc.yellow(
        `⚠️ Dashboard assets not found at ${dashboardPath}. Make sure to build packages first.`,
      ),
    );
  }

  // API: Get changelogs from cache
  app.get("/api/changelogs", async (req, res) => {
    try {
      const cachePath = path.resolve(process.cwd(), config.cache.path);
      let cacheContent = "{}";
      try {
        cacheContent = await fs.readFile(cachePath, "utf-8");
      } catch {}

      const parsed = JSON.parse(cacheContent);
      // Format response as an array of entries sorted by timestamp descending
      const entries = Object.keys(parsed)
        .map((hash) => ({
          hash,
          ...parsed[hash],
        }))
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );

      res.json({ success: true, data: entries });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Get active configuration
  app.get("/api/config", (req, res) => {
    res.json({ success: true, data: config });
  });

  // API: Trigger on-demand generation
  app.post("/api/generate", async (req, res) => {
    try {
      // Fetch diff from staging
      let diffText = "";
      try {
        const { execSync } = await import("child_process");
        diffText = execSync("git diff --cached", {
          stdio: ["ignore", "pipe", "ignore"],
        }).toString();
        if (!diffText.trim()) {
          diffText = execSync("git diff", {
            stdio: ["ignore", "pipe", "ignore"],
          }).toString();
        }
      } catch {}

      if (!diffText.trim()) {
        return res.json({ success: false, message: "No changes detected." });
      }

      const result = await generateChangelog({
        diffText,
        repoPath: process.cwd(),
      });

      res.json({ success: true, data: result.rawResult });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fallback to serve index.html for React SPA router
  app.get("*", (req, res) => {
    res.sendFile(path.join(dashboardPath, "index.html"), (err) => {
      if (err) {
        res.status(404).send("Dashboard not found. Run pnpm build first.");
      }
    });
  });

  const server = app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(pc.green(`\n🚀 DevDiff Server running at: ${url}`));
    console.log(pc.gray("Press Ctrl+C to stop the server.\n"));

    // Auto-open browser
    try {
      const startCmd =
        process.platform === "win32"
          ? "start"
          : process.platform === "darwin"
            ? "open"
            : "xdg-open";
      exec(`${startCmd} ${url}`);
    } catch {}
  });

  process.on("SIGINT", () => {
    server.close();
    console.log(pc.blue("\n👋 Stopped report server."));
    process.exit(0);
  });
}
