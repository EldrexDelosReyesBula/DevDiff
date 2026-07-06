import * as fs from "fs";
import * as path from "path";
import pc from "picocolors";

export async function checkForESMSyntax(rootPath: string): Promise<boolean> {
  const configPath = path.join(rootPath, ".devdiff.config.js");
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, "utf-8");
    if (content.includes("export default") || content.includes("import ")) {
      return true;
    }
  }
  return false;
}

export async function doctorCommand(options: { fix?: boolean }) {
  const pkgPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.log(pc.yellow("⚠️ package.json not found in current directory."));
    return;
  }

  try {
    const pkgContent = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

    if (!pkg.type) {
      console.log(
        pc.yellow(
          '⚠️ Missing "type": "module" in package.json. This can cause ESM import warnings.',
        ),
      );

      const hasESMImports = await checkForESMSyntax(process.cwd());
      if (hasESMImports || options.fix) {
        if (options.fix) {
          pkg.type = "module";
          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
          console.log(pc.green('✅ Added "type": "module" to package.json.'));
        } else {
          console.log(
            pc.blue(
              '💡 Run "devdiff doctor --fix" to automatically resolve this issue.',
            ),
          );
        }
      }
    } else if (pkg.type === "module") {
      console.log(pc.green('✅ package.json has "type": "module".'));
    } else {
      console.log(
        pc.yellow(
          `⚠️ package.json has "type" set to "${pkg.type}". DevDiff recommends ES Modules.`,
        ),
      );
    }
  } catch (err: any) {
    console.error(pc.red(`❌ Error checking package.json: ${err.message}`));
  }
}
