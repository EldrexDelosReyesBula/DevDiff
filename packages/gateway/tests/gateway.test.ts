import { describe, it, expect } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'
import {
  GatewayRouter,
  TokenBucketLimiter,
  CustomWebhookParser,
  MermaidGenerator,
  MermaidSanitizer,
  TieredQueueEngine,
  DevDiffEvent,
} from '../src'

describe('DevDiff Gateway Components', () => {
  it('GatewayRouter extracts path parameters correctly', async () => {
    const router = new GatewayRouter()
    let calledParams: any = null

    router.addRoute('POST', '/webhooks/custom/:name', async (req, res, params) => {
      calledParams = params
    })

    const req = { method: 'POST', url: '/webhooks/custom/my-test-pipeline', headers: {} } as IncomingMessage
    const res = {} as ServerResponse

    const matched = await router.handle(req, res)
    expect(matched).toBe(true)
    expect(calledParams).toEqual({ name: 'my-test-pipeline' })
  })

  it('TokenBucketLimiter enforces limits', () => {
    const limiter = new TokenBucketLimiter(2, 60)
    const req = { socket: { remoteAddress: '127.0.0.1' }, headers: {} } as IncomingMessage
    const headersWritten: Record<string, string | number> = {}
    const res = {
      setHeader(name: string, value: string | number) {
        headersWritten[name] = value
      },
      statusCode: 200,
      end() {},
    } as unknown as ServerResponse

    expect(limiter.handle(req, res)).toBe(true)
    expect(limiter.handle(req, res)).toBe(true)
    expect(limiter.handle(req, res)).toBe(false)
    expect(res.statusCode).toBe(429)
  })

  it('CustomWebhookParser falls back to raw body if not matching schema', () => {
    const parsed = CustomWebhookParser.parse({}, { foo: 'bar' })
    expect(parsed?.event).toBe('custom_event')
    expect(parsed?.payload.rawBody).toEqual({ foo: 'bar' })
  })

  describe('MermaidSanitizer & Generator', () => {
    it('sanitizes node IDs correctly according to strict safety rules', () => {
      expect(MermaidSanitizer.toNodeId('my-module')).toBe('my_module')
      expect(MermaidSanitizer.toNodeId('123module')).toBe('n_123module') // Starts with letter
      expect(MermaidSanitizer.toNodeId('subgraph')).toBe('_subgraph') // Reserved word
      expect(MermaidSanitizer.toNodeId('@eldrex/core')).toBe('eldrex_core')
    })

    it('escapes and truncates labels safely', () => {
      expect(MermaidSanitizer.toLabel('Hello "world"')).toBe('"Hello \\"world\\""')
    })

    it('validates syntax successfully', () => {
      const valid = 'graph TD\n    A[Label] --> B[Label]'
      expect(MermaidSanitizer.validate(valid).valid).toBe(true)

      const invalidBrackets = 'graph TD\n    A[Label'
      expect(MermaidSanitizer.validate(invalidBrackets).valid).toBe(false)
    })
  })

  describe('Queue Engine', () => {
    it('batches consecutive push events on the same repository within the batch window', async () => {
      const engine = new TieredQueueEngine({
        strategy: 'per-repo-sequential',
        maxConcurrent: 2,
        maxConcurrentPerRepo: 1,
        stallTimeout: 5000,
        backpressureThreshold: 10,
      })

      // Acquire both permits to block processing and keep the batch in the queue
      const slot1 = await engine['semaphore'].acquire()
      const slot2 = await engine['semaphore'].acquire()

      const event1: DevDiffEvent = {
        id: '1',
        timestamp: new Date().toISOString(),
        source: 'git',
        repository: { path: '/home/project/app', branch: 'main' },
        config: { persona: 'developer', formats: ['markdown'], batchWindow: 20000 },
      }

      const event2: DevDiffEvent = {
        id: '2',
        timestamp: new Date().toISOString(),
        source: 'git',
        repository: { path: '/home/project/app', branch: 'main' },
        config: { persona: 'developer', formats: ['markdown'], batchWindow: 20000 },
      }

      const batchId1 = await engine.enqueue(event1)
      const batchId2 = await engine.enqueue(event2)

      // Both events should merge into the same batch due to matching repository and window
      expect(batchId1).toBe(batchId2)

      // Release permits so queue engine can terminate cleanly
      slot1.release()
      slot2.release()
    })
  })
})
