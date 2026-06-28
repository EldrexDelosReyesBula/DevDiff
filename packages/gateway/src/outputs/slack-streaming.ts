import { DevDiffEvent } from '../queue/engine'

export interface PartialResult {
  progress: number
  stage: number // 0: Parse, 1: AST, 2: AI, 3: Outputs
  filesProcessed: number
  elapsedMs: number
  summary?: string
}

export class SlackStreamingOutputter {
  private lastStage = -1
  private slackClient: {
    chat: {
      postMessage: (params: any) => Promise<{ ts: string }>
      update: (params: any) => Promise<any>
    }
  }

  constructor() {
    // Simulated Slack Client for demo/integration
    this.slackClient = {
      chat: {
        postMessage: async (params: any) => {
          console.log(`[Slack API mock] postMessage:`, params)
          return { ts: String(Date.now()) }
        },
        update: async (params: any) => {
          console.log(`[Slack API mock] update ts=${params.ts}:`, params.text)
          return { ok: true }
        },
      },
    }
  }

  async deliver(event: DevDiffEvent, generator: AsyncGenerator<PartialResult>): Promise<void> {
    const fileCount = event.change_range?.file_count || 1
    const commitCount = event.change_range?.commit_count || 1

    // Post initial thinking message
    const initialMsg = await this.slackClient.chat.postMessage({
      channel: event.config?.formats.includes('slack') ? 'slack-channel' : 'devdiff',
      text: `🔍 Analyzing ${commitCount} commits across ${fileCount} files...`,
      metadata: { event_type: 'devdiff_analysis_started' },
    })

    const threadTs = initialMsg.ts
    let progress = 0
    const stages = ['Parsing diffs', 'AST analysis', 'AI processing', 'Generating outputs']

    for await (const result of generator) {
      progress = result.progress || progress
      const stage = stages[result.stage] || 'Processing'

      if (progress % 20 === 0 || result.stage !== this.lastStage) {
        await this.slackClient.chat.update({
          channel: 'slack-channel',
          ts: threadTs,
          text: [
            `🔍 Analyzing changes... (${progress}%)`,
            `📊 Stage: ${stage}`,
            `📝 Files processed: ${result.filesProcessed || 0}/${fileCount}`,
            `⏱️ Elapsed: ${this.formatDuration(result.elapsedMs)}`,
          ].join('\n'),
        })
        this.lastStage = result.stage
      }
    }

    // Final result post
    await this.slackClient.chat.update({
      channel: 'slack-channel',
      ts: threadTs,
      text: `✅ DevDiff Code Intelligence Complete:\n\n*Summary:*\n${stages[3]} finished successfully.`,
    })
  }

  private formatDuration(ms: number): string {
    return `${(ms / 1000).toFixed(1)}s`
  }
}
