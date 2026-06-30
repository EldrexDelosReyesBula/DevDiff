import * as path from "path";
import { ShellSandbox } from "../security/shell-sandbox";

export interface WorkspaceGitInfo {
  initialized: boolean;
  commits: number;
  branches: string[];
  currentBranch: string;
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: string;
  } | null;
}

export interface WorkspaceStats {
  filesTotal: number;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  commitsAnalyzed: number;
}

export interface AIStatus {
  provider: string;
  status: "connected" | "disconnected" | "unknown";
  modelsAvailable: string[];
}

/** Returns the total commit count in the current repo. */
export async function getCommitCount(): Promise<number> {
  try {
    const out = await ShellSandbox.exec("git", ["rev-list", "--count", "HEAD"]);
    return parseInt(out.trim(), 10) || 0;
  } catch {
    return 0;
  }
}

/** Returns all local branch names. */
export async function getBranches(): Promise<string[]> {
  try {
    const out = await ShellSandbox.exec("git", [
      "branch",
      "--format=%(refname:short)",
    ]);
    return out
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Returns the name of the currently checked-out branch. */
export async function getCurrentBranch(): Promise<string> {
  try {
    const out = await ShellSandbox.exec("git", [
      "rev-parse",
      "--abbrev-ref",
      "HEAD",
    ]);
    return out.trim();
  } catch {
    return "unknown";
  }
}

/** Returns info about the latest commit. */
export async function getLastCommit(): Promise<WorkspaceGitInfo["lastCommit"]> {
  try {
    // format: hash|subject|author|date
    const out = await ShellSandbox.exec("git", [
      "log",
      "-1",
      "--format=%H|%s|%an|%ar",
    ]);
    const [hash, message, author, date] = out.trim().split("|");
    if (!hash) return null;
    return { hash: hash.slice(0, 8), message, author, date };
  } catch {
    return null;
  }
}

/** Builds the full git info object for the workspace endpoint. */
export async function getGitInfo(): Promise<WorkspaceGitInfo> {
  const [commits, branches, currentBranch, lastCommit] = await Promise.all([
    getCommitCount(),
    getBranches(),
    getCurrentBranch(),
    getLastCommit(),
  ]);
  return {
    initialized: true,
    commits,
    branches,
    currentBranch,
    lastCommit,
  };
}

/** Counts total tracked files in the repo. */
export async function getTotalFiles(): Promise<number> {
  try {
    const out = await ShellSandbox.exec("git", ["ls-files"]);
    return out.split("\n").filter(Boolean).length;
  } catch {
    return 0;
  }
}

/** Returns lines added/removed in the last N commits (default 5). */
export async function getDiffStats(range = "HEAD~5..HEAD"): Promise<{
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
}> {
  try {
    const out = await ShellSandbox.exec("git", [
      "diff",
      "--stat",
      "--numstat",
      range,
    ]);
    const lines = out.split("\n").filter(Boolean);
    let linesAdded = 0;
    let linesRemoved = 0;
    let filesChanged = 0;
    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(\d+)\s+.+$/);
      if (match) {
        linesAdded += parseInt(match[1], 10);
        linesRemoved += parseInt(match[2], 10);
        filesChanged++;
      }
    }
    return { filesChanged, linesAdded, linesRemoved };
  } catch {
    return { filesChanged: 0, linesAdded: 0, linesRemoved: 0 };
  }
}

/** Checks if Ollama is reachable on localhost. */
export async function checkAIStatus(
  ollamaHost = "http://localhost:11434",
): Promise<AIStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${ollamaHost}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("Non-200");
    const data = (await res.json()) as { models?: { name: string }[] };
    const modelsAvailable = (data.models || []).map((m) => m.name);
    return { provider: "ollama", status: "connected", modelsAvailable };
  } catch {
    return { provider: "ollama", status: "disconnected", modelsAvailable: [] };
  }
}
