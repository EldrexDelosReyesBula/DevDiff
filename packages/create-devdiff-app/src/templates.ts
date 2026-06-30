export interface Template {
  id: string;
  name: string;
  description: string;
  includes: string[];
  files: Record<string, string>;
}

export const TEMPLATES: Record<string, Template> = {
  "enterprise-dashboard": {
    id: "enterprise-dashboard",
    name: "Enterprise Dashboard",
    description:
      "Full-featured changelog dashboard with team management, Slack integration, and compliance reporting",
    includes: [
      "DevDiff SDK integration",
      "Custom branding/theming",
      "Multi-team support",
      "Slack/Discord/Teams webhooks",
      "Compliance report generation",
      "Audit log viewer",
      "Role-based access control",
    ],
    files: {
      "package.json": JSON.stringify(
        {
          name: "{{PROJECT_NAME}}",
          version: "0.1.0",
          private: true,
          type: "module",
          scripts: {
            dev: "node src/server.js",
            start: "node src/server.js",
            "generate-changelog": "devdiff generate --format markdown",
          },
          dependencies: {
            "@eldrex/core": "^1.0.3",
            express: "^4.19.0",
            marked: "^13.0.0",
          },
        },
        null,
        2,
      ),

      "src/server.js": `import express from 'express'
import path from 'path'
import { generateChangelog, loadConfig } from '@eldrex/core'

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.static('public'))
app.use(express.json())

// Load config
const config = await loadConfig()

app.get('/api/changelog', async (req, res) => {
  const { persona = 'developer', since = 'HEAD~5..HEAD' } = req.query
  try {
    const { execSync } = await import('child_process')
    const diffText = execSync(\`git diff \${since}\`).toString()
    const result = await generateChangelog({ diffText, repoPath: process.cwd(), persona })
    res.json({ success: true, changelog: result.markdown })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(\`🚀 {{PROJECT_NAME}} dashboard: http://localhost:\${PORT}\`)
})
`,

      ".devdiff.config.js": `export default {
  version: '1.0.3',
  ai: {
    provider: 'ollama://llama3.2:3b',
  },
  output: {
    format: 'markdown',
    persona: 'developer',
  },
}
`,

      "README.md": `# {{PROJECT_NAME}}\n\nEnterprise DevDiff-powered changelog dashboard.\n\n## Setup\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen http://localhost:4000\n`,

      ".env.example": `# Slack webhook for notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Optional: Encrypt audit logs
DEVDIFF_AUDIT_KEY=your-32-char-secret-key-here

# SMTP for email output
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
`,

      ".gitignore": `node_modules\n.env\ndist\n.devdiff-cache.json\n`,
    },
  },

  "startup-changelog": {
    id: "startup-changelog",
    name: "Startup Changelog",
    description:
      "Simple, beautiful public changelog page with RSS feed and email integration",
    includes: [
      "DevDiff SDK integration",
      "Public changelog page",
      "SEO optimized",
      "RSS feed",
      "Email newsletter stub",
      "Custom domain support",
    ],
    files: {
      "package.json": JSON.stringify(
        {
          name: "{{PROJECT_NAME}}",
          version: "0.1.0",
          private: true,
          type: "module",
          scripts: {
            dev: "node src/server.js",
            "sync-changelog":
              "devdiff generate -f markdown -o public/changelog.md",
          },
          dependencies: {
            "@eldrex/core": "^1.0.3",
            express: "^4.19.0",
          },
        },
        null,
        2,
      ),

      "src/server.js": `import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import { marked } from 'marked'

const app = express()
const PORT = process.env.PORT || 3000

// Serve changelog as HTML
app.get('/', async (req, res) => {
  let markdown = ''
  try { markdown = await fs.readFile('public/changelog.md', 'utf-8') } catch {}
  const html = marked.parse(markdown || '# No changelog yet\\n\\nRun: devdiff generate -o public/changelog.md')
  res.send(\`<!DOCTYPE html><html><head><title>{{PROJECT_NAME}} Changelog</title>
<meta name="description" content="What\\'s new in {{PROJECT_NAME}}">
<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="{{PROJECT_NAME}} Changelog">
<style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.7;}</style>
</head><body>\${html}</body></html>\`)
})

// RSS feed
app.get('/rss.xml', async (req, res) => {
  res.header('Content-Type', 'application/rss+xml')
  res.send(\`<?xml version="1.0"?><rss version="2.0"><channel>
<title>{{PROJECT_NAME}} Changelog</title>
<link>https://your-domain.com</link>
<description>Latest updates from {{PROJECT_NAME}}</description>
</channel></rss>\`)
})

app.listen(PORT, () => console.log(\`Changelog: http://localhost:\${PORT}\`))
`,

      ".devdiff.config.js": `export default {
  version: '1.0.3',
  ai: { provider: 'ollama://llama3.2:3b' },
  output: { format: 'markdown', persona: 'journalist' },
}
`,

      "README.md": `# {{PROJECT_NAME}} Changelog\n\nPublic changelog powered by DevDiff.\n\n## Setup\n\n\`\`\`bash\nnpm install\n# Generate initial changelog\nnpm run sync-changelog\n# Start server\nnpm run dev\n\`\`\`\n`,

      ".gitignore": `node_modules\n.env\n`,
    },
  },

  "ci-integration": {
    id: "ci-integration",
    name: "CI/CD Integration",
    description:
      "GitHub Actions + GitLab CI integration for automated changelog generation on every PR",
    includes: [
      "GitHub Actions workflow",
      "GitLab CI template",
      "PR comment automation",
      "Release note generation",
      "Slack notification on deploy",
    ],
    files: {
      ".github/workflows/devdiff.yml": `name: DevDiff Changelog

on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 50

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install DevDiff
        run: npm install -g @eldrex/cli

      - name: Generate Changelog
        env:
          OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
        run: |
          devdiff generate \\
            --range origin/\${{ github.base_ref }}..HEAD \\
            --persona developer \\
            --format markdown \\
            --output changelog-draft.md

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs')
            const changelog = fs.readFileSync('changelog-draft.md', 'utf8')
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: \`## 🤖 DevDiff Changelog\\n\\n\${changelog}\`
            })

      - name: Upload Changelog Artifact
        uses: actions/upload-artifact@v4
        with:
          name: changelog-\${{ github.sha }}
          path: changelog-draft.md
`,

      ".gitlab-ci.yml": `devdiff-changelog:
  stage: build
  image: node:20
  only:
    - merge_requests
    - main
  script:
    - npm install -g @eldrex/cli
    - devdiff generate --range origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME..HEAD --format markdown --output changelog-draft.md
  artifacts:
    paths:
      - changelog-draft.md
    expire_in: 7 days
`,

      ".devdiff.config.js": `export default {
  version: '1.0.3',
  ai: {
    // Use OpenAI in CI (set OPENAI_API_KEY secret in GitHub/GitLab)
    provider: 'openai://gpt-4o-mini',
  },
  output: { format: 'markdown', persona: 'developer' },
}
`,

      "README.md": `# {{PROJECT_NAME}} — DevDiff CI Integration\n\nAutomated changelog generation on every PR.\n\n## Setup\n\n1. Add \`OPENAI_API_KEY\` to your GitHub/GitLab secrets\n2. Push to a branch and open a PR\n3. DevDiff will comment an AI-generated changelog on the PR\n`,
    },
  },

  minimal: {
    id: "minimal",
    name: "Minimal Setup",
    description:
      "Bare-bones DevDiff SDK integration — your canvas for custom workflows",
    includes: [
      "DevDiff SDK (@eldrex/core)",
      "Basic .devdiff.config.js",
      "Example generate script",
      "TypeScript ready",
    ],
    files: {
      "package.json": JSON.stringify(
        {
          name: "{{PROJECT_NAME}}",
          version: "0.1.0",
          private: true,
          type: "module",
          scripts: {
            generate: "node src/generate.js",
            dev: "node --watch src/generate.js",
          },
          dependencies: {
            "@eldrex/core": "^1.0.3",
          },
        },
        null,
        2,
      ),

      "src/generate.js": `import { generateChangelog } from '@eldrex/core'
import { execSync } from 'child_process'

const diffText = execSync('git diff HEAD~5..HEAD').toString()

const result = await generateChangelog({
  diffText,
  repoPath: process.cwd(),
  persona: 'developer',
})

console.log(result.markdown)
`,

      ".devdiff.config.js": `export default {
  version: '1.0.3',
  ai: { provider: 'ollama://llama3.2:3b' },
  output: { format: 'markdown', persona: 'developer' },
}
`,

      "README.md": `# {{PROJECT_NAME}}\n\nMinimal DevDiff integration.\n\n## Usage\n\n\`\`\`bash\nnpm install\nnpm run generate\n\`\`\`\n`,

      ".gitignore": `node_modules\n.env\n`,
    },
  },
};
