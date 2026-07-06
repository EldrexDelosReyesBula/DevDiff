import { defineConfig } from "vitepress";

export default defineConfig({
  title: "DevDiff",
  description: "Privacy-first, BYOAI changelog intelligence for developers",
  lang: "en-US",
  ignoreDeadLinks: true,

  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: "https://devdiff.vercel.app",
  },

  transformPageData(pageData) {
    const cleanPath = pageData.relativePath
      .replace(/\.md$/, "")
      .replace(/index$/, "");
    const canonicalUrl = `https://devdiff.vercel.app/${cleanPath}`;

    // Initialize head if not present
    pageData.frontmatter.head = pageData.frontmatter.head || [];

    // Inject dynamic canonical link
    pageData.frontmatter.head.push([
      "link",
      { rel: "canonical", href: canonicalUrl },
    ]);

    // Inject dynamic Open Graph & Twitter meta tags
    const title = pageData.title
      ? `${pageData.title} | DevDiff`
      : "DevDiff — AI-Powered Changelog Intelligence";
    const desc =
      pageData.description ||
      "Privacy-first, BYOAI changelog intelligence for developers";

    pageData.frontmatter.head.push([
      "meta",
      { property: "og:title", content: title },
    ]);
    pageData.frontmatter.head.push([
      "meta",
      { property: "og:description", content: desc },
    ]);
    pageData.frontmatter.head.push([
      "meta",
      { name: "twitter:title", content: title },
    ]);
    pageData.frontmatter.head.push([
      "meta",
      { name: "twitter:description", content: desc },
    ]);
  },

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#6366f1" }],
    [
      "meta",
      {
        name: "description",
        content:
          "DevDiff — Privacy-first, BYOAI changelog intelligence. AI-powered git diff explanations that run entirely on your machine. Free and open source.",
      },
    ],
    [
      "meta",
      {
        name: "keywords",
        content:
          "changelog generator, git diff explainer, AI changelog, privacy-first AI, local AI, Ollama, developer tools, open source, BYOAI, code intelligence, git history, automated changelog, vibe coding, code review AI",
      },
    ],

    // Open Graph
    [
      "meta",
      {
        property: "og:title",
        content: "DevDiff — AI-Powered Changelog Intelligence",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Privacy-first git diff explanations using local AI. No cloud required. Free and open source.",
      },
    ],
    [
      "meta",
      {
        property: "og:image",
        content: "https://devdiff.vercel.app/og-image.png",
      },
    ],
    ["meta", { property: "og:url", content: "https://devdiff.vercel.app" }],
    ["meta", { property: "og:type", content: "website" }],

    // Twitter Card
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      { name: "twitter:title", content: "DevDiff — AI Changelog Intelligence" },
    ],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "Privacy-first git diff explanations using local AI. Free and open source.",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://devdiff.vercel.app/og-image.png",
      },
    ],

    // Canonical URL is injected dynamically in transformPageData below

    // Structured Data
    [
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "DevDiff",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Windows, macOS, Linux",
        description:
          "Privacy-first, BYOAI changelog intelligence for developers",
        url: "https://devdiff.vercel.app",
        license: "https://opensource.org/licenses/MIT",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      }),
    ],
  ],

  themeConfig: {
    logo: "/devdiff-logo.svg",

    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "AI Providers", link: "/ai-providers/overview" },
      { text: "Troubleshooting", link: "/troubleshooting/" },
      { text: "API", link: "/api/core" },
      { text: "Blog", link: "/blog/2026-07-05-5000-downloads" },
      {
        text: "v1.0.6",
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

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Installation", link: "/guide/installation" },
            { text: "Quick Start", link: "/guide/quick-start" },
            { text: "Configuration", link: "/guide/configuration" },
            { text: "Design System", link: "/guide/design-system" },
          ],
        },
        {
          text: "Core Concepts",
          items: [
            { text: "How It Works", link: "/guide/how-it-works" },
            { text: "Bring Your Own AI", link: "/guide/byoai" },
            { text: "Token Optimization", link: "/guide/token-optimization" },
            { text: "Offline-First Design", link: "/guide/offline-first" },
          ],
        },
        {
          text: "Security & Compliance",
          items: [
            { text: "Security Model", link: "/guide/security" },
            { text: "Privacy Guarantees", link: "/guide/privacy" },
            { text: "Compliance Frameworks", link: "/guide/compliance" },
          ],
        },
        {
          text: "Advanced Features",
          items: [
            { text: "Multi-Agent Swarms", link: "/guide/multi-agent" },
            { text: "Vibe-Coding Mode", link: "/guide/vibe-coding" },
            { text: "Disaster Recovery", link: "/guide/disaster-recovery" },
            { text: "WebGPU Inference", link: "/guide/webgpu-inference" },
            { text: "CI/CD Integration", link: "/guide/ci-cd" },
            { text: "Team Setups", link: "/guide/team-setups" },
          ],
        },
        {
          text: "Integrations",
          items: [
            { text: "VS Code Extension", link: "/integrations/vscode" },
            { text: "Vite Plugin", link: "/integrations/vite-plugin" },
            { text: "MCP Server", link: "/integrations/mcp-server" },
            { text: "OpenClaw Supervisor", link: "/integrations/openclaw" },
            { text: "Slack & Messaging Channels", link: "/integrations/slack" },
            { text: "GitHub Actions", link: "/integrations/github-actions" },
            { text: "GitLab CI", link: "/integrations/gitlab-ci" },
          ],
        },
      ],

      "/ai-providers/": [
        {
          text: "AI Providers",
          items: [
            { text: "Overview", link: "/ai-providers/overview" },
            {
              text: "Ollama (Local, Free)",
              link: "/ai-providers/ollama-setup",
            },
            { text: "OpenAI", link: "/ai-providers/openai-setup" },
            { text: "Anthropic", link: "/ai-providers/anthropic-setup" },
            { text: "WebGPU (Browser)", link: "/ai-providers/webgpu-setup" },
            { text: "Custom Provider", link: "/ai-providers/custom-provider" },
          ],
        },
      ],

      "/features/": [
        {
          text: "Features",
          items: [
            { text: "Personas", link: "/features/personas" },
            { text: "Output Formats", link: "/features/output-formats" },
            { text: "Multi-Agent", link: "/features/multi-agent" },
            { text: "Compliance", link: "/features/compliance" },
            { text: "Playground", link: "/features/playground" },
            { text: "Project Context", link: "/features/project-context" },
            { text: "MVP Mode", link: "/features/mvp-mode" },
          ],
        },
      ],

      "/security/": [
        {
          text: "Security",
          items: [
            { text: "Overview", link: "/security/overview" },
            { text: "Privacy", link: "/security/privacy" },
            { text: "Compliance Frameworks", link: "/security/compliance" },
            { text: "Disclosure", link: "/security/disclosure" },
            { text: "Network Guard", link: "/security/network-guard" },
          ],
        },
      ],

      "/compare/": [
        {
          text: "Comparisons",
          items: [
            { text: "Git Log vs DevDiff", link: "/compare/git-log-vs-devdiff" },
          ],
        },
      ],

      "/use-cases/": [
        {
          text: "Use Cases",
          items: [
            { text: "Open Source Maintainers", link: "/use-cases/open-source" },
            { text: "Enterprise Development", link: "/use-cases/enterprise" },
          ],
        },
      ],

      "/integrations/": [
        {
          text: "Integrations",
          items: [
            { text: "VS Code Extension", link: "/integrations/vscode" },
            { text: "GitHub Actions", link: "/integrations/github-actions" },
            { text: "GitLab CI", link: "/integrations/gitlab-ci" },
            { text: "Vite Plugin", link: "/integrations/vite-plugin" },
            { text: "MCP Server", link: "/integrations/mcp-server" },
            { text: "OpenClaw", link: "/integrations/openclaw" },
            { text: "Slack", link: "/integrations/slack" },
          ],
        },
      ],

      "/troubleshooting/": [
        {
          text: "Troubleshooting",
          items: [
            { text: "Overview", link: "/troubleshooting/" },
            { text: "Ollama Errors", link: "/troubleshooting/ollama-errors" },
            { text: "Git Errors", link: "/troubleshooting/git-errors" },
            { text: "Windows Issues", link: "/troubleshooting/windows-issues" },
            { text: "macOS Issues", link: "/troubleshooting/macos-issues" },
            { text: "Linux Issues", link: "/troubleshooting/linux-issues" },
            { text: "Network Errors", link: "/troubleshooting/network-errors" },
            { text: "Quick Fixes", link: "/troubleshooting/common-fixes" },
          ],
        },
      ],

      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "Core API", link: "/api/core" },
            { text: "CLI Reference", link: "/api/cli" },
            { text: "JavaScript SDK", link: "/api/sdk" },
            { text: "Webhook API", link: "/api/webhook" },
            { text: "Configuration", link: "/api/configuration" },
          ],
        },
      ],

      "/versioning/": [
        {
          text: "Versioning",
          items: [
            { text: "Changelog", link: "/versioning/changelog" },
            { text: "Version Policy", link: "/versioning/policy" },
            { text: "Limitations", link: "/limitations" },
          ],
        },
      ],

      "/contributing/": [
        {
          text: "Contributing",
          items: [
            { text: "Development Setup", link: "/contributing/development" },
            { text: "Architecture", link: "/contributing/architecture" },
            { text: "Testing Guide", link: "/contributing/testing" },
            { text: "Roadmap", link: "/contributing/roadmap" },
          ],
        },
      ],

      "/blog/": [
        {
          text: "Blog",
          items: [
            {
              text: "5,000+ Downloads in 20 Days",
              link: "/blog/2026-07-05-5000-downloads",
            },
            {
              text: "Never Write a Changelog Again",
              link: "/blog/never-write-a-changelog-again",
            },
            {
              text: "Your Code Never Leaves Your Machine",
              link: "/blog/your-code-never-leaves-your-machine",
            },
            {
              text: "The DevDiff Security Model",
              link: "/blog/devdiff-security-model",
            },
            {
              text: "The 3-Tap Rule for Developer UX",
              link: "/blog/the-3-tap-rule",
            },
          ],
        },
      ],

      "/legal/": [
        {
          text: "Legal",
          items: [
            { text: "Privacy Policy", link: "/legal/privacy-policy" },
            { text: "Terms of Use", link: "/legal/terms-of-use" },
            { text: "Safety Policy", link: "/legal/safety" },
            { text: "Security & Compliance", link: "/legal/security-compliance" },
          ],
        },
      ],
    },

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
