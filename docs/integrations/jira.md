# Jira Issue Integration

Extract Jira issue tickets (`PROJ-123`) from git diffs and link them directly to DevDiff changelog metadata using `@eldrex/plugin-sdk` or incoming webhooks.

---

## Setup via Plugin SDK

DevDiff includes a production-ready Jira Issue Auto-Linker Plugin in [`examples/plugins/jira-linker/index.ts`](https://github.com/EldrexDelosReyesBula/DevDiff/tree/main/examples/plugins/jira-linker/index.ts):

```json
{
  "plugins": ["./examples/plugins/jira-linker"]
}
```

The plugin intercepts diff payloads in `beforeAnalysis` and automatically maps Jira issue numbers to changelog entries.
