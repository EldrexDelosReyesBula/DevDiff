# DevDiff VS Code Extension

Privacy-first, BYOAI inline changelog intelligence for VS Code.

<p align="center">
  <img src="asset/devdiff.png" width="128" height="128" alt="DevDiff Logo">
</p>

DevDiff explains your Git diffs directly inside VS Code. It is built from the ground up for developers who care about security, privacy, and speed.

## 🚀 Key Features

- **Inline Explanations**: Generate detailed explanations for staged changes with a single click.
- **Privacy-First (No Telemetry)**: DevDiff does not send telemetry, analytics, or source code to any cloud service.
- **Local AI & GPU Inference**: Supports local models using WebGPU, WebAssembly, and Ollama (Llama 3.2, Llama 3.1, CodeLlama) so no code leaves your machine.
- **Multi-Agent swarm**: Orchestrates a swarm of specialized local agents (Architect, Security, Performance, and Docs) to build consensus on code impact.
- **Vibe-Coding Resilience**: Automatically takes pre-AI checkpoints and enables recovery if routed providers fail.

## 📦 Getting Started

1. **Install** the extension from the VS Code Marketplace or load the VSIX package.
2. **Configure Your Provider** in your repository:
   ```bash
   npx devdiff init
   ```
3. **Use the extension**:
   - Open the **Active Changes** sidebar view.
   - Run the command `DevDiff: Explain Staged Changes` to generate explanations for your staged changes.

## 🔒 Security & Privacy Model

DevDiff runs completely in your local environment.
- **Zero Cloud Leakage**: The data classification engine automatically blocks code containing secrets, keys, or passwords from being sent to external endpoints.
- **Compliance Ready**: Enforce GDPR, HIPAA, SOC 2, and other frameworks out of the box.

## 📄 License

MIT
