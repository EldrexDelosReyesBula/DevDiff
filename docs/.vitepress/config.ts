import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DevDiff',
  description: 'Privacy-first, BYOAI changelog intelligence for developers',
  lang: 'en-US',
  
  head: [
    ['link', { rel: 'icon', href: '/devdiff-logo.svg' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
  ],

  themeConfig: {
    logo: '/devdiff-logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: 'Integrations', link: '/integrations/vscode' },
      { 
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: '/changelog/' },
          { text: 'Contributing', link: '/contributing/development' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
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
            { text: 'Security Model', link: '/guide/security' },
            { text: 'Privacy Guarantees', link: '/guide/privacy' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'CI/CD Integration', link: '/guide/ci-cd' },
            { text: 'Team Setups', link: '/guide/team-setups' },
            { text: 'Custom Providers', link: '/providers/custom' },
            { text: 'Plugin System', link: '/guide/plugins' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          ]
        }
      ],
      '/providers/': [
        { text: 'Ollama (Local)', link: '/providers/ollama' },
        { text: 'Transformers.js', link: '/providers/transformers-js' },
        { text: 'WebLLM (Browser)', link: '/providers/webllm' },
        { text: 'OpenAI', link: '/providers/openai' },
        { text: 'Anthropic', link: '/providers/anthropic' },
        { text: 'Google Gemini', link: '/providers/gemini' },
        { text: 'Groq', link: '/providers/groq' },
        { text: 'DeepSeek', link: '/providers/deepseek' },
        { text: 'Custom Provider', link: '/providers/custom' },
      ],
      '/integrations/': [
        { text: 'VS Code Extension', link: '/integrations/vscode' },
        { text: 'Vite Plugin', link: '/integrations/vite' },
        { text: 'GitHub Actions', link: '/integrations/github-actions' },
        { text: 'GitLab CI', link: '/integrations/gitlab-ci' },
        { text: 'Linear Integration', link: '/integrations/linear' },
        { text: 'Jira Integration', link: '/integrations/jira' },
        { text: 'Slack Notifications', link: '/integrations/slack' },
      ],
      '/api/': [
        { text: 'Core Library', link: '/api/core' },
        { text: 'CLI Reference', link: '/api/cli' },
        { text: 'Configuration Schema', link: '/api/configuration' },
        { text: 'Provider API', link: '/api/provider-api' },
        { text: 'Plugin API', link: '/api/plugin-api' },
      ],
      '/contributing/': [
        { text: 'Code of Conduct', link: '/contributing/code-of-conduct' },
        { text: 'Development Guide', link: '/contributing/development' },
        { text: 'Architecture', link: '/contributing/architecture' },
        { text: 'Testing', link: '/contributing/testing' },
        { text: 'Documentation', link: '/contributing/documentation' },
        { text: 'Security Reporting', link: '/contributing/security-reporting' },
        { text: 'Governance', link: '/contributing/governance' },
        { text: 'Roadmap', link: '/contributing/roadmap' },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EldrexDelosReyesBula/devdiff' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2026-present DevDiff Contributors`
    },

    editLink: {
      pattern: 'https://github.com/EldrexDelosReyesBula/devdiff/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: 'github-dark',
    lineNumbers: true
  }
})
