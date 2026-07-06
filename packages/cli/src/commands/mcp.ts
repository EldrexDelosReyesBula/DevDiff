import pc from "picocolors";

export async function mcpCommand(action: string, options: { http?: boolean; port?: string }) {
  if (action !== "serve") {
    console.log(pc.red(`❌ Unknown action: "${action}". Did you mean "serve"?`));
    return;
  }

  console.log(pc.blue("⚡ Starting DevDiff MCP Server v2.0..."));

  try {
    const { startMcpServer } = await import("@eldrex/mcp");
    const transport = options.http ? "http" : "stdio";
    const port = options.port ? parseInt(options.port) : 3739;

    if (transport === "http") {
      console.log(pc.green(`✅ MCP Server listening on port ${port} (HTTP SSE mode)`));
    } else {
      console.log(pc.green("✅ MCP Server listening on stdio (stdin/stdout)"));
    }

    await startMcpServer({ transport, port });
  } catch (err: any) {
    console.error(pc.red(`❌ Failed to start MCP Server: ${err.message}`));
    process.exit(1);
  }
}
