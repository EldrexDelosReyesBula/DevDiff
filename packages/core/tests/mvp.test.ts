import { describe, it, expect } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { MVPDetector } from "../src/mvp/detector";
import { MVPStorage, MVPEntry } from "../src/mvp/storage";
import { ParseResult } from "../src/diff/parser";

describe("MVPDetector", () => {
  it("triggers shouldUseMVP when character threshold is exceeded", () => {
    const config = {
      mvp: { charThreshold: 10, fileThreshold: 5 },
      exclude: [],
      cache: { enabled: true, path: "" },
      format: "markdown" as const,
    };
    
    // Length is 14 (> 10)
    expect(MVPDetector.shouldUseMVP("diff --git a b", config as any)).toBe(true);

    // Length is 5 (< 10)
    expect(MVPDetector.shouldUseMVP("short", config as any)).toBe(false);
  });

  it("triggers shouldUseMVP when file threshold is exceeded", () => {
    const config = {
      mvp: { charThreshold: 1000, fileThreshold: 2 },
      exclude: [],
      cache: { enabled: true, path: "" },
      format: "markdown" as const,
    };

    const diffText = `
diff --git a/file1.ts b/file1.ts
diff --git a/file2.ts b/file2.ts
diff --git a/file3.ts b/file3.ts
    `.trim();

    expect(MVPDetector.shouldUseMVP(diffText, config as any)).toBe(true);
  });

  it("builds correct template summary from parsed diff", () => {
    const parsedDiff: ParseResult = {
      files: [
        {
          oldPath: "src/file1.ts",
          newPath: "src/file1.ts",
          isNew: false,
          isDeleted: false,
          isRenamed: false,
          hunks: [
            {
              header: "@@ -1,3 +1,4 @@",
              lines: [
                { type: "addition", content: "+ added line", lineNumber: 1 },
                { type: "deletion", content: "- removed line", lineNumber: 2 },
              ],
            },
          ],
        },
        {
          oldPath: "packages/core/src/file2.ts",
          newPath: "packages/core/src/file2.ts",
          isNew: false,
          isDeleted: false,
          isRenamed: false,
          hunks: [
            {
              header: "@@ -1,3 +1,4 @@",
              lines: [
                { type: "addition", content: "+ line 1", lineNumber: 1 },
                { type: "addition", content: "+ line 2", lineNumber: 2 },
                { type: "addition", content: "+ line 3", lineNumber: 3 },
              ],
            },
          ],
        },
      ],
      changes: [],
    } as unknown as ParseResult;

    const summary = MVPDetector.buildTemplateSummary(parsedDiff);
    expect(summary.filesCount).toBe(2);
    expect(summary.additions).toBe(4);
    expect(summary.deletions).toBe(1);
    expect(summary.directoriesCount).toBe(2); // src, packages/core/src
    expect(summary.largestChangeFile).toBe("packages/core/src/file2.ts");
  });
});

describe("MVPStorage", () => {
  const tmpDir = path.resolve(process.cwd(), ".test-mvp-storage-tmp");

  it("saves, lists, and processes entries", async () => {
    await fs.mkdir(tmpDir, { recursive: true });

    const entry: MVPEntry = {
      id: "mvp-test-001",
      timestamp: new Date().toISOString(),
      status: "queued",
      change_range: {
        from: "HEAD",
        to: "staged",
        commits: 1,
        files: 1,
        additions: 1,
        deletions: 0,
      },
      template_summary: "Test entry",
      diff_snapshot: Buffer.from("diff --git a b").toString("base64"),
      retry_count: 0,
      max_retries: 3,
    };

    await MVPStorage.saveMVP(tmpDir, entry);

    const list = await MVPStorage.listMVP(tmpDir);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("mvp-test-001");

    // Clean up
    await MVPStorage.clearMVP(tmpDir, true);
    const emptyList = await MVPStorage.listMVP(tmpDir);
    expect(emptyList.length).toBe(0);

    await fs.rm(tmpDir, { recursive: true, force: true });
  });
});
