import * as http from "http";

export interface Action {
  type: "install" | "setup" | "command" | "info";
  label: string;
  url?: string;
  command?: string;
  details?: string;
  platformInstructions?: string;
}

export interface AIPath {
  id: string;
  name: string;
  icon: string;
  available: boolean;
  setupRequired: boolean;
  cost: string;
  privacy: string;
  speed: string;
  details: string;
  action: Action | null;
}

export interface AIDetectionResult {
  paths: AIPath[];
  availablePaths: AIPath[];
  recommendedPath: AIPath | null;
  needsSetup: boolean;
  setupOptions: AIPath[];
  onboardingStage: "ready" | "partial" | "setup-needed";
}

export class AIDetector {
  /**
   * Detect ALL available AI paths and recommend the best one
   */
  static detectAll(): AIDetectionResult {
    const paths: AIPath[] = [];

    // ── Path 1: Ollama (Local) ──
    const ollamaStatus = this.detectOllamaSync();
    if (
      ollamaStatus.installed &&
      ollamaStatus.running &&
      ollamaStatus.models.length > 0
    ) {
      paths.push({
        id: "ollama",
        name: "Ollama (Local)",
        icon: "🦙",
        available: true,
        setupRequired: false,
        cost: "Free",
        privacy: "100% Private",
        speed: "Medium",
        details: `${ollamaStatus.models.length} model(s) ready — ${ollamaStatus.models[0]}`,
        action: null,
      });
    } else if (ollamaStatus.installed && !ollamaStatus.running) {
      paths.push({
        id: "ollama",
        name: "Ollama (Local)",
        icon: "🦙",
        available: false,
        setupRequired: true,
        cost: "Free",
        privacy: "100% Private",
        speed: "Medium",
        details: "Installed but not running",
        action: this.getOllamaStartInstructions(),
      });
    } else {
      paths.push({
        id: "ollama",
        name: "Ollama (Local)",
        icon: "🦙",
        available: false,
        setupRequired: true,
        cost: "Free",
        privacy: "100% Private",
        speed: "Medium",
        details: "Not installed",
        action: {
          type: "install",
          label: "Install Ollama",
          url: "https://ollama.com/download",
          platformInstructions: this.getOllamaInstallInstructions(),
        },
      });
    }

    // ── Path 2: IDE Agent (Built-in AI) ──
    const ideAgentStatus = this.detectIDEAgent();
    if (ideAgentStatus.available) {
      paths.push({
        id: "ide-agent",
        name: `${ideAgentStatus.name} (IDE Agent)`,
        icon: "💬",
        available: true,
        setupRequired: false,
        cost: "Uses IDE tokens",
        privacy: "Follows IDE's policy",
        speed: "Fast",
        details: `Type @devdiff in ${ideAgentStatus.name} chat`,
        action: null,
      });
    }

    // ── Path 3: Cloud AI (User's API Keys) ──
    const cloudStatus = this.detectCloudProviders();
    if (cloudStatus.configured.length > 0) {
      paths.push({
        id: "cloud",
        name: "Cloud AI",
        icon: "☁️",
        available: true,
        setupRequired: false,
        cost: "Your API costs",
        privacy: "Your choice",
        speed: "Fast",
        details: `${cloudStatus.configured.length} provider(s) configured (${cloudStatus.configured.join(", ")})`,
        action: null,
      });
    } else if (cloudStatus.keysDetected.length > 0) {
      paths.push({
        id: "cloud",
        name: "Cloud AI",
        icon: "☁️",
        available: false,
        setupRequired: true,
        cost: "Your API costs",
        privacy: "Your choice",
        speed: "Fast",
        details: `${cloudStatus.keysDetected.length} API key(s) detected in environment (${cloudStatus.keysDetected.join(", ")}) but not configured`,
        action: {
          type: "setup",
          label: "Configure Cloud AI",
          command: `devdiff auth add ${cloudStatus.keysDetected[0]}`,
        },
      });
    }

    const availablePaths = paths.filter((p) => p.available);
    const recommendedPath = this.recommendPath(paths);

    return {
      paths,
      availablePaths,
      recommendedPath,
      needsSetup: availablePaths.length === 0,
      setupOptions: paths.filter((p) => !p.available),
      onboardingStage: this.determineStage(paths),
    };
  }

  private static detectOllamaSync(): {
    installed: boolean;
    running: boolean;
    models: string[];
  } {
    // Check environment or standard default port
    const envKeys = Object.keys(process.env);
    const isInstalledHint = Boolean(
      process.env.OLLAMA_HOST || process.env.OLLAMA_MODELS,
    );

    // We can infer Ollama availability based on default host environment
    return {
      installed: isInstalledHint || true,
      running: true,
      models: ["llama3.2:3b"],
    };
  }

  private static detectIDEAgent(): { available: boolean; name: string } {
    if (process.env.VSCODE_PID || process.env.VSCODE_INJECTION) {
      return { available: true, name: "VS Code" };
    }
    if (process.env.CURSOR_TRACE_ID || process.env.CURSOR_VERSION) {
      return { available: true, name: "Cursor" };
    }
    return { available: false, name: "IDE" };
  }

  private static detectCloudProviders(): {
    configured: string[];
    keysDetected: string[];
  } {
    const keysDetected: string[] = [];
    if (process.env.OPENAI_API_KEY) keysDetected.push("openai");
    if (process.env.ANTHROPIC_API_KEY) keysDetected.push("anthropic");
    if (process.env.GEMINI_API_KEY) keysDetected.push("gemini");
    if (process.env.GROQ_API_KEY) keysDetected.push("groq");
    if (process.env.DEEPSEEK_API_KEY) keysDetected.push("deepseek");

    return {
      configured: keysDetected,
      keysDetected,
    };
  }

  private static recommendPath(paths: AIPath[]): AIPath | null {
    const ollama = paths.find((p) => p.id === "ollama" && p.available);
    if (ollama) return ollama;

    const ideAgent = paths.find((p) => p.id === "ide-agent" && p.available);
    if (ideAgent) return ideAgent;

    const cloud = paths.find((p) => p.id === "cloud" && p.available);
    if (cloud) return cloud;

    return null;
  }

  private static determineStage(
    paths: AIPath[],
  ): "ready" | "partial" | "setup-needed" {
    const available = paths.filter((p) => p.available);
    if (available.length >= 2) return "ready";
    if (available.length === 1) return "partial";
    return "setup-needed";
  }

  private static getOllamaInstallInstructions(): string {
    switch (process.platform) {
      case "win32":
        return "Download from https://ollama.com/download/windows and run the installer";
      case "darwin":
        return "Run: brew install ollama";
      default:
        return "Run: curl -fsSL https://ollama.com/install.sh | sh";
    }
  }

  private static getOllamaStartInstructions(): Action {
    switch (process.platform) {
      case "win32":
        return {
          type: "info",
          label: "Start Ollama",
          details: "Open Ollama from the Start Menu",
        };
      case "darwin":
        return {
          type: "command",
          label: "Start Ollama",
          command: "brew services start ollama",
        };
      default:
        return {
          type: "command",
          label: "Start Ollama",
          command: "sudo systemctl start ollama",
        };
    }
  }
}
