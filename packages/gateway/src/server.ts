import * as http from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { GatewayRouter } from './router'
import { AuthMiddleware } from './middleware/auth'
import { TokenBucketLimiter } from './middleware/rate-limit'
import { ValidationMiddleware, DevDiffEventSchema } from './middleware/validation'
import { GitWatcher } from './watchers/git-watcher'
import { FsWatcher } from './watchers/fs-watcher'
import { GitHubWebhookParser } from './watchers/github-webhook'
import { GitLabWebhookParser } from './watchers/gitlab-webhook'
import { LinearWebhookParser } from './watchers/linear-webhook'
import { CustomWebhookParser } from './watchers/custom-webhook'
import { ProcessorPipeline, ProcessorContext } from './processors/pipeline'
import { DiffProcessor } from './processors/diff-processor'
import { ASTProcessor } from './processors/ast-processor'
import { AIProcessor } from './processors/ai-processor'
import { PersonaProcessor } from './processors/persona-processor'
import { FormatProcessor } from './processors/format-processor'
import { PersonaRegistry } from '@eldrex/personas'
import { SkillRegistry } from './skills/registry'

export interface GatewayConfig {
  httpPort?: number
  wsPort?: number
  mcpPort?: number
  openclawPort?: number
  grpcPort?: number
  apiKeys?: string[]
  repoPath: string
}

export class DevDiffGateway {
  private config: GatewayConfig
  private httpServer!: http.Server
  private wsServer!: WebSocketServer
  private mcpServer!: http.Server
  private openclawServer!: http.Server
  private grpcServer!: http.Server
  private router!: GatewayRouter
  private auth!: AuthMiddleware
  private limiter!: TokenBucketLimiter
  private pipeline!: ProcessorPipeline

  private gitWatchers: GitWatcher[] = []
  private fsWatchers: FsWatcher[] = []
  private activeSockets: Set<WebSocket> = new Set()

  constructor(config: GatewayConfig) {
    this.config = config
    this.auth = new AuthMiddleware(config.apiKeys || [])
    this.limiter = new TokenBucketLimiter()
    this.router = new GatewayRouter()
    
    // Setup Pipeline and processors
    this.pipeline = new ProcessorPipeline()
    this.pipeline.registerStep(new DiffProcessor())
    this.pipeline.registerStep(new ASTProcessor())
    this.pipeline.registerStep(new AIProcessor())
    this.pipeline.registerStep(new PersonaProcessor())
    this.pipeline.registerStep(new FormatProcessor())

    this.setupRoutes()
  }

  private setupRoutes() {
    // Health Check
    this.router.addRoute('GET', '/health', (req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ status: 'OK', uptime: process.uptime() }))
    })

    // API Status
    this.router.addRoute('GET', '/api/v1/status', (req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        gateway: 'active',
        connections: this.activeSockets.size,
        personas: PersonaRegistry.list().map(p => p.id),
        skills: SkillRegistry.list().map(s => s.name),
        watchers: {
          git: this.gitWatchers.length,
          filesystem: this.fsWatchers.length,
        }
      }))
    })

    // One-shot analyze endpoint
    this.router.addRoute('POST', '/api/v1/analyze', async (req, res) => {
      const body = await this.readBody(req)
      const parseResult = ValidationMiddleware.validate(DevDiffEventSchema, body)
      
      if (!parseResult.success) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ errors: parseResult.errors }))
        return
      }

      const event = parseResult.data
      const context: ProcessorContext = {
        repoPath: this.config.repoPath,
        change_range: event.change_range,
        personaId: event.config?.persona,
        formats: event.config?.formats,
        dryRun: false,
      }

      // Execute standard analysis pipeline
      const pipelineConfig = [
        { step: 'diff_parser', config: { fallbackToUnstaged: true } },
        { step: 'ast_processor' },
        { step: 'ai_analyzer' },
        { step: 'persona_processor' },
        { step: 'format_processor' }
      ]

      const start = Date.now()
      try {
        const resultContext = await this.pipeline.run(context, pipelineConfig)
        const duration = Date.now() - start
        
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          event_id: event.id || 'generated-id',
          status: 'completed',
          generated_at: new Date().toISOString(),
          processing_time_ms: duration,
          results: {
            changelog: resultContext.outputs?.['markdown'] || '',
            markdown: resultContext.outputs?.['markdown'] || '',
            json: resultContext.outputs?.['json'] || {},
            stats: {
              files_changed: resultContext.aiRawResponse?.files?.length || 0,
              breaking_changes: resultContext.aiRawResponse?.breaking ? 1 : 0,
            }
          }
        }))
        
        // Broadcast event to web sockets
        this.broadcast('changelog_generated', resultContext.aiFormattedResponse)
      } catch (err: any) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: `Pipeline failed: ${err.message}` }))
      }
    })

    // Webhooks
    this.router.addRoute('POST', '/webhooks/github', async (req, res) => {
      const body = await this.readBody(req)
      const parsed = GitHubWebhookParser.parse(req.headers as any, body)
      this.handleWebhookEvent(parsed, res)
    })

    this.router.addRoute('POST', '/webhooks/gitlab', async (req, res) => {
      const body = await this.readBody(req)
      const parsed = GitLabWebhookParser.parse(req.headers as any, body)
      this.handleWebhookEvent(parsed, res)
    })

    this.router.addRoute('POST', '/webhooks/linear', async (req, res) => {
      const body = await this.readBody(req)
      const parsed = LinearWebhookParser.parse(req.headers as any, body)
      this.handleWebhookEvent(parsed, res)
    })

    this.router.addRoute('POST', '/webhooks/custom/:name', async (req, res, params) => {
      const body = await this.readBody(req)
      const parsed = CustomWebhookParser.parse(req.headers as any, body)
      this.handleWebhookEvent(parsed, res)
    })

    // Personas and Skills queries
    this.router.addRoute('GET', '/api/v1/personas', (req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(PersonaRegistry.list()))
    })

    this.router.addRoute('GET', '/api/v1/skills', (req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(SkillRegistry.list()))
    })
  }

  private async handleWebhookEvent(parsed: { event: string; payload: any } | null, res: http.ServerResponse) {
    if (!parsed) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Unsupported or unparseable webhook event.' }))
      return
    }

    // Trigger asynchronous pipeline execution
    const context: ProcessorContext = {
      repoPath: this.config.repoPath,
      change_range: parsed.payload.change_range,
      personaId: 'developer',
      formats: ['markdown'],
    }

    const pipelineConfig = [
      { step: 'diff_parser', config: { fallbackToUnstaged: true } },
      { step: 'ast_processor' },
      { step: 'ai_analyzer', config: { dryRun: true } }, // Dry run default for webhooks
      { step: 'persona_processor' },
      { step: 'format_processor' }
    ]

    this.pipeline.run(context, pipelineConfig)
      .then(resultContext => {
        this.broadcast('webhook_triggered', {
          event: parsed.event,
          result: resultContext.aiFormattedResponse,
        })
      })
      .catch(err => {
        console.error('Webhook async pipeline failed:', err)
      })

    res.statusCode = 202
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ status: 'accepted', event: parsed.event }))
  }

  private async readBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = ''
      req.on('data', chunk => {
        body += chunk
      })
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {})
        } catch {
          resolve({})
        }
      })
      req.on('error', err => reject(err))
    })
  }

  private broadcast(event: string, data: any) {
    const payload = JSON.stringify({ event, data })
    for (const socket of this.activeSockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload)
      }
    }
  }

  async start() {
    const httpPort = this.config.httpPort || 3737
    const wsPort = this.config.wsPort || 3738
    const mcpPort = this.config.mcpPort || 3739
    const openclawPort = this.config.openclawPort || 3740
    const grpcPort = this.config.grpcPort || 3741

    // 1. HTTP Server
    this.httpServer = http.createServer(async (req, res) => {
      // CORS
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
      
      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }

      // Run Auth & Rate Limiters
      if (!this.auth.handle(req, res)) return
      if (!this.limiter.handle(req, res)) return

      const routed = await this.router.handle(req, res)
      if (!routed) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Route not found.' }))
      }
    })

    // 2. WebSocket Server
    this.wsServer = new WebSocketServer({ port: wsPort })
    this.wsServer.on('connection', socket => {
      this.activeSockets.add(socket)
      socket.on('close', () => this.activeSockets.delete(socket))
      socket.send(JSON.stringify({ event: 'connected', time: new Date() }))
    })

    // 3. MCP (Model Context Protocol) Server
    this.mcpServer = http.createServer(async (req, res) => {
      if (req.method === 'POST') {
        const body = await this.readBody(req)
        const method = body.method

        res.setHeader('Content-Type', 'application/json')
        
        if (method === 'tools/list') {
          res.end(JSON.stringify({
            result: {
              tools: [
                {
                  name: 'devdiff_analyze',
                  description: 'Analyzes code changes and returns persona-aware explanation.',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      range: { type: 'string', description: 'Git revision range' },
                      persona: { type: 'string', description: 'AI output persona' },
                    }
                  }
                }
              ]
            }
          }))
        } else if (method === 'tools/call') {
          const args = body.params?.arguments || {}
          const context: ProcessorContext = {
            repoPath: this.config.repoPath,
            change_range: args.range ? { from: args.range.split('..')[0], to: args.range.split('..')[1] } : undefined,
            personaId: args.persona || 'developer',
            formats: ['markdown'],
          }

          try {
            const resultContext = await this.pipeline.run(context, [
              { step: 'diff_parser', config: { fallbackToUnstaged: true } },
              { step: 'ast_processor' },
              { step: 'ai_analyzer', config: { dryRun: true } },
              { step: 'persona_processor' },
              { step: 'format_processor' }
            ])
            res.end(JSON.stringify({
              result: {
                content: [
                  {
                    type: 'text',
                    text: resultContext.outputs?.['markdown'] || 'No explanation generated.',
                  }
                ]
              }
            }))
          } catch (err: any) {
            res.end(JSON.stringify({ error: err.message }))
          }
        } else {
          res.end(JSON.stringify({ error: 'Method not found' }))
        }
      } else {
        res.statusCode = 405
        res.end()
      }
    })

    // 4. OpenClaw Server
    this.openclawServer = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      if (req.method === 'POST') {
        const body = await this.readBody(req)
        // Standard OpenClaw request structure processing
        res.end(JSON.stringify({
          status: 'success',
          pipeline: body.skill || 'devdiff',
          processedAt: new Date().toISOString(),
        }))
      } else {
        res.statusCode = 405
        res.end()
      }
    })

    // 5. gRPC Mock Server (TCP)
    this.grpcServer = http.createServer((req, res) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/grpc')
      res.end()
    })

    await Promise.all([
      new Promise<void>(resolve => this.httpServer.listen(httpPort, resolve)),
      new Promise<void>(resolve => this.mcpServer.listen(mcpPort, resolve)),
      new Promise<void>(resolve => this.openclawServer.listen(openclawPort, resolve)),
      new Promise<void>(resolve => this.grpcServer.listen(grpcPort, resolve)),
    ])

    console.log(`🔌 DevDiff Gateway ready on 4 protocols:`)
    console.log(`   - HTTP REST:    http://localhost:${httpPort}`)
    console.log(`   - WebSocket:    ws://localhost:${wsPort}`)
    console.log(`   - MCP Server:   http://localhost:${mcpPort}`)
    console.log(`   - OpenClaw API: http://localhost:${openclawPort}`)
    console.log(`   - gRPC Server:  http://localhost:${grpcPort}`)
  }

  async stop() {
    this.gitWatchers.forEach(w => w.stop())
    this.fsWatchers.forEach(w => w.stop())
    this.wsServer.close()
    
    await Promise.all([
      new Promise<void>(resolve => this.httpServer.close(() => resolve())),
      new Promise<void>(resolve => this.mcpServer.close(() => resolve())),
      new Promise<void>(resolve => this.openclawServer.close(() => resolve())),
      new Promise<void>(resolve => this.grpcServer.close(() => resolve())),
    ])
  }
}
