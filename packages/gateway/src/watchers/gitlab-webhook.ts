export class GitLabWebhookParser {
  static parse(headers: Record<string, string>, body: any): { event: string; payload: any } | null {
    const objectKind = body.object_kind
    if (!objectKind) return null

    if (objectKind === 'push') {
      const ref = body.ref || ''
      const branch = ref.replace('refs/heads/', '')
      return {
        event: 'git_push',
        payload: {
          id: body.after,
          source: 'webhook',
          repository: {
            url: body.project?.web_url,
            path: body.project?.name || '',
            branch,
          },
          change_range: {
            from: body.before,
            to: body.after,
            commit_count: body.total_commits_count || 0,
          },
        },
      }
    }

    if (objectKind === 'merge_request') {
      const action = body.object_attributes?.action
      if (['open', 'reopen', 'update'].includes(action)) {
        return {
          event: 'pull_request',
          payload: {
            id: body.object_attributes?.last_commit?.id,
            source: 'webhook',
            repository: {
              url: body.project?.web_url,
              path: body.project?.name || '',
              branch: body.object_attributes?.target_branch || 'main',
            },
            change_range: {
              from: body.object_attributes?.source_branch, // simplified source-target ref
              to: body.object_attributes?.last_commit?.id,
            },
          },
        }
      }
    }

    return null
  }
}
