/**
 * AST Fingerprint Engine
 *
 * Extracts structural fingerprints from code without parsing fully.
 * Uses regex-based extraction for speed (no parser dependency).
 * Captures: exports, imports, function/class declarations, type signatures.
 */

export interface ASTFingerprint {
  exports: string[]; // Named + default exports
  imports: string[]; // Imported module paths
  functions: string[]; // Function names declared
  classes: string[]; // Class names declared
  interfaces: string[]; // Interface/type names
  constants: string[]; // Top-level const declarations
  jsxComponents: string[]; // React/Vue component names
  hooks: string[]; // use* functions
  decorators: string[]; // @decorator names
  fileSize: number; // Total lines
}

export class ASTFingerprintExtractor {
  /**
   * Extract fingerprint from source code
   * Fast — no AST parser, regex-based pattern matching
   */
  static extract(code: string): ASTFingerprint {
    if (!code) return this.empty();

    return {
      exports: this.extractExports(code),
      imports: this.extractImports(code),
      functions: this.extractFunctions(code),
      classes: this.extractClasses(code),
      interfaces: this.extractInterfaces(code),
      constants: this.extractConstants(code),
      jsxComponents: this.extractJSXComponents(code),
      hooks: this.extractHooks(code),
      decorators: this.extractDecorators(code),
      fileSize: code.split("\n").length,
    };
  }

  /**
   * Calculate similarity between two fingerprints (0-1)
   * Weighted by importance: exports > functions > imports > structure
   */
  static similarity(a: ASTFingerprint, b: ASTFingerprint): number {
    const scores: { name: string; weight: number; score: number }[] = [];

    // 1. Exports match (35% weight — most important)
    scores.push({
      name: "exports",
      weight: 0.35,
      score: this.jaccardSet(a.exports, b.exports),
    });

    // 2. Function/class names (25% weight)
    scores.push({
      name: "functions",
      weight: 0.25,
      score: this.jaccardSet(
        [...a.functions, ...a.classes],
        [...b.functions, ...b.classes],
      ),
    });

    // 3. Import patterns (15% weight)
    scores.push({
      name: "imports",
      weight: 0.15,
      score: this.jaccardSet(a.imports, b.imports),
    });

    // 4. Interface/type names (10% weight)
    scores.push({
      name: "interfaces",
      weight: 0.1,
      score: this.jaccardSet(a.interfaces, b.interfaces),
    });

    // 5. Component/hook patterns (10% weight)
    scores.push({
      name: "components",
      weight: 0.1,
      score: this.jaccardSet(
        [...a.jsxComponents, ...a.hooks],
        [...b.jsxComponents, ...b.hooks],
      ),
    });

    // 6. File size similarity (5% weight)
    scores.push({
      name: "size",
      weight: 0.05,
      score:
        a.fileSize === 0 && b.fileSize === 0
          ? 1
          : 1 -
            Math.abs(a.fileSize - b.fileSize) /
              Math.max(a.fileSize, b.fileSize),
    });

    // Weighted average
    return scores.reduce((sum, s) => sum + s.weight * s.score, 0);
  }

  // ── Extraction Methods ──

  private static extractExports(code: string): string[] {
    const patterns = [
      /export\s+default\s+(?:class|function|const|let|var)\s+(\w+)/g,
      /export\s+(?:class|function|const|let|var|interface|type|enum)\s+(\w+)/g,
      /export\s+\{\s*(\w+)/g,
      /module\.exports\s*=\s*(\w+)/g,
    ];
    return this.collectMatches(code, patterns);
  }

  private static extractImports(code: string): string[] {
    const patterns = [
      /import\s+[^;\n\r]+?from\s+['"]([^'"]+)['"]/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];
    return this.collectMatches(code, patterns);
  }

  private static extractFunctions(code: string): string[] {
    const patterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
      /(?:export\s+)?(?:async\s+)?(\w+)\s*=\s*(?:async\s*)?\(/g, // Arrow functions
      /(?:private|public|protected|static)?\s*(?:async\s+)?(\w+)\s*\(/g, // Methods
    ];
    return this.collectMatches(code, patterns);
  }

  private static extractClasses(code: string): string[] {
    const patterns = [/export\s+class\s+(\w+)/g, /class\s+(\w+)/g];
    return this.collectMatches(code, patterns);
  }

  private static extractInterfaces(code: string): string[] {
    const patterns = [
      /(?:export\s+)?interface\s+(\w+)/g,
      /(?:export\s+)?type\s+(\w+)\s*=/g,
      /(?:export\s+)?enum\s+(\w+)/g,
    ];
    return this.collectMatches(code, patterns);
  }

  private static extractConstants(code: string): string[] {
    const patterns = [/(?:export\s+)?const\s+(\w+)\s*[:=]/g];
    return this.collectMatches(code, patterns);
  }

  private static extractJSXComponents(code: string): string[] {
    const patterns = [
      /(?:export\s+)?(?:function|const)\s+([A-Z]\w*)/g, // PascalCase functions
      /<\s*([A-Z]\w*)/g, // JSX component usage
    ];
    return this.collectMatches(code, patterns);
  }

  private static extractHooks(code: string): string[] {
    const patterns = [
      /(?:export\s+)?(?:function|const)\s+(use\w+)/g,
      /(?:use\w+)\s*\(/g,
    ];
    return this.collectMatches(code, patterns);
  }

  private static extractDecorators(code: string): string[] {
    const patterns = [/@(\w+)/g];
    return this.collectMatches(code, patterns);
  }

  // ── Utilities ──

  private static collectMatches(code: string, patterns: RegExp[]): string[] {
    const matches = new Set<string>();
    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset state for global regex
      let match;
      while ((match = pattern.exec(code)) !== null) {
        if (match[1]) {
          matches.add(match[1]);
        }
      }
    }
    return Array.from(matches);
  }

  private static jaccardSet(a: string[], b: string[]): number {
    const setA = new Set(a);
    const setB = new Set(b);

    if (setA.size === 0 && setB.size === 0) return 1; // Both empty = match

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private static empty(): ASTFingerprint {
    return {
      exports: [],
      imports: [],
      functions: [],
      classes: [],
      interfaces: [],
      constants: [],
      jsxComponents: [],
      hooks: [],
      decorators: [],
      fileSize: 0,
    };
  }
}
