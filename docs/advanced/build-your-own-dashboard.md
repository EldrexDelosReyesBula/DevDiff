# Building Your Own Dashboard with DevDiff SDK

DevDiff v1.6.0 adopts an **IDE-Native Architecture**. Instead of forcing developers into a generic web dashboard browser tab, DevDiff exposes a powerful, local-first engine and SDK (`@eldrex/core` and `@eldrex/sdk`) so you can build custom web dashboards, internal admin tools, or Slack bots tailored to your team's workflow.

---

## 🏗️ Architecture: Engine + SDK

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVDIFF ENGINE                           │
│  • Local persistent codebase index                           │
│  • Change tracking & AST entity diffing                    │
│  • Fast sub-50ms index queries                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                        DevDiff Gateway / SDK
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  React/Vite  │       │  Slack Bot   │       │ Custom Web   │
│  Dashboard   │       │ Standup Bot  │       │  Admin UI    │
└──────────────┘       └──────────────┘       └──────────────┘
```

---

## 🚀 Quick Example: React / Next.js Dashboard Component

```typescript
import React, { useEffect, useState } from 'react';
import { DevDiffEngine } from '@eldrex/core';

export function TeamChangelogDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const engine = new DevDiffEngine({ workspacePath: process.cwd() });
      const statsData = await engine.getStatus();
      setStats(statsData);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div>Loading DevDiff index stats...</div>;

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui' }}>
      <h1>📊 DevDiff Workspace Intelligence</h1>
      <p>Indexed Files: <strong>{stats.files || '649'}</strong></p>
      <p>Active Provider: <strong>{stats.provider || 'Local Ollama / IDE Agent'}</strong></p>
    </div>
  );
}
```

---

## 💬 Slack Standup Integration Example

```typescript
import { DevDiffEngine } from "@eldrex/core";
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_TOKEN);
const engine = new DevDiffEngine({ workspacePath: process.cwd() });

export async function sendDailyStandup() {
  const changelog = await engine.analyze({ since: "24h", persona: "pm" });
  await slack.chat.postMessage({
    channel: "#engineering-standup",
    text: `🚀 *Daily Codebase Update*\n\n${changelog.summary || changelog}`,
  });
}
```
