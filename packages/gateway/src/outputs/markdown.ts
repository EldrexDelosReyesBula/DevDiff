import * as fs from 'fs/promises'
import * as path from 'path'

export class MarkdownOutputter {
  static async write(filePath: string, content: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
  }
}
