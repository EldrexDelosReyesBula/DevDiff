import * as fs from "fs/promises";
import * as path from "path";
import pc from "picocolors";
import {
  loadConfig,
  COMPLIANCE_FRAMEWORKS,
  applyCompliance,
  DevDiffConfig,
} from "@eldrex/core";

export async function saveConfig(config: any) {
  const configPath = path.resolve(process.cwd(), ".devdiff.config.js");
  const content = `// DevDiff Configuration
// Automatically updated by DevDiff compliance command

export default ${JSON.stringify(config, null, 2)};
`;
  await fs.writeFile(configPath, content, "utf-8");
}

export async function applyComplianceCommand(frameworkId: string) {
  try {
    const config = await loadConfig();
    const updatedConfig = await applyCompliance(frameworkId, config);
    await saveConfig(updatedConfig);
    console.log(
      pc.green(
        `\n🔒 Compliance framework '${frameworkId}' applied and config saved successfully.`,
      ),
    );
  } catch (error: any) {
    console.error(pc.red(`\n❌ Error applying compliance: ${error.message}`));
    process.exit(1);
  }
}

export async function statusComplianceCommand() {
  try {
    const config = await loadConfig();
    console.log(pc.blue("\n🔒 Checking current compliance status..."));

    let isFullyCompliant = true;
    for (const [id, frameworkData] of Object.entries(COMPLIANCE_FRAMEWORKS)) {
      const framework = frameworkData as any;
      const match = checkFrameworkMatch(config, framework.autoConfig);
      const statusText = match
        ? pc.green("COMPLIANT")
        : pc.red("NOT COMPLIANT");
      console.log(
        `- ${pc.bold(framework.name)} (${framework.jurisdiction}): ${statusText}`,
      );
      if (!match) {
        isFullyCompliant = false;
      }
    }
  } catch (error: any) {
    console.error(pc.red(`\n❌ Error checking status: ${error.message}`));
    process.exit(1);
  }
}

export async function validateComplianceCommand(frameworksStr: string) {
  try {
    const config = await loadConfig();
    const frameworkIds = frameworksStr
      .split(",")
      .map((f) => f.trim().toLowerCase());

    console.log(
      pc.blue(
        `\n🔒 Validating configuration against frameworks: ${frameworksStr}...`,
      ),
    );

    let allValid = true;
    for (const id of frameworkIds) {
      let resolvedId = id;
      if (
        id === "australian privacy act 1988" ||
        id === "australian privacy act" ||
        id === "australia"
      ) {
        resolvedId = "australia_privacy";
      }
      const framework = COMPLIANCE_FRAMEWORKS[resolvedId];
      if (!framework) {
        console.log(pc.yellow(`⚠️ Unknown framework: ${id}`));
        allValid = false;
        continue;
      }

      const missingKeys = getMissingKeys(config, framework.autoConfig);
      if (missingKeys.length === 0) {
        console.log(pc.green(`✅ ${framework.name} compliance: VALID`));
      } else {
        console.log(pc.red(`❌ ${framework.name} compliance: INVALID`));
        console.log(pc.red(`   Missing / Mismatched configs:`));
        for (const k of missingKeys) {
          console.log(pc.red(`     - ${k}`));
        }
        allValid = false;
      }
    }

    if (!allValid) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error(pc.red(`\n❌ Error validating: ${error.message}`));
    process.exit(1);
  }
}

export async function reportComplianceCommand(options: {
  format: string;
  output: string;
}) {
  try {
    const config = await loadConfig();
    console.log(
      pc.blue(
        `\n🔒 Generating audit-ready compliance report in '${options.format}' format...`,
      ),
    );

    let reportText = `DEVDIFF COMPLIANCE AUDIT REPORT\nGenerated: ${new Date().toISOString()}\n\n`;

    for (const [id, frameworkData] of Object.entries(COMPLIANCE_FRAMEWORKS)) {
      const framework = frameworkData as any;
      const match = checkFrameworkMatch(config, framework.autoConfig);
      reportText += `Framework: ${framework.name} (${framework.jurisdiction})\n`;
      reportText += `Status: ${match ? "COMPLIANT" : "NON-COMPLIANT"}\n`;
      if (!match) {
        reportText += `Mismatched configurations:\n`;
        const missing = getMissingKeys(config, framework.autoConfig);
        for (const m of missing) {
          reportText += `  - ${m}\n`;
        }
      }
      reportText += `\n`;
    }

    const outPath = path.resolve(process.cwd(), options.output);
    await fs.mkdir(path.dirname(outPath), { recursive: true });

    if (options.format.toLowerCase() === "pdf") {
      const pdfBuffer = generateBasicPDF(reportText);
      await fs.writeFile(outPath, pdfBuffer);
    } else {
      await fs.writeFile(outPath, reportText, "utf-8");
    }

    console.log(pc.green(`✅ Compliance report written to: ${outPath}`));
  } catch (error: any) {
    console.error(pc.red(`\n❌ Error generating report: ${error.message}`));
    process.exit(1);
  }
}

export function listComplianceCommand() {
  console.log(pc.blue("\n🌍 Supported compliance frameworks:"));
  console.log("┌──────────────────┬──────────────────────────────────────┐");
  console.log("│ GDPR             │ European Union + EEA                 │");
  console.log("│ CCPA/CPRA        │ California, USA                      │");
  console.log("│ HIPAA            │ United States (Healthcare)           │");
  console.log("│ SOC 2 Type II    │ Global (Service Organizations)       │");
  console.log("│ FedRAMP          │ United States (Federal Government)   │");
  console.log("│ ISO/IEC 27001    │ Global                               │");
  console.log("│ PIPEDA           │ Canada                               │");
  console.log("│ LGPD             │ Brazil                               │");
  console.log("│ PDPA             │ Singapore                            │");
  console.log("│ Australian Act   │ Australia                            │");
  console.log("└──────────────────┴──────────────────────────────────────┘");
}

function checkFrameworkMatch(config: any, autoConfig: any): boolean {
  for (const [key, val] of Object.entries(autoConfig)) {
    if (!config || !(key in config)) return false;
    if (val instanceof Object && !Array.isArray(val)) {
      if (!checkFrameworkMatch(config[key], val)) return false;
    } else {
      if (JSON.stringify(config[key]) !== JSON.stringify(val)) return false;
    }
  }
  return true;
}

function getMissingKeys(config: any, autoConfig: any, prefix = ""): string[] {
  const missing: string[] = [];
  for (const [key, val] of Object.entries(autoConfig)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!config || !(key in config)) {
      missing.push(`${fullKey} (expected: ${JSON.stringify(val)})`);
    } else if (val instanceof Object && !Array.isArray(val)) {
      missing.push(...getMissingKeys(config[key], val, fullKey));
    } else if (JSON.stringify(config[key]) !== JSON.stringify(val)) {
      missing.push(
        `${fullKey} (expected: ${JSON.stringify(val)}, got: ${JSON.stringify(config[key])})`,
      );
    }
  }
  return missing;
}

function generateBasicPDF(text: string): Buffer {
  const sanitizedText = text.replace(/[\(\)]/g, "\\$&"); // Escape parenthesis in PDF tj
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length ${sanitizedText.length + 100} >>
stream
BT
/F1 10 Tf
50 720 Td
12 TL
${sanitizedText
  .split("\n")
  .map((line) => `(${line}) Tj T*`)
  .join("\n")}
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000244 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
400
%%EOF
`;
  return Buffer.from(content, "utf-8");
}

export async function complianceCommand(
  action: string,
  options?: { framework?: string },
) {
  if (action === "apply") {
    if (!options?.framework) {
      console.log(
        pc.red("❌ Missing framework option. Use -f or --framework."),
      );
      return;
    }
    await applyComplianceCommand(options.framework);
  } else if (action === "status") {
    await statusComplianceCommand();
  } else if (action === "report") {
    await reportComplianceCommand({
      format: "txt",
      output: "compliance-report.txt",
    });
  } else if (action === "list") {
    listComplianceCommand();
  } else {
    console.log(
      pc.red(
        `❌ Unknown action: ${action}. Use apply, status, report, or list.`,
      ),
    );
  }
}
