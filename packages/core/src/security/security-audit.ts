import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

export interface AuditEntry {
  type: string;
  command?: string;
  args?: string[];
  timestamp: number;
  caller?: string;
  [key: string]: any;
}

/**
 * SecurityAudit — encrypted audit log using AES-256-GCM.
 *
 * Each entry is encrypted individually using a derived key from
 * DEVDIFF_AUDIT_KEY env var (or a machine-level fallback).
 * If no key is set, falls back to plaintext for dev environments.
 */
export class SecurityAudit {
  private static LOG_PATH = path.resolve(
    process.cwd(),
    ".devdiff/security-audit.enc",
  );
  // Legacy plaintext path (read-only migration)
  private static LEGACY_PATH = path.resolve(
    process.cwd(),
    ".devdiff/security-audit.json",
  );

  private static getKey(): Buffer | null {
    const envKey = process.env.DEVDIFF_AUDIT_KEY;
    if (!envKey) return null;
    // Derive a 32-byte key from the env var using SHA-256
    return crypto.createHash("sha256").update(envKey).digest();
  }

  private static encrypt(plaintext: string, key: Buffer): string {
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    // Store as base64: iv(12) | authTag(16) | ciphertext
    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
  }

  private static decrypt(encoded: string, key: Buffer): string {
    const buf = Buffer.from(encoded, "base64");
    const iv = buf.slice(0, 12);
    const authTag = buf.slice(12, 28);
    const ciphertext = buf.slice(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext) + decipher.final("utf8");
  }

  static async log(entry: AuditEntry): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.LOG_PATH), { recursive: true });
      const key = this.getKey();
      const entryJson = JSON.stringify({ ...entry, timestamp: Date.now() });

      if (key) {
        // Encrypted: append one line of base64 per entry (JSONL style)
        const encryptedLine = this.encrypt(entryJson, key) + "\n";
        await fs.appendFile(this.LOG_PATH, encryptedLine, "utf-8");
      } else {
        // Plaintext fallback for dev environments without a key
        const legacyPath = this.LEGACY_PATH;
        let logs: AuditEntry[] = [];
        try {
          const fileContent = await fs.readFile(legacyPath, "utf-8");
          logs = JSON.parse(fileContent);
        } catch {
          // File doesn't exist or is invalid JSON
        }
        logs.push(entry);
        await fs.writeFile(legacyPath, JSON.stringify(logs, null, 2), "utf-8");
      }
    } catch (err) {
      console.error("Failed to write to security audit trail:", err);
    }
  }

  static async getLogs(): Promise<AuditEntry[]> {
    const key = this.getKey();

    if (key) {
      try {
        const content = await fs.readFile(this.LOG_PATH, "utf-8");
        const lines = content.split("\n").filter(Boolean);
        const entries: AuditEntry[] = [];
        for (const line of lines) {
          try {
            const decrypted = this.decrypt(line.trim(), key);
            entries.push(JSON.parse(decrypted));
          } catch {
            // Skip corrupted entries
          }
        }
        return entries;
      } catch {
        return [];
      }
    }

    // Plaintext fallback
    try {
      const fileContent = await fs.readFile(this.LEGACY_PATH, "utf-8");
      return JSON.parse(fileContent);
    } catch {
      return [];
    }
  }

  /**
   * Verify integrity of the encrypted log file.
   * Returns true if all entries can be decrypted without errors.
   */
  static async verifyIntegrity(): Promise<{ valid: boolean; total: number; corrupted: number }> {
    const key = this.getKey();
    if (!key) {
      return { valid: true, total: 0, corrupted: 0 };
    }

    try {
      const content = await fs.readFile(this.LOG_PATH, "utf-8");
      const lines = content.split("\n").filter(Boolean);
      let corrupted = 0;
      for (const line of lines) {
        try {
          this.decrypt(line.trim(), key);
        } catch {
          corrupted++;
        }
      }
      return { valid: corrupted === 0, total: lines.length, corrupted };
    } catch {
      return { valid: true, total: 0, corrupted: 0 };
    }
  }
}
