import { describe, it, expect } from 'vitest'
import { MermaidSanitizer } from '../src/outputs/mermaid/sanitizer'

describe('MermaidSanitizer', () => {
  describe('toNodeId()', () => {
    it('converts hyphenated names', () => {
      expect(MermaidSanitizer.toNodeId('my-module-name')).toBe('my_module_name')
    })

    it('converts paths to valid IDs', () => {
      expect(MermaidSanitizer.toNodeId('src/components/Button.tsx'))
        .toBe('src_components_Button_tsx')
    })

    it('handles special characters', () => {
      expect(MermaidSanitizer.toNodeId('user@domain.com'))
        .toBe('user_domain_com')
    })

    it('handles reserved words', () => {
      expect(MermaidSanitizer.toNodeId('graph')).toBe('_graph')
      expect(MermaidSanitizer.toNodeId('end')).toBe('_end')
    })

    it('handles numeric start', () => {
      expect(MermaidSanitizer.toNodeId('123abc')).toBe('n_123abc')
    })

    it('truncates long names', () => {
      const longName = 'a'.repeat(100)
      const result = MermaidSanitizer.toNodeId(longName)
      expect(result.length).toBeLessThanOrEqual(56) // 50 + underscore + 5 hash
    })

    it('handles empty string', () => {
      const result = MermaidSanitizer.toNodeId('')
      expect(result).toMatch(/^node_/)
    })

    it('handles unicode', () => {
      expect(MermaidSanitizer.toNodeId('café-component')).toMatch(/^[a-zA-Z0-9_]+$/)
    })
  })

  describe('toLabel()', () => {
    it('escapes double quotes', () => {
      expect(MermaidSanitizer.toLabel('say "hello"')).toBe('"say \\"hello\\""')
    })

    it('truncates long labels', () => {
      const longLabel = 'b'.repeat(100)
      const result = MermaidSanitizer.toLabel(longLabel, 60)
      expect(result.length).toBeLessThanOrEqual(65) // quotes + ellipsis
    })

    it('handles newlines', () => {
      expect(MermaidSanitizer.toLabel('line1\nline2')).toBe('"line1 line2"')
    })
  })

  describe('edge()', () => {
    it('creates safe edge', () => {
      const edge = MermaidSanitizer.edge('my-module', 'other-module', 'arrow')
      expect(edge).toBe('my_module --> other_module')
    })

    it('handles edge labels', () => {
      const edge = MermaidSanitizer.edge('a', 'b', 'arrow', 'calls')
      expect(edge).toContain('|"calls"|')
    })
  })

  describe('validate()', () => {
    it('passes valid diagram', () => {
      const diagram = 'graph TD\n    A[Hello] --> B[World]'
      const result = MermaidSanitizer.validate(diagram)
      expect(result.valid).toBe(true)
    })

    it('catches bracket mismatch', () => {
      const diagram = 'graph TD\n    A[Hello --> B[World'
      const result = MermaidSanitizer.validate(diagram)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Bracket'))).toBe(true)
    })

    it('catches unclosed quotes', () => {
      const diagram = 'graph TD\n    A["Hello] --> B'
      const result = MermaidSanitizer.validate(diagram)
      expect(result.valid).toBe(false)
    })
  })
})
