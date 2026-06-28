export interface DiffLine {
  type: "addition" | "deletion" | "normal";
  content: string;
  ln1?: number; // line number in original file
  ln2?: number; // line number in modified file
}

export interface DiffHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface ParsedFileDiff {
  oldPath: string | null;
  newPath: string | null;
  isNew: boolean;
  isDeleted: boolean;
  isRename: boolean;
  hunks: DiffHunk[];
}

export interface ParseResult {
  files: ParsedFileDiff[];
  changes: {
    type: "addition" | "deletion";
    line: number;
    content: string;
  }[];
}

export const diffParser = {
  parse(diffText: string): ParseResult {
    const files: ParsedFileDiff[] = [];
    const changes: ParseResult["changes"] = [];

    const lines = diffText.split(/\r?\n/);
    let currentFile: ParsedFileDiff | null = null;
    let currentHunk: DiffHunk | null = null;

    let oldLineNum = 0;
    let newLineNum = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for file header
      if (line.startsWith("diff --git ")) {
        // Parse paths
        // e.g. diff --git a/packages/core/src/index.ts b/packages/core/src/index.ts
        const parts = line.split(" ");
        let oldPath: string | null = parts[parts.length - 2];
        let newPath: string | null = parts[parts.length - 1];

        // Strip a/ and b/ prefixes
        if (oldPath.startsWith("a/")) oldPath = oldPath.substring(2);
        if (newPath.startsWith("b/")) newPath = newPath.substring(2);

        currentFile = {
          oldPath,
          newPath,
          isNew: false,
          isDeleted: false,
          isRename: oldPath !== newPath,
          hunks: [],
        };
        files.push(currentFile);
        currentHunk = null;
        continue;
      }

      if (!currentFile) continue;

      if (line.startsWith("new file mode ")) {
        currentFile.isNew = true;
        currentFile.oldPath = null;
        continue;
      }

      if (line.startsWith("deleted file mode ")) {
        currentFile.isDeleted = true;
        currentFile.newPath = null;
        continue;
      }

      if (line.startsWith("rename from ")) {
        currentFile.isRename = true;
        continue;
      }

      // Check for hunk header
      // e.g. @@ -1,3 +1,4 @@
      if (line.startsWith("@@ ")) {
        const match = line.match(/^@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/);
        if (match) {
          const oldStart = parseInt(match[1], 10);
          const oldLines = match[2] ? parseInt(match[2], 10) : 1;
          const newStart = parseInt(match[3], 10);
          const newLines = match[4] ? parseInt(match[4], 10) : 1;

          oldLineNum = oldStart;
          newLineNum = newStart;

          currentHunk = {
            header: line,
            oldStart,
            oldLines,
            newStart,
            newLines,
            lines: [],
          };
          currentFile.hunks.push(currentHunk);
        }
        continue;
      }

      if (!currentHunk) continue;

      if (line.startsWith("+")) {
        const content = line.substring(1);
        currentHunk.lines.push({
          type: "addition",
          content,
          ln2: newLineNum,
        });
        changes.push({
          type: "addition",
          line: newLineNum,
          content,
        });
        newLineNum++;
      } else if (line.startsWith("-")) {
        const content = line.substring(1);
        currentHunk.lines.push({
          type: "deletion",
          content,
          ln1: oldLineNum,
        });
        changes.push({
          type: "deletion",
          line: oldLineNum,
          content,
        });
        oldLineNum++;
      } else if (line.startsWith(" ") || line === "") {
        const content = line.startsWith(" ") ? line.substring(1) : line;
        currentHunk.lines.push({
          type: "normal",
          content,
          ln1: oldLineNum,
          ln2: newLineNum,
        });
        oldLineNum++;
        newLineNum++;
      }
    }

    return { files, changes };
  },
};
