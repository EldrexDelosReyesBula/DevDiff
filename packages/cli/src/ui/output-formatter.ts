import pc from "picocolors";

/**
 * CLI Output — Same design system, terminal-native
 * Uses consistent spacing, hierarchy, and visual language
 */
export class CLIOutputFormatter {
  // ── Section Headers ──────────────────────────────────
  static section(title: string): string {
    const width = Math.min(process.stdout.columns || 80, 80);
    const dashes = "━".repeat(Math.max(0, width - title.length - 2));
    return `\n${pc.bold(pc.cyan(`━ ${title} ${dashes}`))}\n`;
  }

  // ── Success Message ──────────────────────────────────
  static success(message: string, detail?: string): string {
    let output = `${pc.green("✅")} ${pc.bold(message)}`;
    if (detail) output += `\n   ${pc.dim(detail)}`;
    return output;
  }

  // ── Error Message ────────────────────────────────────
  static error(code: string, message: string, fix: string): string {
    return [
      "",
      `${pc.red("❌")} ${pc.bold(message)}`,
      "",
      `   ${pc.bold("Error:")} ${pc.red(code)}`,
      `   ${pc.bold("Fix:")}   ${pc.green(fix)}`,
      "",
    ].join("\n");
  }

  // ── Table ────────────────────────────────────────────
  static table(headers: string[], rows: string[][]): string {
    const colWidths = headers.map((h, i) => {
      const maxData = Math.max(...rows.map((r) => (r[i] || "").length));
      return Math.max(h.length, maxData) + 2;
    });

    const divider =
      "├" + colWidths.map((w) => "─".repeat(w)).join("┼") + "┤";

    const headerRow =
      "│" +
      headers
        .map((h, i) => ` ${pc.bold(h).padEnd(colWidths[i] + 8)}`) // Account for pc escape codes length (approx 9 chars)
        .join("│") +
      "│";

    // Recompute clean padding for raw text widths
    const paddedHeaderRow =
      "│" +
      headers
        .map((h, i) => ` ${pc.bold(h)}${" ".repeat(colWidths[i] - h.length - 1)}`)
        .join("│") +
      "│";

    const dataRows = rows.map(
      (row) =>
        "│" +
        row
          .map((cell, i) => ` ${(cell || "").padEnd(colWidths[i] - 1)}`)
          .join("│") +
        "│"
    );

    return [
      "┌" + colWidths.map((w) => "─".repeat(w)).join("┬") + "┐",
      paddedHeaderRow,
      divider,
      ...dataRows,
      "└" + colWidths.map((w) => "─".repeat(w)).join("┴") + "┘",
    ].join("\n");
  }

  // ── Progress Spinner ─────────────────────────────────
  static spinner(
    frames: string[] = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  ) {
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(`\r${pc.cyan(frames[i++ % frames.length])} Processing...`);
    }, 80);

    return {
      stop: (message: string) => {
        clearInterval(interval);
        process.stdout.write(`\r${message}\n`);
      },
    };
  }

  // ── Card (for status displays) ───────────────────────
  static card(title: string, items: Record<string, string>): string {
    const maxKeyLen = Math.max(...Object.keys(items).map((k) => k.length));

    const lines = [
      pc.cyan(`┌─ ${pc.bold(title)} ${"─".repeat(Math.max(0, 60 - title.length))}`),
      ...Object.entries(items).map(
        ([key, value]) =>
          pc.cyan("│ ") +
          pc.bold(key.padEnd(maxKeyLen)) +
          pc.dim(": ") +
          pc.white(value)
      ),
      pc.cyan(`└${"─".repeat(62)}`),
    ];

    return lines.join("\n");
  }

  // ── Badge ────────────────────────────────────────────
  static badge(
    text: string,
    type: "success" | "warning" | "error" | "info" = "info"
  ): string {
    const symbols: Record<string, string> = {
      success: pc.green("✅"),
      warning: pc.yellow("⚠️"),
      error: pc.red("❌"),
      info: pc.blue("ℹ️"),
    };
    return `${symbols[type]} ${text}`;
  }
}
