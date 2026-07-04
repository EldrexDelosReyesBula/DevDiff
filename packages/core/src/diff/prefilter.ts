import * as path from "path";
import { FileChange } from "./relationship-detector-v2";

/**
 * Pre-filter for file pairing
 * Eliminates impossible matches before expensive comparison
 * Reduces O(D × A) to O(D × viableCandidates)
 */
export class FilePairPrefilter {
  /**
   * Quick check: could these files be related?
   * Runs BEFORE any content analysis
   */
  static isViablePair(deleted: FileChange, added: FileChange): boolean {
    // Guard 1: Extension match (unless explicit migration)
    const deletedExt = path.extname(deleted.path).toLowerCase();
    const addedExt = path.extname(added.path).toLowerCase();

    // Allow .js → .ts migration
    const jsMigration =
      (deletedExt === ".js" && addedExt === ".ts") ||
      (deletedExt === ".jsx" && addedExt === ".tsx");

    if (deletedExt !== addedExt && !jsMigration) {
      return false; // Different file types — unlikely related
    }

    // Guard 2: File size bracket (±70%)
    const deletedSize = deleted.oldContent?.split("\n").length || 0;
    const addedSize = added.content?.split("\n").length || 0;

    if (deletedSize > 0 && addedSize > 0) {
      const ratio = Math.min(deletedSize, addedSize) / Math.max(deletedSize, addedSize);
      if (ratio < 0.3) {
        return false; // Too different in size
      }
    }

    // Guard 3: Directory proximity (quick check)
    const deletedDir = path.dirname(deleted.path);
    const addedDir = path.dirname(added.path);

    // Same directory = very likely related
    if (deletedDir === addedDir) {
      return true;
    }

    // One is subdirectory of the other
    if (deletedDir.startsWith(addedDir) || addedDir.startsWith(deletedDir)) {
      return true;
    }

    // Both in same top-level package (monorepo)
    const deletedPkg = this.getPackageRoot(deletedDir);
    const addedPkg = this.getPackageRoot(addedDir);
    if (deletedPkg && deletedPkg === addedPkg) {
      return true;
    }

    // Name similarity (quick Levenshtein)
    const deletedName = path.basename(deleted.path, deletedExt).toLowerCase();
    const addedName = path.basename(added.path, addedExt).toLowerCase();

    if (this.quickNameMatch(deletedName, addedName)) {
      return true;
    }

    return false;
  }

  /**
   * Get package root for monorepo detection
   */
  private static getPackageRoot(dir: string): string | null {
    const parts = dir.split(path.sep);
    const packagesIdx = parts.indexOf("packages");
    if (packagesIdx !== -1 && parts.length > packagesIdx + 1) {
      return parts[packagesIdx + 1];
    }
    return null;
  }

  /**
   * Quick name match without full Levenshtein
   */
  private static quickNameMatch(a: string, b: string): boolean {
    if (a === b) return true;
    if (a.includes(b) || b.includes(a)) return true;

    // Check common prefixes (e.g., "UserService" and "UserRepository")
    let commonPrefix = 0;
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] === b[i]) commonPrefix++;
      else break;
    }

    return commonPrefix >= Math.floor(minLen * 0.5); // 50% prefix match
  }
}
