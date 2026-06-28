import { execSync } from "child_process";
import { PipelineStep, ProcessorContext } from "./pipeline";

export class DiffProcessor implements PipelineStep {
  name = "diff_parser";

  async run(context: ProcessorContext, config: any): Promise<void> {
    const range = config.range || context.change_range || "";
    let gitCmd = "git diff --cached";

    if (typeof range === "string" && range.trim()) {
      gitCmd = `git diff ${range}`;
    } else if (range && typeof range === "object" && range.from && range.to) {
      gitCmd = `git diff ${range.from}..${range.to}`;
    } else if (config.fallbackToUnstaged) {
      gitCmd = "git diff";
    }

    try {
      const diffOutput = execSync(gitCmd, {
        cwd: context.repoPath,
        stdio: ["ignore", "pipe", "ignore"],
      }).toString();

      context.diffText = diffOutput;
    } catch (err: any) {
      // If git diff fails or we're not in a repo, fallback to existing diffText or error
      if (!context.diffText) {
        throw new Error(`Failed to extract diff: ${err.message}`);
      }
    }
  }
}
