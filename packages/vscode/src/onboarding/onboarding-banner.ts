import * as vscode from "vscode";
import { AIDetector, AIDetectionResult } from "@eldrex/core";

export class OnboardingBanner {
  /**
   * Show the right banner based on what's detected
   */
  static async show(context: vscode.ExtensionContext): Promise<void> {
    const detection = AIDetector.detectAll();

    // Already fully set up — show minimal welcome
    if (detection.onboardingStage === "ready") {
      await this.showReadyBanner(detection);
      return;
    }

    // Partially set up — show what's available
    if (detection.onboardingStage === "partial") {
      await this.showPartialBanner(detection);
      return;
    }

    // Nothing set up — guide through setup
    await this.showSetupBanner(detection);
  }

  /**
   * Everything is ready — quick start
   */
  private static async showReadyBanner(
    detection: AIDetectionResult,
  ): Promise<void> {
    const path = detection.recommendedPath!;

    const result = await vscode.window.showInformationMessage(
      `🎉 DevDiff ready — ${path.icon} ${path.name}`,
      { modal: false },
      "Generate First Changelog",
      "Learn More",
    );

    if (result === "Generate First Changelog") {
      vscode.commands.executeCommand("devdiff.generateChangelog");
    }

    if (result === "Learn More") {
      vscode.env.openExternal(vscode.Uri.parse("https://devdiff.vercel.app"));
    }
  }

  /**
   * Something is available but not everything
   */
  private static async showPartialBanner(
    detection: AIDetectionResult,
  ): Promise<void> {
    const available = detection.availablePaths[0];
    const setupOptions = detection.setupOptions;

    const items: string[] = [];

    if (available) {
      items.push(`✅ ${available.icon} Use ${available.name}`);
    }

    for (const option of setupOptions) {
      if (option.action?.type === "install") {
        items.push(`📦 Install ${option.name}`);
      }
      if (option.action?.type === "setup") {
        items.push(`⚙️ Setup ${option.name}`);
      }
    }

    const result = await vscode.window.showInformationMessage(
      `DevDiff: ${available ? `${available.icon} ${available.name} ready` : "Setup needed"}`,
      { modal: false },
      ...items,
    );

    if (result?.includes("Use")) {
      vscode.commands.executeCommand("devdiff.generateChangelog");
    }

    if (result?.includes("Install Ollama")) {
      vscode.env.openExternal(vscode.Uri.parse("https://ollama.com/download"));
    }

    if (result?.includes("Setup")) {
      vscode.commands.executeCommand("devdiff.showOutput");
    }
  }

  /**
   * Nothing set up — full guidance
   */
  private static async showSetupBanner(
    detection: AIDetectionResult,
  ): Promise<void> {
    const result = await vscode.window.showInformationMessage(
      "👋 Welcome to DevDiff! Choose your AI provider to get started.",
      { modal: false },
      "🦙 Install Ollama (Free, Private)",
      "☁️ Use Cloud AI (Your API Key)",
      "📖 Read the Docs",
    );

    if (result?.includes("Ollama")) {
      vscode.env.openExternal(vscode.Uri.parse("https://ollama.com/download"));
    }

    if (result?.includes("Cloud")) {
      vscode.commands.executeCommand("devdiff.showOutput");
    }

    if (result?.includes("Docs")) {
      vscode.env.openExternal(vscode.Uri.parse("https://devdiff.vercel.app"));
    }
  }
}
