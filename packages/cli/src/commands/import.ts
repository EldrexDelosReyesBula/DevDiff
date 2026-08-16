import * as fs from "fs";
import * as path from "path";
import pc from "picocolors";
import { ImportEngine } from "@eldrex/core";

export async function importCommand(
  subcommand?: string,
  targetFile?: string,
  options: Record<string, any> = {},
): Promise<void> {
  const workspacePath = process.cwd();

  // If called as devdiff import changelog [file]
  const fileArg = typeof targetFile === "string" ? targetFile : options.file;

  if (options.paste) {
    console.log(pc.cyan("📋 Importing AI response from clipboard..."));
    const result = await ImportEngine.importFromClipboard({
      format: options.format || "markdown",
      outputPath: options.output || "CHANGELOG.md",
      prepend: options.prepend !== false,
      validate: options.validate !== false,
      workspacePath,
    });

    printResult(result);
    return;
  }

  if (fileArg && fs.existsSync(path.resolve(workspacePath, fileArg))) {
    const filePath = path.resolve(workspacePath, fileArg);
    const content = fs.readFileSync(filePath, "utf-8");

    console.log(pc.cyan(`📄 Importing AI response from ${fileArg}...`));
    const result = await ImportEngine.import({
      content,
      format: options.format || "markdown",
      outputPath: options.output || "CHANGELOG.md",
      prepend: options.prepend !== false,
      validate: options.validate !== false,
      workspacePath,
    });

    printResult(result);
    return;
  }

  console.log(pc.yellow("Usage:"));
  console.log(
    "  devdiff import changelog <response.md>  " +
      pc.gray("Import from response file"),
  );
  console.log(
    "  devdiff import changelog --paste        " +
      pc.gray("Import from clipboard"),
  );
  console.log(
    "  devdiff import changelog --prepend      " +
      pc.gray("Prepend to existing CHANGELOG.md"),
  );
}

function printResult(result: any): void {
  if (result.success) {
    console.log(pc.green("✅ Changelog imported successfully!"));
    console.log(`   Saved to: ${pc.bold(result.outputPath)}`);
    console.log(
      `   Lines: ${result.lines} | Characters: ${result.characters}\n`,
    );
    console.log(pc.bold("Preview:"));
    console.log(pc.gray(result.preview));
  } else {
    console.log(pc.red(`❌ Import failed: ${result.error}`));
    if (result.issues && result.issues.length > 0) {
      console.log(pc.yellow("Validation issues:"));
      for (const issue of result.issues) {
        console.log(`  • ${issue}`);
      }
    }
  }
}
