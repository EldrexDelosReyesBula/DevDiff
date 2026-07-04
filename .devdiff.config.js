// DevDiff Configuration
// Powered entirely by local Ollama

export default {
  ai: {
    providers: [
      {
        name: 'local-ollama',
        url: 'ollama://llama3.2:3b',
        priority: 1,
      }
    ],
    routing: {
      strategy: 'priority',
      localOnly: true, // Forces local execution, disabling cloud fallback (Gemini/Claude/OpenAI)
    },
  },
  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'out/**',
    'pnpm-lock.yaml',
    'package-lock.json',
  ],
  cache: {
    enabled: true,
    path: '.devdiff/cache.json',
  },
  format: 'markdown',
};
