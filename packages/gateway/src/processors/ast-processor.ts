import * as fs from 'fs/promises'
import * as path from 'path'
import { PipelineStep, ProcessorContext } from './pipeline'
import { diffParser, trimAST, redactSecrets } from '@eldrex/core'

export class ASTProcessor implements PipelineStep {
  name = 'ast_processor'

  async run(context: ProcessorContext, config: any): Promise<void> {
    if (!context.diffText) {
      context.astContext = ''
      return
    }

    const parserResult = diffParser.parse(context.diffText)
    const processedFiles: string[] = []

    for (const fileDiff of parserResult.files) {
      if (fileDiff.isDeleted) {
        processedFiles.push(`File Deleted: ${fileDiff.oldPath}`)
        continue
      }

      if (fileDiff.isNew) {
        processedFiles.push(`File Created: ${fileDiff.newPath}`)
      }

      let fileContent = ''
      if (fileDiff.newPath) {
        const fullPath = path.resolve(context.repoPath, fileDiff.newPath)
        try {
          fileContent = await fs.readFile(fullPath, 'utf-8')
        } catch {
          // Fallback if we cannot read file content
        }
      }

      const changedLines: number[] = []
      for (const hunk of fileDiff.hunks) {
        for (const line of hunk.lines) {
          if (line.type === 'addition' && line.ln2) {
            changedLines.push(line.ln2)
          } else if (line.type === 'deletion' && line.ln1) {
            changedLines.push(line.ln1)
          }
        }
      }

      let contextCode = ''
      if (fileContent && fileDiff.newPath) {
        contextCode = trimAST(fileDiff.newPath, fileContent, changedLines)
      } else {
        contextCode = fileDiff.hunks
          .map(h => h.lines.map(l => l.content).join('\n'))
          .join('\n')
      }

      const redactedCode = redactSecrets(contextCode)
      processedFiles.push(`--- File: ${fileDiff.newPath || fileDiff.oldPath} ---\n${redactedCode}`)
    }

    context.astContext = processedFiles.join('\n\n')
  }
}
