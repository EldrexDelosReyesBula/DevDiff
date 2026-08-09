import * as fs from "fs";
import * as path from "path";
import { LowEndOptimizer } from "../performance/low-end-optimizer";

export interface Schedule {
  id: string;
  name: string;
  cron: string;
  action:
    | "generate"
    | "security-scan"
    | "compliance-report"
    | "context-refresh"
    | "mvp-process";
  config: Record<string, any>;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runIfIdle?: boolean;
  runOnBattery?: boolean;
  retryOnFailure?: boolean;
  notifyOnCompletion?: string[];
}

export class BackgroundScheduler {
  private workspaceRoot: string;
  private schedulePath: string;
  private schedules: Map<string, Schedule> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private isIdle: boolean = true;
  private idleTimer: NodeJS.Timeout | null = null;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.schedulePath = path.join(
      this.workspaceRoot,
      ".devdiff",
      "schedules.json",
    );
  }

  async initialize(): Promise<void> {
    const devdiffDir = path.join(this.workspaceRoot, ".devdiff");
    if (!fs.existsSync(devdiffDir)) {
      fs.mkdirSync(devdiffDir, { recursive: true });
    }

    if (fs.existsSync(this.schedulePath)) {
      try {
        const stored: Schedule[] = JSON.parse(
          fs.readFileSync(this.schedulePath, "utf-8"),
        );
        stored.forEach((s) => this.schedules.set(s.id, s));
      } catch (e) {
        // ignore error
      }
    }

    if (this.schedules.size === 0) {
      this.addSchedule({
        id: "morning-standup",
        name: "Morning Standup Digest",
        cron: "0 8 * * 1-5",
        action: "generate",
        config: { since: "24h", persona: "pm" },
        enabled: true,
        runOnBattery: false,
        retryOnFailure: true,
      });

      this.addSchedule({
        id: "weekly-security",
        name: "Weekly Security Audit",
        cron: "0 9 * * 1",
        action: "security-scan",
        config: { threshold: "medium" },
        enabled: true,
        runOnBattery: false,
      });
    }

    this.start();
  }

  addSchedule(schedule: Schedule): void {
    schedule.nextRun = this.calculateNextRun();
    this.schedules.set(schedule.id, schedule);
    this.save();
  }

  removeSchedule(id: string): boolean {
    const deleted = this.schedules.delete(id);
    if (deleted) this.save();
    return deleted;
  }

  enableSchedule(id: string, enabled: boolean): boolean {
    const schedule = this.schedules.get(id);
    if (!schedule) return false;
    schedule.enabled = enabled;
    this.save();
    return true;
  }

  listSchedules(): Schedule[] {
    return Array.from(this.schedules.values()).map((s) => ({
      ...s,
      nextRun: this.calculateNextRun(),
    }));
  }

  start(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 60000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  trackIdle(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.isIdle = false;
    this.idleTimer = setTimeout(() => {
      this.isIdle = true;
    }, 300000);
  }

  private tick(): void {
    const profile = LowEndOptimizer.detect();
    if (profile.onBattery) return;
    if (profile.thermalState === "critical" || profile.thermalState === "hot")
      return;

    // Background iteration tick
  }

  private save(): void {
    const data = Array.from(this.schedules.values());
    fs.writeFileSync(this.schedulePath, JSON.stringify(data, null, 2), "utf-8");
  }

  private calculateNextRun(): string {
    return new Date(Date.now() + 3600000).toISOString();
  }
}
