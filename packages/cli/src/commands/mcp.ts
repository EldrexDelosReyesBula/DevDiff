import pc from "picocolors";
import { UniversalMCPConfig, DevDiffMCPServer, startMcpServer } from "@eldrex/mcp";

export async function mcpCommand(
  action: string,
  options: {
    ide?: string;
    all?: boolean;
    http?: boolean;
    port?: string;
  } = {},
) {
  const normalizedAction = (action || "status").toLowerCase();

  switch (normalizedAction) {
    case "install": {
      if (options.all) {
        console.log(pc.blue("🔌 Installing MCP configuration for all supported IDEs..."));
        const results = await UniversalMCPConfig.installAll(process.cwd());
        for (const res of results) {
          console.log(`   ${res}`);
        }
        console.log(pc.green("\n✅ All MCP configurations generated successfully."));
        return;
      }

      if (!options.ide) {
        console.log(pc.yellow("⚠️ Please specify an IDE or use --all:"));
        console.log("   devdiff mcp install --ide vscode");
        console.log("   devdiff mcp install --ide cursor");
        console.log("   devdiff mcp install --ide windsurf");
        console.log("   devdiff mcp install --ide antigravity");
        console.log("   devdiff mcp install --ide claude-desktop");
        console.log("   devdiff mcp install --ide jetbrains");
        console.log("   devdiff mcp install --all");
        return;
      }

      try {
        const res = await UniversalMCPConfig.install(options.ide, process.cwd());
        console.log(pc.green(res));
      } catch (err: any) {
        console.error(pc.red(`❌ Installation failed: ${err.message}`));
        process.exit(1);
      }
      break;
    }

    case "status": {
      console.log(pc.bold(pc.blue("🔌 MCP Status")));
      console.log(pc.dim("═".repeat(45)));

      const statuses = await UniversalMCPConfig.getStatus();
      for (const item of statuses) {
        if (item.configured) {
          console.log(
            `${pc.green("✅")} ${pc.bold(item.name)}: ${pc.green("Configured")} ${pc.dim(`(${item.path})`)}`,
          );
        } else {
          console.log(
            `${pc.yellow("⚠️")}  ${pc.bold(item.name)}: ${pc.dim("Not configured — run:")} ${pc.cyan(`devdiff mcp install --ide ${item.ide}`)}`,
          );
        }
      }
      console.log("");
      break;
    }

    case "test": {
      console.log(pc.blue("🔌 Testing MCP Server..."));
      const result = await DevDiffMCPServer.test(process.cwd());

      if (result.success) {
        console.log(pc.green("✅ MCP Server started successfully"));
        console.log(pc.green(`✅ ${result.toolsCount} tools registered`));
        if (result.skillDetected) {
          console.log(pc.green("✅ SKILL.md detected and loaded"));
        } else {
          console.log(pc.yellow("⚠️ No SKILL.md detected (using auto-context)"));
        }
        if (result.localModel) {
          console.log(pc.green(`✅ Local model detected (${result.localModel})`));
        } else {
          console.log(pc.dim("ℹ️ Local Ollama not running — using default providers"));
        }
      } else {
        console.error(pc.red(`❌ ${result.message}`));
        process.exit(1);
      }
      break;
    }

    case "serve": {
      console.log(pc.blue("⚡ Starting DevDiff MCP Server..."));

      try {
        const transport = options.http ? "http" : "stdio";
        const port = options.port ? parseInt(options.port, 10) : 3739;

        if (transport === "http") {
          console.log(
            pc.green(`✅ MCP Server listening on port ${port} (HTTP SSE mode)`),
          );
          await startMcpServer({ transport: "http", port });
        } else {
          console.log(pc.green("✅ MCP Server listening on stdio (stdin/stdout)"));
          await DevDiffMCPServer.start({ transport: "stdio" });
        }
      } catch (err: any) {
        console.error(pc.red(`❌ Failed to start MCP Server: ${err.message}`));
        process.exit(1);
      }
      break;
    }

    default: {
      console.log(
        pc.red(`❌ Unknown action: "${action}".`),
      );
      console.log("   Available actions: install, status, test, serve");
      console.log("   Example: devdiff mcp status");
      console.log("   Example: devdiff mcp install --all");
      console.log("   Example: devdiff mcp test");
      break;
    }
  }
}
