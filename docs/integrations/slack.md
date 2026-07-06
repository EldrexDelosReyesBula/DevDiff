# Slack & Messaging Channel Integrations

DevDiff can deliver progressive notifications and finalized changelogs straight to your team's communication platforms. Setup requires declaring the platform targets inside `gateway.config.json` under your `formats` and connector config parameters.

---

## 💬 Slack

Deliver changelog summaries and block alerts directly into your Slack workspace.

### Configuration

```json
{
  "formats": ["slack"],
  "slack": {
    "webhookUrl": "https://hooks.slack.com/services/...",
    "channel": "#changelogs",
    "botToken": "xoxb-your-bot-token",
    "signingSecret": "your-signing-secret"
  }
}
```

- **webhookUrl** (Required): Incoming webhook URL generated in your Slack App setup.
- **channel** (Optional): Target channel name overrides.

---

## 🎮 Discord

Send message updates or visually structured rich embeds to Discord servers.

### Configuration

```json
{
  "formats": ["discord"],
  "discord": {
    "webhookUrl": "https://discord.com/api/webhooks/...",
    "botToken": "your-discord-bot-token",
    "channelId": "1234567890"
  }
}
```

- **webhookUrl** (Required): Webhook URL generated under Server Settings → Integrations → Webhooks.

---

## ✈️ Telegram

Broadcast changelogs or push files using Telegram's bot API.

### Configuration

```json
{
  "formats": ["telegram"],
  "telegram": {
    "botToken": "123456:ABC-DEF1234ghIkl-zyx",
    "chatId": "-100123456789",
    "parseMode": "HTML"
  }
}
```

- **botToken** (Required): Bot access token obtained from `@BotFather`.
- **chatId** (Required): Target chat, group, or channel ID.

---

## 🏢 Microsoft Teams

Push notifications to Teams channels utilizing Microsoft's Adaptive Card layouts.

### Configuration

```json
{
  "formats": ["teams"],
  "teams": {
    "webhookUrl": "https://your-tenant.webhook.office.com/webhookb2/..."
  }
}
```

- **webhookUrl** (Required): Incoming webhook URL generated in your Teams Channel connectors configuration.

---

## 📱 WhatsApp

Route notifications through Twilio or Meta WhatsApp Developer APIs.

### Configuration

```json
{
  "formats": ["whatsapp"],
  "whatsapp": {
    "provider": "twilio",
    "accountSid": "ACxxxxxx",
    "authToken": "auth_token_here",
    "fromNumber": "whatsapp:+14155238886",
    "toNumbers": ["whatsapp:+1234567890"]
  }
}
```

- **provider** (Required): Twilio or Meta provider type selection.

---

## 📧 Email (SMTP)

Send styled HTML or plain text changelogs directly to a distribution list.

### Configuration

```json
{
  "formats": ["email"],
  "email": {
    "smtpHost": "smtp.mailgun.org",
    "smtpPort": 587,
    "smtpUser": "postmaster@yourdomain.com",
    "smtpPass": "smtp_password",
    "fromAddress": "devdiff@yourdomain.com",
    "toAddresses": ["team@yourdomain.com"]
  }
}
```

---

## 🔗 Custom Webhook

Relay raw JSON payloads to any HTTP endpoint of your choice.

### Configuration

```json
{
  "formats": ["custom_webhook"],
  "custom_webhook": {
    "url": "https://api.yourcompany.com/v1/webhooks/changelog",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer token_here"
    },
    "bodyTemplate": "{\"text\": \"{{changelog}}\"}"
  }
}
```

---

## 🛠️ Protocol & Message Bus Channels (System Only)

- **openclaw_bus:** Internal message bus for inter-agent communication, task delegation, and consensus collection.
- **mcp_channel:** Protocol channel handling tool execution requests, resource streaming, and context relaying.
