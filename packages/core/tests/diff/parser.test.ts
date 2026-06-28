import { describe, it, expect } from 'vitest'
import { diffParser } from '../../src/diff/parser'

describe('diffParser', () => {
  it('parses a simple diff', () => {
    const diff = `diff --git a/file.ts b/file.ts
index 0000000..1111111 100644
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,4 @@
 const x = 1
+const y = 2
 const z = 3`
    
    const result = diffParser.parse(diff)
    
    expect(result.changes).toHaveLength(1)
    expect(result.changes[0].type).toBe('addition')
    expect(result.changes[0].line).toBe(2)
    expect(result.changes[0].content).toBe('const y = 2')
    
    expect(result.files).toHaveLength(1)
    expect(result.files[0].newPath).toBe('file.ts')
    expect(result.files[0].hunks).toHaveLength(1)
    expect(result.files[0].hunks[0].lines).toHaveLength(3)
  })
})
