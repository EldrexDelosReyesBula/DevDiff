import { AIExplanationResult } from '../ai/providers/base'

export function formatJSON(result: AIExplanationResult): string {
  return JSON.stringify(
    {
      generator: 'DevDiff',
      timestamp: new Date().toISOString(),
      ...result,
    },
    null,
    2
  )
}
