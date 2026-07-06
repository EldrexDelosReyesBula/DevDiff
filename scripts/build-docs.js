const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 1. Run turbo build
console.log("Running turbo build...");
execSync("npx turbo build --force", { stdio: "inherit" });

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

// 4. Copy playground.html directly to root for https://devdiff.vercel.app/playground
const targetPlaygroundPath = path.join(__dirname, "../docs/.vitepress/dist/playground.html");
console.log(`Copying playground.html to docs root: ${targetPlaygroundPath}`);
if (fs.existsSync(path.join(sourceDir, "playground.html"))) {
  fs.copyFileSync(path.join(sourceDir, "playground.html"), targetPlaygroundPath);
}

console.log("Build and merge complete!");
