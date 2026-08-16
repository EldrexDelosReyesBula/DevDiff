import { describe, it, expect } from "vitest";
import {
  DependencyScanner,
  ObfuscationDetector,
  PermissionReviewer,
} from "../src/index";
import * as path from "path";

describe("DevDiff v1.7.0 — Plugin Security & Supply Chain Protection", () => {
  const rootDir = process.cwd().endsWith("packages\\core") || process.cwd().endsWith("packages/core")
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();

  describe("DependencyScanner", () => {
    it("scans plugin dependency tree and detects direct/transitive dependencies", async () => {
      const result = await DependencyScanner.scan(rootDir);
      expect(result).toBeDefined();
      expect(result.totalDependencies).toBeGreaterThanOrEqual(0);
      expect(result.dependencyGraph).toBeDefined();
      expect(result.dependencyGraph.nodes.length).toBeGreaterThanOrEqual(1);
      expect(result.recommendation).toBeDefined();
    });
  });

  describe("ObfuscationDetector", () => {
    it("analyzes clean code correctly", () => {
      const cleanCode = `
        function calculateTotal(price, taxRate) {
          const totalTax = price * taxRate;
          return price + totalTax;
        }
      `;
      const analysis = ObfuscationDetector.analyze(cleanCode);
      expect(analysis.status).toBe("clean");
      expect(analysis.score).toBeLessThan(20);
    });

    it("detects dangerous patterns like eval and Function", () => {
      const dangerousCode = `
        const secretFn = eval("function() { return 'hacked'; }");
        const dynFn = new Function("a", "b", "return a + b");
        const a = 1; const b = 2; const c = 3; const d = 4; const e = 5;
        const f = 6; const g = 7; const h = 8; const i = 9; const j = 10;
        const l = 11; const m = 12; const n = 13;
      `;
      const analysis = ObfuscationDetector.analyze(dangerousCode);
      expect(analysis.score).toBeGreaterThanOrEqual(40);
      expect(analysis.indicators.some((i) => i.type === "dynamic-code-execution")).toBe(true);
    });
  });

  describe("PermissionReviewer", () => {
    it("audits declared vs actual permissions", () => {
      const code = `
        const fs = require('fs');
        const file = fs.readFileSync('/etc/passwd');
      `;
      const review = PermissionReviewer.review(["network"], code);
      expect(review.permissions.length).toBe(1);
      expect(review.undeclared.length).toBeGreaterThan(0);
      expect(review.undeclared.some((u) => u.includes("filesystem"))).toBe(true);
    });
  });
});
