import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import { ASTFingerprintExtractor } from "../src/diff/similarity/ast-fingerprint";
import { FilePairPrefilter } from "../src/diff/prefilter";
import { GitNativeDetector } from "../src/git/native-detection";
import { ImportResolver } from "../src/diff/import-resolver";
import { FileRelationshipDetectorV2, FileChange } from "../src/diff/relationship-detector-v2";
import { DeepContext } from "../src/context/deep-indexer";

vi.mock("child_process", async (importOriginal) => {
  const original = await importOriginal<typeof import("child_process")>();
  return {
    ...original,
    execSync: vi.fn(),
  };
});

vi.mock("fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("fs")>();
  return {
    ...original,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    statSync: vi.fn(),
  };
});

describe("ASTFingerprintExtractor", () => {
  it("extracts code characteristics and exports", () => {
    const code = `
      import { something } from "./other";
      export class MyService {
        constructor() {}
      }
      export function fetchUser(id: string) {
        return id;
      }
      const useAuth = () => {};
      const MY_CONST = 123;
    `;

    const print = ASTFingerprintExtractor.extract(code);
    expect(print.classes).toContain("MyService");
    expect(print.functions).toContain("fetchUser");
    expect(print.imports).toContain("./other");
    expect(print.fileSize).toBe(11);
  });

  it("calculates similarity scores with correct weights", () => {
    const a = ASTFingerprintExtractor.extract(`
      export class MyService {
        constructor() {}
      }
      export function fetchUser(id: string) {}
    `);

    const b = ASTFingerprintExtractor.extract(`
      export class MyService {
        constructor() {}
      }
      export function fetchUser(id: string) {}
    `);

    expect(ASTFingerprintExtractor.similarity(a, b)).toBe(1);
  });
});

describe("FilePairPrefilter", () => {
  it("identifies viable file pairs", () => {
    const deleted: FileChange = {
      path: "src/utils/format.js",
      status: "deleted",
      oldContent: "line1\nline2\nline3\nline4\nline5",
    };

    const addedSameType: FileChange = {
      path: "src/utils/format.ts", // JS->TS Migration
      status: "added",
      content: "line1\nline2\nline3\nline4\nline5\nline6",
    };

    const addedDifferentType: FileChange = {
      path: "src/utils/format.py",
      status: "added",
      content: "line1\nline2\nline3",
    };

    expect(FilePairPrefilter.isViablePair(deleted, addedSameType)).toBe(true);
    expect(FilePairPrefilter.isViablePair(deleted, addedDifferentType)).toBe(false);
  });
});

describe("GitNativeDetector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses native rename statuses", async () => {
    const execMock = vi.mocked(child_process.execSync);
    execMock.mockReturnValue(
      "R100\told_file.ts\tnew_file.ts\nC80\toriginal.ts\tcopy.ts\nM\tmodified.ts"
    );

    const diff = await GitNativeDetector.getDiffWithRenames("/mock/repo");
    expect(diff.renames).toHaveLength(1);
    expect(diff.renames[0]).toEqual({
      oldPath: "old_file.ts",
      newPath: "new_file.ts",
      similarity: 100,
    });
    expect(diff.copies).toHaveLength(1);
    expect(diff.files).toHaveLength(1);
  });

  it("checks deprecation logs", async () => {
    const execMock = vi.mocked(child_process.execSync);
    // First exec for log search, second for git show
    execMock
      .mockReturnValueOnce("hash123 2026-06-30 deprecate class\n")
      .mockReturnValueOnce("something\n@deprecated Use NewService instead\n");

    const history = await GitNativeDetector.checkDeprecationHistory(
      "/mock/repo",
      "old_file.ts"
    );
    expect(history.wasDeprecated).toBe(true);
    expect(history.deprecatedMessage).toBe("Use NewService instead");
  });
});

describe("ImportResolver", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves relative paths and alias configurations", () => {
    const existsMock = vi.mocked(fs.existsSync);
    const readMock = vi.mocked(fs.readFileSync);
    const statMock = vi.mocked(fs.statSync);

    existsMock.mockReturnValue(true);
    statMock.mockReturnValue({ isFile: () => true } as any);
    readMock.mockReturnValue(
      JSON.stringify({
        compilerOptions: {
          paths: {
            "@utils/*": ["src/utils/*"],
          },
        },
      })
    );

    const resolver = new ImportResolver("/mock/root");
    const resolved = resolver.resolveToWorkspacePath("@utils/format", "/mock/root/src/index.ts");
    expect(resolved).toContain(path.normalize("/mock/root/src/utils/format"));
  });

  it("finds dangling references from changed files list", () => {
    const existsMock = vi.mocked(fs.existsSync);
    const statMock = vi.mocked(fs.statSync);
    existsMock.mockReturnValue(true);
    statMock.mockReturnValue({ isFile: () => true } as any);

    const resolver = new ImportResolver("/mock/root");
    vi.spyOn(resolver, "resolveToWorkspacePath").mockReturnValue("/mock/root/src/utils/format.ts");

    const changedFiles = new Map<string, string>();
    changedFiles.set(
      "/mock/root/src/index.ts",
      "import { format } from './utils/format';\nconsole.log(format);"
    );

    const references = resolver.findDanglingReferences(
      "/mock/root/src/utils/format.ts",
      changedFiles
    );
    expect(references).toContain("/mock/root/src/index.ts");
  });
});

describe("FileRelationshipDetectorV2", () => {
  const mockContext: DeepContext = {
    generatedAt: new Date().toISOString(),
    repositorySize: { files: 5, lines: 100, directories: 1, languages: {} },
    structure: { rootDirectories: [], keyEntryPoints: [], testDirectories: [], configFiles: [] },
    dependencies: { runtime: [], devDependencies: [], peerDependencies: [], detectedFrameworks: [] },
    patterns: { namingConventions: [], commonPrefixes: [], monorepo: false, workspacePackages: [] },
    git: {
      totalCommits: 10,
      activeBranch: "main",
      branches: 1,
      contributors: 1,
      firstCommit: "",
      lastCommit: "",
      releaseTags: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs full analysis pipeline successfully", async () => {
    const execMock = vi.mocked(child_process.execSync);
    execMock.mockReturnValue(""); // No native renames

    const resolver = new ImportResolver("/mock/root");
    const detector = new FileRelationshipDetectorV2("/mock/root", resolver, mockContext);

    const changes: FileChange[] = [
      {
        path: "src/old.ts",
        status: "deleted",
        oldContent: "export class OldUser {\n  id: string;\n  name: string;\n}",
      },
      {
        path: "src/new.ts",
        status: "added",
        content: "export class OldUser {\n  id: string;\n  name: string;\n}",
      },
    ];

    const results = await detector.analyze(changes);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe("refactor");
    expect(results[0].primaryFile).toBe("src/new.ts");
    expect(results[0].relatedFiles).toContain("src/old.ts");
  });
});
