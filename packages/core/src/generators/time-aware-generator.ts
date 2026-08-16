import { execSync } from "child_process";
import { generateChangelog, GenerateResult } from "./changelog";

export type TimeReference =
  | { type: "today" }
  | { type: "yesterday" }
  | { type: "this-week" }
  | { type: "last-week" }
  | { type: "this-month" }
  | { type: "specific-date"; date: string }
  | { type: "date-range"; from: string; to: string }
  | { type: "initial-commit" }
  | { type: "since-initial" }
  | { type: "last-n-days"; days: number }
  | { type: "specific-commit"; commit: string }
  | { type: "between-commits"; fromCommit: string; toCommit: string };

export class TimeAwareGenerator {
  /**
   * Generate changelog for a specific time period using actual git history
   */
  static async generate(params: {
    workspacePath: string;
    timeReference: TimeReference;
    persona?: string;
    format?: "markdown" | "json" | "html";
  }): Promise<GenerateResult> {
    const gitRange = this.resolveTimeReference(
      params.timeReference,
      params.workspacePath,
    );

    let diffText = "";
    try {
      if (gitRange.startsWith("--since")) {
        diffText = execSync(`git log -p ${gitRange}`, {
          cwd: params.workspacePath,
          encoding: "utf-8",
        });
      } else {
        diffText = execSync(`git diff ${gitRange}`, {
          cwd: params.workspacePath,
          encoding: "utf-8",
        });
      }
    } catch {
      diffText = "";
    }

    const changelog = await generateChangelog({
      diffText: diffText || "No changes detected.",
      repoPath: params.workspacePath,
      persona: params.persona || "developer",
      format: params.format || "markdown",
    });

    return changelog;
  }

  /**
   * Resolve human-friendly time references to git ranges
   */
  static resolveTimeReference(
    ref: TimeReference,
    workspacePath: string,
  ): string {
    switch (ref.type) {
      case "today":
        return this.getTodayRange();

      case "yesterday":
        return this.getYesterdayRange();

      case "this-week":
        return this.getThisWeekRange();

      case "last-week":
        return this.getLastWeekRange();

      case "this-month":
        return this.getThisMonthRange();

      case "specific-date":
        return this.getSpecificDateRange(ref.date);

      case "date-range":
        return this.getDateRange(ref.from, ref.to);

      case "initial-commit":
        return this.getInitialCommitRange(workspacePath);

      case "since-initial":
        return this.getSinceInitialRange(workspacePath);

      case "last-n-days":
        return this.getLastNDaysRange(ref.days || 7);

      case "specific-commit":
        return this.getSpecificCommitRange(ref.commit);

      case "between-commits":
        return this.getBetweenCommitsRange(ref.fromCommit, ref.toCommit);

      default:
        return "HEAD~10..HEAD";
    }
  }

  /**
   * Get all changes from today (since midnight)
   */
  private static getTodayRange(): string {
    const today = new Date();
    const midnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    return `--since="${midnight.toISOString()}"`;
  }

  /**
   * Get all changes from yesterday
   */
  private static getYesterdayRange(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );
    const yesterdayEnd = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate() + 1,
    );

    return `--since="${yesterdayStart.toISOString()}" --until="${yesterdayEnd.toISOString()}"`;
  }

  /**
   * Get changes from a specific date
   */
  private static getSpecificDateRange(date: string): string {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

    return `--since="${start.toISOString()}" --until="${end.toISOString()}"`;
  }

  /**
   * Get changes in a date range
   */
  private static getDateRange(from: string, to: string): string {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const start = new Date(
      fromDate.getFullYear(),
      fromDate.getMonth(),
      fromDate.getDate(),
    );
    const end = new Date(
      toDate.getFullYear(),
      toDate.getMonth(),
      toDate.getDate() + 1,
    );

    return `--since="${start.toISOString()}" --until="${end.toISOString()}"`;
  }

  /**
   * Get the very first commit range
   */
  private static getInitialCommitRange(workspacePath: string): string {
    try {
      const firstCommit = execSync("git rev-list --max-parents=0 HEAD", {
        cwd: workspacePath,
        encoding: "utf-8",
      }).trim();

      if (firstCommit) {
        return `${firstCommit}..HEAD`;
      }
    } catch {
      // Ignore
    }

    return "HEAD";
  }

  /**
   * Get all changes since the initial commit
   */
  private static getSinceInitialRange(workspacePath: string): string {
    try {
      const firstCommit = execSync("git rev-list --max-parents=0 HEAD", {
        cwd: workspacePath,
        encoding: "utf-8",
      }).trim();

      if (firstCommit) {
        return `${firstCommit}..HEAD`;
      }
    } catch {
      // Ignore
    }

    return "HEAD";
  }

  /**
   * Get changes from the last N days
   */
  private static getLastNDaysRange(days: number): string {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return `--since="${since.toISOString()}"`;
  }

  /**
   * Get changes for a specific commit
   */
  private static getSpecificCommitRange(commit: string): string {
    return `${commit}~1..${commit}`;
  }

  /**
   * Get changes between two commits
   */
  private static getBetweenCommitsRange(from: string, to: string): string {
    return `${from}..${to}`;
  }

  private static getThisWeekRange(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);

    return `--since="${monday.toISOString()}"`;
  }

  private static getLastWeekRange(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - dayOfWeek - 6);
    lastMonday.setHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 7);

    return `--since="${lastMonday.toISOString()}" --until="${lastSunday.toISOString()}"`;
  }

  private static getThisMonthRange(): string {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return `--since="${firstOfMonth.toISOString()}"`;
  }
}
