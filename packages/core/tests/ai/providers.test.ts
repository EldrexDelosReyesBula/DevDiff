import { describe, it, expect } from 'vitest'
import { parseAIJSONResponse } from '../../src/ai/providers/base'

describe('parseAIJSONResponse', () => {
  it('parses correct raw JSON response', () => {
    const raw = `{
      "summary": "Implement new feature",
      "impact": "minor",
      "breaking": false,
      "files": [
        { "path": "index.ts", "explanation": "adds exports" }
      ],
      "relatedIssues": ["#123"]
    }`
    const result = parseAIJSONResponse(raw)
    expect(result.summary).toBe('Implement new feature')
    expect(result.impact).toBe('minor')
    expect(result.breaking).toBe(false)
    expect(result.files).toHaveLength(1)
    expect(result.relatedIssues).toContain('#123')
  })

  it('parses JSON wrapped in markdown code blocks', () => {
    const raw = `\`\`\`json
{
  "summary": "Fix buggy behavior",
  "impact": "major",
  "breaking": true,
  "files": [],
  "relatedIssues": []
}
\`\`\``
    const result = parseAIJSONResponse(raw)
    expect(result.summary).toBe('Fix buggy behavior')
    expect(result.impact).toBe('major')
    expect(result.breaking).toBe(true)
  })

  it('handles invalid JSON gracefully', () => {
    const raw = `Hello this is not JSON`
    const result = parseAIJSONResponse(raw)
    expect(result.summary).toBe('Hello this is not JSON')
    expect(result.impact).toBe('minor')
    expect(result.breaking).toBe(false)
  })
})
