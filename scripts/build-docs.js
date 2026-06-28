const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 1. Run turbo build
console.log("Running turbo build...");
execSync("npx turbo build", { stdio: "inherit" });

// 2. Ensure docs/.vitepress/dist/demo exists
const targetDemoDir = path.join(__dirname, "../docs/.vitepress/dist/demo");
console.log(`Ensuring target demo directory exists: ${targetDemoDir}`);
fs.mkdirSync(targetDemoDir, { recursive: true });

// 3. Copy files from packages/web-dashboard/dist to docs/.vitepress/dist/demo
const sourceDir = path.join(__dirname, "../packages/web-dashboard/dist");
console.log(`Copying dashboard assets from ${sourceDir} to ${targetDemoDir}`);

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

copyFolderSync(sourceDir, targetDemoDir);
console.log("Build and merge complete!");
