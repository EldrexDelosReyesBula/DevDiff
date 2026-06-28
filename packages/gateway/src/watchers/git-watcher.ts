import { EventEmitter } from "events";
import { execSync } from "child_process";

export interface GitWatcherConfig {
  path: string;
  pollIntervalMs?: number;
  watchBranches?: string[];
}

export class GitWatcher extends EventEmitter {
  private path: string;
  private pollIntervalMs: number;
  private watchBranches: string[];
  private timer: NodeJS.Timeout | null = null;
  private lastCommitHash: Map<string, string> = new Map();

  constructor(config: GitWatcherConfig) {
    super();
    this.path = config.path;
    this.pollIntervalMs = config.pollIntervalMs || 30000;
    this.watchBranches = config.watchBranches || ["main"];
  }

  start() {
    // Perform initial state check
    for (const branch of this.watchBranches) {
      try {
        const hash = this.getLatestCommit(branch);
        this.lastCommitHash.set(branch, hash);
      } catch (err) {
        // Branch might not exist yet, set empty
        this.lastCommitHash.set(branch, "");
      }
    }

    this.timer = setInterval(() => this.poll(), this.pollIntervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getLatestCommit(branch: string): string {
    return execSync(`git rev-parse ${branch}`, {
      cwd: this.path,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  }

  private poll() {
    for (const branch of this.watchBranches) {
      try {
        const currentHash = this.getLatestCommit(branch);
        const lastHash = this.lastCommitHash.get(branch);

        if (lastHash && currentHash !== lastHash) {
          this.emit("commit", {
            branch,
            from: lastHash,
            to: currentHash,
            repository: this.path,
          });
          this.lastCommitHash.set(branch, currentHash);
        }
      } catch (err) {
        // Silent catch for git failures (e.g. repo lock)
      }
    }
  }
}
