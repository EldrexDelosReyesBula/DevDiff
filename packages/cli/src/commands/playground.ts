import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import pc from "picocolors";
import { WebSocketServer, WebSocket } from "ws";
import {
  getGitInfo,
  getDiffStats,
  getTotalFiles,
  checkAIStatus,
} from "@eldrex/core";
import { generateChangelog, loadConfig } from "@eldrex/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PlaygroundOptions {
  port?: string;
  open?: boolean;
}

function openBrowser(url: string) {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      // Silently ignore — user can open manually
    }
  });
}

/** Resolve the playground HTML file path. Checks several possible locations. */
function resolvePlaygroundHtml(): string | null {
  const candidates = [
    // Built web-dashboard package
    path.resolve(__dirname, "../../../../web-dashboard/dist/playground.html"),
    // Source (dev mode)
    path.resolve(__dirname, "../../../../web-dashboard/src/playground.html"),
    // Relative to CLI dist
    path.resolve(__dirname, "../../web-dashboard/src/playground.html"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Minimal inline fallback HTML if the file can't be found. */
function fallbackHtml(port: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>DevDiff Playground</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: monospace; background: #0f172a; color: #f8fafc; padding: 40px; }
    a { color: #22d3ee; }
    code { background: #1e293b; padding: 4px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>🎮 DevDiff Playground</h1>
  <p>API is running on port ${port}. The playground UI file was not found.</p>
  <p>Build the web-dashboard package first: <code>pnpm --filter @eldrex/dashboard build</code></p>
  <hr>
  <p>Available API endpoints:</p>
  <ul>
    <li><a href="/api/workspace">/api/workspace</a></li>
    <li><a href="/api/stats">/api/stats</a></li>
    <li><a href="/api/personas">/api/personas</a></li>
  </ul>
</body>
</html>`;
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function jsonResponse(
  res: http.ServerResponse,
  data: unknown,
  status = 200,
) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

export async function playgroundCommand(options: PlaygroundOptions = {}) {
  const port = parseInt(options.port || "3737", 10);
  const repoPath = process.cwd();
  const playgroundHtml = resolvePlaygroundHtml();
  const activeSockets = new Set<WebSocket>();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${port}`);

    // Preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST", "Access-Control-Allow-Headers": "Content-Type" });
      res.end();
      return;
    }

    // ─── REST API ────────────────────────────────────────────────────────────

    if (url.pathname === "/api/workspace") {
      const [gitInfo, aiStatus, filesTotal] = await Promise.all([
        getGitInfo(),
        checkAIStatus(),
        getTotalFiles(),
      ]);
      return jsonResponse(res, {
        path: repoPath,
        name: path.basename(repoPath),
        git: gitInfo,
        ai: aiStatus,
        filesTotal,
      });
    }

    if (url.pathname === "/api/stats") {
      const range = url.searchParams.get("since") || "HEAD~5..HEAD";
      const stats = await getDiffStats(range);
      return jsonResponse(res, {
        ...stats,
        commitsAnalyzed: 5,
        tokensUsed: 0, // populated from cache in future
      });
    }

    if (url.pathname === "/api/changelog") {
      const persona = url.searchParams.get("persona") || "developer";
      const format = url.searchParams.get("format") || "markdown";
      const since = url.searchParams.get("since") || "HEAD~5..HEAD";

      try {
        const config = await loadConfig();
        const { execSync } = await import("child_process");
        let diffText = "";
        try {
          diffText = execSync(`git diff ${since}`, {
            stdio: ["ignore", "pipe", "ignore"],
            cwd: repoPath,
          }).toString();
        } catch {}

        if (!diffText.trim()) {
          return jsonResponse(res, { success: false, error: "No changes found for the given range. Try a different --since range." });
        }

        const result = await generateChangelog({ diffText, repoPath, persona: persona as any });
        return jsonResponse(res, { success: true, changelog: result.markdown || result.rawResult?.summary || "" });
      } catch (err: any) {
        return jsonResponse(res, { success: false, error: err.message }, 500);
      }
    }

    if (url.pathname === "/api/personas") {
      return jsonResponse(res, [
        { id: "developer", label: "👨💻 Developer" },
        { id: "ceo",       label: "📊 CEO" },
        { id: "educator",  label: "📚 Educator" },
        { id: "robot",     label: "🤖 Robot" },
        { id: "data-analyst", label: "📈 Analyst" },
        { id: "journalist",   label: "📰 Journalist" },
        { id: "pm",           label: "📋 PM" },
        { id: "compliance",   label: "🔒 Compliance" },
      ]);
    }

    // ─── Serve playground HTML ───────────────────────────────────────────────

    if (url.pathname === "/" || url.pathname === "/playground") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      if (playgroundHtml) {
        res.end(fs.readFileSync(playgroundHtml, "utf-8"));
      } else {
        res.end(fallbackHtml(port));
      }
      return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  // WebSocket — broadcasts file change notifications
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    activeSockets.add(ws);
    ws.on("close", () => activeSockets.delete(ws));
  });

  // Lightweight file watcher using git for changed files
  let watchInterval: ReturnType<typeof setInterval> | null = null;
  let lastHash = "";
  watchInterval = setInterval(async () => {
    try {
      const { execSync } = await import("child_process");
      const hash = execSync("git diff --stat HEAD", {
        stdio: ["ignore", "pipe", "ignore"],
        cwd: repoPath,
      }).toString().trim().slice(-64);

      if (hash !== lastHash && lastHash !== "") {
        for (const ws of activeSockets) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "workspace-changed", timestamp: Date.now() }));
          }
        }
      }
      lastHash = hash;
    } catch {}
  }, 2000);

  const url = `http://localhost:${port}`;

  server.listen(port, () => {
    console.log();
    console.log(pc.cyan("┌─────────────────────────────────────────────────────────────┐"));
    console.log(pc.cyan("│") + pc.white("                                                             ") + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.white(`   🎮 DevDiff Playground                                     `) + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.white("                                                             ") + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.white(`   Local:  ${pc.cyan(url.padEnd(49))}`) + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.white("                                                             ") + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.white(`   ✅ Workspace: ${pc.white(path.basename(repoPath).slice(0, 43).padEnd(43))}`) + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.white("                                                             ") + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.gray("   All data stays on your machine. Zero cloud sync.          ") + pc.cyan("│"));
    console.log(pc.cyan("│") + pc.white("                                                             ") + pc.cyan("│"));
    console.log(pc.cyan("└─────────────────────────────────────────────────────────────┘"));
    console.log();
    console.log(pc.gray("   Press Ctrl+C to stop the playground server."));
    console.log();

    if (options.open !== false) {
      openBrowser(url);
    }
  });

  process.on("SIGINT", () => {
    if (watchInterval) clearInterval(watchInterval);
    for (const ws of activeSockets) ws.close();
    server.close();
    console.log(pc.blue("\n👋 Playground stopped."));
    process.exit(0);
  });
}
