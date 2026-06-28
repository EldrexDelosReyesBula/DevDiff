import { MermaidSanitizer } from './mermaid/sanitizer'

export interface ProcessedChange {
  summary: string
  impact: string
  affectedModule: string
  type: 'feature' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore' | 'breaking' | 'security'
}

export interface DependencyChange {
  package: string
  version: string
  dependents: string[]
}

export interface Commit {
  shortHash: string
  branch?: string
  tags?: string[]
}

export interface ChangeStats {
  files: {
    name: string
    frequency: number
    complexity: number
  }[]
}

export interface DataFlow {
  steps: {
    from: string
    to: string
    description: string
    response?: string
  }[]
}

export class MermaidGenerator {
  
  private wrapAndValidate(diagramBody: string): string {
    const fullDiagram = `\`\`\`mermaid\n${diagramBody}\n\`\`\``
    const validation = MermaidSanitizer.validate(diagramBody)
    if (!validation.valid) {
      console.warn('Mermaid validation failed:', validation.errors)
      return `<!-- Mermaid validation errors: ${validation.errors.join('; ')} -->\n${fullDiagram}`
    }
    return fullDiagram
  }

  generateFlowchart(changes: ProcessedChange[]): string {
    const lines: string[] = ['graph TD']
    
    changes.forEach((c, i) => {
      const parentNode = `C${i}`
      const targetNode = MermaidSanitizer.toNodeId(c.affectedModule)
      
      lines.push(`    ${parentNode}[${MermaidSanitizer.toLabel(c.summary)}]`)
      lines.push(`    ${targetNode}[${MermaidSanitizer.toLabel(c.affectedModule)}]`)
      lines.push(`    ${parentNode} --> |${MermaidSanitizer.toLabel(c.impact)}| ${targetNode}`)
      lines.push(`    style ${parentNode} fill:${this.getColor(c.type)}`)
    })

    return this.wrapAndValidate(lines.join('\n'))
  }

  generateArchitectureDiff(before: any, after: any): string {
    const lines: string[] = ['graph LR']
    
    lines.push('    subgraph Before')
    if (before && typeof before === 'object') {
      Object.keys(before).forEach((k, i) => {
        lines.push(`        ${MermaidSanitizer.node(`B_${k}`, k)}`)
      })
    } else {
      lines.push(`        B_empty[${MermaidSanitizer.toLabel('Empty')}]`)
    }
    lines.push('    end')

    lines.push('    subgraph After')
    if (after && typeof after === 'object') {
      Object.keys(after).forEach((k, i) => {
        lines.push(`        ${MermaidSanitizer.node(`A_${k}`, k)}`)
      })
    } else {
      lines.push(`        A_empty[${MermaidSanitizer.toLabel('Empty')}]`)
    }
    lines.push('    end')

    // Linkages
    if (before && after) {
      const beforeKeys = Object.keys(before)
      const afterKeys = Object.keys(after)
      if (beforeKeys.length > 0 && afterKeys.length > 0) {
        lines.push(`    ${MermaidSanitizer.toNodeId(`B_${beforeKeys[0]}`)} -.-> |"refactored to"| ${MermaidSanitizer.toNodeId(`A_${afterKeys[0]}`)}`)
      }
    }

    return this.wrapAndValidate(lines.join('\n'))
  }

  generateDependencyGraph(deps: DependencyChange[]): string {
    const lines: string[] = ['graph TD']
    
    deps.forEach(d => {
      const packageNode = MermaidSanitizer.toNodeId(d.package)
      const packageLabel = `${d.package}@${d.version}`
      lines.push(`    ${packageNode}[${MermaidSanitizer.toLabel(packageLabel)}]`)
      
      d.dependents.forEach(dep => {
        const depNode = MermaidSanitizer.toNodeId(dep)
        lines.push(`    ${depNode} --> ${packageNode}`)
      })
    })

    return this.wrapAndValidate(lines.join('\n'))
  }

  generateTimeline(commits: Commit[]): string {
    const lines: string[] = ['gitGraph']
    
    commits.forEach(c => {
      // Mermaid gitGraph has simple rules: commit id: "..."
      // No special chars for gitGraph syntax, but standard wrapping.
      const safeHash = c.shortHash.replace(/[^a-zA-Z0-9]/g, '')
      lines.push(`    commit id: "${safeHash}"`)
    })

    return this.wrapAndValidate(lines.join('\n'))
  }

  generateHeatmap(changes: ChangeStats): string {
    const lines: string[] = [
      'quadrantChart',
      '    title File Change Frequency vs Complexity',
      '    x-axis Low Frequency --> High Frequency',
      '    y-axis Low Complexity --> High Complexity'
    ]

    changes.files.forEach(f => {
      const safeName = f.name.replace(/:/g, '_')
      lines.push(`    ${MermaidSanitizer.toLabel(safeName)}: [${f.frequency}, ${f.complexity}]`)
    })

    return this.wrapAndValidate(lines.join('\n'))
  }

  generateSequenceDiagram(flow: DataFlow): string {
    const lines: string[] = ['sequenceDiagram']
    
    flow.steps.forEach(s => {
      const fromActor = MermaidSanitizer.toNodeId(s.from)
      const toActor = MermaidSanitizer.toNodeId(s.to)
      
      lines.push(`    ${fromActor}->>${toActor}: ${s.description}`)
      if (s.response) {
        lines.push(`    ${toActor}-->>${fromActor}: ${s.response}`)
      }
    })

    return this.wrapAndValidate(lines.join('\n'))
  }

  private getColor(type: string): string {
    const colors: Record<string, string> = {
      feature: '#22c55e',
      fix: '#ef4444',
      refactor: '#6366f1',
      docs: '#f59e0b',
      test: '#06b6d4',
      chore: '#6b7280',
      breaking: '#dc2626',
      security: '#7c3aed',
    }
    return colors[type] || '#6b7280'
  }
}
