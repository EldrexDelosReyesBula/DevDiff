import { diffParser, SecretScanner } from "../packages/core/dist/index.js";
import { execSync } from "child_process";
import * as fs from "fs";

try {
  const since = process.argv[2] || "HEAD~1";
  console.log(`🔍 Scanning diff for range: ${since}`);

  const diffText = execSync(`git diff ${since}`, { encoding: "utf-8" });

  const parserResult = diffParser.parse(diffText);
  const scanner = new SecretScanner();

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  const findings = [];

  for (const file of parserResult.files) {
    const filePath = file.path || file.newPath || file.oldPath || "unknown";
    if (file.hunks) {
      for (const hunk of file.hunks) {
        for (const line of hunk.lines) {
          if (line.type === "addition") {
            const matches = scanner.scan(line.content);
            for (const match of matches) {
              findings.push({
                file: filePath,
                name: match.name,
                severity: match.severity,
                content: line.content.trim(),
              });
              if (match.severity === "critical") criticalCount++;
              else if (match.severity === "high") highCount++;
              else if (match.severity === "medium") mediumCount++;
            }
          }
        }
      }
    }
  }

  console.log(`\nScan results:`);
  console.log(`- Critical: ${criticalCount}`);
  console.log(`- High: ${highCount}`);
  console.log(`- Medium: ${mediumCount}`);

  if (findings.length > 0) {
    console.log(`\nFindings details:`);
    for (const f of findings) {
      console.log(
        `[${f.severity.toUpperCase()}] ${f.file}: ${f.name} - "${f.content}"`,
      );
    }
  }

  // Output to GITHUB_OUTPUT for workflow steps
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `critical=${criticalCount}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `high=${highCount}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `medium=${mediumCount}\n`);
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `report-url=https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}\n`,
    );
  }
} catch (err) {
  console.error("Security scan failed:", err);
  process.exit(1);
}
