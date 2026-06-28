export interface TeamsConfig {
  webhookUrl: string;
  title?: string;
}

export class TeamsOutputter {
  static async send(config: TeamsConfig, content: string): Promise<boolean> {
    if (!config.webhookUrl) {
      throw new Error("Teams webhookUrl is required.");
    }

    const payload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            type: "AdaptiveCard",
            body: [
              {
                type: "TextBlock",
                size: "Medium",
                weight: "Bolder",
                text: config.title || "DevDiff Code Intelligence Update",
              },
              {
                type: "TextBlock",
                text: content,
                wrap: true,
              },
            ],
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            version: "1.2",
          },
        },
      ],
    };

    try {
      console.log(`[Teams] Posting message to webhook: ${config.webhookUrl}`);
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (err) {
      console.error("Failed to send message to MS Teams:", err);
      return false;
    }
  }
}
