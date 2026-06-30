import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DevDiff',
  description: 'Privacy-first, BYOAI changelog intelligence for developers',
  lang: 'en-US',
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'og:title', content: 'DevDiff — Your Codebase\'s Memory' }],
    ['meta', { name: 'og:description', content: 'Privacy-first, BYOAI changelog intelligence for developers.' }],
  ],

  themeConfig: {
    logo: '/devdiff-logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'AI Providers', link: '/ai-providers/ollama-setup' },
      { text: 'Troubleshooting', link: '/troubleshooting/' },
      { text: 'API', link: '/api/core' },
      {
        text: 'v1.0.3',
        items: [
          { text: 'Changelog', link: '/versioning/changelog' },
          { text: 'Version Policy', link: '/versioning/policy' },
          { text: 'GitHub Releases', link: 'https://github.com/EldrexDelosReyesBula/devdiff/releases' },
          { text: 'Report a Bug', link: 'https://github.com/EldrexDelosReyesBula/devdiff/issues' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Configuration', link: '/guide/configuration' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'How It Works', link: '/guide/how-it-works' },
            { text: 'Bring Your Own AI', link: '/guide/byoai' },
            { text: 'Token Optimization', link: '/guide/token-optimization' },
            { text: 'Offline-First Design', link: '/guide/offline-first' },
          ]
        },
        {
          text: 'Security & Compliance',
          items: [
            { text: 'Security Model', link: '/guide/security' },
            { text: 'Privacy Guarantees', link: '/guide/privacy' },
            { text: 'Compliance Frameworks', link: '/guide/compliance' },
          ]
        },
        {
          text: 'Advanced Features',
          items: [
            { text: 'Multi-Agent Swarms', link: '/guide/multi-agent' },
            { text: 'Vibe-Coding Mode', link: '/guide/vibe-coding' },
            { text: 'Disaster Recovery', link: '/guide/disaster-recovery' },
            { text: 'WebGPU Inference', link: '/guide/webgpu-inference' },
            { text: 'CI/CD Integration', link: '/guide/ci-cd' },
            { text: 'Team Setups', link: '/guide/team-setups' },
          ]
        },
      ],

      '/ai-providers/': [
        {
          text: 'AI Providers',
          items: [
            { text: 'Ollama (Local, Free)', link: '/ai-providers/ollama-setup' },
            { text: 'OpenAI', link: '/ai-providers/openai-setup' },
            { text: 'Anthropic', link: '/ai-providers/anthropic-setup' },
            { text: 'WebGPU (Browser)', link: '/ai-providers/webgpu-setup' },
            { text: 'Custom Provider', link: '/ai-providers/custom-provider' },
          ]
        }
      ],

      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Personas', link: '/features/personas' },
            { text: 'Output Formats', link: '/features/output-formats' },
            { text: 'Multi-Agent', link: '/features/multi-agent' },
            { text: 'Compliance', link: '/features/compliance' },
            { text: 'Playground', link: '/features/playground' },
          ]
        }
      ],

      '/integrations/': [
        {
          text: 'Integrations',
          items: [
            { text: 'VS Code Extension', link: '/integrations/vscode' },
            { text: 'GitHub Actions', link: '/integrations/github-actions' },
            { text: 'Vite Plugin', link: '/integrations/vite-plugin' },
            { text: 'MCP Server', link: '/integrations/mcp-server' },
            { text: 'OpenClaw', link: '/integrations/openclaw' },
          ]
        }
      ],

      '/troubleshooting/': [
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Overview', link: '/troubleshooting/' },
            { text: 'Ollama Errors', link: '/troubleshooting/ollama-errors' },
            { text: 'Windows Issues', link: '/troubleshooting/windows-issues' },
            { text: 'macOS Issues', link: '/troubleshooting/macos-issues' },
            { text: 'Linux Issues', link: '/troubleshooting/linux-issues' },
            { text: 'Network Errors', link: '/troubleshooting/network-errors' },
            { text: 'Quick Fixes', link: '/troubleshooting/common-fixes' },
          ]
        }
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core API', link: '/api/core' },
            { text: 'CLI Reference', link: '/api/cli' },
            { text: 'JavaScript SDK', link: '/api/sdk' },
            { text: 'Webhook API', link: '/api/webhook' },
          ]
        }
      ],

      '/versioning/': [
        {
          text: 'Versioning',
          items: [
            { text: 'Changelog', link: '/versioning/changelog' },
            { text: 'Version Policy', link: '/versioning/policy' },
          ]
        }
      ],

      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Development Setup', link: '/contributing/development' },
            { text: 'Architecture', link: '/contributing/architecture' },
            { text: 'Testing Guide', link: '/contributing/testing' },
            { text: 'Roadmap', link: '/contributing/roadmap' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EldrexDelosReyesBula/devdiff' },
    ],

    footer: {
      message: 'Released under the <a href="https://github.com/EldrexDelosReyesBula/devdiff/blob/main/LICENSE">MIT License</a>. | <a href="https://github.com/EldrexDelosReyesBula/devdiff/blob/main/SUPPORT.md">Support</a>',
      copyright: 'Copyright © 2026 Eldrex Delos Reyes Bula and Contributors'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/EldrexDelosReyesBula/devdiff/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
