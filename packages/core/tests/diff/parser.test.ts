import { describe, it, expect, beforeEach } from "vitest";
import { diffParser } from "../../src/diff/parser";

describe("DiffParser", () => {
  let parser = diffParser;

  describe("parse()", () => {
    it("parses single file change", () => {
      const diff = `diff --git a/index.js b/index.js
index 83db48f..bf2b6a1 100644
--- a/index.js
+++ b/index.js
@@ -1,3 +1,4 @@
 console.log('hello')
+console.log('world')
 const x = 1`;

      const result = parser.parse(diff);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].path).toBe("index.js");
      expect(result.files[0].additions).toBe(1);
      expect(result.files[0].deletions).toBe(0);
    });

    it("parses multiple file changes", () => {
      const diff = `diff --git a/a.js b/a.js
--- a/a.js
+++ b/a.js
@@ -1 +1 @@
-old
+new
diff --git a/b.js b/b.js
--- a/b.js
+++ b/b.js
@@ -1 +1,2 @@
 x
+y`;

      const result = parser.parse(diff);
      expect(result.files).toHaveLength(2);
      expect(result.totalAdditions).toBe(2);
      expect(result.totalDeletions).toBe(1);
    });

    it("handles empty diff", () => {
      const result = parser.parse("");
      expect(result.files).toHaveLength(0);
      expect(result.isEmpty).toBe(true);
    });

    it("handles binary file diff", () => {
      const diff = `diff --git a/image.png b/image.png
Binary files a/image.png and b/image.png differ`;

      const result = parser.parse(diff);
      expect(result.files[0].isBinary).toBe(true);
      expect(result.files[0].content).toBe("[Binary file]");
    });

    it("handles renamed file", () => {
      const diff = `diff --git a/old.js b/new.js
similarity index 100%
rename from old.js
rename to new.js`;

      const result = parser.parse(diff);
      expect(result.files[0].renamed).toBe(true);
      expect(result.files[0].oldPath).toBe("old.js");
      expect(result.files[0].newPath).toBe("new.js");
    });

    it("handles merge conflicts", () => {
      const diff = `diff --git a/file.js b/file.js
@@ -1,5 +1,10 @@
+<<<<<<< HEAD
+console.log('ours')
+=======
+console.log('theirs')
+>>>>>>> branch`;

      const result = parser.parse(diff);
      expect(result.hasConflicts).toBe(true);
    });
  });
});
