import { exec } from "child_process";
import { SecurityAudit } from "./security-audit";

export class ShellAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShellAccessDeniedError";
  }
}

function execAsync(
  command: string,
  args: string[],
  options: { timeout: number }
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const fullCommand = `${command} ${args.join(" ")}`.trim();
    exec(fullCommand, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

export class ShellSandbox {
  private static ALLOWED_COMMANDS = ["git", "ollama", "which", "node"];

  private static BLOCKED_PATTERNS = [
    /rm\s+-rf/,
    /sudo/,
    /curl.*\|.*sh/,
    /eval/,
    /\$\(/,
    /`/,
    /&&/,
    /\|\|/,
    /;/,
  ];

  static async exec(command: string, args: string[]): Promise<string> {
    const baseCommand = command.split(" ")[0];
    if (!this.ALLOWED_COMMANDS.includes(baseCommand)) {
      throw new ShellAccessDeniedError(
        `Command "${baseCommand}" is not in the allowed list. ` +
          `Allowed: ${this.ALLOWED_COMMANDS.join(", ")}.`
      );
    }

    const fullCommand = `${command} ${args.join(" ")}`.trim();
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (pattern.test(fullCommand)) {
        throw new ShellAccessDeniedError(
          `Command contains blocked pattern: ${pattern}. This is a security precaution.`
        );
      }
    }

    await SecurityAudit.log({
      type: "shell-access",
      command: baseCommand,
      args,
      timestamp: Date.now(),
      caller: new Error().stack?.split("\n")[2]?.trim(),
    });

    const result = await execAsync(command, args, { timeout: 30000 });
    return result.stdout;
  }

  static disable(): void {
    console.log("⚠️ Shell access disabled. Git analysis will use isomorphic-git (pure JS).");
  }
}

export const SHELL_ACCESS_CONFIG = {
  disableShellAccess: false,
  allowedShellCommands: ["git", "ollama", "which"],
  shellTimeout: 30000,
  auditShellAccess: true,
};
