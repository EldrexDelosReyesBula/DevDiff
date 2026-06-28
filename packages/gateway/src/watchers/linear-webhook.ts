export class LinearWebhookParser {
  static parse(headers: Record<string, string>, body: any): { event: string; payload: any } | null {
    const action = body.action
    const type = body.type

    if (type === 'Issue' && ['create', 'update'].includes(action)) {
      return {
        event: 'linear_issue',
        payload: {
          id: body.data?.id,
          source: 'webhook',
          issueKey: `${body.data?.team?.key}-${body.data?.number}`,
          title: body.data?.title,
          description: body.data?.description,
          status: body.data?.state?.name,
        },
      }
    }

    return null
  }
}
