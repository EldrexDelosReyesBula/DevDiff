export interface ProcessorContext {
  repoPath: string
  diffText?: string
  rawDiff?: any
  astContext?: string
  aiRawResponse?: any
  aiFormattedResponse?: any
  personaId?: string
  outputs?: Record<string, any>
  [key: string]: any
}

export interface PipelineStep {
  name: string
  run(context: ProcessorContext, config: any): Promise<void>
}

export class ProcessorPipeline {
  private steps: Map<string, PipelineStep> = new Map()

  registerStep(step: PipelineStep) {
    this.steps.set(step.name, step)
  }

  async run(context: ProcessorContext, pipelineConfig: { step: string; config?: any }[]): Promise<ProcessorContext> {
    for (const stepConfig of pipelineConfig) {
      const step = this.steps.get(stepConfig.step)
      if (!step) {
        throw new Error(`Pipeline references unregistered step: ${stepConfig.step}`)
      }
      await step.run(context, stepConfig.config || {})
    }
    return context
  }
}
