export interface OpenClawTriggerEvent {
  type: "git_push" | "pull_request" | "scheduled" | "manual";
  timestamp: string;
  details: any;
}

export class OpenClawTriggerEngine {
  /**
   * Transforms raw git events or schedules into standardized OpenClaw trigger runs.
   */
  static processTrigger(event: OpenClawTriggerEvent): {
    shouldRun: boolean;
    skillInputs: any;
  } {
    if (event.type === "git_push") {
      return {
        shouldRun: true,
        skillInputs: {
          repository: event.details.repoPath || ".",
          branch: event.details.branch || "main",
          since: `${event.details.before || "HEAD~1"}..${event.details.after || "HEAD"}`,
        },
      };
    }

    if (event.type === "pull_request") {
      return {
        shouldRun: true,
        skillInputs: {
          repository: event.details.repoPath || ".",
          since: `${event.details.baseSha}..${event.details.headSha}`,
          persona: "compliance",
        },
      };
    }

    // Default manuals/schedules
    return {
      shouldRun: true,
      skillInputs: {
        repository: event.details.repoPath || ".",
        since: "HEAD~1..HEAD",
      },
    };
  }
}
