import * as path from "path";
import { FilePairPrefilter } from "./prefilter";
import {
  ASTFingerprintExtractor,
  ASTFingerprint,
} from "./similarity/ast-fingerprint";
import { GitNativeDetector } from "../git/native-detection";
import { ImportResolver } from "./import-resolver";
import { DeepContext } from "../context/deep-indexer";

export interface FileChange {
  path: string;
  status: "added" | "deleted" | "modified";
  content?: string;
  oldContent?: string;
}

export interface FileRelationship {
  type:
    | "rename"
    | "refactor"
    | "replacement"
    | "deprecation"
    | "cleanup"
    | "potential-issue"
    | "unknown";
  confidence: number;
  primaryFile: string;
  relatedFiles: string[];
  explanation: string;
  evidence: string[];
}

/**
 * Optimized File Relationship Detector — Production Version
 *
 * Incorporates all fixes:
 * 1. AST Fingerprint similarity instead of raw tokens
 * 2. Size/extension pre-filtering
 * 3. Git native rename/copy detection
 * 4. Improved import resolution
 * 5. Git log deprecation context
 */
export class FileRelationshipDetectorV2 {
  constructor(
    private workspaceRoot: string,
    private importResolver: ImportResolver,
    private context: DeepContext,
  ) {}

  async analyze(changes: FileChange[]): Promise<FileRelationship[]> {
    const relationships: FileRelationship[] = [];
    const analyzed = new Set<string>();

    // ── PASS 1: Git Native Renames & Copies (Deterministic) ──
    const native = await GitNativeDetector.getDiffWithRenames(
      this.workspaceRoot,
    );

    for (const rename of native.renames) {
      relationships.push({
        type: "rename",
        confidence: rename.similarity / 100, // Git's score → 0-1
        primaryFile: rename.newPath,
        relatedFiles: [rename.oldPath],
        explanation: `Renamed from ${path.basename(rename.oldPath)} to ${path.basename(
          rename.newPath,
        )}`,
        evidence: [`Git rename detection: ${rename.similarity}% similar`],
      });
      analyzed.add(rename.oldPath);
      analyzed.add(rename.newPath);
    }

    for (const copy of native.copies) {
      relationships.push({
        type: "unknown", // Copies need more context to classify
        confidence: copy.similarity / 100,
        primaryFile: copy.newPath,
        relatedFiles: [copy.originalPath],
        explanation: `Copied from ${path.basename(copy.originalPath)}`,
        evidence: [`Git copy detection: ${copy.similarity}% similar`],
      });
      analyzed.add(copy.originalPath);
      analyzed.add(copy.newPath);
    }

    // ── PASS 2: AST Fingerprint Matching (Replacements/Refactors) ──
    const deletions = changes.filter(
      (c) => c.status === "deleted" && !analyzed.has(c.path),
    );
    const additions = changes.filter(
      (c) => c.status === "added" && !analyzed.has(c.path),
    );

    // Pre-filter: only compare viable pairs
    const unassignedAdditions = new Set(
      additions.filter((a) => this.isViableForMatching(a)),
    );

    for (const deleted of deletions) {
      if (!this.isViableForMatching(deleted)) continue;

      // Filter candidates with size/extension guard FIRST
      const candidates = Array.from(unassignedAdditions).filter((added) =>
        FilePairPrefilter.isViablePair(deleted, added),
      );

      if (candidates.length === 0) continue;

      // Sort candidates by directory proximity (optimization)
      candidates.sort((a, b) => {
        const distA = this.dirDistance(deleted.path, a.path);
        const distB = this.dirDistance(deleted.path, b.path);
        return distA - distB;
      });

      // Only check top 10 candidates (performance)
      const topCandidates = candidates.slice(0, 10);

      let bestMatch: {
        file: FileChange;
        score: number;
        fingerprint: ASTFingerprint;
      } | null = null;

      const deletedFingerprint = ASTFingerprintExtractor.extract(
        deleted.oldContent || "",
      );

      for (const candidate of topCandidates) {
        const candidateFingerprint = ASTFingerprintExtractor.extract(
          candidate.content || "",
        );

        // AST Fingerprint similarity (replaces token Jaccard)
        const similarity = ASTFingerprintExtractor.similarity(
          deletedFingerprint,
          candidateFingerprint,
        );

        // Boost score if exports match
        const exportBoost = this.calculateExportBoost(
          deletedFingerprint,
          candidateFingerprint,
        );

        const totalScore = similarity * 0.7 + exportBoost * 0.3;

        if (totalScore > (bestMatch?.score || 0)) {
          bestMatch = {
            file: candidate,
            score: totalScore,
            fingerprint: candidateFingerprint,
          };
        }
      }

      if (bestMatch && bestMatch.score > 0.35) {
        const type = bestMatch.score > 0.6 ? "refactor" : "replacement";

        relationships.push({
          type,
          confidence: bestMatch.score,
          primaryFile: bestMatch.file.path,
          relatedFiles: [deleted.path],
          explanation:
            type === "refactor"
              ? `Refactored ${path.basename(deleted.path)} into ${path.basename(
                  bestMatch.file.path,
                )}`
              : `Replaced ${path.basename(deleted.path)} with ${path.basename(
                  bestMatch.file.path,
                )}`,
          evidence: [
            `AST similarity: ${Math.round(bestMatch.score * 100)}%`,
            `Exports: ${deletedFingerprint.exports.join(", ") || "none"} → ${
              bestMatch.fingerprint.exports.join(", ") || "none"
            }`,
          ],
        });

        analyzed.add(deleted.path);
        analyzed.add(bestMatch.file.path);
        unassignedAdditions.delete(bestMatch.file);
      }
    }

    // ── PASS 3: Git Log Deprecation Context ──
    for (const deleted of deletions) {
      if (analyzed.has(deleted.path)) continue;

      const deprecation = await GitNativeDetector.checkDeprecationHistory(
        this.workspaceRoot,
        deleted.path,
      );

      if (deprecation.wasDeprecated) {
        relationships.push({
          type: "deprecation",
          confidence: deprecation.deprecatedMessage ? 0.95 : 0.7,
          primaryFile: deleted.path,
          relatedFiles: [],
          explanation: deprecation.deprecatedMessage
            ? `Removed: ${deprecation.deprecatedMessage}`
            : `Removed deprecated file: ${path.basename(deleted.path)}`,
          evidence: deprecation.evidence,
        });
        analyzed.add(deleted.path);
      }
    }

    // ── PASS 4: Dangling Reference Check ──
    const changedFilesContent = new Map<string, string>();
    for (const change of changes) {
      const content = change.content || change.oldContent || "";
      if (content) changedFilesContent.set(change.path, content);
    }

    for (const deleted of deletions) {
      if (analyzed.has(deleted.path)) continue;

      const references = this.importResolver.findDanglingReferences(
        deleted.path,
        changedFilesContent,
      );

      relationships.push({
        type: references.length > 0 ? "potential-issue" : "cleanup",
        confidence: references.length > 0 ? 0.85 : 0.5,
        primaryFile: deleted.path,
        relatedFiles: references,
        explanation:
          references.length > 0
            ? `⚠️ Deleted ${path.basename(deleted.path)} but ${
                references.length
              } file(s) still reference it:\n${references.map((r) => `   - ${r}`).join("\n")}`
            : `Removed ${path.basename(deleted.path)} (no imports detected)`,
        evidence:
          references.length > 0
            ? [`${references.length} dangling import(s) found`]
            : ["No imports found referencing this file"],
      });

      analyzed.add(deleted.path);
    }

    return relationships;
  }

  private isViableForMatching(change: FileChange): boolean {
    const content = change.content || change.oldContent || "";
    // Skip files that are too small (<3 lines) or too large (>5000 lines)
    const lines = content.split("\n").length;
    return lines >= 3 && lines <= 5000;
  }

  private dirDistance(pathA: string, pathB: string): number {
    const dirsA = path.dirname(pathA).split(path.sep);
    const dirsB = path.dirname(pathB).split(path.sep);

    let common = 0;
    for (let i = 0; i < Math.min(dirsA.length, dirsB.length); i++) {
      if (dirsA[i] === dirsB[i]) common++;
      else break;
    }

    return Math.max(dirsA.length, dirsB.length) - common;
  }

  private calculateExportBoost(a: ASTFingerprint, b: ASTFingerprint): number {
    if (a.exports.length === 0 && b.exports.length === 0) return 0;
    if (a.exports.length === 0 || b.exports.length === 0) return 0;

    const intersection = a.exports.filter((e) => b.exports.includes(e));
    return intersection.length / Math.max(a.exports.length, b.exports.length);
  }
}
