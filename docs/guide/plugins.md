# Plugin System

DevDiff features an open architecture, allowing you to inject custom behaviors into the analysis pipeline (`PipelineStep`) or route completed explanations to custom communication layers (`CustomOutputPlugin`).

---

## 1. Custom Processor Steps (`PipelineStep`)

Custom processor plugins manipulate the context (diff text, metadata, parsed AST) before it is passed to the AI Router or after it is formatted.

### Creating a Custom Regex Filter

Implement the `PipelineStep` interface:

```typescript
import { PipelineStep, ProcessorContext } from '@eldrex/gateway'

export class CustomRegexFilterStep implements PipelineStep {
  name = 'custom_regex_filter'

  async run(context: ProcessorContext, config: any): Promise<void> {
    if (!context.diffText) return

    // Custom pipeline check: remove log statement diffs to clean inputs
    context.diffText = context.diffText
      .split('\n')
      .filter(line => !line.includes('console.log'))
      .join('\n')
  }
}
```

Register your custom step inside your [ProcessorPipeline](file:///c:/Users/Eldrex/Downloads/classhost/DevDiff/packages/gateway/src/processors/pipeline.ts) initialization:

```typescript
import { ProcessorPipeline } from '@eldrex/gateway'

const pipeline = new ProcessorPipeline()
pipeline.use(new CustomRegexFilterStep())
```

---

## 2. Custom Output Delivery (`CustomOutputPlugin`)

You can create output plugins to direct generated changelogs to platforms that are not natively supported (e.g., Notion, Jira, internal databases, or private endpoints).

### Creating a Notion Output Plugin

```typescript
import { CustomOutputPlugin, ProcessedChange } from '@eldrex/gateway'

export const NotionOutputPlugin: CustomOutputPlugin = {
  name: 'notion-delivery',
  
  async deliver(result: { formattedOutput: string; rawResponse?: any }): Promise<boolean> {
    try {
      console.log(`[Notion Plugin] Delivering output to workspace page...`)
      
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer secret_notion_api_token',
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: 'your_database_id' },
          properties: {
            Name: {
              title: [
                { text: { content: `AI Changelog - ${new Date().toLocaleDateString()}` } }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ text: { content: result.formattedOutput.substring(0, 2000) } }]
              }
            }
          ]
        })
      })

      return response.ok
    } catch (err) {
      console.error('Failed to deliver output to Notion:', err)
      return false
    }
  }
}
```
