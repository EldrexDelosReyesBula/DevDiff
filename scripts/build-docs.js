const { execSync } = require("child_process");

// Run turbo build for docs and packages
console.log("Running turbo build...");
execSync("npx turbo build --force", { stdio: "inherit" });

console.log("Documentation build complete!");
