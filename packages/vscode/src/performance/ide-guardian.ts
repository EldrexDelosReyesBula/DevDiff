import * as vscode from "vscode";

export interface HealthStatus {
  canProcess: boolean;
  reason?: string;
  memoryMB: number;
}

export class IDEGuardian {
  private static readonly MAX_MEMORY_MB = 256;
  private static readonly IDLE_TIMEOUT_MS = 5000; // 5s typing inactivity = idle
  private static isIdle = true;
  private static idleTimer: NodeJS.Timeout | null = null;
  private static activeOperationsCount = 0;

  /**
   * Run heavy task with safety timeout and health checks so the main thread never freezes
   */
  static async runTask<T>(
    taskName: string,
    operation: () => Promise<T>,
    timeoutMs = 120000
  ): Promise<T> {
    const health = this.checkHealth();
    if (!health.canProcess) {
      const msg = `DevDiff paused — ${health.reason}`;
      vscode.window.showWarningMessage(msg);
      throw new Error(msg);
    }

    this.activeOperationsCount++;

    return new Promise<T>(async (resolve, reject) => {
      const timer = setTimeout(() => {
        this.activeOperationsCount--;
        reject(new Error(`DevDiff task '${taskName}' timed out after ${timeoutMs / 1000}s`));
      }, timeoutMs);

      try {
        const result = await operation();
        clearTimeout(timer);
        this.activeOperationsCount--;
        resolve(result);
      } catch (err) {
        clearTimeout(timer);
        this.activeOperationsCount--;
        reject(err);
      }
    });
  }

  /**
   * Check system health — memory usage & activity state
   */
  static checkHealth(): HealthStatus {
    const memory = process.memoryUsage();
    const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);

    if (memoryMB > this.MAX_MEMORY_MB) {
      return {
        canProcess: false,
        reason: `Memory ceiling reached (${memoryMB}MB / ${this.MAX_MEMORY_MB}MB max)`,
        memoryMB,
      };
    }

    if (!this.isIdle && this.activeOperationsCount > 2) {
      return {
        canProcess: false,
        reason: "User is actively typing — pausing background processing",
        memoryMB,
      };
    }

    return { canProcess: true, memoryMB };
  }

  /**
   * Track editor activity (typing / scrolling)
   */
  static trackActivity() {
    this.isIdle = false;
    if (this.idleTimer) clearTimeout(this.idleTimer);

    this.idleTimer = setTimeout(() => {
      this.isIdle = true;
    }, this.IDLE_TIMEOUT_MS);
  }

  static dispose() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.activeOperationsCount = 0;
  }
}
