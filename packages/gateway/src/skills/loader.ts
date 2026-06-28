import * as fs from 'fs/promises'
import yaml from 'js-yaml'

export interface SkillDefinition {
  name: string
  version: string
  description: string
  author: string
  triggers: ('git_push' | 'pull_request' | 'scheduled' | 'manual' | 'webhook')[]
  inputs: Record<
    string,
    {
      type: string
      description: string
      required?: boolean
      default?: any
      enum?: string[]
    }
  >
  pipeline: { step: string; config?: any }[]
  outputs: { type: string; destination: string; config?: any }[]
  bodyMarkdown: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimated_tokens_per_run?: number
  tags?: string[]
}

export class SkillLoader {
  /**
   * Parses a SKILL.md file and returns the structured SkillDefinition.
   */
  static parseSkillMarkdown(content: string): SkillDefinition {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
    if (!match) {
      throw new Error('Invalid SKILL.md structure: Frontmatter separators (---) missing.')
    }

    const frontmatterRaw = match[1]
    const bodyMarkdown = match[2]

    const parsed = yaml.load(frontmatterRaw) as any
    if (!parsed.name || !parsed.version) {
      throw new Error("SKILL.md frontmatter must contain 'name' and 'version'.")
    }

    return {
      name: parsed.name,
      version: parsed.version,
      description: parsed.description || '',
      author: parsed.author || '',
      triggers: parsed.triggers || [],
      inputs: parsed.inputs || {},
      pipeline: parsed.pipeline || [],
      outputs: parsed.outputs || [],
      bodyMarkdown,
      difficulty: parsed.difficulty,
      estimated_tokens_per_run: parsed.estimated_tokens_per_run,
      tags: parsed.tags,
    }
  }

  static async loadFromFile(filePath: string): Promise<SkillDefinition> {
    const content = await fs.readFile(filePath, 'utf-8')
    return this.parseSkillMarkdown(content)
  }
}
