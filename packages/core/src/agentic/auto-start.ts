/**
 * Agentic Auto-Start
 *
 * DevDiff can auto-start when the developer opens their IDE.
 * Configurable — developers who prefer manual control can disable it.
 */

export interface AgenticConfig {
  /**
   * Auto-start DevDiff when IDE opens?
   *
   * true  = DevDiff starts automatically. AI agents can call it immediately.
   * false = Developer must run "devdiff start" or call tools manually.
   *
   * Default: true (DevDiff is designed to be invisible)
   */
  autoStart: boolean;

  /**
   * Auto-analyze on commit?
   *
   * true  = Every commit triggers changelog generation
   * false = Developer calls analyze explicitly
   */
  autoAnalyzeOnCommit: boolean;

  /**
   * Notification mode
   *
   * 'silent' = No notifications, only respond when agent asks
   * 'minimal' = Brief summary on significant changes
   * 'verbose' = Full changelog on every change
   */
  notificationMode: "silent" | "minimal" | "verbose";

  /**
   * Which AI agents are allowed to call DevDiff?
   * Empty array = all agents allowed
   */
  allowedAgents: string[]; // ['claude', 'gemini', 'copilot']

  /**
   * Maximum automatic analyses per hour
   * Prevents excessive AI usage
   */
  maxAutoAnalysesPerHour: number;
}

export const DEFAULT_AGENTIC_CONFIG: AgenticConfig = {
  autoStart: true,
  autoAnalyzeOnCommit: false, // Don't auto-analyze every commit by default
  notificationMode: "minimal",
  allowedAgents: [], // All allowed
  maxAutoAnalysesPerHour: 20,
};
