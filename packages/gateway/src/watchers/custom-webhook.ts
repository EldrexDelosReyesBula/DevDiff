export class CustomWebhookParser {
  static parse(headers: Record<string, string>, body: any): { event: string; payload: any } | null {
    // Custom webhooks can pass direct DevDiffEvents in body
    if (body && body.source && body.repository) {
      return {
        event: body.event || 'custom_event',
        payload: body,
      }
    }
    return {
      event: 'custom_event',
      payload: {
        id: body?.id || String(Date.now()),
        source: 'custom-webhook',
        rawBody: body,
        headers,
      },
    }
  }
}
