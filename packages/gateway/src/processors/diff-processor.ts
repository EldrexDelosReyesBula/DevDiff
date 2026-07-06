import { execFileSync } from "child_process";
import { PipelineStep, ProcessorContext } from "./pipeline";

export class DiffProcessor implements PipelineStep {
  name = "diff_parser";

  async run(context: ProcessorContext, config: any): Promise<void> {
    const range = config.range || context.change_range || "";
    let args: string[] = ["diff"];

    if (typeof range === "string" && range.trim()) {
      args.push(...range.split(/\s+/).filter(Boolean));
    } else if (range && typeof range === "object" && range.from && range.to) {
      args.push(`${range.from}..${range.to}`);
    } else if (config.fallbackToUnstaged) {
      // args remains ["diff"]
    } else {
      args.push("--cached");
    }

    try {
      const diffOutput = execFileSync("git", args, {
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
