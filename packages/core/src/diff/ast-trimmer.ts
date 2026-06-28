import * as ts from "typescript";
import * as path from "path";

export interface TextSpan {
  start: number;
  end: number;
  replacement: string;
}

export function trimAST(
  filename: string,
  code: string,
  changedLines: number[],
): string {
  const ext = path.extname(filename).toLowerCase();
  const isJSorTS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext);

  if (!isJSorTS || changedLines.length === 0) {
    // Fallback: line-based trimming (keep lines around changes)
    return trimLineBased(code, changedLines);
  }

  try {
    const sourceFile = ts.createSourceFile(
      filename,
      code,
      ts.ScriptTarget.Latest,
      true, // setParentNodes
      ext.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    const lineStarts = sourceFile.getLineStarts();

    // Helper to check if a node overlaps with changed lines
    const getLineRange = (node: ts.Node) => {
      const startPos = node.getStart(sourceFile);
      const endPos = node.getEnd();

      const startLine = getLineOfPosition(startPos, lineStarts) + 1;
      const endLine = getLineOfPosition(endPos, lineStarts) + 1;
      return { startLine, endLine };
    };

    const nodeOverlapsChange = (node: ts.Node): boolean => {
      const { startLine, endLine } = getLineRange(node);
      return changedLines.some((line) => line >= startLine && line <= endLine);
    };

    const spansToReplace: TextSpan[] = [];

    const visit = (node: ts.Node) => {
      // We target declarations like FunctionDeclaration, MethodDeclaration, ClassDeclaration
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isArrowFunction(node) ||
        ts.isFunctionExpression(node)
      ) {
        if (!nodeOverlapsChange(node)) {
          const body = node.body;
          if (body) {
            // Replace body with placeholder
            spansToReplace.push({
              start: body.getStart(sourceFile),
              end: body.getEnd(),
              replacement: "{ /* unmodified */ }",
            });
            return; // Don't traverse inside unmodified body
          }
        }
      }

      if (ts.isClassDeclaration(node)) {
        if (!nodeOverlapsChange(node)) {
          // If the entire class is unmodified and has a body, stub it
          const firstToken = node.getFirstToken(sourceFile);
          const lastToken = node.getLastToken(sourceFile);

          if (firstToken && lastToken) {
            const start = node.getStart(sourceFile);
            const end = node.getEnd();

            // Replace the members block (find opening brace if possible, or just stub members)
            // A simpler way: if the whole class is unmodified, replace its class body contents
            // Let's replace the whole body of the class after the name
            const nameEnd = node.name
              ? node.name.getEnd()
              : node.getStart(sourceFile) + 5;
            spansToReplace.push({
              start: nameEnd,
              end: end,
              replacement: " { /* unmodified class members */ }",
            });
            return;
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    // Sort spans in descending order to apply them without affecting offsets of prior spans
    spansToReplace.sort((a, b) => b.start - a.start);

    let trimmedCode = code;
    for (const span of spansToReplace) {
      trimmedCode =
        trimmedCode.slice(0, span.start) +
        span.replacement +
        trimmedCode.slice(span.end);
    }

    return trimmedCode;
  } catch (error) {
    console.warn(
      `AST trimming failed for ${filename}, falling back to line-based trimming:`,
      error,
    );
    return trimLineBased(code, changedLines);
  }
}

function getLineOfPosition(pos: number, lineStarts: readonly number[]): number {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] === pos) {
      return mid;
    } else if (lineStarts[mid] < pos) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return low - 1;
}

function trimLineBased(
  code: string,
  changedLines: number[],
  contextLines = 5,
): string {
  const lines = code.split(/\r?\n/);
  if (lines.length <= contextLines * 2 + changedLines.length) {
    return code;
  }

  const linesToKeep = new Set<number>();
  for (const lineNum of changedLines) {
    // 1-based index to 0-based index
    const idx = lineNum - 1;
    const start = Math.max(0, idx - contextLines);
    const end = Math.min(lines.length - 1, idx + contextLines);
    for (let i = start; i <= end; i++) {
      linesToKeep.add(i);
    }
  }

  let result = "";
  let inGap = false;

  for (let i = 0; i < lines.length; i++) {
    if (linesToKeep.has(i)) {
      if (inGap) {
        result += "\n// ... (unmodified code) ...\n\n";
        inGap = false;
      }
      result += lines[i] + "\n";
    } else {
      inGap = true;
    }
  }

  return result.trim();
}
