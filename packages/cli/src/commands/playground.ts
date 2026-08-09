import pc from "picocolors";

export interface PlaygroundOptions {
  port?: string;
  open?: boolean;
  workspace?: string;
}

export async function playgroundCommand(options: PlaygroundOptions = {}) {
  console.log(
    `\n${pc.cyan("[lucide:monitor]")} ${pc.bold("DevDiff IDE Integration")}`,
  );
  console.log(`──────────────────────────────────────────────`);
  console.log(`DevDiff operates 100% natively inside your IDE.`);
  console.log(
    `Web browser playground is deprecated in favor of native IDE extension panels, MCP server, and terminal commands.\n`,
  );
  console.log(
    `  • ${pc.bold("VS Code Extension:")} Open DevDiff side panel in VS Code`,
  );
  console.log(
    `  • ${pc.bold("MCP Server:")} Run ${pc.cyan("devdiff mcp start")} for Cursor/VS Code AI integration`,
  );
  console.log(
    `  • ${pc.bold("CLI Memory & Q&A:")} Run ${pc.cyan('devdiff ask "<question>"')}`,
  );
  console.log(
    `  • ${pc.bold("Version & Release:")} Run ${pc.cyan("devdiff version bump")} or ${pc.cyan("devdiff release")}\n`,
  );
}
