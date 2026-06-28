import { DevDiffConfig } from './schema'

export const DEFAULTS: DevDiffConfig = {
  ai: {
    providers: [
      {
        name: 'local-ollama',
        url: 'ollama://llama3.2:3b',
        priority: 1,
      },
    ],
    routing: {
      strategy: 'priority',
      complexityThreshold: 0.6,
      localOnly: true,
    },
  },
  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'out/**',
    '.next/**',
    '.nuxt/**',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    '*.log',
    '.git/**',
    '.devdiff/**',
  ],
  cache: {
    enabled: true,
    path: '.devdiff/cache.json',
  },
  format: 'markdown',
}
