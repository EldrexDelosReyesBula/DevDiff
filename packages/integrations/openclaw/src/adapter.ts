export interface OpenClawSkillContext {
  inputs: {
    repository: string
    branch?: string
    since?: string
    persona?: string
    format?: string[]
    depth?: string
    language?: string
  }
  secrets?: Record<string, string>
}

export class OpenClawAdapter {
  private gatewayUrl: string

  constructor(gatewayUrl = 'http://localhost:3737') {
    this.gatewayUrl = gatewayUrl
  }

  /**
   * Translates the OpenClaw skill input and calls the DevDiff Gateway endpoint.
   */
  async runSkill(ctx: OpenClawSkillContext): Promise<any> {
    const payload = {
      source: 'manual',
      repository: {
        path: ctx.inputs.repository,
        branch: ctx.inputs.branch || 'main',
      },
      change_range: ctx.inputs.since
        ? {
            from: ctx.inputs.since.split('..')[0] || '',
            to: ctx.inputs.since.split('..')[1] || '',
          }
        : undefined,
      config: {
        persona: ctx.inputs.persona || 'developer',
        formats: ctx.inputs.format || ['markdown'],
        depth: ctx.inputs.depth || 'standard',
        language: ctx.inputs.language || 'en',
      },
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (ctx.secrets?.['DEVDIFF_API_KEY']) {
      headers['X-API-Key'] = ctx.secrets['DEVDIFF_API_KEY']
    }

    const response = await fetch(`${this.gatewayUrl}/api/v1/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenClaw adapter run failed: ${response.status} - ${errText}`)
    }

    return response.json()
  }
}
