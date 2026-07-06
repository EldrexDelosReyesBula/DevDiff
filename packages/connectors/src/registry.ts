/**
 * Messaging Platform Registry
 * 
 * Every platform DevDiff can send notifications to.
 * All require developer-provided credentials.
 */

export const MESSAGING_CONNECTORS = {
  
  slack: {
    name: 'Slack',
    icon: '💬',
    setup: 'Create webhook: https://api.slack.com/messaging/webhooks',
    config: {
      webhookUrl: { type: 'string', secret: false, required: true },
      channel: { type: 'string', secret: false, required: false },
      botToken: { type: 'string', secret: true, required: false },
      signingSecret: { type: 'string', secret: true, required: false }
    },
    features: ['send_message', 'send_blocks', 'slash_commands', 'interactive_messages', 'thread_replies', 'streaming_updates'],
    maxMessageLength: 40000,
    rateLimit: '1/second'
  },
  
  discord: {
    name: 'Discord',
    icon: '🎮',
    setup: 'Create webhook: Server Settings → Integrations → Webhooks',
    config: {
      webhookUrl: { type: 'string', secret: false, required: true },
      botToken: { type: 'string', secret: true, required: false },
      channelId: { type: 'string', secret: false, required: false }
    },
    features: ['send_message', 'send_embeds', 'slash_commands', 'thread_replies'],
    maxMessageLength: 2000,
    maxEmbeds: 10,
    rateLimit: '5/second'
  },
  
  telegram: {
    name: 'Telegram',
    icon: '✈️',
    setup: 'Create bot: https://t.me/BotFather',
    config: {
      botToken: { type: 'string', secret: true, required: true },
      chatId: { type: 'string', secret: false, required: true },
      parseMode: { type: 'string', secret: false, required: false }
    },
    features: ['send_message', 'send_photo', 'send_document', 'inline_keyboard', 'edit_message'],
    maxMessageLength: 4096,
    rateLimit: '30/second'
  },
  
  teams: {
    name: 'Microsoft Teams',
    icon: '🏢',
    setup: 'Create incoming webhook: Teams Channel → Connectors → Incoming Webhook',
    config: {
      webhookUrl: { type: 'string', secret: false, required: true }
    },
    features: ['send_message', 'send_adaptive_card', 'send_hero_card'],
    maxMessageLength: 28000,
    rateLimit: '1/second'
  },
  
  whatsapp: {
    name: 'WhatsApp',
    icon: '📱',
    setup: 'Twilio: https://www.twilio.com/whatsapp OR Meta: https://developers.facebook.com/docs/whatsapp',
    config: {
      provider: { type: 'string', secret: false, required: true, options: ['twilio', 'meta'] },
      accountSid: { type: 'string', secret: true, required: true },
      authToken: { type: 'string', secret: true, required: true },
      fromNumber: { type: 'string', secret: false, required: true },
      toNumbers: { type: 'array', secret: false, required: true }
    },
    features: ['send_message', 'send_template', 'send_media'],
    maxMessageLength: 4096,
    rateLimit: 'varies by tier'
  },
  
  email: {
    name: 'Email',
    icon: '📧',
    setup: 'Configure SMTP settings',
    config: {
      smtpHost: { type: 'string', secret: false, required: true },
      smtpPort: { type: 'number', secret: false, required: true, default: 587 },
      smtpUser: { type: 'string', secret: false, required: true },
      smtpPass: { type: 'string', secret: true, required: true },
      fromAddress: { type: 'string', secret: false, required: true },
      toAddresses: { type: 'array', secret: false, required: true }
    },
    features: ['send_email', 'send_html_email', 'attachments', 'cc', 'bcc'],
    maxMessageLength: Infinity,
    rateLimit: 'varies by provider'
  },
  
  custom_webhook: {
    name: 'Custom Webhook',
    icon: '🔗',
    setup: 'Any HTTP endpoint that accepts POST requests',
    config: {
      url: { type: 'string', secret: false, required: true },
      method: { type: 'string', secret: false, default: 'POST' },
      headers: { type: 'object', secret: true, required: false },
      bodyTemplate: { type: 'string', secret: false, required: false }
    },
    features: ['send_http_request'],
    maxMessageLength: Infinity,
    rateLimit: 'unlimited (your server)'
  },
  
  // ── NEW: Agentic Channels ──
  
  openclaw_bus: {
    name: 'OpenClaw Message Bus',
    icon: '🦞',
    setup: 'Internal — no configuration needed',
    config: {},
    features: ['inter_agent_communication', 'task_assignment', 'result_reporting', 'supervisor_commands'],
    maxMessageLength: Infinity,
    rateLimit: 'unlimited'
  },
  
  mcp_channel: {
    name: 'MCP Protocol',
    icon: '🤖',
    setup: 'Internal — auto-configured',
    config: {},
    features: ['tool_calls', 'resource_access', 'prompt_execution', 'streaming_responses'],
    maxMessageLength: Infinity,
    rateLimit: 'unlimited'
  }
};
