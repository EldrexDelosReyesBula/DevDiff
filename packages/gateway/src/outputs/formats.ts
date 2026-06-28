export const OUTPUT_FORMATS = {
  markdown: {
    name: 'Markdown',
    extension: '.md',
    mimeType: 'text/markdown',
  },
  mermaid: {
    name: 'Mermaid Diagram',
    extension: '.mmd',
    mimeType: 'text/plain',
    sanitize: true, // Strict ID sanitization
  },
  json: {
    name: 'JSON',
    extension: '.json',
    mimeType: 'application/json',
  },
  slack: {
    name: 'Slack Message',
    channel: true,
    streaming: true, // Progressive updates
  },
  discord: {
    name: 'Discord Message',
    channel: true,
    streaming: true,
  },
  teams: {
    name: 'Microsoft Teams',
    channel: true,
  },
  email: {
    name: 'Email',
    smtp: true,
  },
  notion: {
    name: 'Notion Page',
    api: true,
    append: true,
  },
  confluence: {
    name: 'Confluence Page',
    api: true,
  },
  obsidian: {
    name: 'Obsidian Vault',
    extension: '.md',
    vault: true,
  }
};
