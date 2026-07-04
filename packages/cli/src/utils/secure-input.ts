import * as readline from "readline";
import { execSync } from "child_process";
import * as os from "os";

/**
 * Cross-platform secure input (password masking)
 *
 * Handles:
 * - Unix (Linux, macOS): Uses stty to disable echo
 * - Windows: Uses pure Node.js character masking
 * - WSL: Detects and uses appropriate method
 * - CI environments: Falls back to visible input with warning
 * - Non-TTY: Falls back to visible input
 */
export async function securePrompt(question: string): Promise<string> {
  // Detect environment
  const platform = detectPlatform();

  // Non-interactive environments (CI, pipes)
  if (!process.stdin.isTTY) {
    console.log(`${question} [input hidden in non-TTY environment]`);
    console.log("Use environment variable or config file instead.");
    console.log("Example: export OPENAI_API_KEY=your-key");
    throw new NonInteractiveError(
      "Cannot read secure input in non-interactive environment.\n" +
        "Use environment variable or devdiff auth add --key <key>"
    );
  }

  // Route to platform-specific implementation
  switch (platform) {
    case "windows":
      return windowsSecurePrompt(question);
    case "macos":
    case "linux":
    case "wsl":
      return unixSecurePrompt(question);
    default:
      return unixSecurePrompt(question);
  }
}

// ===========================================================
// WINDOWS IMPLEMENTATION — Pure Node.js, no PowerShell spawn
// ===========================================================
async function windowsSecurePrompt(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    // Ensure stdin is in a usable state
    if (stdin.isPaused()) stdin.resume();

    // Save original settings for restoration
    const originalRawMode = stdin.isRaw;

    stdout.write(question);

    let input = "";
    let cleanup: (() => void) | null = null;

    const onData = (char: Buffer) => {
      const key = char.toString();

      // Enter — done
      if (key.includes("\r") || key.includes("\n")) {
        const cleanKey = key.replace(/[\r\n]/g, "");
        input += cleanKey;
        cleanup?.();
        stdout.write("\n");
        resolve(input);
        return;
      }

      // Backspace / Delete
      if (key === "\b" || key === "\x7f") {
        if (input.length > 0) {
          input = input.slice(0, -1);
          stdout.write("\b \b"); // Erase asterisk
        }
        return;
      }

      // Ctrl+C — abort
      if (key === "\x03") {
        cleanup?.();
        stdout.write("\n");
        reject(new Error("Input cancelled"));
        return;
      }

      // Regular character
      input += key;
      stdout.write("*"); // Show asterisk instead of character
    };

    // Set up cleanup function — THIS IS THE KEY FIX
    cleanup = () => {
      stdin.removeListener("data", onData);

      // RESTORE TERMINAL STATE
      if (!originalRawMode) {
        stdin.setRawMode?.(false);
      }
      if (stdin.isPaused()) stdin.resume();

      // Remove any remaining listeners we added
      stdin.removeAllListeners("keypress");
    };

    // Handle process exit while reading
    const onExit = () => {
      cleanup?.();
      stdout.write("\n");
      reject(new Error("Input cancelled"));
    };
    process.on("exit", onExit);
    process.on("SIGINT", onExit);
    process.on("SIGTERM", onExit);
    process.on("uncaughtException", onExit);

    // Use raw mode for character-by-character reading on Windows
    if (stdin.setRawMode) {
      stdin.setRawMode(true);
    }

    stdin.on("data", onData);

    // Handle stdin end
    stdin.on("end", () => {
      cleanup?.();
      resolve(input);
    });

    // Handle stdin error
    stdin.on("error", (err) => {
      cleanup?.();
      reject(err);
    });
  });
}

// ===========================================================
// UNIX IMPLEMENTATION — stty-based, proper cleanup
// ===========================================================
async function unixSecurePrompt(question: string): Promise<string> {
  // Save current stty settings
  let originalSttySettings = "";
  try {
    originalSttySettings = execSync("stty -g", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"], // Don't inherit stdio
    }).trim();
  } catch {
    // stty not available — fall back to basic input
    return fallbackPrompt(question);
  }

  // Ensure cleanup on any exit
  const cleanup = () => {
    try {
      if (originalSttySettings) {
        execSync(`stty ${originalSttySettings}`, {
          stdio: ["pipe", "pipe", "pipe"],
        });
      }
    } catch {
      // Best effort cleanup
    }
  };

  // Register cleanup for ALL exit scenarios
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });
  process.on("SIGHUP", () => {
    cleanup();
    process.exit(129);
  });
  process.on("uncaughtException", () => {
    cleanup();
  });

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    // Disable echo using stty
    try {
      execSync("stty -echo", { stdio: ["pipe", "pipe", "pipe"] });
    } catch {
      // Continue without echo disabled
    }

    rl.question(question, (answer) => {
      // CRITICAL: Restore echo BEFORE closing readline
      try {
        execSync("stty echo", { stdio: ["pipe", "pipe", "pipe"] });
      } catch {
        // Best effort
      }

      rl.close();
      cleanup();

      // Remove exit listeners after successful completion
      process.removeListener("exit", cleanup);

      resolve(answer.trim());
    });

    // Handle readline close
    rl.on("close", () => {
      cleanup();
    });

    // Handle SIGINT during input
    rl.on("SIGINT", () => {
      rl.close();
      cleanup();
      console.log("");
      reject(new Error("Input cancelled"));
    });
  });
}

// ===========================================================
// FALLBACK — When stty/setRawMode not available
// ===========================================================
async function fallbackPrompt(question: string): Promise<string> {
  console.log(`${question}`);
  console.log("(Secure input not available — key will be visible)");
  console.log("Tip: Set environment variable instead: export OPENAI_API_KEY=your-key");

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("> ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ===========================================================
// PLATFORM DETECTION
// ===========================================================
function detectPlatform(): "windows" | "macos" | "linux" | "wsl" | "unknown" {
  const platform = process.platform;

  if (platform === "win32") {
    // Check for WSL
    if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) {
      return "wsl";
    }
    return "windows";
  }

  if (platform === "darwin") return "macos";
  if (platform === "linux") return "linux";

  return "unknown";
}

// ===========================================================
// NON-INTERACTIVE FALLBACK
// ===========================================================
export class NonInteractiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonInteractiveError";
  }
}

/**
 * Check if we can do secure input
 */
export function canSecurePrompt(): boolean {
  return process.stdin.isTTY === true;
}

/**
 * Alternative: pass key via command line flag (for scripts)
 */
export function parseKeyFromArgs(args: string[]): string | null {
  const keyIndex = args.indexOf("--key");
  if (keyIndex !== -1 && args[keyIndex + 1]) {
    console.log("⚠️  Warning: Passing API keys via CLI is visible in process list");
    console.log("   Prefer: devdiff auth add <provider>  (interactive)");
    console.log("   Or set: export OPENAI_API_KEY=your-key");
    return args[keyIndex + 1];
  }
  return null;
}
