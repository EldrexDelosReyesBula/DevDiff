import { z } from 'zod'

export class GitHubWebhookParser {
  static parse(headers: Record<string, string>, body: any): { event: string; payload: any } | null {
    const eventType = headers['x-github-event']
    if (!eventType) return null

    if (eventType === 'push') {
      const ref = body.ref || ''
      const branch = ref.replace('refs/heads/', '')
      return {
        event: 'git_push',
        payload: {
          id: body.after,
          source: 'webhook',
          repository: {
            url: body.repository?.html_url,
            path: body.repository?.name || '',
            branch,
          },
          change_range: {
            from: body.before,
            to: body.after,
            commit_count: body.commits?.length || 0,
          },
        },
      }
    }

    if (eventType === 'pull_request') {
      const action = body.action
      if (['opened', 'synchronize', 'reopened'].includes(action)) {
        return {
          event: 'pull_request',
          payload: {
            id: body.pull_request?.head?.sha,
            source: 'webhook',
            repository: {
              url: body.repository?.html_url,
              path: body.repository?.name || '',
              branch: body.pull_request?.base?.ref || 'main',
            },
            change_range: {
              from: body.pull_request?.base?.sha,
              to: body.pull_request?.head?.sha,
            },
          },
        }
      }
    }

    return null
  }
}
