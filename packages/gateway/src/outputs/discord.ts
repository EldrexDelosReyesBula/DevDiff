export interface DiscordConfig {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
}

export class DiscordOutputter {
  static async send(config: DiscordConfig, content: string): Promise<boolean> {
    if (!config.webhookUrl) {
      throw new Error("Discord webhookUrl is required.");
    }

    const payload = {
      username: config.username || "DevDiff",
      avatar_url: config.avatarUrl,
      content: content.substring(0, 2000), // Discord 2000 limit
    };

    try {
      console.log(`[Discord] Posting message to webhook: ${config.webhookUrl}`);
      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.ok;
    } catch (err) {
      console.error("Failed to send message to Discord:", err);
      return false;
    }
  }
}
