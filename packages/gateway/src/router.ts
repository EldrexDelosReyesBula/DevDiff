import { IncomingMessage, ServerResponse } from 'http'

export type RouteHandler = (req: IncomingMessage, res: ServerResponse, params?: Record<string, string>) => Promise<void> | void

export interface Route {
  method: string
  pattern: RegExp
  paramNames: string[]
  handler: RouteHandler
}

export class GatewayRouter {
  private routes: Route[] = []

  addRoute(method: string, path: string, handler: RouteHandler) {
    // Convert path with params (e.g. /webhooks/custom/:name) to RegExp
    const paramNames: string[] = []
    const cleanPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name)
      return '([^/]+)'
    })
    
    const pattern = new RegExp(`^${cleanPath}$`)
    this.routes.push({
      method: method.toUpperCase(),
      pattern,
      paramNames,
      handler,
    })
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const pathname = url.pathname
    const method = (req.method || 'GET').toUpperCase()

    for (const route of this.routes) {
      if (route.method === method) {
        const match = pathname.match(route.pattern)
        if (match) {
          const params: Record<string, string> = {}
          route.paramNames.forEach((name, index) => {
            params[name] = decodeURIComponent(match[index + 1])
          });
          
          try {
            await route.handler(req, res, params)
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Internal Server Error: ${err.message}` }))
          }
          return true
        }
      }
    }

    return false
  }
}
