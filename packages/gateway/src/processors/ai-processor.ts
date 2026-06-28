import { PipelineStep, ProcessorContext } from './pipeline'
import { AIRouter, loadConfig } from '@eldrex/core'

export class AIProcessor implements PipelineStep {
  name = 'ai_analyzer'

  async run(context: ProcessorContext, config: any): Promise<void> {
    const coreConfig = await loadConfig(context.repoPath)
    
    // Merge inline processor config overrides
    if (config.ai) {
      coreConfig.ai = { ...coreConfig.ai, ...config.ai }
    }

    const router = new AIRouter(coreConfig)
    const diffContext = context.astContext || context.diffText || ''

    if (!diffContext.trim()) {
      context.aiRawResponse = {
        summary: 'No changes detected to analyze.',
        impact: 'none',
        breaking: false,
        files: [],
        relatedIssues: [],
      }
      return
    }

    // Call core AIRouter to get the AI explanation
    const result = await router.getExplanation(diffContext, {
      dryRun: config.dryRun || context.dryRun,
    })

    context.aiRawResponse = result
  }
}
