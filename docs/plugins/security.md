# DevDiff Plugin Security & Supply Chain Protection

DevDiff enforces deep, zero-trust security controls on third-party plugins before installation and execution. This prevents supply chain attacks, data exfiltration via third-party transitive dependencies, obfuscated code execution, and unauthorized permission escalation.

---

## 5 Core Plugin Security Risks & Mitigations

| Risk Vector                    | Description                                                                           | DevDiff v1.7.0 Protection Mechanism                                                                                                                            |
| :----------------------------- | :------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Transitive Dependencies** | Plugin imports an innocent package which imports a compromised transitive dependency. | **`DependencyScanner`**: Traverses up to 10 levels of `node_modules` and queries OSV.dev & npm Advisories in real time.                                        |
| **2. Obfuscated Code**         | Plugin code is minified or obfuscated to hide data harvesting logic.                  | **`ObfuscationDetector`**: 8-indicator threat scoring algorithm evaluating variable name entropy, escape frequencies, Base64 patterns, and dynamic evaluation. |
| **3. Dynamic Code Execution**  | Plugin uses `eval()`, `Function()`, or variable `require()` destinations.             | **Dynamic Execution Scanner**: Flags dynamic execution as critical severity findings.                                                                          |
| **4. Data Exfiltration APIs**  | Plugin sends workspace data to harvesting endpoints.                                  | **Network Target Extractor**: Extracts all URL destinations across all source files and transitives, cross-referencing against blocked telemetry lists.        |
| **5. Native Binary Addons**    | Plugin includes compiled `.node`, `.so`, or `.dll` binary addons bypassing JS safety. | **Native Module Detection**: Flags all binary files before installation.                                                                                       |

---

## Core Security Architecture

```mermaid
flowchart TD
    Install[User Requests Plugin Install] --> Scan[Plugin Security Pipeline]

    subgraph CoreSecurityEngine [@eldrex/core Plugin Security]
      Scan --> DepScanner[DependencyScanner]
      Scan --> ObfDetector[ObfuscationDetector]
      Scan --> PermReviewer[PermissionReviewer]

      DepScanner --> OSV[Live OSV.dev & npm Advisory Query]
      DepScanner --> Tree[Transitive Dependency Graph Builder]

      ObfDetector --> Score[8-Indicator Scoring Engine (0-100)]
      PermReviewer --> Audit[Declared vs Actual Permission Audit]
    end

    DepScanner --> WebviewPanel[PluginConsentModal UI]
    ObfDetector --> WebviewPanel
    PermReviewer --> WebviewPanel

    WebviewPanel --> Decision{Security Decision}
    Decision -->|Approve| Trust[Installed]
    Decision -->|Block/Cancel| Abort[Installation Blocked]
```

---

## Deep Dependency Tree Scanning (`DependencyScanner`)

`DependencyScanner.scan(pluginPath: string)` inspects the entire tree of a plugin before installation:

```typescript
import { DependencyScanner } from "@eldrex/core";

const scanResult = await DependencyScanner.scan("./my-plugin");

console.log(`Total dependencies scanned: ${scanResult.totalDependencies}`);
console.log(`Findings count: ${scanResult.findings.length}`);
console.log(`Action recommendation: ${scanResult.recommendation.action}`);
```

### Key Capabilities:

- **Live Ecosystem Advisory Querying**: Queries `api.osv.dev` and `registry.npmjs.org` for known CVEs and malicious packages.
- **Network Destination Mining**: Uses regex AST parsing across all files in the dependency graph to extract domain targets.
- **Native Binary Detection**: Flags `.node`, `.so`, `.dll`, `.dylib`, and `.wasm` files.

---

## Code Obfuscation Detection (`ObfuscationDetector`)

`ObfuscationDetector.analyze(code: string)` scores source code using 8 distinct heuristic indicators:

```typescript
import { ObfuscationDetector } from "@eldrex/core";

const analysis = ObfuscationDetector.analyze(pluginSourceCode);

console.log(`Obfuscation Score: ${analysis.score}/100`);
console.log(`Status: ${analysis.status}`); // clean | suspicious | obfuscated | dangerous
```

### Indicator Metrics:

1. **Single-Character Variable Density**: (+20 pts if > 10 non-loop single-char variables)
2. **Hex / Unicode Escape Count**: (+30 pts if > 5 escape sequences)
3. **Base64 String Patterns**: (+35 pts if > 3 long base64 string literals)
4. **Dynamic Code Execution**: (+40 pts for `eval()` or `Function()`)
5. **Runtime String Decoding**: (+30 pts for `String.fromCharCode` or `atob()`)
6. **Minified Line Length**: (+25 pts if average line length > 500 characters)
7. **Lack of Meaningful Names**: (+20 pts if < 3 descriptive names in > 20 lines)
8. **Deep Nesting Depth**: (+10 pts if nesting depth > 8 levels)

---

## Requested vs Undeclared Permissions (`PermissionReviewer`)

`PermissionReviewer.review(declaredPermissions, sourceCode)` compares declared manifest capabilities against actual code usage. If a plugin attempts network calls or shell execution without declaring them in `package.json`, an undeclared capability finding is generated.

---

## Interactive VS Code Consent Modal (`PluginConsentModal`)

Before any plugin is activated in VS Code, `PluginConsentModal` opens an interactive Webview displaying:

- **Security Dashboard**: Summary badges for total dependencies, findings, and obfuscation score.
- **Visual Dependency Graph**: Interactive tree showing direct vs transitive packages with `🌐 Network`, `⚡ Dynamic`, and `📦 Native` badges.
- **Security Findings & Obfuscation Breakdown**: Granular list of findings categorized by severity (`critical`, `high`, `medium`, `low`).
- **Publisher Verification & Actions**: Standard `Install`, `Install & Trust Publisher`, or `Cancel` options.

Learn more on the official website: [https://devdiff.vercel.app/](https://devdiff.vercel.app/)
