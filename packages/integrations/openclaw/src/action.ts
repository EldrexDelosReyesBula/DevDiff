import { OpenClawAdapter, OpenClawSkillContext } from './adapter'

export class OpenClawActionHandler {
  private adapter: OpenClawAdapter

  constructor(gatewayUrl?: string) {
    this.adapter = new OpenClawAdapter(gatewayUrl)
  }

  /**
   * Executes the pipeline skill action and returns the output variables for OpenClaw.
   */
  async handle(context: OpenClawSkillContext): Promise<{
    changelog: string
    mermaid?: string
    summary: string
    stats: any
  }> {
    const gatewayResult = await this.adapter.runSkill(context)
    
    return {
      changelog: gatewayResult.results?.changelog || '',
      mermaid: gatewayResult.results?.mermaid || '',
      summary: gatewayResult.results?.markdown || '',
      stats: gatewayResult.results?.stats || {},
    }
  }
}
