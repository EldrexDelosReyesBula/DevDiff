export interface SlackConfig {
  webhookUrl: string
  channel?: string
  username?: string
  icon_emoji?: string
}

export class SlackOutputter {
  static async send(config: SlackConfig, content: string): Promise<boolean> {
    if (!config.webhookUrl) {
      throw new Error('Slack webhookUrl is required.')
    }

    const payload = {
      channel: config.channel,
      username: config.username || 'DevDiff Bot',
      icon_emoji: config.icon_emoji || '🔌',
      text: content,
    }

    try {
      // Mock or actual fetch
      console.log(`[Slack] Posting message to webhook: ${config.webhookUrl}`)
      
      // We can use native fetch since we are in Node 20+
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      return response.ok
    } catch (err) {
      console.error('Failed to send message to Slack:', err)
      return false
    }
  }
}
