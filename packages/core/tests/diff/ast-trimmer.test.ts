import { describe, it, expect } from "vitest";
import { trimAST } from "../../src/diff/ast-trimmer";

describe("trimAST", () => {
  it("stubs out unmodified functions", () => {
    const code = `
function target() {
  const x = 1;
  return x;
}

function unchanged() {
  const y = 2;
  console.log(y);
  return y;
}
`;
    // We modify line 3 (inside target)
    const result = trimAST("test.ts", code, [3]);

    expect(result).toContain("function target()");
    expect(result).toContain("const x = 1;");
    expect(result).toContain("function unchanged() { /* unmodified */ }");
  });

  it("falls back to line-based trimming for unsupported extensions", () => {
    const code = `line 1
line 2
line 3
line 4
line 5
line 6
line 7
line 8
line 9
line 10
line 11
line 12
line 13
line 14
line 15`;

    // Modify line 8
    const result = trimAST("test.txt", code, [8]);
    expect(result).toContain("line 8");
    expect(result).toContain("// ... (unmodified code) ...");
  });
});
