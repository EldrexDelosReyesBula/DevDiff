import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIRouter, DiffStats } from '../../src/ai/router'
import { DevDiffConfig } from '../../src/config/schema'

describe('AIRouter and cache', () => {
  const mockConfig: DevDiffConfig = {
    ai: {
      providers: [
        {
          name: 'first-local',
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
    exclude: [],
    cache: {
      enabled: true,
      path: '.devdiff/cache-test.json',
    },
    format: 'markdown',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('respects dry-run option without calling provider', async () => {
    const router = new AIRouter(mockConfig)
    const result = await router.getExplanation('some diff', { dryRun: true })
    
    expect(result.summary).toContain('[DRY RUN]')
  })

  it('routes correctly based on token length and complexity', () => {
    const router = new AIRouter(mockConfig)
    
    // Normal size diff
    const statsNormal: DiffStats = {
      fileCount: 2,
      totalChanges: 50,
      maxASTDepth: 3,
      hasBreakingChanges: false,
      estimatedTokens: 1000,
    }

    const decision1 = router.route('standard', statsNormal)
    expect(decision1.model).toBe('ollama://codellama:13b')
    expect(decision1.willTruncate).toBe(false)

    // Large and complex diff (triggers truncation/云 or other model)
    const statsLarge: DiffStats = {
      fileCount: 15,
      totalChanges: 600,
      maxASTDepth: 8,
      hasBreakingChanges: true,
      estimatedTokens: 150000,
    }

    const decision2 = router.route('exhaustive', statsLarge)
    expect(decision2.willTruncate).toBe(true)
  })
})
