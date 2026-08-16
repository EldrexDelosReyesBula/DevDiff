import { describe, it, expect } from "vitest";
import { PackageDiscovery } from "../src/index";
import * as path from "path";
import * as fs from "fs";

describe("DevDiff v1.7.0 — Developer Experience & Agentic Platform", () => {
  const rootDir = process.cwd().endsWith("packages\\core") || process.cwd().endsWith("packages/core")
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();

  it("discovers all workspace packages with devdiff agentic manifests", () => {
    const packages = PackageDiscovery.discover(rootDir);
    expect(packages.length).toBeGreaterThan(0);

    const corePkg = packages.find((p) => p.name === "@eldrex/core");
    expect(corePkg).toBeDefined();
    expect(corePkg?.packageType).toBe("engine");
    expect(corePkg?.capabilities).toContain("diff-parsing");
    expect(corePkg?.agentContext.purpose).toBeDefined();
    expect(corePkg?.agentContext.quickStart?.install).toBe("npm install @eldrex/core");
  });

  it("generates structured markdown documentation prompt for AI agents", () => {
    const prompt = PackageDiscovery.generateAgentPrompt(rootDir);

    expect(prompt).toContain("# DevDiff Platform — Available Packages");
    expect(prompt).toContain("## @eldrex/core (engine)");
    expect(prompt).toContain("**When to use:**");
    expect(prompt).toContain("**Key concepts:**");
    expect(prompt).toContain("**Common patterns:**");
    expect(prompt).toContain("npm install @eldrex/core");
  });
});
