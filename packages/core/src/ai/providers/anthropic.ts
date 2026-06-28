import { AIProvider, AIExplanationResult, SYSTEM_PROMPT, parseAIJSONResponse } from './base'

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY
  }

  async generateExplanation(diffText: string, modelName: string): Promise<AIExplanationResult> {
    const key = this.apiKey
    if (!key) {
      throw new Error('Anthropic API Key is not configured.')
    }

    const url = 'https://api.anthropic.com/v1/messages'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Analyze this diff:\n${diffText}` }],
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        throw new Error(`Anthropic API returned status ${response.status}: ${await response.text()}`)
      }

      const data = (await response.json()) as {
        content?: { text?: string }[]
      }

      const text = data.content?.[0]?.text || ''
      return parseAIJSONResponse(text)
    } catch (error) {
      console.error('Anthropic execution error:', error)
      throw error
    }
  }
}
