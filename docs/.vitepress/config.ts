import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid({
  title: "DevDiff",
  description: "Privacy-first, BYOAI changelog intelligence for developers",
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    math: false,
    mermaid: true,
  },
  mermaid: {
    theme: "default",
  },
  sitemap: {
    hostname: "https://devdiff.vercel.app",
  },

  head: [
    // Favicon & Icons
    ["link", { rel: "icon", type: "image/svg+xml", href: "/devdiff-logo.svg" }],
    ["link", { rel: "icon", type: "image/png", href: "/devdiff.png" }],
    ["link", { rel: "apple-touch-icon", href: "/devdiff.png" }],

    // Theme Color
    ["meta", { name: "theme-color", content: "#6366f1" }],

    // Open Graph
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "en_US" }],
    ["meta", { property: "og:site_name", content: "DevDiff Documentation" }],
    ["meta", { property: "og:title", content: "DevDiff — Your Codebase's Memory" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Privacy-first, BYOAI changelog intelligence that runs entirely on your machine. No telemetry. No cloud servers. Your code stays on your device.",
      },
    ],
    ["meta", { property: "og:url", content: "https://devdiff.vercel.app" }],
    ["meta", { property: "og:image", content: "https://devdiff.vercel.app/devdiff-og.png" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:alt", content: "DevDiff — Privacy-first AI Changelog Intelligence" }],

    // Twitter Card
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:site", content: "@devdiff" }],
    ["meta", { name: "twitter:title", content: "DevDiff — Your Codebase's Memory" }],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Privacy-first, BYOAI changelog intelligence that runs entirely on your machine. No telemetry. No cloud servers. Your code stays on your device.",
      },
    ],
    ["meta", { name: "twitter:image", content: "https://devdiff.vercel.app/devdiff-og.png" }],

    // Additional SEO
    ["meta", { name: "author", content: "Eldrex Delos Reyes Bula" }],
    ["meta", { name: "robots", content: "index, follow" }],
    ["meta", { name: "keywords", content: "devdiff, changelog, ai, developer tools, privacy, local-first, git, byoai, ollama, VS Code, IDE" }],
    ["link", { rel: "canonical", href: "https://devdiff.vercel.app" }],
  ],

  themeConfig: {
    logo: "/devdiff-logo.svg",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "AI Providers", link: "/ai-providers/overview" },
      { text: "Enterprise", link: "/enterprise/compliance-frameworks" },
      { text: "Troubleshooting", link: "/troubleshooting/" },
      { text: "API", link: "/api/core" },
      { text: "Blog", link: "/blog/2026-07-05-5000-downloads" },
      {
        text: "v1.5.0",
        items: [
          { text: "Changelog", link: "/versioning/changelog" },
          { text: "Version Policy", link: "/versioning/policy" },
          {
            text: "GitHub Releases",
            link: "https://github.com/EldrexDelosReyesBula/devdiff/releases",
          },
          {
            text: "Report a Bug",
            link: "https://github.com/EldrexDelosReyesBula/devdiff/issues",
          },
        ],
      },
    ],

    sidebar: [
      {
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Installation", link: "/guide/installation" },
          { text: "Quick Start", link: "/guide/quick-start" },
          { text: "Configuration", link: "/guide/configuration" },
          { text: "Design System", link: "/guide/design-system" },
        ],
      },
      {
        text: "Features (v1.5.0)",
        collapsed: false,
        items: [
          { text: "Persistent Memory (v1.5.0)", link: "/features/persistent-memory" },
          { text: "Conversational Q&A (v1.5.0)", link: "/features/conversational-qa" },
          { text: "Automated Versioning (v1.5.0)", link: "/features/automated-versioning" },
          { text: "Universal Detection (v1.5.0)", link: "/features/universal-detection" },
          { text: "Natural Changelogs", link: "/features/natural-changelogs" },
          { text: "SKILL.md Knowledge Base", link: "/features/skill-md" },
          { text: "Developer Sovereignty", link: "/guide/developer-sovereignty" },
          { text: "IDE Integration (v1.5.0)", link: "/features/ide-integration" },
          { text: "Personas", link: "/features/personas" },
          { text: "Output Formats", link: "/features/output-formats" },
          { text: "Multi-Agent Swarms", link: "/features/multi-agent" },
          { text: "Compliance Engine", link: "/features/compliance" },
          { text: "Project Context", link: "/features/project-context" },
          { text: "MVP Mode", link: "/features/mvp-mode" },
        ],
      },
      {
        text: "Core Concepts",
        collapsed: true,
        items: [
          { text: "How It Works", link: "/guide/how-it-works" },
          { text: "Language & Framework Matrix", link: "/guide/language-support" },
          { text: "Bring Your Own AI", link: "/guide/byoai" },
          { text: "Token Optimization", link: "/guide/token-optimization" },
          { text: "Offline-First Design", link: "/guide/offline-first" },
          { text: "Large Codebase Strategies", link: "/guide/large-codebase-strategies" },
          { text: "Performance Tuning", link: "/guide/performance-tuning" },
        ],
      },
      {
        text: "AI Providers",
        collapsed: true,
        items: [
          { text: "Overview & Selection", link: "/ai-providers/overview" },
          { text: "Ollama (Local, Free)", link: "/ai-providers/ollama-setup" },
          { text: "OpenAI", link: "/ai-providers/openai-setup" },
          { text: "Anthropic", link: "/ai-providers/anthropic-setup" },
          { text: "WebGPU (Browser)", link: "/ai-providers/webgpu-setup" },
          { text: "Custom Provider", link: "/ai-providers/custom-provider" },
        ],
      },
      {
        text: "Security & Compliance",
        collapsed: true,
        items: [
          { text: "Security Architecture", link: "/guide/security" },
          { text: "Developer Sovereignty", link: "/guide/developer-sovereignty" },
          { text: "Privacy Guarantees", link: "/guide/privacy" },
          { text: "Compliance Frameworks", link: "/guide/compliance" },
          { text: "Vulnerability Disclosure", link: "/security/disclosure" },
        ],
      },
      {
        text: "Enterprise Solutions",
        collapsed: true,
        items: [
          { text: "Compliance Frameworks", link: "/enterprise/compliance-frameworks" },
          { text: "Air-Gapped Environments", link: "/enterprise/air-gapped-environments" },
          { text: "Proprietary Codebases", link: "/enterprise/proprietary-codebases" },
        ],
      },
      {
        text: "Integrations & Extensions",
        collapsed: true,
        items: [
          { text: "VS Code Extension", link: "/integrations/vscode" },
          { text: "Vite Plugin", link: "/integrations/vite-plugin" },
          { text: "MCP Server", link: "/integrations/mcp-server" },
          { text: "OpenClaw Supervisor", link: "/integrations/openclaw" },
          { text: "Slack & Messaging Channels", link: "/integrations/slack" },
          { text: "GitHub Actions", link: "/integrations/github-actions" },
          { text: "GitLab CI", link: "/integrations/gitlab-ci" },
          { text: "Plugins Overview", link: "/plugins/overview" },
        ],
      },
      {
        text: "API Reference",
        collapsed: true,
        items: [
          { text: "Core API (@eldrex/core)", link: "/api/core" },
          { text: "CLI Reference", link: "/api/cli" },
          { text: "SDK Reference", link: "/api/sdk" },
        ],
      },
      {
        text: "Performance & Testing",
        collapsed: true,
        items: [
          { text: "Benchmark Overview", link: "/stress-testing/" },
          { text: "Concurrent Operations", link: "/stress-testing/concurrent-operations" },
          { text: "Large Diff Scenarios", link: "/stress-testing/large-diff-scenarios" },
          { text: "Memory Profiling", link: "/stress-testing/memory-profiling" },
        ],
      },
      {
        text: "Troubleshooting",
        collapsed: true,
        items: [
          { text: "Troubleshooting Overview", link: "/troubleshooting/" },
          { text: "Troubleshooting Ollama", link: "/guide/troubleshooting-ollama-timeouts" },
          { text: "Disaster Recovery", link: "/guide/disaster-recovery" },
        ],
      },
      {
        text: "Changelog & Policy",
        collapsed: true,
        items: [
          { text: "Workspace Changelog", link: "/changelog" },
          { text: "Version Changelog", link: "/versioning/changelog" },
          { text: "Version Policy", link: "/versioning/policy" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/EldrexDelosReyesBula/devdiff",
      },
    ],

    footer: {
      message:
        'Released under the <a href="https://github.com/EldrexDelosReyesBula/devdiff/blob/main/LICENSE">MIT License</a>. | <a href="/legal/privacy-policy">Privacy Policy</a> | <a href="/legal/terms-of-use">Terms of Use</a> | <a href="/legal/safety">Safety</a> | <a href="https://github.com/EldrexDelosReyesBula/devdiff/blob/main/SUPPORT.md">Support</a>',
      copyright: "Copyright © 2026 Eldrex Delos Reyes Bula and Contributors",
    },

    search: {
      provider: "local",
    },

    editLink: {
      pattern:
        "https://github.com/EldrexDelosReyesBula/devdiff/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
