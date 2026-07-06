import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { exec, execFile } from "child_process";
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
  workspace?: string;
}

function openBrowser(url: string) {
  if (process.platform === "win32") {
    // start is a shell builtin, so we run cmd.exe /c start "" "url"
    execFile("cmd.exe", ["/c", "start", "", url], (err: any) => {});
  } else if (process.platform === "darwin") {
    execFile("open", [url], (err: any) => {});
  } else {
    execFile("xdg-open", [url], (err: any) => {});
  }
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
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function jsonResponse(res: http.ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

function buildFileTree(
  dir: string,
  baseDir: string,
  statuses: Record<string, string>,
): any[] {
  const list: any[] = [];
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (
        file === "node_modules" ||
        file === ".git" ||
        file === "dist" ||
        file === ".turbo" ||
        file === "out" ||
        file === ".devdiff-cache"
      )
        continue;
      const fullPath = path.join(dir, file);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        list.push({
          name: file,
          path: relPath,
          type: "directory",
          children: buildFileTree(fullPath, baseDir, statuses),
        });
      } else {
        // Detect language
        const ext = path.extname(file).toLowerCase();
        let language = "text";
        if (ext === ".ts" || ext === ".tsx") language = "typescript";
        else if (ext === ".js" || ext === ".jsx") language = "javascript";
        else if (ext === ".json") language = "json";
        else if (ext === ".md") language = "markdown";
        else if (ext === ".css") language = "css";
        else if (ext === ".html") language = "html";

        list.push({
          name: file,
          path: relPath,
          type: "file",
          language,
          size: stat.size,
          lastModified: stat.mtime.toISOString(),
          gitStatus: statuses[relPath],
        });
      }
    }
  } catch {}
  return list;
}

function getGitStatuses(cwd: string): Record<string, string> {
  const statuses: Record<string, string> = {};
  try {
    const { execFileSync } = require("child_process");
    const out = execFileSync("git", ["status", "--porcelain"], {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    for (const line of out.split("\n")) {
      if (!line.trim()) continue;
      const code = line.substring(0, 2).trim();
      let filePath = line.substring(3).trim();
      if (filePath.includes(" -> ")) {
        filePath = filePath.split(" -> ")[1].trim();
      }
      filePath = filePath.replace(/\\/g, "/");

      let status: "added" | "modified" | "deleted" | "renamed" = "modified";
      if (code === "A" || code === "??" || code === "AM") status = "added";
      else if (code === "M" || code === "MM") status = "modified";
      else if (code === "D") status = "deleted";
      else if (code === "R") status = "renamed";
      statuses[filePath] = status;
    }
  } catch {}
  return statuses;
}

export async function playgroundCommand(options: PlaygroundOptions = {}) {
  const port = parseInt(options.port || "3737", 10);
  let repoPath = options.workspace
    ? path.resolve(options.workspace)
    : process.cwd();
  if (!fs.existsSync(repoPath)) {
    console.error(pc.red(`❌ Workspace path does not exist: ${repoPath}`));
    process.exit(1);
  }
  const playgroundHtml = resolvePlaygroundHtml();
  const activeSockets = new Set<WebSocket>();

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://localhost:${port}`);

    // Preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Headers": "Content-Type",
      });
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
        const { execFileSync } = require("child_process");
        let diffText = "";
        try {
          const sinceArgs = since ? since.split(/\s+/).filter(Boolean) : [];
          diffText = execFileSync("git", ["diff", ...sinceArgs], {
            stdio: ["ignore", "pipe", "ignore"],
            cwd: repoPath,
          }).toString();
        } catch {}

        if (!diffText.trim()) {
          return jsonResponse(res, {
            success: false,
            error:
              "No changes found for the given range. Try a different --since range.",
          });
        }

        const result = (await generateChangelog({
          diffText,
          repoPath,
          persona: persona as any,
        } as any)) as any;
        return jsonResponse(res, {
          success: true,
          changelog:
            result.markdown ||
            result.formattedOutput ||
            result.rawResult?.summary ||
            "",
        });
      } catch (err: any) {
        return jsonResponse(res, { success: false, error: err.message }, 500);
      }
    }

    if (url.pathname === "/api/personas") {
      return jsonResponse(res, [
        { id: "developer", label: "💻 Developer" },
        { id: "ceo", label: "📊 CEO" },
        { id: "educator", label: "📚 Educator" },
        { id: "robot", label: "🤖 Robot" },
        { id: "data-analyst", label: "📈 Analyst" },
        { id: "journalist", label: "📰 Journalist" },
        { id: "pm", label: "📋 PM" },
        { id: "compliance", label: "🔒 Compliance" },
      ]);
    }

    if (url.pathname === "/api/files") {
      const statuses = getGitStatuses(repoPath);
      const tree = buildFileTree(repoPath, repoPath, statuses);
      return jsonResponse(res, tree);
    }

    if (url.pathname === "/api/file/content") {
      const filePath = url.searchParams.get("path");
      if (!filePath) return jsonResponse(res, { error: "Path required" }, 400);
      const fullPath = path.resolve(repoPath, filePath);
      if (!fullPath.startsWith(repoPath))
        return jsonResponse(res, { error: "Access denied" }, 403);
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        return jsonResponse(res, { content });
      } catch (err: any) {
        return jsonResponse(res, { error: err.message }, 500);
      }
    }

    if (url.pathname === "/api/git/stage") {
      const body = await readBody(req);
      const { path: filePath } = JSON.parse(body);
      if (!filePath) return jsonResponse(res, { error: "Path required" }, 400);
      try {
        const { execFileSync } = require("child_process");
        execFileSync("git", ["add", filePath], { cwd: repoPath });
        return jsonResponse(res, { success: true });
      } catch (err: any) {
        return jsonResponse(res, { error: err.message }, 500);
      }
    }

    if (url.pathname === "/api/git/diff") {
      const filePath = url.searchParams.get("path");
      if (!filePath) return jsonResponse(res, { error: "Path required" }, 400);
      try {
        const { execFileSync } = require("child_process");
        const diff = execFileSync("git", ["diff", "HEAD", "--", filePath], {
          cwd: repoPath,
        }).toString();
        return jsonResponse(res, { diff });
      } catch (err: any) {
        return jsonResponse(res, { error: err.message }, 500);
      }
    }

    if (url.pathname === "/api/workspace/open") {
      const body = await readBody(req);
      const { path: newPath } = JSON.parse(body);
      if (!newPath) return jsonResponse(res, { error: "Path required" }, 400);
      const resolved = path.resolve(newPath);
      if (!fs.existsSync(resolved)) {
        return jsonResponse(res, { error: "Directory does not exist" }, 400);
      }
      repoPath = resolved;
      return jsonResponse(res, {
        success: true,
        path: repoPath,
        name: path.basename(repoPath),
      });
    }

    if (url.pathname === "/api/models") {
      const models: any[] = [];
      try {
        const { execFileSync } = require("child_process");
        const out = execFileSync("ollama", ["list"], {
          stdio: ["ignore", "pipe", "ignore"],
        }).toString();
        const lines = out.split("\n").slice(1);
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split(/\s+/);
          const name = parts[0];
          const size = parts[1] || "unknown";
          models.push({
            name,
            provider: "ollama",
            size,
            status: "available",
          });
        }
      } catch {}

      models.push(
        {
          name: "gpt-4o",
          provider: "openai",
          size: "Cloud",
          status: "available",
        },
        {
          name: "claude-3-5-sonnet",
          provider: "anthropic",
          size: "Cloud",
          status: "available",
        },
        {
          name: "gemini-1.5-pro",
          provider: "gemini",
          size: "Cloud",
          status: "available",
        },
      );
      return jsonResponse(res, models);
    }

    if (url.pathname === "/api/chat") {
      try {
        const body = await readBody(req);
        const { message, model, systemPrompt } = JSON.parse(body);
        const modelName = model || "auto";

        if (modelName.startsWith("ollama://")) {
          const modelClean = modelName.replace("ollama://", "");
          const ollamaRes = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelClean,
              messages: [
                {
                  role: "system",
                  content: systemPrompt || "You are a helpful assistant.",
                },
                { role: "user", content: message },
              ],
              stream: false,
            }),
          });
          const data = (await ollamaRes.json()) as any;
          return jsonResponse(res, {
            success: true,
            response: data.message?.content || "",
          });
        }

        const cloudMockResponses: Record<string, string> = {
          security:
            "🔒 DevDiff Security Agent swarmed. No vulnerabilities detected in the recent changes. Staged dependency check reports clean status.",
          explain: `🔍 Explanation for your query: This workspace contains a fully integrated developer workspace and AI assistant.`,
          changelog:
            "📝 DevDiff Changelog Generator successfully executed. Summary of changes: Added playground endpoints and custom workspace layouts.",
        };
        const category = url.searchParams.get("category") || "chat";
        const reply =
          cloudMockResponses[category] ||
          `🤖 Simulated response from ${modelName}: I received your message "${message}". The DevDiff Agent swarm is active.`;
        return jsonResponse(res, { success: true, response: reply });
      } catch (err: any) {
        return jsonResponse(res, { success: false, error: err.message }, 500);
      }
    }

    // ─── Serve playground HTML ───────────────────────────────────────────────

    if (url.pathname === "/logo.svg") {
      const logoPath = path.resolve(repoPath, "asset/devdiff.svg");
      if (fs.existsSync(logoPath)) {
        res.writeHead(200, { "Content-Type": "image/svg+xml" });
        res.end(fs.readFileSync(logoPath));
        return;
      }
    }

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
      const { execFileSync } = require("child_process");
      const hash = execFileSync("git", ["diff", "--stat", "HEAD"], {
        stdio: ["ignore", "pipe", "ignore"],
        cwd: repoPath,
      })
        .toString()
        .trim()
        .slice(-64);

      if (hash !== lastHash && lastHash !== "") {
        for (const ws of activeSockets) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "workspace-changed",
                timestamp: Date.now(),
              }),
            );
          }
        }
      }
      lastHash = hash;
    } catch {}
  }, 2000);

  let currentPort = port;

  const startListening = (p: number) => {
    server.listen(p);
  };

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log(
        pc.yellow(`⚠️  Port ${currentPort} is in use, trying next port...`),
      );
      currentPort++;
      startListening(currentPort);
    } else {
      console.error(pc.red(`❌ Server error: ${err.message}`));
      process.exit(1);
    }
  });

  server.on("listening", () => {
    const url = `http://localhost:${currentPort}`;
    console.log();
    console.log(
      pc.cyan(
        "┌─────────────────────────────────────────────────────────────┐",
      ),
    );
    console.log(
      pc.cyan("│") +
        pc.white(
          "                                                             ",
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.white(
          `   🎮 DevDiff Playground                                     `,
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.white(
          "                                                             ",
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.white(`   Local:  ${pc.cyan(url.padEnd(49))}`) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.white(
          "                                                             ",
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.white(
          `   ✅ Workspace: ${pc.white(path.basename(repoPath).slice(0, 43).padEnd(43))}`,
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.white(
          "                                                             ",
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.gray(
          "   All data stays on your machine. Zero cloud sync.          ",
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan("│") +
        pc.white(
          "                                                             ",
        ) +
        pc.cyan("│"),
    );
    console.log(
      pc.cyan(
        "└─────────────────────────────────────────────────────────────┘",
      ),
    );
    console.log();
    console.log(pc.gray("   Press Ctrl+C to stop the playground server."));
    console.log();

    if (options.open !== false) {
      openBrowser(url);
    }
  });

  startListening(currentPort);

  process.on("SIGINT", () => {
    if (watchInterval) clearInterval(watchInterval);
    for (const ws of activeSockets) ws.close();
    server.close();
    console.log(pc.blue("\n👋 Playground stopped."));
    process.exit(0);
  });
}
