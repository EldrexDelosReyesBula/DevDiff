import { PipelineStep, ProcessorContext } from './pipeline'
import { PersonaRegistry, PersonaEngine } from '@eldrex/personas'

export class PersonaProcessor implements PipelineStep {
  name = 'persona_processor'

  async run(context: ProcessorContext, config: any): Promise<void> {
    const personaId = config.persona || context.personaId || 'developer'
    const persona = PersonaRegistry.get(personaId)

    if (!persona) {
      // Default to no-op if persona is not registered
      context.aiFormattedResponse = context.aiRawResponse
      return
    }

    const rawResponse = context.aiRawResponse
    if (!rawResponse) {
      return
    }

    // Apply persona transformations
    const transformedSummary = PersonaEngine.postProcess(rawResponse.summary, persona)
    
    const transformedFiles = (rawResponse.files || []).map((file: any) => ({
      path: file.path,
      explanation: PersonaEngine.postProcess(file.explanation, persona),
    }))

    context.aiFormattedResponse = {
      ...rawResponse,
      summary: transformedSummary,
      files: transformedFiles,
    }
  }
}
