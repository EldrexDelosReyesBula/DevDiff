export interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
}

export class WebhookOutputter {
  static async send(config: WebhookConfig, data: any): Promise<boolean> {
    if (!config.url) {
      throw new Error("Webhook URL is required.");
    }

    try {
      console.log(`[Webhook] Outgoing POST to: ${config.url}`);
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.headers || {}),
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (err) {
      console.error("Failed to send webhook:", err);
      return false;
    }
  }
}
