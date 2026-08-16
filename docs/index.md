---
layout: home
hero:
  name: "DevDiff"
  text: "Your Codebase's Memory"
  tagline: "Privacy-first, BYOAI changelog intelligence that runs entirely on your machine."
  image:
    src: /devdiff-hero.svg
    alt: DevDiff
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: IDE Integration
      link: /features/ide-integration
    - theme: alt
      text: GitHub
      link: https://github.com/EldrexDelosReyesBula/devdiff

features:
  - icon: 🔒
    title: Privacy First
    details: "Runs locally. Code stays on device with on-device LLMs (Ollama/WebGPU). No telemetry."
  - icon: 🤖
    title: Bring Your Own AI
    details: "Use Ollama, OpenAI, Anthropic, or WebGPU. Full control over AI models and endpoints."
  - icon: 📝
    title: Intelligent Changelogs
    details: "Generates clear, human-readable explanations of code changes beyond simple diffs."
  - icon: 🎭
    title: 8 Personas
    details: "Developer, CEO, Educator, Robot, Analyst, Journalist, PM, Compliance perspectives."
  - icon: 📊
    title: Mermaid Diagrams
    details: "Architecture changes, dependency graphs, git timelines auto-generated from diffs."
  - icon: 🛡️
    title: Workspace Safety
    details: "Auto-checkpoints before AI operations to safeguard local workspace changes."
  - icon: 🌍
    title: 10 Compliance Frameworks
    details: "GDPR, HIPAA, SOC 2, FedRAMP, ISO 27001, and more. One command: `devdiff compliance apply`."
  - icon: 🆓
    title: Free & Open Source
    details: "MIT licensed. Open-source codebase with no usage limits or paid tiers."
---

## Quick Start

```bash
npm install -g @eldrex/cli
ollama pull llama3.2:3b
cd your-project
devdiff init
devdiff generate
```

[Full Guide →](/guide/getting-started)

## Trusted By Developers

DevDiff is designed for developers who care about privacy, security, and understanding their codebase.

- ✅ **Zero cloud leakage** — data classification engine blocks secrets from leaving your machine
- ✅ **Offline capable** — all AI runs locally with Ollama
- ✅ **No telemetry** — we don't track anything
- ✅ **MIT licensed** — truly free, forever

## Sponsors & Support

DevDiff is funded entirely by developer donations and community support.

- [Sponsor on Ko-fi](https://ko-fi.com/landecsorg/)
- [Donate via PayPal](https://www.paypal.com/paypalme/eldrexbula)
